# Discovery, curation and search

Local implementation, November 6, 2026. No GitHub push or production deployment.

## What is running and what is staged

The existing desktop job `weekly-github-radar-refresh` runs Monday at 09:00 America/Los_Angeles. Its entry point is `python3 scripts/refresh-directory.py` in this website checkout. It collects bounded GitHub metadata, reviews it, and exports the directory and API snapshots. It does not publish the website. The original incident was a missing publication path, not proof that the displayed site read the refreshed Radar repository.

The new desktop job `daily-x-education-resource-leads` runs daily at 08:17 America/Los_Angeles. The user chose public web search with no added X API fees. It uses up to six public queries and saves only actual X post URLs through `radar/scripts/ingest_discovery_leads.py`. No native X API is configured. Both desktop jobs require the Mac and desktop scheduler to be available.

Five initial public searches yielded no qualifying posts. Two later diagnostic queries found secondary references, but direct X reads failed with a cache miss and HTTP 403. Those were not imported as verified posts. This is limited discovery coverage, not a reliable complete X feed. Repository metadata is verified independently; announcements never establish functionality, license or quality.

`update_directory.hydrate_discovery_leads` consumes at most two canonical GitHub leads per collection, normalizes real API responses and adds original post provenance. Failed leads retry. Hugging Face or unresolved links remain pending manual review. The normal resource policy decides visibility. A successful source response is not a runtime check.

`.github/workflows/directory-discovery.yml` prepares daily cloud GitHub collection at 11:23 UTC. It is staged, not active. Publishing it to the default branch, enabling Actions/PR permissions and testing the actual runner are still required. It uses the latest default-branch code/configuration, restores only allowlisted JSON metadata/state, and checkpoints one `automation/directory-candidates` branch with one review PR. It never merges or deploys. Failed export checkpoints preserve the last consistent data and progress cursors together, while retaining attempt/error health records.

Collection health separates last attempt, last successful observation, new observations and last export. Offline export never renews network freshness. One record failure can produce a partial usable export; zero observations or failed validation block website export. Skill code search and repo search have independent progress. Actual token capabilities remain visible instead of assuming code search works.

The final real local run completed on November 6 (03:30 UTC November 7). It made 217 API requests and recorded 89 valid observations, including eight successful Builder queries. It added 31 repository records and ten Skills. Its partial status explicitly retained a 404, a truncated tree and a license review condition. Website export completed. This is one observed local run, not proof of cloud or long-term reliability.

## Coverage and keywords

There are 30 Builder discovery families, with 60 Skill queries and 30 repo queries. Eight queries per run are balanced across kinds. A phrase pass takes about 15 runs for Skills and eight for repos. Only two results per query visit are sampled. Eight curated source trees rotate two per run; a 50-manifest tree sampled two per visit takes about 100 daily runs for a full rotation. Failures and budgets can extend these bounds. Daily scheduling does not mean daily exhaustive discovery.

The families cover parents, teachers, higher education, research, self learning, educational research, tutor evaluation, training data, open textbooks, knowledge graphs, systems administration, assessment, learning analytics, mathematics, science, languages, humanities, arts, computing, accessibility, biology, chemistry, statistics, web/mobile/desktop, design, data, Skill authoring and repo adaptation. Representative phrases include `filename:SKILL.md "home learning"` and `filename:SKILL.md "家庭辅导"`. The complete editable phrases are in `radar/config/builder-discovery.json`, `directory-query-matrix.json`, `query-matrix.json`, `skill-query-matrix.json` and `x-discovery.json`; see [keyword review](keywords.md).

Discovery phrases control collection. Internal website retrieval now has a separate shared concept lexicon. A phrase match is provenance, not a confirmed audience, subject, capability, platform or reuse right.

## Taste and evidence

The product purpose is reusable components for self learning, teaching, research and educational systems administration. Applications, libraries, Skills, datasets, benchmarks, textbooks and knowledge graphs have distinct roles. Language and age are not blanket exclusion rules. Inactive runtime software needs an additional check; stable old knowledge/data can remain useful.

Policy decisions are include, review or exclude, with recoverable reasons. Most included resources still have metadata evidence only. Editorial source review is displayed separately and expires after 180 days. Where a reviewed commit and current pin are both recorded, a changed source returns to review. Older unbound annotations cannot establish version-specific suitability.

This pass moved a trading Skill, a crypto-rewards news platform and a sales workflow to review because an education/research reuse role was not evidenced. This is contextual screening, not a ban on those domains. Stars indicate popularity. They are not quality scores. Runtime safety, compatibility and learning outcomes remain unknown unless separately checked.

A human relevance set is still needed before claiming strong taste or reliable ranking quality. Review disagreements and missing-candidate cases separately. The published 40-query Bridge experiment is useful as a regression reference, but its labels are agents' judgments and its queries are already exposed. Its historical nDCG does not measure this new catalog.

## Shared retrieval

`app/lib/search` reuses the October 29 Bridge ranker and lexicon unchanged; `origin.json` records exact source paths and SHA-256 hashes. The adapter applies current review filters, conservative constraint evidence, exact compound-name aliases and bilingual knowledge-graph aliases. Recognized task concepts rank before incidental residual wording. Both the directory and `/api/resources` use it.

Long requests no longer require every word to occur. Results explain direct matches, bilingual expansion, partial Chinese fragments, missing concepts and unknown requirements. Unknown offline, commercial or API conditions do not receive suitability boosts. GPL metadata is not an unconditional commercial-use decision. A no-match message says the current directory lacks sufficient evidence; it does not claim no resource exists anywhere.

Explicit type, task, language and evidence filters remain hard filters. Default browsing puts curated/source-reviewed metadata before broad metadata leads. This is resource discovery, not an automatic compatible agent bundle. Natural-language ranking can still be noisy, including overly broad literature or interview associations. No current human relevance score is claimed.

## Verification

See `verification.json`, `verification-discovery-search.json`, `health-observed.json` and the decision trail. Independent review caught and prompted fixes for dropped progress/data consistency and false whole-phrase Chinese matching. Source import, cloud checkpoint and health checks have behavioral tests. The real cloud runner and repeated cross-run checkpoints are not verified until publication.
