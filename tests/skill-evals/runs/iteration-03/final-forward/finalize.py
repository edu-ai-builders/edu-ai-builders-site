from pathlib import Path
import json,hashlib
OUT=Path('/private/tmp/edu-skill-evals-20261012/final-forward');ROOT=Path('/Users/yismacmini4/Documents/ChatGPT/Edu-Ai-Builders/apps/site-original');p=OUT/'H/family-math-product-plan/fusion-record.json';r=json.loads(p.read_text());r['validation']['provenance_helper']='passed: explicit source/package roots; valid true, no errors or source drift; consistency only';p.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
snapshot=json.loads((OUT/'G/source-inventory.json').read_text());unchanged=[]
for f in snapshot['files']:
 current=hashlib.sha256((ROOT/f['path']).read_bytes()).hexdigest();unchanged.append({'path':f['path'],'sha256':current,'unchanged':current==f['sha256']})
for s in r['sources']:
 base=ROOT/'packages/builder-skills'/s['name']
 for f in s['files']:
  current=hashlib.sha256((base/f['path']).read_bytes()).hexdigest();unchanged.append({'path':str(base.relative_to(ROOT)/f['path']),'sha256':current,'unchanged':current==f['sha256']})
(OUT/'input-integrity.json').write_text(json.dumps({'status':'passed' if all(x['unchanged'] for x in unchanged) else 'failed','files':unchanged},ensure_ascii=False,indent=2)+'\n')
checks={'adapter_helper':'passed source grounding and record structure','fusion_helper':'passed provenance and record consistency','source_integrity':'passed' if all(x['unchanged'] for x in unchanged) else 'failed','G_baseline':'5 passed, 1 pre-existing explanation failure','G_redesign_application':'not-run (plan-only)','G_browser_and_localization':'not-run','H_actual_task_outputs':'3 same-agent manual walkthroughs passed','H_pdf_extraction':'blocked (no bytes/text/extractor)','H_bilingual_mobile_product_runtime':'not-run','H_independent_agent_execution':'not-run','H_benchmark_learning_or_efficiency':'not-collected'}
(OUT/'verification-record.json').write_text(json.dumps(checks,indent=2)+'\n')
with (OUT/'commands-and-observations.md').open('a') as log:
 log.write('''
Final checks and exercise records:

- Re-read the generated SKILL.md, references/brief.md and all H/inputs/*.json before applying them; actual authored outputs are H/family-math-product-plan/results/*.md. These are same-agent task walkthroughs; no extra evaluator was spawned.
- `python3 /private/tmp/edu-skill-evals-20261012/final-forward/finish_records.py`: records three walkthrough cases, with explicit blocked extraction and unrun browser/learning checks.
- `python3 /private/tmp/edu-skill-evals-20261012/final/edu-skill-fusion/scripts/fusion_provenance.py /private/tmp/edu-skill-evals-20261012/final-forward/H/family-math-product-plan/fusion-record.json --package /private/tmp/edu-skill-evals-20261012/final-forward/H/family-math-product-plan --source search=/Users/yismacmini4/Documents/ChatGPT/Edu-Ai-Builders/apps/site-original/packages/builder-skills/edu-resource-search --source plan=/Users/yismacmini4/Documents/ChatGPT/Edu-Ai-Builders/apps/site-original/packages/builder-skills/edu-design-plan`: exit 0; valid true, errors empty, source_drift empty. Result saved as H/provenance-helper-result.json. Rerun once after setting final validation status with identical arguments.
- `python3 /private/tmp/edu-skill-evals-20261012/final/edu-repo-adapter/scripts/repo_evidence.py verify /private/tmp/edu-skill-evals-20261012/final-forward/G/handoff.json --repo original=/Users/yismacmini4/Documents/ChatGPT/Edu-Ai-Builders/apps/site-original`: exit 0, valid true, errors empty. Saved again as G/evidence-helper-result.json.
- `python3 /private/tmp/edu-skill-evals-20261012/final-forward/finalize.py`: binds final source integrity checks to prior observed hashes. Check input-integrity.json; no input-byte drift.

No helper failures occurred. Missing path diagnostics in initial exploratory reads and the pre-existing math explanation failure are documented above; helper code was not modified.
''')
(OUT/'README.md').write_text('''# Final forward outcomes

G: evidence-grounded staged-hints redesign plan and structured handoff for the actual fraction-bars source, plus source inventory/hash and executed Node VM baseline probe. The math relation passed all 5,929 bounded input pairs. A pre-existing equal-input explanation incorrectly says B’s numerator is larger. Actual redesign, browser and localization checks remain not-run.

H: usable new family-math-product-plan skill, editable brief/reference, retained MIT license, source-hash fusion record and upstream map. Generated instructions were actually read and applied to owned multiplication, PDF-without-extractor and unrelated research training cases; their outputs are saved under the package’s results/. All are classified as same-agent manual walkthroughs, not application tests or independent evaluator runs. The PDF fallback plan passed while extraction remains blocked.

Both supplied helper scripts passed with explicit roots; no helper failure or repair. No input sources changed, website code edited, skill installed, external service called or task delegated. verification-record.json and commands-and-observations.md record limits and commands; input-integrity.json confirms inspected inputs retained their hashes.

- G/plan.md and G/handoff.json
- G/baseline-probe.json, G/source-inventory.json, G/evidence-helper-result.json
- H/family-math-product-plan/SKILL.md and fusion-record.json
- H/family-math-product-plan/results/owned-multiplication.md
- H/family-math-product-plan/results/pdf-no-extractor.md
- H/family-math-product-plan/results/unrelated-training.md
- H/provenance-helper-result.json
''',encoding='utf-8')
