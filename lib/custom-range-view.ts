import type { RangeData } from "@/lib/stats";
import { channelName } from "@/lib/channel-names";
import { paidFiguresComplete } from "@/lib/paid-coverage";
const normalized=(value:string)=>value.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().trim();
export const CUSTOM_RANGE_SORTS=["recorded","traffic_desc","traffic_asc","revenue_desc","revenue_asc","sales_desc","sales_asc","name"] as const;
export type CustomRangeSort=typeof CUSTOM_RANGE_SORTS[number];
export function effectiveCustomRangeSort(data:RangeData,sort:string):CustomRangeSort {
 const selected=CUSTOM_RANGE_SORTS.includes(sort as CustomRangeSort)?sort as CustomRangeSort:"recorded";
 return !paidFiguresComplete(data)&&(selected.startsWith("revenue_")||selected.startsWith("sales_"))?"traffic_desc":selected;
}
export function customRangeOrderLabel(data:RangeData,sort:string,kind:"channels"|"products"):string {
 const selected=effectiveCustomRangeSort(data,sort);
 const traffic=kind==="channels"?"Visits":"Page views";
 if(selected==="recorded")return paidFiguresComplete(data)?"Revenue":traffic;
 if(selected==="name")return "Name, A–Z";
 const metric=selected.startsWith("traffic_")?traffic:selected.startsWith("sales_")?"Paid records":"Revenue";
 return metric+(selected.endsWith("_asc")?", lowest first":", highest first");
}

export const CUSTOM_RANGE_FILTERS=[
 {value:"all",label:"All loaded rows"},{value:"paid",label:"With sales"},{value:"unconverted",label:"Traffic without sales"},
] as const;
export type CustomRangeFilter=typeof CUSTOM_RANGE_FILTERS[number]["value"];
/** Missing paid coverage cannot classify a row as having no purchases. */
export function effectiveCustomRangeFilter(data:RangeData,filter:string):CustomRangeFilter {
 const selected=CUSTOM_RANGE_FILTERS.find(item=>item.value===filter)?.value??"all";
 return paidFiguresComplete(data)?selected:"all";
}
export function customRangeFilterLabel(data:RangeData,filter:string):string {
 const selected=effectiveCustomRangeFilter(data,filter);
 return CUSTOM_RANGE_FILTERS.find(item=>item.value===selected)!.label;
}

/** Only non-negative whole counts can become a traffic threshold. */
export function customRangeMinimumTraffic(value:unknown):number {
 const parsed=typeof value==="number"?value:typeof value==="string"?Number(value.trim()):NaN;
 return Number.isSafeInteger(parsed)&&parsed>=0?parsed:0;
}
const productName=(row:RangeData["products"][number])=>"title" in row?String(row.title??row.id):row.id;
/** Search and sort loaded rows without mutating their source or period-wide figures. */
export function customRangeView<T extends RangeData>(data:T,query:string,sort:CustomRangeSort="recorded",filter:CustomRangeFilter="all",minimumTraffic:number|string=0):T {
 const needle=normalized(query);
 const selected=effectiveCustomRangeSort(data,sort);
 const actualFilter=effectiveCustomRangeFilter(data,filter);
 const minimum=customRangeMinimumTraffic(minimumTraffic);
 const matches=(sales:number,traffic:number)=>traffic>=minimum&&(actualFilter==="all"||(actualFilter==="paid"?sales>0:traffic>0&&sales===0));
 if(!needle&&selected==="recorded"&&actualFilter==="all"&&minimum===0)return data;
 const channels=data.channels.filter(row=>matches(row.sales,row.visits)&&normalized(row.source+" "+channelName(row.source)).includes(needle));
 const products=data.products.filter(row=>matches(row.sales,row.views)&&normalized(row.id+" "+productName(row)).includes(needle));
 const direction=selected.endsWith("_asc")?1:-1;
 const names=(a:string,b:string)=>normalized(a).localeCompare(normalized(b),"en");
 if(selected==="name"){
  channels.sort((a,b)=>names(channelName(a.source),channelName(b.source)));
  products.sort((a,b)=>names(productName(a),productName(b)));
 }else if(selected!=="recorded"){
  const channelValue=(row:RangeData["channels"][number])=>selected.startsWith("revenue_")?row.cents:selected.startsWith("sales_")?row.sales:row.visits;
  const productValue=(row:RangeData["products"][number])=>selected.startsWith("revenue_")?row.cents:selected.startsWith("sales_")?row.sales:row.views;
  channels.sort((a,b)=>(channelValue(a)-channelValue(b))*direction||names(channelName(a.source),channelName(b.source)));
  products.sort((a,b)=>(productValue(a)-productValue(b))*direction||names(productName(a),productName(b)));
 }
 return {...data,channels,products};
}
