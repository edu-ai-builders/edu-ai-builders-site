export type SavedProject = {
  id: string;
  title: string;
  scenario: string;
  savedAt: string;
  snapshot: string;
  markdown: string;
  resources: { id: string; commit: string | null; reuse: string; license: string }[];
  options?: { goal: string; platform: string; commercial: boolean };
};

export function readSavedProjects(raw: string | null): SavedProject[] {
  try {
    const value: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is SavedProject => {
      if (!item || typeof item !== "object") return false;
      for (const key of ["id", "title", "savedAt", "snapshot", "markdown"]) {
        if (typeof item[key] !== "string") return false;
      }
      if (!["family-math", "science-evidence", "research-workflow"].includes(item.scenario)) return false;
      if (item.options !== undefined && (!item.options || typeof item.options.goal !== "string" || item.options.goal.length > 2000 || !["web", "mobile", "desktop"].includes(item.options.platform) || typeof item.options.commercial !== "boolean")) return false;
      if (!Array.isArray(item.resources) || item.resources.length > 50) return false;
      return item.resources.every((resource: SavedProject["resources"][number]) =>
        resource && typeof resource.id === "string" &&
        (resource.commit === null || typeof resource.commit === "string") &&
        typeof resource.reuse === "string" && typeof resource.license === "string",
      );
    }).slice(0, 10);
  } catch {
    return [];
  }
}
