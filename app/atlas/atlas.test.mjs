import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chineseLabels, findEntries, labelFor, neighborIds, relationNames, topicDefinitions, topicFor } from './model.ts';
import { createProgressStore, parseLearningEvents, safeProjectUrl, stageOf, validLearningEvent } from '../lib/learning-progress-core.ts';
import { conceptGuides, designScenarios } from '../content/atlas-zh.ts';
const rack = JSON.parse(readFileSync(new URL('../../public/learning-sciences/0.2.0/rack.json', import.meta.url), 'utf8'));
const ids = new Set(rack.entries.map(e => e.id));
const event = { id: 'test-event-0001', conceptId: 'pedagogy:retrieval-practice', kind: 'explanation', text: '先尝试从记忆提取，再查阅原文核对。', createdAt: '2026-09-20T20:00:00.000Z' };
test('all rack entries have editorial labels and exactly one valid navigation topic', () => {
  assert.equal(rack.entries.length, 180);
  assert.equal(Object.keys(chineseLabels).length, 180);
  for (const entry of rack.entries) { assert.ok(labelFor(entry)); assert.ok(chineseLabels[entry.id.replace('pedagogy:', '')]); assert.ok(topicDefinitions.some(t => t.id === topicFor(entry))); }
});
test('Chinese and English search find the same conceptual material', () => {
  assert.ok(findEntries(rack.entries, '提取').some(e => e.id === 'pedagogy:retrieval-practice'));
  assert.ok(findEntries(rack.entries, 'retrieval practice').some(e => e.id === 'pedagogy:retrieval-practice'));
  assert.equal(findEntries(rack.entries, 'absent-xyz-987').length, 0);
});
test('every research concept has a Chinese reading layer without adding fictional concepts', () => {
  assert.deepEqual(Object.keys(conceptGuides).sort(), [...ids].sort());
  for (const guide of Object.values(conceptGuides)) {
    assert.match(guide.summary, /[\u4e00-\u9fff]/u);
    assert.ok(guide.summary.length >= 20);
    assert.match(guide.question, /？$/u);
  }
});
test('teacher problem language finds concepts without requiring a theory name', () => {
  const find = query => findEntries(rack.entries, query, conceptGuides).map(entry => entry.id);
  assert.ok(find('记不住').includes('pedagogy:retrieval-practice'));
  assert.ok(find('提示太多').includes('pedagogy:worked-examples-fading'));
  assert.ok(find('不知道怎么改').includes('pedagogy:actionable-feedback'));
  assert.ok(find('图像').includes('pedagogy:dual-coding'));
});
test('design scenarios refer to existing concepts and distinguish illustrations from outcome checks', () => {
  assert.equal(new Set(designScenarios.map(item => item.id)).size, designScenarios.length);
  for (const scenario of designScenarios) {
    assert.ok(ids.has(scenario.conceptId));
    for (const key of ['before', 'after', 'mechanism', 'check', 'caution']) assert.ok(scenario[key].length >= 15);
    assert.notEqual(scenario.before, scenario.after);
  }
});
test('all typed relation endpoints resolve and neighbors never invent edges', () => {
  assert.equal(rack.relations.length, 217);
  for (const relation of rack.relations) { assert.ok(ids.has(relation.from)); assert.ok(ids.has(relation.to)); assert.ok(relationNames[relation.type]); }
  for (const neighbor of neighborIds(rack.relations, event.conceptId)) assert.ok(rack.relations.some(r => [r.from, r.to].includes(event.conceptId) && [r.from, r.to].includes(neighbor)));
});
test('records reject unknown concepts, weak notes and unsafe project URLs', () => {
  assert.equal(validLearningEvent(event, ids), true);
  assert.equal(validLearningEvent({ ...event, conceptId: 'pedagogy:made-up' }, ids), false);
  assert.equal(validLearningEvent({ ...event, text: ' ' }, ids), false);
  assert.equal(validLearningEvent({ ...event, kind: 'mastery' }, ids), false);
  assert.equal(validLearningEvent({ ...event, projectUrl: 'javascript:alert(1)' }, ids), false);
  assert.equal(safeProjectUrl('https://example.org/project'), 'https://example.org/project');
  assert.throws(() => safeProjectUrl('https://user:secret@example.org'));
  assert.deepEqual(parseLearningEvents('{broken', ids), []);
  assert.deepEqual(parseLearningEvents(JSON.stringify([event, event, { ...event, id: 'test-event-2', conceptId: 'pedagogy:unknown' }]), ids), [event]);
});
test('stage reflects remaining behavior records rather than irreversible mastery', () => {
  const application = { ...event, id: 'test-event-0002', kind: 'application' };
  assert.equal(stageOf([], event.conceptId), 0);
  assert.equal(stageOf([{ ...event, kind: 'encounter', text: '' }], event.conceptId), 1);
  assert.equal(stageOf([event], event.conceptId), 2);
  assert.equal(stageOf([event, application], event.conceptId), 3);
  assert.equal(stageOf([event, application].filter(e => e.id !== application.id), event.conceptId), 2);
});
test('quota failure retains notes across later reads, additions and removal', () => {
  let saved = JSON.stringify([event]); let fail = false; const notifications = [];
  const storage = { getItem: () => saved, setItem: (_key, value) => { if (fail) throw Error('quota'); saved = value; } };
  const store = createProgressStore(() => storage, ids, next => notifications.push(next));
  assert.equal(store.read().events.length, 1);
  fail = true;
  const next = { ...event, id: 'test-event-0002', kind: 'application' };
  store.save([...store.read().events, next]);
  assert.equal(store.read().persistent, false);
  assert.equal(store.read().events.length, 2);
  store.save(store.read().events.filter(e => e.id !== event.id));
  assert.deepEqual(store.read().events, [next]);
  assert.equal(notifications.at(-1).persistent, false);
});
test('blocked storage degrades to session memory; another tab changes persisted data', () => {
  const blocked = createProgressStore(() => { throw Error('denied'); }, ids, () => {});
  assert.equal(blocked.read().persistent, false); blocked.save([event]); assert.deepEqual(blocked.read().events, [event]);
  let saved = '[]'; const shared = createProgressStore(() => ({ getItem: () => saved, setItem: (_key, value) => { saved = value; } }), ids, () => {});
  assert.equal(shared.read().events.length, 0); saved = JSON.stringify([event]); assert.equal(shared.read().events.length, 1); saved = '[]'; assert.equal(shared.read().events.length, 0);
});
