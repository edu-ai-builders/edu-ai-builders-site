import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import * as sharedSearch from "../app/lib/search/index.mjs";
const require=createRequire(import.meta.url);
function load(file,imports={}){const code=ts.transpileModule(readFileSync(new URL(`../${file}`,import.meta.url),"utf8"),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;const m={exports:{}};new Function("require","module","exports",code)(n=>imports[n]??require(n),m,m.exports);return m.exports;}
const core=load("app/lib/builder-core.ts", {"./search/index.mjs":sharedSearch});const {builderScenarios:scenarios,builderSkills:skills,builderScopes:scopes}=load("app/content/builder-scenarios.ts");
const catalog=JSON.parse(readFileSync(new URL("../public/data/builder/index.json",import.meta.url)));const families=JSON.parse(readFileSync(new URL("../public/data/builder/discovery.json",import.meta.url))).families;
const {createTranslator,translateData}=load("app/i18n/core.ts");const messages=JSON.parse(readFileSync(new URL("../app/i18n/builder.en.json",import.meta.url)));
test("three scenarios have twelve unique, traceable resource candidates and real course routes",()=>{
  assert.equal(scenarios.length,3);assert.equal(new Set(scenarios.flatMap(s=>s.resourceIds)).size,12);
  const {courses}=load("app/content/courses.ts");
  for(const s of scenarios){assert.equal(s.resourceIds.length,s.resourceRoles.length);for(const id of s.resourceIds)assert.ok(catalog.records.some(r=>r.resource_id===id),id);for(const slug of s.courses)assert.ok(courses.some(c=>c.slug===slug));}
});
test("bilingual synonym search, filters and stable pagination preserve evidence",()=>{
  const zh=core.searchResources(catalog.records,families,{query:"科学"});const en=core.searchResources(catalog.records,families,{query:"science"});
  assert.ok(zh.records.length&&en.records.length);assert.ok(zh.records.some(r=>en.records.some(e=>e.resource_id===r.resource_id)));
  assert.ok([zh,en].every(result=>result.retrieval.concepts.some(c=>c.id==="science")));
  const unknown=core.searchResources(catalog.records,families,{platform:"unknown"});assert.equal(unknown.total,0);
  const filtered=core.searchResources(catalog.records,families,{reviewed:true,limit:50});assert.ok(filtered.records.every(r=>r.curated&&r.reuse_status==="license-observed"));
  const mobile=core.searchResources(catalog.records,families,{platform:"mobile",limit:50});assert.equal(mobile.total,catalog.records.filter(r=>(!r.review||r.review.status==="include")&&r.facet_hints.platforms.some(p=>["mobile","ios","android"].includes(p))).length);assert.ok(mobile.records.every(r=>r.facet_hints.platforms.some(p=>["mobile","ios","android"].includes(p))));
  const math=core.searchResources(catalog.records,families,{subject:"mathematics",limit:50});assert.equal(math.total,catalog.records.filter(r=>(!r.review||r.review.status==="include")&&r.facet_hints.subjects.includes("mathematics")).length);assert.ok(math.records.every(r=>r.facet_hints.subjects.includes("mathematics")));
  const one=core.searchResources(catalog.records,families,{limit:5,page:1});const two=core.searchResources(catalog.records,families,{limit:5,page:2});assert.equal(new Set([...one.records,...two.records].map(r=>r.resource_id)).size,10);assert.equal(one.model_calls,0);
  assert.equal(core.searchResources(catalog.records,families,{query:"zzzzunlistedcapability"}).total,0);
});
test("commercial science briefs exclude restricted data and retain scoped provenance",()=>{
  const s=scenarios.find(s=>s.slug==="science-evidence");const brief=core.exportBrief(s,catalog.records,{goal:"课堂证据活动",platform:"web",commercial:true});assert.ok(brief.omittedIds.includes("repo:552715974"));assert.ok(!brief.resourceIds.includes("repo:552715974"));assert.match(brief.markdown,/CC-BY-4\.0/);assert.match(brief.markdown,/runtime_tested=unknown/);
  const research=core.exportBrief(s,catalog.records,{goal:"",platform:"web",commercial:false});assert.ok(research.resourceIds.includes("repo:552715974"));
});
test("English brief and scopes retain intent without Chinese UI leakage",()=>{
  const t=createTranslator("en",messages);const s=translateData(scenarios[0],t);const brief=core.exportBrief(s,catalog.records,{goal:"Bilingual, mobile-first",platform:"mobile",commercial:true,locale:"en"});assert.match(brief.markdown,/Bilingual, mobile-first/);assert.match(brief.markdown,/staged|hint/i);assert.doesNotMatch(brief.markdown,/[\u3400-\u9fff]/);
  const translated=translateData(scopes,t);assert.doesNotMatch(JSON.stringify(translated),/[\u3400-\u9fff]/);assert.equal(translated[0].name,scopes[0].name);
});
test("guide returns genuine matches and preserves no-match state",()=>{
  assert.equal(core.matchScenarios(scenarios,"给孩子做分数练习")[0].scenario.slug,"family-math");assert.equal(core.matchScenarios(scenarios,"literature research")[0].scenario.slug,"research-workflow");assert.deepEqual(core.matchScenarios(scenarios,"quantum operating system"),[]);assert.deepEqual(core.matchScenarios(scenarios,""),[]);
});
test("download packages match manifest hashes and scope coverage",()=>{
  const manifest=JSON.parse(readFileSync(new URL("../public/downloads/skills/manifest.json",import.meta.url)));assert.equal(manifest.packages.length,4);for(const s of skills){assert.ok(scopes.some(c=>c.name===s.name));const pack=manifest.packages.find(p=>p.name===s.name);assert.ok(pack);assert.equal(pack.version,s.version);assert.equal(createHash("sha256").update(readFileSync(new URL(`../public/downloads/skills/${pack.archive}`,import.meta.url))).digest("hex"),pack.sha256);}
});
test("source example contains real symbols and a fixed local source hash",()=>{
  const example=JSON.parse(readFileSync(new URL("../public/downloads/scopes/repo-adapter-example.json",import.meta.url)));const source=readFileSync(new URL(`../${example.source.path}`,import.meta.url),"utf8");assert.match(source,/function showFeedback\(/);assert.match(source,/function updateDisplay\(/);assert.equal(createHash("sha256").update(source).digest("hex"),example.source.sha256);assert.equal(example.runtime_tested,false);assert.equal(example.mode,"redesign");
});

test("saved plans reject malformed browser data without losing valid plans",()=>{
  const {readSavedProjects}=load("app/lib/builder-projects.ts");
  const project={id:"sample",title:"Math",scenario:"family-math",savedAt:"2026-10-11",snapshot:"2026-10-11",markdown:"# Plan",resources:[{id:"repo:1",commit:null,reuse:"unknown",license:"[]"}],options:{goal:"Bilingual",platform:"mobile",commercial:true}};
  assert.deepEqual(readSavedProjects(JSON.stringify([project,{...project,savedAt:undefined},{...project,scenario:"../../"},{...project,resources:[{}]},{...project,options:{goal:"bad",platform:"invalid",commercial:true}}])),[project]);
  assert.deepEqual(readSavedProjects("broken"),[]);
  assert.equal(readSavedProjects(JSON.stringify(Array(11).fill(project))).length,10);
});
