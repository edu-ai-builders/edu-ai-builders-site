import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { searchCatalog } from '../app/lib/search/index.mjs';
import { searchResources } from '../app/lib/builder-core.ts';
import { searchDirectory } from '../app/directory/model.ts';

const resource = (id, extra={}) => ({
  id, resource_id:id, name:id, title:id, description:'', topics:[], kind:'repo',
  review:{status:'include',evidence_level:'metadata-only',reasons:[]},
  facet_hints:{}, facets:{}, stars:0, curated:false,
  ...extra,
});
const references=resource('references', {title:'Citation organizer',description:'Literature review with Zotero bibliography management',license:'GPL-3.0'});
const tutor=resource('tutor', {title:'Reasoning practice',description:'Math word problem tutoring with worked examples and step by step solutions'});
const directoryFilters={query:'',collection:'all',task:'all',language:'',hideArchived:true,hideUnavailable:true,sort:'relevance'};

test('Chinese and English task sentences find bilingual concepts without requiring every word', () => {
  const chinese=searchCatalog([references,tutor],'我想整理文献并管理引用');
  assert.equal(chinese.records[0].id,'references');
  assert.ok(chinese.records[0].search_match.matched.some(m=>m.concept==='literature'&&!m.direct));
  const english=searchCatalog([references,tutor],'Please help me practice word problems with tutoring guidance');
  assert.equal(english.records[0].id,'tutor');
  assert.equal(english.records[0].search_match.status,'related-only');
  assert.ok(english.records[0].search_match.missing.includes('guidance'));
  assert.equal(english.retrieval.coverageNeedsReview,true);
});

test('generic related results carry uncertainty and no meaningful match returns zero', () => {
  const research=resource('research',{description:'A research app'});
  const result=searchCatalog([research],'qualitative research');
  assert.equal(result.retrieval.status,'related-only');
  assert.deepEqual(result.records[0].search_match.missing,['qualitative']);
  assert.ok(result.retrieval.gaps.includes('qualitative'));
  const absent=searchCatalog([research],'zzzzunlisted');
  assert.equal(absent.total,0);
  assert.equal(absent.retrieval.status,'no-match');
});

test('compound project names remain searchable without supporting description text', () => {
  const record=resource('HKUDS/DeepTutor',{name:'HKUDS/DeepTutor',title:'DeepTutor'});
  for(const query of ['DeepTutor','deeptutor','HKUDS/DeepTutor']) {
    assert.equal(searchCatalog([record],query).records[0]?.id,record.id);
  }
});

test('site knowledge-graph aliases explain bilingual expansion without editing source descriptions', () => {
  const graph=resource('graph',{description:'An educational knowledge graph',kind:'knowledge'});
  const result=searchCatalog([graph],'知识图谱');
  assert.equal(result.records[0].id,'graph');
  assert.ok(result.records[0].search_match.matched.some(m=>m.via==='knowledge graph'&&!m.direct));
  assert.equal(result.records[0].description,graph.description);
  const chinese=resource('chinese',{description:'开放教育知识图谱',kind:'knowledge'});
  assert.equal(searchCatalog([chinese],'knowledge graph').records[0].id,'chinese');
});

test('review and exclusion decisions are hard filters before relevance scoring', () => {
  const pending=resource('pending',{description:'Literature review',review:{status:'review'}});
  const excluded=resource('excluded',{description:'Literature review',review:{status:'exclude'}});
  assert.deepEqual(searchCatalog([pending,excluded],'literature').records,[]);
  assert.deepEqual(searchCatalog([pending,excluded],'literature',{allowReview:true}).records.map(r=>r.id),['pending']);
});

