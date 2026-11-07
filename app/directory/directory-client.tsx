"use client";

import Localize, {useLocale} from "@/app/i18n/localize";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collections, collectionFor, dateLabel, featured, filterRecords, searchDirectory, licenseLabel, tasks, tasksFor, type RadarCatalog, type RadarFilters, type RadarRecord, type RadarSummary } from "./model";

const initialFilters: RadarFilters = { query: "", collection: "all", task: "all", language: "", hideArchived: false, hideUnavailable: true, showReview: false, sort: "relevance" };
const pageSize = 18;

function ResourceGraphic({ record }: { record: RadarRecord }) {
  const style = featured[record.name]?.visual || (record.kind === "skill" ? "workflow" : record.kind === "dataset" || record.kind === "benchmark" ? "chart" : (record.kind === "awesome_index" || record.kind === "knowledge") ? "library" : "code");
  return <Localize>{<div className={`radar-graphic radar-graphic-${style}`} aria-hidden="true">
    <div className="radar-graphic-window"><span /><span /><span /></div>
    {style === "cards" ? <div className="radar-flashcards"><i /><i /><div><small>先想一想</small><strong>你还记得吗？</strong><b>回忆 → 检查 → 再练</b></div></div>
      : style === "classroom" ? <div className="radar-classroom"><aside><i /><i /><i /></aside><div><span>我的学习活动</span><section><i>01</i><i>02</i><i>03</i></section><b /></div></div>
      : style === "chart" ? <div className="radar-chart"><div><i /><i /><i /><i /><i /></div><span>观察 · 比较 · 验证</span></div>
      : style === "workflow" ? <div className="radar-workflow"><i>任务</i><b>→</b><i>步骤</i><b>→</b><i>产出</i></div>
      : style === "library" ? <div className="radar-library"><i /><i /><i /><i /><span>沿着线索继续发现</span></div>
      : <div className="radar-code"><div><i /><i /><i /><i /></div><section><strong>{featured[record.name] ? "想法 → 网页" : "打开 · 理解 · 改造"}</strong><span /><b /><small>让一个小想法开始工作</small></section></div>}
    <small className="radar-graphic-caption">用途示意 · 非产品截图</small>
  </div>}</Localize>;
}

function MatchEvidence({record}: {record: RadarRecord}) {
  const match = record.search_match;
  if (!match) return null;
  const constraintNames: Record<string,string> = {offline:"离线使用",mobile:"移动端",browser:"浏览器",commercial:"商业用途", "open-source":"开源条件","no-paid-api":"无需付费 API","chinese-ui":"中文界面"};
  return <details className="radar-provenance"><summary>为什么出现这个结果</summary><div>
    <p>{match.status === "related-only" ? "部分相关线索，尚未确认满足你的需求。" : "匹配到任务线索，仍需核对实际使用条件。"}</p>
    <ul>{match.matched.slice(0,5).map(m=><li key={m.concept}>{m.said}{m.via && m.via !== m.said ? ` → ${m.via}` : ""} · {m.partial ? "部分词匹配" : m.direct ? "直接词匹配" : "双语或概念扩展"}</li>)}</ul>
    {match.missing.length > 0 && <p>尚无匹配证据：{match.missing.join("、")}</p>}
    {Object.entries(match.constraints).map(([name,evidence])=><p key={name}>{constraintNames[name] || "额外约束"} · {evidence === "unknown" ? "暂无证据" : evidence === "reviewed-metadata" ? "有标签记录，运行条件待核对" : evidence === "restriction-recorded" ? "记录了使用限制" : "仓库许可元数据，具体条件待核对"}</p>)}
  </div></details>;
}

