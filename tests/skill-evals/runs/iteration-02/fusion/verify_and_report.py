from pathlib import Path
import json,hashlib,re,subprocess
root=Path('/private/tmp/edu-skill-evals-20261012');out=root/'candidate-fusion'
helper=root/'candidate/edu-skill-fusion/scripts/fusion_provenance.py'
packages=[out/'case-e/teacher-science-activity',out/'case-f/teacher-science-activity-conflict']
source_args=[]
for sid,folder in [('evidence','evidence-search'),('planner','lesson-planner'),('pdf','pdf-helper'),('premium','link-only')]: source_args += ['--source',sid+'='+str(root/'fixtures/skills'/folder)]
# Record validation is completed separately from semantic walkthrough status.
for p in packages:
 record=json.loads((p/'fusion-record.json').read_text());record['validation_notes'].update(provenance='passed: bundled helper, exit 0; record consistency/source identity only',application_runtime='not-run',benchmark='not-run',teaching_outcomes='not-run')
 if 'case-f' in str(p):
  record['validation_notes']['task_category']='walkthrough for conflict/preparation; full learner answer compliance blocked'
  sp=p/'references/sources-and-maintenance.md'
  sp.write_text(sp.read_text().replace('The case artifacts are task walkthroughs;','F cases check conflict handling and teacher-only preparation. Learner delivery is blocked. The case artifacts are task walkthroughs;'))
 (p/'fusion-record.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
checks=[];commands=[]
for p in packages:
 cmd=['python3',str(helper),str(p/'fusion-record.json'),'--package',str(p)]+source_args
 run=subprocess.run(cmd,text=True,capture_output=True)
 artifact=out/(('E' if 'case-e' in str(p) else 'F')+'-provenance-output.json')
 artifact.write_text(run.stdout)
 checks.append(dict(category='structural/provenance helper',package=str(p.relative_to(out)),exit_code=run.returncode,result=json.loads(run.stdout),artifact=str(artifact.relative_to(out))))
 commands.append(dict(command=' '.join(cmd),category='structural/provenance helper',exit_code=run.returncode,artifact=str(artifact.relative_to(out))))
 errors=[]
 skill=(p/'SKILL.md').read_text()
 if not skill.startswith('---\n'):errors.append('missing frontmatter')
 for target in re.findall(r'\[[^\]]*\]\(([^)\s]+)\)',skill):
  if not target.startswith(('http://','https://','#')) and not (p/target).is_file():errors.append('missing '+target)
 for required in ['SKILL.md','fusion-record.json','LICENSE','requirements.md','fusion-decisions.md']:
  if not (p/required).is_file():errors.append('missing '+required)
 rec=json.loads((p/'fusion-record.json').read_text())
 if len([c for c in rec['acceptance_cases'] if c.get('method')=='walkthrough'])<2:errors.append('fewer than two walkthroughs')
 if 'case-f' in str(p):
  if rec['readiness']!='draft': errors.append('F readiness must be draft')
  if not {'F-A','F-B'}.issubset({r['id'] for r in rec['workload']['constraints']}):errors.append('F hard constraints absent')
  if not any(c['status']=='unresolved' for c in rec['conflicts']):errors.append('F conflict not retained')
 checks.append(dict(category='structural package check',package=str(p.relative_to(out)),passed=not errors,errors=errors))
base=json.loads((out/'input-hashes-before.json').read_text())
after={rel:hashlib.sha256((root/rel).read_bytes()).hexdigest() for rel in base}
(out/'input-hashes-after.json').write_text(json.dumps(after,indent=2)+'\n')
checks.append(dict(category='input immutability SHA-256 comparison',passed=base==after,files=len(base)))
(out/'validation-report.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n')
(out/'executed-check-commands.json').write_text(json.dumps(commands,ensure_ascii=False,indent=2)+'\n')
(out/'commands.md').write_text('''# Commands and categories actually executed

Read-only context inspection:
- `cat /private/tmp/edu-skill-evals-20261012/candidate/edu-skill-fusion/SKILL.md`
- `rg --files /private/tmp/edu-skill-evals-20261012/candidate/edu-skill-fusion /private/tmp/edu-skill-evals-20261012/fixtures/skills`
- `cat` each candidate references file (requirements-and-routing.md, source-and-maintenance.md, acceptance.md, fusion-contract.md), template JSON, and scripts/fusion_provenance.py.
- `cat` evidence-search and lesson-planner SKILL.md and LICENSE; `rg --files /private/tmp/edu-skill-evals-20261012/fixtures`; `cat` pdf-helper and link-only SKILL.md. pdf-helper LICENSE was read by the artifact builder to retain and hash its terms.

Artifact creation within output root only:
- `mkdir -p /private/tmp/edu-skill-evals-20261012/candidate-fusion`
- `python3 --version` → Python 3.14.7, exit 0.
- Shell heredoc wrote build_artifacts.py; `python3 /private/tmp/edu-skill-evals-20261012/candidate-fusion/build_artifacts.py` → exit 0; 16 input files hash-pinned unchanged.
- Shell heredoc wrote verify_and_report.py; `python3 /private/tmp/edu-skill-evals-20261012/candidate-fusion/verify_and_report.py` executes final provenance checks, structural package checks and immutable-input hash comparison.

The full final helper commands and exit codes are in executed-check-commands.json. An initial E and F helper run before validation-note updates also exited 0, valid=true with no errors or source drift. Helpers were not modified. No external service, install, website edit, Web runtime, source drift injection or benchmark was executed.

Semantic checks: E1, E2, E3, F1, F2, F3 artifacts are author task walkthroughs, performed while drafting and reviewed against named requirements. F4 learner runtime compliance is blocked by conflicting hard requirements. These are not executable application tests and not independently executed tests of the generated skill.
''')
(out/'REPORT.md').write_text('''# Independent forward evaluation of candidate edu-skill-fusion

E produced a scoped bilingual teacher-science skill and a maintainable record. It transformed ten sources to at most two, answer-first to judgment-before-evidence, removed paid generation and model training, retained Web/data/acceptance contracts, preserved MIT attribution, and handled unavailable PDF tools and metadata-only premium planning. Three authored task walkthroughs passed: paper-airplane activity, missing PDF/catalog boundary, and unrelated email non-trigger. These walkthroughs used supplied data, not live scientific source verification.

F produced a useful draft conflict skill, teacher-only bilingual preparation, record, branches and the smallest clarification. Both hard requirements are retained. For the same initial learner moment, answer_visible must be both true and false; no policy is selected, no hidden-answer or separate-audience reinterpretation is silently used. Conflict/preparation walkthroughs passed; complete learner-facing fulfillment remains blocked pending clarification. The record stays draft and F4 stays blocked.

Final bundled provenance helper checks passed for E and F with exit 0 and no source drift. Structural package checks passed. Sixteen raw-source/candidate files retain their initial SHA-256; helpers and original packages are unchanged. No concrete helper failure was observed. Outputs remain only inside candidate-fusion.

Check categories are explicit: provenance/structural checks and task walkthroughs. The candidate was used by this separate evaluator agent to build the outcomes, but the generated skills' task walkthroughs were not independent downstream executions. No installed skill, running Web application, measured teaching gain, model benchmark, token saving or runtime validation is claimed. Command and artifact paths are in commands.md, executed-check-commands.json and validation-report.json.

Artifacts:
- case-e/teacher-science-activity/SKILL.md, fusion-record.json, requirements.md, fusion-decisions.md, references/, cases/E1-flight.md, E2-pdf-boundary.md, E3-non-trigger.md.
- case-f/teacher-science-activity-conflict/SKILL.md, fusion-record.json, requirements.md, fusion-decisions.md, references/conflict-preparation.md and cases/F1-conflict.md, F2-preparation.md, F3-non-trigger.md.
- E-provenance-output.json, F-provenance-output.json, validation-report.json, input-hashes-before.json and input-hashes-after.json.
''')
print(json.dumps({'checks':checks,'report':str(out/'REPORT.md')},ensure_ascii=False,indent=2))
