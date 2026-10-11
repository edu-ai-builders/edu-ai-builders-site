import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { getLocale } from "../i18n/server";
import type { RadarCatalog } from "../directory/model";

// Editorial demo URLs are verified against official project pages, not inferred
// from catalog homepages. Keep this layer separate from the Radar snapshot.
const picks = [
  { name: "sympy/sympy", title: "SymPy", zh: "给数学工具加一点计算能力", en: "Give your math tool a calculation engine", note: "展开表达式、解方程。先在浏览器里算一次。", noteEn: "Expand an expression or solve an equation in your browser.", action: "在线计算", actionEn: "Try the calculator", href: "https://live.sympy.org/", reuse: "https://docs.sympy.org/latest/tutorials/intro-tutorial/", motif: "math", hint: "expand((x + 1)**3)" },
  { name: "learningequality/kolibri", title: "Kolibri", zh: "看看一间离线课堂怎样运转", en: "Explore an offline-first classroom", note: "打开官方演示，看看课程、练习与教师视角。", noteEn: "Explore courses, exercises and the coach view in the official demo.", action: "打开演示", actionEn: "Open the demo", href: "https://kolibridemo.learningequality.org/", reuse: "https://kolibri.readthedocs.io/", motif: "classroom", hint: "01 → 02 → 03" },
  { name: "datawhalechina/easy-vibe", title: "Easy Vibe", zh: "从别人的小项目开始做", en: "Start with someone else’s small project", note: "跟着 AI 编程教程，把一个想法变成原型。", noteEn: "Follow an AI coding tutorial and turn an idea into a prototype.", action: "打开教程", actionEn: "Read the tutorial", href: "https://datawhalechina.github.io/easy-vibe/", reuse: "https://github.com/datawhalechina/easy-vibe#readme", motif: "code", hint: "idea → prototype" },
];

export default async function HomeOpenSource() {
  const en = (await getLocale()) === "en";
  const catalog: RadarCatalog = JSON.parse(await readFile(path.join(process.cwd(), "public/data/radar/catalog.json"), "utf8"));
  const records = picks.map(pick => ({pick, record: catalog.records.find(r => r.kind === "repo" && r.name === pick.name && !r.archived && r.refreshError !== "http-404")})).filter(item => item.record);
  return <section className="home-open-source" id="open-source" aria-labelledby="open-source-title">
    <div className="open-source-heading">
      <div><p className="ea-eyebrow">{en ? "THE OPEN TOOLBOX" : "别人的作品，你的起点"}</p><h2 id="open-source-title">{en ? "Someone has already made a start." : "先看看，别人做好了什么。"}</h2><p>{en ? "Try it. Read the code. Make it your own." : "先试用，再看源码，带进自己的作品。"}</p></div>
      <Link className="open-directory-cta" href="/directory">{en ? "Explore open source" : "逛开源目录"} <span aria-hidden="true">↗</span></Link>
    </div>
    <div className="open-source-grid">
      {records.map(({pick,record}) => <article className={`open-source-card card-${pick.motif}`} key={pick.name}>
        <div className="open-source-art" aria-hidden="true"><span>{pick.title}</span>{pick.motif === "math" ? <div className="open-math"><i>（x + 1）³</i><b>↓</b><i>x³ + 3x² + 3x + 1</i></div> : pick.motif === "classroom" ? <div className="open-classroom"><i>01</i><i>02</i><i>03</i><b>✓</b></div> : <div className="open-code"><i>✳</i><b>idea</b><span>↗</span><b>prototype</b></div>}<small>{en ? "Illustration" : "用途示意"}</small></div>
        <div className="open-source-body"><p className="open-project-name">{pick.title}</p><h3>{en ? pick.en : pick.zh}</h3><p>{en ? pick.noteEn : pick.note}</p>
          <a className="open-try" href={pick.href} target="_blank" rel="noreferrer">{en ? pick.actionEn : pick.action} <span aria-hidden="true">↗</span></a>
          <div className="open-secondary"><a href={record!.url!} target="_blank" rel="noreferrer">{en ? "Source" : "源码"} ↗</a><a href={pick.reuse} target="_blank" rel="noreferrer">{en ? "How to use / adapt" : "怎么用 / 复用"} ↗</a></div>
        </div>
      </article>)}
    </div>
    <div className="open-source-foot"><span>{en ? "From the Radar catalog · Official demos and tutorials open externally" : "选自 Radar 目录 · 官方演示与教程在新窗口打开"}</span><Link href="/use">{en ? "Or try our classroom tools" : "也可以试试本站课堂工具"} ↗</Link></div>
    <aside className="home-paper-preview" aria-label={en ? "Planned research discovery" : "论文发现栏目规划"}><span className="paper-mark" aria-hidden="true">↗</span><div><p>{en ? "Research → a building idea" : "论文 → 一个能做的点子"}<small>{en ? "Planned" : "规划中"}</small></p><span>{en ? "Education AI research, adapted from open aggregators · Topic delivery is planned." : "复用开源聚合，发现教育 AI 研究 · 主题推送尚在规划。"}</span></div><a href="https://arxiv.org/search/?query=AI+education&searchtype=all&abstracts=show&order=-announced_date_first&size=50" target="_blank" rel="noreferrer">{en ? "Browse arXiv now" : "先去 arXiv 看看"} ↗</a></aside>
  </section>;
}
