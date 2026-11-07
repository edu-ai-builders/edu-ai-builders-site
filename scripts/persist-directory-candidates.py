#!/usr/bin/env python3
"""CI-only checkpoint of allowlisted public metadata, never collector code/config.

Collection executes the default-branch checkout. A private Git index constructs a
normal fast-forward candidate commit whose tree uses that current code. Existing
candidate state is restored unless that path changed on main since its checkpoint.
No force push, automatic merge, deployment, cache dependency, or secret files.
"""
import argparse
import json
import os
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRANCH = 'automation/directory-candidates'
REF = 'refs/remotes/origin/' + BRANCH
CHECKPOINT = 'radar/state/cloud-checkpoint.json'
PROGRESS = ('radar/state/builder-discovery.json', 'radar/state/directory-discovery.json',
            'radar/state/discovery-lead-progress.json')
STATE = PROGRESS + ('radar/state/directory-last-run.json', 'radar/state/discovery-health.json')
DATA = ('radar/data/registry.jsonl', 'radar/data/skills.jsonl',
        'radar/data/discovery-leads.jsonl',
        'radar/data/education-resources.json', 'radar/data/builder-resources.json',
        'radar/data/builder-index.json', 'radar/data/discovery-feed.json',
        'public/data/radar/catalog.json', 'public/data/builder/index.json',
        'public/data/builder/resources.json', 'public/data/builder/discovery.json')


def command(args, *, check=True, **kwargs):
    return subprocess.run(args, cwd=ROOT, check=check, capture_output=True, **kwargs)


def git(*args, **kwargs):
    return command(['git', *args], **kwargs)


def blob(ref, path):
    result = git('show', ref + ':' + path, check=False)
    return result.stdout if result.returncode == 0 else None


def safe_path(name):
    path = ROOT/name
    for parent in [path, *path.parents]:
        if parent == ROOT:
            break
        if parent.is_symlink():
            raise ValueError('Candidate files must not be symlinks: ' + name)
    if not path.resolve().is_relative_to(ROOT.resolve()):
        raise ValueError('Candidate path escaped repository: ' + name)
    return path


def validate(name, value):
    if name.endswith('.jsonl'):
        for line in value.splitlines():
            if line.strip():
                json.loads(line)
    else:
        json.loads(value)


def changed_on_main(previous, current):
    if not previous:
        return set()
    result = git('diff', '--name-only', previous, current, '--', *STATE, *DATA)
    return set(result.stdout.decode().splitlines())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['restore', 'persist'])
    parser.add_argument('--state-only', action='store_true')
    args = parser.parse_args()
    if os.getenv('GITHUB_ACTIONS') != 'true':
        parser.error('Only runs inside the reviewed GitHub Actions workflow; no local git mutations.')
    base = git('rev-parse', 'HEAD').stdout.decode().strip()
    if args.mode == 'restore':
        remote = git('ls-remote', '--exit-code', '--heads', 'origin', 'refs/heads/' + BRANCH, check=False)
        if remote.returncode == 2:
            print('No cloud checkpoint yet; starting from default-branch data.')
            return 0
        remote.check_returncode()
        git('fetch', '--no-tags', 'origin', 'refs/heads/' + BRANCH + ':' + REF)
    previous = blob(REF, CHECKPOINT)
    checkpoint = json.loads(previous) if previous else {}
    changed = changed_on_main(checkpoint.get('base_sha'), base)
    if args.mode == 'restore':
        for name in STATE + DATA:
            value = blob(REF, name)
            if value is not None and name not in changed:
                validate(name, value)
                path = safe_path(name)
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(value)
        print('Restored cloud cursor and candidates; current main changes take precedence.')
        return 0

    old = git('rev-parse', '--verify', REF, check=False)
    old_sha = old.stdout.decode().strip() if old.returncode == 0 else None
    checkpoint_path = safe_path(CHECKPOINT)
    checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
    checkpoint_path.write_text(json.dumps({'base_sha': base, 'run_id': os.getenv('GITHUB_RUN_ID')}) + '\n')
    with tempfile.TemporaryDirectory() as directory:
        env = dict(os.environ, GIT_INDEX_FILE=str(Path(directory)/'index'))
        git('read-tree', base, env=env)
        for name in STATE + DATA + (CHECKPOINT,):
            if args.state_only and name in DATA + PROGRESS:
                # Data and progress are one checkpoint: an export failure must
                # retry observations whose newly written data was not retained.
                # Attempt/error health is retained separately in STATE.
                value = blob(REF, name) if old_sha and name not in changed else blob(base, name)
                if value is not None:
                    validate(name, value)
                    oid = git('hash-object', '-w', '--stdin', input=value).stdout.decode().strip()
                    git('update-index', '--add', '--cacheinfo', '100644', oid, name, env=env)
                continue
            path = safe_path(name)
            if path.exists():
                validate(name, path.read_bytes())
                git('add', '--force', '--', name, env=env)
        tree = git('write-tree', env=env).stdout.decode().strip()
        parents = ['-p', old_sha] if old_sha else []
        if base != old_sha:
            parents += ['-p', base]
        commit = git('commit-tree', tree, *parents, input=b'Checkpoint directory discovery candidates\n').stdout.decode().strip()
        git('push', 'origin', commit + ':refs/heads/' + BRANCH)
    if not args.state_only:
        existing = command(['gh', 'pr', 'list', '--state', 'open', '--head', BRANCH, '--json', 'number'])
        if not json.loads(existing.stdout):
            with tempfile.NamedTemporaryFile('w', suffix='.md') as body:
                body.write('Daily bounded GitHub discovery candidates and persistent queue state.\n\n'
                           'Review relevance, license evidence, and health before merging. '
                           'Code-search capability is observed, not assumed. X is not configured. '
                           'This workflow does not merge or deploy.\n')
                body.flush()
                command(['gh', 'pr', 'create', '--base', os.environ['DIRECTORY_DEFAULT_BRANCH'],
                         '--head', BRANCH, '--title', 'Review directory discovery candidates', '--body-file', body.name])
    print('Candidate checkpoint saved; human review/merge required for website publication.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
