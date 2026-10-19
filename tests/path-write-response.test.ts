import {readPathWriteReply} from "@/lib/path-write-response";
import {is,done} from "./check";
is("explicit acknowledgement",readPathWriteReply(200,{ok:true}),{state:"saved",message:""});
for(const status of [0,199,302,400,403,409,429,500,503,200.5]){
 is("contradictory success "+status,readPathWriteReply(status,{ok:true}).state,"uncertain");
}
for(const error of ["invalid","full","conflict","role"]){
 is("known pre-write refusal "+error,readPathWriteReply(409,{ok:false,error}).state,"refused");
 is("server failure is not a confirmed refusal "+error,readPathWriteReply(503,{ok:false,error}).state,"uncertain");
}
for(const body of [null,[],{},true,{ok:"true"},{ok:false,error:"constructor"},{ok:false,error:"__proto__"},Object.create({ok:true})]){
 is("unconfirmed body",readPathWriteReply(200,body).state,"uncertain");
}
is("unavailable may follow write",readPathWriteReply(503,{ok:false,error:"unavailable"}).state,"uncertain");
is("reply text is never trusted",readPathWriteReply(400,{ok:false,error:"invalid",message:"Saved!"}).message.includes("Saved!"),false);
done();
