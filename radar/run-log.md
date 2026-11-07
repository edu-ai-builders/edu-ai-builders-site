# GitHub Radar run log

## Ownership and boundary

- Artifact family: `github-radar/`
- Writer: Codex delegated task `GitHub 教育/未来能力 Radar`
- Started: 2026-07-22 America/Los_Angeles
- Scope: discovery, API metadata registry, compact snapshots, public read route.
- Explicitly out of scope: clone/source storage, deep code analysis, substrate
  node creation/promotion, edits to schema/vocabulary/merged graphs/corpus/reviews.

## 2026-07-22

- Read root `AGENTS.md` and curator-first/frozen boundaries in `SCHEMA.md`.
- Confirmed no existing `github-radar/`, web framework, package manifest or
  `.openai/hosting.json`.
- Read PenEcho local Git origin only; exact gold seed is `penecho/penecho`.
- Verified current GitHub REST search/pagination/rate/ETag/release semantics from
  official GitHub documentation.
- Verified current Vercel Marketplace, plan/security and Neon/Supabase/Prisma
  pricing/backup facts from official provider documentation.
- Created independent crawler, registry contract, seed/query configs, Postgres
  migration, deployment notes and dependency-free static site.
- Registered all 23 supplied leads before verification.
- Live official API smoke run:
  - PenEcho exact seed: verified with repository, languages and latest-release
    endpoints (3 requests).
  - `topic:education`: 25 unique search results; 2 received full language/release
    hydration (7 requests total).
  - Incremental refresh: 1 saved ETag returned `304 Not Modified`.
  - Owner expansion: `penecho` returned 1 repository without changing the stable
    registry count or erasing hydrated metadata.
- Second-stage name verification: 23 selected, 20 API matches, 3 unresolved
  (`awesome-k12-cs`, `MDK12-Bench`, `xex`), with no request errors.
- Final local registry before hydration queue: 48 records, 45 API-verified,
  3 unverified name leads; 19 name matches remain explicitly `probable`.
- Structural validation: 0 errors.
- Hydration queue: 10 supplied leads received full repository/language/release
  calls (30 requests, no errors). Final completeness is 13 fully hydrated of 45
  verified records; 32 remain intentionally queued.
- Compact size after all lead provenance: registry 96 KiB; allowlisted public
  JSON about 56 KiB.
- Static validation: Python compile, JSON parse, query-length/operator guard and
  JavaScript syntax check passed. A network-bound browser preview was not needed
  for this delegated/background task; no deployment was authorized.
- Public export uses a field allowlist and excludes local provenance paths,
  internal API/clone fields and candidate-resolution details.

## 2026-07-24

- Added `github-radar/web/`, an isolated Next.js/React presentation layer. It
  reads only the allowlisted generated `site/data/registry.json` snapshot copied
  by `npm run sync:data`; it neither reads analysis output nor changes registry
  fields.
- Implemented sidebar search, kind/subject/language/activity filters, four
  sort orders, GitHub README links, GitHub social-preview thumbnail fallback,
  and a support route. The Buy Me a Coffee destination is deliberately empty
  until the curator supplies a creator-page URL through an environment variable.
- Local validation passed: `npm run sync:data`, `npm run build` (Next.js
  16.2.11), desktop/mobile browser visual checks, search filtering, and Support
  route navigation.
- No database, Vercel project, domain, scheduled job, GitHub analysis pipeline,
  paid resource, or support-account creation was authorized or performed.
- `npm audit` initially reported three high-severity items during install, but a
  follow-up advisory lookup could not be independently completed because the
  registry network request was not authorized. No automatic dependency upgrade
  was applied.

## 2026-07-25

- Expanded the high-recall discovery registry with 24 English/Chinese GitHub
  Search queries (50 results each) and a bounded hydration queue. The registry
  now contains 893 records, 890 GitHub-verified; a 50-record incremental
  refresh completed without API errors.
- The public snapshot applies an explicit metadata-only education-signal gate:
  298 education-facing records are published from the larger discovery pool.
  This prevents a transient query match from automatically becoming a featured
  educational project while retaining discovery evidence for later review.
- Rebuilt the React UI with English/Chinese switching, full-width card previews,
  complete GitHub social-preview fallback, homepage links, and a bilingual
  curator-submission form. A third-party anonymous screenshot endpoint was
  tested and rejected because it served a paid-account placeholder; no broken
  homepage previews are published.
- Added `migrations/002_project_suggestions.sql` and a server-only Postgres API
  route. Repository suggestions are pending until GitHub metadata verification;
  learning goals are private and have no public read path. No managed database
  or Vercel deployment was provisioned.

## 2026-07-27

