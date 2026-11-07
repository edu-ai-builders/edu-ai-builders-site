// Explainable bilingual ranker over the Edu AI Builders catalog snapshot.
// No dependencies; runs in Node and in the browser. Same record shape as app/lib/builder-core.ts.
import { CONCEPTS, CONSTRAINTS, KIND_HINTS, STOP_EN, STOP_ZH } from "./lexicon.mjs";

export const VERSION = "bridge-ranker 0.2.0";
const FIELDS = { title: 3, topics: 2.5, description: 1 };
const K1 = 1.2, B = 0.75;
const CJK = /[㐀-鿿豈-﫿]/;
const CJK_RUN = /[㐀-鿿豈-﫿]+/g;

const norm = s => (s || "").normalize("NFKC").toLowerCase();

function stem(w) {
  if (w.length <= 3 || /\d/.test(w)) return w;
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("sses")) return w.slice(0, -2);
  if (w.endsWith("s") && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
  if (w.endsWith("ing") && w.length > 6) return w.slice(0, -3);
  if (w.endsWith("ation") && w.length > 7) return w.slice(0, -5) + "e";
  if (w.endsWith("ally") && w.length > 7) return w.slice(0, -2);
  return w;
}

// Latin words (camelCase and owner/name split), stemmed, plus adjacent bigrams; CJK runs as bigrams.
export function tokenize(text) {
  const raw = (text || "").replace(/([a-z])([A-Z])/g, "$1 $2");
  const s = norm(raw);
  const words = (s.match(/[a-z0-9]+/g) || []).map(stem);
  const out = [...words];
  for (let i = 0; i + 1 < words.length; i++) out.push(words[i] + "_" + words[i + 1]);
  for (const run of s.match(CJK_RUN) || []) {
    if (run.length === 1) out.push(run);
    for (let i = 0; i + 1 < run.length; i++) out.push(run.slice(i, i + 2));
  }
  return out;
}

// One index term per phrase: "spaced repetition" -> "spaced_repetition"; CJK phrase -> its bigrams.
function phraseTerms(phrase) {
  const p = norm(phrase);
  if (CJK.test(p)) return { all: tokenize(p).filter(t => CJK.test(t)) };
  const words = (p.match(/[a-z0-9]+/g) || []).map(stem);
  if (!words.length) return { all: [] };
  if (words.length === 1) return { all: words };
  return { all: words.slice(0, -1).map((w, i) => w + "_" + words[i + 1]) };
}

export function buildIndex(records) {
  const docs = records.map(r => {
    const fields = { title: tokenize(r.title.replace(/[\/_.-]/g, " ")), topics: tokenize(r.topics.join(" ").replace(/-/g, " ")), description: tokenize(r.description) };
    const tf = {};
    for (const [f, toks] of Object.entries(fields)) {
      tf[f] = new Map();
      for (const t of toks) tf[f].set(t, (tf[f].get(t) || 0) + 1);
    }
    return { r, tf, len: Object.fromEntries(Object.entries(fields).map(([f, t]) => [f, t.length])), hay: norm([r.title, r.description, ...r.topics].join(" ")) };
  });
  const avg = {}, df = new Map();
  for (const f of Object.keys(FIELDS)) avg[f] = docs.reduce((a, d) => a + d.len[f], 0) / docs.length || 1;
  for (const d of docs) {
    const seen = new Set();
    for (const f of Object.keys(FIELDS)) for (const t of d.tf[f].keys()) seen.add(t);
    for (const t of seen) df.set(t, (df.get(t) || 0) + 1);
  }
  return { docs, avg, df, N: docs.length };
}

function idf(index, t) {
  const n = index.df.get(t) || 0;
  return Math.log(1 + (index.N - n + 0.5) / (n + 0.5));
}

function termScore(index, d, t) {
  let tf = 0;
  for (const [f, w] of Object.entries(FIELDS)) {
    const c = d.tf[f].get(t);
    if (c) tf += w * c / (1 - B + B * d.len[f] / index.avg[f]);
  }
  return tf ? idf(index, t) * tf / (K1 + tf) : 0;
}

function phraseScore(index, d, phrase) {
  const { all } = phraseTerms(phrase);
  if (!all.length) return 0;
  // A multi-word phrase must match all of its bigrams; CJK phrases need every bigram too.
  const parts = all.map(t => termScore(index, d, t));
  return parts.every(x => x > 0) ? parts.reduce((a, b) => a + b, 0) / Math.sqrt(parts.length) : 0;
}

