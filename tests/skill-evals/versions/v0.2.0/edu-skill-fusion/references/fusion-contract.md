# Fusion delivery contract — `edu.fusion-record.v1`

Human summary: workload, why this artifact type fits, key transformations, unresolved items and actual acceptance status. Keep it shorter than the complete record.

Use `assets/fusion-record-template.json` for indexed or maintained output:

- `workload`: purpose, narrowed trigger, exclusions, inputs, outputs, constraints with unique `id`, `level=hard|preference`, requirement text, and a stated precedence list.
- `sources[]`: unique `id`, observed `version`, `state=full-method|metadata-only|unavailable`, inspected `files[{path,sha256}]`, and `reuse{permission=redistributable|link-only|unknown,scope,...}`. Add component conditions and attribution observations as needed. Source roots are supplied explicitly to the verifier, not embedded as authority in the record.
- `decisions[]`: unique ID, source ID (or null for independent authorship), method, decision `keep|transform|delegate|reference|remove|independent`, `requirement_ids`, reason and generated relative `targets`. Delegation also needs `condition` and `fallback`. Removed methods have no generated target; references may remain as permitted links.
- `conflicts[]`: conflicting defaults/requirements, resolution, and resolved/unresolved status. Empty means no observed conflicts; missing is not the same as reviewed.
- `acceptance_cases[]`: ID, kind `normal|boundary|non-trigger`, prompt, expected behaviors, status `passed|failed|not-run|blocked`. Executed cases have method `walkthrough|independent-agent|executable`, observed result and relative result artifact. Executable cases also record the actual command. Do not label a reasoning exercise an application test.
- `upstream_map[]`: source ID, decision IDs and change conditions that require review.
- `readiness`: use `draft` while key conflicts or checks remain; `usable` describes current bounded task readiness, not a performance benchmark.

For unpermitted/unread methods choose reference, permitted delegation or independent authorship. The checker does not infer permissions or validate a source-read assertion. Keep source packages immutable while writing the generated folder.

The checker fails on changed source bytes and lists affected decisions. Its success means record consistency and source identity; manually or independently evaluate semantic conflicts, adequate fallbacks, proper triggering and task quality.
