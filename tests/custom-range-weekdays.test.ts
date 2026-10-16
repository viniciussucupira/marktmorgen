import { customRangeWeekdays, type CustomRangeMetric } from "@/lib/custom-range-chart";
import { customRangeWeekdayReport } from "@/lib/channel-reports";
import { CustomRangeChartSummary, CustomRangeChart } from "@/components/custom-range";
import { parseCsv } from "@/lib/csv";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is } from "./check";
const row=(date:string,n:number)=>({date,visitors:n,views:n*2,checkouts:n*3,sales:n,cents:n*101});
const data:RangeData={from:"2026-10-05",to:"2026-10-12",currency:"usd",sales:"ok",partial:false,elsewhere:0,before:null,channels:[],products:[],totals:{visitors:999,views:999,checkouts:999,sales:999,cents:999},days:[row("2026-10-12",0),row("2026-10-11",5),row("2026-10-05",1),row("2026-10-10",2),row("2026-10-06",3)]};
const records=(d=data,metric:CustomRangeMetric="cents")=>{const p=parseCsv(customRangeWeekdayReport(d,metric));return p.rows.map(r=>Object.fromEntries(p.header.map((h,i)=>[h,r[i]])));};
for(const [metric,factor] of [["visitors",1],["views",2],["checkouts",3],["sales",1],["cents",101]] as const){
 const result=customRangeWeekdays(data,metric);
 is(metric+" week starts Monday and ends Sunday",result.rows.map(r=>r.name),["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]);
 is(metric+" Monday counts zero recorded day",result.rows[0].days,2);
 is(metric+" Monday total uses recorded rows",result.rows[0].total,factor);
 is(metric+" weekday-specific denominator",result.rows[0].average,factor/2);
 is(metric+" absent Wednesday not invented zero",[result.rows[2].days,result.rows[2].total,result.rows[2].average],[0,null,null]);
 is(metric+" Sunday is correct UTC bucket",result.rows[6].total,5*factor);
}
const csv=records();
is("all weekday rows exported",csv.length,7);
is("Monday currency scale",csv[0]["Recorded total"],"1.01");
is("unrounded monetary average",csv[0]["Average per recorded day (unrounded)"],"0.505");
is("absent weekday exports blank values",[csv[2]["Recorded days"],csv[2]["Recorded total"],csv[2]["Average per recorded day (unrounded)"]],["0","",""]);
is("confirmed zero weekday remains zero",records({...data,days:[row("2026-10-05",0)]})[0]["Recorded total"],"0");
is("JPY scale correct",records({...data,currency:"jpy"})[0]["Average per recorded day (unrounded)"],"50.5");
is("count average is not money",records(data,"sales")[0]["Average per recorded day (unrounded)"],"0.5");
is("requested and effective metric named",[csv[0]["Requested metric"],csv[0].Metric,csv[0].Unit],["Revenue","Revenue","USD"]);
is("year boundary uses actual UTC weekday",customRangeWeekdays({...data,days:[row("2027-01-01",7)]},"visitors").rows[4].total,7);
is("model empty weekdays unavailable",customRangeWeekdays({...data,days:[]},"sales").rows.every(r=>r.days===0&&r.total===null&&r.average===null),true);
is("empty CSV stays header only",records({...data,days:[]}).length,0);
for(const d of [{...data,partial:true},{...data,sales:"none" as const},{...data,sales:"error" as const}]){
 for(const metric of ["sales","cents"] as const){
  const result=customRangeWeekdays(d,metric),r=records(d,metric);
  is("unavailable paid values use traffic",[result.metric,result.rows[0].total,result.rows[0].average],["visitors",1,0.5]);
  is("CSV fallback explicit",[r[0].Metric,r[0].Unit,r[0]["Recorded total"]],["Visitors","Count","1"]);
 }
}
const render=(d=data)=>renderToStaticMarkup(createElement(CustomRangeChartSummary,{range:d,currency:d.currency,metric:"sales"}));
const html=render();
is("weekday detail control visible",html.includes("Compare weekdays (UTC)"),true);
is("table region labeled",html.includes('aria-label="Weekday activity"'),true);
is("caption identifies effective metric",html.includes("Sales by recorded UTC weekday"),true);
is("sample count heading",html.includes(">Recorded days</th>"),true);
is("absent weekday remains unavailable",html.includes(">Unavailable</td>"),true);
is("dedicated export available",html.includes("Download weekday results"),true);
is("scope and unequal samples explained",html.includes("samples may differ")&&html.includes("Missing dates are excluded"),true);
is("grouping and accumulation keep weekday comparison",renderToStaticMarkup(createElement(CustomRangeChart,{range:data,currency:"usd",metric:"sales",grouping:"month",cumulative:true})).includes("Sales by recorded UTC weekday"),true);
is("empty UI absent",render({...data,days:[]}),"");
is("partial caption uses traffic",render({...data,partial:true}).includes("Visitors by recorded UTC weekday"),true);
is("input order unchanged",data.days[0].date,"2026-10-12");
is("CSV cautions against causal conclusion",csv[0].Definition.includes("Not a forecast or proof that a weekday causes better results"),true);
done();