function ResourceCard({ record }: { record: RadarRecord }) {
  const {locale}=useLocale();
  const curated = record.kind !== "skill" ? featured[record.name] : undefined;
  const collection = collections.find((c) => c.id === collectionFor(record));
  const matchedTasks = tasksFor(record);
  return <Localize>{<article className="radar-card">
    <ResourceGraphic record={record} />
    <div className="radar-card-body">
      <div className="radar-card-labels"><span>{collection?.label}</span>{record.refreshError === "http-404" && <span className="radar-archived">暂不可访问</span>}{record.refreshError === "invalid-frontmatter" && <span className="radar-archived">声明格式待确认</span>}{record.archived && <span className="radar-archived">已归档</span>}{curated && <span className="radar-editorial">编辑起点</span>}{record.review?.evidence_level === "metadata" && <span>元数据线索</span>}{record.review?.evidence_level === "editorial-metadata-review" && <span>来源复查记录</span>}{record.review?.status === "review" && <span className="radar-archived">待复查</span>}</div>
      <h3>{curated?.title || record.title}</h3>
      <p className="radar-repository">{record.name}</p>
      <p className="radar-description" lang={curated ? (locale === "en" ? "en" : "zh-CN") : /[\u4e00-\u9fff]/.test(record.description) ? "zh-CN" : "en"}>{curated?.description || record.description || "仓库尚未提供简介。打开来源查看项目说明。"}</p>
      <div className="radar-tags">{matchedTasks.slice(0, 2).map((id) => <span key={id}>{tasks.find((t) => t.id === id)?.label}</span>)}{record.language && <span>{record.language}</span>}</div>
      <div className="radar-card-meta"><span title="GitHub stars 为关注度，不是质量或教学效果评分">☆ {new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(record.stars || 0)}</span><span>{licenseLabel(record.license)}</span></div>
      <div className="radar-card-actions">{record.url && <a href={record.url} target="_blank" rel="noreferrer">{record.refreshError === "http-404" ? "历史来源地址" : record.kind === "skill" ? "查看 Skill 说明" : "打开项目"}<span>↗</span></a>}{record.homepage && <a className="radar-homepage" href={record.homepage} target="_blank" rel="noreferrer">项目网站 ↗</a>}</div>
      <MatchEvidence record={record} /><details className="radar-provenance"><summary>来源与更新时间 <span>{dateLabel(record.checkedAt)}</span></summary><div>
        <dl><div><dt>{record.kind === "skill" ? "Skill 声明核验" : "仓库元数据核验"}</dt><dd>{dateLabel(record.checkedAt)}</dd></div><div><dt>仓库最后推送</dt><dd>{dateLabel(record.pushedAt)}</dd></div>{record.repositoryCheckedAt && <div><dt>仓库元数据核验</dt><dd>{dateLabel(record.repositoryCheckedAt)}</dd></div>}<div><dt>收录方式</dt><dd>{record.kind === "skill" ? "公开 SKILL.md 的声明信息" : "GitHub 公开仓库元数据"}</dd></div></dl>
        {record.refreshStatus === "failed" && <p>本次请求未成功，保留上次核验的信息（{record.refreshError}）。</p>}
        {record.kind === "skill" && <p>{record.refreshStatus === "refreshed" ? "本次已核对 SKILL.md 声明的名称和简介；没有执行技能，也不代表安全性或教学效果认证。" : "未能在本次核对 Skill 声明，保留上次成功检查的信息。使用前请打开来源确认当前说明。"}</p>}
        {record.review?.status === "review" && <p>用途或维护状态仍待复查，使用前请核对原始来源。</p>}<p>来源可访问不等于已运行。标签只保留已确认的用途；未确认的能力保持未知。</p>{curated && <p>中文介绍为编辑导读；用途配图为概念示意。实际界面以项目网站为准。</p>}
        {record.sourceUrl && <a href={record.sourceUrl} target="_blank" rel="noreferrer">查看元数据来源 ↗</a>}
      </div></details>
    </div>
  </article>}</Localize>;
}

