# Edu AI Builders

A place to learn, use existing educational tools, build with reusable materials, and understand the design considerations behind them.

## Active implementation

The original website is published from `main`; development was integrated from `codex/original-site`. The GPT-hosted preview remains separate and unchanged. The September 22 release publishes the bilingual revamp and refreshed directory to the existing Vercel project.

- `/learn`: seven courses / 74 lessons, with illustrated lessons, explicit practice records and concept links.
- `/use`: selected existing tools, available to open and download.
- `/build`: components and Skills, with editorial explanations of their knowledge connections.
- `/atlas`: Learning Sciences map, typed relations, courses, resources, and browser-local learning records.
- `/learning-sciences`: the original full research library and deep links.
- `/directory`: the native searchable Radar catalog, with a dated GitHub metadata snapshot.
- `/skills`: education resource search, three scenario build briefs, four downloadable agent skills, local saved plans and contribution drafts. The supporting scenario and workflow pages are included in the November 7 directory release; see [implementation](docs/builder-mvp/implementation-2026-10-11.md).
- `/changelog`: dated releases and development changes, plus clearly separated future exploration. `/updates` redirects here.
- `/updates/research`: preserved EduOS, Loom and system research direction, not a callable-service claim.

The header supports Chinese and English, including all course lessons and interactive tools. Language choice persists in a preference cookie; saved learning records share stable identifiers across languages. Original external descriptions and research documents retain their source language. See [bilingual implementation](docs/bilingual-site-2026-09-21.md).

## Development and validation

```bash
npm ci
npm run dev
node scripts/check-translations.mjs
node --experimental-strip-types --test tests/*.test.mjs app/atlas/atlas.test.mjs
npm run lint
npm run build
```

## Directory refresh

```bash
python3 scripts/refresh-directory.py
# To review and export retained evidence without GitHub requests:
python3 scripts/refresh-directory.py --offline
python3 -m unittest discover -s tests -p 'test_*.py'
```

The collector and canonical registries live in `radar/` in this repository. `/directory` is the single discovery display for Skills, reusable code, datasets, benchmarks, open learning materials and knowledge graphs. The refresh collects bounded public metadata, applies reversible review decisions, rebuilds the shared index and exports the website snapshot. Fatal collection or validation failures stop website export and retain the last successful website data. Isolated source failures remain visible as partial runs. Export dates never replace source-verification dates. Review the diff and run validation before publishing. This command does not commit, push or deploy. See [November 6 scope](docs/directory-2026-11-06/brief.md).

## Data ownership

Research stays in `public/learning-sciences/0.2.0/rack.json`, with stable IDs and original sources/conditions/risks. Course sequencing, Chinese editorial labels, resource associations, and personal records are separate layers. A research relation such as `requires` is not automatically a prerequisite lesson. A resource association is not evidence of pedagogical effectiveness.

Selected tool copies are recorded in `docs/tool-source-manifest.json`; do not copy the entire local research library into public assets. The language asset license accompanies its redistributed templates. Update public copies through an explicit source review.

Learning/practice records stay in this browser. Opening a node is not evidence of mastery. EduOS and Working Graph remain exploratory; no accounts or model service has been added. The Skills MVP adds stateless catalog and build-brief API endpoints.

## Hosting boundary

Existing Vercel configuration is preserved. Do not add a Sites project or replace the saved GPT preview as part of this work. Production publication requires explicit user authorization. The existing Vercel project currently has no Git integration, so pushing `main` alone does not deploy; publish through that existing project after validation.

## License

Individual source repositories retain their license terms. Public source availability does not grant a new license on behalf of those repositories.

## Learning Sciences

`/learning-sciences` is the first-party learning sciences knowledge library. It is
independent of `/directory`, which indexes open-source repositories, skills and
datasets through EduOS Radar.

The page includes all 180 entries from draft version 0.2.0, seven classification
facets, evidence filtering, complete conditions and risks, observations, source
records, and 217 navigable relationships. Entry and filter URLs can be shared.

The versioned public snapshot in `public/learning-sciences/0.2.0` is copied
without content changes from `ywEdAi/learning-sciences` at commit
`0829bb04b7507ac779e8478bbf1d724f0963c408`. It is bundled with the site;
page requests do not call GitHub or execute research code. Refreshing it is an
explicit reviewed change. Sources were checked in the original August 30
snapshot, not reverified at website publication.

```bash
node --test tests/learning-sciences.test.mjs
npm run build
```

The existing public site at the start of this change was based on
`2d6c6d5`, with an iframe for `/directory`. The current revamp replaces that iframe with a first-party directory and reviewed data snapshot;
the later `codex/eduos-system-refresh` rewrite remains separate.

## Builder catalog and skill packages

```bash
python3 scripts/sync-directory.py
python3 scripts/package-builder-skills.py
npm run dev -- --port 3101
node packages/builder-tools/cli.mjs search --base-url http://127.0.0.1:3101 --args '{"query":"science","limit":5}'
```

The in-repository `radar/` module owns discovery and review. The weekly task uses `scripts/refresh-directory.py` to update the shared website snapshot. `/skills` redirects search to `/directory`; scenario, workflow, contribution and saved-plan pages remain available. Deployment remains a separate authorized publication step. New agent skill sources and local CLI/MCP adapter live in `packages/`. They are not globally installed or published to npm. Third-party bodies are not bundled. Review the two detailed scopes and examples under `docs/builder-mvp/` before behavioral evaluation or release.

## Repo Adapter and Skill Fusion iteration — October 12

The two downloadable skills are v0.2.1, with targeted references, structured handoff/fusion templates, optional Python-standard-library evidence helpers and normal automatic discovery metadata. Independent local forward-test artifacts and raw fixtures are in `tests/skill-evals/`. See [iteration evidence](docs/builder-mvp/skill-iterations-2026-10-12.md).

```sh
python3 tests/test_skill_workflows.py
```

These checks distinguish source identity and structure from reasoning walkthroughs and actual application execution. Distribution is prepared locally; nothing was globally installed or published.

## November 7 production release

The user authorized production publication of the unified directory and shared search. The release includes its Skills scenario/workflow dependencies and its required Skills pages. The daily cloud workflow remains prepared locally because the current GitHub credentials cannot publish workflow files. Local component/dependency cleanup from another task is excluded. The existing Vercel project remains the production host; pushing source alone does not deploy. See [release evidence](docs/directory-2026-11-06/production-release-2026-11-07.md).
