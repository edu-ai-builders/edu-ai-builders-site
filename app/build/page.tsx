import { getI18n } from "@/app/i18n/server";
import { translateData } from "@/app/i18n/core";
import Localize from "@/app/i18n/server-localize";
import Link from "next/link";
import ResourceCard from "../components/resource-card";
import ResourcePreview from "../components/resource-preview";
import SectionNav from "../components/section-nav";
import { buildNav } from "../content/section-nav-data";
import { resources } from "../content/resources";
import "../use/resources.css";

const metadata = {
  title: "用于构建",
  description:
    "可修改组件、可复用技能（Skill）与教学设计依据：把已有积累带进你自己的学习体验。",
};

/** Components and reusable Skills come first; everything else supports them. */
const components = resources.filter((r) => r.kind === "component");
const skills = resources.filter((r) => r.kind === "skill");

const audiences = [
  {
    who: "课堂老师",
    quote: "「我想让练习的提示一步步撤掉，但不知道第一步该改哪里。」",
    href: "/atlas?concept=pedagogy%3Aworked-examples-fading&tab=understand",
    action: "看「范例与支架渐退」的改前改后",
    detail: "一屏里的前后对照：哪一步先示范、哪一步留空、什么时候换题独立做。",
  },
  {
    who: "做教育产品的人 / 开发者",
    quote: "「产品要写教学依据，我只能写一句『我们基于学习科学』。」",
    href: "#skills",
    action: "用教学设计依据这项技能整理理由",
    detail:
      "从研究条目和你的场景出发，留下依据、适用条件与取舍，取舍仍由你确认。",
  },
  {
    who: "家长 / 给自己做的人",
    quote: "「我想给孩子做一个小练习，但不想从零开始写代码。」",
    href: "#components",
    action: "拿一份可改的 HTML 组件",
    detail: "换掉里面的材料和反馈就能用，交互骨架和学习者要做的判断都保留着。",
  },
];

export default function BuildPage() {
  return <Localize>{(
    <main className="resource-page ea-with-sidebar" id="main-content">
      <SectionNav title="构建" groups={buildNav} />
      <div className="ea-sidebar-main">
        <header className="resource-hero deep">
          <div className="resource-hero-copy">
            <p className="resource-eyebrow">用于构建</p>
            <h1>
              不用从零开始。
              <br />
              先拿一份能改的材料。
            </h1>
            <p>
              {components.length} 份可修改组件、{skills.length}{" "}
              项可复用技能（Skill），加上每项材料背后的设计依据。拿走改成你的材料，判断仍然由你作。
            </p>
            <ul className="resource-hero-flags">
              <li>组件是可改的 HTML</li>
              <li>技能放进你已有的 AI 工具</li>
              <li>每项都标明适用条件</li>
            </ul>
          </div>
          <div className="resource-hero-shelf" aria-hidden="true">
            <div>
              <ResourcePreview id="relation-template" />
            </div>
            <div>
              <ResourcePreview id="grounding-engine" />
            </div>
            <div>
              <ResourcePreview id="math-viz-skill" />
            </div>
          </div>
        </header>

        <section className="audience-band" aria-labelledby="build-audience">
          <h2 id="build-audience">你卡在哪一句上？</h2>
          <p className="audience-lead">
            三种人常常卡在不同的地方。挑最像你的那一句，直接进到对应的材料。
          </p>
          <div className="audience-grid">
            {audiences.map((item) => (
              <Link className="audience-card lift" href={item.href} key={item.who}>
                <span className="audience-who">{item.who}</span>
                <p className="audience-quote">{item.quote}</p>
                <strong>{item.action} →</strong>
                <small>{item.detail}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="resource-materials" id="components">
          <div className="resource-materials-head">
            <h2>可修改组件</h2>
            <p>
              交互骨架已经写好，学习者要作的判断保留在里面。换掉材料、干扰项和反馈理由就能用。
            </p>
          </div>
          <div className="resource-grid">
            {components.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </section>

        <section className="resource-materials" id="skills">
          <div className="resource-materials-head">
            <h2>可复用技能（Skill）</h2>
            <p>
              放进你已经在用的 AI
              工具里，用来整理教学依据、组织表征或检查课件顺序。它帮你留下理由，不代替你作判断。
            </p>
          </div>
          <div className="resource-grid">
            {skills.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </section>

        <section className="resource-build-flow well" id="flow">
          <h2>一个例子：做一个会逐步撤掉提示的练习</h2>
          <ol>
            <li>
              <span>01 / 定目标</span>
              <b>学生最后要能独立做什么？</b>
              <p>把「学会分数」缩小到「解释两个分数为什么相等」。</p>
            </li>
            <li>
              <span>02 / 作判断</span>
              <b>提示什么时候该少一点？</b>
              <p>用教学设计依据这项技能梳理条件，再由你确认取舍。</p>
            </li>
            <li>
              <span>03 / 改组件</span>
              <b>把决定变成可试的交互</b>
              <p>替换材料和反馈，运行后请学习者完成一个新任务。</p>
            </li>
          </ol>
          <Link href="/atlas?concept=pedagogy%3Acontingent-scaffolding">
            看看「适应性的学习支架」的原理 →
          </Link>
        </section>
      </div>
      <aside className="resource-next well">
        <div>
          <h2>一个概念，也可以改变一个决定。</h2>
          <p>
            在地图里留下你如何应用它的记录，可以连接自己的作品，也可以只写下一次设计取舍。
          </p>
        </div>
        <Link href="/atlas">打开学习科学地图 →</Link>
        <Link href="/directory">寻找开源资源 →</Link>
      </aside>
    </main>
  )}</Localize>;
}

export async function generateMetadata() { const {t}=await getI18n(); return translateData(metadata,t); }
