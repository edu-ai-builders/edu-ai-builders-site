#!/usr/bin/env python3
"""Bounded, locked metadata refresh and course-resource export. No installs/clones."""
from __future__ import annotations

import argparse
import base64
import fcntl
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import uuid
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, urlsplit

import crawl
import crawl_skills
import discovery_health

ROOT = Path(__file__).resolve().parents[1]


def experience(resource, settings, texts):
    """Distinguish an observed hosted demo from instructions, courses and source."""
    timestamp = crawl.utc_now()
    source = resource['source_url']
    pinned = f"{source}/blob/{resource['pinned_commit']}"
    setup = f"{pinned}/README.md"
    if resource.get('skill_path'):
        setup = f"{pinned}/{resource['skill_path']}"
    if resource.get('link_only'):
        setup = resource['license_scopes'][0]['source_url']
    result = {'source_code_url': source, 'demo_url': None, 'demo_status': 'not-declared',
              'purpose_en': settings.get('purpose_en', ''), 'featured_rank': settings.get('featured_rank'),
              'quick_start': settings.get('quick_start', {}), 'setup_url': setup}
    result['quick_start'] = dict(result['quick_start'])
    result['quick_start']['commands'] = [c.replace('{commit}', resource['pinned_commit']) for c in result['quick_start'].get('commands', [])]
    kind = settings.get('action_kind', 'read-setup')
    action_url = settings.get('primary_url') or setup
    action = {'kind':kind, 'url':action_url,
              'label_zh':settings.get('action_label_zh', '查看最短上手'),
              'label_en':settings.get('action_label_en', 'View setup')}
    demo = settings.get('demo')
    if demo:
        candidate = urlsplit(demo['url'])
        if candidate.scheme != 'https' or not candidate.hostname or candidate.username or candidate.password or candidate.hostname in {'github.com', 'raw.githubusercontent.com'}:
            raise ValueError('A source repository is not a hosted demo')
        declared = not demo.get('declaration_path') or demo['url'].rstrip('/') in texts.get(demo['declaration_path'], '')
        check = {'checked_at':timestamp, 'declaration_source':demo['declaration_source'],
                 'declaration_observed':declared, 'browser_observed_at':demo.get('browser_observed_at'),
                 'browser_observation':demo.get('browser_observation'),
                 'verification_level':'http-page-only', 'generation_tested':False}
        try:
            request = urllib.request.Request(demo['url'], headers={'User-Agent':'eduos-radar-demo-check/1.0'})
            with urllib.request.urlopen(request, timeout=15) as response:
                response.read(32768)
                check.update({'http_status':response.status, 'resolved_url':response.url})
                reachable = 200 <= response.status < 400 and declared
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            check['error'] = str(error)
            reachable = False
        result.update({'demo_url':demo['url'], 'demo_status':'page-reachable' if reachable else 'unavailable',
                       'demo_access':demo['access'], 'demo_verification':check})
        if reachable:
            action = {'kind':'demo', 'url':demo['url'], 'label_zh':'在线体验' if demo['access']=='public-preview' else '在线试用 · 需账号',
                      'label_en':'Try online' if demo['access']=='public-preview' else 'Try online · account required'}
        else:
            result['quick_start']['mode'] = 'read-setup'
            result['quick_start']['steps_zh'] = ['在线入口当前未核实可访问，先查看固定版本上手说明。']
            result['quick_start']['steps_en'] = ['The online entry is unavailable; inspect the pinned setup instructions.']
    result['primary_action'] = action
    return result


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def license_observations(item, texts, evidence, previous, source_url, sha):
    scopes = []
    old_scopes = {(s['path'], s['covers']): s for s in (previous or {}).get('license_scopes', [])}
    for scope in item['license_scopes']:
        old = old_scopes.get((scope['path'], scope['covers']))
        checksum = next(e['sha256'] for e in evidence if e['path'] == scope['path'])
        changed = bool(old and old.get('sha256') != checksum)
        confirmed_hash = scope.get('reviewed_sha256')
        verified = scope['marker'] in texts[scope['path']] and (not changed or confirmed_hash == checksum)
        if old and old.get('verified') is False and confirmed_hash != checksum:
            verified = False
        scopes.append({k: v for k, v in scope.items() if k not in {'marker', 'reviewed_sha256'}} | {
            'verified': verified, 'sha256': checksum,
            'source_url': f'{source_url}/blob/{sha}/{quote(scope["path"], safe="/")}'})
    return scopes


