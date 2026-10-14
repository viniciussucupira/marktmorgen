import { goalMoneyByDay, goalProgress } from "@/lib/sales-goal-rules";
import { SalesGoalCard } from "@/components/sales-goal-card";
import { alertsFrom, type AlertInput } from "@/lib/store-alerts";
import { insightsFrom } from "@/lib/insights";
import type { StatsData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const today="2026-10-14";
const date=(ago:number)=>new Date(Date.parse(today+"T00:00:00Z")-ago*86400000).toISOString().slice(0,10);
const t={visitors:100,views:120,checkouts:10,sales:1,cents:90000};
const before={visitors:40,views:60,checkouts:8,sales:1,cents:1000};
const quiet=Object.fromEntries(Array.from({length:10},(_,i)=>[date(14+i*7),1000]));
const data={sales:"ok",partial:false,paymentsComplete:true,cashflowComplete:true,renewals:null,currency:"usd",channelDays:{instagram:{...quiet,[date(1)]:90000},direct:{[date(1)]:10000}},days:Array.from({length:90},(_,i)=>({date:date(89-i),...t})),totals:{d7:t,d30:t,d90:t,all:t},previous:{d7:before,d30:before,d90:before},products:[],channels:{d7:[],d30:[],d90:[]}} as unknown as StatsData;
const render=(byDay:Record<string,number>|null,goal=300000)=>renderToStaticMarkup(createElement(SalesGoalCard,{byDay,goal,today,currency:"usd"}));
const alertInput=(byDay:Record<string,number>|null,goal=50000):AlertInput=>({name:"Coverage",currency:"usd",days:[],salesByDay:{},refunds7:0,refunds90:0,goal,moneyByDay:byDay,today});
part("Goal aggregation requires complete purchases and renewals");
const full=goalMoneyByDay(data)!;
is("all channels included in a day's money",full[date(1)],100000);
is("calendar goal uses known current-month money",goalProgress(300000,full,today)?.done,100000);
is("refund coverage does not block gross goal progress",goalMoneyByDay({...data,cashflowComplete:false}),full);
is("complete zero remains an empty known ledger",goalMoneyByDay({...data,channelDays:{}}),{});
for(const [name,snapshot] of [
 ["partial purchases",{...data,partial:true}],
 ["partial renewals",{...data,renewals:{d7:{payments:1,cents:1},d30:{payments:1,cents:1},d90:{payments:1,cents:1},partial:true}}],
 ["failed renewal reading",{...data,paymentsComplete:false}],
 ["missing ledger",{...data,channelDays:undefined}],
 ["legacy incomplete",{...data,paymentsComplete:undefined,cashflowComplete:false}],
 ["failed provider",{...data,sales:"error"}],
] as [string,StatsData][]){
 const unknown=goalMoneyByDay(snapshot);
 is(name+" is unknown rather than zero",unknown,null);
 is(name+" cannot trigger a goal alert",alertsFrom(alertInput(unknown)).some(a=>a.kind.startsWith("goal")),false);
 is(name+" cannot claim best paid day/week",insightsFrom(snapshot,"d7",[],20).some(i=>i.text.includes("best day of the last 90")||i.text.includes("best 7 days of the last 90")),false);
}
is("legacy combined confirmation remains usable",goalMoneyByDay({...data,paymentsComplete:undefined}),full);
part("Rendered goal retains the target and controls without false progress");
const unknown=render(null);
is("unavailable reading explained accessibly",unknown.includes('role="status"') && unknown.includes("Goal progress, pace and achievement wait"),true);
is("saved target retained independently",unknown.includes("Your target: $3,000"),true);
is("change remains available",unknown.includes("Change</button>") && !unknown.includes("disabled="),true);
is("no fake bar, percentage, pace or achievement",/role="progressbar"|aria-valuenow|%|Reached on|At the pace so far/.test(unknown),false);
is("new goal can still be set",render(null,0).includes("Set a goal for the month"),true);
const zero=render({});
is("complete zero has real 0 percent progress",zero.includes('aria-valuenow="0"') && zero.includes("$0"),true);
is("complete zero differs from unavailable",zero.includes('role="status"'),false);
const known=render(full);
is("complete payments show measured progress",known.includes('role="progressbar"') && known.includes("$1,000"),true);
is("complete payments show pace",known.includes("At the pace so far"),true);
is("complete attainment remains visible",render(full,50000).includes("Reached on October 13"),true);
part("Alerts and record highlights retain their independent evidence");
is("known gross payments can trigger reached alert",alertsFrom(alertInput(full)).map(a=>a.kind),["goal-reached"]);
is("known zero can trigger a real pace alert",alertsFrom(alertInput({})).map(a=>a.kind),["goal-pace"]);
const trafficDays=Array.from({length:40},(_,i)=>{const visitors=i>=36&&i<=38 ? 10 : 50;return {date:date(39-i),visitors,views:visitors,checkouts:0};});
is("unknown goal income preserves traffic alert",alertsFrom({...alertInput(null),days:trafficDays}).map(a=>a.kind),["traffic"]);
is("complete payment record remains useful",insightsFrom(data,"d7",[],20).some(i=>i.text.includes("best 7 days of the last 90")),true);
is("missing refunds don't suppress complete gross records",insightsFrom({...data,cashflowComplete:false},"d7",[],20).some(i=>i.text.includes("best 7 days of the last 90")),true);
is("traffic insight survives missing payment coverage",insightsFrom({...data,paymentsComplete:false},"d7",[],20).some(i=>i.text.includes("More people visited")),true);
is("no buyer identities in goal outputs",/receipt_email|customer_details|@example.com/.test(known+JSON.stringify(alertsFrom(alertInput(full)))),false);
done();
