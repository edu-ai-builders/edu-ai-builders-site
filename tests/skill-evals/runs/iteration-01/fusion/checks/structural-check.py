from pathlib import Path
import hashlib, json, re
root=Path(__file__).resolve().parents[1]
pkg=root/'family-math-product-plan'
checks=[]
def check(label,condition):
    assert condition,label
    checks.append(label)
text=(pkg/'SKILL.md').read_text()
check('frontmatter delimited',text.startswith('---\n') and '\n---\n' in text[4:])
front=text.split('---',2)[1]
check('required name and description',bool(re.search(r'^name: family-math-product-plan$',front,re.M)) and bool(re.search(r'^description: .+',front,re.M)))
check('version and MIT metadata','version: "0.1.0"' in front and 'license: MIT' in front)
for dest in re.findall(r'\[[^\]]+\]\(([^)]+)\)',text):
    check('relative reference '+dest,(pkg/dest).is_file())
for filename in ['SOURCES.md','MAINTENANCE.md','LICENSE','ACCEPTANCE.md']:
    check('package record '+filename,(pkg/filename).is_file())
check('MIT original copyright preserved','Copyright (c) 2026 Edu AI Builders contributors' in (pkg/'LICENSE').read_text())
workload=(root/'WorkloadSpec.md').read_text()
for field in ['purpose','triggers','exclusions','inputs','outputs','required_constraints','preferences','precedence','available_tools','delegation','change_scope','context_budget','acceptance_examples']:
    check('WorkloadSpec '+field,field in workload)
for path, expected in json.loads((root/'checks/input-manifest.json').read_text()).items():
    check('source unchanged '+str(Path(path).parent.name)+'/'+Path(path).name,hashlib.sha256(Path(path).read_bytes()).hexdigest()==expected)
for case in ['task-a-own-math.md','task-b-pdf-excerpt.md','task-c-missing-tool.md','task-d-out-of-scope.md']:
    check('walkthrough output '+case,(root/'checks'/case).is_file())
check('ordered results exist',all((root/'sequential-request'/f).is_file() for f in ['01-evidence-search-result.md','02-lesson-planner-result.md']))
check('ordered request did not generate skill',not list((root/'sequential-request').rglob('SKILL.md')))
result={'category':'structural validation, not executable product behavior','passed':len(checks),'checks':checks}
(root/'checks/structural-result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'passed':len(checks),'category':result['category']},ensure_ascii=False))
