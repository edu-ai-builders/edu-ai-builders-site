export type Value = string | number | boolean | null | Value[] | { [key: string]: Value };
export type Entry = {
  id: string; label: string; summary: string; kind: string; mechanism: string;
  aliases: string[]; tags: string[];
  applicable: Record<string, Value>; prerequisites: string[]; constraints: string[]; risks: string[];
  observableEvidence: Value[];
  classification: { layer: string; traditions: string[]; domains: string[]; lifespanStages: string[]; functions: string[]; grainSize: string; maturity: string };
  evidence: { status: string; basis: string; sourceIds: string[]; [key: string]: Value };
  recommendation: { status: string; rationale: string };
  provenance: Record<string, Value>;
};
export type Source = { id: string; title: string; url: string; authorsOrInstitution: string; year: number; type: string; provenanceCheck: { status: string; checkedAt: string; method: string }; [key: string]: Value };
export type Relation = { from: string; to: string; type: string; rationale: string; evidenceStatus: string; sourceIds: string[] };
export type Rack = {
  rack: { version: string; status: string; createdAt: string };
  entries: Entry[]; sources: Source[]; relations: Relation[];
  taxonomy: { facets: Record<string, { question: string; values?: string[] | Record<string, string>; ordered?: string[] }> };
  evidenceScale: Record<string, string>; recommendationScale: Record<string, string>;
};
export const layerNames: Record<string, string> = {
  theory: "Theories", framework: "Frameworks", principle: "Principles", method: "Methods", tactic: "Tactics", construct: "Constructs", measure: "Measures", constraint: "Constraints", "anti-pattern": "Anti-patterns",
};
export const humanize = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("-", " ").replace(/^./, (c) => c.toUpperCase());
export const slug = (entry: Entry) => entry.id.replace(/^pedagogy:/, "");
export const filters = [
  ["domain", "Domain", "domains"], ["lifespanStage", "Learner stage", "lifespanStages"],
  ["function", "Learning function", "functions"], ["tradition", "Research tradition", "traditions"],
  ["grainSize", "Scale", "grainSize"], ["maturity", "Maturity", "maturity"],
] as const;
export function matches(entry: Entry, query: string, selected: Record<string, string>) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const content = JSON.stringify(entry).toLowerCase().replaceAll("-", " ");
  if (!terms.every((term) => content.includes(term.replaceAll("-", " ")))) return false;
  if (selected.layer && entry.kind !== selected.layer) return false;
  if (selected.evidence && entry.evidence.status !== selected.evidence) return false;
  return filters.every(([key, , field]) => {
    const value = entry.classification[field];
    return !selected[key] || (Array.isArray(value) ? value.includes(selected[key]) : value === selected[key]);
  });
}
export function sourceUrl(url: string) {
  try { const parsed = new URL(url); return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : undefined; } catch { return undefined; }
}
