---
name: edu-skill-fusion
description: Distill methods from selected skills into a new skill tailored to a recurring personal or team workload, resolving overlaps and requirements conflicts with provenance and acceptance cases. Use when orchestration alone does not capture the desired working method.
license: MIT
metadata:
  version: "0.1.0"
---

# Workload-based Skill Fusion

Create a new working method for the user's recurring task. First decide whether an existing skill, an orchestration recipe or a new skill best fits the request; explain the decision without blocking a clear request for a new skill.

Capture a WorkloadSpec: trigger and non-applicable tasks, typical inputs/outputs, user method and preferences, hard constraints and precedence, tools/platform, available delegation, reading/change scope, context budget and acceptance examples. Keep user requirements distinct from source-skill defaults.

Select and pin source skills. Read the relevant full instructions and supporting methods on demand; catalog descriptions alone are insufficient for fusion. Record which parts may be reused or redistributed. Where that is unknown, link/delegate or author an independent method from the requirements rather than copying a package. Keep original inputs unchanged.

Build a decision table: keep, transform, delegate, move to reference or remove, with a workload-specific reason. Unify input/output contracts and vocabulary. Resolve conflicts using stated requirement precedence; surface an unresolved conflict that affects results rather than silently averaging policies. Do not union every source trigger: derive the new trigger from the workload.

Write a concise SKILL.md with its own description, decision flow, stopping conditions and completion standard. Keep specialist material in linked references. Delegation may remain when it is useful and actually available; define a fallback rather than inventing tool calls. Add scripts only for concrete repeatable mechanics.

Deliver the skill, source/version and reuse record, fusion decisions and acceptance cases using [fusion-contract.md](references/fusion-contract.md). Preserve existing automatic discovery unless the user asks for explicit-only invocation. A generated package does not install or register itself.

Check format and references, then exercise realistic tasks, a boundary case and a should-not-trigger task. Compare against original orchestration on quality, constraints, corrections, actual tokens and elapsed time when measured. Distinguish structural validation from behavioral results. Record which upstream change would require which part of the new skill to be reviewed.
