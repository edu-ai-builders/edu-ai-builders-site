#!/usr/bin/env python3
"""Bounded, read-only source inventory and evidence verification. Python standard library."""
import argparse
import hashlib
import json
import os
import subprocess
from pathlib import Path

SKIP_DIRS = {'.git', 'node_modules', '.next', '__pycache__', '.venv', 'venv', 'dist', 'build', 'coverage'}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def inside(root, relative):
    if not isinstance(relative, str) or not relative or Path(relative).is_absolute():
        raise ValueError('Evidence paths must be relative')
    path = root / relative
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError('Path leaves source root')
    # Do not silently follow even an internal symlink: it can change scope later.
    if any(p.is_symlink() for p in [path, *path.parents] if p.is_relative_to(root)):
        raise ValueError('Symlink evidence requires explicit source handling')
    return path

def git_state(root):
    def run(*args):
        p = subprocess.run(['git', '-C', str(root), *args], capture_output=True, text=True, timeout=5)
        return p.stdout.strip() if p.returncode == 0 else None
    try:
        top = run('rev-parse', '--show-toplevel')
        if not top:
            return {'revision': None, 'state': 'no-git-metadata'}
        return {'repository_root': top, 'source_prefix': str(root.relative_to(Path(top).resolve())),
                'revision': run('rev-parse', 'HEAD'), 'worktree_status': run('status', '--porcelain', '--', '.'),
                'state': 'working-tree-observation'}
    except (OSError, subprocess.TimeoutExpired, ValueError):
        return {'revision': None, 'state': 'git-metadata-unavailable'}

def inventory(root, queries=(), paths=('.',), max_files=300, max_bytes=2000000, max_file_bytes=256000, max_matches=60):
    root = Path(root).resolve()
    if not root.is_dir():
        raise ValueError('Source root is not a directory')
    if min(max_files, max_bytes, max_file_bytes, max_matches) < 1:
        raise ValueError('Budgets must be positive')
    records, skipped, seen = [], [], set()
    total_bytes = match_count = 0
    stopped = None
    matches_complete = True
    def candidates():
        for relative in paths:
            selected = root if relative == '.' else inside(root, relative)
            if selected.is_file():
                yield selected
            elif selected.is_dir():
                for current, dirs, files in os.walk(selected, followlinks=False):
                    keep = []
                    for name in sorted(dirs):
                        p = Path(current) / name
                        if name in SKIP_DIRS or p.is_symlink():
                            skipped.append({'path': str(p.relative_to(root)), 'reason': 'excluded-directory-or-symlink'})
                        else:
                            keep.append(name)
                    dirs[:] = keep
                    for name in sorted(files):
                        yield Path(current) / name
            else:
                skipped.append({'path': relative, 'reason': 'missing'})
    for path in candidates():
        rel = str(path.relative_to(root))
        if rel in seen:
            continue
        seen.add(rel)
        if len(seen) > max_files:
            stopped = 'max-files'; break
        try:
            path = inside(root, rel)
            if not path.is_file():
                skipped.append({'path': rel, 'reason': 'not-regular-file'}); continue
            size = path.stat().st_size
            if size > max_file_bytes:
                skipped.append({'path': rel, 'reason': 'max-file-bytes'}); continue
            if total_bytes + size > max_bytes:
                stopped = 'max-bytes'; break
            raw = path.read_bytes()
            total_bytes += len(raw)
            if b'\x00' in raw:
                skipped.append({'path': rel, 'reason': 'binary'}); continue
            text = raw.decode('utf-8')
            hits = []
            for number, line in enumerate(text.splitlines(), 1):
                terms = [q for q in queries if q.casefold() in line.casefold()]
                if terms:
                    if match_count < max_matches:
                        hits.append({'line': number, 'queries': terms, 'text': line[:300], 'excerpt_truncated': len(line) > 300})
                        match_count += 1
                    else:
                        matches_complete = False
            records.append({'path': rel, 'sha256': digest(raw), 'bytes': len(raw), 'lines': len(text.splitlines()), 'matches': hits})
        except (OSError, ValueError, UnicodeDecodeError) as error:
            skipped.append({'path': rel, 'reason': type(error).__name__})
    return {'schema_version': 'edu.repo-snapshot.v1', 'root': str(root), 'git': git_state(root),
            'scope': {'paths': list(paths), 'literal_queries': list(queries), 'max_files': max_files, 'max_bytes': max_bytes, 'max_file_bytes': max_file_bytes, 'max_matches': max_matches},
            'coverage': {'enumeration_complete': stopped is None, 'stop_reason': stopped, 'matches_complete': matches_complete, 'read_bytes': total_bytes, 'visited_files': min(len(seen), max_files)},
            'files': records, 'skipped': skipped, 'runtime_tested': False}

