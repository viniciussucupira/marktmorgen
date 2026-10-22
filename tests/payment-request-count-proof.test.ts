import { openCount, settleStoreList } from "@/lib/payment-request-store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
async function main() {
 const original=redis.pipeline;
 const sid="synthetic-count-store";
 let calls:(string|number)[][]=[];
 part("Unverified counts never establish zero or remove sweep coverage");
 for (const reply of [null,[],[0],[0,null],[0,undefined],[0,"0"],[0,false],[0,-1],[0,0.5],[null,0],[0,0,0]]) {
  calls=[];redis.pipeline=async commands=>{calls.push(...commands);return reply as unknown[];};
  let refused=false;try { await openCount(sid); } catch { refused=true; }
  is("unknown count refused",refused,true);
  await settleStoreList(sid);
  is("unknown count preserves store membership",calls.some(c=>c[0]==="SREM"),false);
 }
 for (const count of [0,1,200]) {
  calls=[];redis.pipeline=async commands=>{calls.push(...commands);return commands[0]?.[0]==="SREM"?[1]:[0,count];};
  is("verified count preserved",await openCount(sid),count);
  await settleStoreList(sid);
  is("only verified zero settles store membership",calls.some(c=>c[0]==="SREM"),count===0);
 }
 let refused=false;try { await openCount(""); } catch { refused=true; }
 is("missing identity is not a zero count",refused,true);
 redis.pipeline=original;
 done();
}
main().catch(error=>{console.error(error);process.exitCode=1;});
