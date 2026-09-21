import { getI18n } from "@/app/i18n/server";
import { translateData } from "@/app/i18n/core";
import Localize from "@/app/i18n/server-localize";
import type { Metadata } from "next";
import Link from "next/link";

const metadata: Metadata = { title: "EduOS 与未来探索", description: "EduOS、Loom 与教育基础设施的研究方向、系统角色和开放问题。" };

const roles = [
  { name: "Agents + Code", label: "提出任务", text: "应用、代码或 agent 提供任务、学习者情况、教师意图与约束。研究重点是如何把这些信息表达清楚。" },
  { name: "EduOS", label: "任务运行时设想", text: "探索解释教育任务、制定计划、选择能力和组织执行的方法。它仍是未发布的研究项目，不是本站提供的在线 API。" },
  { name: "Skills", label: "执行具体工作", text: "将教学依据整理、材料分析等工作封装为有边界的能力。已有 Skill 可以独立使用；与 EduOS 的集成仍需验证。" },
  { name: "Asset Gallery", label: "提供构建材料", text: "脚手架、界面模式、工作流和示例材料，供 builder 按实际学习情境改造。" },
  { name: "Evaluator + Lens", label: "独立观察与检查", text: "检查产品、开发过程与学习体验。保留独立评价角色，避免把生成成功当成教学效果证据。" },
];

export default function ResearchPage() {
  return <Localize>{<main className="ea-page ea-research-page">
    <Link className="ea-text-link" href="/updates">← 更新与未来探索</Link>
    <header className="ea-page-heading"><p className="ea-eyebrow">RESEARCH NOTE / EXPLORING</p><h1>探索教育构建的<br /><span>下一层基础。</span></h1><p>这里保留原首页的系统构想。EduOS、Loom 与 Working Graph 的角色和连接方式仍在探索；页面描述的是设计方向，不代表已运行的公共服务。</p></header>
    <nav className="ea-subnav" aria-label="研究主题"><a href="#eduos">EduOS</a><a href="#loom">Loom</a><a href="#working-graph">Working Graph</a><a href="#questions">开放问题</a></nav>
    <section className="ea-research-block" id="eduos"><p className="ea-eyebrow">01 / TASK + CONTEXT</p><h2>EduOS：让教育任务有明确的执行结构。</h2><p className="ea-body-copy">原有构想把 EduOS 定位为 Pedagogical Task Runtime：接收一个任务及其教育情境，再选择合适的能力与材料。这个设想保留在研究层，当前网站的工具、Skills 和 Atlas 可以独立使用。</p>
      <div className="ea-system-diagram" aria-label="EduOS 研究架构：任务和情境进入运行时设想，结合 Skills 和资产，形成待评价的学习体验"><div><small>INPUT</small><strong>任务 + 情境</strong><p>学习者 · 教师意图 · 约束</p></div><span aria-hidden="true">→</span><div className="ea-system-core"><small>EXPLORING</small><strong>EduOS</strong><p>理解 → 规划 → 选择 → 执行</p></div><span aria-hidden="true">→</span><div><small>OUTPUT TO EXAMINE</small><strong>学习体验</strong><p>练习 · 教学工具 · 学习助手</p></div><div className="ea-system-supply"><span>Loom：知识整理</span><span>Skills：具体能力</span><span>Assets：构建材料</span><span>Evaluator：独立检查</span></div></div>
      <div className="ea-role-grid">{roles.map(role => <article key={role.name}><small>{role.label}</small><h3>{role.name}</h3><p>{role.text}</p></article>)}</div>
      <p className="ea-body-copy">模型适配也是探索的一部分，包括开源、本地和托管模型。是否适合某个教学情境，需要分别检查可行性、成本、数据条件与实际效果。</p>
    </section>
    <section className="ea-research-block" id="loom"><p className="ea-eyebrow">02 / KNOWLEDGE SUPPLY</p><h2>Loom：让外部知识成为可检查的材料。</h2><p className="ea-body-copy">研究论文、开源项目、Skills 与领域知识，如何经过发现、整理、验证和打包，成为 builder 能理解和复用的资源？Loom 探索这条知识处理流程，它与任务运行时是不同角色。</p><div className="ea-process"><span>发现 Discover</span><i>→</i><span>整理 Structure</span><i>→</i><span>验证 Validate</span><i>→</i><span>打包 Package</span></div><p className="ea-muted">开源目录已有独立入口；它的存在不意味着 Loom 已在自动更新或验证全部资源。</p><Link className="ea-text-link" href="/directory">浏览现有开源目录 →</Link></section>
    <section className="ea-research-block" id="working-graph"><p className="ea-eyebrow">03 / CONTEXT & CONNECTIONS</p><h2>Working Graph：保留判断之间的联系。</h2><p className="ea-body-copy">探索如何记录任务、材料、设计决定和结果之间的联系，让后续修改可以追溯前提。它仍是实验性方向；本站 Atlas 先处理学习科学概念与已有资源的关联，不依赖这一研究完成。</p><Link className="ea-text-link" href="/atlas">查看当前的学习科学 Atlas →</Link></section>
    <section className="ea-research-block" id="questions"><p className="ea-eyebrow">04 / OPEN QUESTIONS</p><h2>接下来需要回答什么？</h2><div className="ea-role-grid"><article><small>FOUNDATIONS</small><h3>知识与教育数据</h3><p>来源、适用条件和不确定性如何随材料一起保留？预训练层面的教育数据与表示仍是远期探索。</p></article><article><small>EXECUTION</small><h3>能力与接口</h3><p>一个教学任务需要哪些最小输入？如何验证 Skill 选择与执行，而不把全部判断藏在模型里？</p></article><article><small>EVALUATION</small><h3>评价与反馈</h3><p>如何区分运行正确、设计合理和学习效果？评价、适配与后训练需要怎样的证据？</p></article></div></section>
    <div className="ea-research-end"><p>想先做点可以使用的东西？从已有材料开始。</p><Link className="ea-button primary" href="/build">浏览构建材料 <span>→</span></Link></div>
  </main>}</Localize>;
}

export async function generateMetadata() { const {t}=await getI18n(); return translateData(metadata,t); }
