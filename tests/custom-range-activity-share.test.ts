import { customRangeChartSummary, type CustomRangeMetric } from "@/lib/custom-range-chart";
import { customRangeChartSummaryReport } from "@/lib/channel-reports";
import { CustomRangeChartSummary, CustomRangeChart } from "@/components/custom-range";
import { parseCsv } from "@/lib/csv";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is } from "./check";
const data:RangeData={from:"2026-10-01",to:"2026-10-05",currency:"usd",sales:"ok",partial:false,elsewhere:0,before:null,channels:[],products:[],totals:{visitors:99,views:99,checkouts:99,sales:99,cents:999},days:[
 {date:"2026-10-05",visitors:0,views:3,checkouts:0,sales:0,cents:0},
 {date:"2026-10-01",visitors:1,views:2,checkouts:0,sales:1,cents:100},
 {date:"2026-10-03",visitors:0,views:0,checkouts:1,sales:1,cents:0},
]};
const record=(d:RangeData,metric:CustomRangeMetric)=>{const p=parseCsv(customRangeChartSummaryReport(d,metric,"week"));return Object.fromEntries(p.header.map((h,i)=>[h,p.rows[0]?.[i]]));};
for(const [metric,active] of [["visitors",1],["views",2],["checkouts",1],["sales",2],["cents",1]] as const){
 const result=customRangeChartSummary(data,metric)!;
 is(metric+" share uses its own active days",result.activeDayShare,active/3*100);
 is(metric+" CSV full calculated precision",record(data,metric)["Active-day share (%)"],String(active/3*100));
 is(metric+" denominator uses recorded days",result.days,3);
}
const zero={...data,days:data.days.map(d=>({...d,cents:0}))};
const full={...data,days:data.days.map(d=>({...d,cents:100}))};
is("confirmed zero activity has zero share",customRangeChartSummary(zero,"cents")!.activeDayShare,0);
is("all days active is 100 percent",customRangeChartSummary(full,"cents")!.activeDayShare,100);
is("one observed active day is 100 percent",customRangeChartSummary({...data,days:[data.days[1]]},"cents")!.activeDayShare,100);
is("sparse dates do not create inactive days",customRangeChartSummary(data,"sales")!.activeDayShare,2/3*100);
is("no observed days has no invented percentage",customRangeChartSummary({...data,days:[]},"sales"),null);
is("no observed days CSV stays header-only",parseCsv(customRangeChartSummaryReport({...data,days:[]},"sales")).rows.length,0);
for(const d of [{...data,partial:true},{...data,sales:"error" as const},{...data,sales:"none" as const}]){
 for(const metric of ["cents","sales"] as const){
  const result=customRangeChartSummary(d,metric)!;
  is("unavailable paid frequency falls back to observed traffic",[result.metric,result.activeDayShare],["visitors",1/3*100]);
  is("CSV fallback identifies effective metric",record(d,metric).Metric,"Visitors");
 }
}
const render=(d=data)=>renderToStaticMarkup(createElement(CustomRangeChartSummary,{range:d,currency:"usd",metric:"sales"}));
is("frequency displayed",render().includes("66.67% of recorded days"),true);
is("not conversion explained",render().includes("not a conversion rate"),true);
is("zero percentage displayed",render({...data,days:data.days.map(d=>({...d,sales:0}))}).includes("0% of recorded days"),true);
is("full percentage displayed",render({...data,days:data.days.map(d=>({...d,sales:1}))}).includes("100% of recorded days"),true);
is("empty UI stays absent",render({...data,days:[]}),"");
const grouped=renderToStaticMarkup(createElement(CustomRangeChart,{range:data,currency:"usd",metric:"sales",grouping:"month",cumulative:true}));
is("grouping and accumulation do not change daily frequency",grouped.includes("66.67% of recorded days"),true);
is("definition preserves scope",record(data,"sales").Definition.includes("not a conversion rate or full-calendar coverage"),true);
is("source order untouched",data.days[0].date,"2026-10-05");
done();
