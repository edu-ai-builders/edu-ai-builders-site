export type ConstraintEvidence = "unknown" | "reviewed-metadata" | "restriction-recorded" | "copyleft-observed" | "license-metadata";
export type SearchMatch = {
  status: "candidate" | "related-only";
  matched: { concept: string; said: string; via: string | null; direct: boolean; partial?: boolean; credit: number }[];
  missing: string[];
  constraints: Record<string, ConstraintEvidence>;
};
export type Retrieval = {
  version: string;
  status: "browse" | "no-match" | "related-only" | "candidates";
  concepts: { id: string; term: string; generic: boolean }[];
  constraints: string[];
  gaps: string[];
  coverageNeedsReview: boolean;
  note: string;
};
export type SearchableResource = {
  title: string; description: string; topics: string[]; kind: string;
  name?: string; search_text?: string; stars?: number | null; curated?: boolean;
  review?: { status: "include" | "review" | "exclude"; evidence_level?: string };
  facet_hints?: Record<string, string[]>; facets?: Record<string, string[]>;
  license_observed?: string | null; license?: string | null;
  reuse_status?: string; reuseStatus?: string;
};
export const SEARCH_VERSION: string;
export function searchCatalog<T extends SearchableResource>(records: T[], query?: string, options?: { allowReview?: boolean; limit?: number }): {
  records: (T & { search_match?: SearchMatch })[];
  total: number;
  retrieval: Retrieval;
};
