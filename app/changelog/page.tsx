import { getI18n } from "@/app/i18n/server";
import { translateData } from "@/app/i18n/core";
import Localize from "@/app/i18n/server-localize";
import Link from "next/link";
import { courses } from "../content/courses";
import { resources } from "../content/resources";
import ResourcePreview from "../components/resource-preview";
import "../use/resources.css";
import "./styles.css";

const metadata = {
  title: "更新日志",
  description: "Edu AI Builders 每一轮改动的记录、当前状态，以及还没做完的探索。",
};

type Change = {
  tag: string;
  headline: string;
  detail: string;
  links: { href: string; label: string }[];
  preview?: string;
};

export default function ChangelogPage() {
  const lessons = courses.reduce((n, c) => n + c.lessons.length, 0);
  const openable = resources.filter((r) => r.artifactPath).length;

  const latest: Change[] = [
    {
      tag: "呈现",
      headline: "首页不再先讲道理，直接演示给你看",
      detail:
        "四个用途各自配一件真实作品；用学生视角对比「只告诉你错了」和「给出线索、允许改一次」。不先认识地图，也能看出原理怎样影响设计。",
      links: [{ href: "/", label: "看首页演示" }],
      preview: "say-the-relation",
    },
    {
      tag: "课程",
      headline: `${courses.length} 门课程，${lessons} 个可以动手练的课节`,
      detail:
        "从学习科学是什么、Git 与 GitHub 的区别，到网页交互、落地页、学习助手与代码重构。每门课有分组侧栏、可操作的教学图形和逐课任务。",
      links: [{ href: "/learn", label: "浏览课程" }],
    },
    {
      tag: "连接",
      headline: "地图把原理、课程、工具和你的记录串了起来",
      detail:
        "180 个学习科学概念加了中文导读和一个具体的设计问题。研究原文、来源和有方向的关系原样保留；从四个教学场景可以直接跳进图里。",
      links: [{ href: "/atlas", label: "打开学习科学地图" }],
      preview: "fraction-bars",
    },
    {
      tag: "资源",
      headline: "每个工具都有能看的预览，开源目录搬进了站内",
      detail: `${openable} 个工具点开就能跑，卡片上标明任务示意和打开方式。开源项目现在可以在站内搜索筛选，仓库信息经过本轮核验，每条保留自己的检查日期与来源状态。`,
      links: [
        { href: "/use", label: "看工具预览" },
        { href: "/directory", label: "浏览开源目录" },
      ],
    },
    {
      tag: "结构",
      headline: "没做完的东西，回到探索记录里",
      detail:
        "EduOS、Loom 与 Working Graph 保留研究方向和开放问题，不再摆在首页当作已经能用的产品。",
      links: [{ href: "/updates/research", label: "阅读原有探索" }],
    },
  ];

  return <Localize>{(
    <main className="changelog-page" id="main-content">
      <header className="changelog-hero deep">
        <div className="changelog-hero-copy">
          <p className="ea-eyebrow">更新日志</p>
          <h1>每次改动，都留下一条记录。</h1>
          <p>
            做了什么、现在是什么状态、还没做完的放在哪里 ——
            按时间倒序写在这里。没有发布的就标成没有发布。
          </p>
          <nav aria-label="更新日志分类">
            <a href="#r-2026-09-22">本轮改动</a>
            <a href="#r-earlier">原站积累</a>
            <a href="#future">未来探索</a>
          </nav>
        </div>
        <dl className="changelog-hero-stats">
          <div>
            <dt>最近一次</dt>
            <dd>2026 / 09 / 22</dd>
          </div>
          <div>
            <dt>当前状态</dt>
            <dd>已发布</dd>
          </div>
          <div>
            <dt>知识库版本</dt>
            <dd>v0.2.0</dd>
          </div>
        </dl>
      </header>

      <ol className="changelog-releases">
        <li className="changelog-release" id="r-2026-09-22">
          <aside className="changelog-rail">
            <time dateTime="2026-09-22">2026 / 09 / 22</time>
            <span className="changelog-status is-kept">已发布</span>
            <small>目录更新与双语网站上线</small>
          </aside>
          <div className="changelog-release-body">
            <ul className="changelog-entries">
              <li className="changelog-entry lift is-wide">
                <div className="changelog-entry-copy">
                  <span className="changelog-tag">资源</span>
                  <h2>仓库、Skills 与数据集线索，重新核对了一遍。</h2>
                  <p>3,405 条仓库记录和 123 个 Skill 声明已刷新，涵盖数据集与评测基准的来源信息。更新项目地址、简介、活跃时间与公开指标；数据集内容本身未下载或重新评测。</p>
                  <p>116 个条目未能完成本次核对，保留上次信息与检查日期，并标明状态。Skill 声明核对只确认名称和简介，不代表执行测试或质量认证。</p>
                  <div className="changelog-entry-links"><Link href="/directory">浏览开源目录 ↗</Link></div>
                </div>
              </li>
              <li className="changelog-entry lift is-wide">
                <div className="changelog-entry-copy">
                  <span className="changelog-tag">上线</span>
                  <h3>中文与英文，可以随时切换。</h3>
                  <p>新版首页、课程、工具、学习科学地图和站内开源目录一同上线。语言切换保留相同的学习记录；外部项目简介继续保留作者原文。</p>
                  <div className="changelog-entry-links"><Link href="/learn">浏览课程 ↗</Link><Link href="/atlas">打开学习科学地图 ↗</Link></div>
                </div>
              </li>
            </ul>
          </div>
        </li>


        <li className="changelog-release" id="r-2026-09-20">
          <aside className="changelog-rail">
            <time dateTime="2026-09-20">2026 / 09 / 20</time>
            <span className="changelog-status is-preview">本地预览</span>
            <small>
              改版开发记录
              <br />
              于 9 月 22 日上线
            </small>
          </aside>
          <div className="changelog-release-body">
            <div className="changelog-cover stack">
              <div className="changelog-cover-inner">
                <div>
                  <small>让已有的知识与作品，更容易被看见。</small>
                  <h2>
                    从一个教学想法，
                    <br />
                    到一段能跑起来的学习体验。
                  </h2>
                  <p>看见它 → 学会它 → 用起来 → 继续构建</p>
                </div>
                <div className="changelog-cover-art">
                  <ResourcePreview id="fraction-bars" />
                </div>
              </div>
            </div>
            <ul className="changelog-entries">
              {latest.map((change) => (
                <li
                  className={`changelog-entry lift${change.preview ? "" : " is-wide"}`}
                  key={change.headline}
                >
                  <div className="changelog-entry-copy">
                    <span className="changelog-tag">{change.tag}</span>
                    <h3>{change.headline}</h3>
                    <p>{change.detail}</p>
                    <div className="changelog-entry-links">
                      {change.links.map((link) => (
                        <Link href={link.href} key={link.href}>
                          {link.label} ↗
                        </Link>
                      ))}
                    </div>
                  </div>
                  {change.preview ? (
                    <div className="changelog-entry-art" aria-hidden="true">
                      <ResourcePreview id={change.preview} />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </li>

        <li className="changelog-release" id="r-earlier">
          <aside className="changelog-rail">
            <span className="changelog-when">改版之前</span>
            <span className="changelog-status is-kept">保留与复用</span>
            <small>知识库 v0.2.0</small>
          </aside>
          <div className="changelog-release-body">
            <ul className="changelog-entries">
              <li className="changelog-entry lift is-wide">
                <div className="changelog-entry-copy">
                  <span className="changelog-tag">保留</span>
                  <h3>学习科学知识库与已有的课堂工具原样留下</h3>
                  <p>
                    知识库 0.2.0 版：180 个条目、217 条关系、241
                    个来源，内容未改。课堂工具、数学可视化与语言表达组件继续复用已有作品，新版入口逐步接上它们。
                  </p>
                  <p className="changelog-small">
                    这是对本轮改版前已有内容的记录，不能据此推断各个项目的首次发布日期。
                  </p>
                  <div className="changelog-entry-links">
                    <Link href="/learning-sciences">查阅完整知识库 ↗</Link>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </li>
      </ol>

      <section id="future" className="changelog-future">
        <div className="changelog-future-head">
          <p className="ea-eyebrow">未来探索</p>
          <h2>没做完的东西，也该有个位置。</h2>
          <p>
            下面是研究方向，不是已经能用的功能，也没有承诺完成日期。每有一点结果，就写回上面的记录里。
          </p>
        </div>
        <div className="changelog-future-grid">
          <article className="lift">
            <span>探索中</span>
            <h3>EduOS · Loom</h3>
            <p>
              怎样把任务、知识、可复用技能（Skill）与材料连成一个支持构建的工作环境？
            </p>
            <Link href="/updates/research">查看研究记录 →</Link>
          </article>
          <article className="lift">
            <span>逐步扩展</span>
            <h3>更多课堂工具与领域路线</h3>
            <p>
              从已有作品里挑选、核验、补上说明，再接到合适的概念与课程。没核验过的不会先放上来。
            </p>
            <Link href="/use">先看当前可用资源 →</Link>
          </article>
          <article className="lift">
            <span>待验证</span>
            <h3>实践记录怎样才真的有用</h3>
            <p>
              先观察一条记录能不能帮到下一次设计。跨设备同步与更完整的个人学习路径留待验证。
            </p>
            <Link href="/atlas">用一条记录开始 →</Link>
          </article>
        </div>
      </section>
    </main>
  )}</Localize>;
}

export async function generateMetadata() { const {t}=await getI18n(); return translateData(metadata,t); }
