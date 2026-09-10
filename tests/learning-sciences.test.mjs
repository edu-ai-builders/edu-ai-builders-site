import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { matches, slug, sourceUrl } from '../app/learning-sciences/knowledge.ts';

const rack = JSON.parse(await readFile(new URL('../public/learning-sciences/0.2.0/rack.json', import.meta.url), 'utf8'));
test('the library preserves the complete draft and every source and relation reference', () => {
  assert.equal(rack.rack.status, 'draft');
  assert.equal(rack.entries.length, 180);
  assert.equal(rack.sources.length, 241);
  assert.equal(rack.relations.length, 217);
  const ids = new Set(rack.entries.map(e => e.id));
  const sources = new Set(rack.sources.map(s => s.id));
  assert.equal(new Set(rack.entries.map(slug)).size, 180);
  for (const e of rack.entries) {
    assert.ok(e.constraints.length && e.risks.length && e.observableEvidence.length);
    for (const id of e.evidence.sourceIds) assert.ok(sources.has(id));
  }
  for (const rel of rack.relations) {
    assert.ok(ids.has(rel.from) && ids.has(rel.to));
    for (const id of rel.sourceIds) assert.ok(sources.has(id));
  }
});
test('search matches aliases, case and hyphenated stable IDs', () => {
  const e = rack.entries.find(e => e.id === 'pedagogy:retrieval-practice');
  assert.ok(matches(e, '  RETRIEVAL practice  ', {}));
  assert.ok(matches(e, 'retrieval-practice', {}));
  if (e.aliases.length) assert.ok(matches(e, e.aliases[0], {}));
  assert.equal(matches(e, 'nonexistent-unicorn-xyz', {}), false);
});
test('the seven classification facets and evidence filter intersect', () => {
  const e = rack.entries.find(e => e.id === 'pedagogy:retrieval-practice');
  const c = e.classification;
  const selected = { layer: e.kind, domain: c.domains[0], lifespanStage: c.lifespanStages[0], function: c.functions[0], tradition: c.traditions[0], grainSize: c.grainSize, maturity: c.maturity, evidence: e.evidence.status };
  assert.ok(matches(e, '', selected));
  for (const key of Object.keys(selected)) assert.equal(matches(e, '', { ...selected, [key]: '__invalid__' }), false, key);
});
test('refuted claims remain refuted and unverified sources stay visible as unverified', () => {
  const refuted = rack.entries.filter(e => matches(e, '', { evidence: 'refuted' }));
  assert.ok(refuted.length > 0);
  assert.ok(refuted.every(e => ['avoid', 'do-not-generalize'].includes(e.recommendation.status)));
  assert.equal(rack.sources.filter(s => s.provenanceCheck.status !== 'verified').length, 4);
});
test('source links accept only public web protocols', () => {
  assert.equal(sourceUrl('javascript:alert(1)'), undefined);
  assert.equal(sourceUrl('data:text/html,test'), undefined);
  assert.equal(sourceUrl('not a url'), undefined);
  assert.equal(sourceUrl('https://doi.org/10.1234/test'), 'https://doi.org/10.1234/test');
  for (const s of rack.sources) assert.ok(sourceUrl(s.url), s.id);
});
