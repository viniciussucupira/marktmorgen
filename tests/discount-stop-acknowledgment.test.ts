import { done,is,part } from "./check";

const originalFetch=globalThis.fetch;
const priorKey=process.env.STRIPE_SECRET_KEY;
const priorBase=process.env.STRIPE_CONNECT_API_BASE;
process.env.STRIPE_SECRET_KEY="sk_test_local_discount_provider_only";
process.env.STRIPE_CONNECT_API_BASE="http://127.0.0.1:4999";
let body:unknown={data:[]},status=200,requests=0;
globalThis.fetch=(async(input:RequestInfo|URL,init?:RequestInit)=>{
 const url=String(input);if(!url.startsWith("http://127.0.0.1:4999/"))throw Error("Unexpected external provider request");
 if(!url.endsWith("/promotion_codes/promo_synthetic_stop"))throw Error("Unexpected code target");
 if(init?.method!=="POST" || String(init.body)!=="active=false")throw Error("Unexpected stop request");
 requests++;
 return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json"}});
}) as typeof fetch;
async function main(){
try{
 const {stopCode}=await import("@/lib/discount");
 part("Only an explicit provider acknowledgment confirms switching off this code");
 const id="promo_synthetic_stop";
 const rejected:unknown[]=[null,[],{}, {id}, {id,active:true}, {id,active:"false"}, {id,active:0}, {id:"promo_other",active:false}, {id,active:false,error:{message:"unknown"}}];
 for(const value of rejected){
  body=value;status=200;
  is("partial or contradictory acknowledgment is refused",await stopCode("acct_synthetic_discount",id),false);
 }
 body={id,active:false};status=200;
 is("matching inactive code is confirmed",await stopCode("acct_synthetic_discount",id),true);
 body={id,active:false};status=500;
 is("HTTP failure cannot confirm inactive code",await stopCode("acct_synthetic_discount",id),false);
 is("exactly one synthetic request per explicit attempt",requests,rejected.length+2);
}finally{
 globalThis.fetch=originalFetch;
 if(priorKey===undefined)delete process.env.STRIPE_SECRET_KEY;else process.env.STRIPE_SECRET_KEY=priorKey;
 if(priorBase===undefined)delete process.env.STRIPE_CONNECT_API_BASE;else process.env.STRIPE_CONNECT_API_BASE=priorBase;
}
done();
}
main().catch(error=>{console.error(error);process.exit(1);});
