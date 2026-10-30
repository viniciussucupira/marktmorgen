// Postcommit uncertain-barrier model, NOT Redis Lua or proof of funded lifecycle.
export const calls:unknown[][]=[];
export const retained=new Map<string,unknown>();
let original:Record<string,unknown>={};
let transform:((reply:unknown[])=>unknown)|null=null;
let after:(()=>void)|null=null;
export function reset(frame:Record<string,unknown>,next:((reply:unknown[])=>unknown)|null=null,afterAck:(()=>void)|null=null){
 calls.length=0;retained.clear();original=JSON.parse(JSON.stringify(frame));transform=next;after=afterAck;
 for(const k of ['sourceBinding','sourceReceipt','restartReceipt','reservedCents','carriedCents','annual','paused'])retained.set(k,original[k]);
 retained.set('commits',0);
}
export function isRedisConfigured(){return true;}
export async function redisPipeline(commands:(string|number)[][]):Promise<unknown[]>{
 if(commands.length!==1||commands[0][0]!=='EVAL'||commands[0][2]!==4)throw Error('Expected one submission barrier');
 calls.push(...commands);const c=commands[0];
 if(retained.has('uncertain'))return[0]; // Permanent first-owner barrier: never rearm.
 const submission={version:1,phase:'uncertain',priceId:c[18],bodyHash:c[19],armedAt:c[12],idempotencyKey:'restart:'+c[10]+':'+c[11]};
 const encoded=JSON.stringify({...original,submission});
 retained.set('uncertain',encoded);retained.set('commits',1);
 const reply=[[1,encoded]];after?.();
 return (transform?transform(reply):reply) as unknown[];
}
