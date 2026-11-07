import { searchCatalog, type SearchMatch } from "./search/index.mjs";

export type BuilderResource = {
  resource_id: string; kind: string; title: string; description: string;
  source_url: string; repository_url: string; verified_at: string | null;
  pinned_commit: string | null; license_observed: string | null;
  license_scopes: { label: string; covers: string; verified: boolean; source_url: string }[];
  reuse_status: string; runtime_tested: boolean | null; curated: boolean;
  facet_hints: Record<string, string[]>; topics: string[];
  review?: {status: "include" | "review" | "exclude"; evidence_level?: string};
  search_match?: SearchMatch;
};
export type SearchInput = { query?: string; kind?: string; audience?: string; subject?: string; platform?: string; capability?: string; reviewed?: boolean; page?: number; limit?: number };
export type KeywordFamily = { id: string; keywords: string[] };
export const normalize = (value: string) => value.normalize("NFKC").toLowerCase().trim();
function matches(text: string, keyword: string) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return /^[a-z0-9 -]+$/.test(keyword) ? new RegExp(`(^|[^\\w])${escaped}([^\\w]|$)`, "u").test(text) : text.includes(keyword);
}
export function searchResources(records: BuilderResource[], families: KeywordFamily[], input: SearchInput = {}) {
  void families;
  const query = normalize((input.query || "").slice(0, 300));
  const facets = { audiences: input.audience, subjects: input.subject, platforms: input.platform, capabilities: input.capability };
  const eligible = records.filter(record => {
    if (record.review && record.review.status !== "include") return false;
    if (input.kind && record.kind !== input.kind) return false;
    if (input.reviewed && (!record.curated || record.reuse_status !== "license-observed")) return false;
    return !Object.entries(facets).some(([key,value]) => {
      if (!value) return false;
      const confirmed=record.facet_hints[key]||[];
      return key==="platforms"&&value==="mobile" ? !confirmed.some(p=>["mobile","ios","android"].includes(p)) : !confirmed.includes(value);
    });
  });
  const result = searchCatalog(eligible, query);
  const limit = Math.max(1,Math.min(50,Math.trunc(input.limit || 12)));
  const pages = Math.max(1,Math.ceil(result.total / limit));
  const page = Math.max(1,Math.min(pages,Math.trunc(input.page || 1)));
  return {query,total:result.total,page,pages,limit,records:result.records.slice((page-1)*limit,page*limit),retrieval:result.retrieval,method:"bridge-reviewed-catalog",model_calls:0};
}
export type BuilderScenario = {
  slug: string; title: string; audience: string; outcome: string; summary: string;
  keywords: string[]; resourceIds: string[]; resourceRoles: string[];
  courses: string[]; steps: string[]; acceptance: string[]; starter: string;
};
export function matchScenarios(scenarios: BuilderScenario[], goal: string) {
  const text = normalize(goal);
  if (!text) return [];
  return scenarios.map(scenario => ({scenario, matched:scenario.keywords.filter(word => matches(text,normalize(word)))}))
    .filter(result=>result.matched.length).sort((a,b)=>b.matched.length-a.matched.length);
}
export function exportBrief(scenario: BuilderScenario, resources: BuilderResource[], options: {goal:string; platform:string; commercial:boolean; locale?:string}) {
  const en = options.locale === "en";
  const label = (zh:string,english:string)=>en?english:zh;
  const selected = scenario.resourceIds.map(id=>resources.find(r=>r.resource_id===id)).filter((r):r is BuilderResource=>Boolean(r));
  const allowed = selected.filter(r=>!options.commercial || r.reuse_status === "license-observed");
  const omitted = selected.filter(r=>!allowed.includes(r));
  const tool = options.platform === "web" ? label("浏览器 + 文本编辑器；可选 Codex / Claude Code / Cursor 辅助开发。","Browser + text editor; optionally use Codex / Claude Code / Cursor.") : label("沿用你已有的目标平台开发环境，先做最小交互；平台适配尚待验证。","Use your existing target-platform environment; build a minimal interaction first. Platform adaptation needs verification.");
  const lines = [`# ${label("开发计划","Build brief")}: ${scenario.title}`,"",`## ${label("你的需求","Your goal")}`,options.goal || scenario.outcome,"",`- ${label("平台","Platform")}: ${options.platform}`,`- ${label("商业用途","Commercial use")}: ${options.commercial}`,`- ${label("开发工具","Development tools")}: ${tool}`,"",`## ${label("要做出的成品","Expected artifact")}`,scenario.outcome,"",`## ${label("候选资源与职责","Candidate resources and roles")}`];
  for (const r of allowed) {
    const role=scenario.resourceRoles[scenario.resourceIds.indexOf(r.resource_id)];
    lines.push(`- ${r.title}: ${role}`,`  ${r.source_url}`,`  ${label("版本","Version")}: ${r.pinned_commit || label("未锁定；使用前核对","Not pinned; verify before reuse")}`,`  ${label("许可观察","License observation")}: ${r.license_scopes.map(s=>`${s.covers}: ${s.label}`).join("; ") || r.license_observed || "unknown"}`,`  ${label("复用状态","Reuse status")}: ${r.reuse_status}; runtime_tested=${r.runtime_tested ?? "unknown"}`);
  }
  if (omitted.length) lines.push("",`## ${label("本方案未选用的资源","Resources omitted from this plan")}`,...omitted.map(r=>`- ${r.title}: ${r.reuse_status}. ${label("先使用自己有权使用的材料，或者另选来源。","Use material you have permission to use, or select another source.")}`));
  lines.push("",`## ${label("实现顺序","Implementation sequence")}`,...scenario.steps.map((step,i)=>`${i+1}. ${step}`),"",`## ${label("验收","Acceptance")}`,...scenario.acceptance.map(item=>`- [ ] ${item}`),"",`## ${label("资源连接与待确认项","Connections and open questions")}`,label("上面的条目是候选与参考材料，按职责选取；不是必须全部安装。核对数据格式、输入输出、依赖、调用费用和资料使用条件。","Choose candidates by role; installing all of them is unnecessary. Check formats, input/output contracts, dependencies, usage costs and material permissions."),label("该计划由场景模板和目录元数据生成；源码适配、实际运行和教育效果需要另行验证。改动目标功能后请重新检查步骤与验收。","This brief uses scenario templates and catalog metadata. Source adaptation, runtime behavior and educational outcomes need separate verification. Review steps and acceptance after changing the goal."),"",`## ${label("交给 coding agent 的任务","Task for your coding agent")}`,label("先核对这个计划与我的需求，标出不匹配和缺失的条件。先实现一条最小学习流程并运行验收；需要 repo 实现证据时使用 edu-repo-adapter。不要把未运行的步骤标为通过。","Check this brief against my goal and identify mismatches and missing conditions. Implement one minimal learning flow and run acceptance checks. Use edu-repo-adapter when implementation evidence is needed. Do not mark unrun checks as passed."));
  return {markdown:lines.join("\n"),resourceIds:allowed.map(r=>r.resource_id),omittedIds:omitted.map(r=>r.resource_id),status:"template-plan-needs-validation"};
}
