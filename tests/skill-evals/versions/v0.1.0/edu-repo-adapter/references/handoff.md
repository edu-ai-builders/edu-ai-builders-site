# Capability map and adaptation handoff

For each required capability capture:

- Requirement and measurable behavior.
- Repository identity, fixed revision (or explicit unpinned state), inspected paths and file hashes where useful.
- Evidence locator: file, symbol/line or test; evidence type and remaining unknowns.
- Input/output shape, callers, dependencies, state and component reuse conditions.
- Decision: reuse / adapter / change / rewrite / reject; reason and substitute.
- Retained behavior, intended changes, integration contract and staged implementation.
- Before/after acceptance and unrun checks.

Prefer a small map to a long architecture summary. The first handoff must answer “where is the required behavior and what should change?” Include runtime results only when actually observed.

Example task: adapt fraction comparison into staged hints. Keep comparison math and slider bounds; isolate hint state from drawing; reset hints when a problem changes; test equal, greater and less fractions and keyboard operation. Function names and source locations must come from the inspected version, not this example.
