import { parseShipping, readShippingSku, type Shipping } from "@/lib/shipping";

const record = (raw:unknown):raw is Record<string,unknown> => !!raw && typeof raw==="object" && !Array.isArray(raw);
/** Only the matching product and requested saved shipping prove this write. */
export function confirmsShipping(raw:unknown,httpOk:boolean,id:string,expected:Shipping|null):boolean {
 if(!httpOk || !record(raw) || !Object.hasOwn(raw,"ok") || raw.ok!==true || Object.hasOwn(raw,"error") || !Object.hasOwn(raw,"product") || !record(raw.product))return false;
 const product=raw.product;
 if(!Object.hasOwn(product,"id") || product.id!==id || !Object.hasOwn(product,"shipping"))return false;
 if(expected===null)return product.shipping===null;
 const saved=product.shipping;
 if(!record(saved) || !["cents","region","countries","note"].every(key=>Object.hasOwn(saved,key)) || typeof saved.cents!=="number" || typeof saved.region!=="string" || !Array.isArray(saved.countries) || !saved.countries.every(code=>typeof code==="string") || typeof saved.note!=="string")return false;
 const parsed=parseShipping(saved);
 if(!parsed || parsed.region!==saved.region || parsed.note!==saved.note || JSON.stringify(parsed.countries)!==JSON.stringify(saved.countries) || (Object.hasOwn(saved,"sku") && (typeof saved.sku!=="string" || readShippingSku(saved.sku)!==saved.sku)))return false;
 return parsed.cents===expected.cents && parsed.region===expected.region
   && JSON.stringify(parsed.countries)===JSON.stringify(expected.countries)
   && parsed.note===expected.note && (parsed.sku??"")===(expected.sku??"");
}
