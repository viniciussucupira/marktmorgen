import {withinEssentialLimit,withinLimit} from "@/lib/request-guard";
import {store} from "./redis-stub";
import {countStudio} from "@/lib/studio-route";
import type {Store} from "@/lib/store";
import {done,is,part} from "./check";
async function main(){
 part("Essential allowance requires its own finite committed acknowledgement");
 const pipeline=store.pipeline;
 const bad:unknown[]=[[],[null],[null,1,0],[null,"1"],[null,0],[null,-1],[null,1.5],[null,NaN],[null,Infinity],["unknown",1]];
 const inherited:unknown[]=new Array(2);Object.setPrototypeOf(inherited,{0:null,1:1});bad.push(inherited);
 let getters=0;const accessor:unknown[]=[null,1];Object.defineProperty(accessor,"1",{get(){getters++;return 1;}});bad.push(accessor);
 for(let index=0;index<bad.length;index++){
  let operations=0,key="";
  store.pipeline=async commands=>{operations++;key=String(commands[0][1]);await pipeline(commands);return bad[index] as never;};
  try{is("unknown committed allowance refuses "+index,await withinEssentialLimit("essential-test","bad"+index,10,86400),false);}
  finally{store.pipeline=pipeline;}
  is("no retry or readback "+index,operations,1);
  is("the committed count stays consumed "+index,await pipeline([["GET",key]]),["1"]);
 }
 is("computed count never executes",getters,0);
 store.pipeline=async()=>{throw Error("synthetic unavailable");};
 try{
  is("essential failure refuses",await withinEssentialLimit("essential-test","down",10,86400),false);
  is("ordinary public guard behavior remains",await withinLimit("public-test","down",10,86400),true);
 }finally{store.pipeline=pipeline;}
 for(let n=1;n<=11;n++)is("only first ten confirmed increments pass "+n,await withinEssentialLimit("essential-test","positive",10,86400),n<=10);
 for(const limit of [0,-1,NaN,Infinity,1.5])is("invalid limit refuses",await withinEssentialLimit("essential-test","invalid",limit,86400),false);
 const synthetic={sid:"a".repeat(32),handle:"essentialfixture"} as Store;
 let calls=0;
 store.pipeline=async commands=>{calls++;await pipeline(commands);return [];};
 try{is("actual essential studio admission refuses lost ACK",(await countStudio(synthetic,"billing")).ok,false);}
 finally{store.pipeline=pipeline;}
 is("actual essential admission never retries",calls,1);
 is("actual essential studio admission accepts next confirmed count",(await countStudio(synthetic,"billing")).ok,true);
 done();
}
main().catch(e=>{console.error(e);process.exit(1);});
