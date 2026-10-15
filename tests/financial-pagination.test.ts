import { readSales } from "@/lib/stats";
import { claimHandle, ensureStatsId, setStripeAccount, storeForEmail } from "@/lib/store";
import { done, is, part } from "./check";
process.env.NIMBUS_DATA_KEY="a-local-key-for-tests-only-0123456789abcdef";
process.env.STRIPE_SECRET_KEY="sk_test_financial_pagination_only";
const now=Date.UTC(2026,9,14,12);
const empty={data:[],has_more:false};
let endpoint="/v1/invoices";let pages:unknown[]=[];let calls=0;
const purchase={id:"cs_test_financial",created:now/1000-3600,status:"complete",payment_status:"paid",amount_total:1200,currency:"usd",metadata:{store:"financial",product:"guide"}};
globalThis.fetch=(async(input:string|URL|Request)=>{const url=new URL(String(input));const body=url.pathname===endpoint ? pages[Math.min(calls++,pages.length-1)] : url.pathname==="/v1/checkout/sessions"?{data:[purchase],has_more:false}:empty;return new Response(JSON.stringify(body),{status:200});}) as typeof fetch;
async function main(){await claimHandle("financial@example.com","financial","Financial Store","");await ensureStatsId("financial@example.com");await setStripeAccount("financial@example.com","acct_1FinancialTest",true);const store=(await storeForEmail("financial@example.com"))!;
 for(endpoint of ["/v1/invoices","/v1/refunds"]){part(endpoint+" keeps failed coverage independent");
 for(const [name,response] of [["missing page",[null]],["missing data",[{has_more:false}]],["missing completion",[{data:[]}]],["wrong completion",[{data:[],has_more:0}]],["unfinished empty page",[{data:[],has_more:true}]],["missing cursor",[{data:[{}],has_more:true}]],["repeated records",[{data:[{id:"record"},{id:"record"}],has_more:false}]],["repeated cursor",[{data:[{id:"record"}],has_more:true},{data:[{id:"record"}],has_more:true}]]] as [string,unknown[]][]){pages=response;calls=0;const read=(await readSales(store,now))!;
 is(name+" current purchases retained",[read.totals.d7.sales,read.totals.d7.cents],[1,1200]);
 is(name+" combined result unavailable",read.cashflowComplete,false);
 if(endpoint.endsWith("invoices"))is(name+" gross payments unavailable",read.paymentsComplete,false);else is(name+" gross payments retained",read.paymentsComplete,true);
 }
 pages=[empty];calls=0;const valid=(await readSales(store,now))!;
 is("confirmed empty page preserves complete gross reading",valid.paymentsComplete,true);
 is("confirmed empty page preserves complete cashflow",valid.cashflowComplete,true);
 }
 done();}
main().catch(error=>{console.error(error);process.exit(1);});
