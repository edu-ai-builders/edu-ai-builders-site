# Preservation, redesign and incremental checks

Read when preserving behavior, changing learner interaction, or implementing the plan.

## Establish the baseline

Record the selected version, local modifications, actual commands and outcomes. Name the public contract: parameter shape, return values, errors, side effects, ordering and state lifecycle relevant to this requirement. An existing test suite may be incomplete or already fail. Preserve the failing output as a baseline finding; do not relabel it as a regression from work not yet performed.

If no runnable tests exist, define a small behavioral check at the public interface. Prefer representative normal, boundary and reset/error cases; do not test private implementation details merely because they are easy to assert. Missing environments or dependencies produce blocked/not-run checks, not passed checks.

Refactor preserves the agreed contract, including observed quirks unless the user also authorizes their correction. A discovered bug is a separate decision: retain temporarily, fix with explicit changed-behavior coverage, or leave unresolved. Do not silently widen a refactor into a product redesign. When the user already asked to change the behavior, proceed without asking for that same permission again.

## Redesign learner state

Describe transitions, not only screens. For staged feedback, identify problem ID, attempt, hint level and answer visibility separately. Decide when feedback may appear and what resets when the problem changes, data reloads or a request fails. This is a configurable design requirement, not a universal teaching sequence.

A mixed task can preserve `compare(left,right)` and redesign when its result becomes visible. Put both in the plan. Ensure correct/incorrect/equal cases and repeated actions use current state. Keep product behavior checks separate from measured learning outcomes.

## Implement by contract

1. Capture the relevant baseline; isolate pre-existing failures.
2. Separate the preserved interface from intended changes.
3. Implement the smallest complete interaction or adapter before broad cleanup.
4. Run focused before/after checks, including any integration boundary actually changed.
5. Review the diff for unrelated changes and report failures, blocked checks and remaining unknowns.

If the source is inaccessible, stop making implementation claims. Provide an evidence request, a bounded substitute search or an independent design from requirements. A binary artifact may require REA or another toolchain; do not execute an unfamiliar release simply to fill an analysis gap.
