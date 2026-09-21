import {getI18n} from "@/app/i18n/server";
import Localize from "@/app/i18n/server-localize";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resources } from '../../content/resources';
import '../resources.css';

export function generateStaticParams() { return resources.filter(r => r.artifactPath).map(r => ({ slug: r.id })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = resources.find(r => r.id === slug);
  const {t}=await getI18n();
  return { title: t(resource?.title || '工具') };
}
export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = resources.find(r => r.id === slug && r.artifactPath);
  if (!r?.artifactPath) notFound();
  const {locale}=await getI18n();
  const artifactPath=`${r.artifactPath}?lang=${locale}`;
  return <Localize>{<main className="resource-page resource-tool" id="main-content">
    <Link className="resource-back" href="/use">← 所有工具</Link>
    <header className="resource-tool-heading"><div><span className="resource-eyebrow">USE IT / {r.availabilityLabel}</span><h1>{r.title}</h1><p>{r.description}</p></div><div className="resource-tool-actions"><a href={artifactPath} target="_blank" rel="noreferrer">独立打开 ↗</a><a href={artifactPath} download>下载 HTML ↓</a></div></header>
    <div className="resource-task"><strong>试一个任务</strong><p>{r.tryThis}</p></div>
    <p className="resource-session-note">嵌入预览不保存练习状态。需要保留作品，请使用工具的导出功能或先独立打开。</p>
    <iframe className="resource-tool-frame" title={r.title} src={artifactPath} sandbox="allow-scripts allow-downloads" />
    <div className="resource-review"><section><h2>检查你的理解</h2><p>{r.check}</p></section><section><h2>这项设计与什么有关？</h2><p>{r.relationshipNote}</p><Link className="resource-open" href={`/atlas?concept=${encodeURIComponent(r.conceptIds[0])}`}>回到 Atlas，理解或记录应用 →</Link></section></div>
    <p className="resource-provenance">来源：<a href={r.sourceHref}>{r.sourceLabel}</a>。这是已有作品的精选副本；可以运行不等于学习效果已经验证。</p>
  </main>}</Localize>;
}
