#!/usr/bin/env node
import {createInterface} from "node:readline";
import {configuredBase,callCatalog} from "./client.mjs";
const tools=[
  {name:"search_resources",description:"Search education resource metadata with source/version evidence. Facets are discovery hints.",inputSchema:{type:"object",properties:{query:{type:"string",maxLength:300},kind:{type:"string"},audience:{type:"string"},subject:{type:"string"},platform:{type:"string"},capability:{type:"string"},reviewed:{type:"boolean"},page:{type:"integer",minimum:1},limit:{type:"integer",minimum:1,maximum:50}},additionalProperties:false}},
  {name:"get_resource",description:"Read one resource's source metadata and observed conditions.",inputSchema:{type:"object",properties:{id:{type:"string",minLength:1,maxLength:500}},required:["id"],additionalProperties:false}},
  {name:"export_build_brief",description:"Return a scenario-template build brief for the caller to review and save. It does not execute or install resources.",inputSchema:{type:"object",properties:{scenario:{type:"string",enum:["family-math","science-evidence","research-workflow"]},goal:{type:"string",maxLength:2000},platform:{type:"string",enum:["web","mobile","desktop"]},commercial:{type:"boolean"},locale:{type:"string",enum:["zh","en"]}},required:["scenario"],additionalProperties:false}}
].map(tool=>({...tool,annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:true}}));
let base;try{base=configuredBase();}catch(error){console.error(error.message);process.exit(1);}
const input=createInterface({input:process.stdin,crlfDelay:Infinity});
for await(const line of input){
  let request;
  try{if(line.length>16000)throw Error();request=JSON.parse(line);}catch{process.stdout.write(JSON.stringify({jsonrpc:"2.0",id:null,error:{code:-32700,message:"Parse error"}})+"\n");continue;}
  if(!request||request.jsonrpc!=="2.0"||typeof request.method!=="string"){process.stdout.write(JSON.stringify({jsonrpc:"2.0",id:request?.id??null,error:{code:-32600,message:"Invalid request"}})+"\n");continue;}
  if(request.id===undefined)continue;
  let result;let error;
  if(request.method==="initialize")result={protocolVersion:["2025-06-18","2025-03-26","2024-11-05"].includes(request.params?.protocolVersion)?request.params.protocolVersion:"2025-06-18",capabilities:{tools:{}},serverInfo:{name:"edu-builder-catalog",version:"0.1.0"}};
  else if(request.method==="ping")result={};
  else if(request.method==="tools/list")result={tools};
  else if(request.method==="tools/call"){
    const tool=tools.find(t=>t.name===request.params?.name);const args=request.params?.arguments||{};
    if(!tool||!args||typeof args!=="object"||Array.isArray(args)||Object.keys(args).some(key=>!Object.hasOwn(tool.inputSchema.properties,key)))error={code:-32602,message:"Invalid tool or arguments"};
    else try{const value=await callCatalog(base,tool.name,args);result={content:[{type:"text",text:JSON.stringify(value)}],structuredContent:value,isError:false};}catch(e){result={content:[{type:"text",text:e.message}],isError:true};}
  }else error={code:-32601,message:"Method not found"};
  process.stdout.write(JSON.stringify({jsonrpc:"2.0",id:request.id,...(error?{error}:{result})})+"\n");
}
