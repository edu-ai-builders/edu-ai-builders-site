"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { filters, humanize, layerNames, matches, slug, sourceUrl, type Entry, type Rack, type Source, type Value } from "./knowledge";

const dataRoot = "/learning-sciences/0.2.0";
const repo = "https://github.com/ywEdAi/learning-sciences";

function Fields({ value }: { value: Value }) {
  if (value === null) return null;
  if (typeof value !== "object") return <span>{String(value)}</span>;
  if (Array.isArray(value)) return <ul className="ls-bullets">{value.map((item, i) => <li key={i}><Fields value={item} /></li>)}</ul>;
  return <dl className="ls-fields">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{humanize(key)}</dt><dd><Fields value={item} /></dd></div>)}</dl>;
}

function SourceCard({ source }: { source: Source }) {
  const checked = source.provenanceCheck.status === "verified";
  return <li className="ls-source" id={source.id}>
    <a href={sourceUrl(source.url)} target="_blank" rel="noreferrer">{source.title} <span aria-hidden="true">↗</span></a>
    <p>{source.authorsOrInstitution} · {source.year} · {humanize(source.type)}</p>
    <small className={checked ? "" : "ls-unverified"}>{checked ? (source.provenanceCheck.method === "crossref-metadata" ? "DOI metadata checked" : "URL resolved") : "Unverified — host blocks automated requests"} · {source.provenanceCheck.checkedAt}</small>
    <details><summary>Source record</summary><Fields value={source} /></details>
  </li>;
}

