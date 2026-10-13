import { buyerChannelsFrom } from "@/lib/buyer-channel-rules";
import { weeklyCohortReport } from "@/lib/channel-reports";
import { parseCsv } from "@/lib/csv";
import { WeeklyCohortsPanel } from "@/components/weekly-cohorts";
import { numbersContext, SECTIONS } from "@/lib/numbers-ask";
import { channelsTool } from "@/lib/mcp-tools";
import type { Sale, StatsData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const NOW = Date.parse("2026-10-13T12:00:00Z"), DAY = 86400000;
let id = 0;
function sale(email: string, ago: number, extra: Partial<Sale> = {}): Sale {
  return { created: NOW - ago * DAY, cents: 1000, currency: "usd", product: "p1", source: "email", first: "email", medium: "", campaign: "", content: "", country: "", paymentIntent: "", row: { id: "cs_" + ++id, customer_details: { email } }, upsell: false, ...extra };
}
const input = [
  sale(" Mature@Example.com ", 8), sale("mature@example.com", 3),
  sale("young@example.com", 6), sale("young@example.com", 1),
  sale("old@example.com", 120), sale("old@example.com", 25),
  sale("old@example.com", 118, { upsell: true, row: { id: "pi_extra", receipt_email: "old@example.com" } }),
  sale("return@example.com", 100), sale("return@example.com", 95),
  sale("", 2), sale("foreign@example.com", 4, { currency: "eur" }),
  sale("tip@example.com", 3, { row: { id: "cs_tip", customer_details: { email: "tip@example.com" }, metadata: { kind: "tip" } } }),
  sale("future@example.com", -1),
  sale("extra@example.com", 4, { upsell: true, row: { id: "pi_orphan", receipt_email: "extra@example.com" } }),
];
const result = buyerChannelsFrom(input, "usd", NOW);
const cohorts = result.weekly!;
part("Cohort weeks and mature denominators");
const recent = cohorts.rows.find(r => r.week === "2026-10-05")!;
is("UTC Monday groups the week's first observed purchases", recent.buyers, 2);
is("only the mature buyer enters the 7-day rate", recent.observations[7], { eligible: 1, repeated: 1 });
is("both young buyers wait at 30 days", recent.observations[30], { eligible: 0, repeated: 0 });
is("full history includes first purchases outside selected 90-day channels", [cohorts.rows.reduce((sum,r)=>sum+r.buyers,0), result.d90.rows.reduce((sum,r)=>sum+r.buyers,0)], [4,2]);
const old = cohorts.rows.find(r=>r.week==="2026-06-15")!;
is("a return after 90 days is not a 90-day return", old.observations[90], { eligible: 1, repeated: 0 });
is("one-click extras do not invent a repeat", old.observations[7], { eligible: 1, repeated: 0 });
const returned = cohorts.rows.find(r=>r.week==="2026-06-29")!;
is("an early return counts cumulatively in later windows", [7,30,60,90].map(age=>returned.observations[age as 7|30|60|90].repeated), [1,1,1,1]);
is("identities, tips, other currencies, future orders and orphan extras are absent", /@|foreign|tip|future|extra/.test(JSON.stringify(cohorts)), false);
is("unidentified orders disclosed separately", cohorts.unidentifiedOrders, 1);
is("as of preserves the observation timestamp", cohorts.asOf, new Date(NOW).toISOString());
is("deduplication and order-independent aggregation", buyerChannelsFrom([...input].reverse().concat(input[0]), "usd", NOW).weekly, cohorts);
const boundary = [sale("boundary@example.com", 50), sale("boundary@example.com", 20)];
is("a purchase exactly 30 days after first counts", buyerChannelsFrom(boundary,"usd",NOW).weekly!.rows[0].observations[30].repeated, 1);
is("one millisecond after 30 days does not count", buyerChannelsFrom([boundary[0], {...boundary[1],created:boundary[1].created+1}],"usd",NOW).weekly!.rows[0].observations[30].repeated, 0);
const immature = buyerChannelsFrom([sale("exact@example.com", 7, {created:NOW-7*DAY+1})],"usd",NOW).weekly!.rows[0];
is("one millisecond short is still immature", immature.observations[7].eligible, 0);
is("exact seven-day observation is eligible", buyerChannelsFrom([sale("exact@example.com",7)],"usd",NOW).weekly!.rows[0].observations[7].eligible,1);
is("Sunday belongs to preceding Monday in UTC", buyerChannelsFrom([sale("sun@example.com",1,{created:Date.parse("2026-10-04T23:59:59Z")})],"usd",NOW).weekly!.rows[0].week,"2026-09-28");
is("older than 180 days is outside the cohort history", buyerChannelsFrom([sale("older@example.com",181),sale("older@example.com",2)],"usd",NOW).weekly!.rows.length,0);
part("CSV and rendered panel retain maturity and coverage");
const file = parseCsv(weeklyCohortReport(cohorts,true));
const seven = file.rows.find(r=>r[0]===recent.week&&r[3]==="7")!;
is("CSV exposes numerator, denominator and percentage", seven.slice(2,9),["2","7","1","1","100","Partial","1"]);
is("immature rate exports blank instead of zero", file.rows.find(r=>r[0]===recent.week&&r[3]==="30")![6],"");
is("one row per cohort and period", file.rows.length,cohorts.rows.length*4);
is("unidentified-only export keeps exclusions",parseCsv(weeklyCohortReport({rows:[],unidentifiedOrders:3,asOf:cohorts.asOf},false)).rows[0][8],"3");
const html = renderToStaticMarkup(createElement(WeeklyCohortsPanel,{cohorts,historyPartial:true}));
is("panel has exact denominators, immature state, download and partial warning", [html.includes("1 of 1 observed for 7 days"),html.includes("Not enough time observed"),html.includes("Download weekly repurchase"),html.includes("Purchase history was not read in full")],[true,true,true,true]);
is("panel identifies UTC weeks and uses semantic headers",[html.includes('scope="col"'),html.includes('scope="row"'),html.includes('dateTime="2026-10-05"')||html.includes('datetime="2026-10-05"')],[true,true,true]);
is("empty panel stays absent",renderToStaticMarkup(createElement(WeeklyCohortsPanel,{cohorts:{rows:[],unidentifiedOrders:0,asOf:cohorts.asOf},historyPartial:false})),"");
part("AI and external tools use the same aggregates without identities");
const totals={visitors:0,views:0,checkouts:0,sales:0,cents:0};
const data = {sales:"ok",currency:"usd",days:[],totals:{d7:totals,d30:totals,d90:totals},products:[],buyerChannels:{...result,historyPartial:true}} as unknown as StatsData;
const context=numbersContext(data) as {weekly_repurchase_cohorts:{history_partial:boolean;weeks:{first_purchase_week_utc:string;periods:{days:number;observed_for_full_period:number;bought_again_within_period:number;rate:string|null}[]}[]}};
const ai=context.weekly_repurchase_cohorts.weeks.find(r=>r.first_purchase_week_utc===recent.week)!;
is("AI has exact maturity and rate",ai.periods.find(p=>p.days===7),{days:7,observed_for_full_period:1,bought_again_within_period:1,rate:"100%"});
is("AI does not turn immature into zero",ai.periods.find(p=>p.days===30)!.rate,null);
is("AI can navigate to exact panel",SECTIONS.includes("weekly-cohorts"),true);
const tool=channelsTool(data,"d7").weekly_repurchase_cohorts!;
is("tool keeps all weeks independent of selected window",tool.weeks.length,cohorts.rows.length);
is("tool exposes partial read and exact timestamp",[tool.history_partial,tool.as_of_utc],[true,cohorts.asOf]);
is("no identities in AI or tool output",/@/.test(JSON.stringify(context)+JSON.stringify(tool)),false);
is("unread sales do not leak a cohort reading","weekly_repurchase_cohorts" in numbersContext({...data,sales:"error"}),false);
done();
