"use client";

import Localize from "@/app/i18n/localize";
import { useState } from "react";
import type { DesignScenario } from "../content/atlas-zh";

/** An illustrative product choice, not a measured learning-outcome simulation. */
export default function DesignPreview({ scenario }: { scenario: DesignScenario }) {
  const [changed, setChanged] = useState(true);
  const [step, setStep] = useState(1);
  return <Localize>{<figure className="atlas-design-preview">
    <figcaption><span>把原理放进产品</span><strong>{scenario.short}</strong></figcaption>
    {scenario.id === "fade" ? <>
      <div className="atlas-preview-steps" role="group" aria-label="示例支持程度">{["完整示范", "补一个步骤", "独立完成"].map((label, index) => <button key={label} aria-pressed={step === index} onClick={() => setStep(index)}><span>{index + 1}</span>{label}</button>)}</div>
      <div className="atlas-mini-app" aria-live="polite"><div className="atlas-mini-app-bar"><i /><i /><i /><span>学生看到的练习</span></div><div className="atlas-mini-app-content"><small>解方程 · {step === 0 ? "看看每步在做什么" : step === 1 ? "哪一步保证等式不变？" : "试着组织自己的解法"}</small><strong className="atlas-math-expression">{step === 2 ? "3x + 6 = 18" : "2x + 4 = 12"}</strong>{step === 0 ? <div className="atlas-worked-lines"><p><b>① 两边同时减 4</b><span>2x = 8</span></p><p><b>② 两边同时除以 2</b><span>x = 4</span></p></div> : step === 1 ? <div className="atlas-worked-lines"><p><b>① 两边同时减 4</b><span>2x = 8</span></p><div className="atlas-answer-placeholder">② 下一步：________<br /><small>说明为什么等式仍然成立。</small></div></div> : <div className="atlas-answer-placeholder">写下你的步骤与理由……<br /><small>需要时可以请求提示。</small></div>}</div></div>
      <p className="atlas-preview-observation">{["解法与理由都可见，帮助新手看清结构。", "留出一个关键决定，把部分思考交还学生。", "换一题并移除步骤，才能观察是否独立完成。 "][step]}</p>
    </> : <>
      <div className="atlas-preview-steps" role="group" aria-label="比较设计前后"><button aria-pressed={!changed} onClick={() => setChanged(false)}>常见做法</button><button aria-pressed={changed} onClick={() => setChanged(true)}>试试这个改动</button></div>
      <div className={`atlas-mini-app ${changed ? "is-redesigned" : ""}`} aria-live="polite"><div className="atlas-mini-app-bar"><i /><i /><i /><span>学生看到的练习</span></div><div className="atlas-mini-app-content">
        {scenario.id === "explain" && <><small>比较分数 · 先看图，再解释</small><div className="atlas-fraction-row"><span>1/3</span><div className="atlas-fraction-bar">{Array.from({ length: 3 }, (_, i) => <i key={i} className={i === 0 ? "is-filled" : ""} />)}</div></div><div className="atlas-fraction-row"><span>1/6</span><div className="atlas-fraction-bar">{Array.from({ length: 6 }, (_, i) => <i key={i} className={i === 0 ? "is-filled" : ""} />)}</div></div>{changed ? <div className="atlas-answer-placeholder">同样大的整体，各取一份。为什么 1/3 比 1/6 大？<br /><small>用图中的分块说明，不只写符号。</small></div> : <div className="atlas-passive-state"><strong>1/3 &gt; 1/6</strong><span>我懂了 ✓</span></div>}</>}
        {scenario.id === "feedback" && <><small>写作练习 · 用证据支持观点</small><blockquote>“校园应该多种树，因为树很好。”</blockquote>{changed ? <div className="atlas-feedback-note"><strong>把“很好”变成可观察的理由。</strong><p>树荫会改变哪种校园体验？补一个具体例子，再看看它是否支持你的观点。</p><span>↩ 回到这句话，修改理由</span></div> : <div className="atlas-feedback-note is-vague"><strong>理由不够充分。</strong><p>请认真思考，再试一次。</p><span>评分：待改进</span></div>}</>}
        {scenario.id === "focus" && <div className={`atlas-focus-demo ${changed ? "is-focused" : ""}`}><div className="atlas-distraction">🏅 连胜 12 天 <span>排行榜第 6</span></div><div className="atlas-focus-task"><strong>长方形的面积</strong><div className="atlas-area-diagram"><div>{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div><span>4 列 × 3 行 = 12 格</span></div></div><div className="atlas-distraction">推荐：下一个挑战 →</div><p className="atlas-integrated-caption">{changed ? "每格代表一个单位面积。列数 × 行数，得到总格数。" : "面积公式在页面另一处，请向下查找。"}</p></div>}
      </div></div>
      <p className="atlas-preview-observation">{changed ? scenario.after : scenario.before}</p>
    </>}
    <p className="atlas-preview-caveat">界面示意：展示设计选择，不代表测得的学习效果。</p>
  </figure>}</Localize>;
}
