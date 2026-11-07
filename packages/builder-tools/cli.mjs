#!/usr/bin/env node
import {configuredBase,callCatalog} from "./client.mjs";
try{
  const argv=process.argv.slice(2);const command=argv[0];
  const map={search:"search_resources",get:"get_resource",brief:"export_build_brief"};
  if(!map[command])throw new Error("Usage: search|get|brief --base-url URL --args '{...}'");
  const at=argv.indexOf("--args");const args=at<0?{}:JSON.parse(argv[at+1]);
  console.log(JSON.stringify(await callCatalog(configuredBase(argv),map[command],args),null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
