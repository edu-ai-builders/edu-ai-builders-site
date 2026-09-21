"use client";

import Localize from "@/app/i18n/localize";
import Link from "next/link";
import { ProductSceneVisual } from "./product-scenes";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const reducedMotionSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverMotionSnapshot = () => false;

const purposes = [
  {
    label: "我想找个课堂工具",
    verb: "先用起来",
    title: "把读到的关系，变成自己说得出的话。",
    note: "从材料里判断因果、比较与转折，再用自己的话表达理由。让阅读理解从“看过”变成一次具体的思考。",
    href: "/use/say-the-relation",
    action: "打开关系表达工具",
    tag: "语言与阅读 · 可直接使用",
  },
  {
    label: "我想自己做一个",
    verb: "跟着做一次",
    title: "用自己的话告诉 AI，做出第一个能练的东西。",
    note: "不用先学语法。课程教你怎么把想法说清楚、看懂 AI 给的三层结构、再一步步改成自己的学习工具。",
    href: "/learn/vibe-coding-basics",
    action: "进入 Vibe coding 入门",
    tag: "Vibe coding · 无需编程基础",
  },
  {
    label: "我想改成自己的",
    verb: "带着材料构建",
    title: "把一份 PDF，编排成可学习、可练习的内容。",
    note: "从材料提取概念，设计图解、复习卡和自测题。参考已有 Skill 和工作流，核对内容与出处，再做成你的学习产品。",
    href: "/build",
    action: "查看组件与工作流",
    tag: "PDF 转学习 · 构建流程示意",
  },
  {
    label: "我想知道怎么改进",
    verb: "找到设计依据",
    title: "学生点完了，为什么还是不会？",
    note: "从教学问题进入学习地图，找到可考虑的原理、适用条件，以及已经做好的例子。",
    href: "/atlas?concept=pedagogy%3Aself-explanation",
    action: "从这个问题打开地图",
    tag: "学习科学 · 原理与应用",
  },
];

