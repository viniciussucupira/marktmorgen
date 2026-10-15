import { customRangeView, customRangeSelectionTotals, effectiveCustomRangeFilter } from "@/lib/custom-range-view";
import { customRangeChannelsReport, customRangeProductsReport, customRangeSelectionReport } from "@/lib/channel-reports";
import { CustomRangeResults } from "@/components/custom-range";
import { parseCsv } from "@/lib/csv";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is } from "./check";
const data:RangeData={from:"2026-10-01",to:"2026-10-02",currency:"usd",sales:"ok",partial:false,elsewhere:0,before:null,days:[],totals:{visitors:10,views:10,checkouts:4,sales:8,cents:800},channelsTotal:30,channelsTruncated:true,productsTotal:40,productsTruncated:true,
 channels:[{source:"email",visits:0,sales:2,cents:200},{source:"google",visits:10,sales:5,cents:500},{source:"direct",visits:0,sales:0,cents:0},{source:"import",visits:0,sales:1,cents:100}],
 products:[{id:"a",views:0,checkouts:2,sales:2,cents:200},{id:"b",views:10,checkouts:1,sales:5,cents:500},{id:"c",views:0,checkouts:0,sales:0,cents:0},{id:"d",views:0,checkouts:1,sales:1,cents:100}]};
const view=customRangeView(data,"","recorded","untracked");
is("channels require positive purchases and exactly zero traffic",view.channels.map(r=>r.source),["email","import"]);
is("products use page views independently of checkout events",view.products.map(r=>r.id),["a","d"]);
is("whole period preserved",view.totals===data.totals,true);
is("days preserved",view.days===data.days,true);
is("list caps retained",[view.channelsTotal,view.channelsTruncated,view.productsTotal,view.productsTruncated],[30,true,40,true]);
is("input unchanged",[data.channels.length,data.products.length],[4,4]);
is("search combines",customRangeView(data,"email","recorded","untracked").channels.map(r=>r.source),["email"]);
is("sorting combines",customRangeView(data,"","sales_asc","untracked").products.map(r=>r.id),["d","a"]);
is("traffic minimum can legitimately exclude zero-traffic rows",customRangeView(data,"","recorded","untracked",1).channels.length,0);
is("paid minimum combines",customRangeView(data,"","recorded","untracked",0,2).channels.map(r=>r.source),["email"]);
is("selection total is only loaded selected revenue",customRangeSelectionTotals(view).channels.cents,300);
is("reset to all restores every loaded row",customRangeView(data,"","recorded","all")===data,true);
const records=(text:string)=>{const p=parseCsv(text);return p.rows.map(r=>Object.fromEntries(p.header.map((key,i)=>[key,r[i]])));};
for(const csv of [customRangeChannelsReport(view,{filter:"untracked"}),customRangeProductsReport(view,{filter:"untracked"}),customRangeSelectionReport(view,{filter:"untracked"})]){
 const rows=records(csv);
 is("CSV filter explicit",rows.every(r=>r["Sales filter"]==="Sales without recorded traffic"),true);
 is("CSV rows retained",rows.length,2);
}
is("channel export no invented traffic",records(customRangeChannelsReport(view,{filter:"untracked"}))[0].Visits,"0");
is("confirmed paid count exported",records(customRangeChannelsReport(view,{filter:"untracked"}))[0]["Paid records"],"2");
for(const d of [{...data,partial:true},{...data,sales:"none" as const},{...data,sales:"error" as const}]){
 is("incomplete financial reading disables classification",effectiveCustomRangeFilter(d,"untracked"),"all");
 is("fallback preserves traffic rows",customRangeView(d,"","recorded","untracked")===d,true);
 const rows=records(customRangeChannelsReport(d,{filter:"untracked"}));
 is("fallback CSV labels actual filter",rows[0]["Sales filter"],"All loaded rows");
 is("fallback paid values blank",rows[0]["Paid records"],"");
}
const html=renderToStaticMarkup(createElement(CustomRangeResults,{range:{...data,products:data.products.map(row=>({...row,title:row.id}))},marks:[],currency:"usd"}));
is("new option shown",html.includes('value="untracked"'),true);
is("meaning explained without invented cause",html.includes("this does not establish why traffic is absent"),true);
is("scope stays selected dates",html.includes("zero visits or views in the selected dates"),true);
is("negative traffic is not treated as zero",customRangeView({...data,channels:[{source:"invalid",visits:-1,sales:2,cents:200}]},"","recorded","untracked").channels.length,0);
is("NaN traffic is not treated as zero",customRangeView({...data,channels:[{source:"invalid",visits:NaN,sales:2,cents:200}]},"","recorded","untracked").channels.length,0);
done();
