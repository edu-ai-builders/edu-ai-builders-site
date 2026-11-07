# Edu AI Builders catalog tools — local MVP

A dependency-free read-only CLI and stdio MCP adapter. Requires Node 22.13+ and a running instance of this website. No npm publication or client registration has occurred. The public deployment may not yet include these API endpoints.

```sh
node packages/builder-tools/cli.mjs search --base-url http://127.0.0.1:3101 --args '{"query":"science","limit":5}'
node packages/builder-tools/cli.mjs brief --base-url http://127.0.0.1:3101 --args '{"scenario":"family-math","commercial":true}'
node packages/builder-tools/mcp.mjs --base-url http://127.0.0.1:3101
```

Use your client's supported stdio MCP configuration to launch the third command, with an absolute script path and an explicit catalog base URL. The adapter does not alter client configuration. Its tools are search_resources, get_resource and export_build_brief. Metadata and exported briefs come from the same website service as the browser. It neither installs resources nor runs third-party skills. User queries/goals are sent to the explicitly configured catalog; request bodies and credentials are not logged by this adapter.

Prepared package source can be inspected with `npm pack --dry-run`; publishing is a separate step. The API is stateless and snapshot-based. It does not provide account storage, hosted model execution, automatic skill fusion, payments or a remote streaming MCP endpoint.
