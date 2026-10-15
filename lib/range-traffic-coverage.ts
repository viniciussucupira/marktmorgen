/** Redis counters are whole non-negative values; null is not a confirmed zero. */
function counter(value:unknown):boolean {
 if(typeof value!=="number"&&(typeof value!=="string"||!/^\d+$/.test(value)))return false;
 const parsed=Number(value);
 return Number.isSafeInteger(parsed)&&parsed>=0;
}

/** HGETALL returns a flat field/count list, including [] for a quiet day. */
function dailyCounts(reply:unknown):boolean {
 if(!Array.isArray(reply)||reply.length%2!==0)return false;
 const seen=new Set<string>();
 for(let i=0;i<reply.length;i+=2){
  const field:unknown=reply[i];
  if(typeof field!=="string"||field.length===0||seen.has(field)||!counter(reply[i+1]))return false;
  seen.add(field);
 }
 return true;
}

/** HMGET null fields mean the keys were absent, unlike an absent command reply. */
function previousCounts(reply:unknown):boolean {
 return Array.isArray(reply)&&reply.length===2&&[0,1].every(i=>reply[i]===null||counter(reply[i]));
}

/** Validate the exact readRange pipeline layout before any numeric zero fallbacks. */
export function rangeTrafficCoverage(results:unknown,days:number,withPrevious:boolean):{current:boolean;previous:boolean} {
 const unavailable={current:false,previous:false};
 if(!Number.isSafeInteger(days)||days<1||days>400||!Array.isArray(results))return unavailable;
 const currentSize=days*2+1;
 const expectedSize=currentSize+(withPrevious?days+1:0);
 if(results.length>expectedSize)return unavailable;
 const indices=Array.from({length:days},(_,i)=>i);
 const current=indices.every(i=>dailyCounts(results[i])&&counter(results[days+i]))&&counter(results[days*2]);
 const previous=current&&withPrevious&&counter(results[currentSize])&&indices.every(i=>previousCounts(results[currentSize+1+i]));
 return {current,previous};
}

/** Validate readStats' 90 daily hashes/counts, three windows and independent histories. */
export function statsTrafficCoverage(results:unknown):{current:boolean;previous:Record<"d7"|"d30"|"d90",boolean>} {
 const unavailable={current:false,previous:{d7:false,d30:false,d90:false}};
 const days=90;
 const base=days*2;
 if(!Array.isArray(results)||results.length>days*3+6)return unavailable;
 const indices=Array.from({length:days},(_,i)=>i);
 const current=indices.every(i=>dailyCounts(results[i])&&counter(results[days+i]))&&[0,1,2].every(i=>counter(results[base+i]));
 if(!current)return unavailable;
 return {current:true,previous:{
  d7:counter(results[base+3]),
  d30:counter(results[base+4]),
  d90:counter(results[base+5])&&indices.every(i=>previousCounts(results[base+6+i])),
 }};
}
