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

/** Aggregate page views divided by the period visitor estimate, not per session. */
function viewsPerVisitor(views:number|null|undefined,visitors:number|null|undefined):number|null {
 return typeof views==="number"&&Number.isSafeInteger(views)&&views>=0&&typeof visitors==="number"&&Number.isSafeInteger(visitors)&&visitors>0?views/visitors:null;
}

const METRIC_DEFINITIONS = {
  "Page views per visitor": "Page views per visitor divides recorded page views by the visitor estimate across each period, not the sum of daily visitors. Repeated views count; this is an aggregate browsing ratio, not pages per session or per unique person. No visitors or missing traffic history means unavailable. It is independent of payment coverage. Its difference is in views per visitor; its change is relative percentage growth. Display uses up to four significant digits; the CSV keeps calculated precision.",
  "Visitors": "Visitor totals are estimates across each period, not sums of daily counts or unique buyers.",
  "Page views": "Recorded page views during each period. Repeated views may count more than once.",
  "Checkouts": "Recorded checkout starts during each period. These are events, not completed payments or distinct buyers.",
  "Paid records": "Paid records include one-click extras and exclude renewals. These are payment records, not distinct buyers.",
  "Gross revenue": "Gross revenue is before refunds, fees, ads and other costs, not profit. Paid records include purchases and one-click extras, exclude renewals.",
  "Revenue per paid record": "Revenue per paid record is gross revenue divided by paid records for each period, not revenue per buyer. No paid records means the average is unavailable. Analytical averages and their differences retain calculated precision in the currency major unit.",
  "Revenue per visitor": "Revenue per visitor divides gross revenue by the recorded visitor estimate for each period, not matched buyers; no visitors means unavailable. Money is rounded for display; the CSV keeps the calculated precision.",
  "Paid records per 100 visitors": "Paid records per 100 visitors divides paid records by the period’s visitor estimate and multiplies by 100. It is not a matched-buyer conversion rate and can exceed 100 because of extras and repeated purchases. Its difference is in records per 100 visitors; its change is relative percentage growth. No visitors or unknown paid figures means unavailable.",
  "Checkouts per 100 visitors": "Checkouts per 100 visitors divides recorded checkout starts by the period’s visitor estimate and multiplies by 100. It counts events, not distinct buyers or completed purchases, and may exceed 100 after repeated attempts. It is independent of paid coverage. Its difference is in checkouts per 100 visitors; its change is relative percentage growth. No visitors or missing traffic history means unavailable."
} as const;

/** One comparison model for the displayed table and CSV, with unknown values kept null. */
export function customRangeComparison(data:RangeData) {
 const known=paidFiguresComplete(data);
 const before=data.before;
 const start=Date.parse(data.from+"T00:00:00Z");
 const end=Date.parse(data.to+"T00:00:00Z");
 const span=end-start+86400000;
 const previousFrom=Number.isFinite(span)&&span>0?new Date(start-span).toISOString().slice(0,10):null;
 const previousTo=Number.isFinite(start)?new Date(start-86400000).toISOString().slice(0,10):null;
 const metrics:{name:keyof typeof METRIC_DEFINITIONS;unit:string;money:boolean;ratio?:boolean;current:number|null;previous:number|null}[]=[
  {name:"Visitors",unit:"Count",money:false,current:data.totals.visitors,previous:before?.visitors??null},
  {name:"Page views",unit:"Count",money:false,current:data.totals.views,previous:before?.views??null},
  {name:"Checkouts",unit:"Count",money:false,current:data.totals.checkouts,previous:before?.checkouts??null},
  {name:"Paid records",unit:"Count",money:false,current:known?data.totals.sales:null,previous:known?before?.sales??null:null},
  {name:"Gross revenue",unit:data.currency.toUpperCase(),money:true,current:known?data.totals.cents:null,previous:known?before?.cents??null:null},
  {name:"Revenue per paid record",unit:data.currency.toUpperCase(),money:true,current:known?revenuePerCount(data.totals.cents,data.totals.sales):null,previous:known?revenuePerCount(before?.cents,before?.sales):null},
  {name:"Revenue per visitor",unit:data.currency.toUpperCase(),money:true,current:known?revenuePerCount(data.totals.cents,data.totals.visitors):null,previous:known?revenuePerCount(before?.cents,before?.visitors):null},
  {name:"Paid records per 100 visitors",unit:"Records per 100 visitors",money:false,ratio:true,current:known?eventsPer100Visitors(data.totals.sales,data.totals.visitors):null,previous:known?eventsPer100Visitors(before?.sales,before?.visitors):null},
  {name:"Checkouts per 100 visitors",unit:"Checkouts per 100 visitors",money:false,ratio:true,current:eventsPer100Visitors(data.totals.checkouts,data.totals.visitors),previous:eventsPer100Visitors(before?.checkouts,before?.visitors)},
  {name:"Page views per visitor",unit:"Views per visitor",money:false,ratio:true,current:viewsPerVisitor(data.totals.views,data.totals.visitors),previous:viewsPerVisitor(before?.views,before?.visitors)},
 ];
 return {previousFrom,previousTo,rows:metrics.map(row=>({...row,definition:METRIC_DEFINITIONS[row.name],
  difference:row.current===null||row.previous===null?null:row.current-row.previous,
  change:row.current===null||row.previous===null||row.previous===0?null:(row.current-row.previous)/row.previous*100,
 }))};
}
