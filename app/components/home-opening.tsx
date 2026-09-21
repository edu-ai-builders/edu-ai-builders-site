import Localize from "@/app/i18n/server-localize";
import Link from "next/link";
import LearningScene from "./learning-scene";

const audiences = (courseCount: number) => [
  {
    key: "teacher",
    stand: "我在教书",
    role: "老师 · 教研",
    pain: "“讲义发了，怎样让学生真的读懂、用起来？”",
    gain: "打开一个已经做好的工具，改成你这节课的材料。",
    step: "先试一个课堂工具",
    href: "/use",
    cost: "不用注册 · 浏览器直接打开",
    figure: (
      <div className="who-figure who-figure-teacher" aria-hidden="true">
        <div className="who-doc-flow">
          <span>
            <b>PDF</b>
            <i />
            <i />
            <i />
          </span>
          <em>→</em>
          <div>
            <strong>读懂一个概念</strong>
            <strong>看懂一张图</strong>
            <strong>自己判断一次</strong>
          </div>
        </div>
        <small>一份材料 → 一段可练习的学习路径</small>
      </div>
    ),
  },
  {
    key: "builder",
    stand: "我在做产品",
    role: "构建者 · 开发者",
    pain: "“答错以后，除了红叉，还能给什么？”",
    gain: "从一个具体的教学问题，查到可用的机制、适用条件和来源。",
    step: "从一个问题打开地图",
    href: "/atlas?concept=pedagogy%3Aactionable-feedback",
    cost: "180 个概念 · 每条都标出处",
    figure: (
      <div className="who-figure who-figure-builder" aria-hidden="true">
        <svg viewBox="0 0 300 120" className="who-feedback-scene">
          <rect
            x="7"
            y="8"
            width="120"
            height="104"
            rx="10"
            fill="#fffdfb"
            stroke="#d6c4cc"
          />
          <rect x="19" y="21" width="60" height="6" rx="3" fill="#e6dbe0" />
          <rect x="19" y="35" width="90" height="5" rx="2" fill="#eee5e7" />
          <circle cx="67" cy="68" r="16" fill="#f4ded7" />
          <path
            d="m61 62 12 12m0-12L61 74"
            fill="none"
            stroke="#b77e6d"
            strokeWidth="2"
          />
          <text x="67" y="100" textAnchor="middle" fill="#9c786e" fontSize="10">
            只知道答错了
          </text>
          <path
            className="feedback-flow"
            d="M135 60h26m-7-6 7 6-7 6"
            fill="none"
            stroke="#9b8bac"
            strokeWidth="2"
          />
          <rect
            x="173"
            y="8"
            width="120"
            height="104"
            rx="10"
            fill="#fffdfb"
            stroke="#bacfb7"
          />
          <rect x="185" y="21" width="60" height="6" rx="3" fill="#d8e2ce" />
          <rect x="185" y="37" width="96" height="34" rx="7" fill="#e9efdf" />
          <path
            d="m194 51 5 5 9-11"
            stroke="#74926c"
            strokeWidth="2"
            fill="none"
          />
          <text x="241" y="58" textAnchor="middle" fill="#607557" fontSize="10">
            看看这一步
          </text>
          <rect x="195" y="81" width="75" height="20" rx="6" fill="#dbe9d3" />
          <text x="233" y="95" textAnchor="middle" fill="#56734e" fontSize="10">
            再试一次 ↻
          </text>
        </svg>
        <small>让学生知道，下一步可以怎样改</small>
      </div>
    ),
  },
  {
    key: "self",
    stand: "我在学习新东西",
    role: "自学者 · 备考者 · 家长",
    pain: "“能不能把我的备考资料，变成一套复习卡？”",
    gain: `${courseCount} 门免费课，从一张学习卡到自己的学习助手。`,
    step: "从第一课开始",
    href: "/learn",
    cost: "免费 · 自定步调 · 不用登录",
    figure: (
      <div className="who-figure who-figure-self" aria-hidden="true">
        <div className="who-phone">
          <b>今天练什么？</b>
          <div className="who-flashcard">
            <span>RECALL</span>
            <b>
              用自己的话
              <br />
              解释一个概念
            </b>
          </div>
          <span>先想一想</span>
          <em>再看解释</em>
        </div>
        <small>你自己做的那一个</small>
      </div>
    ),
  },
];

export default function HomeOpening({ courseCount }: { courseCount: number }) {
  return <Localize>{(
    <>
      <section className="home-vision" aria-labelledby="vision-title">
        <div className="home-vision-copy">
          <p className="ea-eyebrow">
            <span className="vision-spark" aria-hidden="true">
              ✳
            </span>{" "}
            好的学习体验，从你的一个想法开始
          </p>
          <h1 id="vision-title">
            你看见的学习难题，
            <br />
            <span>可以亲手改变。</span>
          </h1>
          <p className="home-vision-lead">
            用 AI，把教学点子做成能看、能练、能改的学习工具。
            <strong>从一个学习者卡住的地方，到一次看得见的理解。</strong>
          </p>
        </div>
        <LearningScene />
        <div className="vision-details">
          <div
            className="vision-process"
            aria-label="从发现问题，到制作工具，再到学生理解"
          >
            <div>
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path d="M8 9h32v23H23l-9 8v-8H8Z" />
                <path d="M20 18a4 4 0 1 1 6 3.5l-2 2V26M24 29v1" />
              </svg>
              <span>你发现卡点</span>
            </div>
            <span aria-hidden="true">→</span>
            <div>
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <rect x="7" y="8" width="34" height="32" rx="5" />
                <path d="M7 17h34M12 12h1m4 0h1M17 25l-4 4 4 4m14-8 4 4-4 4M26 23l-4 12" />
              </svg>
              <span>和 AI 做工具</span>
            </div>
            <span aria-hidden="true">→</span>
            <div>
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="24" r="17" />
                <path d="M16 27q8 10 16 0M17 19v2m14-2v2M34 5l1 4m6 1-4 2" />
              </svg>
              <span>让理解发生</span>
            </div>
          </div>
          <div className="vision-actions">
            <Link className="ea-button primary" href="#examples">
              看几个已经做好的例子 <span aria-hidden="true">↓</span>
            </Link>
            <Link href="/learn">零基础也能开始 ↗</Link>
          </div>
          <p className="home-vision-sub">
            免费课程 · 可直接用的课堂工具 · 有来源的设计依据
          </p>
        </div>
      </section>

      <section className="home-who" aria-labelledby="who-title">
        <div className="home-who-head">
          <p className="ea-eyebrow">从你的日常出发</p>
          <h2 id="who-title">在教室里，在创作中，也在你的书桌上。</h2>
          <p>先看到一个有用的东西，再决定怎样把它变成自己的。</p>
        </div>
        <div className="home-who-grid">
          {audiences(courseCount).map((item) => (
            <article
              className={`home-who-card lift who-${item.key}`}
              key={item.key}
            >
              <header>
                <span className="home-who-role">{item.role}</span>
                <h3>{item.stand}</h3>
              </header>
              <blockquote>{item.pain}</blockquote>
              {item.figure}
              <p className="home-who-gain">{item.gain}</p>
              <Link className="home-who-step" href={item.href}>
                {item.step} <b aria-hidden="true">↗</b>
              </Link>
              <small>{item.cost}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  )}</Localize>;
}
