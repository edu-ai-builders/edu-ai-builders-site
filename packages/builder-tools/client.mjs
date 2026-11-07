export function configuredBase(args=process.argv.slice(2)) {
  const pos=args.indexOf("--base-url");
  if(pos<0||!args[pos+1])throw new Error("Supply --base-url for the running site or local preview.");
  const base=new URL(args[pos+1]);
  if(!["http:","https:"].includes(base.protocol)||base.username||base.password||base.search||base.hash)throw new Error("Invalid catalog base URL.");
  return base;
}
export async function callCatalog(base,tool,args={}) {
  if(!args||typeof args!=="object"||Array.isArray(args))throw new Error("Arguments must be an object.");
  let url;let init={};
  if(tool==="search_resources"){
    if(args.query!==undefined&&(typeof args.query!=="string"||args.query.length>300))throw new Error("Invalid query.");
    for(const key of ["kind","audience","subject","platform","capability"])if(args[key]!==undefined&&typeof args[key]!=="string")throw new Error(`Invalid ${key}.`);
    for(const key of ["page","limit"])if(args[key]!==undefined&&(!Number.isInteger(args[key])||args[key]<1))throw new Error(`Invalid ${key}.`);
    if(args.limit!==undefined&&args.limit>50)throw new Error("Invalid limit.");
    if(args.reviewed!==undefined&&typeof args.reviewed!=="boolean")throw new Error("Invalid reviewed filter.");
    url=new URL("api/resources",base.href.endsWith("/")?base:new URL(base.href+"/"));
    for(const key of ["query","kind","audience","subject","platform","capability","page","limit","reviewed"])if(args[key]!==undefined)url.searchParams.set(key==="query"?"q":key,String(args[key]));
  }else if(tool==="get_resource"){
    if(typeof args.id!=="string"||!args.id||args.id.length>500)throw new Error("Supply a resource id.");
    url=new URL("api/resources",base.href.endsWith("/")?base:new URL(base.href+"/"));url.searchParams.set("id",args.id);
  }else if(tool==="export_build_brief"){
    if(!["family-math","science-evidence","research-workflow"].includes(args.scenario))throw new Error("Unknown scenario.");
    if(args.goal!==undefined&&(typeof args.goal!=="string"||args.goal.length>2000))throw new Error("Invalid goal.");
    if(args.platform!==undefined&&!["web","mobile","desktop"].includes(args.platform))throw new Error("Invalid platform.");
    if(args.locale!==undefined&&!["zh","en"].includes(args.locale))throw new Error("Invalid locale.");
    if(args.commercial!==undefined&&typeof args.commercial!=="boolean")throw new Error("Invalid commercial flag.");
    url=new URL("api/build-brief",base.href.endsWith("/")?base:new URL(base.href+"/"));init={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(args)};
  }else throw new Error("Unknown tool.");
  const response=await fetch(url,{...init,signal:AbortSignal.timeout(15000),redirect:"error"});
  if(!response.ok)throw new Error(`Catalog returned HTTP ${response.status}.`);
  return response.json();
}
