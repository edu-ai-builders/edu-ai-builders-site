# Native open-source directory — local implementation

The original site's `/directory` now renders its own responsive interface, replacing the remote iframe. The standalone Radar source and deployment were not modified. This is a local implementation, not a production deployment.

## Visitor experience

- A visual “try → understand → adapt” introduction and Chinese editorial starting points.
- Search across repository names, author descriptions, topics and Chinese editorial descriptions.
- Task filters (teaching, building, learning development, research), five resource categories, language, archive/accessibility/freshness filters, four sorts, 18-record pagination.
- Source/license links and expandable provenance on every card. Dates explicitly distinguish snapshot generation, metadata verification, manifest verification and last code push.
- Six editorial starting points (Easy-Vibe, Anki, Kolibri, Web Dev for Beginners, SymPy, Oppia), with code-native purpose diagrams clearly labelled as illustrations, not product screenshots. Other descriptions retain their source language.
- Cross-links into the learning-sciences Atlas and introductory Git course.

## Snapshot and refresh

Read-only API refresh: **2026-09-21 03:12–03:16 UTC** (September 20 local time).

| Measure | Count |
| --- | ---: |
| Original repository leads | 3,536 |
| Unverified/error leads excluded | 23 |
| Published repository records | 3,513 |
| Published Skill manifests | 131 |
| Total published records | 3,644 |
| Repository records refreshed | 3,410 |
| Repository records returning HTTP 404 | 103 |
| Historical Skill manifest checks retained | 131 |
| Records retaining an older content-check date | 234 |
| Distinct repository API requests, including Skill-only sources | 3,579 |
| Successful repository API responses | 3,476 |

All 103 failures were HTTP 404. Their historical records retain their previous dates and source identifiers, are labelled unavailable, and are hidden by default. No false fresh date is assigned. A repository returning 404 could be private or deleted; the UI does not claim to know why.

Skill source repository metadata was refreshed, but Skill frontmatter was **not** newly reviewed. A separate `repositoryCheckedAt` is provided; the original `checkedAt` remains unchanged. Consequently Skills do not appear under “only items verified this run.”

`datawhalechina/easy-vibe` was already in the original discovery set. Its identity and public metadata were successfully verified; the current response reports 19,483 stars and no detected license. The UI says “许可证待确认,” not “MIT.”

Two malformed homepage values were omitted by URL validation. No arbitrary source code, manifests, tokens, personal data or private repositories are included in the generated JSON. Descriptions are author-provided metadata, not claims of pedagogical efficacy. Stars measure attention, not quality. Inferred category/task tags remain discovery aids.

## Reproduce

From `apps/site-original/`:

```sh
# Reads historical registry + Skills data and public GitHub metadata.
# Uses existing gh auth in memory when available; never logs a credential.
python3 scripts/radar-refresh.py --limit 4000 --workers 6

# Offline regeneration intentionally replaces fresh metadata with the historical source.
# Use only when an offline source-only snapshot is intended:
# python3 scripts/radar-refresh.py --offline

node --test tests/radar.test.mjs
npx eslint app/directory
```

The refresh writes only `public/data/radar/catalog.json`; it does not mutate `apps/radar/data`, a database, hosting configuration or deployment. Source directories are resolved relative to the script, not an old relocated path. Rerun deliberately; no hidden crawler is triggered by visits to the website.

## Verification

Five tests cover stable unique IDs, summary reconciliation, safe source URLs, freshness provenance, manifest/repository date separation, Chinese and normalized search, combined filters, deterministic sorts and nonmutation of the source array. Browser checks cover Chinese search, provenance expansion and responsive card/filter layout. Broader production build is performed by the coordinating implementation task.
