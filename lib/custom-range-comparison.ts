import type { RangeData } from "@/lib/stats";
import { paidFiguresComplete } from "@/lib/paid-coverage";
/** A ratio in minor currency units; no payments means no defined average. */
function revenuePerPaidRecord(cents:number|null|undefined,sales:number|null|undefined):number|null {
 return typeof cents==="number"&&Number.isFinite(cents)&&typeof sales==="number"&&Number.isSafeInteger(sales)&&sales>0?cents/sales:null;
}

/** One comparison model for the displayed table and CSV, with unknown values kept null. */
export function customRangeComparison(data:RangeData) {
 const known=paidFiguresComplete(data);
 const before=data.before;
 const start=Date.parse(data.from+"T00:00:00Z");
 const end=Date.parse(data.to+"T00:00:00Z");
 const span=end-start+86400000;
 const previousFrom=Number.isFinite(span)&&span>0?new Date(start-span).toISOString().slice(0,10):null;
 const previousTo=Number.isFinite(start)?new Date(start-86400000).toISOString().slice(0,10):null;
 const metrics:{name:string;unit:string;money:boolean;current:number|null;previous:number|null}[]=[
  {name:"Visitors",unit:"Count",money:false,current:data.totals.visitors,previous:before?.visitors??null},
  {name:"Page views",unit:"Count",money:false,current:data.totals.views,previous:before?.views??null},
  {name:"Checkouts",unit:"Count",money:false,current:data.totals.checkouts,previous:before?.checkouts??null},
  {name:"Paid records",unit:"Count",money:false,current:known?data.totals.sales:null,previous:known?before?.sales??null:null},
  {name:"Gross revenue",unit:data.currency.toUpperCase(),money:true,current:known?data.totals.cents:null,previous:known?before?.cents??null:null},
  {name:"Revenue per paid record",unit:data.currency.toUpperCase(),money:true,current:known?revenuePerPaidRecord(data.totals.cents,data.totals.sales):null,previous:known?revenuePerPaidRecord(before?.cents,before?.sales):null},
 ];
 return {previousFrom,previousTo,rows:metrics.map(row=>({...row,
  difference:row.current===null||row.previous===null?null:row.current-row.previous,
  change:row.current===null||row.previous===null||row.previous===0?null:(row.current-row.previous)/row.previous*100,
 }))};
}
