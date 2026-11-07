#!/usr/bin/env python3
"""Collect, review and export the Edu AI Builders directory in one local workflow."""
import argparse
import fcntl
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--offline', action='store_true', help='Review and export retained evidence without network verification')
    args = parser.parse_args()
    radar = ROOT/'radar'
    with (radar/'state/website-directory.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            parser.exit(2, 'Another website directory refresh is running.\n')
        if not args.offline:
            result = subprocess.run([sys.executable, str(radar/'scripts/update_directory.py'),
                                     '--refresh-limit', '30', '--discover', '--collect-builder-skills'], cwd=ROOT)
            if result.returncode:
                return result.returncode
        with (radar/'state/directory-update.lock').open('a') as source_lock:
            try:
                fcntl.flock(source_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                parser.exit(2, 'Another collector is running; website export skipped.\n')
            commands = [[radar/'scripts/build_site.py'], [radar/'scripts/build_skills_site.py'],
                        [radar/'scripts/build_builder_index.py', '--build'], [ROOT/'scripts/sync-directory.py']]
            for command in commands:
                result = subprocess.run([sys.executable, *map(str, command)], cwd=ROOT)
                if result.returncode:
                    return result.returncode
            sys.path.insert(0, str(radar/'scripts'))
            from discovery_health import record_export
            record_export(radar, offline=args.offline)
    print('Local directory exported. No commit, push or deployment performed.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