test('unknown requirements stay unknown and provider absence does not establish free use', () => {
  for(const description of ['Literature review tool','Literature review tool with OpenAI']) {
    const result=searchCatalog([resource('unknown',{description})],'offline literature review commercial free');
    assert.deepEqual(result.records[0].search_match.constraints,{commercial:'unknown',offline:'unknown','no-paid-api':'unknown'});
  }
  const licensed=searchCatalog([references],'offline literature review commercial free');
  assert.equal(licensed.records[0].search_match.constraints.commercial,'copyleft-observed');
  assert.equal(licensed.records[0].search_match.constraints.offline,'unknown');
  const observed=resource('observed',{description:'Literature review',facets:{capabilities:['offline']}});
  // Builder facet_hints and Directory facets are alternative input shapes.
  delete observed.facet_hints;
  assert.equal(searchCatalog([observed],'offline literature').records[0].search_match.constraints.offline,'reviewed-metadata');
});

test('Builder API and Directory share retrieval and preserve explicit filters', () => {
  const dataset=resource('dataset',{description:'Word problem math reasoning dataset',kind:'dataset',language:'Python',facet_hints:{subjects:['mathematics']}});
  const records=[tutor,dataset];
  const builder=searchResources(records,[],{query:'word problems'});
  const directory=searchDirectory(records,{...directoryFilters,query:'word problems'});
  assert.deepEqual(builder.records.map(r=>r.id),directory.records.map(r=>r.id));
  assert.deepEqual(builder.retrieval,directory.retrieval);
  assert.deepEqual(searchResources(records,[],{query:'word problems',kind:'dataset',subject:'mathematics'}).records.map(r=>r.id),['dataset']);
  assert.deepEqual(searchDirectory(records,{...directoryFilters,query:'word problems',collection:'data',language:'Python'}).records.map(r=>r.id),['dataset']);
  assert.equal(searchResources(records,[],{query:'word problems',platform:'unknown'}).total,0);
});

test('empty browsing prioritizes editorial evidence, paginates stably, and leaves source data unchanged', () => {
  const records=[resource('popular',{stars:100000}),resource('reviewed',{review:{status:'include',evidence_level:'editorial-metadata-review'}}),resource('curated',{curated:true})];
  const before=structuredClone(records);
  assert.deepEqual(searchCatalog(records).records.map(r=>r.id),['curated','reviewed','popular']);
  const first=searchResources(records,[],{limit:1});
  const second=searchResources(records,[],{limit:1,page:2});
  assert.equal(first.records[0].id,'curated');
  assert.equal(second.records[0].id,'reviewed');
  assert.equal(second.pages,3);
  assert.equal(second.retrieval.status,'browse');
  assert.deepEqual(records,before);
});

test('frozen Bridge source copies match recorded provenance', async () => {
  const origin=JSON.parse(await readFile(new URL('../app/lib/search/origin.json',import.meta.url),'utf8'));
  for(const file of origin.files) {
    const content=await readFile(new URL(`../app/lib/search/${file.file}`,import.meta.url));
    assert.equal(createHash('sha256').update(content).digest('hex'),file.sha256);
  }
});


test('partial CJK fragments never establish complete task coverage', () => {
  const record=resource('heritage',{title:'古籍',description:'古籍资源'});
  const result=searchCatalog([record],'古籍修复方案');
  assert.equal(result.retrieval.status,'related-only');
  assert.equal(result.retrieval.coverageNeedsReview,true);
  const match=result.records[0].search_match;
  assert.deepEqual(match.missing,['古籍修复方案']);
  assert.equal(match.matched[0].partial,true);
  assert.equal(match.matched[0].via,'古籍');
  assert.equal(match.matched[0].direct,false);
});


test('recognized task evidence ranks before incidental workflow wording', () => {
  const incidental=resource('incidental',{description:'整理整理整理整理整理教学提示和项目笔记'});
  const result=searchCatalog([incidental,references],'我想整理文献并管理引用');
  assert.equal(result.records[0].id,'references');
  assert.equal(result.records[0].search_match.matched.some(m=>m.concept==='literature'),true);
});
