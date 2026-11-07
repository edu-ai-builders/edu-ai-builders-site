import { buildIndex, search, tokenize, VERSION } from "./ranker.mjs";

export const SEARCH_VERSION = `${VERSION}; reviewed-catalog 1`;

// Site-domain additions stay outside the frozen experiment lexicon.
const KNOWLEDGE_ALIASES = [
  { term: "知识图谱", source: /\bknowledge graphs?\b/i, via: "knowledge graph" },
  { term: "knowledge graph", source: /知识图谱/, via: "知识图谱" },
];

function metadataPriority(record) {
  return record.curated ? 2 : record.review?.evidence_level === "editorial-metadata-review" ? 1 : 0;
}

function constraintEvidence(id, record) {
  const facets = record.facet_hints || record.facets || {};
  const has = (key, values) => values.some(value => (facets[key] || []).includes(value));
  switch (id) {
    case "offline": return has("capabilities", ["offline"]) ? "reviewed-metadata" : "unknown";
    case "mobile": return has("platforms", ["mobile", "ios", "android"]) ? "reviewed-metadata" : "unknown";
    case "browser": return has("platforms", ["web"]) ? "reviewed-metadata" : "unknown";
    case "commercial": {
      if (record.reuse_status === "restricted" || record.reuseStatus === "restricted") return "restriction-recorded";
      const license = record.license_observed || record.license || "";
      if (/^(?:a?gpl|lgpl)/i.test(license)) return "copyleft-observed";
      return license && !/^(?:NOASSERTION|Other)$/i.test(license) ? "license-metadata" : "unknown";
    }
    case "open-source": {
      const license = record.license_observed || record.license || "";
      return license && !/^(?:NOASSERTION|Other)$/i.test(license) ? "license-metadata" : "unknown";
    }
    default: return "unknown";
  }
}

const priorConstraintWeight = status => status === "stated" ? 1.25 : status === "hinted" ? 1.1 : status === "risk" ? 0.8 : 1;

export function searchCatalog(records, query = "", options = {}) {
  const normalized = query.normalize("NFKC").toLowerCase().trim().slice(0, 300);
  const eligible = records.filter(record => record.review?.status !== "exclude" &&
    (options.allowReview || record.review?.status !== "review"));
  if (!normalized) {
    const ordered = eligible.slice().sort((a, b) => metadataPriority(b) - metadataPriority(a) ||
      (b.stars || 0) - (a.stars || 0) || a.title.localeCompare(b.title));
    return { records: ordered.slice(0, options.limit ?? ordered.length), total: ordered.length,
      retrieval: { version: SEARCH_VERSION, status: "browse", concepts: [], constraints: [], gaps: [],
        coverageNeedsReview: false, note: "Editorial source review and metadata are distinct from runtime evidence." } };
  }
  const documents = eligible.map(original => {
    const sourceText = [original.title, original.name, original.description, original.search_text, ...(original.topics || [])].filter(Boolean).join(" ").toLowerCase();
    const aliases = KNOWLEDGE_ALIASES.filter(alias => alias.source.test(sourceText) && !sourceText.includes(alias.term));
    return {
      ...original, original, aliases, sourceText,
      title: [original.title, original.name, original.title.toLowerCase(), original.name?.toLowerCase()].filter(Boolean).join(" "),
      description: [original.description, original.search_text, ...aliases.map(alias => alias.term)].filter(Boolean).join(" "),
      topics: original.topics || [], facet_hints: original.facet_hints || original.facets || {},
      license_observed: original.license_observed || original.license,
      reuse_status: original.reuse_status || original.reuseStatus,
    };
  });
  const result = search(buildIndex(documents), normalized, { limit: documents.length || 1 });
  const primary = result.parsed.concepts.filter(concept => !concept.generic);
  const ranked = result.results.map(hit => {
    const matched = hit.matched.map(match => {
      const alias = hit.record.aliases.find(alias => match.via && alias.term.includes(match.via) && !hit.record.sourceText.includes(match.via));
      if (match.concept.startsWith("raw:") && match.credit < 1) {
        const observed = new Set(tokenize(hit.record.sourceText));
        const fragments = tokenize(match.said).filter(term => term.length === 2 && observed.has(term));
        return {...match, via: [...new Set(fragments)].join(" / "), direct: false, partial: true};
      }
      return alias ? {...match, via: alias.via, direct: false, credit: 0.6} : match;
    });
    const missing = primary.filter(concept => !matched.some(match => match.concept === concept.id && !match.partial)).map(concept => concept.said);
    const specificHit = primary.some(concept => matched.some(match => match.concept === concept.id && !match.partial));
    const constraints = Object.fromEntries(result.parsed.constraints.map(id => [id, constraintEvidence(id, hit.record.original)]));
    // Remove the experiment's heuristic constraint boosts; unknown evidence cannot improve suitability.
    const score = hit.score / Object.values(hit.constraints).reduce((weight, status) => weight * priorConstraintWeight(status), 1);
    const status = specificHit && !missing.length ? "candidate" : "related-only";
    const knownCoverage = primary.filter(concept => !concept.raw && matched.some(match => match.concept === concept.id && !match.partial)).length;
    return { record: hit.record.original, score, knownCoverage, match: { status, matched, missing, constraints } };
  });
  ranked.sort((a, b) => b.knownCoverage - a.knownCoverage || b.score - a.score || metadataPriority(b.record) - metadataPriority(a.record) || a.record.title.localeCompare(b.record.title));
  const status = !ranked.length ? "no-match" : ranked.every(hit => hit.match.status === "related-only") ? "related-only" : "candidates";
  return {
    records: ranked.slice(0, options.limit ?? ranked.length).map(hit => ({ ...hit.record, search_match: hit.match })),
    total: ranked.length,
    retrieval: { version: SEARCH_VERSION, status,
      concepts: result.parsed.concepts.map(concept => ({ id: concept.id, term: concept.said, generic: concept.generic })),
      constraints: result.parsed.constraints, gaps: result.gaps,
      coverageNeedsReview: !!result.gaps.length || status === "related-only" || status === "no-match",
      note: "Matches are metadata leads. Missing evidence does not prove catalog absence; constraints and compatibility need separate verification." },
  };
}
