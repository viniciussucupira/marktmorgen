export type Subscription={endpoint:string;p256dh:string;auth:string};
export type PushFetchHooks=Record<string,unknown>;
export const pushes:{endpoint:string;payload:string;ttl:number|undefined}[]=[];
const keys={kid:"path-test-key",publicKey:"test-public",privateKey:"test-private"};
export const vapidKeys=()=>keys;
export const vapidKeysFor=(kid:string)=>kid===keys.kid?keys:null;
export function readSubscription(raw:unknown):Subscription|null{
 if(!raw||typeof raw!=="object")return null;
 const input=raw as {endpoint?:unknown;keys?:{p256dh?:string;auth?:string}};
 return typeof input.endpoint==="string"&&input.keys?{endpoint:input.endpoint,p256dh:input.keys.p256dh || "",auth:input.keys.auth || ""}:null;
}
export async function sendPush(subscription:Subscription,payload:string,options:{ttlSeconds?:number}={}){
 pushes.push({endpoint:subscription.endpoint,payload,ttl:options.ttlSeconds});
 return {ok:true,status:201,gone:false,error:""};
}
