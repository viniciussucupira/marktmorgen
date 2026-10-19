import {readPathBoardReply} from "@/lib/path-board-response";
import {is,done} from "./check";
is("explicit acknowledgement",readPathBoardReply(200,{ok:true}),{state:"saved",message:""});
for(const status of [0,199,302,400,403,409,429,500,503,200.5])is("contradictory acknowledgement "+status,readPathBoardReply(status,{ok:true}).state,"uncertain");
for(const error of ["stale","full","conflict","allowance","consent","role"]){
 is("known refusal "+error,readPathBoardReply(409,{ok:false,error}).state,"refused");
 is("server failure may follow write "+error,readPathBoardReply(503,{ok:false,error}).state,"uncertain");
}
for(const body of [null,[],{},true,{ok:"true"},{ok:false,error:"constructor"},{ok:false,error:"__proto__"},Object.create({ok:true})])is("unknown reply",readPathBoardReply(200,body).state,"uncertain");
is("unavailable is uncertain",readPathBoardReply(409,{ok:false,error:"unavailable"}).state,"uncertain");
is("untrusted text excluded",readPathBoardReply(409,{ok:false,error:"full",message:"Removed!"}).message.includes("Removed!"),false);
done();
