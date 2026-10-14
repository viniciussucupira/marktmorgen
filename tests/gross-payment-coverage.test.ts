import { paymentMixFrom } from "@/lib/payment-mix";
import { paymentComparisonFrom } from "@/lib/payment-comparison";
import { PaymentMixPanel } from "@/components/payment-mix";
import { PaymentComparisonPanel } from "@/components/payment-comparison";
import { paymentMixReport, paymentComparisonReport } from "@/lib/channel-reports";
import { numbersContext } from "@/lib/numbers-ask";
import { channelsTool } from "@/lib/mcp-tools";
import { refundActivityFrom } from "@/lib/refund-activity";
import { channelCashflows } from "@/lib/channel-cashflow";
import { dailyCashflowRows } from "@/lib/daily-cashflow";
import type { StatsData } from "@/lib/stats";
import { parseCsv } from "@/lib/csv";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const now=Date.UTC(2026,9,14);
const date=(ago:number)=>new Date(now-ago*86400000).toISOString().slice(0,10);
const zero={visitors:0,views:0,checkouts:0,sales:0,cents:0};
const data={sales:"ok",currency:"usd",paymentsComplete:true,cashflowComplete:false,renewals:null,days:Array.from({length:90},(_,i)=>({date:date(89-i),...zero})),totals:{d7:zero,d30:zero,d90:zero,all:zero},products:[],channels:{d7:[],d30:[],d90:[]},channelDays:{instagram:{[date(0)]:9000,[date(7)]:3000},google:{[date(1)]:1000},email:{[date(8)]:2000},direct:{[date(0)]:2000,[date(9)]:1000}},refundDays:null,refunds:null} as unknown as StatsData;
const mix=paymentMixFrom(data,"d7")!;
const comparison=paymentComparisonFrom(data,"d7")!;
part("Confirmed receipts remain usable independently of refunds");
is("gross total includes every channel",mix.total,12000);
is("largest identified channel uses full denominator",[mix.largest?.source,mix.largest?.share],["instagram",0.75]);
is("unidentified money stays in denominator",[mix.unidentified,mix.unidentifiedShare],[2000,1/6]);
is("both periods retain the coverage flag",[comparison.current.total,comparison.previous?.total,comparison.delta,comparison.change],[12000,6000,6000,1]);
is("exact adjacent bounds",[comparison.current.from,comparison.current.to,comparison.previous?.from,comparison.previous?.to],[date(6),date(0),date(13),date(7)]);
is("share changes use each period's total",comparison.rows.find(r=>r.source==="instagram")?.shareChange,0.25);
is("previous-only channel stays visible",comparison.rows.find(r=>r.source==="email")?.current,0);
is("complete original ledger gives identical gross results",paymentMixFrom({...data,cashflowComplete:true},"d7"),mix);
is("legacy combined confirmation still usable",paymentComparisonFrom({...data,paymentsComplete:undefined,cashflowComplete:true},"d7"),comparison);
is("short prior history stays unknown",paymentComparisonFrom({...data,days:data.days.slice(-13)},"d7")?.previous,null);
is("ninety-day prior period stays unknown",paymentComparisonFrom(data,"d90")?.previous,null);
part("Unavailable receipts never borrow refund coverage");
for(const [name,snapshot] of [
 ["explicit unavailable",{...data,paymentsComplete:false,cashflowComplete:true}],
 ["legacy incomplete",{...data,paymentsComplete:undefined}],
 ["partial purchases",{...data,partial:true}],
 ["partial renewals",{...data,renewals:{d7:{payments:1,cents:1},d30:{payments:1,cents:1},d90:{payments:1,cents:1},partial:true}}],
 ["missing ledger",{...data,channelDays:undefined}],
 ["failed provider",{...data,sales:"error"}],
] as [string,StatsData][]){
 is(name+" concentration unavailable",paymentMixFrom(snapshot,"d7"),null);
 is(name+" comparison unavailable",paymentComparisonFrom(snapshot,"d7"),null);
}
part("CSV and rendered panels keep gross scope visible");
const mixCsv=parseCsv(paymentMixReport(mix,"usd"));
is("CSV preserves amount and share",mixCsv.rows.find(r=>r[3]==="instagram")?.slice(5,8),["90","75","120"]);
is("CSV explains independent coverage",mixCsv.rows[0][10].includes("independently of refund coverage"),true);
const comparisonCsv=parseCsv(paymentComparisonReport(comparison,"usd"));
is("comparison CSV retains measured change",comparisonCsv.rows.find(r=>r[5]==="instagram")?.slice(6,10),["90","30","60","200"]);
is("comparison CSV explains gross scope",comparisonCsv.rows[0][13].includes("independently of refund coverage"),true);
const mixHtml=renderToStaticMarkup(createElement(PaymentMixPanel,{data,range:"d7"}));
is("shares and download remain available",[mixHtml.includes("Instagram · 75.0%"),mixHtml.includes("Download payment shares")],[true,true]);
is("gross panel explains unavailable refund results",mixHtml.includes("Results after refunds remain unavailable"),true);
const comparisonHtml=renderToStaticMarkup(createElement(PaymentComparisonPanel,{data,range:"d7"}));
is("comparison and download remain available",[comparisonHtml.includes("$120 received now versus $60"),comparisonHtml.includes("Download payment comparison")],[true,true]);
is("comparison explains unavailable refund results",comparisonHtml.includes("Results after refunds remain unavailable"),true);
is("complete refund reading needs no unavailable status",renderToStaticMarkup(createElement(PaymentMixPanel,{data:{...data,cashflowComplete:true},range:"d7"})).includes("Results after refunds remain unavailable"),false);
part("AI and connected tools preserve the distinction");
const context=numbersContext(data).last_7_days as {payment_mix:{total_payments:string;note:string};payment_comparison:{previous_period:{payments:string};difference:string;note:string};cashflow:{complete:boolean;channels:{after_refunds:string|null}[]}};
is("AI has gross total and prior baseline",[context.payment_mix.total_payments,context.payment_comparison.previous_period.payments,context.payment_comparison.difference],["$120","$60","$60"]);
is("AI notes state independent receipt coverage",[context.payment_mix.note.includes("independently of refund coverage"),context.payment_comparison.note.includes("independently of refund coverage")],[true,true]);
is("AI still cannot claim an after-refund result",[context.cashflow.complete,context.cashflow.channels.every(c=>c.after_refunds===null)],[false,true]);
const tool=channelsTool(data,"d7");
is("tool independently states gross and refund coverage",[tool.payments_complete,tool.cashflow_complete,tool.payment_mix?.total_payments,tool.payment_comparison?.difference],[true,false,12000,6000]);
is("tool scope travels with numbers",[tool.payment_mix?.note.includes("independently of refund coverage"),tool.payment_comparison?.note.includes("independently of refund coverage")],[true,true]);
is("refund activity remains unavailable",refundActivityFrom(data,"d7",date(6),date(0)),null);
is("channel results stay unknown",channelCashflows(data,"d7",[],new Map(),date(6),date(0)).every(r=>r.receipts!==null&&r.afterRefunds===null),true);
is("daily refund results stay unknown",dailyCashflowRows(data,"d7",[]).every(r=>r.payments!==null&&r.afterAds===null),true);
is("no buyer identities in gross reports",/customer_details|receipt_email|@example.com/.test(JSON.stringify(tool.payment_mix)+JSON.stringify(tool.payment_comparison)),false);
done();
