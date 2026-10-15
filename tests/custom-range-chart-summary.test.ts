import { customRangeChartSummary, type CustomRangeMetric } from "@/lib/custom-range-chart";
import { CustomRangeChartSummary, CustomRangeChart } from "@/components/custom-range";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const data:RangeData={from:"2026-10-01",to:"2026-10-03",currency:"usd",sales:"ok",partial:false,elsewhere:0,totals:{visitors:999,views:999,checkouts:999,sales:999,cents:999999},before:null,channels:[],products:[],days:[
 {date:"2026-10-02",visitors:2,views:30,checkouts:1,sales:2,cents:101},
 {date:"2026-10-01",visitors:4,views:10,checkouts:5,sales:1,cents:200},
 {date:"2026-10-03",visitors:0,views:20,checkouts:0,sales:0,cents:0},
]};
const summary=(metric:CustomRangeMetric,range=data)=>customRangeChartSummary(range,metric)!;
part("Total average and peak follow the selected daily metric");
for(const [metric,total,average,date,peak] of [["visitors",6,2,"2026-10-01",4],["views",60,20,"2026-10-02",30],["checkouts",6,2,"2026-10-01",5],["sales",3,1,"2026-10-02",2],["cents",301,301/3,"2026-10-01",200]] as const){
 const result=summary(metric);
 is(metric+" total uses daily rows",result.total,total);
 is(metric+" average includes zero days",result.average,average);
 is(metric+" highest daily value",[result.peak.date,result.peak.value],[date,peak]);
}
is("period tile totals are not substituted",summary("visitors").total!==data.totals.visitors,true);
is("recorded day count explicit",summary("visitors").days,3);
is("source order unchanged",data.days[0].date,"2026-10-02");
const tied={...data,days:data.days.map(row=>({...row,visitors:4}))};
is("tie chooses earliest UTC date",summary("visitors",tied).peak.date,"2026-10-01");
is("tie count explicit",summary("visitors",tied).peak.ties,3);
const zero={...data,days:data.days.map(row=>({...row,cents:0}))};
is("confirmed zero total stays zero",summary("cents",zero).total,0);
is("confirmed zero average stays zero",summary("cents",zero).average,0);
is("empty reading has no invented average",customRangeChartSummary({...data,days:[]},"visitors"),null);
const gaps={...data,days:[data.days[1],data.days[2]]};
is("missing days are not invented",summary("visitors",gaps).days,2);
is("average denominator is recorded days",summary("visitors",gaps).average,2);
is("single recorded day average equals its value",summary("cents",{...data,days:[data.days[0]]}).average,101);
part("A prior paid choice is checked against each new reading");
for(const range of [{...data,partial:true},{...data,sales:"none" as const},{...data,sales:"error" as const}]){
 for(const metric of ["sales","cents"] as const){
  const result=summary(metric,range);
  is(range.sales+"/"+range.partial+"/"+metric+" actual metric is visitors",result.metric,"visitors");
  is(range.sales+"/"+range.partial+"/"+metric+" no partial money used",[result.total,result.average,result.peak.value],[6,2,4]);
 }
}
const render=(metric:CustomRangeMetric,range=data)=>renderToStaticMarkup(createElement(CustomRangeChartSummary,{range,currency:range.currency,metric}));
const html=render("cents");
part("Rendered summary names its scope and uses the store currency");
is("summary region labeled",html.includes('aria-label="Chart metric summary"'),true);
is("semantic summary labels",html.includes("Recorded total")&&html.includes("Average per recorded day")&&html.includes("Highest recorded day"),true);
is("selected metric and day count explicit",html.includes("Revenue over 3 recorded UTC days"),true);
is("smallest units preserved in total",html.includes("$3.01"),true);
is("money average rounded to store unit",html.includes(">$1</dd>"),true);
is("peak date visible",html.includes("Oct 1, 2026"),true);
is("ties disclosed",render("visitors",tied).includes("3 days tied; earliest shown"),true);
is("daily visitor scope explicit",render("visitors").includes("not distinct people across the period"),true);
is("empty summary stays absent",render("visitors",{...data,days:[]}),"");
is("partial paid summary leaks no money",render("cents",{...data,partial:true}).includes("$"),false);
is("yen uses zero decimal display",render("cents",{...data,currency:"jpy"}).includes("¥301"),true);
const chart=renderToStaticMarkup(createElement(CustomRangeChart,{range:data,currency:"usd",metric:"views",grouping:"week"}));
is("grouped chart includes daily summary",chart.includes("Page views by week")&&chart.includes("Highest recorded day"),true);
is("daily summary scope remains explicit when grouped",chart.includes("Summary uses daily rows even when the chart is grouped"),true);
is("original paid total unchanged",data.totals.cents,999999);
done();
