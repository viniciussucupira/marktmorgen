import {readPathReminderReply} from "@/lib/path-reminder-response";
import {is,part,done} from "./check";
part("Only a successful transport with an integer confirmed count reports a request");
is("two accepted device requests",readPathReminderReply(200,{ok:true,devices:2}),{state:"requested",message:"Reminder requested for 2 of your devices."});
is("zero is not a claim that nothing was sent",readPathReminderReply(200,{ok:true,devices:0}).state,"unchanged");
for(const devices of [-1,1.5,"2",null,undefined,Infinity,NaN,Number.MAX_SAFE_INTEGER+1]){
 is("unusable count "+String(devices),readPathReminderReply(200,{ok:true,devices}).state,"uncertain");
}
part("Refusals are recognised only before dispatch");
for(const [reason,status] of [["not-started",409],["quiet",409],["stale",409],["complete",409],["allowance",429]] as const){
 is("known refusal:"+reason,readPathReminderReply(status,{ok:false,reason}).state,"refused");
}
part("Contradictions and dispatch uncertainty cannot be presented as success or a safe retry");
for(const status of [0,199,302,304,400,403,409,429,500,503,599,600,200.5]){
 is("contradictory success status:"+status,readPathReminderReply(status,{ok:true,devices:2}).state,"uncertain");
}
for(const body of [null,[],{},true,"ok",{ok:true},{ok:"true",devices:2},{ok:false,reason:"constructor"},{ok:false,reason:"__proto__"},Object.create({ok:true,devices:2})]){
 is("unconfirmed body",readPathReminderReply(200,body).state,"uncertain");
}
for(const status of [200,409,500,503]){
 is("unavailable may follow dispatch:"+status,readPathReminderReply(status,{ok:false,reason:"unavailable"}).state,"uncertain");
}
is("untrusted reply message is not displayed",readPathReminderReply(503,{ok:true,devices:2,message:"Delivered to everyone"}).message.includes("Delivered"),false);
done();
