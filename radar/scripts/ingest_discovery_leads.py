"""Validate public X search leads without treating announcements as catalog evidence."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


def normalize_lead(row, timestamp):
    source = urlparse(row['source_url'])
    if source.scheme != 'https' or source.hostname not in {'x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'} or source.username or source.password:
        raise ValueError('A lead must link to an HTTPS X post')
    if not re.fullmatch(r'/[A-Za-z0-9_]+/status/[0-9]+/?', source.path):
        raise ValueError('An indexed blog, profile or search page is not a discovered X post')
    source_url = 'https://x.com' + source.path.rstrip('/')
    resource = row.get('resource_url')
    if resource:
        target = urlparse(resource)
        if target.scheme != 'https' or target.username or target.password:
            raise ValueError('A resource must use a public HTTPS source')
        parts = target.path.strip('/').split('/')
        if target.hostname == 'github.com' and len(parts) >= 2 and all(re.fullmatch(r'[A-Za-z0-9_.-]+', x) for x in parts[:2]):
            resource = 'https://github.com/' + '/'.join(parts[:2])
        elif target.hostname == 'huggingface.co' and len(parts) >= 3 and parts[0] == 'datasets':
            resource = 'https://huggingface.co/' + '/'.join(parts[:3])
        else:
            raise ValueError('Unsupported canonical source; keep resource_url null until reviewed')
    query = row.get('query', '')
    if not isinstance(query, str) or not 1 <= len(query) <= 300:
        raise ValueError('Record the bounded public discovery query')
    return {'lead_id': (resource or source_url).casefold(), 'resource_url': resource,
            'status': 'needs-source-verification', 'coverage': 'web-index-partial',
            'provenance': [{'source': 'x-web-index', 'source_url': source_url,
                            'query': query, 'discovered_at': timestamp}]}


def ingest(root, rows, queries_attempted):
    if not isinstance(rows, list) or len(rows) > 50 or not 1 <= queries_attempted <= 12:
        raise ValueError('Use at most 50 leads and 12 queries per run')
    timestamp = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    incoming = [normalize_lead(row, timestamp) for row in rows]
    path = root/'data/discovery-leads.jsonl'
    previous = [json.loads(line) for line in path.read_text().splitlines() if line.strip()] if path.exists() else []
    records = {r['lead_id']: r for r in previous}
    added = 0
    for row in incoming:
        if row['lead_id'] not in records:
            records[row['lead_id']] = row
            added += 1
        else:
            prior = records[row['lead_id']]
            urls = {p['source_url'] for p in prior['provenance']}
            prior['provenance'] += [p for p in row['provenance'] if p['source_url'] not in urls]
    health_path = root/'state/x-discovery-health.json'
    prior_health = json.loads(health_path.read_text()) if health_path.exists() else {}
    health = {'source': 'x-web-index', 'status': 'limited', 'last_attempt': timestamp,
              'last_success': timestamp if incoming else prior_health.get('last_success'), 'queries_attempted': queries_attempted,
              'new_leads': added, 'coverage': 'web-index-partial',
              'note': 'No native X API coverage. Leads require canonical source verification before collection.'}
    for output, text in [(path, ''.join(json.dumps(r, ensure_ascii=False)+'\n' for r in records.values())),
                         (root/'state/x-discovery-health.json', json.dumps(health, indent=2)+'\n')]:
        output.parent.mkdir(parents=True, exist_ok=True)
        temporary = output.with_suffix(output.suffix+'.tmp')
        temporary.write_text(text)
        temporary.replace(output)
    return health


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True, help='JSON array of actual public post leads; an empty array is valid')
    parser.add_argument('--queries-attempted', type=int, required=True)
    args = parser.parse_args()
    print(json.dumps(ingest(ROOT, json.loads(args.input.read_text()), args.queries_attempted)))
