import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { Script } from 'node:vm';
import { resources, resourcesForConcept } from '../app/content/resources.ts';

const root = new URL('../', import.meta.url);
const rack = JSON.parse(await readFile(new URL('public/learning-sciences/0.2.0/rack.json', root), 'utf8'));
const ids = new Set(rack.entries.map(e => e.id));

test('every curated resource links to real concepts and a usable destination', async () => {
  assert.equal(new Set(resources.map(r => r.id)).size, resources.length);
  for (const r of resources) {
    assert.ok(r.conceptIds.length > 0, r.id);
    for (const id of r.conceptIds) {
      assert.ok(ids.has(id), `${r.id}: ${id}`);
      assert.ok(resourcesForConcept(id).includes(r));
    }
    assert.ok(r.relationshipNote.length > 20);
    assert.ok(r.href.startsWith('/') || new URL(r.href).protocol === 'https:');
    if (r.href.startsWith('/tools/')) assert.ok((await stat(new URL('public' + r.href, root))).isFile());
    if (r.artifactPath) assert.ok((await stat(new URL('public' + r.artifactPath, root))).isFile());
  }
  assert.deepEqual(resourcesForConcept('missing'), []);
});

test('selected standalone tools have syntactically valid scripts and no remote scripts or fonts', async () => {
  for (const r of [...resources.filter(r => r.artifactPath), { id: 'relation-template', artifactPath: '/tools/relation-template.html' }]) {
    const html = await readFile(new URL('public' + r.artifactPath, root), 'utf8');
    assert.ok(html.includes('<title>'));
    assert.doesNotMatch(html, /<script[^>]+src=/i);
    assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
    const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
    assert.ok(scripts.length > 0, r.id);
    for (const [, script] of scripts) assert.doesNotThrow(() => new Script(script, { filename: r.id }));
  }
});
