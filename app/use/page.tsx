import { getI18n } from "@/app/i18n/server";
import { translateData } from "@/app/i18n/core";
import Localize from "@/app/i18n/server-localize";
import Link from "next/link";
import ResourceGallery from "./gallery";
import ResourcePreview from "../components/resource-preview";
import SectionNav from "../components/section-nav";
import { useNav } from "../content/section-nav-data";
import "./resources.css";

const metadata = {
  title: "直接使用",
  description:
    "六个可以在浏览器里直接打开的教学工具：点开就能跑，不用安装，也不用注册。",
};

/** Three audiences, three first-person sentences, three concrete destinations. */
const audiences = [
  {
    who: "课堂老师",
    quote: "「我已经讲过了，学生还是说不清 1/2 和 2/4 为什么一样大。」",
    href: "/use/fraction-bars",
    action: "打开分数条比较器",
    detail: "同一条整体，两种分法同时动。让学生先预测再拖，图形和符号一起对上。",
  },
  {
    who: "做教育产品的人 / 开发者",
    quote: "「界面我能做出来，可我说不清哪一步该留给学生自己判断。」",
    href: "/use/say-the-relation",
    action: "拆一个把判断留给学习者的交互",
    detail:
      "「说出这条关系」要求先判断因果还是先后，再选表达。整段交互可以直接下载查看。",
  },
  {
    who: "家长 / 给自己做的人",
    quote: "「孩子把加减法背成了口诀，一换个题就卡住。」",
    href: "/use/number-line",
    action: "打开数轴跳跃加减法",
    detail: "先猜停在哪里，再看跳跃。位置变化和算式并排出现，可以反复换起点。",
  },
];

export default function UsePage() {
  return <Localize>{(
    <main className="resource-page ea-with-sidebar" id="main-content">
      <SectionNav title="使用" groups={useNav} />
      <div className="ea-sidebar-main">
        <header className="resource-hero deep">
          <div className="resource-hero-copy">
            <p className="resource-eyebrow">直接使用</p>
            <h1>
              先别读说明，
              <br />
              拖一下就知道了。
            </h1>
            <p>
              六个可以直接在浏览器里打开的教学工具。点开就能跑：不用安装、不用注册、不用联网账号，也可以整页下载带走。
            </p>
            <ul className="resource-hero-flags">
              <li>不用安装</li>
              <li>不用注册</li>
              <li>可下载离线用</li>
              <li>练习记录只留在本机</li>
            </ul>
          </div>
          <div className="resource-hero-shelf" aria-hidden="true">
            <div>
              <ResourcePreview id="fraction-bars" />
            </div>
            <div>
              <ResourcePreview id="number-line" />
            </div>
            <div>
              <ResourcePreview id="say-the-relation" />
            </div>
          </div>
        </header>

        <section className="audience-band" aria-labelledby="use-audience">
          <h2 id="use-audience">你是带着哪一句话来的？</h2>
          <p className="audience-lead">挑最像你的那一句，直接进到对应的那一个工具。</p>
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

        <ResourceGallery />
      </div>
      <aside className="resource-next well">
        <div>
          <h2>想用自己的材料做一个？</h2>
          <p>可修改组件、可复用技能（Skill）与入门课程都在这两页。</p>
        </div>
        <Link href="/build">用于构建 →</Link>
        <Link href="/learn">去学习 →</Link>
      </aside>
    </main>
  )}</Localize>;
}

export async function generateMetadata() { const {t}=await getI18n(); return translateData(metadata,t); }
