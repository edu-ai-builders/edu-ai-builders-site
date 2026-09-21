// Pure geometry for the atlas map. No React, no DOM: imported by the graph component
// and exercised directly by tests so the three zoom levels cannot silently regress.

// Stabilize SVG coordinates across server and browser math implementations.
const coordinate = value => Math.round(value * 1e6) / 1e6;

export const WORLD = { width: 880, height: 620 };
export const CENTER = { x: 440, y: 306 };

/** End directed edges outside node circles, keeping their arrowheads visible. */
export function edgeEndpoints(from, to, fromRadius, toRadius) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  return {
    x1: from.x + dx / distance * fromRadius,
    y1: from.y + dy / distance * fromRadius,
    x2: to.x - dx / distance * toRadius,
    y2: to.y - dy / distance * toRadius,
  };
}

/** Six topic clusters on an ellipse, each sized by how many concepts sit inside. */
export function overviewLayout(counts) {
  const ids = Object.keys(counts);
  return ids.map((id, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / ids.length;
    return {
      id,
      count: counts[id],
      x: coordinate(CENTER.x + Math.cos(angle) * 292),
      y: coordinate(CENTER.y + Math.sin(angle) * 194),
      r: 46 + Math.sqrt(counts[id]) * 3.4,
    };
  });
}

/** Concentric rings; callers pass concepts sorted by degree so hubs land in the middle. */
export function ringLayout(count) {
  const rings = [
    { r: 0, cap: 1 },
    { r: 104, cap: 6 },
    { r: 188, cap: 12 },
    { r: 268, cap: 18 },
    { r: 344, cap: Infinity },
  ];
  const points = [];
  let placed = 0;
  for (let i = 0; i < rings.length && placed < count; i++) {
    const remaining = count - placed;
    const take = i === rings.length - 1 ? remaining : Math.min(rings[i].cap, remaining);
    for (let k = 0; k < take; k++) {
      if (rings[i].r === 0) points.push({ ...CENTER });
      else {
        const angle = -Math.PI / 2 + (k * 2 * Math.PI) / take + (i % 2 ? Math.PI / take : 0);
        points.push({
          x: coordinate(CENTER.x + Math.cos(angle) * rings[i].r),
          y: coordinate(CENTER.y + Math.sin(angle) * rings[i].r * 0.62),
        });
      }
    }
    placed += take;
  }
  return points;
}

/** One concept's neighbours, grouped into angular sectors by relation type. */
export function egoLayout(groups) {
  const total = groups.reduce((sum, g) => sum + g.ids.length, 0);
  const gap = 0.75;
  const units = total + groups.length * gap;
  const positions = new Map();
  const arcs = [];
  let angle = -Math.PI / 2 - Math.PI / 12;
  groups.forEach(group => {
    const span = ((group.ids.length + gap) / units) * Math.PI * 2;
    const inner = span * 0.82;
    const start = angle + (span - inner) / 2;
    group.ids.forEach((id, i) => {
      const step = group.ids.length === 1 ? inner / 2 : (i * inner) / (group.ids.length - 1);
      const a = start + step;
      const far = group.ids.length > 5 && i % 2 === 1;
      const r = far ? 330 : 236;
      positions.set(`${group.type}|${id}`, { x: coordinate(CENTER.x + Math.cos(a) * r), y: coordinate(CENTER.y + Math.sin(a) * r * 0.66) });
    });
    arcs.push({ type: group.type, from: angle, to: angle + span, mid: angle + span / 2 });
    angle += span;
  });
  return { positions, arcs };
}
