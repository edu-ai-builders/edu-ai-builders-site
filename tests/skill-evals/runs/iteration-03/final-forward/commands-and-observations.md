# Commands and observations

All writes are under /private/tmp/edu-skill-evals-20261012/final-forward. No source package, website or installation changed; no external service called; no delegation.

Read-only inspection commands:

- `cat /private/tmp/edu-skill-evals-20261012/final/edu-repo-adapter/SKILL.md` and fusion equivalent; adapter references mode-checks/handoff and template; fusion references requirements-and-routing/source-and-maintenance/acceptance/fusion-contract and template; helpers read for expected schemas.
- `cat README.md`; `cat AGENTS.md` in actual original website; `cat public/tools/fraction-bars.html` initially exceeded displayed output budget. Read `nl -ba public/tools/fraction-bars.html | sed -n '60,350p'` for complete relevant runtime/rendering code. Embedded dictionary's very long line was not individually audited. It is not necessary to establish math or hint timing; zh/en runtime remains untested.
- `rg -n 'fraction-bars' app public/data tests --glob '!*.html'`; broader initial rg hit huge HTML dictionary output and was then bounded. Targeted callers are resources.ts, /use/[slug]/page.tsx and illustrative resource-preview.tsx. Read first-party source skill SKILL.md, referenced method and LICENSE in full, repeated in a smaller call after batch output truncation.
- `git status --short`; `git rev-parse HEAD` in original website. Dirty/untracked state is pre-existing; full selected-root status is recorded by source inventory. No Git mutation.
- `cat app/use/[slug]/page.tsx app/components/artifact-preview.tsx ...` returned an unrelated missing-file diagnostic for app/components/artifact-preview.tsx; direct real route was read fully. `rg ... app/tools ...` reported missing app/tools; relevant route is app/use. No absence inferred from those missing paths.
- Read tests/math-tools.test.mjs and package.json; suite inspected has tests for angle, number-line and linear-function, not fraction-bars. No browser result inferred.

Executed commands/artifacts:

- `node /private/tmp/edu-skill-evals-20261012/final-forward/G/probe.mjs > /private/tmp/edu-skill-evals-20261012/final-forward/G/baseline-probe.json`: VM executes actual original mathematical inline script. Five baseline checks pass; equal-input explanation fails. The process records checks and exits 0; this does not make every check passed.
- `python3 /private/tmp/edu-skill-evals-20261012/final/edu-repo-adapter/scripts/repo_evidence.py inventory /Users/yismacmini4/Documents/ChatGPT/Edu-Ai-Builders/apps/site-original --path public/tools/fraction-bars.html --path 'app/use/[slug]/page.tsx' --path app/content/resources.ts --path app/components/resource-preview.tsx --path tests/math-tools.test.mjs --path docs/tool-source-manifest.json --query showFeedback --query fraction-bars --output /private/tmp/edu-skill-evals-20261012/final-forward/G/source-inventory.json`: actual helper inventory with selected-file boundaries; inspect coverage/skips in artifact.
- `python3 /private/tmp/edu-skill-evals-20261012/final-forward/write_artifacts.py`: creates handoff, generated method/record, raw task inputs and this command record. Generated method exercise is performed afterwards and recorded separately.

Helpers are used as provided. Further checker commands and their exact results are added after execution; a helper failure is reported, not repaired.

Final checks and exercise records:

- Re-read the generated SKILL.md, references/brief.md and all H/inputs/*.json before applying them; actual authored outputs are H/family-math-product-plan/results/*.md. These are same-agent task walkthroughs; no extra evaluator was spawned.
- `python3 /private/tmp/edu-skill-evals-20261012/final-forward/finish_records.py`: records three walkthrough cases, with explicit blocked extraction and unrun browser/learning checks.
- `python3 /private/tmp/edu-skill-evals-20261012/final/edu-skill-fusion/scripts/fusion_provenance.py /private/tmp/edu-skill-evals-20261012/final-forward/H/family-math-product-plan/fusion-record.json --package /private/tmp/edu-skill-evals-20261012/final-forward/H/family-math-product-plan --source search=/Users/yismacmini4/Documents/ChatGPT/Edu-Ai-Builders/apps/site-original/packages/builder-skills/edu-resource-search --source plan=/Users/yismacmini4/Documents/ChatGPT/Edu-Ai-Builders/apps/site-original/packages/builder-skills/edu-design-plan`: exit 0; valid true, errors empty, source_drift empty. Result saved as H/provenance-helper-result.json. Rerun once after setting final validation status with identical arguments.
- `python3 /private/tmp/edu-skill-evals-20261012/final/edu-repo-adapter/scripts/repo_evidence.py verify /private/tmp/edu-skill-evals-20261012/final-forward/G/handoff.json --repo original=/Users/yismacmini4/Documents/ChatGPT/Edu-Ai-Builders/apps/site-original`: exit 0, valid true, errors empty. Saved again as G/evidence-helper-result.json.
- `python3 /private/tmp/edu-skill-evals-20261012/final-forward/finalize.py`: binds final source integrity checks to prior observed hashes. Check input-integrity.json; no input-byte drift.

No helper failures occurred. Missing path diagnostics in initial exploratory reads and the pre-existing math explanation failure are documented above; helper code was not modified.

- `python3 H/add_pdf_input.py` (absolute path under output root): authored a local valid PDF fixture without any dependency/extractor. Re-read updated raw input and generated instructions, then re-exercised boundary planning with binary file present but unextracted/unviewed. Initial no-bytes output preserved as results/pdf-no-bytes-initial-walkthrough.md; final case points to revised results/pdf-no-extractor.md. PDF contents were not used. Fusion helper rerun after this record update with identical explicit roots; passed.
