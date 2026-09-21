"use client";
import Localize from "@/app/i18n/localize";
import Link from "next/link";
import { type Resource } from "../content/resources";
import ConceptLinks from "./concept-links";
import ResourcePreview from "./resource-preview";

/**
 * Chinese-first naming: an English term never stands alone inside a Chinese
 * sentence. Where the English word is the one people search for, it stays in a
 * labelled secondary position (in brackets) after the Chinese name.
 */
const kindNames: Record<Resource["kind"], string> = {
  tool: "课堂工具",
  example: "完整案例",
  component: "可修改组件",
  skill: "可复用技能（Skill）",
};

export default function ResourceCard({ resource: r }: { resource: Resource }) {
  const runsInBrowser = Boolean(r.artifactPath);
  const openLabel = runsInBrowser
    ? "打开，直接试"
    : r.kind === "component"
      ? "打开组件示例"
      : "查看安装与用法";
  return <Localize>{(
    <article
      className={`resource-card lift${runsInBrowser ? " is-runnable" : ""}`}
    >
      <Link
        className="resource-preview-link"
        href={r.href}
        aria-label={`预览并打开${r.title}`}
      >
        <ResourcePreview id={r.id} />
        {runsInBrowser ? (
          <span className="resource-run-flag" aria-hidden="true">
            <b>▶ 浏览器直接打开</b>
            <small>点开就能跑 · 不用安装 · 不用注册</small>
          </span>
        ) : null}
      </Link>
      <div className="resource-card-body">
        <div className="resource-card-meta">
          <span>{kindNames[r.kind]}</span>
          <span>{r.availabilityLabel}</span>
        </div>
        <h2>
          <Link href={r.href}>
            {r.title} <span aria-hidden="true">↗</span>
          </Link>
        </h2>
        <p>{r.description}</p>
        <ConceptLinks conceptIds={r.conceptIds} />
        <div className="resource-card-bottom">
          <Link className="resource-open" href={r.href}>
            {openLabel} →
          </Link>
          <Link href={`/atlas?concept=${encodeURIComponent(r.conceptIds[0])}`}>
            理解设计依据 ↗
          </Link>
        </div>
      </div>
    </article>
  )}</Localize>;
}