export function FractionPreview({ playing = true }: { playing?: boolean }) {
  const [parts, setParts] = useState(2);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (
      !playing ||
      touched ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const sequence = [1, 2, 3, 2];
    let frame = 0;
    const timer = window.setInterval(() => {
      setParts(sequence[frame++ % sequence.length]);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [touched, playing]);
  return <Localize>{(
    <div className="home-fractions">
      <span className="home-demo-label">学生的视角 · 图形与符号同步变化</span>
      <h3>相同的整体，涂色一样多吗？</h3>
      <div className="home-bar-row">
        <b>1/2</b>
        <div className="home-fraction-bar">
          {[0, 1].map((i) => (
            <span className={i === 0 ? "filled" : ""} key={i} />
          ))}
        </div>
      </div>
      <div className="home-bar-row">
        <b>{parts}/4</b>
        <div className="home-fraction-bar">
          {[0, 1, 2, 3].map((i) => (
            <span className={i < parts ? "filled second" : ""} key={i} />
          ))}
        </div>
      </div>
      <label className="home-range">
        分子变化，涂色长度跟着改变 <output>{parts}</output>
        <input
          aria-label="四等分中涂色的份数"
          type="range"
          min="0"
          max="4"
          value={parts}
          onChange={(e) => {
            setTouched(true);
            setParts(Number(e.target.value));
          }}
        />
      </label>
      <div className="home-live-result" aria-live="polite">
        <b>
          1/2 {parts === 2 ? "=" : parts > 2 ? "<" : ">"} {parts}/4
        </b>
        <span>
          {parts === 2
            ? "每份变小了，但两份合起来正好是一半。"
            : "比较的是同样长的整体中，涂色部分的长度。"}
        </span>
      </div>
    </div>
  )}</Localize>;
}

function WebPreview({ playing }: { playing: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (
      !playing ||
      touched ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = window.setTimeout(() => setRevealed(true), 2600);
    return () => window.clearTimeout(timer);
  }, [touched, playing]);
  return <Localize>{(
    <div className="home-web-preview">
      <div className="home-editor">
        <span>你交给 AI 的小任务</span>
        <p>
          “做一张学习卡。
          <br />
          先让学生想答案，
          <br />
          点击后再显示解释。”
        </p>
        <div className="home-code-line">
          <i>结构</i> 问题 + 按钮 + 解释
        </div>
        <div className="home-code-line">
          <i>交互</i> 点击 → 显示
        </div>
      </div>
      <div className="home-small-phone">
        <span className="home-demo-label">学生看到的页面</span>
        <h3>怎样礼貌地提出改约？</h3>
        <div className="home-language-card" aria-hidden="true">
          <span>MEETING</span>
          <b>10:00 → 14:00</b>
          <small>先想一句，再翻开卡片</small>
        </div>
        <p>
          {revealed
            ? "Could we move our meeting to 2 pm?"
            : "你有另一个会议，想把时间改到下午两点。"}
        </p>
        <button
          type="button"
          onClick={() => {
            setTouched(true);
            setRevealed(!revealed);
          }}
        >
          {revealed ? "合上卡片" : "看看解释"} ↗
        </button>
      </div>
    </div>
  )}</Localize>;
}

function RelationPreview({ playing }: { playing: boolean }) {
  const [relation, setRelation] = useState<"cause" | "contrast" | null>(
    "contrast",
  );
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (
      !playing ||
      touched ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = window.setTimeout(() => setRelation("cause"), 3000);
    return () => window.clearTimeout(timer);
  }, [touched, playing]);
  return <Localize>{(
    <div className="home-relation">
      <span className="home-demo-label">关系表达组件 · 交互示意</span>
      <h3>别只连线。说出它们怎么相关。</h3>
      <div className="home-relation-cards">
        <div>街道上种了更多树。</div>
        <span>?</span>
        <div>夏天行人感觉更凉快。</div>
      </div>
      <p>题设：树荫减少了太阳直晒。两句话的关系是：</p>
      <div className="home-choice-row">
        <button
          type="button"
          aria-pressed={relation === "cause"}
          onClick={() => {
            setTouched(true);
            setRelation("cause");
          }}
        >
          因果关系
        </button>
        <button
          type="button"
          aria-pressed={relation === "contrast"}
          onClick={() => {
            setTouched(true);
            setRelation("contrast");
          }}
        >
          转折关系
        </button>
      </div>
      <div className="home-live-result" aria-live="polite">
        {relation === "cause"
          ? "因为树荫减少直晒，所以体感更凉快。题设给出了因果依据。"
          : relation === "contrast"
            ? "转折需要前后存在反差。这里题设给出的是导致变化的原因。"
            : "从不合适的关系到合适的关系，反馈说明了理由。"}
      </div>
      <small>教学示意；先后出现的两件事，本身不能证明因果。</small>
    </div>
  )}</Localize>;
}

export default function HomeExperience({ map }: { map: ReactNode }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    reducedMotionSnapshot,
    serverMotionSnapshot,
  );
  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % purposes.length),
      8500,
    );
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);
  const current = purposes[active];
  return <Localize>{(
    <section id="examples" className="home-stage" aria-labelledby="home-title">
      <div className="home-stage-copy">
        <p className="ea-eyebrow">不用想象，直接看</p>
        <h2 id="home-title">
          这四件事，
          <br />
          <span>在这一屏里就能看到结果。</span>
        </h2>
        <p className="home-promise">
          图形会自动演示工具怎样工作。
          <strong>也可以随时停下来，改一改，看看变化。</strong>
        </p>
      </div>
      <div
        id="home-purpose-panel"
        className="home-stage-panel"
        onPointerDownCapture={() => setPlaying(false)}
        onFocusCapture={() => setPlaying(false)}
      >
        <div className="home-browser-bar">
          <span aria-hidden="true">● ● ●</span>
          <span>{current.tag}</span>
          <b>0{active + 1} / 04</b>
        </div>
        <div className="home-stage-demo" key={active}>
          {active === 0 ? (
            <RelationPreview playing={playing && !reducedMotion} />
          ) : active === 1 ? (
            <WebPreview playing={playing && !reducedMotion} />
          ) : active === 2 ? (
            <ProductSceneVisual kind="pdf" phase={2} />
          ) : (
            <div className="home-map-preview">
              <p>从「学生只能照着做」出发</p>
              {map}
            </div>
          )}
        </div>
        <div className="home-stage-caption">
          <span>{current.verb}</span>
          <h2>{current.title}</h2>
          <p>{current.note}</p>
          <Link href={current.href}>
            {current.action} <b aria-hidden="true">↗</b>
          </Link>
        </div>
      </div>
      <div className="home-path-controls">
        <div className="home-purpose-heading">
          <span>
            {reducedMotion
              ? "四种起点，都有具体的例子"
              : "四种起点，看看能做出什么"}
          </span>
          {!reducedMotion && (
            <button
              type="button"
              aria-pressed={playing}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? "暂停演示 Ⅱ" : "继续演示 ▷"}
            </button>
          )}
        </div>
        <div className="home-purpose-tabs" aria-label="选择你现在的需要">
          {purposes.map((purpose, i) => (
            <button
              key={purpose.label}
              type="button"
              aria-pressed={active === i}
              aria-controls="home-purpose-panel"
              onClick={() => {
                setActive(i);
                setPlaying(false);
              }}
            >
              <span>0{i + 1}</span>
              {purpose.label}
              <b aria-hidden="true">↗</b>
            </button>
          ))}
        </div>
        <p className="home-welcome">
          老师、设计者、开发者都能从这里开始 · 免费浏览，无需注册
        </p>
      </div>
    </section>
  )}</Localize>;
}

