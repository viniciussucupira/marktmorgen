import {createRequire} from "node:module";
import {resolve} from "node:path";
const require=createRequire(resolve("package.json")),engine=process.env.E2E_BROWSER;
if(!["chromium","firefox","webkit"].includes(engine))throw Error("Unsupported diagnostic engine");
const browser=await require("playwright-core")[engine].launch();
try{
 for(const config of [
  {name:"context-dark",options:{colorScheme:"dark"}},
  {name:"context-dark-with-modes",options:{colorScheme:"dark",reducedMotion:"no-preference",forcedColors:"none"}},
  {name:"default-context",options:{}}
 ]){
  const context=await browser.newContext(config.options);
  try{
   const page=await context.newPage();
   const read=()=>page.evaluate(()=>({dark:matchMedia("(prefers-color-scheme: dark)").matches,light:matchMedia("(prefers-color-scheme: light)").matches,forced:matchMedia("(forced-colors: active)").matches,reduced:matchMedia("(prefers-reduced-motion: reduce)").matches,userAgent:navigator.userAgent}));
   console.log("AX2_MEDIA_DIAGNOSTIC:"+JSON.stringify({engine,version:browser.version(),config:config.name,stage:"initial",actual:await read()}));
   await page.emulateMedia({colorScheme:"dark"});
   console.log("AX2_MEDIA_DIAGNOSTIC:"+JSON.stringify({engine,config:config.name,stage:"page-dark",actual:await read()}));
   await page.goto("data:text/html,<title>Synthetic media diagnostic</title><h1>Media diagnostic</h1>");
   console.log("AX2_MEDIA_DIAGNOSTIC:"+JSON.stringify({engine,config:config.name,stage:"after-navigation",actual:await read()}));
   await page.emulateMedia({colorScheme:"dark",forcedColors:null,reducedMotion:null});
   console.log("AX2_MEDIA_DIAGNOSTIC:"+JSON.stringify({engine,config:config.name,stage:"reset-other-overrides",actual:await read()}));
  }finally{await context.close();}
 }
}finally{await browser.close();}
