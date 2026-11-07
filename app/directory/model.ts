import { searchCatalog, type SearchMatch } from "../lib/search/index.mjs";

export type RadarKind = "repo" | "dataset" | "benchmark" | "awesome_index" | "skill" | "knowledge";
export type RadarRecord = {
  id: string; kind: RadarKind; name: string; title: string; description: string; url: string | null;
  homepage: string | null; topics: string[]; language: string | null; license: string | null;
  stars: number | null; archived: boolean; pushedAt: string | null; checkedAt: string | null;
  refreshStatus: "refreshed" | "failed" | "not-refreshed"; refreshError?: string | null;
  manifestSha?: string; repositoryCheckedAt?: string; repositoryRefreshStatus?: string; source: string; sourceUrl: string | null; importedFrom: string;
  artifactKind?: string; review?: { status: "include" | "review" | "exclude"; reasons: string[]; evidence_level: string };
  facets?: Record<string, string[]>; runtimeTested?: boolean | null; reuseStatus?: string;
  curated?: boolean; search_match?: SearchMatch;
};
export type RadarSummary = { schemaVersion: number; generatedAt: string; total: number; repositories: number; skills: number; refreshed: number; notRefreshed: number; failed: number; excludedUnverified: number; repositoryRequests: number; repositoryRefreshSuccess: number; repositoryRefreshErrors: number; included?: number; needsReview?: number; excluded?: number };
export type RadarCatalog = { summary: RadarSummary; records: RadarRecord[] };
export type Collection = "all" | "repo" | "skill" | "data" | "awesome_index" | "knowledge";
export type Task = "all" | "teach" | "make" | "learn" | "research" | "operate";

