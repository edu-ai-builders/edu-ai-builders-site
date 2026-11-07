# Commands and categories actually executed

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
