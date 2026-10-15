import { CustomRangeChartSummary } from "@/components/custom-range";
import { customRangeChartSummary, type CustomRangeMetric } from "@/lib/custom-range-chart";
import { customRangeChartSummaryReport } from "@/lib/channel-reports";
import { parseCsv } from "@/lib/csv";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is } from "./check";
const data:RangeData={from:"2026-01-01",to:"2026-12-31",currency:"usd",sales:"ok",partial:false,elsewhere:0,before:null,channels:[],products:[],totals:{visitors:1,views:1,checkouts:1,sales:1,cents:1},days:Array.from({length:365},(_,i)=>({date:new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10),visitors:i===0?1:0,views:i===0?1:0,checkouts:i===0?1:0,sales:i===0?1:0,cents:i===0?1:0}))};
const render=(metric:CustomRangeMetric,d=data)=>renderToStaticMarkup(createElement(CustomRangeChartSummary,{range:d,currency:d.currency,metric}));
const average=(html:string)=>html.match(new RegExp("Average per recorded day</dt><dd[^>]*>(.*?)</dd>"))![1];
for(const metric of ["visitors","views","checkouts","sales"] as const){
 is(metric+" small mean visible",average(render(metric)),"0.00274");
 is(metric+" raw mean unchanged",customRangeChartSummary(data,metric)!.average,1/365);
 is(metric+" true zero preserved",average(render(metric,{...data,days:data.days.map(d=>({...d,[metric]:0}))})),"0");
}
is("USD fraction of cent visible",average(render("cents")),"$0.0000274");
is("JPY fraction of unit visible",average(render("cents",{...data,currency:"jpy"})),"¥0.00274");
is("money zero stays zero",average(render("cents",{...data,days:data.days.map(d=>({...d,cents:0}))})),"$0");
is("half cent displayed",average(render("cents",{...data,days:data.days.slice(0,2)})),"$0.005");
is("ordinary money rounding preserved",average(render("cents",{...data,days:data.days.slice(0,2).map((d,i)=>({...d,cents:i===0?301:0}))})),"$1.51");
is("ordinary count precision preserved",average(render("visitors",{...data,days:data.days.slice(0,3)})),"0.33");
is("count threshold remains visible",average(render("visitors",{...data,days:data.days.slice(0,100)})),"0.01");
for(const d of [{...data,partial:true},{...data,sales:"none" as const},{...data,sales:"error" as const}]){
 is("paid fallback has no currency",render("cents",d).includes("$"),false);
 is("fallback mean is traffic",average(render("cents",d)),"0.00274");
}
const csv=customRangeChartSummaryReport(data,"cents","month");
const parsed=parseCsv(csv);
is("CSV retains full mean precision",parsed.rows.some(r=>r.includes(String(1/365/100))),true);
is("model retains full mean precision",customRangeChartSummary(data,"cents")!.average,1/365);
is("daily total and peak unchanged",[customRangeChartSummary(data,"cents")!.total,customRangeChartSummary(data,"cents")!.peak.value],[1,1]);
is("empty has no invented mean",render("cents",{...data,days:[]}),"");
is("precision explained",render("cents").includes("small nonzero averages remain visible"),true);
done();
