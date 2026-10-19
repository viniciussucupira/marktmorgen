import type { Counts } from "@/lib/headline-test-rules";
const FIELDS=["va","vb","ca","cb","sa","sb","ra","rb","qa","qb","t0"] as const;
export const unavailableTestCounts=():Counts=>({va:0,vb:0,ca:0,cb:0,unavailable:true});
/** Empty hashes are genuine zero; malformed or incomplete replies are not. Fields are written lazily. */
export function parseTestCounts(raw:unknown):Counts {
 const pairs:Record<string,unknown>=Object.create(null);
 if(Array.isArray(raw)) {
   if(raw.length%2)return unavailableTestCounts();
   for(let i=0;i<raw.length;i+=2){
     if(typeof raw[i]!=="string" || Object.hasOwn(pairs,raw[i]))return unavailableTestCounts();
     Object.defineProperty(pairs,raw[i],{value:raw[i+1],enumerable:true});
   }
 } else if(raw && typeof raw==="object")Object.assign(pairs,raw);
 else return unavailableTestCounts();
 if(Object.keys(pairs).some(field=>!FIELDS.some(name=>name===field)))return unavailableTestCounts();
 const out:Record<string,number>={};
 for(const field of FIELDS) {
   if(!Object.hasOwn(pairs,field)){out[field]=0;continue;}
   const value=pairs[field];
   if((typeof value!=="number" && (typeof value!=="string" || !/^\d+$/.test(value))) || !Number.isSafeInteger(Number(value)) || Number(value)<0)return unavailableTestCounts();
   out[field]=Number(value);
 }
 return {va:out.va,vb:out.vb,ca:out.ca,cb:out.cb,sa:out.sa,sb:out.sb,ra:out.ra,rb:out.rb,qa:out.qa,qb:out.qb,t0:out.t0};
}