def load_lines(path, key):
    records = {}
    for line in path.read_text().splitlines() if path.exists() else []:
        if line.strip():
            record = json.loads(line)
            if record[key] in records:
                raise ValueError(f"duplicate {key}: {record[key]}")
            records[record[key]] = record
    return records


def save_lines(path, records):
    temporary = path.with_suffix('.jsonl.tmp')
    temporary.write_text(''.join(json.dumps(r, ensure_ascii=False, sort_keys=True) + '\n'
                                 for r in sorted(records.values(), key=lambda x: x.get('skill_key', x.get('resource_key', '')))))
    temporary.replace(path)


def validate(resources):
    seen = set()
    for r in resources:
        key = r['resource_key']
        if key in seen:
            raise ValueError(f'duplicate resource identity: {key}')
        seen.add(key)
        if r['kind'] not in {'repo', 'dataset', 'skill'}:
            raise ValueError(f'invalid kind: {key}')
        if not r['source_url'].startswith('https://github.com/'):
            raise ValueError(f'invalid source: {key}')
        if not r['license_scopes'] or not r['education_scenarios']:
            raise ValueError(f'missing reuse metadata: {key}')
        if r['reuse_status'] not in {'license-observed', 'restricted', 'link-only', 'needs-review'}:
            raise ValueError(f'invalid reuse status: {key}')
        if r['reuse_status'] == 'license-observed' and not all(s['verified'] for s in r['license_scopes']):
            raise ValueError(f'unverified license presented as reusable: {key}')
        action = r.get('primary_action', {})
        if action.get('kind') == 'demo' and (not r.get('demo_url') or r.get('demo_status') != 'page-reachable'
                                           or action.get('url') != r['demo_url']):
            raise ValueError(f'unverified demo action: {key}')


def export(resources):
    validate(resources)
    payload = {
        'schema_version': 'radar.course-resources.v1', 'generated_at': crawl.utc_now(),
        'count': len(resources),
        'collection_note': 'Curated metadata and original reuse recipes; no code, dataset, Skill packages or instruction bodies. Educational scenarios are curator suggestions, not efficacy claims. license-observed means observed terms, not unconditional permission.',
        'resources': sorted(resources, key=lambda r: (r['kind'], r['id']))
    }
    for path in [ROOT/'data/education-resources.json', ROOT/'site/data/education-resources.json', ROOT/'web/data/education-resources.json']:
        crawl.write_json(path, payload)
    builder_payload = payload | {'schema_version':'radar.builder-resources.v1',
        'verified_demo_count':sum(r.get('demo_status')=='page-reachable' for r in resources),
        'featured_resources':sorted([r for r in resources if r.get('featured_rank') is not None], key=lambda r:r['featured_rank'])}
    for path in [ROOT/'data/builder-resources.json', ROOT/'site/data/builder-resources.json', ROOT/'web/data/builder-resources.json']:
        crawl.write_json(path, builder_payload)
    from build_discovery_feed import build
    build(ROOT)
    return payload


