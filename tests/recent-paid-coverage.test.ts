import { readSales, readStats, studioStats, recordHit } from "@/lib/stats";
import { summaryOf } from "@/lib/stats-report";
import { paymentMixFrom } from "@/lib/payment-mix";
import { claimHandle, ensureStatsId, setStripeAccount, storeForEmail } from "@/lib/store";
import { done, is, part } from "./check";
process.env.NIMBUS_DATA_KEY="a-local-key-for-tests-only-0123456789abcdef";
process.env.STRIPE_SECRET_KEY="sk_test_recent_coverage_only";
const now=Date.UTC(2026,9,14,12);let scenario="old";let page=0;
const empty={data:[],has_more:false};
const row=(id:string,days:number)=>({id,created:Math.floor((now-days*86400000)/1000),status:"complete",payment_status:"paid",amount_total:1200,currency:"usd",metadata:{store:"recent",product:"guide"}});
globalThis.fetch=(async(input:string|URL|Request)=>{const url=new URL(String(input));let body:unknown=empty;
 if(url.pathname==="/v1/checkout/sessions"){page+=1;body=scenario==="empty"?{data:[{...row("cs_nonpaid_"+page,1),status:"open",payment_status:"unpaid"}],has_more:true}:scenario==="old"?{data:[row("cs_old_"+page,100)],has_more:true}:{data:[row("cs_old_complete",100)],has_more:false};}
 if(url.pathname==="/v1/payment_intents"&&scenario==="extras"){page+=1;body={data:[{id:"pi_extra_"+page,created:now/1000-3600,status:"succeeded",amount:500,currency:"usd",metadata:{kind:"upsell",store:"recent",product:"guide"}}],has_more:true};}
 return new Response(JSON.stringify(body),{status:200});}) as typeof fetch;
async function main(){await claimHandle("recent@example.com","recent","Recent Store","");await ensureStatsId("recent@example.com");await setStripeAccount("recent@example.com","acct_1RecentTest",true);const store=(await storeForEmail("recent@example.com"))!;await recordHit(store,{kind:"view",ip:"192.0.2.1",userAgent:"Mozilla/5.0"},now);const traffic=(await readStats(store,now))!;
 for(scenario of ["old","empty","extras"]){part(scenario+" cannot certify complete recent sales");page=0;const sales=(await readSales(store,now))!;const data=studioStats(store,traffic,sales,"ok",[]);const summary=summaryOf(data);
 is("recent purchase reading incomplete",sales.partial,true);
 is("all previous paid periods unavailable",[sales.previous?.d7,sales.previous?.d30,sales.previous?.d90],[null,null,null]);
 is("gross ledger unavailable",data.paymentsComplete,false);
 is("payment mix unavailable",paymentMixFrom(data,"d7"),null);
 is("API paid values unavailable in every recent window",Object.values(summary.days).every(w=>w.sales===null&&w.revenue===null),true);
 is("current traffic retained",summary.days.last_7_days.visitors,1);
 }
 scenario="complete";page=0;const complete=(await readSales(store,now))!;const data=studioStats(store,traffic,complete,"ok",[]);const summary=summaryOf(data);
 is("complete old history preserves recent zero",[complete.partial,complete.totals.d7.sales,complete.totals.d7.cents],[false,0,0]);
 is("confirmed prior old purchase retained",complete.previous?.d90,{sales:1,cents:1200});
 is("confirmed ledger remains available",data.paymentsComplete,true);
 is("API true zero remains zero",[summary.days.last_7_days.sales,summary.days.last_7_days.revenue],[0,0]);
 done();}
main().catch(error=>{console.error(error);process.exit(1);});
