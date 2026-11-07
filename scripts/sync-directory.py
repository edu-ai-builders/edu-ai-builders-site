#!/usr/bin/env python3
"""Export the reviewed in-repository index to the website without network requests."""
import argparse
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


def safe_url(value):
    if not isinstance(value, str) or any(c.isspace() for c in value):
        return None
    try:
        parsed = urlparse(value)
        return value if parsed.scheme in ('https', 'http') and parsed.hostname and not parsed.username and not parsed.password else None
    except ValueError:
        return None


def jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def build_catalog(index, repositories, skills, previous, timestamp):
    repos = {f'repo:{r["github_repo_id"]}': r for r in repositories if r.get('github_repo_id')}
    manifests = {r['skill_key']: r for r in skills}
    prior = {r['id']: r for r in previous.get('records', [])}
    records = []
    for item in index['records']:
        if item['review']['status'] == 'exclude':
            continue
        key = item['resource_id']
        skill = item['kind'] == 'skill'
        raw = manifests.get(key, {}) if skill else repos.get(key, {})
        repository = raw.get('source_repository', {}) if skill else raw
        record = {
            'id': key, 'kind': item['kind'], 'artifactKind': item['artifact_kind'],
            'name': repository.get('full_name') or item['title'], 'title': item['title'],
            'description': item['description'], 'url': safe_url(item['source_url']),
            'homepage': safe_url(repository.get('homepage')), 'topics': item.get('topics', []),
            'language': repository.get('primary_language') or repository.get('language'),
            'license': item.get('license_observed'),
            'stars': repository.get('metrics', {}).get('stars', repository.get('stars')),
            'archived': bool(repository.get('archived')), 'pushedAt': repository.get('pushed_at'),
            'checkedAt': item.get('verified_at'), 'refreshStatus': 'not-refreshed',
            'refreshError': None, 'source': 'GitHub metadata and Skill declarations; reviewed directory export',
            'sourceUrl': safe_url(item['source_url']), 'importedFrom': 'radar/data/builder-index.json',
            'review': item['review'], 'facets': item['facet_hints'], 'curated': bool(item.get('curated')),
            'classificationEvidence': item.get('classification_evidence', []),
            'reuseStatus': item['reuse_status'], 'runtimeTested': item.get('runtime_tested'),
            'pinnedCommit': item.get('pinned_commit'),
        }
        old = prior.get(key)
        if old and (old.get('checkedAt') or '') > (record['checkedAt'] or ''):
            # The site's September observations can be newer than retained collector evidence.
            for field in ('name', 'title', 'description', 'url', 'sourceUrl', 'homepage', 'topics', 'language', 'license', 'stars', 'archived', 'pushedAt', 'checkedAt'):
                if field in old:
                    record[field] = old[field]
            record['pinnedCommit'] = old.get('pinnedCommit')
        if skill:
            record['repositoryCheckedAt'] = repository.get('fetched_at') or record['checkedAt']
            record['repositoryRefreshStatus'] = 'not-refreshed'
            record['manifestSha'] = old.get('manifestSha') if old and (old.get('checkedAt') or '') > (item.get('verified_at') or '') else raw.get('manifest_blob_sha')
        for field in ('url', 'homepage', 'sourceUrl'):
            record[field] = safe_url(record[field])
        records.append(record)
    if len({r['id'] for r in records}) != len(records):
        raise ValueError('Duplicate directory resource IDs')
    counts = Counter(r['review']['status'] for r in records)
    summary = {
        'schemaVersion': 2, 'generatedAt': timestamp, 'refreshStartedAt': timestamp,
        'sourceSnapshotAt': index['generated_at'], 'total': len(records),
        'repositories': sum(r['kind'] != 'skill' for r in records),
        'skills': sum(r['kind'] == 'skill' for r in records),
        'included': counts['include'], 'needsReview': counts['review'],
        'excluded': sum(r['review']['status'] == 'exclude' for r in index['records']),
        'refreshed': 0, 'notRefreshed': len(records), 'failed': 0,
        'excludedUnverified': sum(r.get('verification_status') != 'verified' for r in repositories),
        'repositoryRequests': 0, 'repositoryRefreshSuccess': 0, 'repositoryRefreshErrors': 0,
        'sourcePolicy': 'Metadata export only. Generation does not reverify a source or establish runtime behavior.',
    }
    return {'summary': summary, 'records': records}


def sync(root=ROOT, radar=None):
    radar = radar or root/'radar'
    index = json.loads((radar/'data/builder-index.json').read_text())
    resources = json.loads((radar/'data/education-resources.json').read_text())
    discovery = json.loads((radar/'config/builder-discovery.json').read_text())
    output = root/'public/data/radar/catalog.json'
    previous = json.loads(output.read_text()) if output.exists() else {'records': []}
    timestamp = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    catalog = build_catalog(index, jsonl(radar/'data/registry.jsonl'), jsonl(radar/'data/skills.jsonl'), previous, timestamp)
    public_index = {**index, 'records': [r for r in index['records'] if r['review']['status'] != 'exclude']}
    public_index['count'] = len(public_index['records'])
    exports = {output: catalog, root/'public/data/builder/index.json': public_index,
               root/'public/data/builder/resources.json': resources, root/'public/data/builder/discovery.json': discovery}
    for path, value in exports.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix+'.tmp')
        temporary.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':'))+'\n')
        temporary.replace(path)
    return catalog['summary']


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--radar', type=Path)
    args = parser.parse_args()
    print(json.dumps(sync(radar=args.radar), ensure_ascii=False))
