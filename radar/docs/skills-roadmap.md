# Skills catalog roadmap

## 2026-10-10 product scope update

The user has expanded the product plan to an education-specific marketplace and
resource assistant, with maintenance subscriptions, creator submissions, search,
design/planning, repository adaptation and workload-based skill fusion. The
[current MVP scope](../../../docs/education-builder-mvp-2026-10-10.md) supersedes
the earlier product restriction below. Current collection remains metadata-only;
marketplace transactions, deep source analysis and Skill execution are proposed
separate workflows, not enabled by the collector. Bounded community discovery is
now configured in `config/builder-discovery.json`, alongside the existing curated
`config/skill-sources.json` sources.

## Product boundary

The Skills catalog is an education-oriented, metadata-only directory within
GitHub Radar. It lists public skill manifests and the GitHub repository that
contains each skill; it does not download, install, execute, reproduce, or
evaluate a skill's instruction body or bundled code. It is not a general Skill
Marketplace. A listing is not a claim that a skill is safe, pedagogically
effective, or compatible with every agent runtime.

The first sources are the public first-party `openai/skills` and
`anthropics/skills` collections. Future community sources must be curator-added
to `config/skill-sources.json`, remain public, and be attributable to a source
repository.

## Collection route

1. Fetch source-repository metadata and a recursive Git tree through GitHub's
   API. Do not clone a repository.
2. Identify `SKILL.md` files below the source's declared skill root.
3. Read only YAML-frontmatter `name` and `description`; record links to the
   public manifest and source GitHub repository. The instruction body never
   enters the registry.
4. Derive only structural hints from file paths (`scripts`, `references`, and
   `assets` present). These are not a security assessment.
5. Deduplicate using the source repository's numeric GitHub ID plus manifest
   path. Preserve `first_seen`; update `last_seen` and `fetched_at` on refresh.
6. Keep a high-recall local registry, then expose only Skills with transparent
   education/learning/research/workflow metadata signals or later human curation.
   The gate is not a pedagogical-effectiveness claim.
7. Generate a read-only public JSON snapshot and cache it at build/deploy time.

## Staged product work

### Stage 1 — public Skills shelf

- GitHub / Education Skills switch in the existing Radar.
- Search, ecosystem, source, and resource-hint filters.
- First-party source provenance, manifest links, license and update metadata.
- Bilingual descriptions of what the directory does and does not verify.

### Stage 2 — learning-oriented curation

- Add human-reviewed `learning_use_cases`, `skill_kind`, and `adaptation_level`.
- Distinguish a complete workflow, a specialist helper, and a reusable
  capability primitive. Do not infer these from a skill name alone.
- Publish small curated learning paths that reference skills and repositories
  without republishing either package.

### Stage 3 — intent-first discovery

- Accept an editable `ProblemSpec`: learner/teacher role, task, setting,
  constraints, existing tools, desired outcome, and whether the user wants to
  use, adapt, or learn from a skill.
- Start with structured filters and Postgres full-text search. Add pgvector only
  for semantic recall after curated descriptors exist.
- Keep retrieval, ranking, and generated explanations separate. A model may
  suggest candidates but must cite the stored manifest metadata and never claim
  to have executed a skill.

### Stage 4 — EduOS handoff

- Define portable `ProblemSpec`, `EduBuildBrief`, and `EvalReport` contracts.
- Export a selected repo/skill stack into EduOS for pedagogical grounding and
  artifact evaluation.
- Feed only aggregated, non-private curation lessons back to the public Radar;
  private learner goals and evaluation reports do not become listings.

## Backend choice when Stage 3 starts

Use the same managed Postgres proposed for Radar submissions, with `pgvector`,
instead of a separate vector database at this scale. Keep embeddings and model
calls server-side. The relational store remains authoritative for source URLs,
license, compatibility declarations, timestamps, and human review status;
vector similarity is recall only.

## Reproducible commands

```bash
cd github-radar

# Reads only repository metadata, Git trees, and SKILL.md frontmatter.
GH_TOKEN="$(gh auth token)" python3 scripts/crawl_skills.py

# Build static, allowlisted data for the public website.
python3 scripts/build_skills_site.py

cd web
npm run sync:data
npm run build
```
