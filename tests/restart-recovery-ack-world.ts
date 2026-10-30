// Postcommit allowance/evidence model, not execution of Redis Lua.
export const calls:unknown[][]=[];
export const retained=new Map<string,unknown>();
type Armed={priceId:string;bodyHash:string;armedAtSeconds:number;idempotencyKey:string};
type Activation={armed:Armed;subscriptionId:string;createdSeconds:number;periodStartSeconds:number;periodEndSeconds:number;renews:boolean;shared:boolean};
let frame:Record<string,unknown>={},activation:Activation,mode:'read'|'activated'|'absent'|'held'='read';
let transform:((reply:unknown[])=>unknown)|null=null;
let after:(()=>void)|null=null;
export function reset(original:Record<string,unknown>,observed:Activation,kind:typeof mode='read',next:typeof transform=null,afterAck:typeof after=null){
 calls.length=0;retained.clear();frame=JSON.parse(JSON.stringify(original));activation=JSON.parse(JSON.stringify(observed));mode=kind;transform=next;after=afterAck;
 for(const key of ['sourceBinding','sourceReceipt','restartReceipt','reservedCents','carriedCents','annual','paused'])retained.set(key,frame[key]);
 retained.set('recoveryReads',0);
}
export function clearTransform(){transform=null;}
export function isRedisConfigured(){return true;}
export async function redisPipeline(commands:(string|number)[][]):Promise<unknown[]>{
 if(commands.length!==1||commands[0][0]!=='EVAL'||commands[0][2]!==4)throw Error('Expected one bounded recovery claim');
 calls.push(...commands);const c=commands[0],a=activation.armed;
 if(c[7]!==frame.statsId||c[8]!==frame.sourceSubscription||c[9]!==frame.sourceGrant||c[10]!==frame.ref||c[11]!==frame.handle||c[12]!==frame.paused)throw Error('Source ownership changed');
 let reply:unknown[];
 if(mode==='absent'||mode==='held')reply=[[mode]];
 else {
  let reads=Number(retained.get('recoveryReads'));
  if(mode==='read'&&reads>=3)reply=[['held']];
  else {
   if(mode==='read'){reads++;retained.set('recoveryReads',reads);}
   const submission={version:1,phase:mode==='activated'?'observed':'uncertain',priceId:a.priceId,bodyHash:a.bodyHash,armedAt:a.armedAtSeconds,idempotencyKey:a.idempotencyKey,recoveryReads:reads,
    ...(mode==='read'?{lastRecoveryAt:c[13]}:{subscriptionId:activation.subscriptionId,publication:{renews:activation.renews,shared:activation.shared}})};
   const encoded=JSON.stringify({...frame,submission});retained.set('intent',encoded);
   if(mode==='read')reply=[['read',encoded]];
   else {
    const binding=[frame.grant,activation.subscriptionId,(String(frame.restartReceipt).split('|'))[2],activation.createdSeconds,'paid',activation.periodStartSeconds,activation.periodEndSeconds].join('|');
    const checkpoint=JSON.stringify({version:1,binding,renews:activation.renews,shared:activation.shared});
    retained.set('activated',binding);retained.set('publication',checkpoint);
    reply=[['activated',encoded,binding,checkpoint]];
   }
  }
 }
 after?.();return (transform?transform(reply):reply) as unknown[];
}
