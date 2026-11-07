---
name: edu-skill-fusion
description: Create a new skill for a recurring workload by selecting and reshaping permitted methods from source skills, resolving requirements conflicts, and preserving source and maintenance records. Use when the user needs a working method of their own; simple sequential delegation can remain an orchestration recipe.
license: MIT
metadata:
  version: "0.2.0"
---

# Workload-based Skill Fusion

Create the user's working method, not a union of every source instruction. A fused skill has its own trigger, decisions, completion standard and version; it may still delegate a specialist step.

## Decide what to produce

Use an existing skill when it already fits. Produce an orchestration recipe when the user wants order/conditions between independently useful skills. Produce a new skill when a stable workload requires pruning, transforming methods or resolving conflicting defaults. Preserve an explicit request for a new skill or for no new skill.

Capture a WorkloadSpec: task and non-applicable tasks, typical inputs/outputs, hard constraints versus preferences, user method, precedence, tools/platform, allowed read/change scope, useful context limits and acceptance examples. Use supplied requirements; make optional assumptions explicit. For irreconcilable hard requirements, deliver the conflict and available branches rather than inventing a compromise. Read [requirements-and-routing.md](references/requirements-and-routing.md) when routing or conflicts are substantial.

## Read and select methods

Pin source identity/version and inspected file hashes. Read the relevant full instructions and referenced methods on demand. Catalog descriptions identify candidates; they do not establish that their method has been read. Record metadata-only/unavailable sources separately.

Distinguish component permission from access to read. Keep/transform and redistribute a source method only within its observed reusable scope. With link-only/unknown terms, link or delegate within the available environment, or author an independent method from the user's requirements. Do not copy unavailable or proprietary bodies. Read [source-and-maintenance.md](references/source-and-maintenance.md) for provenance, scope and drift handling.

Build the fusion decision table before drafting: keep, transform, delegate, move to reference, remove, or author independently; each decision serves named workload requirements. Unify contracts and vocabulary, delete repeated steps, and resolve defaults using the user's precedence. Do not silently retain a source rule that contradicts a hard constraint.

## Write a focused standalone skill

Derive the new description and trigger from the workload, not all source triggers. Keep the core method concise, including branch decisions, fallbacks and completion criteria. Load substantial specialist detail through linked references only when needed. Add scripts only for a repeatable mechanic that improves reliability.

If delegation remains, state the availability/input condition, what result is required and a workable fallback. Do not name tools that are unavailable as mandatory dependencies. The new skill should still produce a bounded useful output when an optional catalog or specialist is missing. For packaging and task checks, read [acceptance.md](references/acceptance.md).

## Validate, exercise and deliver

Use [fusion-contract.md](references/fusion-contract.md) and [fusion-record-template.json](assets/fusion-record-template.json) for provenance, decisions, conflicts, acceptance and upstream review. Optional standard-library check:

```sh
python3 scripts/fusion_provenance.py /path/to/new-skill/fusion-record.json --package /path/to/new-skill --source search=/path/to/search-skill --source plan=/path/to/plan-skill
```

It checks hashes, permitted declared decisions, target files and record consistency; it does not certify permission, method quality or measured performance. Changed source hashes require reviewing the affected decisions, not silently regenerating all methods.

Exercise representative tasks, a tool-missing/boundary case and a should-not-trigger request. Record the actual result and which requirement was checked. Distinguish structural checks, a task walkthrough, independent-agent execution and application runtime checks. A generated package or a manual walkthrough is not a measured improvement over orchestration. Compare quality, constraint compliance, corrections, tokens and elapsed time only when observed under stated conditions.

Deliver the new skill folder, requirements, source/version and reuse observations, fusion decisions, acceptance artifacts and a maintenance map. Keep original source packages unchanged. Generating a folder neither installs it globally nor registers tools; perform those steps only if included in the user's request.

Completion means the new workload has a coherent method, every retained/transformed/delegated method is traceable, important conflicts and missing tools are handled, and the validation status is candid. Leave unrun cases pending instead of manufacturing success.
