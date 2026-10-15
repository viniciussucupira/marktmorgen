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
