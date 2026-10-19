import {claimHandle,ensureStatsId} from "@/lib/store";
import type {PathRecord} from "@/lib/path";
import {sendPathReminder} from "@/lib/path-reminder";
import {PATH_REMINDER_UNITS} from "@/lib/path-reminder-rules";
import {done,is,part} from "./check";
async function main(){
 const owner="reminder@example.com";await claimHandle(owner,"pathreminder","A store","");
 const store=(await ensureStatsId(owner))!;
 const now=Date.UTC(2026,9,19,12);
 const record:PathRecord={answers:{goalCents:0,goalCurrency:"usd",skills:"baking",subject:"bread",minutes:15,audience:"none",timeZone:"UTC"},startedAt:now,checkins:[],best:-1,bestAt:0,money:{at:now,test:false,real:0,cents:0,currency:store.currency},counts:{at:now,social:0,visitors:0,links:0,leads:0}};
 const order:string[]=[];let pushed=0;
 const services={read:async()=>record,reserve:async(units:number)=>{is("reserved units",units,PATH_REMINDER_UNITS);order.push("reserve");return true;},push:async(alert:{title:string;body:string;url:string},day:string,timeZone:string)=>{order.push("push");pushed++;is("same-store link",alert.url,"/studio/path?store="+store.sid);is("day seed",day,"2026-10-19");is("local time zone",timeZone,"UTC");is("no personal goal in lock-screen message",alert.body.includes("$"),false);return 2;}};
 part("Admission precedes any device dispatch");
 is("requested",await sendPathReminder(store,now,services),{ok:true,devices:2});is("in order",order,["reserve","push"]);
 part("Every refusal sends nothing");
 const before=pushed;
 is("no allowance",await sendPathReminder(store,now,{...services,reserve:async()=>false}),{ok:false,reason:"allowance"});
 is("quiet",await sendPathReminder(store,Date.UTC(2026,9,19,22),services),{ok:false,reason:"quiet"});
 is("stale",await sendPathReminder(store,now+11*60_000,services),{ok:false,reason:"stale"});
 is("not begun",await sendPathReminder(store,now,{...services,read:async()=>null}),{ok:false,reason:"not-started"});
 is("store read failed",await sendPathReminder(store,now,{...services,read:async()=>{throw Error("offline");}}),{ok:false,reason:"unavailable"});
 is("sale leaves no next mission",await sendPathReminder(store,now,{...services,read:async()=>({...record,money:{...record.money!,real:1,cents:1900}})}),{ok:false,reason:"complete"});
 is("no push for any refusal",pushed,before);
 is("reminders never alter check-in days",record.checkins,[]);
 done();
}
main().catch(error=>{console.error(error);process.exit(1);});
