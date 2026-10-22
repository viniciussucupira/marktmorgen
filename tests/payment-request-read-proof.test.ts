import { listRequests } from "@/lib/payment-request-store";
import { type Store } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done,is,part } from "./check";
const store={sid:"synthetic-request-store",tier:"creator"} as Store;
const id="a".repeat(32),other="b".repeat(32);
async function main(){
 const original=redis.pipeline;
 let calls:(string|number)[][]=[];
 const read=async(index:unknown,records?:unknown)=>{
  calls=[];
  redis.pipeline=async commands=>{calls.push(...commands);return commands[0]?.[0]==="ZREVRANGE"?index as unknown[]:records as unknown[];};
  return listRequests(store);
 };
 part("Unknown indexes never prove empty or authorize cleanup");
 for(const index of [null,[],[null],[[null]],[["bad"]],[[id,id]],[[id],[]]]){
  is("unknown index refused",await read(index),null);
  is("no destructive cleanup",calls.some(c=>c[0]==="ZREM"),false);
 }
 is("verified empty list",await read([[]]),[]);
 part("Incomplete records preserve indexes");
 for(const records of [null,[],[[]],[[undefined]],[["not JSON"]],[[JSON.stringify({id,sid:"other"})]],[[JSON.stringify({id:other,sid:store.sid})]]]){
  is("unknown record refused",await read([[id]],records),null);
  is("indexes preserved",calls.some(c=>c[0]==="ZREM"),false);
 }
 const raw=JSON.stringify({id,sid:store.sid,lines:[{text:"Synthetic work",quantity:1,cents:100}],total:100,currency:"usd",createdAt:1,expiresAt:9999999999999});
 const known=await read([[id]],[[raw]]);
 is("known own record retained",known?.[0]?.id,id);
 is("known record no cleanup",calls.some(c=>c[0]==="ZREM"),false);
 // Only exact null is positive evidence the indexed record has expired.
 calls=[];redis.pipeline=async commands=>{calls.push(...commands);if(commands[0]?.[0]==="ZREVRANGE")return[[id]];if(commands[0]?.[0]==="MGET")return[[null]];return commands.map(()=>1);};
 is("confirmed expired record absent",await listRequests(store),[]);
 is("confirmed absence alone permits bounded cleanup",calls.filter(c=>c[0]==="ZREM").length,2);
 redis.pipeline=original;done();
}
main().catch(error=>{console.error(error);process.exitCode=1;});
