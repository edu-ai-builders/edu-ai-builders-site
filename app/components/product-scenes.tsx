"use client";
import Localize from "@/app/i18n/localize";
export const productScenes = [
  {
    id: "language",
    label: "语言学习",
    audience: "英语表达 · 工作与生活",
    question: "背过的表达，开口时还是想不起来。",
    title: "一个陪你把话说出来的语言 App",
    steps: ["进入情境", "试着表达", "换个场景再用"],
    notes: [
      "从改约会议这样的真实任务开始，而不是孤立地背一个单词。",
      "给出自己的表达，再看到更清楚、更得体的说法。",
      "从会议改约到预约改期，把同一个表达用在新的情境里。",
    ],
    takeaway: "情境对话 + 表达反馈 + 迁移练习",
    href: "/learn/personal-learning-assistant",
  },
  {
    id: "exam",
    label: "备考复习",
    audience: "课程考试 · 复习工作台",
    question: "笔记存了很多，合上以后还能想起多少？",
    title: "把资料变成一套可以练的复习系统",
    steps: ["整理材料", "生成复习卡", "安排再回想"],
    notes: [
      "从一段笔记中分出知识点，保留材料与问题的对应关系。",
      "同一份材料，变成问答卡与一页速查表；先回想，再翻面。",
      "把一时想不起来的卡留到下一轮，而不是只统计“看过多少”。",
    ],
    takeaway: "Flashcards + 速查表 + 复习队列",
    href: "/learn/personal-learning-assistant",
  },
  {
    id: "pdf",
    label: "PDF 转学习",
    audience: "PDF 讲义与报告 · 学习内容",
    question: "PDF 读完了，怎么把内容变成自己的理解？",
    title: "从一份 PDF，做成可以学、可以练的内容",
    steps: ["读懂结构", "拆成小课", "检验理解"],
    notes: [
      "先找出这份 PDF要帮助学习者作出的判断。",
      "把内容编排成“看一个例子 → 理解原理 → 自己判断”。",
      "在关键处插入一道情境题，再用具体反馈解释选择。",
    ],
    takeaway: "概念图解 + 小课 + 复习卡 + 自测",
    href: "/build",
  },
  {
    id: "work",
    label: "成人学习",
    audience: "工作技能 · 沟通演练",
    question: "道理都听过，遇到真实客户还是不知道怎么接。",
    title: "把工作难题，变成可以反复练的情境",
    steps: ["遇到难题", "作出回应", "带着反馈重练"],
    notes: [
      "给出一个带约束的工作情境，让学习者先作决定。",
      "每次选择都改变对话，练习澄清需求和管理预期。",
      "反馈指向具体动作，再换一个类似情境重新练习。",
    ],
    takeaway: "分支对话 + 决策反馈 + 再次尝试",
    href: "/learn/learning-sciences-starter",
  },
] as const;
export type ProductSceneKind = (typeof productScenes)[number]["id"];

