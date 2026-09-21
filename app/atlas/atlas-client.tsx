"use client";
import Localize, {useLocale} from "@/app/i18n/localize";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Entry, Rack, Source, Value } from "../learning-sciences/knowledge";
import { humanize, sourceUrl } from "../learning-sciences/knowledge";
import type { Course } from "@/app/content/courses";
export type AtlasCourse = Pick<Course, "slug" | "title" | "summary" | "conceptIds"> & { lessonCount: number };
import { resourcesForConcept } from "@/app/content/resources";
import { useLearningProgress } from "@/app/lib/learning-progress";
import { findEntries, labelFor, relationColors, relationNames, relationsFor, stageNames, topicDefinitions, topicFor } from "./model";
import Graph, { type Level } from "./graph";
import { conceptGuides, designScenarios } from "../content/atlas-zh";
import DesignPreview from "./design-preview";
import ResourcePreview from "../components/resource-preview";

const tabs = ["理解它", "学习它", "看看应用", "用于构建", "我的实践"] as const;
const tabKeys = ["understand", "learn", "use", "build", "practice"] as const;
const tabFromKey = (key?: string | null) => tabs[Math.max(0, tabKeys.findIndex(value => value === key))];
const kindNames: Record<string, string> = { theory: "理论", framework: "框架", principle: "原则", method: "方法", tactic: "策略", construct: "构念", measure: "测量", constraint: "限制", "anti-pattern": "误区" };
const resourceKinds = { tool: "课堂工具", component: "可修改组件", skill: "可复用技能（Skill）", example: "完整案例" };
function ValueView({ value }: { value: Value }) {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return <Localize>{<ul>{value.map((item, i) => <li key={i}><ValueView value={item} /></li>)}</ul>}</Localize>;
  if (typeof value === "object") return <Localize>{<dl className="atlas-values">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{humanize(key)}</dt><dd><ValueView value={item} /></dd></div>)}</dl>}</Localize>;
  return <Localize>{<>{String(value)}</>}</Localize>;
}
function Sources({ ids, sources }: { ids: string[]; sources: Source[] }) {
  return <Localize>{<ul className="atlas-sources"><li className="atlas-source-caveat">来源核查记录描述链接或元数据检查，不是研究质量或教学效果认证。</li>{ids.map(id => { const s = sources.find(source => source.id === id); if (!s) return <li key={id}>{id}</li>; const url = sourceUrl(s.url); return <li key={id}>{url ? <a href={url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a> : s.title}<small>{s.authorsOrInstitution} · {s.year}</small><small>来源核查：{s.provenanceCheck?.status || "未记录"}{s.provenanceCheck?.checkedAt ? ` · ${s.provenanceCheck.checkedAt}` : ""}</small></li>; })}</ul>}</Localize>;
}
function Relations({ entry, rack, onSelect }: { entry: Entry; rack: Rack; onSelect: (id: string) => void }) {
  const relations = relationsFor(rack.relations, entry.id);
  return <Localize>{<div className="atlas-relations"><h3>概念之间，如何相连 <span>{relations.length}</span></h3><p className="atlas-small">箭头保留原始方向。「需要条件」描述适用或实施条件，不自动代表课程先修顺序。</p>{relations.length ? relations.map((r, i) => {
    const from = rack.entries.find(e => e.id === r.from), to = rack.entries.find(e => e.id === r.to);
    if (!from || !to) return null;
    return <details key={`${r.from}-${r.to}-${r.type}-${i}`}><summary><span className="atlas-relation-type" style={{ color: relationColors[r.type] }}>{relationNames[r.type] || r.type}</span><span>{labelFor(from)} → {labelFor(to)}</span></summary><div className="atlas-research-original" lang="en"><p className="atlas-source-label" lang="zh-CN">关系说明 · 英文研究原文</p><p>{r.rationale}</p><p className="atlas-small">Relation: {r.type} · Evidence: {r.evidenceStatus}</p></div><button className="atlas-text-button" onClick={() => onSelect(entry.id === r.from ? r.to : r.from)}>打开{labelFor(entry.id === r.from ? to : from)} →</button><Sources ids={r.sourceIds} sources={rack.sources} /></details>;
  }) : <p className="atlas-empty">此条目尚未收录明确的概念关系。可以先查看其适用条件与来源。</p>}</div>}</Localize>;
}

export default function AtlasClient({ rack, courses, initialConcept, initialTopic, initialTab }: { rack: Rack; courses: AtlasCourse[]; initialConcept?: string; initialTopic?: string; initialTab?: string }) {
  const {locale,t}=useLocale();
  const searchGuides=useMemo(()=>locale === "en" ? Object.fromEntries(Object.entries(conceptGuides).map(([id,guide])=>[id,{summary:guide.summary+" "+t(guide.summary),question:guide.question+" "+t(guide.question)}])) : conceptGuides,[locale,t]);
  const startTopic = topicDefinitions.some(t => t.id === initialTopic) ? initialTopic! : undefined;
  const initial = rack.entries.find(e => e.id === initialConcept) || rack.entries.find(e => e.id === "pedagogy:worked-examples-fading") || rack.entries[0];
  const [selectedId, setSelectedId] = useState(initial.id);
  const [topic, setTopic] = useState(initialConcept && rack.entries.some(e => e.id === initialConcept) ? topicFor(initial) : startTopic || topicFor(initial));
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level>(rack.entries.some(e => e.id === initialConcept) ? "concept" : startTopic ? "topic" : "overview");
  const [view, setView] = useState<"map" | "list">("map");
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabFromKey(initialTab));
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [recordKind, setRecordKind] = useState<"explanation" | "application">("explanation");
  const [message, setMessage] = useState("");

  const progress = useLearningProgress();
  const selected = rack.entries.find(e => e.id === selectedId) || initial;
  const currentTopic = topicDefinitions.find(t => t.id === topic)!;
  const guide = conceptGuides[selected.id];
  const scenario = designScenarios.find(item => item.conceptId === selected.id);
  const stages = Object.fromEntries(rack.entries.map(entry => [entry.id, progress.stageFor(entry.id)]));
  const filtered = useMemo(() => findEntries(rack.entries, query, searchGuides).filter(entry => query.trim() || level === "overview" || topicFor(entry) === topic), [rack.entries, query, topic, level, searchGuides]);
  const relatedCourses = courses.filter(course => course.conceptIds.includes(selected.id));
  const relatedResources = resourcesForConcept(selected.id);
  const useResources = relatedResources.filter(resource => resource.kind === "tool" || resource.kind === "example");
  const buildResources = relatedResources.filter(resource => resource.kind === "component" || resource.kind === "skill");
  const myEvents = progress.events.filter(event => event.conceptId === selected.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const activityCount = rack.entries.filter(entry => progress.stageFor(entry.id) > 0).length;
  const explanationCount = new Set(progress.events.filter(event => event.kind === "explanation").map(event => event.conceptId)).size;
  const applicationCount = new Set(progress.events.filter(event => event.kind === "application").map(event => event.conceptId)).size;
  function writeLocation(nextLevel: Level, nextTopic: string, conceptId: string, tabName: (typeof tabs)[number]) {
    const nextUrl = new URL(window.location.href);
    for (const key of ["concept", "topic", "tab"]) nextUrl.searchParams.delete(key);
    if (nextLevel === "topic") nextUrl.searchParams.set("topic", nextTopic);
    if (nextLevel === "concept") {
      nextUrl.searchParams.set("concept", conceptId);
      nextUrl.searchParams.set("tab", tabKeys[tabs.indexOf(tabName)]);
    }
    if (nextUrl.href !== window.location.href) window.history.pushState({}, "", nextUrl);
  }
  function navigateMap(nextLevel: Level, nextTopic = topic) {
    setLevel(nextLevel); setTopic(nextTopic); setView("map"); setQuery("");
    writeLocation(nextLevel, nextTopic, selected.id, tab);
  }
  function chooseTab(name: (typeof tabs)[number]) {
    setTab(name); setLevel("concept"); setTopic(topicFor(selected)); setQuery("");
    writeLocation("concept", topicFor(selected), selected.id, name);
  }
  function select(id: string, tabName = tab) {
    const entry = rack.entries.find(e => e.id === id); if (!entry) return;
    setSelectedId(id); setTab(tabName); setTopic(topicFor(entry)); setNote(""); setUrl(""); setMessage(""); setQuery("");
    setLevel("concept"); setView("map");
    writeLocation("concept", topicFor(entry), id, tabName);
  }
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      const entry = rack.entries.find(e => e.id === params.get("concept"));
      const restoredTopic = topicDefinitions.find(t => t.id === params.get("topic"));
      setSelectedId((entry || initial).id);
      setTopic(entry ? topicFor(entry) : restoredTopic?.id || topicFor(initial));
      setTab(tabFromKey(params.get("tab")));
      setLevel(entry ? "concept" : restoredTopic ? "topic" : "overview");
      setView("map"); setQuery(""); setNote(""); setUrl(""); setMessage("");
    };
    window.addEventListener("popstate", restore); return () => window.removeEventListener("popstate", restore);
  }, [rack.entries, initial]);
  const saveNote = () => { const ok = progress.addEvent(selected.id, recordKind, note, recordKind === "application" ? url : undefined); setMessage(ok ? "已留下这次实践记录。点亮表示你的学习行为，不代表已经掌握。" : "请写下至少 8 个字符的具体说明；项目链接如填写，须为有效的 http 或 https 地址。记录上限为 3,000 条。"); if (ok) { setNote(""); setUrl(""); } };
  const exportNotes = () => { const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), events: progress.events }, null, 2)], { type: "application/json" }); const href = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = href; a.download = "edu-ai-learning-records.json"; a.click(); setTimeout(() => URL.revokeObjectURL(href), 1000); };
  return <Localize>{<main id="main-content" className="atlas-page">
    <div className="atlas-breadcrumb"><Link href="/">Edu AI Builders</Link><span>/</span><span>学习科学地图</span></div>
    <div className="atlas-opening deep">
      <header className="atlas-hero"><div className="atlas-hero-copy"><p className="atlas-eyebrow">学习科学地图</p><h1>把一条学习原理，<span>连到你能改的那一处设计。</span></h1><p>这是一份索引：下面这张图里有 180 个学习科学概念。点开一个，它会告诉你学生通常卡在哪里、你的课或产品里可以改哪一处、改完检查什么，并连到对应的课程、能直接打开的工具和可改的材料。</p></div><div className="atlas-progress-summary"><strong>{progress.ready ? activityCount : "—"}<span> 个概念</span></strong><p>留下了你的足迹</p><small>{explanationCount} 个留下解释 · {applicationCount} 个用于实践</small><span className="atlas-local-label">{progress.persistent ? "仅保存在此浏览器" : "浏览器存储不可用 · 仅本次访问保留"}</span></div></header>
      <div className="atlas-entry">
        <p className="atlas-entry-title">最快的入口：挑一句你遇到过的话</p>
        <nav className="atlas-scenarios" aria-label="从遇到的问题开始">{designScenarios.map(item => <button key={item.id} aria-pressed={selected.id === item.conceptId && level === "concept"} onClick={() => select(item.conceptId, "理解它")}><span aria-hidden="true">{item.id === "explain" ? "◌ → ◎" : item.id === "fade" ? "▰ ▰ ▱" : item.id === "feedback" ? "↩" : "⊙"}</span><strong>{item.title}</strong><small>{item.short} →</small></button>)}</nav>
        <p className="atlas-entry-note">也可以直接看下面这张图：先选主题，再点开任意一个概念。</p>
      </div>
    </div>
    <section aria-label="探索学习科学" className="atlas-workspace">
      <div className="atlas-toolbar"><div><h2>概念地图</h2><p>选主题探索，或从问题直达概念。点开节点，找到可做的下一步。</p></div><label className="atlas-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={e => { setQuery(e.target.value); if (e.target.value) setView("list"); }} placeholder="搜索问题或概念，如：反馈、记不住" aria-label="搜索全部概念，支持中文名称、导读和英文术语" />{query && <button onClick={() => { setQuery(""); }} aria-label="清除搜索">×</button>}</label></div>
      <div className="atlas-topics" role="group" aria-label="按主题浏览">{topicDefinitions.map(t => <button key={t.id} aria-pressed={!query && level !== "overview" && topic === t.id} onClick={() => navigateMap("topic", t.id)}><i style={{ background: t.color }} />{t.title}<small>{rack.entries.filter(e => topicFor(e) === t.id).length}</small></button>)}</div>
      <div className="atlas-columns"><section className="atlas-map-panel" aria-label="地图与概念列表"><div className="atlas-viewbar"><nav className="atlas-levels" aria-label="地图层级"><button type="button" aria-current={level === "overview" ? "step" : undefined} onClick={() => navigateMap("overview")}>全部主题</button><span aria-hidden="true">›</span><button type="button" disabled={level === "overview"} aria-current={level === "topic" ? "step" : undefined} onClick={() => navigateMap("topic")}>{currentTopic.title}</button><span aria-hidden="true">›</span><button type="button" disabled={level !== "concept"} aria-current={level === "concept" ? "step" : undefined} onClick={() => setView("map")}>{labelFor(selected)}</button></nav><div className="atlas-viewswitch" role="group" aria-label="切换地图或列表">{([["map", "地图"], ["list", "列表"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)}>{label}</button>)}</div></div>
        {view === "list" ? <div className="atlas-list">{query && <p className="atlas-small">在全部主题中搜索「{query}」</p>}{filtered.length ? filtered.map(entry => <button key={entry.id} className={entry.id === selected.id ? "is-selected" : ""} onClick={() => select(entry.id)}><i className={`stage-${stages[entry.id]}`} /><span><strong>{labelFor(entry)}</strong><small>{conceptGuides[entry.id]?.summary}</small></span><span className="atlas-list-stage">{stageNames[stages[entry.id]]}</span></button>) : <div className="atlas-empty"><h3>没有找到这个概念</h3><p>试试更短的词，或英文关键词。清除搜索后可以按主题探索。</p><button className="atlas-primary" onClick={() => setQuery("")}>清除搜索</button></div>}</div> : <Graph key={`${level}-${topic}-${selected.id}`} level={level} entries={rack.entries} relations={rack.relations} topic={topic} selected={selected.id} stages={stages} onOpenTopic={id => navigateMap("topic", id)} onSelect={select} onUp={() => navigateMap(level === "concept" ? "topic" : "overview")} />}
        <div className="atlas-map-note"><span>↗</span><p>{level === "overview" ? "六个主题是帮助浏览的编辑分组，不是先修顺序。连线的粗细表示两个主题之间有多少条关系。" : level === "topic" ? "越靠近中心的概念，关系越多。主题内的连线按关系类型上色；虚线表示「不意味着」。" : "四周按关系类型分组，箭头保留原始方向。「需要条件」描述适用或实施条件，不自动代表课程先修顺序。"}</p></div>
        <div className="atlas-bottom-links"><Link href="/learning-sciences">打开完整研究资料库 ↗</Link><a href="/learning-sciences/0.2.0/rack.json" download>原始数据 ↓</a></div>
      </section>
      <section className="atlas-detail" aria-label="当前概念详情"><div className="atlas-detail-heading"><div className="atlas-detail-meta"><span>{kindNames[selected.kind] || selected.kind} · {topicDefinitions.find(t => t.id === topicFor(selected))?.title}</span><span className={`atlas-stage-pill stage-pill-${stages[selected.id]}`}>{stageNames[stages[selected.id]]}</span></div><h2>{labelFor(selected)}</h2><p className="atlas-detail-en"><span>英文研究条目名</span><b lang="en">{selected.label}</b></p><p className="atlas-detail-purpose">{guide?.question}</p><div className="atlas-detail-actions"><button onClick={() => { const ok = progress.addEvent(selected.id, "encounter"); setMessage(ok ? "已记录：接触过。" : "暂时无法记录，请稍后重试。"); }} disabled={!progress.ready || myEvents.some(e => e.kind === "encounter")}>{myEvents.some(e => e.kind === "encounter") ? "✓ 已记录接触" : "○ 标记接触过"}</button><a href={`?concept=${encodeURIComponent(selected.id)}&tab=${tabKeys[tabs.indexOf(tab)]}`} onClick={e => { e.preventDefault(); const link = new URL(window.location.href); link.searchParams.set("concept", selected.id); link.searchParams.set("tab", tabKeys[tabs.indexOf(tab)]); window.history.replaceState({}, "", link); if (navigator.clipboard) navigator.clipboard.writeText(link.href).then(() => setMessage("概念链接已复制。"), () => setMessage("可直接复制地址栏中的概念链接。")); else setMessage("可直接复制地址栏中的概念链接。"); }}>分享概念 ↗</a></div></div>
        <div className="atlas-tabs" role="tablist" aria-label="概念视角">{tabs.map((name, i) => <button key={name} id={`atlas-tab-${i}`} role="tab" aria-selected={tab === name} aria-controls={`atlas-panel-${i}`} tabIndex={tab === name ? 0 : -1} onClick={() => chooseTab(name)} onKeyDown={e => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) { e.preventDefault(); const next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length; chooseTab(tabs[next]); document.getElementById(`atlas-tab-${next}`)?.focus(); } }}>{name}{name === "学习它" && relatedCourses.length > 0 && <small>{relatedCourses.length}</small>}{name === "看看应用" && useResources.length > 0 && <small>{useResources.length}</small>}{name === "用于构建" && buildResources.length > 0 && <small>{buildResources.length}</small>}</button>)}</div>
        <div className="atlas-panel" role="tabpanel" id={`atlas-panel-${tabs.indexOf(tab)}`} aria-labelledby={`atlas-tab-${tabs.indexOf(tab)}`} tabIndex={0} key={`${selected.id}-${tab}`}>
          {tab === "理解它" && <><p className="atlas-source-label">中文导读 · 对应原始研究条目</p><p className="atlas-concept-summary">{guide?.summary}</p>
            {scenario ? <><DesignPreview key={scenario.id} scenario={scenario} /><div className="atlas-insight"><h3>这个改动为什么值得考虑？</h3><p>{scenario.mechanism}</p><h3>改完之后，检查什么？</h3><p>{scenario.check}</p><p className="atlas-scenario-limit"><strong>适用边界：</strong>{scenario.caution}</p></div></> : <div className="atlas-insight"><h3>把它带进你的设计</h3><p>{guide?.question}</p><p className="atlas-small">这是帮助思考的设计问题。是否适用，需要对照具体学习者、任务与下方研究中的条件。</p></div>}
            <div className="atlas-next-actions"><button onClick={() => chooseTab("学习它")}>沿课程学习 <span>{relatedCourses.length ? `${relatedCourses.length} 条路线 →` : "查看学习入口 →"}</span></button><button onClick={() => chooseTab("看看应用")}>看看实际应用 <span>{useResources.length ? `${useResources.length} 项材料 →` : "查找应用材料 →"}</span></button><button onClick={() => chooseTab("用于构建")}>用于自己的作品 <span>{buildResources.length ? `${buildResources.length} 项材料 →` : "查看构建入口 →"}</span></button></div>
            <details className="atlas-research-drawer"><summary>展开英文研究原文、适用条件与来源 · {selected.evidence.sourceIds.length} 个来源</summary><div className="atlas-research-original" lang="en"><h3>{selected.label}</h3><p>{selected.summary}</p><h4>Recommendation</h4><p>{selected.recommendation.rationale}</p><small>{selected.recommendation.status}</small><h4>Mechanism</h4><p>{selected.mechanism}</p><h4>Applicable contexts and prerequisites</h4><ValueView value={selected.applicable} /><ValueView value={selected.prerequisites} /><h4>Constraints and risks</h4><ValueView value={selected.constraints} /><ValueView value={selected.risks} /><h4>Observable evidence</h4><ValueView value={selected.observableEvidence} /><h4>Evidence</h4><p>{selected.evidence.status}</p><p>{selected.evidence.basis}</p><ValueView value={Object.fromEntries(Object.entries(selected.evidence).filter(([key]) => !["status", "basis", "sourceIds"].includes(key)))} /></div><Sources ids={selected.evidence.sourceIds} sources={rack.sources} /></details>
            <Relations entry={selected} rack={rack} onSelect={id => { select(id); }} /><details><summary>条目分类、别名与来源记录 · 英文</summary><div lang="en"><ValueView value={{ id: selected.id, aliases: selected.aliases, tags: selected.tags, classification: selected.classification, provenance: selected.provenance }} /></div></details></>}
          {tab === "学习它" && <><p className="atlas-panel-intro">想系统学会它，可以进入下面的课程。课程中的概念链接会带你回到这里。</p>{relatedCourses.length ? relatedCourses.map(course => <Link className="atlas-resource-card" key={course.slug} href={`/learn/${course.slug}`}><span className="atlas-resource-type">学习路线 · {course.lessonCount} 节</span><h3>{course.title} <span>↗</span></h3><p>{course.summary}</p><span className="atlas-resource-cta">进入课程 →</span></Link>) : <div className="atlas-empty"><h3>这个概念暂时没有独立课程</h3><p>你仍可以阅读中文导读、查看相邻概念，再用自己的话留下一个例子。我们不把相关条目自动当成先修课。</p><button className="atlas-primary" onClick={() => chooseTab("理解它")}>先理解这个概念</button><Link href="/learn">浏览已有课程 →</Link></div>}<div className="atlas-insight"><h3>试着留下自己的解释</h3><p>用一个你熟悉的学习场景，解释这个概念为什么有用、什么时候不适用。</p><button className="atlas-text-button" onClick={() => { chooseTab("我的实践"); setRecordKind("explanation"); }}>写下我的理解 →</button></div></>}
          {(tab === "用于构建" || tab === "看看应用") && <><p className="atlas-panel-intro">{tab === "看看应用" ? "看看这个概念已经怎样进入一个工具或案例。能运行的实现，并不代表已验证教学效果。" : "一个概念可以影响设计判断，也可以连接到实际的组件与可复用技能。选择材料前，先看清适用条件。"}</p>{(tab === "看看应用" ? useResources : buildResources).length ? (tab === "看看应用" ? useResources : buildResources).map(resource => <a key={resource.id} className="atlas-resource-card" href={resource.href} {...(resource.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}><ResourcePreview id={resource.id} /><span className="atlas-resource-type">{resourceKinds[resource.kind]} · {resource.availabilityLabel}</span><h3>{resource.title} <span>↗</span></h3><p>{resource.description}</p><div className="atlas-resource-relation"><strong>与这个概念的联系</strong><p>{resource.relationshipNote}</p></div></a>) : <div className="atlas-empty"><h3>{tab === "看看应用" ? "暂时没有核对过的工具或案例" : "暂时没有核对过的组件或可复用技能"}</h3><p>可以先把这个概念作为设计考虑。这里不会仅凭关键词，把任意材料标为它的应用。</p><button className="atlas-text-button" onClick={() => chooseTab(tab === "看看应用" ? "用于构建" : "看看应用")}>{tab === "看看应用" ? "查看构建材料" : "看看已有应用"} →</button><Link href={tab === "看看应用" ? "/use" : "/build"}>浏览{tab === "看看应用" ? "可用工具" : "构建资源"} →</Link></div>}<div className="atlas-insight"><h3>它改变了你的哪一个决定？</h3><p>比如调整提示的时机、减少无关信息，或者增加一次延迟检查。想法阶段的设计判断，也值得记录。</p><button className="atlas-text-button" onClick={() => { chooseTab("我的实践"); setRecordKind("application"); }}>记录我的设计应用 →</button></div></>}
          {tab === "我的实践" && <><p className="atlas-panel-intro">点亮代表留下了学习行为，不代表已掌握。记录可以是解释、设计决定，也可以是一个实际作品。</p><div className="atlas-record-kind" role="group" aria-label="记录类型"><button aria-pressed={recordKind === "explanation"} onClick={() => setRecordKind("explanation")}>留下解释</button><button aria-pressed={recordKind === "application"} onClick={() => setRecordKind("application")}>用于我的设计／实践</button></div><label className="atlas-field">{recordKind === "explanation" ? "用自己的话，解释一个具体例子" : "你在哪个情境里，因它作出了什么决定？"}<textarea value={note} maxLength={3000} rows={5} onChange={e => setNote(e.target.value)} placeholder={recordKind === "explanation" ? "这个概念让我想到……它的适用条件是……" : "在我的项目里，我决定……因为……接下来我会检查……"} /><small>至少 8 个字符 · {note.length}/3000</small></label>{recordKind === "application" && <label className="atlas-field">作品或项目链接（可选）<input type="url" value={url} maxLength={2000} onChange={e => setUrl(e.target.value)} placeholder="https://…" /></label>}<button className="atlas-primary" disabled={!progress.ready || note.trim().length < 8} onClick={saveNote}>保存这次记录 ↗</button><p className="atlas-small">{progress.persistent ? "仅保存在此浏览器，不跨设备同步。清除浏览器数据会删除记录；可导出备份。" : "当前浏览器无法持久保存。记录仅在本次访问中保留，请及时导出。"}</p><div className="atlas-history-heading"><h3>这个概念的足迹 <span>{myEvents.length}</span></h3>{progress.events.length > 0 && <button className="atlas-text-button" onClick={exportNotes}>导出全部记录 ↓</button>}</div>{myEvents.length ? myEvents.map(event => <article className="atlas-event" key={event.id}><div><strong>{event.kind === "encounter" ? "接触过" : event.kind === "explanation" ? "留下解释" : "用于我的设计／实践"}</strong><time dateTime={event.createdAt}>{event.createdAt.slice(0, 10)}</time></div>{event.text && <p translate="no">{event.text}</p>}{event.projectUrl && <a href={event.projectUrl} target="_blank" rel="noopener noreferrer">打开项目 ↗</a>}<button onClick={() => { progress.removeEvent(event.id); setMessage("这条记录已删除，概念状态已重新计算。"); }} aria-label={`删除 ${event.createdAt.slice(0, 10)} 的${event.kind === "encounter" ? "接触" : "实践"}记录`}>删除记录</button></article>) : <p className="atlas-empty">这里还没有记录。可以从自己的一个例子开始。</p>}</>}
        </div><div className="atlas-message" role="status" aria-live="polite">{message}</div>
      </section></div>
    </section><footer className="atlas-editorial-note"><p>中文导读与设计提问是编辑层；界面示意不是效果验证。180 个概念、217 条关系及研究来源保留原始资料，可在英文研究原文中核对。学习记录由你主动留下。</p><Link href="/learning-sciences">完整研究资料库 · v{rack.rack.version} ↗</Link></footer>
  </main>}</Localize>;
}