export default function DirectoryClient({ summary, initialQuery = "", initialKind = "" }: { summary: RadarSummary; initialQuery?: string; initialKind?: string }) {
  const [records, setRecords] = useState<RadarRecord[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [filters, setFilters] = useState<RadarFilters>(() => ({...initialFilters, query: initialQuery,
    collection: collections.find(c => c.id === initialKind)?.id || (initialKind === "dataset" || initialKind === "benchmark" ? "data" : "all")}));
  const [page, setPage] = useState(1);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/radar/catalog.json", { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error("Snapshot unavailable");
      return response.json() as Promise<RadarCatalog>;
    }).then((catalog) => { setRecords(catalog.records); setLoadState("ready"); }).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) setLoadState("error");
    });
    return () => controller.abort();
  }, []);
  const search = useMemo(() => searchDirectory(records, filters), [records, filters]);
  const results = search.records;
  const languages = useMemo(() => [...new Set(records.map((r) => r.language).filter((l): l is string => Boolean(l)))].sort(), [records]);
  const countFor = (id: string) => filterRecords(records, {...initialFilters, showReview: filters.showReview, collection: id === "all" ? "all" : collections.find(c => c.id === id)?.id || "all"}).length;
  const change = (next: Partial<RadarFilters>) => { setFilters((current) => ({ ...current, ...next })); setPage(1); };
  const reset = () => { setFilters(initialFilters); setPage(1); };
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const showPage = (next: number) => { setPage(next); document.getElementById("radar-results")?.scrollIntoView({ behavior: "instant", block: "start" }); };
  return <Localize>{<main className="radar-page">
    <header className="radar-hero">
      <div><p className="ea-eyebrow">OPEN SOURCE / START WITH WHAT EXISTS</p><h1>你的下一个教育点子，<br /><span>也许已经有了第一块。</span></h1><p className="radar-lead">为个人学习、教学、研究和教育系统运维，找到可复用的 Skill、开源项目、数据、基准与知识材料。按任务选择，再核对来源与使用条件。</p><a href="#radar-browse" className="radar-hero-cta">找到我的起点 <span>↓</span></a></div>
      <div className="radar-hero-shelf" aria-label="从资源到你的创作的示意"><div className="radar-shelf-card"><span>试用</span><div className="radar-shelf-flash">3 / 4<strong>先预测，再揭晓</strong></div><small>看见一个学习动作</small></div><div className="radar-shelf-card"><span>拆解</span><div className="radar-shelf-code"><i /><i /><i /></div><small>理解它怎样工作</small></div><div className="radar-shelf-card"><span>改造</span><div className="radar-shelf-build"><i>你的情境</i><b>＋</b><i>已有资源</i></div><small>做成自己的版本</small></div><p>OPEN → UNDERSTAND → ADAPT</p></div>
    </header>
    <div className="radar-snapshot"><span><b>{summary.total.toLocaleString()}</b> 条已收录的资源线索</span><span><b>{(summary.included ?? summary.total).toLocaleString()}</b> 条默认展示</span><span><b>{(summary.needsReview ?? 0).toLocaleString()}</b> 条待复查</span><span>快照生成 <b>{dateLabel(summary.generatedAt)}</b></span><a href="#radar-data-note">这些数字意味着什么？ ↗</a></div>
    <section className="radar-browse" id="radar-browse" aria-labelledby="radar-browse-title">
      <div className="radar-browse-heading"><div><p className="ea-eyebrow">FIND YOUR NEXT BUILDING BLOCK</p><h2 id="radar-browse-title">这一次，你想完成什么？</h2></div><p>先按用途缩小范围，再看项目本身。</p></div>
      <div className="radar-task-pills" aria-label="按用途筛选">{tasks.map((task) => <button key={task.id} aria-pressed={filters.task === task.id} onClick={() => change({ task: task.id })}><b>{task.label}</b><span>{task.detail}</span></button>)}</div>
      <div className="radar-browser-layout">
        <aside className="radar-sidebar" aria-label="资源分类与筛选"><h3>资源类型</h3><div className="radar-collection-list">{collections.map((collection) => <button key={collection.id} aria-pressed={filters.collection === collection.id} onClick={() => change({ collection: collection.id })}><i aria-hidden="true">{collection.icon}</i><span><b>{collection.label}</b><small>{collection.detail}</small></span><em>{loadState === "ready" ? countFor(collection.id) : "—"}</em></button>)}</div><label className="radar-language">编程语言<select value={filters.language} onChange={(event) => change({ language: event.target.value })}><option value="">全部语言</option>{languages.map((language) => <option key={language}>{language}</option>)}</select></label><label className="radar-checkbox"><input type="checkbox" checked={filters.hideArchived} onChange={(event) => change({ hideArchived: event.target.checked })} />隐藏已归档项目</label><label className="radar-checkbox"><input type="checkbox" checked={filters.hideUnavailable} onChange={(event) => change({ hideUnavailable: event.target.checked })} />隐藏暂不可访问的项目</label><label className="radar-checkbox"><input type="checkbox" checked={filters.showReview} onChange={(event) => change({ showReview: event.target.checked })} />显示待复查线索</label><p className="radar-sidebar-note">搜索命中保留为发现线索，不直接证明学科、受众或能力。经典教材与数据不因年代久远而自动下架。</p></aside>
        <div className="radar-main-results" id="radar-results"><div className="radar-search-row"><label className="radar-search"><span aria-hidden="true">⌕</span><span className="radar-sr-only">搜索资源</span><input type="search" placeholder="搜索项目、主题、技能…" value={filters.query} onChange={(event) => change({ query: event.target.value })} /></label><label className="radar-sort"><span className="radar-sr-only">结果排序</span><select value={filters.sort} onChange={(event) => change({ sort: event.target.value as RadarFilters["sort"] })}><option value="relevance">编辑起点优先</option><option value="stars">关注度优先</option><option value="pushed">最近推送</option><option value="checked">最近核验</option></select></label></div>
          {records.length > 0 && filters.query && <div className="radar-search-explanation" role="status">
            <p>{search.retrieval.status === "no-match" ? "当前目录没有足够匹配证据。这不代表全网没有合适资源。" : search.retrieval.coverageNeedsReview ? "先查看这些相关线索；部分需求或约束仍缺少证据，不能直接当成完整方案。" : "按任务词和双语概念检索。结果是候选线索，适用性与组合兼容性仍需核对。"}</p>
            {search.retrieval.concepts.length > 0 && <p>检索线索：{search.retrieval.concepts.filter(c=>!c.generic).map(c=>c.term).join(" · ")}</p>}
          </div>}
          <div className="radar-results-bar"><p role="status">{loadState === "loading" ? "正在读取资源快照…" : `${results.length.toLocaleString()} 个结果`}{loadState === "ready" && results.length > 0 && <span> · 第 {currentPage} / {pageCount} 页</span>}</p><button onClick={reset}>重置筛选</button></div>
          {loadState === "loading" && <div className="radar-loading-grid" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <div key={i}><i /><b /><span /></div>)}</div>}
          {loadState === "error" && <div className="radar-empty"><h3>资源快照暂时没有加载出来</h3><p>请刷新页面重试，也可以直接查看原始快照。</p><a href="/data/radar/catalog.json">打开数据快照 ↗</a></div>}
          {loadState === "ready" && results.length === 0 && <div className="radar-empty"><span aria-hidden="true">⌕</span><h3>换一种说法，试试另一个入口。</h3><p>可以减少关键词、取消用途或语言筛选。项目简介保留原文，也可以尝试英文关键词。</p><button onClick={reset}>浏览全部资源</button></div>}
          {loadState === "ready" && <div className="radar-grid">{results.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((record) => <ResourceCard key={record.id} record={record} />)}</div>}
          {loadState === "ready" && pageCount > 1 && <nav className="radar-pagination" aria-label="资源分页"><button disabled={currentPage === 1} onClick={() => showPage(currentPage - 1)}>← 上一页</button><span>{currentPage} / {pageCount}</span><button disabled={currentPage === pageCount} onClick={() => showPage(currentPage + 1)}>下一页 →</button></nav>}
        </div>
      </div>
    </section>
    <section className="radar-next-step" id="scenarios"><div><p className="ea-eyebrow">FROM A REPOSITORY TO A LEARNING EXPERIENCE</p><h2>找到工具之后，下一步是设计学习。</h2><p>想一想：学习者会做什么？怎样得到反馈？如何判断真的理解了？把这些问题带到你的下一个版本。</p></div><div><Link href="/skills/scenarios/family-math">家庭数学方案 ↗</Link><Link href="/skills/scenarios/science-evidence">科学教学方案 ↗</Link><Link href="/skills/scenarios/research-workflow">研究助手方案 ↗</Link><Link href="/skills/workflows/edu-repo-adapter" id="workflows">Repo 适配 ↗</Link><Link href="/skills/workflows/edu-skill-fusion">Skill 组合 ↗</Link><Link href="/skills/workflows/edu-resource-search">资源搜索工作流 ↗</Link><Link href="/skills/workflows/edu-design-plan">设计与计划工作流 ↗</Link><Link href="/atlas?concept=pedagogy%3Aactionable-feedback">看看反馈如何影响设计 ↗</Link><Link href="/learn/github-starter">还不熟悉 GitHub？从这里开始 →</Link></div></section>
    <footer className="radar-data-note" id="radar-data-note"><h2>关于这份目录</h2><p>这里使用 Edu AI Builders 统一审核的公开元数据：{summary.repositories.toLocaleString()} 个仓库和 {summary.skills} 个 Skill 条目。部分项目是通用开发基础设施，收录是发现线索，不代表教学效果或质量认证。{summary.excludedUnverified} 条未核实的线索未进入公开结果。</p><p>本轮审核与导出不会重新核实所有来源。每条资源保留自己的核验日期；快照生成时间、来源核验时间和代码最后推送时间分别记录。</p><p>项目简介保留作者原文；编辑导读与用途标签用于浏览。复用代码和内容前，请查看各项目自己的许可证。</p><a href="/data/radar/catalog.json" download>下载公开元数据快照 ↓</a></footer>
  </main>}</Localize>;
}