export function ProductSceneVisual({
  kind,
  phase = 2,
}: {
  kind: ProductSceneKind;
  phase?: number;
}) {
  if (kind === "language")
    return <Localize>{(
      <div className="product-visual language-visual">
        <div className="language-context">
          <span className="scene-person" aria-hidden="true">
            A
          </span>
          <div>
            <small>练习情境 / 调整会议时间</small>
            <strong>Can we meet at 10 tomorrow?</strong>
          </div>
          <div className="voice-wave" aria-label="示例对话">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="language-reply">
          <span>你的表达</span>
          <p>
            {phase === 0 ? (
              <>
                I have another meeting.
                <br />
                <em>怎样提出一个替代时间？</em>
              </>
            ) : (
              <>
                Could we <mark>move it to 2 pm</mark>?<br />I have another
                meeting at 10.
              </>
            )}
          </p>
        </div>
        <div className={`language-feedback ${phase > 0 ? "is-revealed" : ""}`}>
          <span aria-hidden="true">↗</span>
          <div>
            <b>{phase > 0 ? "补上了可协商的下一步" : "表达支架"}</b>
            <p>
              {phase > 0
                ? "说明冲突 → 提出时间 → 等待确认"
                : "Could we move it to …?"}
            </p>
          </div>
        </div>
        <div className="scenario-transfer">
          <span>{phase === 2 ? "下一次，把它用在…" : "你在练习的能力"}</span>
          <b>{phase === 2 ? "预约改期 ↗" : "提出建议，而不只是背句子"}</b>
        </div>
      </div>
    )}</Localize>;
  if (kind === "exam")
    return <Localize>{(
      <div className="product-visual exam-visual">
        <div className="study-source">
          <span className="document-icon" aria-hidden="true">
            ≡
          </span>
          <div>
            <b>生物 · 细胞结构</b>
            <small>示例笔记 → 可以回想的问题</small>
          </div>
          <span className="source-chip">示例材料</span>
        </div>
        <div className="exam-artifacts">
          <div className={`flashcard-mini ${phase > 0 ? "show-answer" : ""}`}>
            <span>FLASHCARD · 01</span>
            <h3>
              线粒体主要参与
              <br />
              什么过程？
            </h3>
            <div className="flashcard-answer">
              {phase > 0
                ? "细胞呼吸，为细胞活动提供可利用的能量。"
                : "先试着回想，再看答案。"}
            </div>
            <small>{phase > 0 ? "答案面 ↻" : "问题面 ↻"}</small>
          </div>
          <div className="cheatsheet-mini">
            <span>一页速查表</span>
            <b>细胞结构</b>
            <div>
              <i />
              细胞膜<small>物质进出</small>
            </div>
            <div>
              <i />
              细胞核<small>遗传信息</small>
            </div>
            <div>
              <i />
              线粒体<small>能量转换</small>
            </div>
          </div>
        </div>
        <div className="review-queue">
          <span>复习安排示意</span>
          <b className={phase === 2 ? "queue-active" : ""}>今天回想</b>
          <i>→</i>
          <b>之后再练</b>
          <i>→</i>
          <b>混合自测</b>
        </div>
      </div>
    )}</Localize>;
  if (kind === "pdf")
    return <Localize>{(
      <div className="product-visual slides-visual">
        <div className="slide-source">
          <span>PDF 讲义节选 / 数据素养</span>
          <div className="slide-illustration">
            <div>
              <b>相关</b>
              <svg
                viewBox="0 0 140 70"
                aria-label="示意散点呈上升趋势，不代表因果关系"
                role="img"
              >
                <path d="M12 5v55h117" fill="none" stroke="#b2a4bb" />
                {[
                  [26, 48],
                  [42, 40],
                  [50, 47],
                  [63, 33],
                  [79, 36],
                  [91, 23],
                  [108, 18],
                  [117, 24],
                ].map(([x, y]) => (
                  <circle key={x} cx={x} cy={y} r="4" fill="#ae95c2" />
                ))}
              </svg>
            </div>
            <strong>≠</strong>
            <div>
              <b>因果</b>
              <div className="causal-mini">
                <span>其他因素</span>
                <i>↙　↘</i>
                <div>
                  <span>A</span>
                  <span>B</span>
                </div>
              </div>
            </div>
          </div>
          <small>两件事一起变化，还不够说明谁导致谁。</small>
        </div>
        <div className="lesson-output">
          <span className="artifact-arrow" aria-hidden="true">
            ↓
          </span>
          <b>从 PDF 编排出的学习路径</b>
          <div className={phase === 0 ? "active" : ""}>
            <span>01</span> 看一个生活例子 <small>观察</small>
          </div>
          <div className={phase === 1 ? "active" : ""}>
            <span>02</span> 找到可能的其他因素 <small>图解</small>
          </div>
          <div className={phase === 2 ? "active" : ""}>
            <span>03</span> 自己判断一条新说法 <small>练习</small>
          </div>
        </div>
        <div className="pdf-output-types" aria-label="PDF 可转成的学习内容">
          <span>概念图解</span>
          <span>小课</span>
          <span>复习卡</span>
          <span>自测题</span>
        </div>
      </div>
    )}</Localize>;
  return <Localize>{(
    <div className="product-visual work-visual">
      <div className="work-contact">
        <span className="scene-person" aria-hidden="true">
          客
        </span>
        <div>
          <small>客户提出了新要求</small>
          <b>“明天能把这些功能都加上吗？”</b>
        </div>
      </div>
      <div className="work-branches">
        <div className={phase === 0 ? "branch-current" : ""}>
          <span>A</span>
          <p>“没问题，都能做。”</p>
          <small>尚未确认范围与资源</small>
        </div>
        <div className={phase > 0 ? "branch-current" : ""}>
          <span>B</span>
          <p>“哪些是明天必须用到的？”</p>
          <small>先澄清目标，再商量范围</small>
        </div>
      </div>
      <div className="work-feedback">
        <span aria-hidden="true">{phase > 0 ? "↗" : "?"}</span>
        <div>
          <b>{phase > 0 ? "对话有了可以继续的方向" : "你会怎样接这句话？"}</b>
          <p>
            {phase > 0
              ? "先问优先级，避免在信息不足时承诺全部交付。"
              : "选择会影响接下来需要处理的问题。"}
          </p>
        </div>
      </div>
      <div className="scenario-transfer">
        <span>{phase === 2 ? "换一个场景再练" : "正在练习"}</span>
        <b>{phase === 2 ? "同事临时提出需求 ↗" : "澄清 → 协商 → 确认"}</b>
      </div>
    </div>
  )}</Localize>;
}
