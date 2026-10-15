import type { RangeData } from "@/lib/stats";
import { paidFiguresComplete } from "@/lib/paid-coverage";
/** A ratio in minor currency units; a missing or zero count means no defined ratio. */
function revenuePerCount(cents:number|null|undefined,count:number|null|undefined):number|null {
 return typeof cents==="number"&&Number.isFinite(cents)&&typeof count==="number"&&Number.isSafeInteger(count)&&count>0?cents/count:null;
}

/** Counts per visitor are an aggregate ratio, not a matched-buyer conversion rate. */
function eventsPer100Visitors(records:number|null|undefined,visitors:number|null|undefined):number|null {
 return typeof records==="number"&&Number.isSafeInteger(records)&&records>=0&&typeof visitors==="number"&&Number.isSafeInteger(visitors)&&visitors>0?records/visitors*100:null;
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
  {name:"Revenue per paid record",unit:data.currency.toUpperCase(),money:true,current:known?revenuePerCount(data.totals.cents,data.totals.sales):null,previous:known?revenuePerCount(before?.cents,before?.sales):null},
  {name:"Revenue per visitor",unit:data.currency.toUpperCase(),money:true,current:known?revenuePerCount(data.totals.cents,data.totals.visitors):null,previous:known?revenuePerCount(before?.cents,before?.visitors):null},
  {name:"Paid records per 100 visitors",unit:"Records per 100 visitors",money:false,current:known?eventsPer100Visitors(data.totals.sales,data.totals.visitors):null,previous:known?eventsPer100Visitors(before?.sales,before?.visitors):null},
  {name:"Checkouts per 100 visitors",unit:"Checkouts per 100 visitors",money:false,current:eventsPer100Visitors(data.totals.checkouts,data.totals.visitors),previous:eventsPer100Visitors(before?.checkouts,before?.visitors)},
 ];
 return {previousFrom,previousTo,rows:metrics.map(row=>({...row,
  difference:row.current===null||row.previous===null?null:row.current-row.previous,
  change:row.current===null||row.previous===null||row.previous===0?null:(row.current-row.previous)/row.previous*100,
 }))};
}
