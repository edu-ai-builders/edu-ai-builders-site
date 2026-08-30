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

`/directory` embeds the independently deployed
[EduOS Radar](https://eduos-github-radar.vercel.app). The canonical registry,
collectors, generated snapshots, and Radar frontend remain in the
[Radar source repository](https://github.com/ywEdAi/eduos-github-radar); this
website does not maintain a second data copy.

The embed defaults to the production Radar URL. Set `NEXT_PUBLIC_RADAR_URL` at
build time to point a preview deployment or local development session at a
different Radar instance.

## Production

```bash
npm run build
npm run start
```

## License

Website source is published for transparency. Individual Edu AI Builders repositories specify their own licenses.
