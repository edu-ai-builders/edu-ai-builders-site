# Edu AI Builders

The public website for [Edu AI Builders](https://github.com/edu-ai-builders): open infrastructure for anything you want to build regarding education.

At the center of the system is **EduOS**, a pedagogical runtime that connects agents and models with external knowledge, reusable teaching capabilities, interface assets, and evaluation.

## System map

- **Agents & Models** — pluggable intelligence providers, including local models and harness adapters.
- **Loom** — external knowledge from papers, repositories, datasets, and open skills.
- **EduOS** — the shared pedagogical runtime.
- **Skills + Gallery** — reusable skills, UI patterns, workflows, and worked examples.
- **Evaluator + Lens** — pedagogical evaluation and feedback.

Components that are not yet public are labeled as in development on the site.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm run start
```

## License

Website source is published for transparency. Individual Edu AI Builders repositories specify their own licenses.

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
`2d6c6d5`, with an iframe for `/directory`. This change preserves that integration;
the later `codex/eduos-system-refresh` rewrite is a separate unpublished change.
