// Post-commit boundary model, NOT a Redis Lua implementation or financial approval.
export const calls:unknown[][]=[];
export const retained=new Map<string,unknown>();
let transform:((reply:unknown[])=>unknown)|null=null;
let after:(()=>void)|null=null;
export function reset(next:((reply:unknown[])=>unknown)|null=null,afterAck:(()=>void)|null=null){
 calls.length=0;retained.clear();retained.set('source','retained');retained.set('cash',100);retained.set('pause','retained');retained.set('due',1);retained.set('annual',1);transform=next;after=afterAck;
}
export function isRedisConfigured(){return true;}
export async function redisPipeline(commands:(string|number)[][]):Promise<unknown[]>{
 if(commands.length!==1||commands[0][0]!=='EVAL'||commands[0][2]!==4)throw Error('Expected single restart activation');
 calls.push(...commands);
 const command=commands[0],expected=JSON.parse(String(command[9])),observed=JSON.parse(String(command[11]));
 // The actual wrapper has prepared/validated these values using real configuration
 // and ownedRestartIntentFromAcknowledgement; this boundary models retained writes.
 const committed=retained.has('activation');
 retained.set('activation',JSON.stringify(observed));retained.set('checkpoint',expected.grant);
 const deadline=String(expected.restartReceipt).split('|')[7];
 const reply=[[committed?2:1,committed?observed.finish:Number(deadline)]];
 after?.();
 return (transform?transform(reply):reply) as unknown[];
}
