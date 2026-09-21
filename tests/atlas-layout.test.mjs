import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CENTER, WORLD, egoLayout, overviewLayout, ringLayout, edgeEndpoints } from '../app/atlas/layout.mjs';

const rack = JSON.parse(readFileSync(new URL('../public/learning-sciences/0.2.0/rack.json', import.meta.url)));

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const closestPair = points => {
  let min = Infinity;
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++) min = Math.min(min, distance(points[i], points[j]));
  return min;
};
const insideWorld = (p, pad = 0) =>
  p.x - pad >= 0 && p.x + pad <= WORLD.width && p.y - pad >= 0 && p.y + pad <= WORLD.height;

// The six clusters are read from the real rack so a data change that unbalances
// them shows up here rather than as circles running off the canvas.
import { topicDefinitions, topicFor } from '../app/atlas/model.ts';
const topicSizes = Object.fromEntries(topicDefinitions.map(topic => [topic.id, rack.entries.filter(entry => topicFor(entry) === topic.id).length]));

test('directed arrows clear both node circles, including the large focus node', () => {
  const a = { x: 0, y: 0 }, b = { x: 180, y: 240 };
  for (const [from, to, r1, r2] of [[a, b, 11, 58], [b, a, 56, 13]]) {
    const edge = edgeEndpoints(from, to, r1, r2);
    assert.ok(Math.abs(distance(from, { x: edge.x1, y: edge.y1 }) - r1) < 1e-9);
    assert.ok(Math.abs(distance(to, { x: edge.x2, y: edge.y2 }) - r2) < 1e-9);
    assert.ok(distance({ x: edge.x1, y: edge.y1 }, { x: edge.x2, y: edge.y2 }) < distance(from, to));
  }
});

test('overview: every cluster circle stays inside the canvas', () => {
  for (const node of overviewLayout(topicSizes)) {
    assert.ok(insideWorld(node, node.r), `${node.id} overflows the canvas`);
  }
});

test('overview: clusters never overlap each other', () => {
  const nodes = overviewLayout(topicSizes);
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++)
      assert.ok(distance(nodes[i], nodes[j]) > nodes[i].r + nodes[j].r,
        `${nodes[i].id} overlaps ${nodes[j].id}`);
});

test('topic: the largest cluster lays out without collisions', () => {
  const largest = Math.max(...Object.values(topicSizes));
  const points = ringLayout(largest);
  assert.equal(points.length, largest);
  assert.ok(points.every(p => insideWorld(p, 14)), 'a concept fell outside the canvas');
  // Dots are r<=11 and carry a label underneath, so they need real separation.
  assert.ok(closestPair(points) > 34, `nodes too close: ${closestPair(points).toFixed(1)}px`);
});

test('topic: layout holds for every real topic size, and for awkward counts', () => {
  for (const size of [...Object.values(topicSizes), 1, 2, 7, 19, 60]) {
    const points = ringLayout(size);
    assert.equal(points.length, size, `wrong node count for ${size}`);
    assert.ok(points.every(p => insideWorld(p, 14)), `overflow at size ${size}`);
    if (size > 1) assert.ok(closestPair(points) > 30, `crowding at size ${size}`);
  }
});

test('topic: the first concept sits at the centre so hubs read as hubs', () => {
  assert.deepEqual(ringLayout(12)[0], { x: CENTER.x, y: CENTER.y });
});

test('concept: every real ego network fits and stays legible', () => {
  const byConcept = new Map();
  for (const relation of rack.relations) {
    for (const [self, other] of [[relation.from, relation.to], [relation.to, relation.from]]) {
      if (!byConcept.has(self)) byConcept.set(self, new Map());
      const groups = byConcept.get(self);
      if (!groups.has(relation.type)) groups.set(relation.type, []);
      if (!groups.get(relation.type).includes(other)) groups.get(relation.type).push(other);
    }
  }
  assert.ok(byConcept.size > 100, 'expected most concepts to have relations');

  for (const [id, groups] of byConcept) {
    const shaped = [...groups.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([type, ids]) => ({ type, ids }));
    const { positions, arcs } = egoLayout(shaped);
    const points = [...positions.values()];
    assert.equal(arcs.length, shaped.length, `${id}: one arc per relation type`);
    assert.equal(positions.size, shaped.reduce((sum, group) => sum + group.ids.length, 0), `${id}: multiple relationship types must not overwrite the same neighbour`);
    assert.ok(points.every(p => insideWorld(p, 12)), `${id}: a neighbour fell off the canvas`);
    // Neighbours must clear the 54px focus node in the middle.
    assert.ok(points.every(p => distance(p, CENTER) > 70), `${id}: a neighbour sits under the focus node`);
    if (points.length > 1) {
      assert.ok(closestPair(points) > 24, `${id}: neighbours overlap (${closestPair(points).toFixed(1)}px)`);
    }
  }
});

test('concept: arcs partition the full circle without gaps or overlaps', () => {
  const groups = [
    { type: 'supports', ids: ['a', 'b', 'c'] },
    { type: 'requires', ids: ['d'] },
    { type: 'does-not-imply', ids: ['e', 'f'] },
  ];
  const { arcs } = egoLayout(groups);
  for (let i = 1; i < arcs.length; i++) {
    assert.ok(Math.abs(arcs[i].from - arcs[i - 1].to) < 1e-9, 'arc sectors must be contiguous');
  }
  const swept = arcs.at(-1).to - arcs[0].from;
  assert.ok(Math.abs(swept - Math.PI * 2) < 1e-9, `sectors should sweep 360°, got ${swept}`);
});
