"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocale } from "../../i18n/localize";
import { downloadText } from "../../lib/builder-download";
import "../styles.css";
export default function ContributePage(){
  const {t}=useLocale();const [kind,setKind]=useState("skill");const [title,setTitle]=useState("");const [source,setSource]=useState("");const [goal,setGoal]=useState("");const [conditions,setConditions]=useState("");const [example,setExample]=useState("");const [error,setError]=useState("");
  function draft(){
    if(source&&!/^https:\/\//.test(source)){setError(t("来源地址请使用 HTTPS 链接。"));return;}
    setError("");const md=[`# ${title}`,"",`Type: ${kind}`,`Source: ${source||"not supplied"}`,"",`## ${t("解决什么问题")}`,goal,"",`## ${t("使用条件、版本与维护责任")}`,conditions,"",`## ${t("输入、输出与验收样例")}`,example,"",t("此文件是待提交草稿，尚未进入目录审核。")].join("\n");downloadText("edu-builder-contribution.md",md);
  }
  return <main className="builder-page builder-form-page"><Link className="builder-back" href="/directory">← {t("Skills 与构建资源")}</Link><header className="builder-detail-hero"><h1>{t("把贡献写成能检查的说明。")}</h1><p>{t("提交 skill、资源线索或一个未被满足的需求。先保存说明，再通过项目的 GitHub 提交；这里不会自动发送。")}</p></header><form className="builder-contribution-form" onSubmit={e=>{e.preventDefault();draft();}}><label>{t("贡献类型")}<select value={kind} onChange={e=>setKind(e.target.value)}><option value="skill">Skill</option><option value="resource">{t("资源线索")}</option><option value="request">{t("Skill 需求")}</option></select></label><label>{t("标题")}<input required value={title} maxLength={120} onChange={e=>setTitle(e.target.value)}/></label><label>{t("公开来源地址（可选）")}<input type="url" value={source} maxLength={1000} onChange={e=>setSource(e.target.value)}/></label><label>{t("解决什么问题")}<textarea required rows={3} maxLength={2000} value={goal} onChange={e=>setGoal(e.target.value)}/></label><label>{t("使用条件、版本与维护责任")}<textarea required rows={3} maxLength={2000} value={conditions} onChange={e=>setConditions(e.target.value)}/></label><label>{t("输入、输出与验收样例")}<textarea required rows={3} maxLength={3000} value={example} onChange={e=>setExample(e.target.value)}/></label><p role="status">{error}</p><div className="builder-actions"><button type="submit" className="builder-primary">{t("下载投稿草稿")}</button><a className="builder-secondary" href="https://github.com/edu-ai-builders/edu-ai-builders-site/issues" target="_blank" rel="noreferrer">{t("去 GitHub 提交")} ↗</a></div><p className="builder-note">{t("草稿不会自动上传。市场支付、分成与付费订阅尚未开通。")}</p></form></main>;
}
