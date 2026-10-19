import {claimHandle,ensureStatsId} from "@/lib/store";
import {pathIntroHash,type PathRecord} from "@/lib/path";
import {localDay} from "@/lib/path-rules";
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

 part("One welcoming return step uses the existing reserved reminder channel");
 const welcome={...record,returnStep:{day:"2026-10-19",introHash:pathIntroHash(store.bio)},money:{...record.money!,real:1,cents:1900}};
 let returnBody="";
 is("return is available after a real sale",await sendPathReminder(store,now,{...services,read:async()=>welcome,push:async alert=>{returnBody=alert.body;return 1;}}),{ok:true,devices:1});
 is("return wording is welcoming",returnBody.includes("Welcome back."),true);
 is("no absence pressure in return reminder",/missed|behind|failed|lost days/i.test(returnBody),false);
 for(const [zone,morning,early,night,last] of [
 ["America/Los_Angeles","2026-10-19T15:00Z","2026-10-19T14:59Z","2026-10-20T04:00Z","2026-10-20T03:59:49Z"],
 ["America/New_York","2026-10-19T12:00Z","2026-10-19T11:59Z","2026-10-20T01:00Z","2026-10-20T00:59:49Z"],
 ["Europe/London","2026-10-19T07:00Z","2026-10-19T06:59Z","2026-10-19T20:00Z","2026-10-19T19:59:49Z"],
 ["Europe/Berlin","2026-10-19T06:00Z","2026-10-19T05:59Z","2026-10-19T19:00Z","2026-10-19T18:59:49Z"],
 ["Australia/Sydney","2026-10-18T21:00Z","2026-10-18T20:59Z","2026-10-19T10:00Z","2026-10-19T09:59:49Z"]]){
  for(const [stamp,allowed] of [[morning,true],[early,false],[night,false],[last,true],[new Date(Date.parse(last)+1000).toISOString(),false]] as const){
   const at=Date.parse(stamp);let sent=0,reserved=0;
   const fixture={...welcome,answers:{...welcome.answers,timeZone:zone},returnStep:{...welcome.returnStep,day:localDay(zone,at)},money:{...welcome.money,at},counts:{...welcome.counts!,at}};
   const result=await sendPathReminder(store,at,{read:async()=>fixture,reserve:async units=>{reserved++;is("same bounded reservation",units,PATH_REMINDER_UNITS);return true;},push:async()=>{sent++;return 1;}});
   is(zone+" quiet admission "+stamp,result.ok,allowed);
   is(zone+" no unadmitted dispatch "+stamp,sent,allowed?1:0);
   is(zone+" no quiet reservation "+stamp,reserved,allowed?1:0);
  }
 }
 done();
}
main().catch(error=>{console.error(error);process.exit(1);});
