import { customRangeChartRows, customRangeChartSummary, type CustomRangeMetric } from "@/lib/custom-range-chart";
import { customRangeChartReport } from "@/lib/channel-reports";
import { CustomRangeChart } from "@/components/custom-range";
import { parseCsv } from "@/lib/csv";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const row=(date:string,n:number)=>({date,visitors:n,views:n*2,checkouts:n*3,sales:n,cents:n*101});
const data:RangeData={from:"2026-09-30",to:"2026-10-05",currency:"usd",sales:"ok",partial:false,elsewhere:0,before:null,channels:[],products:[],days:[row("2026-10-05",4),row("2026-09-30",1),row("2026-10-04",3),row("2026-10-01",2)],totals:{visitors:8,views:20,checkouts:30,sales:10,cents:1010}};
const records=(text:string)=>{const p=parseCsv(text);return p.rows.map(r=>Object.fromEntries(p.header.map((key,i)=>[key,r[i]])));};
const render=(d=data,cumulative=true,metric:CustomRangeMetric="cents")=>renderToStaticMarkup(createElement(CustomRangeChart,{range:d,currency:d.currency,metric,grouping:"week",cumulative}));
part("Accumulate recorded groups in chronological order");
for(const [metric,factor] of [["visitors",1],["views",2],["checkouts",3],["sales",1],["cents",101]] as const){
 is(metric+" daily accumulation",customRangeChartRows(data,metric,"day",true).map(r=>r.value),[1,3,6,10].map(n=>n*factor));
 is(metric+" weekly accumulation",customRangeChartRows(data,metric,"week",true).map(r=>r.value),[6,10].map(n=>n*factor));
 is(metric+" monthly accumulation",customRangeChartRows(data,metric,"month",true).map(r=>r.value),[1,10].map(n=>n*factor));
 is(metric+" per-group default preserved",customRangeChartRows(data,metric,"week").map(r=>r.value),[6,4].map(n=>n*factor));
}
is("cumulative tooltip paid counts match accumulated traffic",customRangeChartRows(data,"visitors","week",true).map(r=>r.sales),[6,10]);
is("group dates stay recorded",customRangeChartRows(data,"visitors","week",true).map(r=>[r.from,r.to]),[["2026-09-30","2026-10-04"],["2026-10-05","2026-10-05"]]);
is("missing dates are not padded",customRangeChartRows(data,"visitors","day",true).length,4);
is("visitor total estimate not substituted for daily event sum",customRangeChartRows(data,"visitors","week",true).at(-1)!.value,10);
is("summary peak still uses daily values",customRangeChartSummary(data,"visitors")!.peak,{date:"2026-10-05",value:4,ties:1});
is("summary daily average unchanged",customRangeChartSummary(data,"visitors")!.average,2.5);
is("input date order unchanged",data.days.map(r=>r.date),["2026-10-05","2026-09-30","2026-10-04","2026-10-01"]);
part("CSV identifies cumulative values and their date coverage");
const cumulative=records(customRangeChartReport(data,"cents","week",true));
is("major-unit currency totals",cumulative.map(r=>r.Value),["6.06","10.1"]);
is("accumulation explicit",cumulative.map(r=>r.Accumulation),["Cumulative","Cumulative"]);
is("value starts at selected date",cumulative.map(r=>r["Value from (UTC)"]),[data.from,data.from]);
is("through dates remain group ends",cumulative.map(r=>r["Group to (UTC)"]),["2026-10-04","2026-10-05"]);
is("requested metric and actual unit",[cumulative[0]["Requested metric"],cumulative[0].Metric,cumulative[0].Unit],["Revenue","Revenue","USD"]);
is("default export remains per group",records(customRangeChartReport(data,"cents","week")).map(r=>r.Value),["6.06","4.04"]);
is("default accumulation marked",records(customRangeChartReport(data,"cents","week"))[0].Accumulation,"Per group");
is("default value starts at group start",records(customRangeChartReport(data,"cents","week"))[1]["Value from (UTC)"],"2026-10-05");
is("JPY scale correct",records(customRangeChartReport({...data,currency:"jpy"},"cents","week",true))[1].Value,"1010");
is("zero cumulative stays zero",records(customRangeChartReport({...data,days:[row("2026-10-01",0)]},"cents","day",true))[0].Value,"0");
is("empty chart remains header-only",records(customRangeChartReport({...data,days:[]},"cents","day",true)).length,0);
is("definition warns about nonunique visitors",cumulative[0].Definition.includes("cumulative visitors are not distinct people across the period"),true);
part("Partial payments cannot leak into accumulated values");
for(const d of [{...data,partial:true},{...data,sales:"error" as const},{...data,sales:"none" as const}]){
 for(const metric of ["cents","sales"] as const){
  const rows=customRangeChartRows(d,metric,"week",true),csv=records(customRangeChartReport(d,metric,"week",true));
  is("unavailable money uses observed traffic",rows.map(r=>r.value),[6,10]);
  is("unknown paid tooltip stays absent",rows.map(r=>r.sales),[null,null]);
  is("CSV fallback explicit",[csv[0].Metric,csv[0].Unit,csv[1].Value],["Visitors","Count","10"]);
 }
}
part("UI control, values and summary remain explicit");
const html=render();
is("checkbox labeled",html.includes('for="range-chart-cumulative"'),true);
is("cumulative selection checked",/<input[^>]*id="range-chart-cumulative"[^>]*checked=""/.test(html),true);
is("default selection unchecked",/<input[^>]*id="range-chart-cumulative"[^>]*checked=""/.test(render(data,false)),false);
is("chart accessible label identifies accumulation",html.includes('aria-label="Cumulative recorded Revenue by week"'),true);
is("table through-date heading",html.includes("Through (UTC)"),true);
is("last cumulative currency value shown",html.includes(">$10.10</td>"),true);
is("daily summary meaning explained",html.includes("summary below still uses daily values"),true);
is("missing days explanation",html.includes("Missing days are not invented"),true);
is("no empty download",render({...data,days:[]}).includes("Download chart values"),false);
is("partial UI fallback labeled",render({...data,partial:true}).includes('aria-label="Cumulative recorded Visitors by week"'),true);
done();
