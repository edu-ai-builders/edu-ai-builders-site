"use client";
import { useMemo,useState,useSyncExternalStore } from "react";
import Link from "next/link";
import { useLocale } from "../../i18n/localize";
import { downloadText } from "../../lib/builder-download";
import type { BuilderResource } from "../../lib/builder-core";
import "../styles.css";
import { readSavedProjects, type SavedProject as Project } from "../../lib/builder-projects";
function subscribe(onChange:()=>void){
  window.addEventListener("storage",onChange);
  window.addEventListener("edu-builder-projects",onChange);
  return ()=>{window.removeEventListener("storage",onChange);window.removeEventListener("edu-builder-projects",onChange);};
}
function snapshot(){try{return localStorage.getItem("edu-builder-projects-v1")||"[]";}catch{return "[]";}}
export default function ProjectsPage(){
  const {t}=useLocale();const raw=useSyncExternalStore(subscribe,snapshot,()=>null);
  const projects=useMemo(()=>readSavedProjects(raw),[raw]);const loaded=raw!==null;
  const [checks,setChecks]=useState<Record<string,string>>({});
  function remove(id:string){const next=projects.filter(p=>p.id!==id);try{localStorage.setItem("edu-builder-projects-v1",JSON.stringify(next));window.dispatchEvent(new Event("edu-builder-projects"));}catch{setChecks(c=>({...c,[id]:t("浏览器未能保存，请下载计划保留副本。")}));}}
  async function check(project:Project){setChecks(c=>({...c,[project.id]:t("正在复查…")}));try{const results=await Promise.all(project.resources.map(async old=>{const res=await fetch(`/api/resources?id=${encodeURIComponent(old.id)}`);if(!res.ok)return true;const {record:r}=await res.json() as {record:BuilderResource};return r.pinned_commit!==old.commit||r.reuse_status!==old.reuse||JSON.stringify(r.license_scopes)!==old.license;}));setChecks(c=>({...c,[project.id]:results.some(Boolean)?t("来源版本或使用条件有变化，请重新检查方案。"):t("当前目录中版本与使用条件未变化；运行状态仍需你验证。")}));}catch{setChecks(c=>({...c,[project.id]:t("未能完成复查，保留原来的方案与日期。")}));}}
  return <main className="builder-page"><Link className="builder-back" href="/directory">← {t("Skills 与构建资源")}</Link><header className="builder-detail-hero"><h1>{t("我的方案")}</h1><p>{t("保存在这台浏览器。复查当前目录里的来源版本和使用条件，再决定是否需要更新。")}</p></header>{loaded&&projects.length===0?<div className="builder-empty"><p>{t("还没有保存的方案。先选一个场景，生成自己的开发计划。")}</p><Link href="/directory#scenarios">{t("看看能做什么")} →</Link></div>:projects.map(p=><article key={p.id} className="builder-role-card"><small>{p.savedAt.slice(0,10)}</small><h2>{p.title}</h2><div className="builder-actions"><button type="button" className="builder-primary" onClick={()=>check(p)}>{t("复查来源变化")}</button><button type="button" className="builder-secondary" onClick={()=>downloadText(`${p.scenario}-build-brief.md`,p.markdown)}>{t("下载开发计划")}</button><Link href={`/skills/scenarios/${p.scenario}${p.options?`?${new URLSearchParams({goal:p.options.goal,platform:p.options.platform,commercial:String(p.options.commercial)})}`:""}`}>{t("重新生成")}</Link><button type="button" className="builder-text-button" onClick={()=>remove(p.id)}>{t("删除本地方案")}</button></div><p role="status">{checks[p.id]}</p></article>)}<p className="builder-note">{t("持续维护订阅仍在验证阶段。当前没有收费或跨设备账号，保存与复查可以直接使用。")}</p></main>;
}
