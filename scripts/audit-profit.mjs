import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
// Read-only: never reads credentials or changes prices, entitlements or billing.
const input=process.argv[2];
if(!input){console.error("Usage: node scripts/audit-profit.mjs <portfolio.json>");process.exitCode=2;}
else {
  try {
    const raw=JSON.parse(await readFile(input,"utf8"));
    const compiled=await build({entryPoints:[fileURLToPath(new URL("../lib/profit-policy.ts",import.meta.url))],bundle:true,write:false,platform:"node",format:"esm",target:"node20"});
    const {assessProfitPortfolio}=await import("data:text/javascript;base64,"+Buffer.from(compiled.outputFiles[0].text).toString("base64"));
    const result=assessProfitPortfolio(raw);
    console.log(JSON.stringify(result,null,2));
    process.exitCode=result.meetsPolicy?0:1;
  }catch{console.error("Assessment unavailable: input must be valid JSON and the policy must compile.");process.exitCode=2;}
}