function findSpans(q, forms) {
  const hits = [];
  for (const f of forms) {
    const nf = norm(f);
    if (!nf) continue;
    const re = CJK.test(nf) ? new RegExp(nf.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g") : new RegExp(`(^|[^a-z0-9])(${nf.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:s|es)?)(?=$|[^a-z0-9])`, "g");
    let m;
    while ((m = re.exec(q))) {
      const start = CJK.test(nf) ? m.index : m.index + m[1].length;
      hits.push({ start, end: start + (CJK.test(nf) ? nf.length : m[2].length), form: nf });
      if (re.lastIndex === m.index) re.lastIndex++;
    }
  }
  return hits;
}

// Parse query into concepts (with expansions), constraints, kind hints and residual raw terms.
export function parseQuery(query, opts = {}) {
  let q = norm(query).slice(0, 300);
  const taken = new Array(q.length).fill(false);
  const claim = (spans) => {
    const ok = [];
    spans.sort((a, b) => (b.end - b.start) - (a.end - a.start));
    for (const s of spans) {
      if (taken.slice(s.start, s.end).some(Boolean)) continue;
      for (let i = s.start; i < s.end; i++) taken[i] = true;
      ok.push(s);
    }
    return ok;
  };
  const constraints = [], kinds = [];
  // Constraint and kind phrases are claimed first only when they are not part of a longer concept phrase.
  const conceptSpans = opts.plain ? [] : CONCEPTS.flatMap(c => findSpans(q, [...c.zh, ...c.en]).map(s => ({ ...s, c })));
  const constraintSpans = opts.plain ? [] : CONSTRAINTS.flatMap(c => findSpans(q, [...c.zh, ...c.en]).map(s => ({ ...s, k: c })));
  const all = claim([...conceptSpans, ...constraintSpans]);
  const concepts = [];
  for (const s of all) {
    if (s.k) { if (!constraints.includes(s.k.id)) constraints.push(s.k.id); continue; }
    if (!concepts.some(x => x.id === s.c.id)) concepts.push({ id: s.c.id, said: s.form, generic: !!s.c.generic, terms: [{ phrase: s.form, w: 1 }, ...s.c.expand.filter(e => norm(e) !== s.form).map(e => ({ phrase: e, w: 0.6 }))] });
  }
  if (!opts.plain) for (const k of KIND_HINTS) if (findSpans(norm(query), [...k.zh, ...k.en]).length && !kinds.includes(k.kind)) kinds.push(k.kind);
  // Residual: unclaimed latin words and CJK runs after stopword removal become their own concepts.
  let rest = "";
  for (let i = 0; i < q.length; i++) rest += taken[i] ? " " : q[i];
  for (const w of STOP_ZH.slice().sort((a, b) => b.length - a.length)) rest = rest.split(w).join(" ");
  const residual = [];
  for (const w of rest.match(/[a-z0-9][a-z0-9+#.-]*/g) || []) {
    const clean = w.replace(/[.-]+$/, "");
    if (clean.length < 2 || STOP_EN.has(clean)) continue;
    residual.push(clean);
  }
  for (const run of rest.match(CJK_RUN) || []) if (run.length >= 2) residual.push(run);
  for (const w of residual) {
    if (concepts.some(c => c.said === w)) continue;
    const bag = CJK.test(w) && w.length > 2 ? tokenize(w).filter(t => t.length === 2) : null;
    concepts.push({ id: "raw:" + w, said: w, generic: false, raw: true, bag, terms: [{ phrase: w, w: 1 }] });
  }
  return { query: norm(query).trim(), concepts, constraints, kinds };
}

function constraintStatus(id, r, hay) {
  const h = r.facet_hints || {};
  const has = (k, v) => (h[k] || []).includes(v);
  const text = (...ws) => ws.some(w => hay.includes(w));
  switch (id) {
    case "offline": return text("offline", "local-first", "离线", "pwa", "no internet") || has("capabilities", "offline") ? (text("offline", "离线", "local-first") ? "stated" : "hinted") : "unknown";
    case "mobile": return has("platforms", "android") || has("platforms", "ios") || text("mobile", "android", "ios", "flutter", "react native", "手机", "移动") ? (text("mobile", "android", "ios", "flutter", "react native", "手机") ? "stated" : "hinted") : "unknown";
    case "browser": return has("platforms", "web") || text("web app", "browser", "javascript", "react", "pwa", "next.js", "typescript", "网页") ? "hinted" : "unknown";
    case "no-paid-api": return text("openai", "gpt-4", "gpt-3", "gemini", "claude", "anthropic", "api key", "deepseek", "qwen") ? "risk" : "unknown";
    case "commercial": {
      const l = (r.license_observed || "").toLowerCase();
      if (/nc|non-commercial|noncommercial/.test(l) || r.reuse_status === "restricted") return "risk";
      return /^(mit|apache|bsd|isc|mpl|cc0|cc-by-4|unlicense|0bsd|zlib)/.test(l) ? "repo-license-only" : "unknown";
    }
    case "chinese-ui": return CJK.test(r.title + r.description) || (r.topics || []).some(t => /chinese|中文/.test(t)) ? "hinted" : "unknown";
    case "open-source": return r.license_observed ? "repo-license-only" : "unknown";
    default: return "unknown";
  }
}

// Importance of a concept: rarity of its rarest catalog-present term. Absent concepts weigh 0 and become gaps.
function conceptWeight(index, c) {
  const terms = c.bag || c.terms.flatMap(t => phraseTerms(t.phrase).all);
  const present = terms.filter(t => index.df.get(t));
  if (!present.length) return 0;
  const w = Math.max(...present.map(t => idf(index, t)));
  return (c.raw ? 0.7 : 1) * Math.min(w, 6);
}

function conceptScore(index, d, c) {
  if (c.bag) {
    const hits = c.bag.map(t => termScore(index, d, t));
    const n = hits.filter(x => x > 0).length;
    return { s: n ? hits.reduce((a, b) => a + b, 0) / c.bag.length : 0, credit: n / c.bag.length, via: c.said, direct: true };
  }
  let best = 0, bestTerm = null, extra = 0, bestW = 0;
  for (const t of c.terms) {
    const s = phraseScore(index, d, t.phrase) * t.w;
    if (s > best) { extra += best; best = s; bestTerm = t.phrase; bestW = t.w; } else extra += s;
  }
  const direct = bestW === 1;
  return { s: best + 0.15 * extra, credit: best ? (direct ? 1 : 0.6) : 0, via: bestTerm, direct };
}

export function search(index, query, opts = {}) {
  // opts.plain: ablation without the bilingual lexicon, constraints or kind hints (BM25 over raw terms only).
  const parsed = parseQuery(query, opts);
  const limit = opts.limit || 10;
  const intent = parsed.concepts.filter(c => !c.generic);
  const active = (intent.length ? intent : parsed.concepts).map(c => ({ c, w: conceptWeight(index, c) }));
  const wsum = active.reduce((a, x) => a + x.w, 0);
  const hitCount = new Map(active.map(x => [x.c.id, 0]));
  const scored = [];
  for (const d of index.docs) {
    if (opts.kind && d.r.kind !== opts.kind) continue;
    let total = 0, covered = 0;
    const why = [];
    for (const c of parsed.concepts) {
      const r = conceptScore(index, d, c);
      if (!(r.s > 0)) continue;
      total += c.generic ? 0.3 * r.s : r.s;
      const a = active.find(x => x.c === c);
      if (a) { covered += a.w * r.credit; hitCount.set(c.id, hitCount.get(c.id) + 1); }
      why.push({ concept: c.id, said: c.said, via: r.via, direct: r.direct, credit: +r.credit.toFixed(2) });
    }
    if (!total) continue;
    const cov = wsum ? covered / wsum : 1;
    let score = total * Math.pow(Math.max(cov, 0.05), 1.5);
    if (parsed.kinds.length) score *= parsed.kinds.includes(d.r.kind) ? 1.5 : 0.75;
    else if (d.r.kind === "awesome_index") score *= 0.8;
    const constraints = Object.fromEntries(parsed.constraints.map(id => [id, constraintStatus(id, d.r, d.hay)]));
    for (const st of Object.values(constraints)) score *= st === "stated" ? 1.25 : st === "hinted" ? 1.1 : st === "risk" ? 0.8 : 1;
    if (d.r.curated) score *= 1.1;
    scored.push({ record: d.r, score, coverage: cov, matched: why, missing: active.filter(x => x.w && !why.some(w => w.concept === x.c.id)).map(x => x.c.said), constraints });
  }
  scored.sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title));
  // Concepts that no catalog record mentions are an honest coverage gap, distinct from a ranking error.
  const gaps = active.filter(x => !x.w || hitCount.get(x.c.id) === 0).map(x => x.c.said);
  return { version: VERSION, parsed, total: scored.length, gaps, results: scored.slice(0, limit) };
}