export const collections: { id: Collection; label: string; detail: string; icon: string }[] = [
  { id: "all", label: "全部资源", detail: "从一个问题找到起点", icon: "◎" },
  { id: "repo", label: "工具与系统", detail: "试用、部署，或拆开看看", icon: "▦" },
  { id: "skill", label: "AI 工作流 Skills", detail: "看懂工作步骤，再决定复用", icon: "✳" },
  { id: "data", label: "数据与基准", detail: "找练习素材、数据和评测集", icon: "◫" },
  { id: "knowledge", label: "教材与知识", detail: "开放教材、课程与知识图谱", icon: "▤" },
  { id: "awesome_index", label: "资源清单", detail: "沿着整理好的线索继续发现", icon: "≡" },
];
export const tasks: { id: Task; label: string; detail: string }[] = [
  { id: "all", label: "不限用途", detail: "浏览所有收录" },
  { id: "teach", label: "备课与教学", detail: "课程、练习、课堂互动" },
  { id: "make", label: "制作教育工具", detail: "组件、AI 能力与基础设施" },
  { id: "learn", label: "个人学习", detail: "自学、辅导、教材与学习方法" },
  { id: "research", label: "研究与评估", detail: "数据、实验与评测" },
  { id: "operate", label: "系统运维", detail: "学习环境、集成与教育系统管理" },
];
export const featured: Partial<Record<string, { title: string; description: string; task: Task; visual: "cards" | "code" | "classroom" | "chart"; next: string }>> = {
  "datawhalechina/easy-vibe": { title: "把第一个想法做出来", description: "从描述需求、做原型到完整应用的 AI 编程教程。适合先做一个小项目，再补齐知识。", task: "learn", visual: "code", next: "从一个能展示的原型开始" },
  "ankitects/anki": { title: "把复习做成一个习惯", description: "查看开源卡片与复习系统，观察卡片内容、回忆动作和复习安排怎样配合。", task: "teach", visual: "cards", next: "观察一个复习回合的设计" },
  "learningequality/kolibri": { title: "让离线课堂也能学习", description: "面向离线优先场景的学习平台。可研究课程组织、学习者体验与课堂管理。", task: "teach", visual: "classroom", next: "看看课程怎样抵达学习者" },
  "microsoft/Web-Dev-For-Beginners": { title: "看懂网页如何工作", description: "通过网页项目学习 HTML、CSS 与 JavaScript，把界面、样式和交互连接起来。", task: "learn", visual: "code", next: "动手修改一个网页" },
  "sympy/sympy": { title: "给数学工具加上计算能力", description: "Python 符号计算库。适合研究表达式、方程与计算能力如何成为工具的一部分。", task: "make", visual: "chart", next: "从计算能力连接到交互设计" },
  "oppia/oppia": { title: "把讲解变成互动探索", description: "可研究对话式探索、学习活动和反馈如何组合，而不只把教材搬到网页上。", task: "teach", visual: "classroom", next: "拆解一段学习者的互动" },
};
export function collectionFor(record: RadarRecord): Collection {
  return record.kind === "dataset" || record.kind === "benchmark" ? "data" : record.kind;
}
export function tasksFor(record: RadarRecord): Task[] {
  const curated = record.kind !== "skill" ? featured[record.name] : undefined;
  const result = new Set<Task>(curated ? [curated.task] : []);
  const scenarios = record.facets?.scenarios || [];
  if (scenarios.some(s => ["teaching", "lesson-planning", "course-design", "classroom", "home-learning"].includes(s))) result.add("teach");
  if (["skill", "library"].includes(record.artifactKind || record.kind)) result.add("make");
  if (record.kind === "knowledge" || scenarios.some(s => ["personal-learning", "tutoring", "practice", "home-learning"].includes(s))) result.add("learn");
  if (record.kind === "dataset" || record.kind === "benchmark" || scenarios.some(s => ["research", "evaluation"].includes(s))) result.add("research");
  if (scenarios.some(s => ["system-administration", "learning-environments", "education-operations"].includes(s))) result.add("operate");
  return [...result];
}
export function normalizeQuery(value: string) { return value.normalize("NFKC").toLocaleLowerCase().trim().replace(/\s+/g, " "); }
export type RadarFilters = { query: string; collection: Collection; task: Task; language: string; hideArchived: boolean; hideUnavailable: boolean; showReview?: boolean; sort: "relevance" | "stars" | "pushed" | "checked" };
export function searchDirectory(records: RadarRecord[], filters: RadarFilters) {
  const eligible = records.filter(r => {
    if (r.review?.status === "exclude" || (!filters.showReview && r.review?.status === "review")) return false;
    if (filters.collection !== "all" && collectionFor(r) !== filters.collection) return false;
    if (filters.task !== "all" && !tasksFor(r).includes(filters.task)) return false;
    if (filters.language && r.language !== filters.language) return false;
    if (filters.hideArchived && r.archived) return false;
    if (filters.hideUnavailable && r.refreshError === "http-404") return false;
    return true;
  }).map(r => {
    const editorial = r.kind !== "skill" ? featured[r.name] : undefined;
    return {...r, curated: r.curated || Boolean(editorial),
      search_text: [editorial?.title, editorial?.description].filter(Boolean).join(" ")};
  });
  const result = searchCatalog(eligible, normalizeQuery(filters.query), {allowReview:filters.showReview});
  if (filters.sort !== "relevance") result.records.sort((a,b) => {
    if (filters.sort === "stars") return (b.stars || 0) - (a.stars || 0) || a.id.localeCompare(b.id);
    if (filters.sort === "pushed") return (b.pushedAt || "").localeCompare(a.pushedAt || "") || a.id.localeCompare(b.id);
    return (b.checkedAt || "").localeCompare(a.checkedAt || "") || a.id.localeCompare(b.id);
  });
  return result;
}
export function filterRecords(records: RadarRecord[], filters: RadarFilters): RadarRecord[] {
  return searchDirectory(records, filters).records;
}
export function dateLabel(value: string | null | undefined) { return value && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "暂无记录"; }
export function licenseLabel(value: string | null) { return !value || value === "NOASSERTION" ? "许可证待确认" : value; }
