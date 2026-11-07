---
name: edu-design-plan
description: Turn an education product goal and resource candidates into a learning interaction, architecture and staged build plan with acceptance tasks. Use before implementing a new product or redesigning an educational experience.
license: MIT
metadata:
  version: "0.1.0"
---

# Education Design and Plan

Produce a plan the user's coding agent can implement and verify. Start from the learner's action and desired outcome, then choose the smallest product flow that demonstrates it.

Capture who builds and who uses the product, learning/research goal, inputs, expected artifact, target platform, constraints, existing stack and reuse intent. Preserve the original goal and distinguish requirements from preferences and assumptions.

Define the experience: what the user sees, attempts, receives as feedback and does next. State when hints or answers appear, how sources are exposed, what a teacher can review, and what data the flow needs. Avoid converting a broad learning aim into a claim of proven learning gains.

Map candidate resources to roles and identify alternatives. Verify input/output formats and dependency boundaries before recommending a combination. If evidence is missing, search again or mark a gap. Ordinary source inspection can use available repository tools; use `edu-repo-adapter` for a deeper implementation map when available.

Separate refactoring (preserve behavior) from redesign (intentional behavior changes). For redesign record retained and changed behavior; for refactoring retain a baseline contract and regression checks.

Deliver an editable brief: problem and constraints, minimum learning flow, resource/version table, interface and data flow, implementation sequence, acceptance tasks, unresolved questions and substitutions. Read [brief-template.md](references/brief-template.md) when formatting a handoff. Recommend relevant courses and tools only when they help the user's next step; use existing tools unless a new dependency is justified.

Planning alone does not establish runtime success. Respect a request to implement by proceeding within its authorized scope; otherwise hand the plan to the user's coding agent. Do not report unrun checks as passed.
