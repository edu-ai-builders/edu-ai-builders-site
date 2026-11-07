import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { collectionFor, dateLabel, featured, filterRecords, licenseLabel, normalizeQuery, tasksFor } from '../app/directory/model.ts';
const catalog = JSON.parse(await readFile(new URL('../public/data/radar/catalog.json', import.meta.url), 'utf8'));
const filters = { query:'', collection:'all', task:'all', language:'',  hideArchived:true, hideUnavailable:true, sort:'relevance' };

test('public Radar snapshot is internally consistent, unique and uses safe source URLs', () => {
  const { records, summary } = catalog;
  assert.equal(records.length, summary.total);
  assert.equal(new Set(records.map(r => r.id)).size, records.length);
  assert.equal(records.filter(r => r.kind === 'skill').length, summary.skills);
  assert.equal(records.filter(r => r.kind !== 'skill').length, summary.repositories);
  assert.equal(records.filter(r => r.refreshStatus === 'refreshed').length, summary.refreshed);
  assert.equal(records.filter(r => r.refreshStatus !== 'refreshed').length, summary.notRefreshed);
  assert.equal(records.filter(r => r.refreshStatus === 'failed').length, summary.failed);
  for (const record of records) {
    assert.ok(record.id && record.title && record.name && record.source && record.importedFrom);
    for (const field of ['url','sourceUrl','homepage']) if (record[field]) assert.ok(['https:','http:'].includes(new URL(record[field]).protocol));
    if (record.refreshStatus === 'refreshed') assert.ok(record.checkedAt >= summary.refreshStartedAt);
    if (record.refreshStatus === 'failed') assert.ok(record.refreshError && record.checkedAt < summary.refreshStartedAt);
  }
});

test('Skill declaration checks are independent of repository checks and preserve failure dates', () => {
  for (const record of catalog.records.filter(r => r.kind === 'skill')) {
    if (record.refreshStatus === 'refreshed') {
      assert.ok(record.checkedAt >= catalog.summary.refreshStartedAt);
      assert.match(record.manifestSha, /^[a-f0-9]{40}$/);
      assert.match(record.source, /declarations/);
    } else {
      assert.ok(record.checkedAt < catalog.summary.refreshStartedAt);
    }
    assert.ok(record.repositoryCheckedAt);
    if (record.repositoryRefreshStatus === 'refreshed') assert.ok(record.repositoryCheckedAt >= catalog.summary.refreshStartedAt);
  }
});

test('Chinese editorial descriptions and normalized Latin search find meaningful results', () => {
  assert.equal(normalizeQuery('  ＧｉＴＨｕｂ  '),'github');
  const chinese = filterRecords(catalog.records, {...filters, query:'离线课堂'});
  assert.ok(chinese.some(r => r.name === 'learningequality/kolibri'));
  assert.equal(filterRecords(catalog.records, {...filters, query:'DATAWHALECHINA easy-vibe'})[0].name, 'datawhalechina/easy-vibe');
  assert.equal(filterRecords(catalog.records, {...filters, query:'zzzzunlistedproject9fa9f'}).length, 0);
});

test('type, task, freshness, archive, unavailable and language filters combine without leaking records', () => {
  const record = catalog.records.find(r => r.name === 'learningequality/kolibri');
  assert.ok(record);
  assert.ok(tasksFor(record).includes('teach'));
  const data = filterRecords(catalog.records, {...filters, collection:'data'});
  assert.ok(data.length > 0);
  assert.ok(data.every(r => collectionFor(r) === 'data'));
  assert.ok(filterRecords(catalog.records, filters).every(r => !r.archived && r.refreshError !== 'http-404'));
  const all = filterRecords(catalog.records, {...filters, hideArchived:false, hideUnavailable:false, showReview:true});
  assert.equal(all.length, catalog.records.length);
});

test('sorting is deterministic and never mutates the catalog; editorial starting points are real projects', () => {
  const before = catalog.records.map(r => r.id);
  const stars = filterRecords(catalog.records, {...filters, sort:'stars'});
  for(let i=1; i<stars.length; i++) assert.ok((stars[i-1].stars || 0) >= (stars[i].stars || 0));
  const pushed = filterRecords(catalog.records, {...filters, sort:'pushed'});
  for(let i=1; i<pushed.length; i++) assert.ok((pushed[i-1].pushedAt || '') >= (pushed[i].pushedAt || ''));
  assert.deepEqual(catalog.records.map(r => r.id), before);
  for (const name of Object.keys(featured)) assert.ok(catalog.records.some(r => r.name === name && r.kind !== 'skill'));
  assert.equal(licenseLabel('NOASSERTION'), '许可证待确认');
  assert.equal(licenseLabel(null), '许可证待确认');
  assert.equal(dateLabel(null), '暂无记录');
});

test('review decisions and resource types stay independent of popularity and archive date', () => {
  const defaults = {...filters, hideArchived:false};
  const base = catalog.records.find(r=>r.name==='openai/grade-school-math'&&r.kind==='dataset');
  assert.ok(base);
  assert.ok(filterRecords([base],defaults).length===1,'Archived stable datasets remain eligible');
  const uncertain={...base,id:'review:1',review:{...base.review,status:'review'}};
  const excluded={...base,id:'excluded:1',review:{...base.review,status:'exclude'}};
  assert.deepEqual(filterRecords([uncertain,excluded],defaults),[]);
  assert.deepEqual(filterRecords([uncertain,excluded],{...defaults,showReview:true}).map(r=>r.id),['review:1']);
  for (const name of ['HKUDS/DeepTutor','openai/plugins','d2l-ai/d2l-en','THU-KEG/EDUKG']) {
    assert.ok(filterRecords(catalog.records,{...defaults,query:name}).some(r=>r.name===name),name);
  }
  const react=catalog.records.find(r=>r.kind==='skill'&&r.title==='vercel-react-best-practices');
  assert.ok(react);
  assert.ok(!tasksFor(react).includes('teach'));
});

test('confirmed task routes and bilingual queries reach the current pilot resources', () => {
  const defaults={...filters,hideArchived:false};
  for (const [task,name] of [['learn','HKUDS/DeepTutor'],['operate','jupyterhub/jupyterhub'],['learn','THU-KEG/EDUKG']]) {
    assert.ok(filterRecords(catalog.records,{...defaults,task}).some(r=>r.name===name),task+':'+name);
  }
  assert.equal(collectionFor(catalog.records.find(r=>r.name==='THU-KEG/EDUKG')),'knowledge');
  assert.equal(collectionFor(catalog.records.find(r=>r.name==='d2l-ai/d2l-en')),'knowledge');
  for (const [zh,en] of [['科学','science'],['数学','math']]) {
    const chinese=filterRecords(catalog.records,{...defaults,query:zh});
    const english=filterRecords(catalog.records,{...defaults,query:en});
    assert.ok(chinese.length&&english.length);
    assert.ok(chinese.some(r=>english.some(e=>e.id===r.id)));
    assert.ok(chinese.some(r=>r.search_match.matched.some(m=>m.concept===en)));
  }
});