export function FeedbackDesign() {
  const [hint, setHint] = useState(false);
  const [retry, setRetry] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [demonstrating, setDemonstrating] = useState(true);
  const [started, setStarted] = useState(false);
  const labRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setHint(true);
            setRetry(true);
            setAnswer(2);
            setDemonstrating(false);
          }
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (labRef.current) observer.observe(labRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started || !demonstrating) return;
    const timers = [
      window.setTimeout(() => setHint(true), 2400),
      window.setTimeout(() => setRetry(true), 5100),
      window.setTimeout(() => {
        setAnswer(2);
        setDemonstrating(false);
      }, 7800),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [started, demonstrating]);
  return <Localize>{(
    <section className="home-design-lab" aria-labelledby="design-lab-title">
      <div className="home-lab-intro">
        <p className="ea-eyebrow">学习科学，怎样帮你做出更好的产品？</p>
        <h2 id="design-lab-title">
          同一道题。
          <br />
          你可以改变学习者的下一步。
        </h2>
        <p>
          一份 PDF
          报告里的图表，能变成一段数据判断练习。学习科学帮助你决定：哪里需要提示，怎样让学习者重新判断。
        </p>
        <p>
          例如「可行动的反馈」：学习者误读图表后，需要知道可以改哪里。
          <strong>
            看右侧演示：一句具体提示，再加一次修改机会，练习会怎样改变。
          </strong>
        </p>
        <div className="home-lab-playback">
          <span>
            {demonstrating
              ? "正在自动演示 · 无需操作"
              : "演示已展示 · 也可以自己切换"}
          </span>
          <button
            type="button"
            onClick={() => {
              if (demonstrating) {
                setDemonstrating(false);
              } else {
                setHint(false);
                setRetry(false);
                setAnswer(null);
                setDemonstrating(true);
              }
            }}
          >
            {demonstrating ? "暂停" : "重新演示 ↻"}
          </button>
        </div>
        <div className="home-design-controls">
          <label>
            <input
              type="checkbox"
              checked={hint}
              onChange={(e) => {
                setDemonstrating(false);
                setHint(e.target.checked);
              }}
            />
            <span>
              <b>给一个具体线索</b>
              <small>把“错了”变成“看一看哪里”</small>
            </span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={retry}
              onChange={(e) => {
                setDemonstrating(false);
                setRetry(e.target.checked);
                setAnswer(null);
              }}
            />
            <span>
              <b>留一次重新判断的机会</b>
              <small>让学生根据线索修改答案</small>
            </span>
          </label>
        </div>
        <Link
          className="home-inline-link"
          href="/atlas?concept=pedagogy%3Aactionable-feedback"
        >
          查看这个原理的适用条件与来源 →
        </Link>
      </div>
      <div ref={labRef} className="home-learner-view">
        <div className="home-device-top">
          学习者的视角 <span>数据素养 · 手机</span>
        </div>
        <div className="home-phone-question">
          <small>报告阅读 · 区分相关与因果</small>
          <h3>销量与气温一起上升，能说明谁导致谁吗？</h3>
          <div
            className="data-context-chart"
            role="img"
            aria-label="示意图：气温和冰淇淋销量共同上升，没有提供因果证据"
          >
            <span>气温 ↗</span>
            <i>⌁</i>
            <span>销量 ↗</span>
          </div>
          <div className="home-student-options">
            <span>
              销量导致升温 <i>原来的选择</i>
            </span>
            <span>还不能确定因果</span>
          </div>
          <div
            className={`home-student-feedback ${hint ? "has-hint" : ""}`}
            aria-live="polite"
          >
            <b>
              {answer === 2
                ? "这次选对了。"
                : answer === 1
                  ? "一起变化，还不够说明导致关系。"
                  : "这个结论跳过了因果证据。"}
            </b>
            <p>
              {hint
                ? "想一想：是否有其他解释？只有同时变化，还不能排除其他影响因素。"
                : "答案不正确。"}
            </p>
            {hint && (
              <div className="causality-hint">
                <span>同时变化</span>
                <b>≠</b>
                <span>因果证据</span>
              </div>
            )}
          </div>
          {retry ? (
            <div className="home-retry">
              <p>现在，你会选：</p>
              <button
                onClick={() => {
                  setDemonstrating(false);
                  setAnswer(1);
                }}
                type="button"
                aria-pressed={answer === 1}
              >
                销量导致升温
              </button>
              <button
                onClick={() => {
                  setDemonstrating(false);
                  setAnswer(2);
                }}
                type="button"
                aria-pressed={answer === 2}
              >
                还不能确定因果
              </button>
              {answer === 2 && (
                <p className="home-reason">
                  接着请解释：你还需要什么证据？再用一张新图表检验这个判断。
                </p>
              )}
            </div>
          ) : (
            <div className="home-disabled-next">
              目前的设计：显示结果后就结束
            </div>
          )}
        </div>
        <div className="home-device-bottom" aria-hidden="true" />
      </div>
      <div className="home-lab-takeaway">
        <span>一个概念</span>
        <b>可行动的反馈</b>
        <i>→</i>
        <span>一个设计决定</span>
        <b>具体线索 + 修改机会</b>
        <i>→</i>
        <span>一个可观察的动作</span>
        <b>学生重新判断、说明理由</b>
        <p>
          这是交互机制示意，不是学习效果的实验证明。还需要用新题、延时检查等方式观察理解。
        </p>
      </div>
    </section>
  )}</Localize>;
}
