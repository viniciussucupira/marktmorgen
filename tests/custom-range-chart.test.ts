import { CustomRangeChart, CustomRangeResults } from "@/components/custom-range";
import { effectiveCustomRangeMetric, type CustomRangeMetric } from "@/lib/custom-range-chart";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const range:RangeData={from:"2026-10-01",to:"2026-10-02",currency:"usd",sales:"ok",partial:false,elsewhere:0,
 days:[{date:"2026-10-01",visitors:10,views:30,checkouts:4,sales:2,cents:12345},{date:"2026-10-02",visitors:5,views:10,checkouts:1,sales:1,cents:2500}],
 totals:{visitors:15,views:40,checkouts:5,sales:3,cents:14845},before:null,channels:[],products:[]};
const render=(metric:CustomRangeMetric,data=range)=>renderToStaticMarkup(createElement(CustomRangeChart,{range:data,currency:"usd",metric,onMetricChange:()=>{}}));
part("Daily chart uses the selected metric and its own scale");
for(const [metric,label,title] of [["visitors","Visitors","10 visitors"],["views","Page views","30 page views"],["checkouts","Checkouts started","4 checkouts started"],["sales","Sales","2 sales"],["cents","Revenue","$123.45 revenue"]] as const){
 const html=render(metric);
 is(metric+" chart label",html.includes('aria-label="'+label+' each day"'),true);
 is(metric+" exact daily value",html.includes(title),true);
 is(metric+" selected option",html.includes('value="'+metric+'" selected=""'),true);
}
is("visitor scale uses visits",render("visitors").includes("height:50%"),true);
is("checkout scale uses checkouts",render("checkouts").includes("height:25%"),true);
is("revenue definition visible",render("cents").includes("before fees, refunds and ad spend"),true);
is("paid scope includes extras, excludes renewals",render("sales").includes("include one-click extras and exclude renewals"),true);
is("selector has explicit label",render("views").includes('for="range-chart-metric"'),true);
part("A persisted financial selection cannot leak a new incomplete reading");
for(const data of [{...range,partial:true},{...range,sales:"error" as const},{...range,sales:"none" as const}]){
 for(const metric of ["sales","cents"] as const){
  const html=render(metric,data);
  is(data.sales+"/"+data.partial+"/"+metric+" falls back to visitors",effectiveCustomRangeMetric(data,metric),"visitors");
  is(data.sales+"/"+data.partial+"/"+metric+" hides paid daily values",html.includes("$123.45")||html.includes(", 2 sales"),false);
 }
 is("unavailable paid options disabled",(render("cents",data).match(/disabled=""/g)??[]).length,2);
 is("traffic metric remains available",effectiveCustomRangeMetric(data,"checkouts"),"checkouts");
}
is("unknown metric safely falls back",effectiveCustomRangeMetric(range,"bad" as CustomRangeMetric),"visitors");
const zero={...range,days:range.days.map(row=>({...row,visitors:0,views:0,checkouts:0,sales:0,cents:0}))};
is("confirmed zero revenue stays available",render("cents",zero).includes("$0.00 revenue"),true);
is("zero chart has finite heights",/NaN|Infinity/.test(render("cents",zero)),false);
is("empty chart has finite heights",/NaN|Infinity/.test(render("cents",{...range,days:[]})),false);
is("source reading remains intact",range.days[0].cents,12345);
is("actual results expose the metric selector",renderToStaticMarkup(createElement(CustomRangeResults,{range:{...range,products:[]},marks:[],currency:"usd"})).includes('id="range-chart-metric"'),true);
done();
