import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
const require = createRequire(import.meta.url);
function load(path, imports = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", code)(name => imports[name] ?? require(name), loaded, loaded.exports);
  return loaded.exports;
}
const seo = load("app/seo/metadata.ts");
const courses = load("app/content/courses.ts");
const resources = load("app/content/resources.ts");
test("page canonical and social URLs agree, including localized title", () => {
  const metadata = seo.withSeo({ title: "Learning", description: "Build a tool" }, "/learn", "en");
  assert.equal(metadata.alternates.canonical, "https://edu-ai-builders.dev/learn");
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.openGraph.locale, "en_US");
  assert.equal(metadata.twitter.title, "Free AI Coding and Learning Science Courses");
  assert.equal(seo.withSeo({title: {default: "Home", template: "%s"}}, "/").openGraph.title, "Home");
});
test("sitemap includes every current course and runnable resource, excludes redirects", () => {
  const sitemap = load("app/sitemap.ts", {"./seo/metadata": seo, "./content/courses": courses, "./content/resources": resources}).default();
  const urls = sitemap.map(entry => entry.url);
  assert.equal(new Set(urls).size, urls.length);
  for (const course of courses.courses) assert.ok(urls.includes(`${seo.SITE_URL}/learn/${course.slug}`), JSON.stringify({slug:course.slug,urls}));
  for (const resource of resources.resources.filter(r => r.artifactPath)) assert.ok(urls.includes(`${seo.SITE_URL}/use/${resource.id}`));
  assert.ok(!urls.includes(`${seo.SITE_URL}/updates`));
  assert.ok(!urls.includes(`${seo.SITE_URL}/learn/git-first-checkpoint`));
  assert.ok(sitemap.every(entry => !entry.lastModified && !entry.url.includes("?")));
});
test("robots advertises canonical sitemap and structured data is valid JSON", () => {
  assert.equal(load("app/robots.ts", {"./seo/metadata": seo}).default().sitemap, `${seo.SITE_URL}/sitemap.xml`);
  const component = load("app/seo/structured-data.tsx", {"./metadata": seo}).default();
  const data = JSON.parse(component.props.dangerouslySetInnerHTML.__html);
  assert.equal(data["@graph"][0]["@type"], "Organization");
  assert.equal(data["@graph"][1].publisher["@id"], data["@graph"][0]["@id"]);
});
