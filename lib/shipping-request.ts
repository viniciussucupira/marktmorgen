import { readMoney, type Currency } from "@/lib/money";
import { parseShipping, readShippingSku, type Shipping } from "@/lib/shipping";

type ShippingWrite = {ok:true;shipping:Shipping|null}|{ok:false;reason:"ship_price"|"ship_countries"|"ship_sku"};
/** Missing fields are not permission to replace a shipping charge with zero. */
export function readShippingWrite(raw:unknown,currency:Currency):ShippingWrite {
 if(raw===null)return{ok:true,shipping:null};
 if(!raw || typeof raw!=="object" || Array.isArray(raw))return{ok:false,reason:"ship_price"};
 const value=raw as Record<string,unknown>;
 if(!Object.hasOwn(value,"price") || typeof value.price!=="string" || value.price.length>12)return{ok:false,reason:"ship_price"};
 const typed=value.price.trim();
 const cents=typed===""?0:readMoney(typed,currency);
 if(cents===null)return{ok:false,reason:"ship_price"};
 if(!Object.hasOwn(value,"region") || typeof value.region!=="string" || !["us","na","eu","europe","world","custom"].includes(value.region))return{ok:false,reason:"ship_countries"};
 if(value.region==="custom" && !Object.hasOwn(value,"countries"))return{ok:false,reason:"ship_countries"};
 const sku=readShippingSku(Object.hasOwn(value,"sku")?value.sku:undefined);
 if(sku===null)return{ok:false,reason:"ship_sku"};
 const shipping=parseShipping({cents,region:value.region,countries:value.countries,note:value.note,...(Object.hasOwn(value,"sku")?{sku}:{})});
 return shipping?{ok:true,shipping}:{ok:false,reason:"ship_countries"};
}
