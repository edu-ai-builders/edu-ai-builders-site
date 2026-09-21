"use client";
import Localize from "@/app/i18n/localize";
import Link from "next/link";
import knowledge from "../../public/learning-sciences/0.2.0/rack.json";
import type { Entry, Rack } from "../learning-sciences/knowledge";
import { topicDefinitions, topicFor } from "../atlas/model";

const rack = knowledge as unknown as Rack;
const CX = 230, CY = 143, RX = 148, RY = 92;

/** The real six clusters, sized by how many concepts sit inside them. */
function build() {
  const nodes = topicDefinitions.map((topic, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / topicDefinitions.length;
    const count = rack.entries.filter((e: Entry) => topicFor(e) === topic.id).length;
    return { ...topic, count, x: CX + Math.cos(angle) * RX, y: CY + Math.sin(angle) * RY, r: 22 + Math.sqrt(count) * 2.2 };
  });
  const where = new Map(rack.entries.map((e: Entry) => [e.id, topicFor(e)]));
  const weights = new Map<string, number>();
  rack.relations.forEach(relation => {
    const a = where.get(relation.from), b = where.get(relation.to);
    if (!a || !b || a === b) return;
    const key = [a, b].sort().join("|");
    weights.set(key, (weights.get(key) || 0) + 1);
  });
  const links = [...weights.entries()].map(([key, weight]) => {
    const [a, b] = key.split("|");
    return { key, weight, a: nodes.find(n => n.id === a)!, b: nodes.find(n => n.id === b)! };
  }).filter(link => link.a && link.b);
  return { nodes, links };
}

export default function AtlasMini() {
  const { nodes, links } = build();
  const crossing = links.reduce((sum, link) => sum + link.weight, 0);
  return <Localize>{(
    <div className="ea-atlas-mini">
      <div className="ea-mini-top">
        <span>LEARNING SCIENCES ATLAS</span>
        <span>{rack.entries.length} 个概念 · 真实数据</span>
      </div>
      <svg viewBox="0 0 460 310" role="img" aria-label={`学习科学地图预览：六个主题，共 ${rack.entries.length} 个概念，主题之间有 ${crossing} 条跨主题关系。`}>
        {links.map(link => (
          <line
            key={link.key}
            x1={link.a.x} y1={link.a.y} x2={link.b.x} y2={link.b.y}
            stroke="#a99ed0" strokeOpacity={0.4}
            strokeWidth={Math.min(5, 0.8 + link.weight * 0.34)}
          />
        ))}
        {nodes.map(node => (
          <g key={node.id} className="ea-mini-node">
            <circle cx={node.x} cy={node.y} r={node.r} fill={node.color} fillOpacity="0.14" stroke={node.color} strokeWidth="1.8" />
            <text className="ea-mini-count" x={node.x} y={node.y + 5} textAnchor="middle" fill={node.color}>{node.count}</text>
            <text className="ea-mini-label" x={node.x} y={node.y + node.r + 15} textAnchor="middle">{node.title}</text>
          </g>
        ))}
      </svg>
      <div className="ea-mini-topics">
        {nodes.map(node => (
          <Link key={node.id} href={`/atlas?topic=${node.id}`} style={{ borderColor: `${node.color}55` }}>
            <i style={{ background: node.color }} />{node.title}<small>{node.count}</small>
          </Link>
        ))}
      </div>
      <div className="ea-mini-bottom">
        <strong>一个概念，五种进入方式。</strong>
        <p>理解它 · 学习它 · 看看已有应用 · 用于构建 · 记录我的实践</p>
        <Link href="/atlas">打开完整地图 <span aria-hidden="true">→</span></Link>
        <small>连线粗细表示两个主题之间真实的关系条数，共 {crossing} 条跨主题关系。</small>
      </div>
    </div>
  )}</Localize>;
}
