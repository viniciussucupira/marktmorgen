import { customRangeChartSummary, type CustomRangeMetric } from "@/lib/custom-range-chart";
import { customRangeChartSummaryReport } from "@/lib/channel-reports";
import { CustomRangeChartSummary, CustomRangeChart } from "@/components/custom-range";
import { parseCsv } from "@/lib/csv";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is } from "./check";
const row=(date:string,n:number)=>({date,visitors:n,views:n,checkouts:n,sales:n,cents:n*100});
const data:RangeData={from:"2026-10-01",to:"2026-10-08",currency:"usd",sales:"ok",partial:false,elsewhere:0,before:null,channels:[],products:[],totals:{visitors:999,views:999,checkouts:999,sales:999,cents:999},days:[row("2026-10-08",1),row("2026-10-02",1),row("2026-10-01",1),row("2026-10-04",1),row("2026-10-05",0),row("2026-10-06",1),row("2026-10-07",1)]};
const record=(d:RangeData,metric:CustomRangeMetric)=>{const p=parseCsv(customRangeChartSummaryReport(d,metric,"month"));return Object.fromEntries(p.header.map((h,i)=>[h,p.rows[0]?.[i]]));};
for(const metric of ["visitors","views","checkouts","sales","cents"] as const){
 const s=customRangeChartSummary(data,metric)!;
 is(metric+" longest calendar-consecutive sequence",s.longestStreak,{days:3,from:"2026-10-06",to:"2026-10-08"});
 const r=record(data,metric);
 is(metric+" CSV dates and length",[r["Longest activity sequence (days)"],r["Sequence from (UTC)"],r["Sequence to (UTC)"]],["3","2026-10-06","2026-10-08"]);
}
const tied={...data,days:[row("2026-10-05",1),row("2026-10-06",1),row("2026-10-02",1),row("2026-10-01",1)]};
is("earliest tied sequence retained",customRangeChartSummary(tied,"visitors")!.longestStreak,{days:2,from:"2026-10-01",to:"2026-10-02"});
is("missing date interrupts positive sequence",customRangeChartSummary({...data,days:[row("2026-10-01",1),row("2026-10-03",1)]},"visitors")!.longestStreak?.days,1);
is("recorded zero interrupts sequence",customRangeChartSummary({...data,days:[row("2026-10-01",1),row("2026-10-02",0),row("2026-10-03",1)]},"visitors")!.longestStreak?.days,1);
is("month and year boundary remain consecutive",customRangeChartSummary({...data,days:[row("2026-12-31",1),row("2027-01-01",1)]},"visitors")!.longestStreak?.days,2);
is("UTC continuity across DST dates",customRangeChartSummary({...data,days:[row("2026-03-07",1),row("2026-03-08",1),row("2026-03-09",1)]},"visitors")!.longestStreak?.days,3);
is("single day has its own dates",customRangeChartSummary({...data,days:[row("2026-10-01",1)]},"sales")!.longestStreak,{days:1,from:"2026-10-01",to:"2026-10-01"});
const zero={...data,days:data.days.map(d=>({...d,sales:0,cents:0}))};
is("no positive days has no fabricated sequence",customRangeChartSummary(zero,"sales")!.longestStreak,null);
is("zero CSV has blank dates",[record(zero,"sales")["Longest activity sequence (days)"],record(zero,"sales")["Sequence from (UTC)"],record(zero,"sales")["Sequence to (UTC)"]],["0","",""]);
is("empty reading has no summary",customRangeChartSummary({...data,days:[]},"sales"),null);
is("empty CSV header only",parseCsv(customRangeChartSummaryReport({...data,days:[]},"sales")).rows.length,0);
const independent={...data,days:data.days.map(d=>({...d,cents:0}))};
is("free purchases can have sales sequence",customRangeChartSummary(independent,"sales")!.longestStreak?.days,3);
is("free purchases do not invent revenue activity",customRangeChartSummary(independent,"cents")!.longestStreak,null);
for(const d of [{...zero,partial:true},{...zero,sales:"none" as const},{...zero,sales:"error" as const}]){
 for(const metric of ["sales","cents"] as const){
  const s=customRangeChartSummary(d,metric)!;
  is("unavailable payments use observed traffic sequence",[s.metric,s.longestStreak?.days],["visitors",3]);
  is("CSV fallback names actual metric",record(d,metric).Metric,"Visitors");
 }
}
const render=(d=data)=>renderToStaticMarkup(createElement(CustomRangeChartSummary,{range:d,currency:"usd",metric:"sales"}));
is("sequence summary visible",render().includes("Longest activity sequence: 3 days"),true);
is("sequence dates shown in UTC",render().includes("Oct 6, 2026 to Oct 8, 2026 (UTC)"),true);
is("gap and tie semantics explained",render().includes("missing dates break the sequence")&&render().includes("earliest longest sequence"),true);
is("zero UI does not invent dates",render(zero).includes("No recorded days with positive activity"),true);
is("grouped cumulative chart keeps daily sequence",renderToStaticMarkup(createElement(CustomRangeChart,{range:data,currency:"usd",metric:"sales",grouping:"month",cumulative:true})).includes("Longest activity sequence: 3 days"),true);
is("source order unchanged",data.days[0].date,"2026-10-08");
done();
