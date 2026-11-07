#!/usr/bin/env python3
"""Check a fusion record against explicitly supplied source and output roots. No model calls."""
import argparse
import hashlib
import json
import re
from pathlib import Path

DECISIONS = {'keep', 'transform', 'delegate', 'reference', 'remove', 'independent'}

def bounded(root, relative):
    root = Path(root).resolve()
    if not isinstance(relative, str) or not relative or Path(relative).is_absolute():
        raise ValueError('Expected relative file path')
    path = root / relative
    if not path.resolve().is_relative_to(root):
        raise ValueError('Path leaves permitted root')
    if any(p.is_symlink() for p in [path, *path.parents] if p.is_relative_to(root)):
        raise ValueError('Symlink files require explicit handling')
    return path

def sha(path):
    if path.stat().st_size > 1000000:
        raise ValueError('File exceeds 1 MB inspection budget')
    return hashlib.sha256(path.read_bytes()).hexdigest()

def _check(record, package, source_roots):
    errors, drift = [], []
    package = Path(package).resolve()
    if not isinstance(record, dict) or record.get('schema_version') != 'edu.fusion-record.v1':
        return ['Unknown fusion schema'], []
    if record.get('readiness') not in {'draft', 'usable', 'blocked'}:
        errors.append('Invalid readiness')
    workload = record.get('workload', {})
    if not isinstance(workload, dict):
        return ['workload must be an object'], []
    for field in ['purpose', 'trigger']:
        if not isinstance(workload.get(field), str) or not workload[field].strip():
            errors.append(f'Missing workload {field}')
    for field in ['exclusions', 'inputs', 'outputs', 'constraints', 'precedence']:
        if not isinstance(workload.get(field), list) or not workload[field]:
            errors.append(f'workload.{field} must be a nonempty list')
    constraints = workload.get('constraints', [])
    requirements = set()
    for value in constraints if isinstance(constraints, list) else []:
        if not isinstance(value, dict) or not isinstance(value.get('id'), str) or not value['id'] or value.get('level') not in {'hard', 'preference'} or not value.get('requirement'):
            errors.append('Constraints need id, hard/preference level and requirement')
        elif value['id'] in requirements:
            errors.append('Duplicate constraint id')
        else:
            requirements.add(value['id'])
    sources = {}
    raw_sources = record.get('sources', [])
    if not isinstance(raw_sources, list):
        errors.append('sources must be a list'); raw_sources = []
    for source in raw_sources:
        if not isinstance(source, dict) or not isinstance(source.get('id'), str) or not source['id'] or source['id'] in sources:
            errors.append('Invalid or duplicate source id'); continue
        sid = source['id']; sources[sid] = source
        if source.get('state') not in {'full-method', 'metadata-only', 'unavailable'}:
            errors.append(f'{sid}: invalid source-read state')
        reuse = source.get('reuse', {})
        if not isinstance(reuse, dict) or reuse.get('permission') not in {'redistributable', 'link-only', 'unknown'} or not reuse.get('scope'):
            errors.append(f'{sid}: missing scoped reuse observation')
        files = source.get('files', [])
        if not isinstance(files, list):
            errors.append(f'{sid}: files must be a list'); continue
        if source.get('state') == 'full-method' and (not files or 'version' not in source):
            errors.append(f'{sid}: full method needs an explicit observed version (or null) and inspected files')
        if files and sid not in source_roots:
            errors.append(f'{sid}: supply explicit source root to verify files'); continue
        seen = set()
        for file in files:
            try:
                if not isinstance(file, dict) or file.get('path') in seen:
                    raise ValueError('Invalid or duplicate source file')
                seen.add(file.get('path'))
                path = bounded(source_roots[sid], file.get('path'))
                if not re.fullmatch(r'[a-f0-9]{64}', file.get('sha256', '')):
                    raise ValueError('Invalid source SHA-256')
                if sha(path) != file['sha256']:
                    drift.append({'source_id': sid, 'path': file['path']})
            except (OSError, ValueError, TypeError) as error:
                errors.append(f'{sid}: {error}')
    decisions = record.get('decisions', [])
    if not isinstance(decisions, list) or not decisions:
        errors.append('At least one fusion decision is required'); decisions = []
    used_ids = set()
    for decision in decisions:
        if not isinstance(decision, dict):
            errors.append('Decision must be an object'); continue
        did = decision.get('id', '?'); action = decision.get('decision'); sid = decision.get('source_id')
        if not isinstance(did, str) or did == '?' or did in used_ids:
            errors.append('Decision IDs must be unique nonempty strings')
        used_ids.add(did)
        if action not in DECISIONS or not decision.get('method') or not decision.get('reason'):
            errors.append(f'{did}: missing method, valid action or workload-specific reason')
        refs = decision.get('requirement_ids', [])
        if not isinstance(refs, list) or not refs or any(not isinstance(r,str) or r not in requirements for r in refs):
            errors.append(f'{did}: requirements must resolve to workload constraints')
        source = sources.get(sid) if isinstance(sid,str) else None
        if action == "independent" and sid is not None:
            errors.append(f"{did}: independent authorship must not claim an upstream source method")
        if action != 'independent' and source is None:
            errors.append(f'{did}: unknown source')
        if action in {'keep', 'transform'} and source:
            if source.get('state') != 'full-method':
                errors.append(f'{did}: summaries are insufficient for fusion')
            if source.get('reuse', {}).get('permission') != 'redistributable':
                errors.append(f'{did}: cannot redistribute unpermitted source methods')
        if action == 'delegate' and (not decision.get('condition') or not decision.get('fallback')):
            errors.append(f'{did}: delegation needs availability condition and fallback')
        targets = decision.get('targets', [])
        if not isinstance(targets, list) or (action not in {'remove', 'reference'} and not targets):
            errors.append(f'{did}: output targets are required'); continue
        for target in targets:
            try:
                if not bounded(package, target).is_file():
                    raise ValueError('Target file is missing')
            except (OSError, ValueError) as error:
                errors.append(f'{did}: {error}')
    conflicts = record.get('conflicts')
    if not isinstance(conflicts, list):
        errors.append('conflicts must explicitly record resolved and unresolved conflicts')
    else:
        for conflict in conflicts:
            if not isinstance(conflict, dict) or conflict.get('status') not in {'resolved', 'unresolved'} or not conflict.get('resolution'):
                errors.append('Invalid conflict record')
            elif conflict['status'] == 'unresolved' and record.get('readiness') == 'usable':
                errors.append('Unresolved blocking conflicts cannot be marked usable')
    maps = record.get('upstream_map', [])
    mapped = set()
    if not isinstance(maps, list):
        errors.append('upstream_map must be a list'); maps = []
    for link in maps:
        if not isinstance(link, dict) or link.get('source_id') not in sources or not link.get('review_when') or not isinstance(link.get('decision_ids'), list) or not link['decision_ids'] or any(d not in used_ids for d in link['decision_ids']):
            errors.append('Upstream map must resolve source and decision IDs')
        else:
            mapped.add(link['source_id'])
    required_map = {d.get('source_id') for d in decisions if isinstance(d, dict) and isinstance(d.get('source_id'),str) and d.get('decision') in {'keep', 'transform', 'delegate'}}
    if not required_map.issubset(mapped):
        errors.append('Missing upstream review map for retained/transformed/delegated method')
    cases = record.get('acceptance_cases', [])
    if not isinstance(cases, list) or not cases:
        errors.append('At least one acceptance case is required'); cases = []
    for case in cases:
        if not isinstance(case, dict) or not case.get('id') or not case.get('prompt') or not case.get('expected_behaviors') or case.get('kind') not in {'normal', 'boundary', 'non-trigger'} or case.get('status') not in {'passed', 'failed', 'not-run', 'blocked'}:
            errors.append('Invalid acceptance case'); continue
        if case['status'] in {'passed', 'failed'}:
            if case.get('method') not in {'walkthrough', 'independent-agent', 'executable'} or not case.get('observed_result') or not case.get('result_path'):
                errors.append('Run cases need method, observed result and a result artifact')
            else:
                try:
                    if not bounded(package, case['result_path']).is_file():
                        errors.append('Case result artifact missing')
                except (OSError, ValueError) as error:
                    errors.append(str(error))
            if case.get('method') == 'executable' and not case.get('command'):
                errors.append('Executable case needs the actual command')
    skill = package / 'SKILL.md'
    try:
        content = skill.read_text(encoding='utf-8')
        if not content.startswith('---\n'):
            errors.append('SKILL.md needs YAML frontmatter')
        # Check local Markdown links, not prose or semantic task quality.
        for target in re.findall(r'\[[^\]]*\]\(([^)\s]+)\)', content):
            if target.startswith(('https://', 'http://', '#')):
                continue
            if not bounded(package, target.split('#', 1)[0]).is_file():
                errors.append(f'SKILL.md links to missing file: {target}')
    except (OSError, ValueError, UnicodeDecodeError) as error:
        errors.append(f'Invalid generated skill: {error}')
    for change in drift:
        change['affected_decision_ids'] = [d.get('id') for d in decisions if isinstance(d, dict) and d.get('source_id') == change['source_id']]
    return errors, drift

def check(record, package, source_roots):
    try:
        return _check(record, package, source_roots)
    except (TypeError, AttributeError, ValueError) as error:
        return [f"Malformed record: {error}"], []

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('record'); parser.add_argument('--package', required=True)
    parser.add_argument('--source', action='append', default=[], help='source-id=/absolute/path')
    args = parser.parse_args()
    try:
        roots = dict(pair.split('=', 1) for pair in args.source)
        record = json.loads(Path(args.record).read_text(encoding='utf-8'))
        errors, drift = check(record, args.package, roots)
        print(json.dumps({'valid': not errors and not drift, 'errors': errors, 'source_drift': drift,
                          'claim': 'provenance and record consistency only; manual/agent task quality is evaluated separately'}, ensure_ascii=False, indent=2))
        return int(bool(errors or drift))
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(json.dumps({'valid': False, 'error': str(error)}, ensure_ascii=False)); return 2
if __name__ == '__main__':
    raise SystemExit(main())
