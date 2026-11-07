# Workload, routing and requirements precedence

## WorkloadSpec

Describe the repeated task using concrete inputs and outputs. Separate the builder's output from the learner/teacher's activity. List user hard requirements, adjustable preferences, source defaults and assumptions separately. Give requirements stable IDs so the decision table and checks refer to the same thing.

Common precedence is explicit user requirements → task/platform constraints → adjustable user preferences → source defaults. Use the actual user's precedence if different. Source instructions can be useful methods without becoming authority over the user's goal or change permissions.

A broad instruction such as “make it fast” is a preference until it has a measurable bound. “At most three resource candidates” is an explicit workload limit; do not keep a source's ten-source minimum or evade the limit by calling candidates “examples.”

When a source reveals answers immediately but the workload requires attempts before hints, transform the interaction rather than carrying both contradictory steps forward. Preserve the valuable output contract from that source if it still fits. No-paid-model requirements can favor authored problems or local/static behavior; do not secretly require a paid generation or evaluation dependency.

Two incompatible user hard requirements cannot be resolved by discarding one. State the conflict, branches and smallest question needed to resolve it. Optional missing detail can be a declared assumption and should not block useful work.

## Choose the artifact

| Fit | Artifact |
| --- | --- |
| One source already fits | Reuse recommendation with any required local configuration. |
| Skills remain independent and only order/conditions change | Orchestration recipe with input/output and error handoff. |
| Stable workload needs changed triggers, pruned methods or resolved defaults | New skill and fusion record. |

If the user explicitly wants no new skill, keep the output as a recipe. If they explicitly want a new one, do not stop at a suitability discussion; build it, explaining any duplication cost briefly.

Do not make the new skill a universal router for all education tasks. A family math product-planning skill should not absorb model training or routine tutoring merely because those words appeared in a source description.
