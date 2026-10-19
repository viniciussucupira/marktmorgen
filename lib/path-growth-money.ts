import type {Sale} from "@/lib/stats";
export type PathGrowthMoney={repeatBuyer:boolean|null;keptOrders:number|null};
/** Positive witnesses use distinct own live checkout payments after known refunds.
 * Buyer matching stays in this server calculation; no identity is returned or kept. */
export function pathGrowthMoney(sales:readonly Sale[],refunds:readonly {cents:number;currency:string;paymentIntent:string}[]|null,handles:ReadonlySet<string>,partial:boolean):PathGrowthMoney{
 if(refunds===null)return {repeatBuyer:null,keptOrders:null};
 const back=new Map<string,number>(),currencies=new Map<string,string>();
 for(const row of refunds){
  if(!Number.isSafeInteger(row.cents)||row.cents<0||typeof row.paymentIntent!=="string"||row.cents>0&&!row.paymentIntent||typeof row.currency!=="string"||!row.currency)return {repeatBuyer:null,keptOrders:null};
  if(currencies.has(row.paymentIntent)&&currencies.get(row.paymentIntent)!==row.currency)return {repeatBuyer:null,keptOrders:null};
  currencies.set(row.paymentIntent,row.currency);
  const total=(back.get(row.paymentIntent)??0)+row.cents;
  if(!Number.isSafeInteger(total))return {repeatBuyer:null,keptOrders:null};
  back.set(row.paymentIntent,total);
 }
 const seen=new Set<string>(),payments=new Set<string>(),buyers=new Set<string>();
 let kept=0,repeat=false,unknownBuyer=false,incomplete=partial;
 for(const sale of sales){
  const row=sale.row,meta=row.metadata&&typeof row.metadata==="object"?row.metadata as Record<string,unknown>:{};
  if(sale.upsell||row.livemode!==true||row.status!=="complete"||row.payment_status!=="paid"||typeof meta.store!=="string"||!handles.has(meta.store)||meta.kind==="tip"||meta.kind==="request")continue;
  if(sale.cents===0)continue;
  if(typeof row.id!=="string"||!row.id.startsWith("cs_")||typeof sale.paymentIntent!=="string"||!sale.paymentIntent||!Number.isSafeInteger(sale.cents)||sale.cents<0){incomplete=true;continue;}
  if(seen.has(row.id)||payments.has(sale.paymentIntent))continue;
  seen.add(row.id);payments.add(sale.paymentIntent);
  if(currencies.has(sale.paymentIntent)&&currencies.get(sale.paymentIntent)!==sale.currency)return {repeatBuyer:null,keptOrders:null};
  if((back.get(sale.paymentIntent)??0)>=sale.cents)continue;
  kept++;
  const details=row.customer_details&&typeof row.customer_details==="object"?row.customer_details as Record<string,unknown>:{};
  const email=typeof details.email==="string"?details.email.trim().toLowerCase():"";
  if(email&&email.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
   if(buyers.has(email))repeat=true;
   buyers.add(email);
  }else unknownBuyer=true;
 }
 return {repeatBuyer:repeat?true:incomplete||unknownBuyer?null:false,keptOrders:kept>=10||!incomplete?kept:null};
}
