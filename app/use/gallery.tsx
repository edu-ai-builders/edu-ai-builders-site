"use client";
import Localize from "@/app/i18n/localize";
import Link from "next/link";
import { useState } from "react";
import ResourceCard from "../components/resource-card";
import { resources } from "../content/resources";

/** Only things a visitor can open and run right now live on this page. */
const runnable = resources.filter((r) => r.artifactPath);
const languageIds = ["say-the-relation"];
const filters = [
  { id: "all", label: "全部" },
  { id: "math", label: "数学可视化" },
  { id: "language", label: "语言与表达" },
];

export default function ResourceGallery() {
  const [filter, setFilter] = useState("all");
  const visible = runnable.filter(
    (r) =>
      filter === "all" ||
      (filter === "language"
        ? languageIds.includes(r.id)
        : !languageIds.includes(r.id)),
  );
  return <Localize>{(
    <section className="resource-gallery" id="gallery" aria-label="可直接打开的工具">
      <div className="resource-gallery-head">
        <h2>{runnable.length} 个可以直接打开的工具</h2>
        <div className="resource-gallery-filters" aria-label="按用途浏览">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <p className="resource-gallery-count" aria-live="polite">
        正在显示 {visible.length} 个 · 每个都能点开就跑，也可以下载后离线使用
      </p>
      <div className="resource-grid">
        {visible.map((r) => (
          <ResourceCard key={r.id} resource={r} />
        ))}
      </div>
      <p className="resource-gallery-elsewhere">
        想改成自己的材料，或放进自己的产品里？可修改组件与可复用技能（Skill）
        放在「用于构建」。
        <Link href="/build">去看构建材料 →</Link>
      </p>
    </section>
  )}</Localize>;
}