def _verify(handoff, roots):
    errors = []
    if handoff.get('schema_version') != 'edu.repo-handoff.v1':
        errors.append('Unknown handoff schema')
    if handoff.get('mode') not in {'extract', 'refactor', 'redesign', 'compare'}:
        errors.append('Invalid adaptation mode')
    capabilities = handoff.get('capabilities')
    if not isinstance(capabilities, list) or not capabilities:
        return errors + ['At least one capability is required']
    for index, capability in enumerate(capabilities):
        tag = f'capabilities[{index}]'
        if not isinstance(capability, dict):
            errors.append(f'{tag}: expected object'); continue
        for field in ['requirement', 'decision', 'reason']:
            if not isinstance(capability.get(field), str) or not capability[field].strip():
                errors.append(f'{tag}: missing {field}')
        if capability.get('decision') not in {'reuse', 'adapter', 'change', 'rewrite', 'reject', 'unresolved'}:
            errors.append(f'{tag}: invalid decision')
        for field in ['retained', 'changed', 'unknowns', 'acceptance']:
            if not isinstance(capability.get(field), list):
                errors.append(f'{tag}: {field} must be a list')
        if not capability.get('acceptance'):
            errors.append(f'{tag}: acceptance is empty')
        evidence = capability.get('evidence', [])
        if not isinstance(evidence, list):
            errors.append(f'{tag}: evidence must be a list'); continue
        if not evidence and capability.get('decision') not in {'unresolved', 'reject'}:
            errors.append(f'{tag}: implementation decisions require source evidence')
        for item in evidence:
            try:
                if not isinstance(item, dict):
                    raise ValueError('expected evidence object')
                if item.get('type') != 'source-observation':
                    raise ValueError('Only source-observation is validated by this helper')
                if item.get('repository') not in roots:
                    raise ValueError('Unknown source root')
                raw = inside(Path(roots[item['repository']]).resolve(), item.get('path')).read_bytes()
                if item.get('sha256') != digest(raw):
                    raise ValueError('Source hash mismatch; re-inspect before reusing evidence')
                lines = raw.decode('utf-8').splitlines()
                start, end = item.get('line_start'), item.get('line_end')
                if type(start) is not int or type(end) is not int or not 1 <= start <= end <= len(lines):
                    raise ValueError('Invalid source line range')
                if not isinstance(item.get('quote'), str) or not item['quote'].strip() or item['quote'] not in '\n'.join(lines[start-1:end]):
                    raise ValueError('Quoted evidence does not occur at the supplied lines')
            except (OSError, ValueError, UnicodeDecodeError) as error:
                errors.append(f'{tag}: {error}')
    if handoff.get('runtime_tested') is True and not any(isinstance(c,dict) and c.get('status') in {'passed','failed'} and c.get('command') and c.get('observed_result') for c in (handoff.get('verification',[]) if isinstance(handoff.get('verification'),list) else [])):
        errors.append('runtime_tested requires an observed executed check')
    if not isinstance(handoff.get('verification'), list):
        errors.append('verification must explicitly list performed and unrun checks')
    else:
        for check in handoff['verification']:
            if not isinstance(check, dict) or check.get('status') not in {'passed', 'failed', 'not-run', 'blocked'} or not check.get('method'):
                errors.append('Invalid verification entry')
            elif check['status'] in {'passed', 'failed'} and (not check.get('command') or not check.get('observed_result')):
                errors.append('Executed checks need command and observed_result; this helper does not run them')
    return errors

def verify(handoff, roots):
    try:
        if not isinstance(handoff,dict):
            return ["Handoff must be an object"]
        return _verify(handoff,roots)
    except (TypeError,AttributeError,ValueError) as error:
        return [f"Malformed handoff: {error}"]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    scan = commands.add_parser('inventory')
    scan.add_argument('root'); scan.add_argument('--query', action='append', default=[])
    scan.add_argument('--path', action='append', default=[])
    for name, value in [('max-files', 300), ('max-bytes', 2000000), ('max-file-bytes', 256000), ('max-matches', 60)]:
        scan.add_argument('--'+name, type=int, default=value)
    scan.add_argument('--output')
    check = commands.add_parser('verify')
    check.add_argument('handoff'); check.add_argument('--repo', action='append', required=True, help='source-id=/absolute/root')
    args = parser.parse_args()
    try:
        if args.command == 'inventory':
            result = inventory(args.root, args.query, args.path or ['.'], args.max_files, args.max_bytes, args.max_file_bytes, args.max_matches)
            value = json.dumps(result, ensure_ascii=False, indent=2)+'\n'
            if args.output:
                Path(args.output).write_text(value, encoding='utf-8')
            else:
                print(value, end='')
            return 0
        roots = dict(pair.split('=', 1) for pair in args.repo)
        value = json.loads(Path(args.handoff).read_text(encoding='utf-8'))
        if not isinstance(value, dict):
            raise ValueError('Handoff must be an object')
        errors = verify(value, roots)
        print(json.dumps({'valid': not errors, 'errors': errors, 'claim': 'source grounding and record structure only; no runtime or integration proof'}, ensure_ascii=False))
        return int(bool(errors))
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(json.dumps({'valid': False, 'error': str(error)}, ensure_ascii=False))
        return 2
if __name__ == '__main__':
    raise SystemExit(main())
