"""Bounded builder discovery, called while update_directory holds its lock.

Only public repository metadata, Git trees and SKILL.md frontmatter persist.
Search facets are provenance hints, never capability or license endorsements.
"""
from __future__ import annotations

import base64
import hashlib
import json
import math
from pathlib import Path
from urllib.parse import quote

import crawl
import crawl_skills


class BudgetReached(RuntimeError):
    pass


FACETS = ('audiences', 'subjects', 'platforms', 'scenarios', 'capabilities')


def rotated(rows, cursor, count):
    if not rows:
        return []
    return [rows[(cursor + n) % len(rows)] for n in range(min(count, len(rows)))]


def merge_hints(previous, hint):
    result = {k: sorted(set((previous or {}).get(k, []) + hint.get(k, []))) for k in FACETS}
    result['evidence_level'] = 'discovery-query-or-curated-source'
    return result


def collect(root: Path, client, *, query_count=8, manifest_limit=24, request_limit=100):
    config = crawl.read_json(root/'config/builder-discovery.json')
    queries = config['queries']
    if any(q.get('kind') not in {'skill', 'repo'} for q in queries):
        raise ValueError('builder query kind must be skill or repo')
    ids = [q['query_id'] for q in queries]
    if len(ids) != len(set(ids)) or not queries:
        raise ValueError('builder discovery requires unique, nonempty queries')
    state_path = root/'state/builder-discovery.json'
    state = crawl.read_json(state_path) if state_path.exists() else {}
    if config.get('query_revision') != state.get('query_revision'):
        state = {**state, 'query_revision': config.get('query_revision'),
                 'query_cursor': 0, 'query_pages': {}, 'query_sample_offsets': {},
                 'source_cursor': 0, 'source_offsets': {}, 'query_cursors': {}}
    state.setdefault('source_offsets', {})
    state.setdefault('query_pages', {})
    state.setdefault('query_sample_offsets', {})
    lanes = {kind: [q for q in queries if q['kind'] == kind] for kind in ('skill', 'repo')}
    cursors = state.setdefault('query_cursors', {kind: sum(q['kind'] == kind for q in queries[:state.get('query_cursor', 0) % len(queries)]) for kind in lanes})
    for kind in lanes:
        cursors.setdefault(kind, 0)
    skills_path = root/'data/skills.jsonl'
    skills = crawl_skills.load_jsonl(skills_path)
    repos = crawl.Registry(root/'data/registry.jsonl')
    original_keys = set(skills)
    timestamp = crawl.utc_now()
    summary = {'started_at': timestamp, 'queries': [], 'sources': [], 'errors': [],
               'manifest_attempts': 0, 'refreshed': 0, 'new_skills': 0,
               'repository_observations': 0, 'request_limit': request_limit,
               'manifest_limit': manifest_limit, 'query_limit': query_count, 'successful_requests': 0}
    per_kind = {kind: min(len(lane), query_count if not lanes['repo' if kind == 'skill' else 'skill']
                         else (query_count + (kind == 'skill')) // 2) for kind, lane in lanes.items()}
    summary['coverage_bounds'] = {
        'configured_queries': {kind: len(lane) for kind, lane in lanes.items()},
        'planned_query_visits_per_run': per_kind,
        'query_cycle_runs_without_failures': {kind: math.ceil(len(lane)/per_kind[kind]) if per_kind[kind] else None
                                             for kind, lane in lanes.items()},
        'sampled_results_per_query_visit': 2, 'results_per_page': 8, 'max_pages_per_query': 3,
        'configured_sources': len(config['sources']), 'sources_per_run': 2,
        'source_revisit_runs_without_failures': math.ceil(len(config['sources'])/2),
        'source_manifest_samples_per_visit': min(2, manifest_limit // 4),
        'note': 'Bounded samples, not exhaustive coverage. Budgets, failures and authentication can extend these cycles.'}
    requests = 0
    cache = {}
    refreshed = set()
    observed_repositories = set()

    def api(path):
        nonlocal requests
        if requests >= request_limit:
            raise BudgetReached('builder request budget reached')
        requests += 1
        value, _, status = client.request_json(path)
        if status != 200:
            raise RuntimeError(f'Unexpected GitHub status {status}: {path}')
        summary['successful_requests'] += 1
        return value

    def repository(full_name, hint, provenance_id):
        if full_name not in cache:
            repo = api('/repos/' + full_name)
            if repo.get('private'):
                raise ValueError('private repositories are excluded')
            commit = api(f'/repos/{repo["full_name"]}/commits/{quote(repo["default_branch"], safe="")}')['sha']
            tree = api(f'/repos/{repo["full_name"]}/git/trees/{commit}?recursive=1')
            if tree.get('truncated'):
                raise ValueError(f'truncated tree requires review: {full_name}')
            cache[full_name] = (repo, commit, tree['tree'])
        repo, commit, tree = cache[full_name]
        key = f'repo:{repo["id"]}'
        prior = repos.records.get(key)
        row = crawl.record_from_repo(repo, now=timestamp, languages=None, languages_status='pending',
                                     release=None, release_status='pending', kind_hint=None)
        if prior:
            row['first_seen'] = prior['first_seen']
            # Metadata-only inspection cannot erase independent hydrated facts.
            for field in ('languages', 'languages_status', 'latest_release', 'latest_release_status',
                          'gold_seed', 'notes', 'entity_kind', 'lead_match_status'):
                if field in prior:
                    row[field] = prior[field]
        row['builder_discovery_hints'] = merge_hints((prior or {}).get('builder_discovery_hints'), hint)
        provenance = crawl.make_provenance(source='builder-discovery', source_ref=provenance_id,
                                          query_id=provenance_id, first_seen=timestamp, last_seen=timestamp)
        row['provenance'] = crawl.append_unique((prior or {}).get('provenance', []), provenance)
        repos.records[key] = row
        observed_repositories.add(key)
        return repo, commit, tree

    def manifest(full_name, path, hint, provenance_id):
        if summary['manifest_attempts'] >= manifest_limit:
            raise BudgetReached('builder manifest budget reached')
        repo, commit, tree = repository(full_name, hint, provenance_id)
        key = f'github-skill:{repo["id"]}:{path}'
        if key in refreshed:
            skills[key]['builder_discovery_hints'] = merge_hints(skills[key].get('builder_discovery_hints'), hint)
            return
        summary['manifest_attempts'] += 1
        payload = api(f'/repos/{repo["full_name"]}/contents/{quote(path, safe="/")}?ref={commit}')
        if payload.get('encoding') != 'base64' or payload.get('size', 0) > 256_000:
            raise ValueError(f'unsupported manifest: {full_name}/{path}')
        text = base64.b64decode(payload['content']).decode('utf-8', errors='replace')
        name, description = crawl_skills.parse_frontmatter(text)
        if not name or not description or len(description) > 4000:
            raise ValueError(f'invalid name/description frontmatter: {full_name}/{path}')
        prior = skills.get(key, {})
        directory = path.rpartition('/')[0]
        prefix = directory + '/' if directory else ''
        row = {
            'schema_version': '0.1', 'skill_key': key, 'verification_status': 'verified',
            'source_repository': {'github_repo_id': repo['id'], 'full_name': repo['full_name'],
                'html_url': repo['html_url'], 'api_url': repo['url'], 'default_branch': repo['default_branch'],
                'license_spdx': (repo.get('license') or {}).get('spdx_id'),
                'stars': repo.get('stargazers_count'), 'forks': repo.get('forks_count'),
                'updated_at': repo.get('updated_at'), 'pushed_at': repo.get('pushed_at')},
            'skill_name': name, 'description': description, 'skill_path': path,
            'manifest_url': f'https://github.com/{repo["full_name"]}/blob/{commit}/{quote(path, safe="/")}',
            'raw_manifest_url': f'https://raw.githubusercontent.com/{repo["full_name"]}/{commit}/{quote(path, safe="/")}',
            'pinned_commit': commit, 'manifest_blob_sha': payload.get('sha'),
            'manifest_sha256': hashlib.sha256(text.encode()).hexdigest(),
            'ecosystems': crawl_skills.inferred_ecosystems(path, ['agent-skills']),
            'compatibility_confidence': 'inferred', 'source_type': 'single_skill',
            'resource_hints': {kind: any(x.get('path', '').startswith(prefix + kind + '/') for x in tree)
                               for kind in ('scripts', 'references', 'assets')},
            'first_seen': prior.get('first_seen', timestamp), 'last_seen': timestamp, 'fetched_at': timestamp,
            'builder_discovery_hints': merge_hints(prior.get('builder_discovery_hints'), hint),
            'provenance': list(prior.get('provenance', [])),
        }
        evidence = {'source': provenance_id, 'method': 'github-rest-tree-plus-skill-frontmatter',
                    'source_url': repo['html_url'], 'observed_at': timestamp}
        row['provenance'] = [p for p in row['provenance'] if p.get('source') != provenance_id] + [evidence]
        skills[key] = row
        refreshed.add(key)

    def failed(stage, error):
        summary['errors'].append({'stage': stage, 'error': str(error)[:500],
                                  'http_status': getattr(error, 'status', None)})

    def process():
        # Refresh oldest previously collected manifests, then reserve discovery room.
        older = sorted((r for r in skills.values() if r.get('builder_discovery_hints')),
                       key=lambda r: r.get('fetched_at', ''))[:min(4, manifest_limit // 4)]
        for row in older:
            try:
                manifest(row['source_repository']['full_name'], row['skill_path'], row['builder_discovery_hints'],
                         'builder-scheduled-refresh')
            except BudgetReached:
                raise
            except (crawl.GitHubAPIError, RuntimeError, ValueError, KeyError) as e:
                failed('refresh:' + row['skill_key'], e)

        sources = config['sources']
        selected_sources = rotated(sources, state.get('source_cursor', 0), 2)
        for source in selected_sources:
            full_name = source['repository']
            try:
                _, _, tree = repository(full_name, source, source['source_id'])
                prefix = source['skill_root'].strip('/')
                paths = sorted(x['path'] for x in tree if x.get('type') == 'blob'
                               and x['path'].lower().endswith('skill.md')
                               and (not prefix or x['path'].startswith(prefix + '/'))
                               and Path(x['path']).name.lower() == 'skill.md')
                if not paths:
                    raise ValueError(f'no SKILL.md under configured root: {full_name}/{prefix}')
                offset = state['source_offsets'].get(source['source_id'], 0)
                for path in rotated(paths, offset, min(2, manifest_limit // 4)):
                    try:
                        manifest(full_name, path, source, source['source_id'])
                    except (ValueError, KeyError) as e:
                        failed('rejected-source-manifest:' + full_name + '/' + path, e)
                    offset += 1
                    state['source_offsets'][source['source_id']] = offset
                summary['sources'].append({'source_id': source['source_id'], 'available_manifests': len(paths)})
            except BudgetReached:
                raise
            except (crawl.GitHubAPIError, RuntimeError, ValueError, KeyError) as e:
                failed('source:' + full_name, e)
        state['source_cursor'] = state.get('source_cursor', 0) + len(selected_sources)

        selected = []
        for offset in range(query_count):
            kind = ('skill', 'repo')[offset % 2]
            if not lanes[kind]:
                kind = 'repo' if kind == 'skill' else 'skill'
            lane = lanes[kind]
            used = sum(q['kind'] == kind for q in selected)
            if lane and used < len(lane):
                selected.append(lane[(cursors[kind] + used) % len(lane)])
        blocked = set()
        failed_cursor = False
        for query in selected:
            if query['kind'] in blocked:
                continue
            qid = query['query_id']
            page = state['query_pages'].get(qid, 1)
            log = {'query_id': qid, 'kind': query['kind'], 'query': query['query'], 'page': page}
            summary['queries'].append(log)
            try:
                endpoint = 'code' if query['kind'] == 'skill' else 'repositories'
                sort = '' if endpoint == 'code' else '&sort=updated'
                result = api(f'/search/{endpoint}?q={quote(query["query"], safe="")}&per_page=8&page={page}{sort}')
                if result.get('incomplete_results'):
                    raise ValueError('incomplete search results; retry this query')
                items = result.get('items', [])
                log['result_count'] = len(items)
                offset = state['query_sample_offsets'].get(qid, 0)
                if offset >= len(items):
                    offset = 0
                sample = items[offset:offset + 2]
                log['sample_count'] = len(sample)
                log['sample_offset'] = offset
                for item in sample:
                    full_name = (item.get('repository') or {}).get('full_name') if endpoint == 'code' else item['full_name']
                    if not full_name:
                        continue
                    try:
                        if endpoint == 'code':
                            path = item.get('path', '')
                            if Path(path).name.lower() != 'skill.md':
                                continue
                            manifest(full_name, path, query, 'builder-query:' + qid)
                        else:
                            repository(full_name, query, 'builder-query:' + qid)
                    except (ValueError, KeyError) as e:
                        # Malformed public records cannot pin the rotating queue forever.
                        # Auth, network failures and budget stops still retain this query.
                        failed('rejected-item:' + full_name, e)
                    except crawl.GitHubAPIError as e:
                        if e.status not in (404, 410):
                            raise
                        # Code-search indexes may retain paths that were removed.
                        failed('removed-item:' + full_name, e)
                next_offset = offset + len(sample)
                state['query_sample_offsets'][qid] = next_offset if next_offset < len(items) else 0
                if next_offset >= len(items):
                    state['query_pages'][qid] = page + 1 if len(items) == 8 and page < 3 else 1
                log['status'] = 'complete'
                cursors[query['kind']] += 1
                if not failed_cursor:
                    state['query_cursor'] = state.get('query_cursor', 0) + 1
            except BudgetReached:
                log['status'] = 'budget-reached-retry-next-run'
                raise
            except (crawl.GitHubAPIError, RuntimeError, ValueError, KeyError) as e:
                log['status'] = 'failed'
                failed(qid, e)
                blocked.add(query['kind'])
                failed_cursor = True

    try:
        process()
    except BudgetReached as e:
        summary['budget_stop'] = str(e)
    except (crawl.GitHubAPIError, RuntimeError, ValueError, KeyError) as e:
        failed('collection-stopped', e)
    temporary = skills_path.with_suffix('.jsonl.tmp')
    temporary.write_text(''.join(json.dumps(row, ensure_ascii=False, sort_keys=True) + '\n'
                                 for _, row in sorted(skills.items())))
    temporary.replace(skills_path)
    repos.save()
    summary.update({'finished_at': crawl.utc_now(), 'api_requests': requests, 'refreshed': len(refreshed),
                    'new_skills': len(set(skills) - original_keys), 'skills_count': len(skills),
                    'repository_observations': len(observed_repositories), 'next_query_cursor': state.get('query_cursor', 0),
                    'query_cursors': dict(cursors),
                    'status': 'partial' if summary['errors'] or summary.get('budget_stop') else 'complete'})
    state['last_run'] = summary
    crawl.write_json(state_path, state)
    return summary
