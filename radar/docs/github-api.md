# GitHub API operating notes

Verified against GitHub's official documentation on 2026-07-22.

## Current API shape

- The latest documented REST API version is `2026-03-10`; the crawler sends it
  via `X-GitHub-Api-Version` and allows an environment override.
- Repository search returns at most 100 records per page and up to 1,000
  results per query. A query's search scope is also limited to 4,000 matching
  repositories. Responses may set `incomplete_results: true`.
- Search is limited to 10 requests/minute without authentication and 30/minute
  when authenticated (code search has a separate limit and is not used here).
- GitHub recommends following `Link` headers, making requests serially, honoring
  `Retry-After` and `X-RateLimit-Reset`, and applying exponential backoff.
- Most GET endpoints return ETags. Correctly authenticated conditional requests
  that return `304 Not Modified` do not consume the primary rate limit.

Official references:

- [REST search endpoints](https://docs.github.com/en/rest/search/search)
- [REST pagination](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api)
- [REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [REST best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api)
- [Get/list repository metadata](https://docs.github.com/en/rest/repos/repos)
- [List repository languages](https://docs.github.com/en/rest/repos/repos#list-repository-languages)
- [Get latest release](https://docs.github.com/en/rest/releases/releases#get-the-latest-release)

## Query architecture

The matrix deliberately covers four high-recall families plus lead expansion:

1. `education-native`: education, edtech, K12, LMS, courseware.
2. `teaching-workflow`: teacher, lesson planning, assessment, rubric, feedback.
3. `learning-adjacent`: study tools, knowledge graphs, curriculum, textbooks,
   spaced repetition and tutoring.
4. `capability-primitives`: agent/copilot, retrieval/RAG, authoring, speech/OCR.
5. topics, datasets/benchmarks, and awesome-list indices.

English and Chinese terms are separate queries so coverage and false-positive
rates can be measured independently. Exact seeds are resolved first. Organization
and neighbor expansion should be emitted as additional provenance:

- organization: list public repositories for owners of curator-confirmed seeds;
- neighbor: search shared high-signal topics, not arbitrary star/fork graphs;
- awesome leads: ingest only repository links as unverified leads; do not fetch
  or analyze every linked source in this crawler.

The `expand` command supports bounded owner enumeration, explicit high-signal
topic neighbors, and exact `owner/repo`/GitHub URL imports from curator-approved
awesome indices. It deliberately does not fetch/store awesome README content;
lead extraction can happen as a small reviewed handoff into the example text
format. Owner/topic inputs and page counts must be explicit so expansion cannot
run away recursively.

## Breaking the 1,000-result ceiling

Never request page 11. Split a broad query into non-overlapping partitions,
measure `total_count`, and subdivide any partition at or above 900:

- `created:2026-01-01..2026-03-31`, then quarterly/monthly/daily as needed;
- `pushed:>=2026-01-01` versus older maintenance windows;
- star bands such as `stars:0..9`, `10..99`, `100..999`, `>=1000`;
- language/topic partitions only when they are part of the coverage design.

Store partition details in provenance. Stable numeric ID deduplication makes
overlap safe, but non-overlapping ranges make recall measurable. The 4,000-repo
search-scope limit means even a `total_count < 1,000` result can be biased if the
filter universe is too broad; date/star partitioning is still required.

## Field semantics and caveats

- `watchers_count` returned in common GitHub repository payloads mirrors the
  legacy watcher/stargazer count. `subscribers_count` from `GET /repos/{owner}/{repo}`
  is stored separately as the current notification subscriber count.
- `open_issues_count` includes open pull requests in GitHub's repository payload.
- Latest release means the latest published, non-draft, non-prerelease release
  according to GitHub's endpoint. `404` is stored as a valid `none` state.
- License SPDX is GitHub's detected license metadata; null does not mean the
  repository has no licensing text.
- Topics are normalized by GitHub. Language values are byte counts, not effort
  or product capability.

## Rate and failure behavior

The client is serial. Unauthenticated search defaults to 6.2 seconds between
requests; authenticated search defaults to 2.1 seconds. A rate-limit response
uses `Retry-After`, then `X-RateLimit-Reset`, then a bounded exponential wait.
The run stops rather than waiting beyond `--max-wait`.

ETag cache state stores only URL, ETag/Last-Modified and check time. It does not
store raw GitHub payloads. Run snapshots contain only the compact registry and
run summary.
