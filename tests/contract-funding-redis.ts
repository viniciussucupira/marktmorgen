import {createHash} from 'node:crypto';
import type {ContractFundingConfiguration} from '@/lib/contract-funding-rules';
export const ledger=new Map<string,Map<string,string>>();
export const calls:(string|number)[][][]=[];
let available=true,failure=false,lostAck=false;
let response:unknown[]|null=null;
export const isRedisConfigured=()=>available;
export function reset(){ledger.clear();calls.length=0;available=true;failure=false;lostAck=false;response=null;}
export function settings(v:{available?:boolean;failure?:boolean;lostAck?:boolean;response?:unknown[]|null}){if(v.available!==undefined)available=v.available;if(v.failure!==undefined)failure=v.failure;if(v.lostAck!==undefined)lostAck=v.lostAck;if(v.response!==undefined)response=v.response;}
export function seed(c:ContractFundingConfiguration){ledger.set('nl:contract-reserve:v1',new Map([['review',c.reviewId],['policy',createHash('sha256').update(c.binding).digest('hex')],['reserved',String(c.carryForwardCents)],['carried',String(c.carryForwardCents)],...Object.entries(c.fundedGrants).map(([key,n]):[string,string]=>['slots:'+key,String(n)])]));}

function activate(args:(string|number)[]):unknown[]{
 const [key,binding,review,store,choice,nonce,subscription,rawCreated,rawNow,rawMinimum,rawLimit,rawCarry,rawSubmission,rawFunded,phase,rawStart,rawEnd]=args;
 const h=ledger.get(String(key));
 if(!h||h.get('policy')!==binding||h.get('review')!==review)return[0];
 const parse=(n:unknown)=>typeof n==='string'&&/^(0|[1-9][0-9]*)$/.test(n)&&Number(n)<=1e12?Number(n):NaN;
 const receipt=(h.get('grant:'+nonce)??'').split('|');
 if(receipt.length!==9)return[0];
 const [charge,submitted,expires,activation]=receipt.slice(4,8).map(parse);
 const through=/^(0|[1-9][0-9]*)$/.test(receipt[8])?Number(receipt[8]):NaN;
 const [created,now,minimum,limit,carry,submission,funded]=[rawCreated,rawNow,rawMinimum,rawLimit,rawCarry,rawSubmission,rawFunded].map(n=>parse(String(n)));
 const reserved=parse(h.get('reserved')),carried=parse(h.get('carried')),slots=parse(h.get('slots:'+choice));
 if(receipt[0]!==review||receipt[1]!==store||receipt[2]!==choice||receipt[3]!=='checkout'||![charge,submitted,expires,activation,through,created,now,minimum,limit,carry,submission,funded,reserved,carried,slots].every(Number.isSafeInteger)||funded<=0||slots>=funded)return[0];
 if(charge!==minimum||carried!==carry||reserved<carried||reserved>limit||charge>reserved-carried||submitted<submission||created<submitted-submission||created>activation||created>now||now>activation||through<now*1000)return[0];
 const start=parse(String(rawStart)),finish=parse(String(rawEnd));
 if(!['trial','paid'].includes(String(phase))||!Number.isSafeInteger(start)||!Number.isSafeInteger(finish)||start<created||finish<=start||finish*1000>through)return[0];
 const proof=[nonce,subscription,choice,rawCreated,phase,rawStart,rawEnd].join('|'),consumed=h.get('activated:'+nonce),active=h.get('active:'+store);
 if(consumed)return consumed===proof&&active===proof?[[1,activation]]:[0];
 if(h.get('pending:'+store)!==nonce||active)return[0];
 h.set('activated:'+nonce,proof);h.set('active:'+store,proof);h.delete('pending:'+store);
 return lostAck?[]:[[1,activation]];
}

/** Contract double only. CI executes the production Lua against real Redis. */
export async function redisPipeline(commands:(string|number)[][]):Promise<unknown[]>{calls.push(commands);if(failure)throw Error('Redis unavailable');if(response!==null)return response;if(String(commands[0]?.[1]).includes("'activated:'")){if(commands.length!==1||commands[0][0]!=='EVAL'||commands[0][2]!==1)throw Error('Expected one activation');return activate(commands[0].slice(3));}const [op,,keys,key,binding,review,store,choice,rawCharge,rawLimit,rawCarry,rawFunded,nonce,receipt,action]=commands[0];if(op!=='EVAL'||keys!==1||commands.length!==1)throw Error('Expected one contract reservation');const h=ledger.get(String(key));if(!h||h.get('policy')!==binding||h.get('review')!==review)return[0];if(!['checkout','switch'].includes(String(action))||!String(receipt).startsWith([review,store,choice,action,''].join('|'))||action==='checkout'&&h.has('active:'+store))return[0];const parse=(n:unknown)=>typeof n==='string'&&/^(0|[1-9][0-9]*)$/.test(n)&&Number(n)<=1e12?Number(n):NaN;const reserved=parse(h.get('reserved')),carried=parse(h.get('carried')),charge=parse(String(rawCharge)),limit=parse(String(rawLimit)),carry=parse(String(rawCarry)),funded=parse(String(rawFunded)),slots=parse(h.get('slots:'+choice));if(![reserved,carried,charge,limit,carry,funded,slots].every(Number.isSafeInteger)||charge<=0||carried!==carry||reserved<carried||reserved>limit||funded<=0||slots>funded||slots<=0||h.has('pending:'+store)||h.has('grant:'+nonce)||charge>limit-reserved)return[0];h.set('slots:'+choice,String(slots-1));h.set('reserved',String(reserved+charge));h.set('pending:'+store,String(nonce));h.set('grant:'+nonce,String(receipt));return lostAck?[]:[1];}
