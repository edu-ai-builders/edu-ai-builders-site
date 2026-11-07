"""Reversible metadata review for the Edu AI Builders public resource directory."""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import date, datetime, timezone
import json
from pathlib import Path
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


def load_policy(root=ROOT):
    path = Path(root) / 'config/resource-review.json'
    return json.loads(path.read_text()) if path.exists() else {}


def review_resource(record, policy=None, now=None):
    policy = load_policy() if policy is None else policy
    if now is None:
        today = datetime.now(timezone.utc).date()
    elif isinstance(now, datetime):
        today = now.date()
    elif isinstance(now, date):
        today = now
    else:
        today = date.fromisoformat(str(now)[:10])
    source = record.get('source_repository') or {}
    repository = record.get('full_name') or source.get('full_name') or ''
    if not repository:
        url = record.get('repository_url') or record.get('source_url') or ''
        parts = urlparse(url).path.strip('/').split('/')
        if len(parts) >= 2:
            repository = '/'.join(parts[:2])
    key = record.get('resource_id') or record.get('skill_key') or record.get('record_key') or ''
    overrides = policy.get('overrides', {})
    override = overrides.get(key.casefold()) or overrides.get(repository.casefold())
    verified = record.get('verification_status')
    pushed = record.get('pushed_at') or source.get('pushed_at') or record.get('pushedAt')
    try:
        inactive = (today - date.fromisoformat(pushed[:10])).days > policy.get('inactive_software_days', 1095)
    except (TypeError, ValueError):
        inactive = False
    archived = bool(record.get('archived') or source.get('archived'))
    activity = 'archived' if archived else 'inactive' if inactive else 'active' if pushed else 'unknown'
    result = {'status': 'review', 'reasons': [], 'evidence': [], 'evidence_level': 'metadata',
              'policy_version': policy.get('policy_version', 'unconfigured'),
              'evaluated_at': today.isoformat(), 'reviewed_at': None, 'activity': activity}
    url = record.get('html_url') or source.get('html_url') or record.get('repository_url') or record.get('source_url')
    if url:
        result['evidence'].append(url)
    if verified == 'missing':
        return result | {'status': 'exclude', 'reasons': ['last-source-observation-unavailable']}
    if verified in {'unverified', 'error'}:
        return result | {'reasons': ['source-verification-needed']}
    if override:
        decision = {'status': override['status'], 'reasons': override['reasons'],
                         'evidence': override.get('evidence', result['evidence']),
                         'evidence_level': 'editorial-metadata-review',
                         'reviewed_at': override.get('reviewed_at')}
        reviewed_at = override.get('reviewed_at')
        if override['status'] == 'include' and reviewed_at:
            age = (today - date.fromisoformat(reviewed_at)).days
            if age > policy.get('editorial_review_days', 180):
                decision.update(status='review', reasons=['editorial-review-expired'])
                return result | decision
        if override.get('reviewed_commit') and record.get('pinned_commit') and override['reviewed_commit'] != record['pinned_commit']:
            decision.update(status='review', reasons=['reviewed-source-version-changed'])
            return result | decision
        if override.get('replacement_url'):
            decision['replacement_url'] = override['replacement_url']
        manifest = record.get('manifest_url') or record.get('source_url') or ''
        pinned = re.fullmatch(r'[0-9a-f]{40}', record.get('pinned_commit') or '') or re.search(r'/blob/[0-9a-f]{40}/', manifest)
        is_skill = bool(record.get('skill_key')) or key.startswith('github-skill:') or record.get('artifact_kind') == 'skill' or record.get('kind') == 'skill'
        if 'deprecated-catalog-use-current-source' in override['reasons'] and is_skill and pinned:
            decision.update(status='include', reasons=['pinned-skill-from-deprecated-catalog'])
            decision['evidence'] = [manifest or url, *decision['evidence']]
        return result | decision
    name = record.get('skill_name') or repository.rpartition('/')[2] or record.get('title') or record.get('name') or ''
    text = ' '.join([name, record.get('description') or '', ' '.join(record.get('topics') or [])])
    matches = [label for label, pattern in policy.get('scope_signals', {}).items()
               if re.search(pattern, text, re.IGNORECASE)]
    artifact = record.get('artifact_kind')
    stable = artifact in {'dataset', 'benchmark', 'knowledge', 'index'}
    if artifact not in {'application', 'library', 'skill'}:
        stable = stable or bool(policy.get('stable_material_signal') and
                                re.search(policy['stable_material_signal'], text, re.IGNORECASE))
    runtime = artifact in {'application', 'library', 'skill'} or bool(record.get('skill_key'))
    runtime = runtime or bool(policy.get('runtime_signal') and
                              re.search(policy['runtime_signal'], text, re.IGNORECASE))
    if archived and runtime and not stable:
        return result | {'status': 'exclude', 'reasons': ['archived-runtime-software']}
    if archived and not stable:
        return result | {'reasons': ['archived-artifact-needs-review']}
    if not matches:
        return result | {'reasons': ['reuse-role-not-evidenced']}
    if inactive and runtime and not stable:
        return result | {'reasons': ['inactive-software-needs-runtime-check']}
    reasons = ['scope-' + label for label in matches]
    if stable and (inactive or archived):
        reasons.append('stable-material-age-not-a-rejection')
    return result | {'status': 'include', 'reasons': reasons}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--date', type=date.fromisoformat, help='Evaluation date as YYYY-MM-DD for reproducible audits')
    parser.add_argument('--output', type=Path, help='Optional review report; canonical registries are never changed')
    args = parser.parse_args()
    policy = load_policy(args.root)
    records = []
    for collection in ('registry', 'skills'):
        rows = [json.loads(line) for line in (args.root / f'data/{collection}.jsonl').read_text().splitlines() if line.strip()]
        for row in rows:
            review = review_resource(row, policy, args.date)
            key = row.get('record_key') or row.get('skill_key') or row.get('resource_id')
            records.append({'resource_id': key, 'collection': collection,
                            'title': row.get('full_name') or row.get('skill_name') or row.get('name'),
                            'review': review})
    summary = {name: dict(Counter(row['review']['status'] for row in records if row['collection'] == name))
               for name in ('registry', 'skills')}
    report = {'policy_version': policy.get('policy_version'), 'count': len(records), 'counts': summary,
              'reason_counts': dict(Counter(reason for row in records for reason in row['review']['reasons'])),
              'records': records}
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key: value for key, value in report.items() if key != 'records'}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
