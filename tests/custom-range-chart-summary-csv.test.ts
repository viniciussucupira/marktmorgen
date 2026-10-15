import { customRangeChartSummaryReport } from "@/lib/channel-reports";
import { customRangeChartSummary, type CustomRangeMetric, type CustomRangeGrouping } from "@/lib/custom-range-chart";
import { CustomRangeChartSummary, CustomRangeChart } from "@/components/custom-range";
import { parseCsv } from "@/lib/csv";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const data:RangeData={from:"2026-10-01",to:"2026-10-03",currency:"usd",sales:"ok",partial:false,elsewhere:0,totals:{visitors:999,views:999,checkouts:999,sales:999,cents:999999},before:null,channels:[],products:[],days:[
 {date:"2026-10-02",visitors:2,views:30,checkouts:1,sales:2,cents:101},
 {date:"2026-10-01",visitors:4,views:10,checkouts:5,sales:1,cents:200},
 {date:"2026-10-03",visitors:0,views:20,checkouts:0,sales:0,cents:0},
]};
const rows=(csv:string)=>{const p=parseCsv(csv);return p.rows.map(row=>Object.fromEntries(p.header.map((key,i)=>[key,row[i]])));};
const record=(metric:CustomRangeMetric,range=data,grouping:CustomRangeGrouping="day")=>rows(customRangeChartSummaryReport(range,metric,grouping))[0];
part("Summary CSV follows the selected daily model independently of grouping");
const money=record("cents",data,"week");
is("single statistics row",rows(customRangeChartSummaryReport(data,"cents")).length,1);
is("period and currency explicit",[money["From (UTC)"],money["To (UTC)"],money.Currency],[data.from,data.to,"USD"]);
is("metric request and actual unit explicit",[money["Requested metric"],money.Metric,money.Unit],["Revenue","Revenue","USD"]);
is("chart grouping recorded as context",money["Chart grouping"],"Week");
is("recorded day count",money["Recorded days"],"3");
is("sum converted after minor-unit aggregation",money["Recorded total"],"3.01");
is("average exported before display rounding",Number(money["Average per recorded day (unrounded)"]),301/3/100);
is("first peak date and money",[money["First highest day (UTC)"],money["Highest daily value"]],["2026-10-01","2"]);
is("peak tie count explicit",money["Days tied for highest value"],"1");
is("financial coverage explicit",money["Paid coverage"],"Complete");
for(const metric of ["visitors","views","checkouts","sales"] as const){
 const row=record(metric);const model=customRangeChartSummary(data,metric)!;
 is(metric+" totals match displayed model",Number(row["Recorded total"]),model.total);
 is(metric+" average matches daily model",Number(row["Average per recorded day (unrounded)"]),model.average);
 is(metric+" unit is a count",row.Unit,"Count");
}
is("monthly context does not change daily average",record("views",data,"month")["Average per recorded day (unrounded)"],"20");
is("ties choose earliest day",record("visitors",{...data,days:data.days.map(day=>({...day,visitors:4}))})["First highest day (UTC)"],"2026-10-01");
is("all tied days exported",record("visitors",{...data,days:data.days.map(day=>({...day,visitors:4}))})["Days tied for highest value"],"3");
part("Unavailable requested financial metrics export the actual traffic fallback");
for(const [snapshot,coverage] of [[{...data,partial:true},"Incomplete"],[{...data,sales:"none" as const},"Unavailable"],[{...data,sales:"error" as const},"Unavailable"]] as const){
 const row=record("cents",snapshot);
 is(coverage+" requested metric retained",row["Requested metric"],"Revenue");
 is(coverage+" actual metric explicit",[row.Metric,row.Unit],["Visitors","Count"]);
 is(coverage+" traffic total not partial money",row["Recorded total"],"6");
 is(coverage+" paid coverage explicit",row["Paid coverage"],coverage);
}
is("zero confirmed amount remains zero",record("cents",{...data,days:data.days.map(day=>({...day,cents:0}))})["Recorded total"],"0");
is("empty reading exports no invented summary",rows(customRangeChartSummaryReport({...data,days:[]},"cents")).length,0);
is("yen uses zero-decimal amount units",record("cents",{...data,currency:"jpy"})["Recorded total"],"301");
is("unknown grouping falls back to day",record("visitors",data,"bad" as CustomRangeGrouping)["Chart grouping"],"Day");
is("requested metric label formula safe",record("=1+1" as CustomRangeMetric)["Requested metric"],"'=1+1");
is("rounding distinction explained",money.Definition.includes("before display rounding"),true);
is("daily basis independent of grouping explained",money.Definition.includes("regardless of chart grouping or list filters"),true);
is("visitor counting scope explained",money.Definition.includes("not distinct people across the period"),true);
const csv=customRangeChartSummaryReport(data,"cents");
is("UTF-8 marker preserved",csv.charCodeAt(0),0xFEFF);
is("CRLF preserved",csv.includes("\r\n"),true);
const html=renderToStaticMarkup(createElement(CustomRangeChartSummary,{range:data,currency:"usd",metric:"cents",grouping:"week"}));
is("summary exposes download",html.includes("Download chart summary"),true);
is("actual grouped chart exposes summary download",renderToStaticMarkup(createElement(CustomRangeChart,{range:data,currency:"usd",metric:"cents",grouping:"week"})).includes("Download chart summary"),true);
is("source data unchanged",data.totals.cents,999999);
done();