- Added a separate metadata-only Skills artifact family inside the independent
  Radar project. It is not connected to the substrate, GitHub repo analysis,
  or any skill runtime.
- Added curated first-party source configuration for `openai/skills` and
  `anthropics/skills`, plus a bounded GitHub Code Search query matrix for
  public community `SKILL.md` manifests. The collector reads repository
  metadata, a Git tree, and frontmatter `name`/`description` only; it neither
  clones, saves instruction bodies, installs, nor executes Skills.
- Initial collection produced 105 high-recall metadata records. The generated
  public Skills shelf shows 37 records with transparent education/learning/
  research/workflow metadata signals; the gate is not a pedagogical-quality or
  runtime-compatibility assertion.
- Added the GitHub / Skills header switch, bilingual Skills UI, source and
  ecosystem/resource filters, and explicit links from every card to its source
  GitHub repository and public `SKILL.md` manifest.
- Browser check confirmed the Skills switch renders 37 cards, source repository
  links use GitHub URLs, and no client console warnings/errors occurred. No
  package installation, deployment, paid service, database, model backend, or
  external Skill execution was authorized or performed.

## 2026-08-10 — education datasets and benchmarks refresh

- Expanded the `dataset-benchmark` discovery matrix with eight bounded English
  and Chinese query routes: knowledge tracing, learning analytics, education
  dialogue, assessment/exam data, education-LLM benchmarks, Chinese education
  datasets, Chinese educational evaluation, and examination benchmarks.
- Added exact paper/repository leads for EduBench, Edu-Values, M3KE, GAOKAO-MM,
  GAOKAO-Bench, ScratchMath, Education Dialogue Dataset, EduData, and
  MathTutorBench. Seven of the first eight and MathTutorBench were verified by
  GitHub REST metadata; the paper-linked `zhangpeii/Edu-Values` URL returned
  GitHub 404 and remains an explicit error record rather than a guessed match.
- Completed 10 bounded GitHub Search requests (one page each, sorted by recent
  update) and deduplicated all findings by numeric GitHub repository ID. The
  registry now has 3,536 records: 631 datasets and 321 benchmarks; 3,513
  records are API-verified.
- Fixed `seed` reconciliation so a verified exact repository absorbs its lead
  provenance without re-creating a duplicate `lead:` placeholder on later runs.
  The refresh removed eight stale placeholders while preserving first-seen,
  notes, and provenance.
- Generated `reports/data-quality-2026-08-10-dataset-benchmark.md` (0
  structural errors), rebuilt the allowlisted public snapshot, and copied it to
  the React UI. The public catalog now has 1,011 entries, including 99 datasets
  and 28 benchmarks. No source code was cloned, downloaded, or analyzed.

## 2026-08-17 — scheduled metadata refresh

- Checked `github-radar/` status before work; preserved the pre-existing
  untracked 2026-08-10 quality report because this run does not overwrite it.
- The active GitHub CLI token was invalid. A one-record bounded incremental
  refresh made zero API requests after DNS resolution also failed, so no live
  discovery or metadata updates were incorporated.
- Rebuilt the allowlisted public snapshot and synced the web copy from the
  existing registry. Structural validation passed with 0 errors; the registry
  remains 3,536 records and the public curated snapshot remains 1,011 records.

## 2026-08-30 — Staff directory relink and bounded refresh

- Confirmed that `edu-ai-builders/edu-ai-builders-site` embeds the standalone
  Radar deployment at `/directory`; the Radar source was not migrated into the
  Staff website repository. Documented this repository as the single source of
  truth and the Staff directory as the primary visitor entry point.
- Added an explicit source-repository link and a configurable
  `NEXT_PUBLIC_RADAR_URL` integration contract to the Staff directory. No
  registry or snapshot was copied into the Staff website.
- Ran a bounded authenticated refresh of 50 existing GitHub records: 49 updated
  successfully and `zackmillertawp1396/ai-vocab-builder-2026` returned 404. The
  missing repository was retained as auditable source state rather than deleted.
- Refreshed 63 first-party Skill manifests from the approved `openai/skills` and
  `anthropics/skills` sources with no failures. The metadata registry now has
  131 records; the education-filtered public snapshot increased from 51 to 53.
- Rebuilt and synced both allowlisted snapshots. Project and Skills validation
  each reported 0 structural problems. The Radar production build and the Staff
  website lint/production build both passed.
- Replaced the Staff directory's cross-domain iframe contract with a Next.js
  multi-zone contract. Radar now builds with `/directory` as its base path, and
  the Staff site proxies `/directory` plus nested assets and API routes while
  preserving the Builder Site domain. Local end-to-end checks returned 200 for
  the page and a proxied `/_next` asset; the suggestion API was reachable at
  `/directory/api/suggestions` and returned the expected database-not-configured
  response.
