import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {TestCountsNotice} from "@/components/test-counts-notice";
import {parseTestCounts} from "@/lib/headline-test-counts";
import {testState,winner,chanceBBetter,daysLeft,type Counts} from "@/lib/headline-test-rules";
import {readCounts} from "@/lib/headline-test";
import {redisPipeline,store as redis} from "./redis-stub";
import {done,is,part} from "./check";
const now=Date.UTC(2026,9,19);
const clean:Counts={va:1000,vb:1000,ca:30,cb:90,t0:now-30*86400000};
const paid:Counts={...clean,sa:30,sb:90,ra:30000,rb:90000,qa:30000000,qb:90000000};
async function main(){
 part("Malformed data cannot retire a version");
 is("a valid signup winner remains available",winner(clean),"b");
 is("a valid money winner remains available",winner(paid,"money",{now}),"b");
 for(const field of ["va","vb","ca","cb","sa","sb","ra","rb","qa","qb","t0"] as const){
  for(const value of [NaN,Infinity,-1,0.5,Number.MAX_SAFE_INTEGER+1]){
   const counts={...paid,[field]:value};
   is(field+" invalid "+String(value)+": no winner",winner(counts,"money",{now}),null);
   is(field+" invalid "+String(value)+": no displayed chance",chanceBBetter(counts),null);
   is(field+" invalid "+String(value)+": no ETA",daysLeft(counts,"money",now),null);
  }
 }
 is("NaN no longer falls through the comparison as a win",testState({...clean,ca:NaN}).state,"unavailable");
 is("more conversions than views is an inconsistent proportion",testState({...clean,cb:2000}).state,"unavailable");
 is("unsafe combined views cannot decide",winner({...clean,va:Number.MAX_SAFE_INTEGER,vb:Number.MAX_SAFE_INTEGER}),null);
 is("missing squares with paid sales cannot invent zero variance",winner({...paid,qb:undefined},"money",{now}),null);
 is("inconsistent revenue moments cannot decide",winner({...paid,qb:1},"money",{now}),null);
 is("unavailable marker suppresses even a previously clear result",winner({...paid,unavailable:true},"money",{now}),null);
 is("invalid split configuration cannot declare a winner",winner(clean,"checkouts",{shareB:NaN}),null);
 is("a degenerate allocation cannot decide",winner(clean,"checkouts",{shareB:0}),null);
 is("invalid current time cannot waive refund maturity",winner(paid,"money",{now:NaN}),null);
 part("Database replies");
 is("empty hash is measured zero",parseTestCounts([]).unavailable,undefined);
 is("lazily written fields default to zero",parseTestCounts(["va","2"]).vb,0);
 for(const raw of [null,undefined,"unreadable",{error:"provider failed"},["error","provider failed"],["va"],["va","100","va","200"],["va",""],["va","Infinity"],["va",-1],["va",true],["va",Number.MAX_SAFE_INTEGER+1]]){
  is("malformed reply "+JSON.stringify(raw)+" stays unavailable",parseTestCounts(raw).unavailable,true);
 }
 is("numeric object reply remains supported",parseTestCounts({va:2,vb:"3"}).vb,3);
 await redisPipeline([["HSET","nl:ab:synthetic:product:badtest","va","NaN"]]);
 is("invalid database value is not silently zero", (await readCounts("synthetic","product","badtest")).unavailable,true);
 const original=redis.pipeline;
 redis.pipeline=()=>{throw new Error("synthetic unavailable");};
 try {is("read outage stays unavailable",(await readCounts("synthetic","product","badtest")).unavailable,true);}
 finally {redis.pipeline=original;}
 is("empty actual hash remains a new test",(await readCounts("synthetic","product","newtest")).unavailable,undefined);
 const failed=renderToStaticMarkup(createElement(TestCountsNotice));
 is("failure has a visible accessible status",failed.includes('role="status"')&&failed.includes("No winner is selected from this reading"),true);
 is("failure does not show a zero tally",failed.includes("0 views"),false);
 is("loading has a distinct status",renderToStaticMarkup(createElement(TestCountsNotice,{loading:true})).includes("Loading test counts"),true);
 done();
}
main().catch(error=>{console.error(error);process.exit(1)});
