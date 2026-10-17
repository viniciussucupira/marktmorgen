import { customRangeWeekdays, type CustomRangeMetric } from "@/lib/custom-range-chart";
import { customRangeWeekdayReport } from "@/lib/channel-reports";
import { CustomRangeChartSummary } from "@/components/custom-range";
import { parseCsv } from "@/lib/csv";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is } from "./check";
const row=(date:string,n:number)=>({date,visitors:n,views:n*2,checkouts:n*3,sales:n,cents:n*101});
const data:RangeData={from:"2026-10-05",to:"2026-10-26",currency:"usd",sales:"ok",partial:false,elsewhere:0,before:null,channels:[],products:[],totals:{visitors:999,views:999,checkouts:999,sales:999,cents:999},days:[row("2026-10-19",100),row("2026-10-05",0),row("2026-10-12",2),row("2026-10-06",1),row("2026-10-13",2)]};
const records=(d=data,metric:CustomRangeMetric="cents")=>{const p=parseCsv(customRangeWeekdayReport(d,metric));return p.rows.map(r=>Object.fromEntries(p.header.map((h,i)=>[h,r[i]])));};
for(const [metric,factor] of [["visitors",1],["views",2],["checkouts",3],["sales",1],["cents",101]] as const){
 const result=customRangeWeekdays(data,metric);
 is(metric+" Monday median includes zero",result.rows[0].median,2*factor);
 is(metric+" Monday active days exclude zero",result.rows[0].activeDays,2);
 is(metric+" Tuesday even median uses midpoint",result.rows[1].median,1.5*factor);
 is(metric+" absent weekday values unavailable",[result.rows[2].median,result.rows[2].activeDays],[null,null]);
 is(metric+" original mean preserved",result.rows[0].average,102*factor/3);
 is(metric+" original total preserved",result.rows[0].total,102*factor);
}
const csv=records();
is("CSV monetary median uses major unit",csv[0]["Median per recorded day (unrounded)"],"2.02");
is("CSV fractional minor unit preserved",csv[1]["Median per recorded day (unrounded)"],"1.515");
is("CSV active days are counts",csv[0]["Days with activity"],"2");
is("CSV unavailable values blank",[csv[2]["Median per recorded day (unrounded)"],csv[2]["Days with activity"]],["",""]);
is("JPY median currency scale",records({...data,currency:"jpy"})[1]["Median per recorded day (unrounded)"],"151.5");
const zero={...data,days:data.days.map(d=>({...d,cents:0,sales:0}))};
is("observed zeros preserve zero median and activity",[customRangeWeekdays(zero,"sales").rows[0].median,customRangeWeekdays(zero,"sales").rows[0].activeDays],[0,0]);
is("CSV confirmed zero activity is zero",records(zero,"sales")[0]["Days with activity"],"0");
is("one observed day median is its value",customRangeWeekdays({...data,days:[data.days[0]]},"visitors").rows[0].median,100);
is("no observations no invented distribution",customRangeWeekdays({...data,days:[]},"sales").rows.every(r=>r.median===null&&r.activeDays===null),true);
is("empty CSV header only",records({...data,days:[]}).length,0);
const free={...data,days:data.days.map(d=>({...d,cents:0}))};
is("sales activity independent of positive revenue",[customRangeWeekdays(free,"sales").rows[0].activeDays,customRangeWeekdays(free,"cents").rows[0].activeDays],[2,0]);
for(const d of [{...zero,partial:true},{...zero,sales:"none" as const},{...zero,sales:"error" as const}]){
 for(const metric of ["sales","cents"] as const){
  const r=customRangeWeekdays(d,metric);
  is("paid fallback uses traffic distribution",[r.metric,r.rows[0].median,r.rows[0].activeDays],["visitors",2,2]);
  is("CSV fallback actual metric",records(d,metric)[0].Metric,"Visitors");
 }
}
const render=(d=data)=>renderToStaticMarkup(createElement(CustomRangeChartSummary,{range:d,currency:d.currency,metric:"sales"}));
const html=render();
is("median column heading",html.includes('>Median per recorded day</th>'),true);
is("active-day column heading",html.includes('>Days with activity</th>'),true);
is("fractional count median shown",html.includes('>1.5</td>'),true);
is("median and activity definitions explicit",html.includes("zero days count")&&html.includes("Days with activity count positive daily values"),true);
is("CSV definition explains no observations",csv[0].Definition.includes("no observations means blank median and activity count"),true);
is("source order unchanged",data.days[0].date,"2026-10-19");
done();
