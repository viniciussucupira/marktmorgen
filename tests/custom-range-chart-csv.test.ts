import { customRangeChartReport } from "@/lib/channel-reports";
import { CustomRangeChart } from "@/components/custom-range";
import type { CustomRangeMetric, CustomRangeGrouping } from "@/lib/custom-range-chart";
import type { RangeData } from "@/lib/stats";
import { parseCsv } from "@/lib/csv";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const row=(date:string,n:number)=>({date,visitors:n,views:n*2,checkouts:n*3,sales:n,cents:n*101});
const data:RangeData={from:"2026-09-30",to:"2026-10-05",currency:"usd",sales:"ok",partial:false,elsewhere:0,days:[row("2026-09-30",1),row("2026-10-01",2),row("2026-10-04",3),row("2026-10-05",4)],totals:{visitors:10,views:20,checkouts:30,sales:10,cents:1010},before:null,channels:[],products:[],channelsTruncated:true,productsTruncated:true};
const records=(csv:string)=>{const parsed=parseCsv(csv);return parsed.rows.map(row=>Object.fromEntries(parsed.header.map((key,i)=>[key,row[i]])));};
part("Chart CSV follows selected metric and calendar grouping");
const weekly=records(customRangeChartReport(data,"cents","week"));
is("one row per week",weekly.length,2);
is("period and currency preserved",[weekly[0]["From (UTC)"],weekly[0]["To (UTC)"],weekly[0].Currency],[data.from,data.to,"USD"]);
is("group boundary dates preserved",[weekly[0]["Group from (UTC)"],weekly[0]["Group to (UTC)"]],["2026-09-30","2026-10-04"]);
is("grouping and metric explicit",[weekly[0].Grouping,weekly[0]["Requested metric"],weekly[0].Metric,weekly[0].Unit],["Week","Revenue","Revenue","USD"]);
is("minor-unit sums converted once",weekly.map(row=>row.Value),["6.06","4.04"]);
is("confirmed coverage recorded",weekly[0]["Paid coverage"],"Complete");
is("monthly grouping follows calendar",records(customRangeChartReport(data,"cents","month")).map(row=>row.Value),["1.01","9.09"]);
for(const [metric,label,multiplier] of [["visitors","Visitors",1],["views","Page views",2],["checkouts","Checkouts started",3],["sales","Sales",1]] as const){
 const rows=records(customRangeChartReport(data,metric,"day"));
 is(metric+" daily count values",rows.map(row=>row.Value),[1,2,3,4].map(n=>String(n*multiplier)));
 is(metric+" count unit and label",[rows[0].Unit,rows[0].Metric],["Count",label]);
}
is("visitor counting definition retained",weekly[0].Definition.includes("not distinct people across the group"),true);
is("partial group definition retained",weekly[0].Definition.includes("boundary groups may be partial"),true);
is("gross purchase scope explicit",weekly[0].Definition.includes("exclude renewals")&&weekly[0].Definition.includes("before refunds, fees, ads"),true);
part("Unavailable financial selections export the actual traffic chart");
for(const [snapshot,coverage] of [[{...data,partial:true},"Incomplete"],[{...data,sales:"error" as const},"Unavailable"],[{...data,sales:"none" as const},"Unavailable"]] as const){
 const rows=records(customRangeChartReport(snapshot,"cents","week"));
 is(coverage+" original selection retained",rows[0]["Requested metric"],"Revenue");
 is(coverage+" actual traffic selection explicit",[rows[0].Metric,rows[0].Unit,rows[0].Value],["Visitors","Count","6"]);
 is(coverage+" paid coverage explicit",rows[0]["Paid coverage"],coverage);
 is(coverage+" no partial revenue",rows.some(row=>row.Value==="6.06"),false);
}
is("zero confirmed money exports zero",records(customRangeChartReport({...data,days:[row("2026-10-01",0)]},"cents","day"))[0].Value,"0");
is("yen uses zero decimal units",records(customRangeChartReport({...data,currency:"jpy"},"cents","week"))[0].Value,"606");
is("empty chart exports header only",records(customRangeChartReport({...data,days:[]},"cents","week")).length,0);
is("unknown grouping exports actual day",records(customRangeChartReport(data,"visitors","bad" as CustomRangeGrouping))[0].Grouping,"Day");
is("untrusted requested label remains formula safe",records(customRangeChartReport(data,"=1+1" as CustomRangeMetric,"day"))[0]["Requested metric"],"'=1+1");
const file=customRangeChartReport(data,"cents","week");
is("Excel UTF-8 marker retained",file.charCodeAt(0),0xFEFF);
is("CSV uses CRLF",file.includes("\r\n"),true);
const html=renderToStaticMarkup(createElement(CustomRangeChart,{range:data,currency:"usd",metric:"cents",grouping:"week"}));
is("actual chart offers download",html.includes("Download chart values"),true);
is("empty chart does not offer empty download",renderToStaticMarkup(createElement(CustomRangeChart,{range:{...data,days:[]},currency:"usd"})).includes("Download chart values"),false);
is("source amount unchanged",data.days[0].cents,101);
done();
