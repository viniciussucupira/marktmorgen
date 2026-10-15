import { customRangeChartSummary, type CustomRangeMetric } from "@/lib/custom-range-chart";
import { customRangeChartSummaryReport } from "@/lib/channel-reports";
import { CustomRangeChartSummary, CustomRangeChart } from "@/components/custom-range";
import type { RangeData } from "@/lib/stats";
import { parseCsv } from "@/lib/csv";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is } from "./check";
const data:RangeData={from:"2026-10-01",to:"2026-10-05",currency:"usd",sales:"ok",partial:false,elsewhere:0,before:null,channels:[],products:[],totals:{visitors:99,views:99,checkouts:99,sales:99,cents:999},days:[
 {date:"2026-10-05",visitors:0,views:3,checkouts:0,sales:0,cents:0},
 {date:"2026-10-01",visitors:1,views:2,checkouts:0,sales:1,cents:100},
 {date:"2026-10-03",visitors:0,views:0,checkouts:1,sales:1,cents:0},
]};
const expected={visitors:[1,2],views:[2,1],checkouts:[1,2],sales:[2,1],cents:[1,2]};
const record=(d:RangeData,metric:CustomRangeMetric)=>{const p=parseCsv(customRangeChartSummaryReport(d,metric,"month"));return Object.fromEntries(p.header.map((h,i)=>[h,p.rows[0]?.[i]]));};
for(const metric of ["visitors","views","checkouts","sales","cents"] as const){
 const s=customRangeChartSummary(data,metric)!;
 is(metric+" follows its own daily values",[s.activeDays,s.zeroDays],expected[metric]);
 is(metric+" only observed days counted",s.activeDays+s.zeroDays,3);
 const r=record(data,metric);
 is(metric+" CSV counts are count units",[r["Days with activity"],r["Recorded days with zero activity"]],expected[metric].map(String));
 is(metric+" confirmed zero days included",s.days,3);
}
is("missing dates not classified as zero",customRangeChartSummary(data,"visitors")!.zeroDays,2);
is("unsorted source remains unchanged",data.days[0].date,"2026-10-05");
is("zero-priced purchases differ from positive revenue",customRangeChartSummary(data,"sales")!.activeDays!==customRangeChartSummary(data,"cents")!.activeDays,true);
const zero={...data,days:data.days.map(d=>({...d,cents:0}))};
is("confirmed empty revenue activity",[customRangeChartSummary(zero,"cents")!.activeDays,customRangeChartSummary(zero,"cents")!.zeroDays],[0,3]);
is("no days means no summary",customRangeChartSummary({...data,days:[]},"cents"),null);
is("empty CSV header only",parseCsv(customRangeChartSummaryReport({...data,days:[]},"cents")).rows.length,0);
for(const d of [{...data,partial:true},{...data,sales:"none" as const},{...data,sales:"error" as const}]){
 for(const metric of ["sales","cents"] as const){
  const s=customRangeChartSummary(d,metric)!;
  is("unavailable paid metrics count observed traffic",[s.metric,s.activeDays,s.zeroDays],["visitors",1,2]);
  is("CSV identifies fallback",record(d,metric).Metric,"Visitors");
 }
}
const render=(d=data)=>renderToStaticMarkup(createElement(CustomRangeChartSummary,{range:d,currency:d.currency,metric:"sales"}));
const html=render();
is("semantic activity label",html.includes("Days with activity</dt>"),true);
is("zero days explained",html.includes("1 recorded days with zero activity"),true);
is("missing days excluded",html.includes("missing days are excluded"),true);
is("effective metric scope explained",html.includes("Counts follow the selected metric"),true);
is("empty UI absent",render({...data,days:[]}),"");
const cumulative=renderToStaticMarkup(createElement(CustomRangeChart,{range:data,currency:"usd",metric:"sales",grouping:"month",cumulative:true}));
is("cumulative grouped chart keeps daily counts",cumulative.includes("1 recorded days with zero activity"),true);
is("CSV definition clarifies accumulation",record(data,"sales").Definition.includes("regardless of chart grouping or accumulation"),true);
done();
