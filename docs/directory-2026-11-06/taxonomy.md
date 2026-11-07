# Evidence for directory types and labels

The directory supplies reusable resources for the Edu AI Builders agent and client. Personal learning, teaching, research and educational operations are in scope. Generic building resources need a clear reusable role; they do not automatically gain an educational subject or audience.

## What changed

`crawl.infer_kind` no longer trusts a discovery query's `kind_hint`. It uses repository name, description and declared topics. An old stored `entity_kind` cannot override new metadata classification. For example, a dataset search cannot turn Chamilo LMS, OATutor or Artemis into a dataset. Explicit software descriptions also prevent a library for loading datasets from becoming the dataset itself.

The canonical registry keeps its existing `repo`, `dataset`, `benchmark`, `awesome_index` and `unknown` enum. `crawl.classify_resource` adds an artifact shape in the read model. Values are `application`, `library`, `skill`, `dataset`, `benchmark`, `knowledge`, `index` and `repository`. The last means the artifact shape is not established by available metadata. Books and courses can be `knowledge` without claiming they are runnable software. Curated dataset and course records take precedence when generic GitHub metadata is sparse.

The Builder index now reads every source-verified canonical repository and Skill directly. It no longer depends on the narrower standalone website export or a discovery-hint bypass. Review decisions remain attached to all retained candidates, including excluded entries, so display cleanup is reversible.

## Labels and evidence

`facet_hints` now contains only explicit `reviewed_facets` and curator-written `education_scenarios`. The existing field name remains for reader compatibility. `facet_evidence` names that source, or says `not-recorded`.

Original query and source facets remain under `discovery_hints`. They do not participate in confirmed facet filtering. Search-family synonyms can help retrieve records, but matching `writing`, `art`, `history` or `mobile` cannot generate a language, arts, humanities, platform or offline capability label.

`classification_evidence` distinguishes source metadata from curated resource records. It describes evidence for resource shape, not capability testing, security or teaching effectiveness. `runtime_tested` is `null` when no execution evidence is recorded. The old generator wrote `false` for every resource, which could not distinguish an unrecorded result from a completed negative test.

Source timestamps, stable IDs, scoped license observations and raw discovery records are preserved. `primary_language` describes the source's declared programming language and is not a cleanup blacklist.

## Verification

`radar/scripts/test_taxonomy.py` checks misclassified education apps, dataset-loading libraries, benchmarks, books, courses and sparse curated data. It builds an isolated canonical fixture and proves that the Vercel React Skill, The Art of Debugging and xurl keep discovery provenance without receiving unsupported confirmed facets. The fixture also verifies preserved observation dates and identical exports.

The existing Builder discovery index fixture now writes canonical records rather than relying on a standalone frontend export. The parent integration run records actual test outcomes and rebuilds the real snapshots sequentially.

On 2026-11-06, the taxonomy suite passed 5 tests, Builder discovery passed 11 tests, and directory refresh passed 11 tests. Commands were `python3 -m unittest discover -s radar/scripts -p 'test_taxonomy.py'`, with the filename changed for the other two suites. These tests use isolated fixtures for writes. No canonical rebuild was run by the taxonomy agent.

## Limits

Metadata classification can remain uncertain and a repository may contain several artifacts. This pass does not inspect full source trees or execute third-party software. It records one primary artifact shape and leaves uncertain capabilities unlabelled. Review and runtime evidence can be extended when a specific workload requires deeper analysis.
