import {NextRequest} from "next/server";
import {GET} from "@/app/api/cron/reminders/route";
import {store as redis} from "./redis-stub";
import {calls} from "./plan-break-off-cron-world";
import {done,is,part} from "./check";
process.env.STRIPE_SECRET_KEY="sk_test_off_cron_only";
async function main(){
 part("Actual reminder route skips disabled break work and retains ordinary reminder passes");
 const pipeline=redis.pipeline;let pauseReads=0;
 redis.pipeline=async commands=>{
  pauseReads+=commands.filter(c=>String(c[1]).includes("nl:pause")||String(c[1]).includes("pause-due")).length;
  if(commands.some(c=>c[0]==="EVAL"))throw Error("Disabled break worker must not run");
  return pipeline(commands);
 };
 let response:Response;try{response=await GET(new NextRequest("https://local.example/api/cron/reminders"));}finally{redis.pipeline=pipeline;}
 is("actual cron response",response.status,200);
 const body=await response.json();
 is("no pause effects",body.breaks,{told:0,restarted:0,failed:0,dropped:0});
 is("no pause records read",pauseReads,0);
 is("ordinary passes still invoked",calls,["renewal","failed","trial","requests"]);
 done();
}
main().catch(e=>{console.error(e);process.exit(1);});
