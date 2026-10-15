import type { RangeData } from "@/lib/stats";
import { paidFiguresComplete } from "@/lib/paid-coverage";
export const CUSTOM_RANGE_METRICS = [
 {value:"visitors",label:"Visitors",paid:false},
 {value:"views",label:"Page views",paid:false},
 {value:"checkouts",label:"Checkouts started",paid:false},
 {value:"sales",label:"Sales",paid:true},
 {value:"cents",label:"Revenue",paid:true},
] as const;
export type CustomRangeMetric = typeof CUSTOM_RANGE_METRICS[number]["value"];
/** Re-check each snapshot so a prior paid selection cannot expose partial values. */
export function effectiveCustomRangeMetric(range:RangeData,metric:CustomRangeMetric):CustomRangeMetric {
 const choice=CUSTOM_RANGE_METRICS.find(item=>item.value===metric);
 return !choice || (choice.paid&&!paidFiguresComplete(range)) ? "visitors" : choice.value;
}

export const CUSTOM_RANGE_GROUPINGS = [
 {value:"day",label:"Day"},{value:"week",label:"Week"},{value:"month",label:"Month"},
] as const;
export type CustomRangeGrouping = typeof CUSTOM_RANGE_GROUPINGS[number]["value"];
export function effectiveCustomRangeGrouping(value:CustomRangeGrouping):CustomRangeGrouping {
 return CUSTOM_RANGE_GROUPINGS.some(item=>item.value===value)?value:"day";
}
/** Sum only recorded UTC days; do not pad boundary groups or expose unavailable paid values. */
export function customRangeChartRows(range:RangeData,metric:CustomRangeMetric,grouping:CustomRangeGrouping) {
 const selected=effectiveCustomRangeMetric(range,metric);
 const unit=effectiveCustomRangeGrouping(grouping);
 const sold=paidFiguresComplete(range);
 const groups=new Map<string,{from:string;to:string;value:number;sales:number|null}>();
 for(const row of [...range.days].sort((a,b)=>a.date.localeCompare(b.date))) {
  let key=row.date;
  if(unit==="month")key=row.date.slice(0,7)+"-01";
  if(unit==="week") {
   const date=new Date(row.date+"T00:00:00Z");
   date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);
   key=date.toISOString().slice(0,10);
  }
  const group=groups.get(key);
  if(group){group.to=row.date;group.value+=row[selected];if(group.sales!==null)group.sales+=row.sales;}
  else groups.set(key,{from:row.date,to:row.date,value:row[selected],sales:sold?row.sales:null});
 }
 return [...groups.values()];
}
