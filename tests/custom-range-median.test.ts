import { customRangeChartSummary, type CustomRangeMetric } from "@/lib/custom-range-chart";
import { customRangeChartSummaryReport } from "@/lib/channel-reports";
import { CustomRangeChartSummary, CustomRangeChart } from "@/components/custom-range";
import type { RangeData } from "@/lib/stats";
import { parseCsv } from "@/lib/csv";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is } from "./check";
const row=(date:string,n:number)=>({date,visitors:n,views:n*2,checkouts:n*3,sales:n,cents:n*101});
const data:RangeData={from:"2026-10-01",to:"2026-10-05",currency:"usd",sales:"ok",partial:false,elsewhere:0,before:null,channels:[],products:[],totals:{visitors:999,views:999,checkouts:999,sales:999,cents:999},days:[row("2026-10-05",100),row("2026-10-01",1),row("2026-10-03",2)]};
const record=(d:RangeData,metric:CustomRangeMetric)=>{const p=parseCsv(customRangeChartSummaryReport(d,metric,"week"));return Object.fromEntries(p.header.map((h,i)=>[h,p.rows[0]?.[i]]));};
for(const [metric,factor] of [["visitors",1],["views",2],["checkouts",3],["sales",1],["cents",101]] as const){
 is(metric+" odd count central value",customRangeChartSummary(data,metric)!.median,2*factor);
 const even={...data,days:[...data.days,row("2026-10-04",3)]};
 is(metric+" even count midpoint",customRangeChartSummary(even,metric)!.median,2.5*factor);
 is(metric+" median unaffected by large outlier",customRangeChartSummary({...data,days:[row("2026-10-01",1),row("2026-10-02",2),row("2026-10-03",10000)]},metric)!.median,2*factor);
}
is("daily mean remains different from median",customRangeChartSummary(data,"visitors")!.average,103/3);
is("daily total preserved",customRangeChartSummary(data,"visitors")!.total,103);
is("peak preserved",customRangeChartSummary(data,"visitors")!.peak.value,100);
is("missing days not padded",customRangeChartSummary(data,"visitors")!.median,2);
is("source order unmodified",data.days.map(d=>d.visitors),[100,1,2]);
is("zero days enter median",customRangeChartSummary({...data,days:[row("2026-10-01",0),row("2026-10-02",0),row("2026-10-03",100)]},"cents")!.median,0);
is("one recorded value is its own median",customRangeChartSummary({...data,days:[data.days[1]]},"sales")!.median,1);
is("empty reading has no median",customRangeChartSummary({...data,days:[]},"visitors"),null);
const fractional={...data,days:[row("2026-10-01",0),row("2026-10-02",1)]};
is("USD median keeps fractional cents in CSV",record(fractional,"cents")["Median per recorded day (unrounded)"],"0.505");
is("JPY median uses currency scale",record({...fractional,currency:"jpy"},"cents")["Median per recorded day (unrounded)"],"50.5");
is("count median keeps half events",record(fractional,"sales")["Median per recorded day (unrounded)"],"0.5");
is("confirmed zero CSV remains zero",record({...data,days:[row("2026-10-01",0)]},"cents")["Median per recorded day (unrounded)"],"0");
is("empty CSV header-only",parseCsv(customRangeChartSummaryReport({...data,days:[]},"cents")).rows.length,0);
for(const d of [{...data,partial:true},{...data,sales:"none" as const},{...data,sales:"error" as const}]){
 for(const metric of ["sales","cents"] as const){
  const s=customRangeChartSummary(d,metric)!;
  is("unavailable paid median uses traffic",[s.metric,s.median],["visitors",2]);
  is("CSV metric identifies fallback",record(d,metric).Metric,"Visitors");
 }
}
const render=(d=data,metric:CustomRangeMetric="sales")=>renderToStaticMarkup(createElement(CustomRangeChartSummary,{range:d,currency:d.currency,metric}));
is("median semantic label",render().includes("Median per recorded day</dt>"),true);
is("count midpoint shown",render(fractional).includes(">0.5</dd>"),true);
is("definition explains even readings",render().includes("midpoint of the two middle values"),true);
is("empty UI remains absent",render({...data,days:[]}),"");
is("fallback UI leaks no paid currency",render({...data,partial:true},"cents").includes("$"),false);
is("grouped cumulative chart retains daily median",renderToStaticMarkup(createElement(CustomRangeChart,{range:data,currency:"usd",metric:"sales",grouping:"month",cumulative:true})).includes("Median per recorded day"),true);
is("CSV definition explicit",record(data,"sales").Definition.includes("middle sorted recorded daily value"),true);
done();
