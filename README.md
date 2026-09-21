# Edu AI Builders

A place to learn, use existing educational tools, build with reusable materials, and understand the design considerations behind them.

## Active implementation

This is the original-site worktree (`codex/original-site`). The GPT-hosted preview remains separate and unchanged. The September 20 revamp is a local implementation; it has not replaced the public site.

- `/learn`: seven courses / 74 lessons, with illustrated lessons, explicit practice records and concept links.
- `/use`: selected existing tools, available to open and download.
- `/build`: components and Skills, with editorial explanations of their knowledge connections.
- `/atlas`: Learning Sciences map, typed relations, courses, resources, and browser-local learning records.
- `/learning-sciences`: the original full research library and deep links.
- `/directory`: the native searchable Radar catalog, with a dated GitHub metadata snapshot.
- `/changelog`: dated local-preview changes, plus clearly separated future exploration. `/updates` redirects here.
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

## Data ownership

Research stays in `public/learning-sciences/0.2.0/rack.json`, with stable IDs and original sources/conditions/risks. Course sequencing, Chinese editorial labels, resource associations, and personal records are separate layers. A research relation such as `requires` is not automatically a prerequisite lesson. A resource association is not evidence of pedagogical effectiveness.

Selected tool copies are recorded in `docs/tool-source-manifest.json`; do not copy the entire local research library into public assets. The language asset license accompanies its redistributed templates. Update public copies through an explicit source review.

Learning/practice records stay in this browser. Opening a node is not evidence of mastery. EduOS and Working Graph remain exploratory; no backend, accounts, or model service has been added.

## Hosting boundary

Existing Vercel configuration is preserved. Do not add a Sites project or replace the saved GPT preview as part of this work. Run production deployment only as a separately authorized action after reviewing this version.

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
