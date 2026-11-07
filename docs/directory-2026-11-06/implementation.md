# Unified directory implementation

The local Edu AI Builders directory now reads the reviewed resources owned by its website repository. This change has not been committed, pushed or deployed. The saved GPT preview is unchanged.

## Source and workflow

`radar/` contains the canonical collector, configuration, raw metadata and index. The workspace's `apps/radar` is a symlink to that same folder. The source destination is `https://github.com/edu-ai-builders/edu-ai-builders-site.git`. The old independent Radar repository and hosting service remain historical and were not modified remotely.

Run `python3 scripts/refresh-directory.py` from the website root. It collects bounded public metadata, applies the review policy and exports the shared index into `public/data/radar/catalog.json` and the API snapshot. `--offline` reviews retained evidence without claiming a new source check. Fatal collection or validation failures stop website export; isolated record failures preserve prior evidence and allow a partial export. Locks prevent overlapping collector and website export writes.

`/directory` is the only resource-search UI. `/skills` preserves `q` and `kind` when redirecting here. Scenario, workflow, saved-plan and contribution pages remain accessible. Redirected `/skills` is removed from the canonical sitemap.

The existing Monday 09:00 task now runs the website-owned entry point. Its id, model, local execution and failure-only notifications remain unchanged. This still requires the Mac, desktop application and GitHub access. It prepares local website data and performs no production publication.

## Review and retrieval

The three specialist reports are [keywords](keywords.md), [existing resources](existing-resources.md) and [taxonomy](taxonomy.md). The current product purpose is recorded in [the brief](brief.md).

There are 30 Builder keyword families and 90 queries, with the original per-run budget retained. Ordinary directory discovery rotates 24 queries rather than repeatedly selecting one dataset query. Query revision changes reset query paging and source offsets. Longer phrases still yield noise, so query provenance does not establish relevance or ability.

The shared index reads all source-verified canonical resources. It records metadata-based review separately from explicit editorial decisions, inferred artifact shape, confirmed facets, scoped license evidence and runtime evidence. Old query hints remain provenance. Missing runtime evidence is null.

Default display has 2,743 resources. Another 1,095 candidates are available through the review toggle. Four confirmed unsuitable resources are omitted from the public index; 27 unverified sources are also omitted. The audit report includes all 3,869 raw rows and their decisions. These are metadata and bounded source reviews, not a claim that every resource received a deep human review.

All prior repository and Skill identities remain recoverable. The current registry has 3,675 repository rows and 194 Skill rows. The initial identity cleanup added six repository identities and three Skills; duplicate named seed placeholders were merged by stable identity. Ten exact primary sources were checked successfully. The current OpenAI source pilot made 18 API requests and recorded three new Skills without executing them.

Exact reviewed examples keep DeepTutor under personal learning, JupyterHub under systems administration, EDUKG and D2L under knowledge materials, and OpenAI Evals under reusable evaluation code. Stable archived datasets remain eligible. Broad words do not establish education subjects or platform compatibility.

## Verification and limits

[Verification results](verification.json) record the passing production build, TypeScript, lint, translation coverage, Python and Node checks. Real browser interaction verified task filters, DeepTutor and OpenAI searches, old-route redirects and repeated guide navigation on the same route.

The independent review found and prompted fixes for empty operations, bilingual recall loss, an impossible freshness filter and mixed old/new Skill version evidence. The exporter preserves newer prior source observations without promoting export dates into verification dates. Regression tests cover source failure preservation, URL safety, identity uniqueness and version coherence.

No third-party app or Skill was installed or executed. Dataset payloads were not downloaded. Per-resource dependency compatibility and learning outcomes remain unverified. Production publication and retiring the old hosted service remain separate actions.

## Discovery and search follow-up

See [current discovery and search implementation](discovery-search.md) for free public X leads, staged daily cloud collection, health and retry semantics, shared natural-language retrieval and remaining human relevance work. This follow-up supersedes the earlier search implementation and policy counts; final measurements are in verification-discovery-search.json.

A subsequent real end-to-end run on November 6 added 31 repository observations and 10 Skills. All eight bounded Builder search queries succeeded. The overall run was partial because a repository returned 404, one source tree was truncated and one license observation required review. Valid exports completed. See verification-discovery-search.json for exact counts and health-observed.json for freshness.