export default function Explorer({ rack, initial }: { rack: Rack; initial: Record<string, string> }) {
  const [query, setQuery] = useState(initial.q || "");
  const [selected, setSelected] = useState<Record<string, string>>(() => Object.fromEntries(["layer", "evidence", ...filters.map(([key]) => key)].map((key) => [key, initial[key] || ""])));
  const [entryId, setEntryId] = useState(initial.entry || "retrieval-practice");
  const detailRef = useRef<HTMLElement>(null);
  const entries = useMemo(() => [...rack.entries].sort((a, b) => a.label.localeCompare(b.label)), [rack.entries]);
  const results = useMemo(() => entries.filter((entry) => matches(entry, query, selected)), [entries, query, selected]);
  const current = results.find((entry) => slug(entry) === entryId) || results[0];
  const sources = useMemo(() => new Map(rack.sources.map((source) => [source.id, source])), [rack.sources]);
  const byId = useMemo(() => new Map(entries.map((entry) => [entry.id, entry])), [entries]);
  const relations = current ? rack.relations.filter((rel) => rel.from === current.id || rel.to === current.id) : [];
  const activeFilters = Object.values(selected).filter(Boolean).length;

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    for (const [key, value] of Object.entries(selected)) if (value) params.set(key, value);
    if (current) params.set("entry", slug(current));
    const url = `/learning-sciences${params.size ? `?${params}` : ""}`;
    window.history.replaceState(null, "", url);
  }, [query, selected, current]);

  const changeFilter = (key: string, value: string) => setSelected((prev) => ({ ...prev, [key]: value }));
  const reset = () => { setQuery(""); setSelected({}); };
  const openEntry = (entry: Entry, resetFilters = false) => {
    if (resetFilters) reset();
    setEntryId(slug(entry));
    requestAnimationFrame(() => { detailRef.current?.focus({ preventScroll: true }); if (window.matchMedia("(max-width: 900px)").matches) detailRef.current?.scrollIntoView({ behavior: "instant", block: "start" }); });
  };
  const renderSources = (ids: string[]) => <ul className="ls-source-list">{ids.map((id) => { const source = sources.get(id); return source ? <SourceCard source={source} key={id} /> : null; })}</ul>;

  return <main className="ls-page">
    <a className="skip-link" href="#ls-explore">Skip to knowledge explorer</a>
    <header className="ls-header">
      <Link className="brand" href="/" aria-label="Edu AI Builders home"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><b>e</b></span><span>Edu AI Builders</span></Link>
      <nav aria-label="Main navigation"><Link href="/">Home</Link><a href="/learning-sciences" aria-current="page">Learning Sciences</a><a href="/directory">Open-source Directory ↗</a></nav>
    </header>

    <section className="ls-intro" aria-labelledby="ls-title">
      <div><p className="ls-eyebrow">EDU AI BUILDERS / KNOWLEDGE LIBRARY</p><h1 id="ls-title">Learning Sciences<span>.</span></h1><p className="ls-deck">Understand how people learn. Explore the evidence behind what you build.</p></div>
      <div className="ls-version"><span>v{rack.rack.version} <b>Draft</b></span><p>Research cut · {rack.rack.createdAt}</p><a href={`${dataRoot}/REPORT.md`}>Read the research synthesis ↗</a></div>
    </section>

    <div className="ls-meta-bar"><div><strong>{entries.length}</strong> entries <span>·</span> <strong>{Object.keys(layerNames).length}</strong> knowledge layers <span>·</span> <strong>{rack.relations.length}</strong> relationships <span>·</span> <strong>{rack.sources.length}</strong> sources</div><a href={repo} target="_blank" rel="noreferrer">Source repository ↗</a></div>

    <section className="ls-workspace" id="ls-explore" aria-label="Learning sciences explorer">
      <aside className="ls-sidebar">
        <h2>Explore by layer</h2>
        <button className="ls-layer" aria-pressed={!selected.layer} onClick={() => changeFilter("layer", "")}><span>All knowledge</span><b>{entries.length}</b></button>
        {Object.entries(layerNames).map(([key, label], index) => <button className="ls-layer" key={key} aria-pressed={selected.layer === key} onClick={() => changeFilter("layer", key)} title={(rack.taxonomy.facets.layer.values as Record<string, string>)[key]}><span><small>{String(index + 1).padStart(2, "0")}</small>{label}</span><b>{entries.filter((entry) => entry.kind === key).length}</b></button>)}
        <div className="ls-sidebar-note"><h3>Evidence, in context.</h3><p>Each entry includes where it applies, what could go wrong, and what to observe. Start with a concept; keep its conditions in view.</p></div>
        <details className="ls-about"><summary>About this collection</summary><p>A draft synthesis for educators, designers and builders. It has not been independently reviewed by domain specialists.</p><p>Source checks are recorded as of August 30, 2026: 237 verified metadata or URL records; 4 blocked and unverified. A metadata check is not a review of a scientific claim.</p><p>Evidence grades describe bounded claims. They do not prescribe teaching decisions or diagnose individual learners.</p><a href={`${dataRoot}/REPORT.md`}>Scope, evidence rules and limits ↗</a></details>
        <details className="ls-about"><summary>Download the collection</summary>{["rack.json", "entries.csv", "relations.csv", "sources.csv", "classification.csv", "taxonomy.json", "rack.schema.json"].map((file) => <a className="ls-download" key={file} href={`${dataRoot}/${file}`} download>{file} ↓</a>)}</details>
      </aside>

      <div className="ls-content">
        <div className="ls-search-bar"><label htmlFor="ls-search">Search the knowledge library</label><div className="ls-search-input"><span aria-hidden="true">⌕</span><input id="ls-search" type="search" placeholder="Search concepts, teaching moves, evidence…" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
        <div className="ls-filters">
          {filters.slice(0, 3).map(([key, label]) => <label key={key}>{label}<select value={selected[key] || ""} onChange={(event) => changeFilter(key, event.target.value)}><option value="">All {label.toLowerCase()}s</option>{(rack.taxonomy.facets[key].ordered || rack.taxonomy.facets[key].values as string[]).map((value) => <option key={value} value={value}>{humanize(value)}</option>)}</select></label>)}
          <label>Evidence<select value={selected.evidence || ""} onChange={(event) => changeFilter("evidence", event.target.value)}><option value="">All evidence</option>{Object.keys(rack.evidenceScale).map((value) => <option key={value} value={value}>{humanize(value)}</option>)}</select></label>
          <details className="ls-more"><summary>More filters{activeFilters > 0 ? ` (${activeFilters})` : ""}</summary><div>{filters.slice(3).map(([key, label]) => { const facet = rack.taxonomy.facets[key]; const values = facet.ordered || (Array.isArray(facet.values) ? facet.values : Object.keys(facet.values || {})); return <label key={key}>{label}<select value={selected[key] || ""} onChange={(event) => changeFilter(key, event.target.value)}><option value="">All</option>{values.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}</select></label>; })}</div></details>
        </div>

        <div className="ls-results-bar"><p role="status">{results.length} {results.length === 1 ? "entry" : "entries"}{selected.layer ? ` · ${layerNames[selected.layer] || humanize(selected.layer)}` : " · All knowledge"}</p>{(query || activeFilters > 0) && <button onClick={reset}>Clear filters ×</button>}<span>Read a concept. Follow its connections.</span></div>
        {results.length === 0 ? <div className="ls-empty"><h2>No entries match these filters.</h2><p>Try a broader concept or remove a filter.</p><button onClick={reset}>Show all knowledge</button></div> : <div className="ls-reading-room">
          <div className="ls-entry-list" aria-label="Knowledge entries">{results.map((entry) => <button key={entry.id} className="ls-entry" aria-pressed={current?.id === entry.id} onClick={() => openEntry(entry)}><div className="ls-entry-top"><span>{humanize(entry.kind)}</span><i aria-hidden="true">↗</i></div><h3>{entry.label}</h3><p>{entry.summary}</p><span className={`ls-badge ls-${entry.evidence.status}`}>{humanize(entry.evidence.status)}</span></button>)}</div>

          {current && <article key={current.id} className="ls-detail" ref={detailRef} tabIndex={-1} aria-label={current.label}>
            <div className="ls-detail-top"><span>{humanize(current.kind)} / {humanize(current.classification.maturity)}</span><a href={`/learning-sciences?entry=${encodeURIComponent(slug(current))}`} aria-label={`Permanent link to ${current.label}`}>Permalink ↗</a></div>
            <h2>{current.label}</h2><p className="ls-summary">{current.summary}</p>
            <div className="ls-chips">{current.classification.domains.map((domain) => <span key={domain}>{humanize(domain)}</span>)}</div>
            <section className="ls-evidence"><div><span className={`ls-badge ls-${current.evidence.status}`}>{humanize(current.evidence.status)}</span><span>Evidence</span></div><p>{current.evidence.basis}</p><details><summary>What this evidence grade means</summary><p>{rack.evidenceScale[current.evidence.status]}</p></details></section>
            <section><h3>How it works</h3><p>{current.mechanism}</p></section>
            <section><h3>When it fits</h3><Fields value={current.applicable} /><h4>Prerequisites</h4><Fields value={current.prerequisites} /></section>
            <section className="ls-cautions"><h3>Conditions & risks</h3><h4>Conditions to preserve</h4><Fields value={current.constraints} /><h4>What can go wrong</h4><Fields value={current.risks} /></section>
            <section><h3>What to observe</h3><Fields value={current.observableEvidence} /></section>
            <section><h3>Design implications</h3><span className="ls-badge">{humanize(current.recommendation.status)}</span><p>{current.recommendation.rationale}</p><p className="ls-small">{rack.recommendationScale[current.recommendation.status]}</p></section>
            <section><h3>Evidence details</h3><Fields value={Object.fromEntries(Object.entries(current.evidence).filter(([key]) => !["sourceIds", "status", "basis"].includes(key)))} /></section>
            <section><h3>Sources <span>{current.evidence.sourceIds.length}</span></h3>{renderSources(current.evidence.sourceIds)}</section>
            <section><h3>Connected concepts <span>{relations.length}</span></h3><p className="ls-small">Relationships include their rationale and supporting sources.</p><div className="ls-connections">{relations.map((relation, index) => { const target = byId.get(relation.from === current.id ? relation.to : relation.from); if (!target) return null; return <div className="ls-connection" key={index}><small>{relation.from === current.id ? "This concept" : target.label} → {humanize(relation.type).toLowerCase()} → {relation.to === current.id ? "this concept" : target.label}</small><button onClick={() => openEntry(target, true)}>{target.label} <span>↗</span></button><p>{relation.rationale}</p><details><summary>Relationship evidence · {humanize(relation.evidenceStatus)}</summary>{renderSources(relation.sourceIds)}</details></div>; })}</div></section>
            <details className="ls-record"><summary>Classification, provenance & complete record</summary><Fields value={current.classification} /><Fields value={current.provenance} /><p className="ls-citation">Cite: rack:learning-sciences@{rack.rack.version} / {current.id}</p><pre>{JSON.stringify(current, null, 2)}</pre></details>
          </article>}
        </div>}
      </div>
    </section>
    <div className="ls-footer"><span>Edu AI Builders · Learning Sciences</span><span>Versioned knowledge. Sources and limitations kept together.</span><a href="/directory">Explore open-source resources ↗</a></div>
  </main>;
}
