// Postcommit evidence model only; actual Redis Lua tests remain separate.
export const calls:unknown[][]=[];
export const retained=new Map<string,unknown>();
let frame:Record<string,unknown>={};
let expected:{armed:{priceId:string;bodyHash:string;armedAtSeconds:number;idempotencyKey:string};subscriptionId:string};
let transform:((reply:unknown[])=>unknown)|null=null;
export function reset(original:Record<string,unknown>,input:typeof expected,next:typeof transform=null){
 calls.length=0;retained.clear();frame=JSON.parse(JSON.stringify(original));expected=JSON.parse(JSON.stringify(input));transform=next;
 for(const key of ['sourceBinding','sourceReceipt','restartReceipt','reservedCents','carriedCents','annual','paused'])retained.set(key,frame[key]);
 retained.set('commits',0);
}
export function clearTransform(){transform=null;}
export function isRedisConfigured(){return true;}
export async function redisPipeline(commands:(string|number)[][]):Promise<unknown[]>{
 if(commands.length!==1||commands[0][0]!=='EVAL'||commands[0][2]!==1)throw Error('Expected one result retention call');
 calls.push(...commands);const c=commands[0],a=expected.armed;
 if(c[4]!==frame.grant||c[5]!==frame.review||c[6]!==frame.statsId||c[7]!==frame.claim||c[8]!==a.priceId||c[9]!==a.bodyHash||c[12]!==a.armedAtSeconds)throw Error('Actual command ownership changed');
 if(c[10]!==expected.subscriptionId)return[0];
 let flag=2;
 if(!retained.has('observed')){
  const submission={version:1,phase:'observed',priceId:a.priceId,bodyHash:a.bodyHash,armedAt:a.armedAtSeconds,idempotencyKey:a.idempotencyKey,subscriptionId:c[10],observedAt:c[11]};
  retained.set('observed',JSON.stringify({...frame,submission}));retained.set('commits',1);flag=1;
 }
 const reply=[flag];return (transform?transform(reply):reply) as unknown[];
}
