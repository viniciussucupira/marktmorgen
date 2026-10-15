import { customRangeChartRows, type CustomRangeGrouping, type CustomRangeMetric } from "@/lib/custom-range-chart";
import { CustomRangeChart } from "@/components/custom-range";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const row=(date:string,n:number)=>({date,visitors:n,views:n*2,checkouts:n*3,sales:n,cents:n*101});
const range:RangeData={from:"2026-09-30",to:"2026-10-05",currency:"usd",sales:"ok",partial:false,elsewhere:0,days:[row("2026-09-30",1),row("2026-10-01",2),row("2026-10-04",3),row("2026-10-05",4)],totals:{visitors:10,views:20,checkouts:30,sales:10,cents:1010},before:null,channels:[],products:[]};
part("UTC calendar buckets preserve values and exact observed boundaries");
const weekly=customRangeChartRows(range,"visitors","week");
is("Sunday stays with previous Monday",weekly.map(r=>[r.from,r.to,r.value]),[["2026-09-30","2026-10-04",6],["2026-10-05","2026-10-05",4]]);
is("monthly boundaries clipped to recorded dates",customRangeChartRows(range,"visitors","month").map(r=>[r.from,r.to,r.value]),[["2026-09-30","2026-09-30",1],["2026-10-01","2026-10-05",9]]);
is("daily rows remain separate",customRangeChartRows(range,"visitors","day").length,4);
for(const metric of ["visitors","views","checkouts","sales","cents"] as const){
 is(metric+" weekly sum preserved",customRangeChartRows(range,metric,"week").reduce((n,r)=>n+r.value,0),range.days.reduce((n,r)=>n+r[metric],0));
 is(metric+" monthly sum preserved",customRangeChartRows(range,metric,"month").reduce((n,r)=>n+r.value,0),range.days.reduce((n,r)=>n+r[metric],0));
}
const reverse={...range,days:[...range.days].reverse()};
is("input ordering does not alter groups",customRangeChartRows(reverse,"cents","week"),customRangeChartRows(range,"cents","week"));
is("source ordering untouched",reverse.days[0].date,"2026-10-05");
is("year boundary shares a UTC week",customRangeChartRows({...range,days:[row("2025-12-31",1),row("2026-01-01",2)]},"visitors","week").length,1);
is("leap month stays separate",customRangeChartRows({...range,days:[row("2024-02-29",1),row("2024-03-01",2)]},"visitors","month").map(r=>r.value),[1,2]);
is("unknown grouping falls back to daily",customRangeChartRows(range,"visitors","bad" as CustomRangeGrouping).length,4);
is("empty groups remain empty",customRangeChartRows({...range,days:[]},"visitors","week"),[]);
part("Financial coverage applies before grouping or table display");
for(const data of [{...range,partial:true},{...range,sales:"none" as const},{...range,sales:"error" as const}]){
 const rows=customRangeChartRows(data,"cents","week");
 is(data.sales+"/"+data.partial+" paid choice falls back to visits",rows.map(r=>r.value),[6,4]);
 is(data.sales+"/"+data.partial+" paid counts stay unavailable",rows.every(r=>r.sales===null),true);
}
const render=(metric:CustomRangeMetric,grouping:CustomRangeGrouping,data=range)=>renderToStaticMarkup(createElement(CustomRangeChart,{range:data,currency:"usd",metric,grouping,onMetricChange:()=>{},onGroupingChange:()=>{}}));
const html=render("cents","week");
is("weekly chart label",html.includes('aria-label="Revenue by week"'),true);
is("exact grouped money",html.includes("$6.06 revenue"),true);
is("partial calendar group disclosed",html.includes("First and last groups may cover only part"),true);
is("summed visitor definition disclosed",html.includes("not distinct people across the group"),true);
is("group selector labeled",html.includes('for="range-chart-grouping"'),true);
is("table opens with native disclosure",html.includes("<details")&&html.includes("View chart values"),true);
is("table has metric and UTC caption",html.includes("Revenue by week (UTC)"),true);
is("table has row and column headers",html.includes('scope="row"')&&html.includes('scope="col"'),true);
is("table scroll region reachable by keyboard",html.includes('tabindex="0" role="region" aria-label="Chart values"'),true);
is("partial revenue cannot leak into chart or table",render("cents","month",{...range,partial:true}).includes("$"),false);
is("partial view announces actual metric",render("cents","week",{...range,partial:true}).includes("Visitors by week (UTC)"),true);
is("confirmed zero remains numeric",render("cents","week",{...range,days:[row("2026-10-01",0)]}).includes("$0"),true);
is("empty chart has no empty table",render("cents","week",{...range,days:[]}).includes("<table"),false);
is("source money remains intact",range.days[0].cents,101);
done();
