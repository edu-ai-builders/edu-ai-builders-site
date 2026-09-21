"use client";
import Localize from "@/app/i18n/localize";
import { useId, useState } from "react";
import {
  gitStep,
  initialGitState,
  resolveFigure,
  type FigureKey,
  type GitAction,
} from "./figure-model";

type Spec = {
  title: string;
  question: string;
  options: string[];
  answer: number;
  insight: string;
  caveat: string;
  frame: string;
};
const specs: Record<FigureKey, Spec> = {
  "git-flow": {
    title: "保存之后，哪个版本会进入提交？",
    question: "先编辑、暂存，再编辑一次；此时提交会记录哪一版？",
    options: [
      "工作区里的最新一版",
      "最后一次暂存的版本",
      "直接变成 GitHub 上的版本",
    ],
    answer: 1,
    insight:
      "add 记录当时的内容；之后继续编辑不会同步更新暂存区。commit 保存暂存区，而 push 才更新远端。",
    caveat:
      "单文件、单分支的状态模型；省略认证、网络失败、合并和文件删除。版本号只用于这个演示。",
    frame: "我看到：再次编辑后，___ 变了，但 ___ 没变。因此提交前我要 ___。",
  },
  "github-flow": {
    title: "提交到本地，同伴就能看到吗？",
    question: "同伴要看到已提交的改动，下面哪一步还不能省略？",
    options: ["刷新编辑器", "按保存键", "把提交推送到有访问权限的远端"],
    answer: 2,
    insight:
      "本地提交与远端共享分别保存状态。远端不会自动跟随编辑或提交；实际协作还需要检查权限并经过评审。",
    caveat:
      "本页只是状态模拟，不连接 GitHub，不上传任何文件。真实 push 需要远端配置和认证。",
    frame: "同伴能看到的是 ___，不是我工作区中的 ___。",
  },
  scaffolding: {
    title: "提示多少，才保留了思考的位置？",
    question:
      "学生已经卡住、但目标仍是让他自己解释时，哪种做法能兼顾帮助与独立判断？",
    options: [
      "直接显示完整答案",
      "根据需要逐步给提示，再让学生解释",
      "一直隐藏所有帮助",
    ],
    answer: 1,
    insight:
      "提示逐步增加时，界面能提供的帮助变多，留给学习者自己完成的步骤变少。支持的程度需要根据已有基础和表现调整。",
    caveat:
      "这里展示支持形式的差别，并未测量某位学生的学习效果；更少提示并不总是更好。",
    frame: "我会先给 ___，因为还希望学习者自己完成 ___。",
  },
  feedback: {
    title: "这条反馈，能让学生知道下一步吗？",
    question: "学生把 1/3 判断成比 1/2 大，哪条反馈提供了可以执行的下一步？",
    options: [
      "再努力一点！",
      "错了。答案是 1/2。",
      "把两个同样大的整体分别分成 3 份和 2 份，再比较其中 1 份。",
    ],
    answer: 2,
    insight:
      "反馈把注意力放到同样大小的整体与份数，并给出可执行的比较动作。学生仍需要重新判断和解释。",
    caveat: "这是三种反馈文案的对照，不代表固定话术适合所有年龄、目标和困难。",
    frame: "我把只有评价的反馈改成 ___，让学生下一步可以 ___。",
  },
  "web-layers": {
    title: "文字、样式和动作，分别由谁负责？",
    question: "只打开 CSS 样式，能让按钮切换提示吗？",
    options: [
      "能，颜色变了就会有交互",
      "不能，还需要响应操作的 JavaScript",
      "不能，因为必须连接 AI",
    ],
    answer: 1,
    insight:
      "HTML 提供按钮和提示的结构，CSS 改变外观，JavaScript 响应操作。这个提示卡不需要连接 AI 或网络。",
    caveat:
      "此处开关模拟三层的分工，不执行用户输入的代码。真实网页也有浏览器自带的交互行为。",
    frame: "当 ___ 开关关闭时，我还能 ___，但不能 ___。",
  },
  responsive: {
    title: "手机上，两列还能读清楚吗？",
    question: "把预览切到手机宽度后，哪一种布局可以保留合适的内容宽度？",
    options: ["永远固定两列", "允许窄屏重排成一列", "把所有文字缩小到一半"],
    answer: 1,
    insight:
      "窄屏重排改变的是内容的组织方式；字号和操作目标不必跟着缩小。手机首屏需要保留明确的下一步。",
    caveat:
      "缩小的设备示意只展示布局规则。上线前仍需用真实窄屏、键盘和缩放检查。",
    frame: "宽度变小时，我让 ___ 变成 ___，因为读者需要 ___。",
  },
  retrieval: {
    title: "“看见答案”和“自己想起”，界面有什么不同？",
    question: "想了解学习者能否独立想起解释，应该先看到什么？",
    options: ["答案和“我懂了”按钮", "问题和一次自己的尝试", "完成阅读的进度条"],
    answer: 1,
    insight:
      "先隐藏答案，才能给回忆或判断留出空间；核对后还需要修正。点击、停留或自述熟悉都不能替代目标表现。",
    caveat: "这里只演示任务顺序，不判断你的答案，也不从一次尝试推断长期掌握。",
    frame: "我先让学习者 ___，再提供 ___，这样可以观察 ___。",
  },
  "assistant-flow": {
    title: "学习助手先给答案，还是先问一步？",
    question: "要帮助学生形成自己的解释，助手的第一步可以是什么？",
    options: [
      "直接输出完整作业",
      "邀请学生先给判断，再按需提示",
      "只说“答错了”",
    ],
    answer: 1,
    insight:
      "当流程先保留尝试，再提供提示、核对与修正，助手就有机会支持学生完成任务，而不只是代写结果。",
    caveat:
      "所有回复都是预写脚本，不是实时 AI。真实助手还需检验准确性、适龄性和数据处理。",
    frame: "在助手给出 ___ 之前，我会让学习者先 ___。",
  },
  "form-validation": {
    title: "填写了空格，表单就算完成了吗？",
    question: "只输入几个空格后提交，哪一种反馈能帮助用户完成任务？",
    options: [
      "直接说保存成功",
      "说明主题不能为空，并保留可修改的输入",
      "悄悄清空所有内容",
    ],
    answer: 1,
    insight:
      "先清理首尾空格，再检查内容。错误指出可修正的位置；预览成功也只说明接收了输入，不说明内容正确或已经发给别人。",
    caveat:
      "这是只保留在当前页面的表单演示，没有网络请求或持久保存；刷新即清除。校验只检查是否为空和长度，不判断教学质量。",
    frame: "输入 ___ 时，界面进入 ___；我改成 ___ 后，界面显示 ___。",
  },
  refactor: {
    title: "代码更短，原来的行为一定还在吗？",
    question: "重构后只检查首次点击，足够确认提示按钮仍然正常吗？",
    options: [
      "足够，代码能运行就好",
      "不够，还要检查收起、重复点击与键盘",
      "足够，AI 说通过即可",
    ],
    answer: 1,
    insight:
      "重构目标是调整内部组织并保留约定行为。这个故障版本只处理打开；第二次点击揭示了被遗漏的状态转换。",
    caveat:
      "预设故障帮助观察回归测试的作用，不会修改你的项目，也不能替代真实项目的检查。",
    frame: "我测试 ___ 时发现 ___，所以验收条件需要包含 ___。",
  },
};

