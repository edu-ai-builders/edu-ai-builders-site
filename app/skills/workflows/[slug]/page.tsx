import Link from "next/link";
import { notFound } from "next/navigation";
import { builderSkills, builderScopes } from "@/app/content/builder-scenarios";
import Localize from "@/app/i18n/server-localize";
import { getI18n } from "@/app/i18n/server";
import { withSeo } from "@/app/seo/metadata";
import "../../styles.css";
type Props={params:Promise<{slug:string}>};
export default async function WorkflowPage({params}:Props){
  const {slug}=await params;const skill=builderSkills.find(s=>s.name===slug);const scope=builderScopes.find(s=>s.name===slug);if(!skill||!scope)notFound();
  return <Localize><main className="builder-page builder-detail"><Link className="builder-back" href="/directory#workflows">← Skills 与构建资源</Link><header className="builder-detail-hero"><p className="builder-eyebrow">{skill.name} · MIT · v{skill.version}</p><h1>{skill.title}</h1><p>{skill.purpose}</p><div className="builder-actions"><a className="builder-primary" href={`/downloads/skills/${skill.name}.zip`} download>下载 skill 包 ↓</a><a className="builder-secondary" href={`/downloads/scopes/${skill.name}.md`} download>下载完整 scope ↓</a></div></header><div className="builder-detail-layout"><div><section><h2>你提供什么</h2><ul className="builder-acceptance">{scope.inputs.map(s=><li key={s}>{s}</li>)}</ul></section><section><h2>你会拿到什么</h2><ul className="builder-acceptance">{scope.outputs.map(s=><li key={s}>{s}</li>)}</ul></section><section><h2>用哪些任务验收</h2><ul className="builder-acceptance">{scope.acceptance.map(s=><li key={s}>{s}</li>)}</ul></section></div><aside className="builder-next"><h2>怎样开始使用</h2><p>解压后，将这个 skill 文件夹加入你的 coding agent 支持的 skill 目录；按下面的示例提出任务。包内保留 SKILL.md、参考资料与许可。</p><blockquote>{scope.prompt}</blockquote><p>具体安装目录以你当前使用的 agent 为准。下载不会自动安装，也不包含第三方 repo 或付费 skill 的正文。</p>{scope.example&&<a href={scope.example} download>拿走一个输出示例 ↓</a>}<Link href="/learn/refactor-with-ai">学习怎样分步改造与验收 →</Link><Link href="/directory#scenarios">从具体场景开始 →</Link></aside></div><p className="builder-note">下载包已经过结构与本地样例检查。Repo Adapter 与 Skill Fusion 完成了有限独立任务验证；不同平台的触发、应用改造和学习效果仍需另行测试。</p></main></Localize>;
}
export async function generateMetadata({params}:Props){const {slug}=await params;const s=builderSkills.find(s=>s.name===slug);const {t,locale}=await getI18n();return withSeo({title:s?t(s.title):"Skill",description:s?t(s.purpose):undefined},`/skills/workflows/${slug}`,locale);}
