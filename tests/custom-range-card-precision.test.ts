import { CustomRangeResults, CustomRangeComparison } from "@/components/custom-range";
import type { RangeData } from "@/lib/stats";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
const base:RangeData={from:"2026-10-01",to:"2026-10-02",currency:"usd",sales:"ok",partial:false,elsewhere:0,channels:[],products:[],days:[],totals:{visitors:100001,views:100001,checkouts:100001,sales:100001,cents:100001},before:{visitors:100000,views:100000,checkouts:100000,sales:100000,cents:100000}};
const render=(range:RangeData)=>renderToStaticMarkup(createElement(CustomRangeResults,{range:{...range,products:[]},marks:[],currency:range.currency}));
const tile=(range:RangeData,label:string)=>{const html=render(range),start=html.indexOf('>'+label+'</dt>');return start<0?null:html.slice(start,html.indexOf('</div>',start));};
const pairs=[["Visitors","Visitors"],["Page views","Page views"],["Checkouts started","Checkouts"],["Sales","Paid records"],["Revenue","Gross revenue"]] as const;
const tableChange=(range:RangeData,name:string)=>{const html=renderToStaticMarkup(createElement(CustomRangeComparison,{range,currency:range.currency})),start=html.indexOf('>'+name+'</th>'),row=html.slice(start,html.indexOf('</tr>',start));return [...row.matchAll(/<td[^>]*>(.*?)<\/td>/g)][3][1];};
part("Cards preserve small changes and agree with the comparison table");
for(const [label,metric] of pairs){
 is(label+" small increase",tile(base,label)?.includes("+0.001% on the days before"),true);
 is(label+" shares table precision",tile(base,label)?.includes(tableChange(base,metric)+" on the days before"),true);
 const decline={...base,totals:{visitors:99999,views:99999,checkouts:99999,sales:99999,cents:99999}};
 is(label+" small decline",tile(decline,label)?.includes("-0.001% on the days before"),true);
 is(label+" real movement is not unchanged",tile(decline,label)?.includes("same as the days before"),false);
}
part("Ordinary and extreme changes remain consistent");
for(const [visitors,expected] of [[112500,"+12.5%"],[87500,"-12.5%"],[100100,"+0.1%"],[0,"-100%"]] as const){
 const d={...base,totals:{...base.totals,visitors}};
 is("card percentage "+visitors,tile(d,"Visitors")?.includes(expected+" on the days before"),true);
 is("same comparison percentage "+visitors,tableChange(d,"Visitors"),expected);
}
const tiny={...base,totals:{...base.totals,visitors:Number.MAX_SAFE_INTEGER},before:{...base.before!,visitors:Number.MAX_SAFE_INTEGER-1}};
is("smallest safe count change stays nonzero",tile(tiny,"Visitors")?.includes("+0.0000000000000111% on the days before"),true);
part("Equality, zero and unavailable coverage retain their meaning");
for(const [label] of pairs){
 const same={...base,totals:{visitors:100000,views:100000,checkouts:100000,sales:100000,cents:100000}};
 is(label+" exact equality remains unchanged",tile(same,label)?.includes("same as the days before"),true);
}
const noHistory={...base,before:null};
is("missing history has no comparison",tile(noHistory,"Visitors")?.includes("days before"),false);
const zeroBefore={...base,before:{visitors:0,views:0,checkouts:0,sales:0,cents:0}};
is("previous zero does not invent a percentage",tile(zeroBefore,"Visitors")?.includes("none the days before"),true);
is("both zero is unchanged",tile({...zeroBefore,totals:{...base.totals,visitors:0}},"Visitors")?.includes("same as the days before"),true);
const unknownPaid={...base,before:{...base.before!,sales:null,cents:null}};
is("unknown previous payments have no comparison",tile(unknownPaid,"Sales")?.includes("days before"),false);
is("unknown previous revenue has no comparison",tile(unknownPaid,"Revenue")?.includes("days before"),false);
is("partial payments remain hidden",tile({...base,partial:true},"Sales"),null);
is("partial revenue remains hidden",tile({...base,partial:true},"Revenue"),null);
is("traffic stays visible independently",tile({...base,partial:true},"Visitors")?.includes("+0.001% on the days before"),true);
done();