export default function TeachableFigure({
  course,
  lesson,
}: {
  course: string;
  lesson: { id: string; title: string; figureKey?: string };
}) {
  const key = resolveFigure(course, lesson),
    spec = specs[key],
    id = useId();
  const [prediction, setPrediction] = useState<number | null>(null),
    [revealed, setRevealed] = useState(false),
    [explanation, setExplanation] = useState("");
  return <Localize>{(
    <figure className="tf-frame" aria-labelledby={`${id}-title`}>
      <figcaption>
        <span className="course-section-label">
          动手看懂 ·{" "}
          {key === "git-flow" || key === "github-flow"
            ? "版本流转"
            : "交互实验"}
        </span>
        <h3 id={`${id}-title`}>{spec.title}</h3>
      </figcaption>
      <fieldset className="tf-predict">
        <legend>① 先预测：{spec.question}</legend>
        {spec.options.map((option, i) => (
          <label key={option}>
            <input
              type="radio"
              name={`${id}-predict`}
              checked={prediction === i}
              onChange={() => {
                setPrediction(i);
                setRevealed(false);
              }}
            />
            {option}
          </label>
        ))}
      </fieldset>
      <div className="tf-try">
        <p className="course-section-label">② 改一改，看发生了什么</p>
        {key === "git-flow" || key === "github-flow" ? (
          <GitFlow remoteFirst={key === "github-flow"} />
        ) : key === "scaffolding" ? (
          <Scaffold />
        ) : key === "feedback" ? (
          <Feedback />
        ) : key === "web-layers" ? (
          <WebLayers />
        ) : key === "responsive" ? (
          <Responsive />
        ) : key === "retrieval" ? (
          <Retrieval />
        ) : key === "assistant-flow" ? (
          <Assistant />
        ) : key === "form-validation" ? (
          <FormValidation />
        ) : (
          <Refactor />
        )}
      </div>
      <button
        type="button"
        disabled={prediction === null}
        onClick={() => setRevealed(true)}
      >
        ③ 对照预测，解释原因
      </button>
      {revealed && (
        <div className="tf-insight" role="status">
          <strong>
            {prediction === spec.answer
              ? "你的预测与这里观察到的机制一致。"
              : "可以回到上面的实验，再核对一次预测。"}
          </strong>
          <p>{spec.insight}</p>
          <label>
            用自己的话说出变化
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder={spec.frame}
              maxLength={600}
            />
          </label>
          <small>
            这句解释仅留在当前页面，刷新会清除；可以复制到自己的笔记。
          </small>
        </div>
      )}
      <p className="tf-caveat">演示边界：{spec.caveat}</p>
    </figure>
  )}</Localize>;
}
function GitFlow({ remoteFirst }: { remoteFirst: boolean }) {
  const [state, setState] = useState({ ...initialGitState }),
    [last, setLast] = useState("起点：四个位置都是版本 1。");
  const labels: Record<GitAction, string> = {
    edit: "编辑并保存",
    add: "git add · 暂存",
    commit: "git commit · 提交",
    push: "git push · 推送",
    unstage: "撤销暂存",
    reset: "重新开始",
  };
  const act = (action: GitAction) => {
    setState((s) => gitStep(s, action));
    setLast(
      action === "edit"
        ? "只改了工作区，其他位置保留自己的版本。"
        : action === "add"
          ? "暂存区现在记录工作区的当前内容。"
          : action === "commit"
            ? "本地提交记录了暂存内容；远端未自动改变。"
            : action === "push"
              ? "远端现在拥有最近的本地提交。"
              : action === "unstage"
                ? "暂存区回到最近提交；工作区编辑仍在。"
                : "已重置模拟。",
    );
  };
  return <Localize>{(
    <>
      <p className="tf-instruction">
        {remoteFirst
          ? "依次编辑、暂存、提交。观察“GitHub 远端”有没有改变，再尝试推送。"
          : "试一试：编辑 → 暂存 → 再编辑 → 提交。比较四个位置的版本。"}
      </p>
      <div className="tf-git-board">
        {(
          [
            ["工作区", "working", "你正在编辑"],
            ["暂存区", "staged", "下一次提交内容"],
            ["本地提交", "committed", "已记录的快照"],
            ["GitHub 远端", "remote", "同伴可获取的版本"],
          ] as const
        ).map(([title, key, note]) => (
          <div
            key={key}
            className={state[key] === state.working ? "is-latest" : ""}
          >
            <span>{title}</span>
            <strong>版本 {state[key]}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
      <div className="tf-controls">
        {(Object.keys(labels) as GitAction[]).map((action) => (
          <button
            key={action}
            onClick={() => act(action)}
            disabled={
              action === "commit"
                ? state.staged === state.committed
                : action === "push"
                  ? state.committed === state.remote
                  : action === "add"
                    ? state.working === state.staged
                    : false
            }
            type="button"
          >
            {labels[action]}
          </button>
        ))}
      </div>
      <p className="tf-readout" aria-live="polite">
        {last}
      </p>
    </>
  )}</Localize>;
}
function Scaffold() {
  const [level, setLevel] = useState(0);
  return <Localize>{(
    <>
      <div className="tf-controls">
        <label>
          支持程度{" "}
          <input
            type="range"
            min={0}
            max={3}
            value={level}
            onChange={(e) => setLevel(+e.target.value)}
          />
          <output>
            {["独立尝试", "方向提示", "可视化提示", "完整示例"][level]}
          </output>
        </label>
      </div>
      <div className="tf-device">
        <div className="tf-device-top">学生看到的练习</div>
        <h4>1/2 和 1/3，哪个更大？为什么？</h4>
        {level === 0 ? (
          <p>先写下你的判断与理由。</p>
        ) : (
          <p>
            {
              [
                "",
                "把它们放在同样大小的整体里比较。",
                "观察下面两条一样长的纸条，各取一份。",
                "1/2 更大：同样的整体，平均分成 2 份的每份比分成 3 份的每份大。",
              ][level]
            }
          </p>
        )}
        {level >= 2 && (
          <div className="tf-fractions">
            {[2, 3].map((n) => (
              <div key={n}>
                <span>1/{n}</span>
                <div>
                  {Array.from({ length: n }, (_, i) => (
                    <i className={i === 0 ? "filled" : ""} key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <label>
          你的解释
          <textarea placeholder="我认为……因为……" aria-label="分数比较的解释" />
        </label>
      </div>
      <p className="tf-readout">
        {level === 3
          ? "现在答案已经给出。下一题可以换一组分数，让学生独立解释。"
          : "提示没有直接替学生完成最终解释；困难时可以再增加一层支持。"}
      </p>
    </>
  )}</Localize>;
}
function Feedback() {
  const [kind, setKind] = useState(0);
  const messages = [
    "再努力一点！",
    "错了，正确答案是 1/2。",
    "先画两个同样大的整体：一个平均分成 2 份，一个分成 3 份。各取一份，再比较。",
  ];
  return <Localize>{(
    <>
      <div className="tf-controls">
        {["鼓励", "给答案", "给下一步"].map((s, i) => (
          <button
            type="button"
            key={s}
            aria-pressed={kind === i}
            onClick={() => setKind(i)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="tf-chat">
        <p className="tf-student">学生：我选 1/3，因为 3 比 2 大。</p>
        <p className="tf-coach">{messages[kind]}</p>
        {kind === 2 && (
          <div className="tf-feedback-next">
            <span>现在可尝试</span>
            <div className="tf-fractions">
              {[2, 3].map((n) => (
                <div key={n}>
                  <span>1/{n}</span>
                  <div>
                    {Array.from({ length: n }, (_, i) => (
                      <i key={i} className={i === 0 ? "filled" : ""} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p>两条一样长。你想修改哪个判断？</p>
          </div>
        )}
      </div>
      <p className="tf-readout">
        {
          [
            "只有态度支持，尚未指出怎么修正。",
            "给出了结果，学生可能仍不知道错误在哪里。",
            "提供操作线索，再把解释的责任交回学习者。",
          ][kind]
        }
      </p>
    </>
  )}</Localize>;
}
function WebLayers() {
  const [html, setHtml] = useState(true),
    [css, setCss] = useState(true),
    [js, setJs] = useState(false),
    [open, setOpen] = useState(false);
  return <Localize>{(
    <>
      <div className="tf-controls">
        {[
          ["HTML 结构", html, setHtml],
          ["CSS 样式", css, setCss],
          ["JavaScript 行为", js, setJs],
        ].map(([label, value, setter]) => (
          <label key={label as string}>
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) =>
                (setter as (v: boolean) => void)(e.target.checked)
              }
            />
            {label as string}
          </label>
        ))}
      </div>
      <div className={`tf-web-preview ${css ? "is-styled" : ""}`}>
        {html ? (
          <>
            <h4>这段话的证据在哪里？</h4>
            <p>先给判断，再按需查看线索。</p>
            <button
              type="button"
              onClick={() => {
                if (js) setOpen(!open);
              }}
              aria-expanded={js && open}
            >
              {js && open ? "收起提示" : "打开提示"}
            </button>
            {js && open && (
              <p className="tf-hint">
                找一句能支持你判断的原文，再解释两者的关系。
              </p>
            )}
          </>
        ) : (
          <p className="tf-empty">页面的标题、文字和按钮结构已移除。</p>
        )}
      </div>
      <p className="tf-readout" aria-live="polite">
        {!html
          ? "没有内容结构时，这个卡片没有可操作的按钮。"
          : !js
            ? "按钮在这里，但点击不会切换提示。试着启用 JavaScript。"
            : `行为已开启。当前提示${open ? "可见" : "收起"}；关掉 CSS 后仍然能操作。`}
      </p>
    </>
  )}</Localize>;
}
function Responsive() {
  const [mobile, setMobile] = useState(false),
    [reflow, setReflow] = useState(false);
  return <Localize>{(
    <>
      <div className="tf-controls">
        <button
          type="button"
          aria-pressed={!mobile}
          onClick={() => setMobile(false)}
        >
          电脑
        </button>
        <button
          type="button"
          aria-pressed={mobile}
          onClick={() => setMobile(true)}
        >
          手机
        </button>
        <label>
          <input
            type="checkbox"
            checked={reflow}
            onChange={(e) => setReflow(e.target.checked)}
          />
          窄屏重排
        </label>
      </div>
      <div className={`tf-layout-device ${mobile ? "is-phone" : ""}`}>
        <div className="tf-device-top">
          {mobile ? "手机布局示意" : "电脑布局示意"}
        </div>
        <div
          className={`tf-layout-content ${mobile && reflow ? "is-reflow" : ""}`}
        >
          <section>
            <small>给英语老师的课堂工具</small>
            <h4>让学生说出理由。</h4>
            <p>选一句观点，找到证据，再连成一句解释。</p>
            <span className="tf-fake-button">打开一段示例 →</span>
          </section>
          <div className="tf-demo-art">
            <span>观点</span>
            <i>↓ 为什么？</i>
            <span>证据</span>
            <i>↓ 所以……</i>
            <span>解释</span>
          </div>
        </div>
      </div>
      <p className="tf-readout">
        {mobile && !reflow
          ? "两列被挤窄，标题需要频繁换行；开启“窄屏重排”比较。"
          : mobile
            ? "现在示例排到说明下方，内容仍保持阅读顺序。"
            : "在电脑宽度里，任务说明与操作示意并排展示。"}
      </p>
    </>
  )}</Localize>;
}
function Retrieval() {
  const [mode, setMode] = useState(false),
    [answer, setAnswer] = useState(""),
    [reveal, setReveal] = useState(false);
  return <Localize>{(
    <>
      <div className="tf-controls">
        <button
          type="button"
          aria-pressed={!mode}
          onClick={() => {
            setMode(false);
            setReveal(false);
          }}
        >
          先看解释
        </button>
        <button
          type="button"
          aria-pressed={mode}
          onClick={() => {
            setMode(true);
            setReveal(false);
          }}
        >
          先独立尝试
        </button>
      </div>
      <div className="tf-device">
        <div className="tf-device-top">事实与观点 · 练习</div>
        <h4>“这条街最美”可以直接用数数查证吗？</h4>
        {mode && (
          <label>
            先写下判断
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="我认为……，查证时还需要……"
            />
          </label>
        )}
        {(!mode || reveal) && (
          <p className="tf-hint">
            “最美”涉及评价标准与偏好。它不同于“这条街种了 12
            棵树”这样的可计数陈述；解释时需要说明两者的依据。
          </p>
        )}
        {mode && !reveal && (
          <button type="button" onClick={() => setReveal(true)}>
            我已尝试，打开解释核对
          </button>
        )}
        {mode && reveal && <p>对照自己的解释：你想补充或修正哪一点？</p>}
      </div>
      <p className="tf-readout">
        {mode
          ? "先保留一次独立判断，再核对和修正。这里不会自动给你的文字评分。"
          : "答案一直可见时，读者可能感到熟悉，但界面还没有显示独立判断。"}
      </p>
    </>
  )}</Localize>;
}
function Assistant() {
  const [mode, setMode] = useState(false),
    [step, setStep] = useState(0);
  const steps = [
    "先说说你的判断：这句话是事实还是观点？为什么？",
    "如果不确定，想想：能用什么观察方法核对这句话？",
    "对照解释后，再写一个你自己的例子，并说出判断依据。",
  ];
  return <Localize>{(
    <>
      <div className="tf-controls">
        <button
          type="button"
          aria-pressed={!mode}
          onClick={() => {
            setMode(false);
            setStep(0);
          }}
        >
          直接给结果
        </button>
        <button
          type="button"
          aria-pressed={mode}
          onClick={() => {
            setMode(true);
            setStep(0);
          }}
        >
          支持一次思考
        </button>
      </div>
      <div className="tf-chat">
        <p className="tf-student">学生：“这条街最美”是什么？帮我写答案。</p>
        <p className="tf-coach">
          {mode
            ? steps[step]
            : "这是观点，因为“最美”包含个人评价。你可以这样写：……"}
        </p>
        {mode && (
          <>
            <div className="tf-flow-dots">
              {["尝试", "提示", "核对与迁移"].map((s, i) => (
                <span key={s} className={step === i ? "active" : ""}>
                  {i + 1} · {s}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) % steps.length)}
            >
              {step === 2 ? "重新观察流程" : "查看下一步 →"}
            </button>
          </>
        )}
      </div>
      <p className="tf-readout">
        {mode
          ? "每一步都给学习者留出响应的机会。实际产品需根据表现调整，而非机械地过流程。"
          : "结果出现了，但这段对话还不能告诉你学生能否独立判断。"}
      </p>
    </>
  )}</Localize>;
}
function Refactor() {
  const [broken, setBroken] = useState(true),
    [open, setOpen] = useState(false),
    [clicks, setClicks] = useState(0);
  return <Localize>{(
    <>
      <div className="tf-controls">
        <button
          type="button"
          aria-pressed={broken}
          onClick={() => {
            setBroken(true);
            setOpen(false);
            setClicks(0);
          }}
        >
          遗漏收起逻辑的版本
        </button>
        <button
          type="button"
          aria-pressed={!broken}
          onClick={() => {
            setBroken(false);
            setOpen(false);
            setClicks(0);
          }}
        >
          保留切换行为的版本
        </button>
      </div>
      <div className="tf-web-preview is-styled">
        <h4>课堂提示卡</h4>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => {
            setOpen(broken ? true : !open);
            setClicks((c) => c + 1);
          }}
        >
          {open ? "收起提示" : "打开提示"}
        </button>
        {open && <p className="tf-hint">先寻找证据，再解释依据。</p>}
        <p>
          操作次数：{clicks} · 提示：{open ? "显示" : "隐藏"}
        </p>
      </div>
      <p className="tf-readout">
        {clicks < 2
          ? "请连续操作两次，也可以用 Tab 聚焦按钮后按 Enter。"
          : broken
            ? "第二次操作后仍显示提示：首次点击通过，完整切换行为没有通过。"
            : "第二次操作让提示收起。继续重复操作，检查状态是否一致。"}
      </p>
    </>
  )}</Localize>;
}

function FormValidation() {
  const id = useId();
  const [topic, setTopic] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("等待输入");
  return <Localize>{(
    <>
      <p className="tf-instruction">
        先用空白提交，再试一个虚构活动主题。观察错误、修改和预览三种状态。
      </p>
      <form
        className="tf-device tf-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const value = topic.trim();
          if (!value || value.length > 40) {
            setError("请写一个 1–40 字的活动主题，空格不算内容。");
            setPhase("需要修正");
            return;
          }
          setError("");
          setSubmitted(value);
          setPhase("本页预览成功");
        }}
      >
        <div className="tf-device-top">老师的出门条 · 本地演示</div>
        <label htmlFor={id}>活动主题</label>
        <input
          id={id}
          value={topic}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-error`}
          onChange={(event) => {
            setTopic(event.target.value);
            setError("");
            setPhase("正在编辑");
          }}
          placeholder="例如：观察校园植物"
        />
        <p id={`${id}-error`} role="alert">
          {error}
        </p>
        <button type="submit">在本页预览</button>
        <button
          type="button"
          onClick={() => {
            setTopic("");
            setSubmitted("");
            setError("");
            setPhase("等待输入");
          }}
        >
          重置演示
        </button>
        {submitted && (
          <div className="tf-hint">
            <strong>最近一次通过格式检查的主题</strong>
            <p>{submitted}</p>
          </div>
        )}
      </form>
      <p className="tf-readout" role="status">
        当前状态：{phase}。没有上传或发送；格式通过不等于教学内容经过审核。
      </p>
    </>
  )}</Localize>;
}
