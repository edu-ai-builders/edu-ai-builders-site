# Evidence and adaptation handoff

## Human report

Keep it proportional to the task:

- Goal, hard constraints, requested mode and authorized work.
- Source identity/version, dirty/untracked state, inspected scope and limitations.
- Capability → actual file/symbol/interface → reuse decision and reason.
- Preserved and changed behavior; dependencies, component conditions and alternatives.
- Connection contracts, implementation order, baseline outcomes and acceptance.
- Explicit unresolved items and next useful action.

Source observations cite inspected files. Inferences cite the observation supporting them and name the uncertainty. Runtime statements include the actual command and observed result. A planned check is not a runtime result.

## Structured record: `edu.repo-handoff.v1`

Use `assets/handoff-template.json` when the output will be indexed or repeatedly checked. This is a downstream contract, not a reason to force JSON into a trivial answer.

- `mode`: `compare`, `extract`, `refactor`, or `redesign`; describe mixed preservation/redesign in the capability fields.
- `sources`: identity, observed revision or explicit null, local state, analyzed scope and scoped terms. File hashes bind observations to working-tree bytes.
- `capabilities[]`: `requirement`, `decision`, `reason`, `evidence[]`, `inputs`, `outputs`, `dependencies`, `retained[]`, `changed[]`, `unknowns[]`, `acceptance[]`.
- Decisions: `reuse`, `adapter`, `change`, `rewrite`, `reject`, `unresolved`.
- Source evidence: `type=source-observation`, `repository` matching the supplied root ID, relative `path`, complete `sha256`, inclusive `line_start` / `line_end`, and a verbatim `quote` present in that range. Keep quotes short. Unknown implementations must stay unresolved, not receive guessed evidence.
- `connections[]`: provider/consumer shapes, transform, source identity, errors/reset, integration acceptance, actual check status.
- `verification[]`: `method`, `status=passed|failed|not-run|blocked`; executed checks also have `command` and `observed_result`. Include a baseline/after distinction in `phase`.

`repo_evidence.py verify` validates source quotes/hashes and minimum record fields; it does not execute recorded commands or judge the semantic adequacy of the plan. `runtime_tested` must describe actual execution of the relevant path; a metadata scan does not establish it.

## Bounded inventory helper

Run against explicit source roots and selected relative paths. Default limits: 300 visited files, 2 MB read bytes, 256 KB per file, 60 literal-match excerpts. Generated/dependency directories and symlinks are skipped and recorded. Binary/non-UTF8 files need another inspection method. Check `coverage.enumeration_complete`, `matches_complete`, skipped paths and source modifications before interpreting results. A hash checks identity; it is not an analysis of the source's meaning.