def gh_token():
    token = os.getenv('GH_TOKEN') or os.getenv('GITHUB_TOKEN')
    if not token:
        try:
            result = subprocess.run(['gh', 'auth', 'token'], capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                token = result.stdout.strip()
        except (OSError, subprocess.TimeoutExpired):
            pass
    if token:
        os.environ['GH_TOKEN'] = token
    return token


def hydrate_discovery_leads(root, registry, api, timestamp, limit=2):
    """Verify bounded public GitHub leads; X posts supply provenance, not labels."""
    queue = load_lines(root/'data/discovery-leads.jsonl', 'lead_id')
    path = root/'state/discovery-lead-progress.json'
    progress = crawl.read_json(path) if path.exists() else {}
    pending, manual = [], 0
    for lead in queue.values():
        if progress.get(lead['lead_id'], {}).get('status') == 'verified':
            continue
        target = urlsplit(lead.get('resource_url') or '')
        if (target.scheme == 'https' and target.hostname == 'github.com'
                and not target.username and not target.password and not target.port
                and not target.query and not target.fragment
                and re.fullmatch(r'/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?', target.path)
                and all(part not in {'.', '..'} for part in target.path.strip('/').split('/'))):
            pending.append(lead)
        else:
            manual += 1
    pending.sort(key=lambda lead: progress.get(lead['lead_id'], {}).get('last_attempt_at', ''))
    summary = {'limit': limit, 'pending_github': len(pending), 'pending_manual_review': manual,
               'attempted': 0, 'verified': 0, 'errors': []}
    for lead in pending[:limit]:
        key = lead['lead_id']
        summary['attempted'] += 1
        try:
            name = urlsplit(lead['resource_url']).path.strip('/')
            repo = api('/repos/' + quote(name, safe='/'))
            full_name = repo.get('full_name') or ''
            if (type(repo.get('id')) is not int or repo['id'] <= 0 or repo.get('private') is not False
                    or not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', full_name)
                    or repo.get('html_url') != 'https://github.com/' + full_name):
                raise ValueError('Lead did not resolve to a valid public GitHub repository')
            sources = [p for p in lead.get('provenance', []) if p.get('source') == 'x-web-index']
            if not sources:
                raise ValueError('Missing original discovery provenance')
            incoming = crawl.record_from_repo(repo, now=timestamp, languages=None, languages_status='pending',
                release=None, release_status='pending', kind_hint=None)
            for source in sources:
                registry.upsert_repo(incoming, crawl.make_provenance(source='x-web-index-source-verification',
                    source_ref=source['source_url'], lead_id=key,
                    first_seen=source.get('discovered_at', timestamp), last_seen=timestamp))
            progress[key] = {'status': 'verified', 'last_attempt_at': timestamp,
                'verified_at': timestamp, 'record_key': incoming['record_key'], 'source_url': repo['html_url']}
            summary['verified'] += 1
        except (crawl.GitHubAPIError, RuntimeError, ValueError, KeyError, TypeError, OSError) as error:
            progress[key] = {'status': 'retry', 'last_attempt_at': timestamp, 'error': str(error)[:500]}
            summary['errors'].append({'lead_id': key, 'error': str(error)[:500]})
    # Persist records before advancing their verification checkpoint.
    registry.save()
    crawl.write_json(path, progress)
    return summary


def refresh(args):
    timestamp = crawl.utc_now()
    run_id = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H%M%SZ') + '-' + uuid.uuid4().hex[:8]
    discovery_health.record_start(ROOT, timestamp, run_id)
    snapshot = ROOT/'data/snapshots'/('directory-' + run_id)
    snapshot.mkdir(parents=True)
    for name in ['registry.jsonl', 'skills.jsonl', 'education-resources.json']:
        path = ROOT/'data'/name
        if path.exists():
            shutil.copy2(path, snapshot/('before-' + name))
    token = gh_token()
    client = crawl.GitHubClient(argparse.Namespace(cache=str(ROOT/'state/http-cache.json'),
        max_retries=1, max_wait=15, request_interval=.25, search_interval=2.1))
    registry = crawl.Registry(ROOT/'data/registry.jsonl')
    original_repo_keys = set(registry.records)
    skills = load_lines(ROOT/'data/skills.jsonl', 'skill_key')
    prior_payload = json.loads((ROOT/'data/education-resources.json').read_text()) if (ROOT/'data/education-resources.json').exists() else {'resources': []}
    prior = {r['id']: r for r in prior_payload['resources']}
    curated = json.loads((ROOT/'config/education-resources.json').read_text())['resources']
    experience_path = ROOT/'config/resource-experience.json'
    experience_settings = json.loads(experience_path.read_text())['resources'] if experience_path.exists() else {}
    ids = [r['id'] for r in curated]
    if len(ids) != len(set(ids)):
        raise ValueError('duplicate curation id')
    resources, errors, changes = [], [], []
    repo_cache, file_cache = {}, {}
    successful_requests = 0
    curated_observations = 0

    def api(path):
        nonlocal successful_requests
        value, _, status = client.request_json(path)
        if status != 200:
            raise RuntimeError(f'Unexpected status {status}: {path}')
        successful_requests += 1
        return value

    def content(repo_name, path, sha):
        cache_key = (repo_name, path, sha)
        if cache_key not in file_cache:
            item = api(f'/repos/{repo_name}/contents/{quote(path, safe="/")}?ref={sha}')
            if item.get('encoding') != 'base64' or not item.get('content'):
                raise ValueError(f'not a readable metadata file: {repo_name}/{path}')
            raw = base64.b64decode(item['content'])
            file_cache[cache_key] = (raw.decode('utf-8', errors='replace'), hashlib.sha256(raw).hexdigest())
        return file_cache[cache_key]

    for item in curated:
        previous = prior.get(item['id'])
        try:
            name = item['repository']
            if name not in repo_cache:
                repo = api('/repos/' + name)
                commit = api(f'/repos/{repo["full_name"]}/commits/{quote(repo["default_branch"], safe="")}')
                repo_cache[name] = (repo, commit['sha'])
            repo, sha = repo_cache[name]
            full_name = repo['full_name']
            source_url = repo['html_url']
            evidence, texts = [], {}
            for path in item['evidence_paths']:
                body, checksum = content(full_name, path, sha)
                texts[path] = body
                evidence.append({'path': path, 'source_url': f'{source_url}/blob/{sha}/{quote(path, safe="/")}',
                                 'sha256': checksum, 'observed_at': timestamp})
            scopes = license_observations(item, texts, evidence, previous, source_url, sha)
            key = f'repo:{repo["id"]}'
            if item['kind'] == 'skill':
                key = f'github-skill:{repo["id"]}:{item["skill_path"]}'
            status = 'link-only' if item.get('link_only') else ('restricted' if item.get('restricted') else 'license-observed')
            if not all(s['verified'] for s in scopes):
                status = 'needs-review'
                errors.append({'id': item['id'], 'error': 'License evidence changed or is unrecognized; curator review required.'})
            resource = {k: v for k, v in item.items() if k not in {'evidence_paths', 'license_scopes'}} | {
                'resource_key': key, 'github_repo_id': repo['id'], 'repository': full_name,
                'source_url': source_url, 'pinned_commit': sha,
                'pinned_source_url': f'{source_url}/tree/{sha}',
                'license_spdx_reported_by_github': (repo.get('license') or {}).get('spdx_id'),
                'license_scopes': scopes, 'reuse_status': status, 'evidence': evidence,
                'last_active_at': repo['pushed_at'], 'activity_basis': 'repository-pushed_at',
                'archived': repo['archived'], 'stars': repo['stargazers_count'],
                'first_seen': (previous or {}).get('first_seen', timestamp), 'last_verified_at': timestamp,
                'last_checked_at': timestamp, 'verification_status': 'verified', 'refresh_status': 'ok'
            }
            resource.update(experience(resource, experience_settings.get(item['id'], {}), texts))
            incoming = crawl.record_from_repo(repo, now=timestamp, languages=None, languages_status='pending',
                release=None, release_status='pending', kind_hint='dataset' if item['kind']=='dataset' else 'repo')
            registry.upsert_repo(incoming, crawl.make_provenance(source='education-curation-2026-10-10',
                source_ref=resource['pinned_source_url'], lead_id=item['id'], first_seen=timestamp, last_seen=timestamp))
            if item['kind'] == 'skill' and not item.get('link_only'):
                path = item['skill_path']
                manifest = texts[path]
                skill_name, description = crawl_skills.parse_frontmatter(manifest)
                old_skill = skills.get(key, {})
                skills[key] = old_skill | {
                    'schema_version': '0.1', 'skill_key': key, 'verification_status': 'verified',
                    'source_repository': {'github_repo_id': repo['id'], 'full_name': full_name, 'html_url': source_url,
                        'api_url': repo['url'], 'default_branch': repo['default_branch'],
                        'license_spdx': (repo.get('license') or {}).get('spdx_id'), 'stars': repo['stargazers_count'],
                        'forks': repo['forks_count'], 'updated_at': repo['updated_at'], 'pushed_at': repo['pushed_at']},
                    'skill_name': skill_name or item['title'], 'description': description, 'skill_path': path,
                    'manifest_url': f'{source_url}/blob/{sha}/{path}',
                    'raw_manifest_url': f'https://raw.githubusercontent.com/{full_name}/{sha}/{path}',
                    'ecosystems': ['codex'] if name.startswith('openai/') else ['claude', 'agent-skills'],
                    'compatibility_confidence': 'source_declared', 'source_type': 'first_party_collection',
                    'resource_hints': old_skill.get('resource_hints', {}),
                    'first_seen': old_skill.get('first_seen', timestamp), 'last_seen': timestamp, 'fetched_at': timestamp,
                    'provenance': old_skill.get('provenance', []) + [{'source': 'education-curation-2026-10-10',
                        'source_url': resource['pinned_source_url'], 'observed_at': timestamp}],
                    'license_scopes': scopes, 'reuse_status': status}
            resources.append(resource)
            curated_observations += 1
            comparison_fields = ['pinned_commit', 'last_active_at', 'license_scopes', 'reuse_status', 'purpose_zh', 'course_tags',
                                 'demo_url', 'demo_status', 'primary_action', 'quick_start']
            before = {f: previous.get(f) for f in comparison_fields} if previous else None
            after = {f: resource.get(f) for f in comparison_fields}
            if digest(before) != digest(after):
                changes.append({'resource_key': key, 'id': item['id'], 'type': 'updated' if previous else 'added',
                    'before': before, 'after': after})
            print(f'{item["id"]}: {status}', flush=True)
        except Exception as error:
            errors.append({'id': item['id'], 'error': str(error)})
            if previous:
                resources.append(previous | {'last_checked_at': timestamp, 'refresh_status': 'error', 'last_error': str(error)})
            print(f'{item["id"]}: refresh failed (previous evidence retained)', flush=True)
    registry.save()
    save_lines(ROOT/'data/skills.jsonl', skills)
    lead_run = hydrate_discovery_leads(ROOT, registry, api, timestamp)
    if lead_run['errors']:
        errors.append({'step': 'discovery-leads', 'error': lead_run['errors']})
    builder_run = None
    if getattr(args, 'collect_builder_skills', False):
        from collect_builder_skills import collect
        builder_client = crawl.GitHubClient(argparse.Namespace(cache=str(ROOT/'state/http-cache.json'),
            max_retries=0, max_wait=15, request_interval=.3, search_interval=6.1))
        builder_run = collect(ROOT, builder_client)
        if builder_run['status'] != 'complete':
            errors.append({'step': 'builder-discovery',
                           'error': builder_run['errors'] or builder_run.get('budget_stop', 'incomplete collection')})
        skills = load_lines(ROOT/'data/skills.jsonl', 'skill_key')
    validate(resources)
    payload = export(resources)
    steps = []
    if args.refresh_limit:
        steps.append(['crawl.py', '--max-wait', '15', '--max-retries', '1', 'refresh', '--limit', str(args.refresh_limit)])
    discovery_query = None
    if args.discover:
        matrix = [q for q in crawl.read_json(ROOT/'config/directory-query-matrix.json') if q.get('enabled', True)]
        if not matrix:
            raise ValueError('Directory discovery matrix has no enabled queries')
        cursor_path = ROOT/'state/directory-discovery.json'
        cursor = crawl.read_json(cursor_path).get('query_cursor', 0) if cursor_path.exists() else 0
        discovery_query = matrix[cursor % len(matrix)]
        steps.append(['crawl.py', '--max-wait', '15', '--max-retries', '1', 'discover', '--query-id', discovery_query['id'],
                      '--matrix', str(ROOT/'config/directory-query-matrix.json'),
                      '--query-limit', '1', '--pages', '1', '--per-page', '20', '--sort', 'updated', '--hydrate-limit', '0'])
    steps += [['validate.py', '--report', f'reports/directory-repositories-{run_id}.md'],
              ['validate_skills.py', '--report', f'reports/directory-skills-{run_id}.md']]
    validation_failed = False
    collector_runs = []
    for step in steps:
        result = subprocess.run([sys.executable, str(ROOT/'scripts'/step[0]), *step[1:]], cwd=ROOT, capture_output=True, text=True)
        if step[0] == 'crawl.py':
            try:
                collector_runs.append(json.loads(result.stdout))
            except (json.JSONDecodeError, TypeError):
                pass
        if result.returncode:
            errors.append({'step': step[0], 'error': (result.stderr or result.stdout)[-2000:]})
            if step[0].startswith('validate'):
                validation_failed = True
        elif discovery_query and '--query-id' in step:
            crawl.write_json(cursor_path, {'query_cursor': (cursor + 1) % len(matrix),
                                          'last_query_id': discovery_query['id']})
    # Build in the run directory; a failed validator/builder never replaces public data.
    published = False
    if not validation_failed:
        for builder, name in [('build_site.py', 'registry.json'), ('build_skills_site.py', 'skills.json')]:
            result = subprocess.run([sys.executable, str(ROOT/'scripts'/builder), '--output', str(snapshot/name)],
                                    cwd=ROOT, capture_output=True, text=True)
            if result.returncode:
                errors.append({'step': builder, 'error': (result.stderr or result.stdout)[-2000:]})
                validation_failed = True
        if not validation_failed:
            for name in ['registry.json', 'skills.json']:
                for destination in [ROOT/'site/data'/name, ROOT/'web/data'/name]:
                    temporary = destination.with_suffix('.json.tmp')
                    shutil.copy2(snapshot/name, temporary)
                    temporary.replace(destination)
            published = True
            from build_builder_index import build as build_builder_index
            try:
                build_builder_index(ROOT)
            except (ValueError, KeyError, OSError, TypeError) as error:
                errors.append({'step': 'builder-index', 'error': str(error)})
                published = False
                validation_failed = True
    for name in ['registry.jsonl', 'skills.jsonl', 'education-resources.json']:
        shutil.copy2(ROOT/'data'/name, snapshot/name)
    observed_successes = curated_observations + lead_run['verified'] + (builder_run or {}).get('repository_observations', 0)
    observed_successes += sum(q.get('status') == 'complete' for q in (builder_run or {}).get('queries', []))
    # Crawl summaries count successful record observations, including conditional 304s.
    observed_successes += sum(r.get('updated', 0) + r.get('not_modified', 0)
                              + r.get('unique_repositories_seen', 0) for r in collector_runs)
    observed_successes += sum(r.get('queries', 0) for r in collector_runs
                              if r.get('command') == 'discover' and not r.get('errors') and r.get('api_requests', 0))
    new_observations = len(set(crawl.Registry(ROOT/'data/registry.jsonl').records) - original_repo_keys)
    new_observations += (builder_run or {}).get('new_skills', 0)
    summary = {'run_id': run_id, 'started_at': timestamp, 'finished_at': crawl.utc_now(),
        'authenticated': bool(token), 'requests': client.request_count, 'resource_count': payload['count'],
        'collector_runs': collector_runs, 'builder_discovery': builder_run, 'discovery_leads': lead_run,
        'total_api_requests': client.request_count + sum(r.get('api_requests', 0) for r in collector_runs)
            + (builder_run or {}).get('api_requests', 0),
        'registry_count': len(crawl.Registry(ROOT/'data/registry.jsonl').records), 'skills_count': len(skills),
        'changed_resources': len(changes), 'public_snapshots_updated': published,
        'errors': errors, 'successful_requests': successful_requests,
        'observed_successes': observed_successes, 'new_observations': new_observations,
        **discovery_health.collection_status(observed_successes, errors, validation_failed),
        'snapshot_path': str(snapshot.relative_to(ROOT))}
    crawl.write_json(snapshot/'run-summary.json', summary)
    crawl.write_json(snapshot/'resource-changes.json', changes)
    with (ROOT/'data/update-history.jsonl').open('a') as history:
        history.write(json.dumps(summary, ensure_ascii=False, sort_keys=True) + '\n')
    crawl.write_json(ROOT/'state/directory-last-run.json', summary)
    discovery_health.record_attempt(ROOT, summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if summary['exportable'] else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--offline', action='store_true', help='validate/export saved course metadata without network')
    parser.add_argument('--refresh-limit', type=int, default=0, help='rotate through oldest checked registry records (0-50)')
    parser.add_argument('--discover', action='store_true', help='rotate one bounded education resource query')
    parser.add_argument('--collect-builder-skills', action='store_true', help='rotate bounded builder skill/repo discovery')
    args = parser.parse_args()
    if not 0 <= args.refresh_limit <= 50:
        parser.error('--refresh-limit must be between 0 and 50')
    (ROOT/'state').mkdir(exist_ok=True)
    # Keep the file: unlinking a held flock permits another process to lock a new inode.
    with (ROOT/'state/directory-update.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print('Another directory update is running; nothing changed.', file=sys.stderr)
            return 2
        if args.offline:
            payload = json.loads((ROOT/'data/education-resources.json').read_text())
            export(payload['resources'])
            print(f'Validated/exported {len(payload["resources"])} saved course resources; no network verification.')
            return 0
        return refresh(args)


if __name__ == '__main__':
    raise SystemExit(main())
