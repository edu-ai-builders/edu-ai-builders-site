---
name: family-math-workflow
description: Plan a bilingual Chinese/English, mobile-friendly family math product from owned problems or supplied resource evidence. Use for a new or redesigned family math practice product before implementation; exclude routine tutoring, PDF extraction alone, school-wide systems and research model training.
license: MIT
metadata:
  version: "0.2.1"
---

# Family Math Product Plan / 家庭数学产品规划

Create an editable implementation brief for the builder and an observable practice flow for family users. The first prototype must work without paid models. This skill plans products; implement only when the user's authorized task includes implementation.

## Route and preserve requirements / 路由与需求

Trigger for family math product planning or redesign. For unrelated model training, general research, routine answer solving or extraction-only work, say this skill does not apply and return to the actual request; do not manufacture a family use case.

Capture builder, family users, math goal, supplied problems/material rights, platform, languages, stack and required artifact. Separate hard constraints, preferences and optional assumptions. User requirements precede platform limits, preferences and source defaults. Do not invent a grade, curriculum, session length, fixed problem count or mandatory backend. When a missing choice is optional, state an adjustable assumption and continue. Surface irreconcilable hard constraints with branches; never silently discard one.

## Select bounded evidence / 有边界的资源选择

Use supplied local sources first; an available catalog or repository tool is optional. State exactly what was inspected and what was not searched. Search by capabilities with Chinese/English terms when search is actually available. Compare no more than THREE total candidates across shortlist, substitutes and alternatives. Do not evade the cap by renaming more candidates “examples.” One well-supported option is enough. Read selected material before claiming fit; metadata and stars are not runtime or permission proof.

For each candidate record identity/version or date, evidence kind, scoped material/code rights, role, inputs/outputs, dependencies, fit, gap and next verification. Distinguish reusable whole products from component combinations. Choose the smallest suitable option. Unknown hard constraints remain unresolved, not eligible by assumption. If nothing fits, author an owned-material/local deterministic route and label it as independent, not a catalog discovery. Do not install or run third-party code solely to inspect a listing.

## Design first interaction / 首个交互

Use supplied owned problems; otherwise author a provisional example and identify it as such. Preserve the exact math and units. No paid inference, evaluation or generation is required in the initial prototype: authored questions, deterministic answer checks and authored hints are sufficient. State the math domain and validate imported data; do not silently enlarge it. Keep answers separate from visible hints in the data contract. Client-side data is acceptable; hidden UI does not imply inaccessible answer data and does not create a backend requirement.

Define `problemId`, `attempts[]`, `draftAnswer`, `hintLevel` and `answerVisible` separately. A nonempty, domain-valid submission records an attempt; a slider movement, empty submission, Help tap or language switch is not an attempt. Hints stay locked until a submitted attempt for the current problem exists. The Help fallback before an attempt shows only “先试着提交答案 / Try submitting an answer first,” without hint content or the solution. An optional “I’m unsure” draft may be offered, but it does not unlock hints by itself.

After an attempt, allow a requested conceptual hint, then a more concrete hint if useful, and an explicit answer reveal. Choose and state a suitable hint count for that problem; do not impose a universal count or force delays. Do not auto-reveal on submission or Help. Correct/incorrect status, hints and answer timing must be specified. New or edited problem input creates fresh learner state; repeated requests cap the hint level. A locale change preserves the same problem/attempts/stage and translates only display. Invalid input returns validation, not a hint. Reset returns to the no-attempt state.

Provide matched Chinese/English learner copy: task, answer control, Submit/提交, Hint/提示, Reveal answer/查看答案, validation and next action. Keep math values and identity unchanged between languages. For mobile: single-column flow, flexible text wrapping, usable touch targets (proposed minimum 44 CSS px), keyboard support and visible focus; text alternatives for diagrams and status announcements that do not expose hidden answers. Specify narrow-screen and long-language-copy checks rather than claiming a preview was tested.

## Missing tools / 工具缺失

If a PDF cannot be extracted or viewed, record extraction as blocked and do not invent page content, citations or mathematical problems from its title. Accept pasted text or a user-selected transcription with page reference if supplied. Continue the product plan with owned/authored examples, clearly separate from the PDF. Reserve an optional import adapter `extracted task + page/source + rights + validation → reviewed problem record`; failure retains the current owned problems and gives a visible import gap. Never require an unavailable extractor, catalog, model or backend to finish a useful bounded brief.

## Deliver and verify / 交付与核验

Write the brief in Chinese/English paired labels and key instructions, including: goal/constraints/assumptions; smallest learner flow; candidate evidence (≤3); selected route and interfaces/data; staged build tasks; observable acceptance; unresolved gaps and substitutions. Use [brief.md](references/brief.md).

Build sequence: one runnable interaction with owned material and no paid models; then problem/state/data checks; optional import/catalog/model additions only if justified by the user's needs. For redesign state retained math/behavior separately from intentional UI changes.

Acceptance includes: both languages and narrow screens; actual first attempt before EVERY hint path; blank/invalid and pre-attempt Help; correct, incorrect and equal/alternative answers where relevant; repeated hints; reset/problem changes/locale switch; deterministic mathematical truth; missing tool fallback; exact source and rights observations. Label source inspection, manual walkthrough, application execution and learner study separately. Never call a plan an implemented product or claim learning gains from functioning UI.

Completion is a scoped, implementable brief with explicit gaps and a no-paid-model initial route. Report missing extraction honestly while finishing independent planning. See [maintenance.md](references/maintenance.md) for provenance and review of upstream changes.
