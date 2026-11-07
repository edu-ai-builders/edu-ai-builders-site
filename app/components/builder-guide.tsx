"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "../i18n/localize";
import { builderScenarios } from "../content/builder-scenarios";
import { matchScenarios } from "../lib/builder-core";

export function BuilderGuideForm({ compact=false, onNavigate }: {compact?:boolean;onNavigate?:()=>void}) {
  const {t}=useLocale();
  const router=useRouter();
  const [goal,setGoal]=useState("");
  const [mode,setMode]=useState("build");
  const [asked,setAsked]=useState(false);
  const matched=matchScenarios(builderScenarios,goal);
  function go() {
    const terms={"family-math":"math","science-evidence":"science","research-workflow":"research"};
    const q=encodeURIComponent(matched[0]?terms[matched[0].scenario.slug as keyof typeof terms]:goal.trim());
    if(mode==="use")router.push("/use");
    else if(mode==="learn")router.push(/git|github|版本/i.test(goal)?"/learn/github-starter":"/learn/vibe-coding-basics");
    else if(mode==="adapt")router.push("/skills/workflows/edu-repo-adapter");
    else if(mode==="fusion")router.push("/skills/workflows/edu-skill-fusion");
    else router.push(`/directory?q=${q}#radar-browse`);
    onNavigate?.();
  }
  return <div className={`builder-guide-form ${compact?"compact":""}`}>
    <form onSubmit={e=>{e.preventDefault();setAsked(true);}}>
      <label>{t("你想解决什么问题？")}<textarea value={goal} onChange={e=>{setGoal(e.target.value);setAsked(false);}} maxLength={300} rows={compact?3:2} required placeholder={t("例如：给孩子做一个分层提示的数学练习页")} /></label>
      <label>{t("这次想从哪里开始？")}<select value={mode} onChange={e=>setMode(e.target.value)}><option value="build">{t("找资源，做自己的产品")}</option><option value="learn">{t("先学怎样开发")}</option><option value="use">{t("先打开一个能用的工具")}</option><option value="adapt">{t("改造已有 repo")}</option><option value="fusion">{t("生成自己的 skill")}</option></select></label>
      <button className="builder-primary" type="submit">{t("帮我找起点")} →</button>
    </form>
    {asked&&<div className="builder-guide-answer" aria-live="polite">
      {mode==="build"?(matched.length?<><p>{t("这些场景与你的问题有重合，可以先看具体成品与开发步骤。")} </p>{matched.map(({scenario})=><Link onClick={onNavigate} key={scenario.slug} href={`/skills/scenarios/${scenario.slug}?goal=${encodeURIComponent(goal)}`}>{t(scenario.title)} →</Link>)}</>:<p>{t("暂时没有匹配的精选场景。可以搜索完整目录，再核对候选的条件。")} </p>):<p>{mode==="learn"?t("先做一个浏览器里能打开的小作品，再选择开发工具。"):mode==="use"?t("这些工具打开即可体验，可以先看看学习者会做什么。"):mode==="adapt"?t("先给出目标功能与 repo，定位实现后再决定怎么改。"):t("先写下重复任务、工作偏好和验收标准，再融合方法。")}</p>}
      <button type="button" className="builder-secondary" onClick={go}>{mode==="build"?t("搜索我的需求"):mode==="learn"?t("打开推荐课程"):mode==="use"?t("浏览可用工具"):t("查看 skill 与使用方法")} →</button>
      <small>{t("开发时可沿用你已有的 Codex、Claude Code 或 Cursor；简单网页也可以从文本编辑器与浏览器开始。")}</small>
    </div>}
  </div>;
}
export default function BuilderGuide() {
  const {t}=useLocale();
  const [open,setOpen]=useState(false);
  const trigger=useRef<HTMLButtonElement>(null);
  const panel=useRef<HTMLElement>(null);
  useEffect(()=>{
    if(!open)return;
    panel.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus();
    function escape(e:KeyboardEvent){if(e.key==="Escape"){setOpen(false);trigger.current?.focus();}}
    window.addEventListener("keydown",escape);
    return()=>window.removeEventListener("keydown",escape);
  },[open]);
  return <div className="builder-helper">
    {open&&<aside ref={panel} id="builder-helper-panel" className="builder-helper-panel" aria-label={t("构建小助手")}><header><div><small>EDU AI BUILDERS</small><h2>{t("带着问题，找一个起点。")}</h2></div><button type="button" aria-label={t("关闭小助手")} onClick={()=>{setOpen(false);trigger.current?.focus();}}>×</button></header><p>{t("按你的问题连接资源、课程和开发步骤。")}</p><BuilderGuideForm compact onNavigate={()=>setOpen(false)} /></aside>}
    <button ref={trigger} type="button" className="builder-helper-trigger" aria-expanded={open} aria-controls="builder-helper-panel" onClick={()=>setOpen(!open)}><span aria-hidden="true">✦</span> {t("构建小助手")} {open?"−":"+"}</button>
  </div>;
}
