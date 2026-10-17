import type {exposureBudgetConfiguration} from '@/lib/exposure-budget-policy';
export const ledger=new Map<string,Map<string,string>>();
export const calls:(string|number)[][][]=[];
let available=true,failure=false,lostAck=false;
let response:unknown[]|null=null;
export const isRedisConfigured=()=>available;
export function settings(v:{available?:boolean;failure?:boolean;lostAck?:boolean;response?:unknown[]|null}){if(v.available!==undefined)available=v.available;if(v.failure!==undefined)failure=v.failure;if(v.lostAck!==undefined)lostAck=v.lostAck;if(v.response!==undefined)response=v.response;}
export function reset(){ledger.clear();calls.length=0;available=true;failure=false;lostAck=false;response=null;}
export function seed(key:string,c:NonNullable<ReturnType<typeof exposureBudgetConfiguration>>){ledger.set(key,new Map([['review',c.reviewId],['policy',c.binding],['reserved','0'],...Object.entries(c.allocations).map(([scope,a]):[string,string]=>['slots:'+scope,String(a.slots)])]));}
/** Contract double only; CI executes the application Lua against actual Redis. */
export async function redisPipeline(commands:(string|number)[][]):Promise<unknown[]>{
 calls.push(commands);if(failure)throw Error('Redis unavailable');if(response!==null)return response;
 const [op,,count,key,review,binding,scope,id,rawCharge,rawLimit,rawFunded]=commands[0];
 if(op!=='EVAL'||count!==1||commands.length!==1)throw Error('Expected atomic exposure reservation');
 const h=ledger.get(String(key));if(!h||h.get('review')!==review||h.get('policy')!==binding)return[0];
 const parse=(n:unknown)=>typeof n==='string'&&/^(0|[1-9][0-9]*)$/.test(n)&&Number(n)<=1e12?Number(n):NaN;
 const reserved=parse(h.get('reserved')),charge=parse(String(rawCharge)),limit=parse(String(rawLimit)),funded=parse(String(rawFunded)),slots=parse(h.get('slots:'+scope));
 if(![reserved,charge,limit,funded,slots].every(Number.isSafeInteger)||funded<=0||slots>funded||reserved>limit)return[0];
 const field='case:'+scope+':'+id,raw=h.get(field);
 if(raw!==undefined){const receipt=parse(raw);return[Number.isSafeInteger(receipt)&&receipt===charge&&reserved>=charge&&slots<funded?1:0];}
 if(slots<=0||charge>limit-reserved)return[0];
 h.set('slots:'+scope,String(slots-1));h.set(field,String(charge));h.set('reserved',String(reserved+charge));return lostAck?[]:[1];
}
