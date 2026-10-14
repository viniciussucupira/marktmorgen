import type { StatsData } from "@/lib/stats";
import { paymentMixFrom, type PaymentMix } from "@/lib/payment-mix";
export type PaymentComparisonRow = {source:string;current:number;previous:number;change:number|null;currentShare:number|null;previousShare:number|null;shareChange:number|null};
export type PaymentComparison = {current:PaymentMix;previous:PaymentMix|null;delta:number|null;change:number|null;rows:PaymentComparisonRow[]};
/** Equal, adjacent UTC windows entirely within the complete 90-day ledger. */
export function paymentComparisonFrom(data:Pick<StatsData,"sales"|"partial"|"cashflowComplete"|"channelDays"|"days">,range:"d7"|"d30"|"d90"):PaymentComparison|null {
  const current=paymentMixFrom(data,range);
  if(!current)return null;
  const unavailable:PaymentComparison={current,previous:null,delta:null,change:null,rows:[]};
  const size=range==="d7" ? 7 : 30;
  if(range==="d90" || data.days.length<size*2)return unavailable;
  const all=data.days.slice(-size*2);
  for(let i=0;i<all.length;i++){
    const at=Date.parse(all[i].date+"T00:00:00Z");
    if(!Number.isFinite(at) || new Date(at).toISOString().slice(0,10)!==all[i].date || (i>0 && at-Date.parse(all[i-1].date+"T00:00:00Z")!==86400000))return unavailable;
  }
  const previous=paymentMixFrom({...data,days:all.slice(0,size)},range);
  if(!previous)return unavailable;
  const now=new Map(current.rows.map(row=>[row.source,row]));
  const before=new Map(previous.rows.map(row=>[row.source,row]));
  const rows=[...new Set([...now.keys(),...before.keys()])].map(source=>{
    const received=now.get(source)?.cents ?? 0;
    const earlier=before.get(source)?.cents ?? 0;
    const currentShare=current.total ? received/current.total : null;
    const previousShare=previous.total ? earlier/previous.total : null;
    return {source,current:received,previous:earlier,change:earlier ? (received-earlier)/earlier : null,currentShare,previousShare,shareChange:currentShare===null || previousShare===null ? null : currentShare-previousShare};
  }).sort((a,b)=>b.current-a.current || b.previous-a.previous || a.source.localeCompare(b.source));
  return {current,previous,delta:current.total-previous.total,change:previous.total ? (current.total-previous.total)/previous.total : null,rows};
}
export function paymentChange(change:number|null):string {return change===null ? "No previous payments" : (change>0 ? "+" : "")+(change*100).toFixed(1)+"%";}
export function paymentShareChange(change:number|null):string {return change===null ? "—" : (change>0 ? "+" : "")+(change*100).toFixed(1)+" percentage points";}
