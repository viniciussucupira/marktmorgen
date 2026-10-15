import { readPaidSales } from "@/lib/stats";
import { claimHandle, ensureStatsId, setStripeAccount, storeForEmail } from "@/lib/store";
import { done, is, part } from "./check";
process.env.NIMBUS_DATA_KEY="a-local-key-for-tests-only-0123456789abcdef";
process.env.STRIPE_SECRET_KEY="sk_test_paid_pagination_only";
const empty={data:[],has_more:false};
let endpoint="/v1/checkout/sessions";
let pages:unknown[]=[];
let calls=0;
globalThis.fetch=(async(input:string|URL|Request)=>{const url=new URL(String(input));const body=url.pathname===endpoint ? pages[Math.min(calls++,pages.length-1)] : empty;return new Response(JSON.stringify(body),{status:200});}) as typeof fetch;
const row=(id:string)=>({id,status:"complete",payment_status:"paid",created:1791417600,amount_total:1200,currency:"usd",metadata:{store:"pagination",product:"guide"}});
async function main(){
 await claimHandle("pagination@example.com","pagination","Pagination Store","");await ensureStatsId("pagination@example.com");await setStripeAccount("pagination@example.com","acct_1PaginationTest",true);const store=(await storeForEmail("pagination@example.com"))!;
 const read=async(response:unknown[],limit=3)=>{pages=response;calls=0;return readPaidSales(store,0,limit);};
 for(endpoint of ["/v1/checkout/sessions","/v1/payment_intents"]){
  part(endpoint+" validates page completion");
  for(const [name,response] of [
   ["missing list",[null]], ["missing data",[{has_more:false}]], ["wrong data",[{data:{},has_more:false}]],
   ["missing completion",[{data:[]}]], ["invalid completion",[{data:[],has_more:"false"}]],
   ["empty unfinished page",[{data:[],has_more:true}]], ["missing cursor",[{data:[{...row("a"),id:undefined}],has_more:true}]],
   ["null row",[{data:[null],has_more:false}]], ["duplicate page rows",[{data:[row("a"),row("a")],has_more:false}]],
   ["repeated cursor",[{data:[row("a")],has_more:true},{data:[row("a")],has_more:true}]],
   ["late malformed page",[{data:[row("a")],has_more:true},{data:null,has_more:false}]],
  ] as [string,unknown[]][]){let rejected=false;try{await read(response);}catch{rejected=true;}is(name+" fails instead of completing",rejected,true);}
  const zero=await read([empty]);is("confirmed empty reading completes",[zero.sales.length,zero.partial],[0,false]);
  const capped=await read([{data:[row("a")],has_more:true}],1);is("valid capped page remains partial",capped.partial,true);
  const valid=await read([{data:[row("a")],has_more:true},{data:[row("b")],has_more:false}]);is("valid cursor advances and completes",[valid.partial,calls],[false,2]);
  is("only checkout rows count as purchases",valid.sales.length,endpoint.includes("sessions")?2:0);
 }
 done();
}
main().catch(error=>{console.error(error);process.exit(1);});
