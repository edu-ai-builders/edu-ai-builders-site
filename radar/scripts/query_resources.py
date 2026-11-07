#!/usr/bin/env python3
"""Search saved course resources or the complete discovery registry offline."""
import argparse
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('query', nargs='?', default='')
    parser.add_argument('--kind', choices=['repo', 'dataset', 'benchmark', 'skill'])
    parser.add_argument('--tag')
    parser.add_argument('--license-observed', action='store_true', help='only successful, unrestricted curated license observations')
    parser.add_argument('--all', action='store_true', help='include the broader discovery registries')
    parser.add_argument('--max-age-days', type=int, help='only observations newer than this many days')
    args = parser.parse_args()
    records = json.loads((ROOT/'data/education-resources.json').read_text())['resources']
    if args.all:
        curated = {r['resource_key'] for r in records}
        for name, key in [('registry', 'record_key'), ('skills', 'skill_key')]:
            for line in (ROOT/'data'/f'{name}.jsonl').read_text().splitlines():
                r = json.loads(line)
                if r[key] not in curated:
                    records.append({'resource_key': r[key], 'kind': 'skill' if name=='skills' else r['entity_kind'],
                        'title': r.get('full_name') or r.get('skill_name'),
                        'description': r.get('description'), 'source_url': r.get('html_url') or r.get('manifest_url'),
                        'last_verified_at': r.get('fetched_at'),
                        'verification_status': r.get('verification_status'),
                        'last_check_status': r.get('last_check_status'),
                        'reuse_status': 'needs-review', 'topics': r.get('topics', [])})
    terms = args.query.casefold().split()
    results = []
    for r in records:
        if args.kind and r['kind'] != args.kind:
            continue
        if args.tag and args.tag not in r.get('course_tags', []):
            continue
        if args.license_observed and (r.get('reuse_status') != 'license-observed' or r.get('refresh_status') != 'ok'):
            continue
        if args.max_age_days is not None:
            observed = r.get('last_verified_at')
            if not observed:
                continue
            age = datetime.now(timezone.utc) - datetime.fromisoformat(observed.replace('Z', '+00:00'))
            if age.total_seconds() > args.max_age_days * 86400:
                continue
        searchable = json.dumps(r, ensure_ascii=False).casefold()
        if all(term in searchable for term in terms):
            results.append(r)
    print(json.dumps({'count': len(results), 'resources': results}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
