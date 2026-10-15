import { CustomRangeComparison } from "@/components/custom-range";
import { customRangeComparison } from "@/lib/custom-range-comparison";
import { customRangeComparisonReport } from "@/lib/channel-reports";
import { parseCsv } from "@/lib/csv";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const base:RangeData={from:"2026-10-01",to:"2026-10-02",currency:"usd",sales:"ok",partial:false,elsewhere:0,channels:[],products:[],days:[],totals:{visitors:100001,views:100001,checkouts:100001,sales:100001,cents:100001},before:{visitors:100000,views:100000,checkouts:100000,sales:100000,cents:100000}};
const render=(d:RangeData)=>renderToStaticMarkup(createElement(CustomRangeComparison,{range:d,currency:d.currency}));
const change=(d:RangeData,name:string)=>{const html=render(d),start=html.indexOf(">"+name+"</th>"),row=html.slice(start,html.indexOf("</tr>",start));return [...row.matchAll(/<td[^>]*>(.*?)<\/td>/g)][3][1];};
part("Small relative changes keep their direction");
for(const name of ["Visitors","Page views","Checkouts","Paid records","Gross revenue"]){
 is(name+" small growth",change(base,name),"+0.001%");
 const decline={...base,totals:{visitors:99999,views:99999,checkouts:99999,sales:99999,cents:99999}};
 is(name+" small decline",change(decline,name),"-0.001%");
}
const tiny={...base,totals:{...base.totals,visitors:Number.MAX_SAFE_INTEGER},before:{...base.before!,visitors:Number.MAX_SAFE_INTEGER-1}};
is("largest safe counts retain nonzero growth",change(tiny,"Visitors"),"+0.0000000000000111%");
is("zero stays zero",change({...base,totals:base.before!},"Visitors"),"0%");
is("missing history stays unavailable",change({...base,before:null},"Visitors"),"—");
is("previous zero stays unavailable",change({...base,before:{...base.before!,visitors:0}},"Visitors"),"—");
is("partial payments stay unavailable",change({...base,partial:true},"Paid records"),"—");
is("traffic survives partial payments",change({...base,partial:true},"Visitors"),"+0.001%");
part("Existing presentation and exported precision remain intact");
for(const [visitors,expected] of [[100100,"+0.1%"],[99900,"-0.1%"],[150000,"+50%"],[0,"-100%"]] as const){
 is("ordinary change "+visitors,change({...base,totals:{...base.totals,visitors}},"Visitors"),expected);
}
const below={...base,totals:{...base.totals,visitors:100099}};
is("below threshold preserves significant digits",change(below,"Visitors"),"+0.099%");
const model=customRangeComparison(base).rows[0];
is("model calculation is unchanged",model.change,0.001);
const csv=parseCsv(customRangeComparisonReport(base));
const row=csv.rows.find(row=>row[5]==="Visitors")!;
is("CSV keeps unrounded percentage",row[csv.header.indexOf("Change (%)")],String(model.change));
is("display policy is explained",render(base).includes("Nonzero percentage changes below 0.1% use up to four significant digits"),true);
done();
