import { confirmedAiReservation } from "@/lib/ai-quota";
import { aiAllowance, aiMonthKey, counted } from "@/lib/ai";
import { draftKit } from "@/lib/affiliate-kit";
import { addProduct, claimHandle, ensureStatsId, setAffiliateSetting, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { parseAffiliateSetting } from "@/lib/affiliate-setting";
import type { Affiliate } from "@/lib/affiliates";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
async function main() {
  redis.clear();process.env.ANTHROPIC_API_KEY="sk-ant-test-reservation-not-real-000000";process.env.STRIPE_SECRET_KEY="sk_test_reservation_not_real";
  let providerCalls=0;
  globalThis.fetch=(async(input:string|URL|Request)=>{if(new URL(String(input)).hostname==="api.anthropic.com")providerCalls++;return new Response(JSON.stringify({object:"list",data:[]}),{status:200});}) as typeof fetch;
  const owner="ai-reserve@example.com";await claimHandle(owner,"ai-reserve","AI Reserve","");await ensureStatsId(owner);await setStripeAccount(owner,"acct_1TestReserve000001",true);await setSubscription(owner,{customerId:"cus_reserve",subscriptionId:"sub_reserve",active:true,tier:"creator",trialEnds:0});
  const product=await addProduct(owner,"Synthetic product","","29",null);if(!product.ok)throw Error("no synthetic product");await setAffiliateSetting(owner,parseAffiliateSetting({enabled:true,percent:30,days:30}));
  const store=(await storeForEmail(owner))!,now=Date.UTC(2026,0,15),key=aiMonthKey(store,new Date(now));
  const affiliate:Affiliate={id:"aaaaaaaaaaaa",email:"synthetic@example.com",code:"synthetic",status:"approved",appliedAt:1,decidedAt:1,note:"",rate:null,paypal:"",share:null,cleared:null,by:null};
  const original=redis.pipeline,normal=Symbol("normal");let reply:unknown=normal,apply=false,reserves=0,releases=0,callbacks=0;
  const keys=new Set<string>([key]);
  redis.pipeline=async commands=>{
    if(commands.some(c=>String(c[0]).startsWith("DECR")&&c[1]===key))releases++;
    if(commands.some(c=>String(c[0]).startsWith("INCR")&&c[1]===key)){
      reserves++;for(const c of commands)keys.add(String(c[1]));
      if(reply!==normal){if(apply)await original.call(redis,commands);if(reply instanceof Error)throw reply;return reply as unknown[];}
    }
    return original.call(redis,commands);
  };
  const reset=async()=>{await original.call(redis,[["DEL",...keys]]);reply=normal;apply=false;reserves=0;releases=0;callbacks=0;providerCalls=0;};
  const run=async()=>{callbacks++;return "synthetic answer";};
  try {
    part("Strict reservation acknowledgements, including expiry");
    is("one confirmed counter",confirmedAiReservation([3,1],[3]),[3]);
    is("all three kit counters",confirmedAiReservation([1,1,2,1,3,1],[1,1,1]),[1,2,3]);
    for(const bad of [null,{},[],[1],[1,0],[1,"1"],["1",1],[true,1],[0,1],[-1,1],[1.1,1],[NaN,1],[Infinity,1],[Number.MAX_SAFE_INTEGER+1,1],[1,1,1]]){
      await reset();reply=bad;
      is("unknown reservation refuses writing job",await counted(store,now,run),{ok:false,reason:"failed"});
      is("no paid work before confirmed reservation",callbacks,0);
      is("unknown reservation is not decremented",releases,0);
    }
    await reset();reply=new Error("reply lost");apply=true;
    is("transport failure stays refused",await counted(store,now,run),{ok:false,reason:"failed"});
    is("applied reservation remains counted",(await original.call(redis,[["GET",key]]))[0],"1");
    is("applied reservation authorizes no callback",callbacks,0);is("no rollback of uncertain reservation",releases,0);is("no repeated reservation",reserves,1);
    part("Invalid job weights cannot lower or bypass the count");
    for(const jobs of [0,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]){await reset();is("invalid job count refused",await counted(store,now,run,jobs),{ok:false,reason:"notes"});is("no reservation for invalid jobs",reserves,0);is("no callback for invalid jobs",callbacks,0);}
    await reset();reply=[2,1];is("weighted job requires at least its increment",await counted(store,now,run,3),{ok:false,reason:"failed"});is("weighted undercount runs nothing",callbacks,0);
    await reset();const allowance=aiAllowance(store,now);is("oversized request refused before reserve",await counted(store,now,run,allowance+1),{ok:false,reason:"used"});is("oversized request writes nothing",reserves,0);
    await reset();const success=await counted(store,now,run,3);is("confirmed weighted request runs once",[success.ok,success.ok?success.left:null,callbacks],[true,allowance-3,1]);
    await reset();await original.call(redis,[["SET",key,allowance]]);is("confirmed exhausted month refuses work",await counted(store,now,run),{ok:false,reason:"used"});is("exhausted month calls nothing",callbacks,0);is("confirmed excess reservation is released",(await original.call(redis,[["GET",key]]))[0],String(allowance));
    await reset();const parallel=await Promise.all(Array.from({length:allowance+5},()=>counted(store,now,run)));is("concurrent work cannot exceed confirmed allowance",[parallel.filter(r=>r.ok).length,callbacks],[allowance,allowance]);
    part("Affiliate jobs require every counter and expiry before a provider call");
    for(const bad of [null,[],[1,1,1,1,1],[1,1,1,1,"1",1],[1,1,1,0,1,1],[1,1,1,1,0,1],[1,1,1,1,1,1,1],new Error("kit reply lost")]){
      await reset();reply=bad;apply=true;
      const result=await draftKit(store,affiliate,product.product.id,"",new Date(now));
      is("unknown kit reservation refused",result,{ok:false,reason:"failed"});is("kit provider is never called",providerCalls,0);is("kit counters are not blindly rolled back",releases,0);is("kit reservation not repeated",reserves,1);
    }
  }finally{redis.pipeline=original;}
  done();
}
void main();
