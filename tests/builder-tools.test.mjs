import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { callCatalog, configuredBase } from "../packages/builder-tools/client.mjs";

test("CLI/MCP adapter shares the catalog contract and isolates invalid requests", async () => {
  const requests = [];
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    requests.push({ method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams) });
    res.setHeader("Content-Type", "application/json");
    if (url.pathname === "/api/resources") {
      if (url.searchParams.get("id") === "missing") { res.statusCode = 404; res.end("{}"); return; }
      res.end(JSON.stringify({ records: [{ resource_id: "repo:1" }], total: 1, model_calls: 0 }));
    } else {
      let body = "";
      for await (const chunk of req) body += chunk;
      res.end(JSON.stringify({ brief: { markdown: "# Plan", ...JSON.parse(body) } }));
    }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = new URL(`http://127.0.0.1:${server.address().port}/`);
  let child;
  try {
    const result = await callCatalog(base, "search_resources", { query: "科学", reviewed: true, limit: 5 });
    assert.equal(result.model_calls, 0);
    assert.deepEqual(requests[0].query, { q: "科学", limit: "5", reviewed: "true" });
    await assert.rejects(callCatalog(base, "search_resources", { limit: 51 }), /Invalid limit/);
    await assert.rejects(callCatalog(base, "export_build_brief", { scenario: "family-math", locale: "invalid" }), /Invalid locale/);
    assert.throws(() => configuredBase(["--base-url", "https://user:secret@example.com"]), /Invalid catalog/);

    child = spawn(process.execPath, [new URL("../packages/builder-tools/mcp.mjs", import.meta.url).pathname, "--base-url", base.href], { stdio: ["pipe", "pipe", "pipe"] });
    let output = "";
    let errors = "";
    child.stdout.on("data", c => output += c);
    child.stderr.on("data", c => errors += c);
    const messages = [
      { id: 1, method: "initialize", params: { protocolVersion: "2025-03-26" } },
      { method: "notifications/initialized" },
      { id: 2, method: "tools/list" },
      { id: 3, method: "tools/call", params: { name: "export_build_brief", arguments: { scenario: "family-math", locale: "en", commercial: true } } },
      { id: 4, method: "tools/call", params: { name: "get_resource", arguments: { id: "missing" } } },
      { id: 5, method: "tools/call", params: { name: "search_resources", arguments: { unknown: true } } },
      { id: 6, method: "ping" },
    ];
    child.stdin.end("invalid-json\n" + messages.map(m => JSON.stringify({ jsonrpc: "2.0", ...m })).join("\n") + "\n");
    const [exit] = await once(child, "close");
    assert.equal(exit, 0, errors);
    const responses = output.trim().split("\n").map(JSON.parse);
    assert.equal(responses[0].error.code, -32700);
    assert.equal(responses.length, 7, "notifications must not produce replies");
    const byId = id => responses.find(r => r.id === id);
    assert.equal(byId(1).result.protocolVersion, "2025-03-26");
    assert.equal(byId(2).result.tools.length, 3);
    assert.ok(byId(2).result.tools.every(t => t.annotations.readOnlyHint));
    assert.equal(byId(3).result.structuredContent.brief.locale, "en");
    assert.equal(byId(4).result.isError, true);
    assert.equal(byId(5).error.code, -32602);
    assert.deepEqual(byId(6).result, {});
    assert.equal(requests.length, 3, "invalid arguments must not reach the catalog");
  } finally {
    child?.kill();
    await new Promise(resolve => server.close(resolve));
  }
});
