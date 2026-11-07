import { notFound } from "next/navigation";
import { builderScenarios } from "@/app/content/builder-scenarios";
import { builderCatalog } from "@/app/lib/builder-catalog";
import { courses } from "@/app/content/courses";
import ScenarioClient from "../../scenario-client";
import { getI18n } from "@/app/i18n/server";
import { withSeo } from "@/app/seo/metadata";
import "../../styles.css";
type Props={params:Promise<{slug:string}>;searchParams:Promise<{goal?:string;platform?:string;commercial?:string}>};
export default async function ScenarioPage({params,searchParams}:Props){
  const {slug}=await params;const scenario=builderScenarios.find(s=>s.slug===slug);if(!scenario)notFound();
  const {goal,platform,commercial}=await searchParams;
  return <ScenarioClient scenario={scenario} initialPlatform={typeof platform==="string"&&["web","mobile","desktop"].includes(platform)?platform:"web"} initialCommercial={commercial!=="false"} initialGoal={typeof goal==="string"?goal.slice(0,2000):""} resources={builderCatalog.records.filter(r=>scenario.resourceIds.includes(r.resource_id))} courses={courses.filter(c=>scenario.courses.includes(c.slug)).map(c=>({slug:c.slug,title:c.title,first:c.lessons[0].id}))} snapshot={builderCatalog.generated_at}/>;
}
export async function generateMetadata({params}:Props){const {slug}=await params;const s=builderScenarios.find(s=>s.slug===slug);const {t,locale}=await getI18n();return withSeo({title:s?t(s.title):"Scenario",description:s?t(s.summary):undefined},`/skills/scenarios/${slug}`,locale);}
