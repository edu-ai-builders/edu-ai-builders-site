import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { collectionFor, dateLabel, featured, filterRecords, licenseLabel, normalizeQuery, tasksFor } from '../app/directory/model.ts';
const catalog = JSON.parse(await readFile(new URL('../public/data/radar/catalog.json', import.meta.url), 'utf8'));
const filters = { query:'', collection:'all', task:'all', language:'', currentOnly:false, hideArchived:true, hideUnavailable:true, sort:'relevance' };

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

test('Skill content checks retain their original date independently from repository refreshes', () => {
  for (const record of catalog.records.filter(r => r.kind === 'skill')) {
    assert.equal(record.refreshStatus, 'not-refreshed');
    assert.ok(record.checkedAt < catalog.summary.refreshStartedAt);
    assert.ok(record.repositoryCheckedAt);
    if (record.repositoryRefreshStatus === 'refreshed') assert.ok(record.repositoryCheckedAt >= catalog.summary.refreshStartedAt);
  }
});

test('Chinese editorial descriptions, normalized Latin search and AND terms find meaningful results', () => {
  assert.equal(normalizeQuery('  ＧｉＴＨｕｂ  '),'github');
  const chinese = filterRecords(catalog.records, {...filters, query:'离线课堂'});
  assert.ok(chinese.some(r => r.name === 'learningequality/kolibri'));
  assert.equal(filterRecords(catalog.records, {...filters, query:'DATAWHALECHINA easy-vibe'})[0].name, 'datawhalechina/easy-vibe');
  assert.equal(filterRecords(catalog.records, {...filters, query:'not-a-real-project-9fa9f'}).length, 0);
});

test('type, task, freshness, archive, unavailable and language filters combine without leaking records', () => {
  const record = catalog.records.find(r => r.name === 'learningequality/kolibri');
  assert.ok(record);
  assert.ok(tasksFor(record).includes('teach'));
  const data = filterRecords(catalog.records, {...filters, collection:'data'});
  assert.ok(data.length > 0);
  assert.ok(data.every(r => collectionFor(r) === 'data'));
  const freshPython = filterRecords(catalog.records, {...filters, currentOnly:true, language:'Python', task:'make'});
  assert.ok(freshPython.length > 0);
  assert.ok(freshPython.every(r => r.refreshStatus === 'refreshed' && r.language === 'Python' && tasksFor(r).includes('make') && !r.archived));
  assert.ok(filterRecords(catalog.records, filters).every(r => !r.archived && r.refreshError !== 'http-404'));
  const all = filterRecords(catalog.records, {...filters, hideArchived:false, hideUnavailable:false});
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
