# Catalog contract

Use a user-supplied deployment base URL or a running local preview. The new endpoints may not yet be deployed on the public domain. Local example base URL: `http://127.0.0.1:3100`.

- `GET /api/resources?q=...&kind=skill&audience=teachers&platform=web&page=1&limit=12` searches the current snapshot. Optional filters: subject, capability, reviewed=true. Limit is capped at 50. Queries use keyword/synonym AND matching, not an LLM.
- `GET /api/resources?id=<URL-encoded-resource-id>` returns one source record or 404.
- `POST /api/build-brief` accepts scenario (`family-math`, `science-evidence`, `research-workflow`), goal, platform (`web`, `mobile`, `desktop`), commercial (boolean), locale (`zh`, `en`). It returns a template-derived Markdown brief and source IDs; changing the goal still requires checking scenario fit.

Records distinguish source verification, scoped license observation and runtime testing. `reuse_status=license-observed` is an observation, not unconditional authorization. `facet_hints` are inferred. The source index is `/data/builder/index.json` in this website checkout; a local file can be searched without network calls.

The optional stdio adapter in `packages/builder-tools` exposes search_resources, get_resource and export_build_brief against the same API. A skill package does not itself register that adapter in the agent.
