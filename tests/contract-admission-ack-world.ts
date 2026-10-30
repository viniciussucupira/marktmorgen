// Reservation delegates the existing financial ledger double; claim models
// only the permanent postcommit first-owner boundary. Not Redis Lua proof.
import * as base from './contract-funding-redis';
export const calls=base.calls,ledger=base.ledger;
export const retained=new Map<string,unknown>();
let transform:((reply:unknown[])=>unknown)|null=null,after:(()=>void)|null=null;
let frame:Record<string,unknown>|null=null;
export function reset(next:typeof transform=null,afterAck:typeof after=null,claimFrame:Record<string,unknown>|null=null){
 base.reset();retained.clear();transform=next;after=afterAck;frame=claimFrame?JSON.parse(JSON.stringify(claimFrame)):null;
 if(frame)for(const key of ['sourceBinding','sourceReceipt','restartReceipt','reservedCents','carriedCents','annual','paused'])retained.set(key,frame[key]);
}
export function setTransform(next:typeof transform,afterAck:typeof after=null){transform=next;after=afterAck;}
export const seed=base.seed;
export function isRedisConfigured(){return true;}
export async function redisPipeline(commands:(string|number)[][]):Promise<unknown[]>{
 if(frame){
  if(commands.length!==1||commands[0][0]!=='EVAL'||commands[0][2]!==4)throw Error('Expected one first-owner claim');
  calls.push(commands);const c=commands[0];
  if(retained.has('claim'))return[0];
  if(c[9]!==frame.statsId||c[11]!==frame.grant||c[12]!==frame.sourceSubscription||c[18]!==frame.ref||c[19]!==frame.paused||c[20]!==frame.claim||c[21]!==frame.handle)throw Error('Claim ownership changed');
  const encoded=JSON.stringify({...frame,created:c[13]});retained.set('claim',encoded);
  const reply=[[1,encoded]];after?.();return(transform?transform(reply):reply) as unknown[];
 }
 const reply=await base.redisPipeline(commands);
 // Only substitute the first committed reservation acknowledgement.
 // Later refusal/activation replies retain the existing model's semantics.
 if(commands.length===1&&['checkout','switch'].includes(String(commands[0][14]))&&reply[0]===1){
  after?.();return(transform?transform(reply):reply) as unknown[];
 }
 return reply;
}
