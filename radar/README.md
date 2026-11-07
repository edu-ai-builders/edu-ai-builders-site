# Edu AI Builders directory collector

The canonical source now lives in `apps/site-original/radar/` inside the Edu AI Builders website repository. The old `apps/radar/` path is a symlink to this directory. The old standalone GitHub repository and deployed frontend are historical; they are not publication targets for this workflow.

`/directory` is the single public display. Skills, reusable projects and libraries, datasets, tutor and model benchmarks, open textbooks and knowledge graphs support personal learning, teaching, interdisciplinary research and educational systems administration. Generic building resources need a clear reusable role.

Run from the website root:

```sh
python3 scripts/refresh-directory.py
python3 scripts/refresh-directory.py --offline
python3 radar/scripts/review_resources.py --date 2026-11-06
python3 radar/scripts/test_resource_review.py
python3 radar/scripts/test_taxonomy.py
```

Discovery phrases only record provenance. Confirmed facets, artifact type, source verification, scoped license observations and runtime evidence are separate. Review decisions are reversible. Raw registries and run history remain intact. Retained `site/` and `web/` files are local legacy readers and compatibility exports, excluded from website publication.

The only source destination is `https://github.com/edu-ai-builders/edu-ai-builders-site.git`. Collection and export do not commit, push or deploy. The weekly task prepares the local reviewed website snapshot and reports actual network failures.

Current scope, coverage and verification live in [the November 6 record](../docs/directory-2026-11-06/brief.md). Historical Radar documentation retains its original dates and may describe the retired standalone architecture.
