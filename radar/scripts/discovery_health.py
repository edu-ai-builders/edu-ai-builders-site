#!/usr/bin/env python3
"""Record observed discovery health; an offline export is never a search success."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def now():
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')


def read(path):
    return json.loads(path.read_text()) if path.exists() else {}


def write(root, value):
    path = root/'state/discovery-health.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)
    return value


def collection_status(observations, errors, validation_failed):
    exportable = observations > 0 and not validation_failed
    return {'exportable': exportable, 'fatal': not exportable,
            'status': 'partial' if errors or not exportable else 'complete'}


def record_start(root, timestamp, run_id):
    health = read(root/'state/discovery-health.json')
    health.update({'schema_version': 1, 'last_attempt_at': timestamp,
                   'last_run_id': run_id, 'status': 'running', 'fatal': True,
                   'errors': [{'error': 'Attempt has not finished; interrupted runs are not successful.'}]})
    return write(root, health)


def record_attempt(root, summary):
    health = read(root/'state/discovery-health.json')
    timestamp = summary['finished_at']
    status = 'fatal' if summary.get('fatal') else summary['status']
    health.update({'schema_version': 1, 'last_attempt_at': summary.get('started_at', timestamp),
                   'last_finished_at': timestamp,
                   'last_run_id': summary['run_id'], 'status': status,
                   'observed_successes': summary.get('observed_successes', 0),
                   'new_observations': summary.get('new_observations', 0),
                   'fatal': summary.get('fatal', False), 'errors': summary.get('errors', []),
                   'expected_interval_hours': 24, 'max_age_hours': 48})
    if summary.get('observed_successes', 0) > 0:
        health['last_success_at'] = timestamp
    if summary.get('new_observations', 0) > 0:
        health['last_new_observation_at'] = timestamp
    if summary['status'] == 'complete':
        health['last_complete_at'] = timestamp
    builder = summary.get('builder_discovery') or {}
    health['coverage_bounds'] = builder.get('coverage_bounds', {})
    capabilities = {}
    for query in builder.get('queries', []):
        kind = query['kind']
        current = capabilities.get(kind)
        if query['status'] != 'complete' or current != 'failed':
            capabilities[kind] = query['status']
    health['sources'] = {'github': {'status': status,
        'authenticated': summary.get('authenticated', False), 'search_capabilities': capabilities},
        'x': read(root/'state/x-discovery-health.json') or {
            'status': 'not-configured', 'reason': 'No authenticated X discovery worker or authorized API budget configured.'}}
    return write(root, health)


def record_export(root, *, offline=False):
    health = read(root/'state/discovery-health.json')
    health.update({'schema_version': 1, 'last_export_at': now(),
                   'last_export_mode': 'offline' if offline else 'after-collection',
                   'last_export_status': 'complete'})
    return write(root, health)


def evaluate(root, *, timestamp=None, max_age_hours=48):
    health = read(root/'state/discovery-health.json')
    timestamp = timestamp or datetime.now(timezone.utc)
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    last = health.get('last_success_at')
    age = None
    if last:
        age = (timestamp - datetime.fromisoformat(last.replace('Z', '+00:00'))).total_seconds()/3600
    stale = age is None or age > max_age_hours
    health.update({'checked_at': timestamp.isoformat(), 'age_hours': age,
                   'max_age_hours': max_age_hours, 'stale': stale,
                   'healthy': not stale and not health.get('fatal', False),
                   'network_success_basis': 'valid GitHub resource/search observations, including unchanged responses; not export time',
                   'coverage_complete': (health.get('sources', {}).get('x', {}).get('status') == 'complete'),
                   'publication': 'candidate branch requires human review/merge; no automatic deployment'})
    sources = health.setdefault('sources', {})
    sources.setdefault('github', {'status': 'not-observed'})
    sources['x'] = read(root/'state/x-discovery-health.json') or sources.get('x') or {'status': 'not-configured'}
    sources['x']['native_api_connected'] = (sources['x'].get('coverage') == 'native-api'
                                            and sources['x'].get('status') == 'complete')
    health['coverage_complete'] = sources['github'].get('status') == 'complete' and sources['x'].get('status') == 'complete'
    return health


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--max-age-hours', type=float, default=48)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    if args.max_age_hours <= 0:
        parser.error('--max-age-hours must be positive')
    health = evaluate(args.root, max_age_hours=args.max_age_hours)
    rendered = json.dumps(health, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        args.output.write_text(rendered)
    print(rendered, end='')
    return 0 if health['healthy'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
