# Source scope and maintenance

Read relevant methods rather than every file by default. Record exactly which files were inspected, their SHA-256, observed version and content/access scope. A version label alone cannot identify a modified working copy. Include referenced files that materially affect a retained method; otherwise their later change would be invisible.

State `full-method`, `metadata-only` or `unavailable` for each source. A downloaded SKILL.md that is only a marketplace listing still counts as metadata-only. A catalog summary can support discovering or linking a candidate, not reconstructing its undisclosed workflow.

`reuse.permission` records an observed distributable scope, link-only scope or uncertainty. It is not a legal determination. Code, instructions, bundled reference documents and data can have different terms. Keep the applicable observation and attribution requirements with each source. First-party independent instructions can be licensed separately; do not claim ownership of incorporated third-party material.

For every kept, transformed or delegated method map source → method/decision → generated file → requirements/checks to review. On change:

1. Verify the source bytes and identify the changed file or missing source.
2. Find affected decisions; inspect relevant upstream changes, not just the new version label.
3. Decide retain, update, replace or remove against current workload requirements.
4. Re-run affected acceptance cases, preserve prior results, update the source record and increment the new skill's version when its method changes.

A change does not authorize copying previously unpermitted material, expanding the workload, or overwriting the user's generated skill. Report unchanged/unaffected portions and unresolved checks. With unavailable upstream sources, preserve the last record and mark maintenance coverage incomplete.
