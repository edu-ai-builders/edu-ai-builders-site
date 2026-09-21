"use client";

import Localize, {useLocale} from "@/app/i18n/localize";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Entry, Relation } from "../learning-sciences/knowledge";
import { labelFor, relationColors, relationNames, stageNames, topicDefinitions, topicFor } from "./model";
import { CENTER, WORLD, egoLayout, overviewLayout, ringLayout, edgeEndpoints } from "./layout.mjs";

export type Level = "overview" | "topic" | "concept";
type Point = { x: number; y: number };

const C: Point = CENTER;
const clamp = (k: number) => Math.max(0.55, Math.min(2.6, k));
const STAGE_FILL = ["#ffffff", "#cfc4f0", "#7964bc", "#27867b"];

function trim(label: string, max: number) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

export default function Graph({
  level, entries, relations, topic, selected, stages, onOpenTopic, onSelect, onUp,
}: {
  level: Level;
  entries: Entry[];
  relations: Relation[];
  topic: string;
  selected: string;
  stages: Record<string, number>;
  onOpenTopic: (id: string) => void;
  onSelect: (id: string) => void;
  onUp: () => void;
}) {
  const {locale,t}=useLocale();
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });

  const byId = useMemo(() => new Map(entries.map(e => [e.id, e])), [entries]);
  const degree = useMemo(() => {
    const counts = new Map<string, number>();
    relations.forEach(r => {
      counts.set(r.from, (counts.get(r.from) || 0) + 1);
      counts.set(r.to, (counts.get(r.to) || 0) + 1);
    });
    return counts;
  }, [relations]);

  /* ---------- overview: six topics, sized by how much sits inside ---------- */
  const overview = useMemo(() => {
    const counts = Object.fromEntries(topicDefinitions.map(t => [t.id, entries.filter(e => topicFor(e) === t.id).length]));
    const placed = overviewLayout(counts);
    const nodes = topicDefinitions.map((t, i) => ({ ...t, ...placed[i] }));
    const index = new Map(entries.map(e => [e.id, topicFor(e)]));
    const pairs = new Map<string, number>();
    relations.forEach(r => {
      const a = index.get(r.from), b = index.get(r.to);
      if (!a || !b || a === b) return;
      const key = [a, b].sort().join("|");
      pairs.set(key, (pairs.get(key) || 0) + 1);
    });
    const links = [...pairs.entries()].map(([key, weight]) => {
      const [a, b] = key.split("|");
      return { a: nodes.find(n => n.id === a)!, b: nodes.find(n => n.id === b)!, weight };
    }).filter(l => l.a && l.b);
    return { nodes, links };
  }, [entries, relations]);

  /* ---------- topic: every concept in one group, hubs in the middle ---------- */
  const topicView = useMemo(() => {
    if (level !== "topic") return null;
    const members = entries
      .filter(e => topicFor(e) === topic)
      .sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0));
    const points = ringLayout(members.length);
    const positions = new Map(members.map((entry, i) => [entry.id, points[i]]));
    const inside = new Set(members.map(m => m.id));
    const edges = relations.filter(r => inside.has(r.from) && inside.has(r.to));
    return { members, positions, edges };
  }, [level, entries, topic, degree, relations]);

  /* ---------- concept: the ego network, every typed neighbour shown ---------- */
  const conceptView = useMemo(() => {
    if (level !== "concept") return null;
    const own = relations.filter(r => r.from === selected || r.to === selected);
    const grouped = new Map<string, string[]>();
    own.forEach(r => {
      const other = r.from === selected ? r.to : r.from;
      if (!byId.has(other)) return;
      const list = grouped.get(r.type) || [];
      if (!list.includes(other)) list.push(other);
      grouped.set(r.type, list);
    });
    const groups = [...grouped.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([type, ids]) => ({ type, ids }));
    const { positions, arcs } = egoLayout(groups);
    return { groups, positions, arcs, edges: own };
  }, [level, relations, selected, byId]);

  /* ---------- pan + zoom ---------- */
  const zoom = useCallback((factor: number, origin: Point = C) => setView(v => {
    const k = clamp(v.k * factor);
    return { k, x: origin.x - (origin.x - v.x) * k / v.k, y: origin.y - (origin.y - v.y) * k / v.k };
  }), []);
  const toWorld = (event: { clientX: number; clientY: number }) => {
    const element = svg.current;
    if (!element) return { x: 0, y: 0 };
    const matrix = element.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: p.x, y: p.y };
  };
  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    drag.current = { id: e.pointerId, ...toWorld(e), moved: false };
    suppressClick.current = false;
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const last = drag.current;
    if (!last || last.id !== e.pointerId) return;
    const p = toWorld(e);
    const dx = p.x - last.x, dy = p.y - last.y;
    if (!last.moved && Math.hypot(dx, dy) < 4) return;
    last.moved = true;
    suppressClick.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
    last.x = p.x; last.y = p.y;
  };
  const keyboard = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.target !== e.currentTarget) return;
    const moves: Record<string, Point> = { ArrowLeft: { x: 48, y: 0 }, ArrowRight: { x: -48, y: 0 }, ArrowUp: { x: 0, y: 48 }, ArrowDown: { x: 0, y: -48 } };
    if (moves[e.key]) { e.preventDefault(); setView(v => ({ ...v, x: v.x + moves[e.key].x, y: v.y + moves[e.key].y })); }
    else if (e.key === "Escape") { e.preventDefault(); onUp(); }
    else if (["+", "=", "-", "0"].includes(e.key)) {
      e.preventDefault();
      if (e.key === "0") setView({ x: 0, y: 0, k: 1 }); else zoom(e.key === "-" ? 1 / 1.2 : 1.2);
    }
  };
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const wheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const matrix = element.getScreenCTM();
      if (!matrix) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
      zoom(Math.exp(-e.deltaY * 0.003), p);
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [zoom]);

  const fire = (run: () => void) => { if (!suppressClick.current) run(); };

  /* ---------- one concept dot, used at both lower levels ---------- */
  const Dot = ({ entry, p, radius, max }: { entry: Entry; p: Point; radius: number; max: number }) => {
    const stage = stages[entry.id] || 0;
    const active = entry.id === selected;
    const name = t(labelFor(entry));
    return <Localize>{(
      <g
        className={`atlas-dot ${active ? "is-selected" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={`${name}，${stageNames[stage]}${active ? "，已选中" : ""}`}
        aria-pressed={active}
        onClick={() => fire(() => onSelect(entry.id))}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onSelect(entry.id); } }}
      >
        <title>{locale === "en" ? name : `${name} · ${entry.label}`}</title>
        <circle cx={p.x} cy={p.y} r={Math.max(18, radius)} fill="transparent" stroke="none" />
        {active && <circle cx={p.x} cy={p.y} r={radius + 7} className="atlas-dot-halo" />}
        <circle cx={p.x} cy={p.y} r={radius} fill={active ? "#6f5fba" : STAGE_FILL[stage]} stroke={active ? "#6f5fba" : stage > 1 ? STAGE_FILL[stage] : "#b7acca"} strokeWidth="2" />
        <text className="atlas-dot-label" x={p.x} y={p.y + radius + 16} textAnchor="middle" fontWeight={active ? 650 : 500}>{trim(name, locale === "en" ? max * 2 : max)}</text>
      </g>
    )}</Localize>;
  };

  const caption =
    level === "overview" ? "六个主题 · 点开任意一个进入其中的概念"
    : level === "topic" ? "越靠近中心，关系越多 · 点开一个概念查看它的关系网"
    : "中心是当前概念，四周按关系类型分组 · 点开任意相邻概念继续深入";

  return <Localize>{(
    <div className="atlas-graph" data-level={level}>
      <div className="atlas-map-caption">
        <span><i /> {caption}</span>
        <small>拖动平移 · ⌘/Ctrl + 滚轮缩放 · Esc 返回上一层</small>
      </div>

      <svg
        ref={svg}
        viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
        role="group"
        aria-label={`学习科学地图，当前层级：${level === "overview" ? "全部主题" : level === "topic" ? "主题内的概念" : "单个概念的关系网"}。方向键平移，加减键缩放，0 复位，Esc 返回上一层。`}
        tabIndex={0}
        onKeyDown={keyboard}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
      >
        <defs>
          <pattern id="atlas-dots-bg" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#ddd9ee" />
          </pattern>
          {Object.entries(relationColors).map(([type, color]) => (
            <marker key={type} id={`atlas-arrow-${type}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 1 L 9 5 L 0 9" fill="none" stroke={color} strokeWidth="1.5" />
            </marker>
          ))}
        </defs>
        <rect width={WORLD.width} height={WORLD.height} fill="url(#atlas-dots-bg)" />

        <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          {level === "overview" && <>
            {overview.links.map(link => (
              <line
                key={`${link.a.id}-${link.b.id}`}
                x1={link.a.x} y1={link.a.y} x2={link.b.x} y2={link.b.y}
                stroke="#a99ed0" strokeOpacity={0.35}
                strokeWidth={Math.min(7, 1 + link.weight * 0.45)}
              />
            ))}
            {overview.nodes.map(node => (
              <g
                key={node.id}
                className="atlas-cluster"
                role="button"
                tabIndex={0}
                aria-label={`${node.title}，${node.count} 个概念，${node.description}`}
                onClick={() => fire(() => onOpenTopic(node.id))}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onOpenTopic(node.id); } }}
              >
                <title>{`${node.title} · ${node.description}`}</title>
                <circle cx={node.x} cy={node.y} r={node.r} fill={node.color} fillOpacity="0.13" stroke={node.color} strokeWidth="2" />
                <text className="atlas-cluster-title" x={node.x} y={node.y - 2} textAnchor="middle" fill={node.color}>{node.title}</text>
                <text className="atlas-cluster-count" x={node.x} y={node.y + 19} textAnchor="middle" fill={node.color}>{node.count} 个概念</text>
              </g>
            ))}
          </>}

          {level === "topic" && topicView && <>
            {topicView.edges.map((r, i) => {
              const a = topicView.positions.get(r.from), b = topicView.positions.get(r.to);
              if (!a || !b) return null;
              return <line key={`${r.from}-${r.to}-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={relationColors[r.type] || "#9a93ad"} strokeOpacity={r.from === selected || r.to === selected ? 0.85 : 0.22} strokeWidth={r.from === selected || r.to === selected ? 2 : 1.2} strokeDasharray={r.type === "does-not-imply" ? "5 4" : undefined} />;
            })}
            {topicView.members.map(entry => {
              const p = topicView.positions.get(entry.id)!;
              const hub = (degree.get(entry.id) || 0) >= 6;
              return <Dot key={entry.id} entry={entry} p={p} radius={hub ? 11 : 8} max={9} />;
            })}
          </>}

          {level === "concept" && conceptView && <>
            {conceptView.arcs.map(arc => {
              const r = 388;
              const x1 = C.x + Math.cos(arc.from + 0.06) * r, y1 = C.y + Math.sin(arc.from + 0.06) * r * 0.66;
              const x2 = C.x + Math.cos(arc.to - 0.06) * r, y2 = C.y + Math.sin(arc.to - 0.06) * r * 0.66;
              const large = arc.to - arc.from > Math.PI ? 1 : 0;
              const lx = C.x + Math.cos(arc.mid) * (r + 26), ly = C.y + Math.sin(arc.mid) * (r + 26) * 0.66;
              const color = relationColors[arc.type] || "#8d86a3";
              return (
                <g key={arc.type}>
                  <path d={`M ${x1} ${y1} A ${r} ${r * 0.66} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="3" strokeOpacity="0.5" strokeLinecap="round" />
                  <text className="atlas-arc-label" x={lx} y={ly} textAnchor="middle" fill={color}>{relationNames[arc.type] || arc.type}</text>
                </g>
              );
            })}
            {conceptView.edges.map((r, i) => {
              const a = r.from === selected ? C : conceptView.positions.get(`${r.type}|${r.from}`);
              const b = r.to === selected ? C : conceptView.positions.get(`${r.type}|${r.to}`);
              if (!a || !b) return null;
              const color = relationColors[r.type] || "#8d86a3";
              const edge = edgeEndpoints(a, b, r.from === selected ? 56 : 11, r.to === selected ? 58 : 13);
              return <line key={`${r.from}-${r.to}-${i}`} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} stroke={color} strokeOpacity="0.75" strokeWidth="1.8" strokeDasharray={r.type === "does-not-imply" ? "5 4" : undefined} markerEnd={`url(#atlas-arrow-${r.type})`} />;
            })}
            {[...conceptView.positions.entries()].map(([positionKey, p]) => {
              const id = positionKey.slice(positionKey.indexOf("|") + 1);
              const entry = byId.get(id);
              if (!entry || id === selected) return null;
              return <Dot key={positionKey} entry={entry} p={p} radius={9} max={8} />;
            })}
            {(() => {
              const entry = byId.get(selected);
              if (!entry) return null;
              const name = t(labelFor(entry));
              return (
                <g className="atlas-focus">
                  <circle cx={C.x} cy={C.y} r="54" fill="#6f5fba" />
                  <circle cx={C.x} cy={C.y} r="64" fill="none" stroke="#6f5fba" strokeOpacity="0.28" strokeWidth="2" />
                  <text className="atlas-focus-label" x={C.x} y={C.y + 5} textAnchor="middle" fill="#ffffff">
                    {(trim(name, locale === "en" ? 26 : 12).match(locale === "en" ? /.{1,13}/gu : /.{1,6}/gu) || [name]).map((chunk, i, all) => (
                      <tspan key={i} x={C.x} dy={i === 0 ? (all.length > 1 ? -8 : 0) : 19}>{chunk}</tspan>
                    ))}
                  </text>
                </g>
              );
            })()}
          </>}
        </g>
      </svg>

      <div className="atlas-map-controls" aria-label="地图缩放">
        <button type="button" onClick={() => zoom(1 / 1.2)} aria-label="缩小地图">−</button>
        <output aria-label="缩放比例">{Math.round(view.k * 100)}%</output>
        <button type="button" onClick={() => zoom(1.2)} aria-label="放大地图">+</button>
        <button type="button" onClick={() => setView({ x: 0, y: 0, k: 1 })} aria-label="复位地图">↺</button>
      </div>

      {level !== "overview" && (
        <div className="atlas-map-legend">
          {stageNames.map((name, i) => <span key={name}><i className={`stage-${i}`} />{name}</span>)}
        </div>
      )}
    </div>
  )}</Localize>;
}
