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
export function customRangeChartRows(range:RangeData,metric:CustomRangeMetric,grouping:CustomRangeGrouping,cumulative=false) {
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
 const rows=[...groups.values()];
 if(!cumulative)return rows;
 let total=0,totalSales=0;
 return rows.map(row=>{total+=row.value;if(row.sales!==null)totalSales+=row.sales;return {...row,value:total,sales:row.sales===null?null:totalSales};});
}

/** Describe recorded daily values, independently of chart grouping or list filters. */
export function customRangeChartSummary(range:RangeData,metric:CustomRangeMetric) {
 const selected=effectiveCustomRangeMetric(range,metric);
 const rows=customRangeChartRows(range,selected,"day");
 if(!rows.length)return null;
 let total=0,peak=rows[0],ties=0;
 for(const row of rows){
  total+=row.value;
  if(row.value>peak.value){peak=row;ties=1;}
  else if(row.value===peak.value)ties++;
 }
 const values=rows.map(row=>row.value).sort((a,b)=>a-b);
 const middle=Math.floor(values.length/2);
 const median=values.length%2?values[middle]:values[middle-1]+(values[middle]-values[middle-1])/2;
 const activeDays=rows.filter(row=>row.value>0).length;
 return {metric:selected,days:rows.length,activeDays,activeDayShare:activeDays/rows.length*100,zeroDays:rows.filter(row=>row.value===0).length,total,average:total/rows.length,median,peak:{date:peak.from,value:peak.value,ties}};
}
