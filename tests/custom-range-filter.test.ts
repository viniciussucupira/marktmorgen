import { customRangeView, effectiveCustomRangeFilter, type CustomRangeFilter } from "@/lib/custom-range-view";
import { customRangeChannelsReport, customRangeProductsReport } from "@/lib/channel-reports";
import { CustomRangeResults } from "@/components/custom-range";
import { parseCsv } from "@/lib/csv";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const data={from:"2026-10-01",to:"2026-10-02",currency:"usd",sales:"ok",partial:false,elsewhere:0,totals:{visitors:120,views:120,checkouts:5,sales:3,cents:3000},before:null,days:[],
 channels:[{source:"google",visits:100,sales:0,cents:0},{source:"email",visits:20,sales:2,cents:2000},{source:"direct",visits:0,sales:0,cents:0},{source:"import",visits:0,sales:1,cents:1000}],
 products:[{id:"guide",title:"Café Guide",views:100,checkouts:3,sales:0,cents:0},{id:"course",title:"Email Course",views:20,checkouts:2,sales:2,cents:2000},{id:"quiet",title:"Quiet",views:0,checkouts:0,sales:0,cents:0},{id:"imported",title:"Imported",views:0,checkouts:0,sales:1,cents:1000}],
 channelsTotal:20,channelsTruncated:true,productsTotal:25,productsTruncated:true} as Omit<RangeData,"products">&{products:(RangeData["products"][number]&{title:string})[]};
const view=(filter:CustomRangeFilter)=>customRangeView(data,"","recorded",filter);
part("Purchase filters classify only complete recorded readings");
const paid=view("paid"),unconverted=view("unconverted");
is("paid channels include purchases without observed traffic",paid.channels.map(r=>r.source),["email","import"]);
is("paid products include purchases without observed views",paid.products.map(r=>r.id),["course","imported"]);
is("traffic without sales excludes quiet channels",unconverted.channels.map(r=>r.source),["google"]);
is("traffic without sales uses product views",unconverted.products.map(r=>r.id),["guide"]);
is("all filter preserves source reference",view("all")===data,true);
is("accent-insensitive search combines with filter",customRangeView(data,"CAFE","recorded","unconverted").products.map(r=>r.id),["guide"]);
is("search combines with channel filter",customRangeView(data,"email","recorded","paid").channels.map(r=>r.source),["email"]);
is("sort combines with filter",customRangeView(data,"","sales_asc","paid").channels.map(r=>r.source),["import","email"]);
is("unmatched query stays empty",customRangeView(data,"missing","recorded","paid").products.length,0);
is("whole period totals preserved",unconverted.totals===data.totals,true);
is("daily results preserved",unconverted.days===data.days,true);
is("source limits preserved",[paid.channelsTotal,paid.channelsTruncated,paid.productsTotal,paid.productsTruncated],[20,true,25,true]);
is("source arrays unchanged",[data.channels.length,data.products.length],[4,4]);
is("unknown filter safely falls back",effectiveCustomRangeFilter(data,"=1+1"),"all");
part("Missing paid readings cannot invent zero-purchase opportunities");
for(const snapshot of [{...data,partial:true},{...data,sales:"none" as const},{...data,sales:"error" as const}]){
 for(const filter of ["paid","unconverted"] as const){
  is(snapshot.sales+"/"+snapshot.partial+"/"+filter+" uses all rows",effectiveCustomRangeFilter(snapshot,filter),"all");
  is(snapshot.sales+"/"+snapshot.partial+"/"+filter+" retains original snapshot",customRangeView(snapshot,"","recorded",filter)===snapshot,true);
 }
}
part("CSV reflects the displayed filter while preserving full-period metadata");
const records=(csv:string)=>{const p=parseCsv(csv);return p.rows.map(row=>Object.fromEntries(p.header.map((key,i)=>[key,row[i]])));};
const channels=records(customRangeChannelsReport(unconverted,{filter:"unconverted"}));
const products=records(customRangeProductsReport(paid,{filter:"paid"}));
is("filtered channel rows exported",channels.map(row=>row.Channel),["Google"]);
is("filtered product rows exported",products.map(row=>row["Product ID"]),["course","imported"]);
is("channel filter metadata explicit",channels[0]["Sales filter"],"Traffic without sales");
is("product filter metadata explicit",products[0]["Sales filter"],"With sales");
is("original source limit remains explicit",[channels[0]["Displayed rows"],channels[0]["Recorded rows"],channels[0]["List truncated"]],["1","20","Yes"]);
is("confirmed zero paid records remain zero",channels[0]["Paid records"],"0");
is("definition explains clearing filters",channels[0].Definition.includes("clear the search and sales filter"),true);
const partial=records(customRangeChannelsReport({...data,partial:true},{filter:"unconverted"}));
is("CSV partial filter metadata reflects fallback",partial[0]["Sales filter"],"All loaded rows");
is("CSV partial paid values remain blank",partial[0]["Paid records"],"");
is("old CSV callers use default filter",records(customRangeProductsReport(data))[0]["Sales filter"],"All loaded rows");
const render=(snapshot=data)=>renderToStaticMarkup(createElement(CustomRangeResults,{range:snapshot,marks:[],currency:"usd"}));
const selector=(html:string)=>{const at=html.indexOf('<select id="range-sales-filter"');return html.slice(at,html.indexOf("</select>",at));};
is("filter has accessible label",render().includes('for="range-sales-filter"'),true);
is("all four options visible",["All loaded rows","With sales","Traffic without sales","Sales without recorded traffic"].every(label=>selector(render()).includes(label)),true);
is("complete filter options enabled",selector(render()).includes('disabled=""'),false);
is("partial filter options disabled",(selector(render({...data,partial:true})).match(/disabled=""/g)??[]).length,3);
is("scope and coverage explained",render().includes("recorded visits or views with zero recorded purchases")&&render().includes("require a complete purchase reading"),true);
done();
