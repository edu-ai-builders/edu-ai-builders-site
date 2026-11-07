#!/usr/bin/env python3
"""Create reproducible ZIPs of first-party skills, excluding runtime/cache artifacts."""
import hashlib
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NAMES = ['edu-resource-search', 'edu-design-plan', 'edu-repo-adapter', 'edu-skill-fusion']

def package(folder, target):
    folder, target = Path(folder), Path(target)
    candidates = list(folder.rglob('*'))
    if any(p.is_symlink() for p in candidates):
        raise ValueError('Symlinks cannot enter distributed skills')
    files = sorted(p for p in candidates if p.is_file()
                   and not any(part in {'__pycache__', '.pytest_cache'} for part in p.relative_to(folder).parts)
                   and p.name != '.DS_Store' and p.suffix not in {'.pyc', '.pyo'})
    if not (folder/'SKILL.md').is_file() or not (folder/'LICENSE').is_file():
        raise ValueError('Missing skill or license')
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as archive:
        for file in files:
            if not file.resolve().is_relative_to(folder.resolve()):
                raise ValueError('External package file')
            entry = zipfile.ZipInfo(str(Path(folder.name)/file.relative_to(folder)), date_time=(1980, 1, 1, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, file.read_bytes())
    version = re.search(r'^\s+version: "([^"]+)"', (folder/'SKILL.md').read_text(), re.M)
    return {'version': version.group(1) if version else 'unversioned', 'name': folder.name,
            'archive': target.name, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'files': len(files)}

def main():
    out = ROOT/'public/downloads/skills'
    out.mkdir(parents=True, exist_ok=True)
    manifest = {'schema_version': 'edu.skill-packages.v1', 'version': '0.2.1', 'packages': []}
    for name in NAMES:
        manifest['packages'].append(package(ROOT/'packages/builder-skills'/name, out/f'{name}.zip'))
    manifest['examples'] = [package(ROOT/'packages/builder-skills/examples/family-math-workflow', out/'family-math-workflow-example.zip')]
    (out/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    print(json.dumps(manifest))

if __name__ == '__main__':
    main()
