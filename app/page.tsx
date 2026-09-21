import Localize from "@/app/i18n/server-localize";
import Link from "next/link";
import HomeExperience, { FeedbackDesign } from "./components/home-experience";
import HomeOpening from "./components/home-opening";
import HomeReveal from "./components/home-reveal";
import AtlasMini from "./components/atlas-mini";
import ResourcePreview from "./components/resource-preview";
import { courses } from "./content/courses";
import "./home.css";
import "./use/resources.css";

const shelf = [
  {
    id: "cognition-slides",
    title: "把材料讲清楚，做成能学的课件",
    note: "教学课件 Skill · 围绕比较、解释和理解组织图文",
    href: "/build",
  },
  {
    id: "grounding-engine",
    title: "让学习助手有可解释的设计依据",
    note: "教学设计 Skill · 从学习目标连接到活动与反馈",
    href: "/build",
  },
  {
    id: "say-the-relation",
    title: "让学生说出“为什么相关”",
    note: "语言学习 · 判断关系，再形成表达",
    href: "/use/say-the-relation",
  },
];

export default function Home() {
  const lessons = courses.reduce((n, c) => n + c.lessons.length, 0);
  return <Localize>{(
    <main className="home-v2">
      <HomeOpening courseCount={courses.length} />
      <HomeReveal>
        <HomeExperience map={<AtlasMini />} />
      </HomeReveal>
      <HomeReveal>
        <FeedbackDesign />
      </HomeReveal>
      <section className="home-shelf">
        <div className="home-section-heading">
          <div>
            <p className="ea-eyebrow">已经做好的，先打开看看</p>
            <h2>
              你的下一个学习产品，
              <br />
              可以从这里开始。
            </h2>
          </div>
          <Link href="/use">浏览工具、组件与 Skill ↗</Link>
        </div>
        <div className="home-example-grid">
          {shelf.map((item) => (
            <Link href={item.href} key={item.id} className="lift">
              <ResourcePreview id={item.id} />
              <div>
                <h3>
                  {item.title} <span>↗</span>
                </h3>
                <p>{item.note}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="home-close">
        <div className="home-close-main">
          <p className="ea-eyebrow">没写过一行代码？也有起点。</p>
          <h2>
            从“我不会”到
            <br />
            “我做出了第一个版本”。
          </h2>
          <p>
            {courses.length} 门课、{lessons}{" "}
            节，配合交互图解和动手练习。从第一个网页开始，把学习科学用在你的设计里。
          </p>
          <Link className="ea-button primary" href="/learn">
            浏览免费课程 ↗
          </Link>
        </div>
        <div className="home-close-links">
          <Link href="/directory" className="lift">
            <span>开放工具箱</span>
            <strong>
              不必每一件都从头做。 <b aria-hidden="true">↗</b>
            </strong>
            <p>按任务寻找开源项目，查看适用场景、来源和最近核验情况。</p>
          </Link>
          <Link href="/changelog" className="lift">
            <span>更新日志与未来探索</span>
            <strong>
              已经做的、正在想的，都有位置。 <b aria-hidden="true">↗</b>
            </strong>
            <p>看看网站这次改了什么。EduOS、Loom 等探索也继续保留在这里。</p>
          </Link>
        </div>
      </section>
    </main>
  )}</Localize>;
}
