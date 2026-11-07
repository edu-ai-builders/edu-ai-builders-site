import { builderCatalog, builderFamilies } from "@/app/lib/builder-catalog";
import { searchResources } from "@/app/lib/builder-core";
export function GET(request: Request) {
  const p=new URL(request.url).searchParams;
  if (p.has("id")) {
    const record=builderCatalog.records.find(r=>r.resource_id===p.get("id"));
    return record?Response.json({record,snapshot:builderCatalog.generated_at}):Response.json({error:"Resource not found"},{status:404});
  }
  for(const key of ["page","limit"]) if(p.has(key)&&(!/^\d+$/.test(p.get(key)!)||Number(p.get(key))<1)) return Response.json({error:`Invalid ${key}`},{status:400});
  if((p.get("q")||"").length>300) return Response.json({error:"Query exceeds 300 characters"},{status:400});
  const result=searchResources(builderCatalog.records,builderFamilies,{query:p.get("q")||"",kind:p.get("kind")||"",audience:p.get("audience")||"",subject:p.get("subject")||"",platform:p.get("platform")||"",capability:p.get("capability")||"",reviewed:p.get("reviewed")==="true",page:Number(p.get("page")||1),limit:Number(p.get("limit")||12)});
  return Response.json({...result,snapshot:builderCatalog.generated_at,catalogCount:builderCatalog.count},{headers:{"Cache-Control":"public, max-age=60, stale-while-revalidate=300"}});
}
