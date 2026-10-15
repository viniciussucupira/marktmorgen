import type { RangeData } from "@/lib/stats";
import { channelName } from "@/lib/channel-names";
const normalized=(value:string)=>value.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().trim();
/** Search only the loaded rows, preserving their order and the whole-period totals. */
export function customRangeView<T extends RangeData>(data:T,query:string):T {
 const needle=normalized(query);
 if(!needle)return data;
 return {...data,channels:data.channels.filter(row=>normalized(row.source+" "+channelName(row.source)).includes(needle)),products:data.products.filter(row=>normalized(row.id+" "+("title" in row?String(row.title??""):"")).includes(needle))};
}
