import { toMajor } from "@/lib/money";
/** Gross revenue in minor currency units per recorded traffic event, never per buyer. */
export function revenuePerTraffic(cents:number|null,traffic:number,paidKnown:boolean):number|null {
 return paidKnown&&typeof cents==="number"&&Number.isSafeInteger(cents)&&cents>=0&&Number.isSafeInteger(traffic)&&traffic>0?cents/traffic:null;
}
/** Analytical money keeps small nonzero values visible; exports retain calculated precision. */
export function formatRevenuePerTraffic(value:number|null,currency:string):string {
 if(value===null)return "Unavailable";
 return toMajor(value,currency).toLocaleString("en-US",{style:"currency",currency:currency.toUpperCase(),minimumSignificantDigits:1,maximumSignificantDigits:4});
}

/** Share of a selected loaded list, never a whole-period or cross-list share. */
export function selectedRevenueShare(cents:number,total:number|null,paidKnown:boolean):number|null {
 return paidKnown&&Number.isSafeInteger(cents)&&cents>=0&&typeof total==="number"&&Number.isSafeInteger(total)&&total>0&&cents<=total?cents/total*100:null;
}
export function formatSelectedRevenueShare(value:number|null):string {
 return value===null?"Unavailable":value.toLocaleString("en-US",{maximumSignificantDigits:4})+"%";
}
