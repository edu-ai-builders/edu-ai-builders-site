import { builderCatalog } from "@/app/lib/builder-catalog";
import { builderScenarios } from "@/app/content/builder-scenarios";
import { exportBrief } from "@/app/lib/builder-core";
import { translateData, createTranslator } from "@/app/i18n/core";
import messages from "@/app/i18n/builder.en.json";
export async function POST(request:Request) {
  const text=await request.text();
  if(text.length>8000)return Response.json({error:"Request too large"},{status:413});
  let body;
  try {body=JSON.parse(text);} catch {return Response.json({error:"Invalid JSON"},{status:400});}
  if(!body || typeof body!=="object" || Array.isArray(body) || typeof body.scenario!=="string" || (body.goal!==undefined && (typeof body.goal!=="string"||body.goal.length>2000)) || (body.platform!==undefined && !["web","mobile","desktop"].includes(body.platform)) || (body.locale!==undefined && !["zh","en"].includes(body.locale)) || (body.commercial!==undefined && typeof body.commercial!=="boolean")) return Response.json({error:"Invalid brief options"},{status:400});
  const scenario=builderScenarios.find(s=>s.slug===body.scenario);
  if(!scenario)return Response.json({error:"Unknown scenario"},{status:404});
  const locale=body.locale==="en"?"en":"zh";
  const localized=translateData(scenario,createTranslator(locale,messages));
  return Response.json({...exportBrief(localized,builderCatalog.records,{goal:body.goal||"",platform:body.platform||"web",commercial:body.commercial!==false,locale}),snapshot:builderCatalog.generated_at},{headers:{"Cache-Control":"no-store"}});
}
