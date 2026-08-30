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

## Directory integration

`/directory` is the canonical public entry point for
[EduOS Radar](https://github.com/ywEdAi/eduos-github-radar). It uses a Next.js
multi-zone rewrite so the Radar page, assets, support route, and suggestion API
all remain under the Edu AI Builders domain. There is no cross-domain iframe and
this website does not maintain a second registry copy.

The rewrite defaults to the production Radar service. Set the server-only
`RADAR_ORIGIN` at build time to connect a preview deployment or local Radar
server without changing the visitor-facing `/directory` URL.

## Production

```bash
npm run build
npm run start
```

## License

Website source is published for transparency. Individual Edu AI Builders repositories specify their own licenses.
