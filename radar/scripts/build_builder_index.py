"""Shared, metadata-only builder read model and offline search baseline."""
import argparse
import json
import re
import unicodedata
from pathlib import Path

import crawl
import crawl_skills
from review_resources import load_policy, review_resource

ROOT = Path(__file__).resolve().parents[1]
FACETS = ('audiences', 'subjects', 'platforms', 'scenarios', 'capabilities')


def normalize(text):
    return unicodedata.normalize('NFKC', text).casefold().strip()


def keyword_match(text, keyword):
    word = normalize(keyword)
    if word.isascii() and word.replace(' ', '').replace('-', '').isalnum():
        return bool(re.search(r'(?<!\w)' + re.escape(word) + r'(?!\w)', text))
    return word in text


def build(root=ROOT):
    policy = load_policy(root)
    curated = {r['resource_key']: r for r in crawl.read_json(root/'data/education-resources.json')['resources']}
    repos = list(crawl.Registry(root/'data/registry.jsonl').records.values())
    skills = list(crawl_skills.load_jsonl(root/'data/skills.jsonl').values())
    records = []
    for row in repos + skills:
        if row.get('verification_status') != 'verified':
            continue
        skill = bool(row.get('skill_key'))
        if not skill and not isinstance(row.get('github_repo_id'), int):
            continue
        key = row['skill_key'] if skill else f'repo:{row["github_repo_id"]}'
        selected = curated.get(key, {})
        repository = row['source_repository'] if skill else row
        classification = crawl.classify_resource(row, selected)
        overrides = policy.get('overrides', {})
        editorial = overrides.get(key.casefold(), {})
        if not skill:
            editorial = editorial or overrides.get((repository.get('full_name') or '').casefold(), {})
        artifact = editorial.get('artifact_kind')
        kinds = {'application': 'repo', 'library': 'repo', 'repository': 'repo', 'dataset': 'dataset',
                 'benchmark': 'benchmark', 'knowledge': 'knowledge', 'index': 'awesome_index'}
        if artifact in kinds:
            classification = {'kind': kinds[artifact], 'artifact_kind': artifact,
                              'classification_evidence': editorial['evidence']}
        facets = {k: sorted(set(row.get('reviewed_facets', {}).get(k, []) +
                               selected.get('reviewed_facets', {}).get(k, []) +
                               editorial.get('reviewed_facets', {}).get(k, []))) for k in FACETS}
        facets['scenarios'] = sorted(set(facets['scenarios'] + selected.get('education_scenarios', [])))
        record = {'resource_id': key, **classification,
            'title': (row.get('skill_name') or row.get('skill_path') or key) if skill else (row.get('full_name') or row.get('name') or key),
            'description': selected.get('purpose_zh') or row.get('description') or '',
            'source_url': row.get('manifest_url') if skill else row.get('html_url'),
            'repository_url': row['source_repository'].get('html_url') if skill else row.get('html_url'),
            'repository_name': repository.get('full_name'),
            'primary_language': repository.get('primary_language'),
            'stars': repository.get('stars') if skill else row.get('metrics', {}).get('stars'),
            'archived': repository.get('archived'), 'pushed_at': repository.get('pushed_at'),
            'checked_at': row.get('checked_at') or row.get('fetched_at'),
            'verified_at': row.get('fetched_at'), 'pinned_commit': row.get('pinned_commit') or selected.get('pinned_commit'),
            'license_observed': row['source_repository'].get('license_spdx') if skill else row.get('license_spdx'),
            'license_scopes': selected.get('license_scopes', []),
            'reuse_status': selected.get('reuse_status', 'needs-review'),
            'runtime_tested': None, 'curated': bool(selected),
            'facet_hints': facets,
            'facet_evidence': 'explicit-reviewed-facets-or-curated-scenarios' if any(facets.values()) else 'not-recorded',
            'discovery_hints': row.get('builder_discovery_hints', {}),
            'topics': row.get('topics', []) + selected.get('course_tags', []),
            'review': review_resource({**row, **classification}, policy)}
        records.append(record)
    if len({r['resource_id'] for r in records}) != len(records):
        raise ValueError('duplicate builder resource identity')
    payload = {'schema_version': 'radar.builder-index.v1', 'generated_at': crawl.utc_now(),
               'count': len(records), 'records': records,
               'note': 'All source-verified candidates are retained with reversible review decisions. Discovery hints are provenance, not confirmed facets. Missing runtime evidence is null. License observation does not grant reuse rights.'}
    for folder in ('data', 'site/data', 'web/data'):
        crawl.write_json(root/f'{folder}/builder-index.json', payload)
    return payload


def search(payload, config, query='', *, filters=None, limit=10):
    families = config['families']
    groups = []
    for term in normalize(query).split():
        synonyms = {term}
        for family in families:
            if term == family['id'] or term in map(normalize, family['keywords']):
                synonyms.update(map(normalize, family['keywords']))
        groups.append(synonyms)
    matches = []
    for record in payload['records']:
        if record.get('review', {}).get('status') == 'exclude':
            continue
        if any(value not in record['facet_hints'].get(key, []) for key, value in (filters or {}).items() if value):
            continue
        text = normalize(record['title'] + ' ' + record['description'] + ' ' + ' '.join(record.get('topics', [])))
        if not all(any(keyword_match(text, word) for word in group) for group in groups):
            continue
        score = sum(3 if keyword_match(normalize(record['title']), term) else 1 for term in normalize(query).split())
        matches.append((score + int(record['curated']), record))
    matches.sort(key=lambda x: (-x[0], x[1]['title']))
    return {'query': query, 'matched_count': len(matches), 'records': [r for _, r in matches[:limit]],
            'method': 'keyword-and-curation-baseline', 'model_calls': 0,
            'note': payload['note']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('query', nargs='?', default='')
    parser.add_argument('--build', action='store_true')
    for facet, flag in zip(FACETS, ('audience', 'subject', 'platform', 'scenario', 'capability')):
        parser.add_argument('--' + flag, dest=facet)
    parser.add_argument('--limit', type=int, default=10)
    args = parser.parse_args()
    if not 1 <= args.limit <= 50:
        parser.error('--limit must be between 1 and 50')
    if args.build:
        print(json.dumps({'count': build()['count']}))
    else:
        payload = crawl.read_json(ROOT/'data/builder-index.json')
        config = crawl.read_json(ROOT/'config/builder-discovery.json')
        print(json.dumps(search(payload, config, args.query,
            filters={f: getattr(args, f) for f in FACETS}, limit=args.limit), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
