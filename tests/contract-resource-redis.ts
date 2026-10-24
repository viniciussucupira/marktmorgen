export * from './contract-funding-redis';
import {ledger,calls,redisPipeline as basePipeline} from './contract-funding-redis';
let lost=false,failure=false,response:unknown[]|null=null;
export function resourceSettings(value:{lost?:boolean;failure?:boolean;response?:unknown[]|null}){if(value.lost!==undefined)lost=value.lost;if(value.failure!==undefined)failure=value.failure;if(value.response!==undefined)response=value.response;}
export async function redisPipeline(commands:(string|number)[][]):Promise<unknown[]>{
 if(!String(commands[0]?.[1]).includes("local resourceActive=redis.call"))return basePipeline(commands);
 calls.push(commands);if(failure)throw Error('Resource ledger unavailable');if(response!==null)return response;
 if(commands.length!==1||commands[0][0]!=='EVAL'||commands[0][2]!==1)throw Error('Expected one resource cohort EVAL');
 const [key,binding,review,store,subscription,choice,rawStart,rawEnd,rawFrom,rawUntil,rawNow,rawIndex,rawCount,rawMinimum,rawLimit,rawCarry,rawFunded,...quotes]=commands[0].slice(3);
 const h=ledger.get(String(key));if(!h||h.get('policy')!==binding||h.get('review')!==review)return[0];
 const parse=(v:unknown,max=1e12)=>/^(0|[1-9][0-9]*)$/.test(String(v))&&Number.isSafeInteger(Number(v))&&Number(v)<=max?Number(v):NaN;
 const active=h.get('active:'+store),proof=(active??'').split('|');
 if(!active||active.length>256||proof.length!==7||proof[0].length>84||!/^ctr_[A-Za-z0-9_-]+$/.test(proof[0])||proof[1]!==subscription||proof[2]!==choice||proof[4]!=='paid'||proof[5]!==String(rawStart)||proof[6]!==String(rawEnd))return[0];
 const [created,start,end]=[proof[3],proof[5],proof[6]].map(v=>parse(v));
 const [from,until,now]=[rawFrom,rawUntil,rawNow].map(v=>parse(v,Number.MAX_SAFE_INTEGER));
 const index=parse(rawIndex,11),count=parse(rawCount,12);
 if(![created,start,end,from,until,now,index,count].every(Number.isSafeInteger)||start<created||end<=start||count!==(String(choice).endsWith('_year')?12:1)||index>=count||from<start*1000||until>end*1000||until<=from||until-from>31*86400000||now<from||now>=until||count===1&&(index!==0||from!==start*1000||until!==end*1000))return[0];
 if(h.get('activated:'+proof[0])!==active)return[0];
 const raw=h.get('grant:'+proof[0]),receipt=(raw??'').split('|');
 if(!raw||raw.length>1024||receipt[0]!==review||receipt[1]!==store||receipt[2]!==choice||!(receipt.length===9&&receipt[3]==='checkout'||receipt.length===10&&receipt[3]==='switch'))return[0];
 const charge=parse(receipt[4]),through=parse(receipt[8],Number.MAX_SAFE_INTEGER),[submitted,expires,deadline]=receipt.slice(5,8).map(v=>parse(v));
 const [minimum,limit,carry,funded]=[rawMinimum,rawLimit,rawCarry,rawFunded].map(v=>parse(v));
 if(![charge,through,submitted,expires,deadline,minimum,limit,carry,funded].every(Number.isSafeInteger)||expires<submitted||deadline<expires||receipt[3]==='checkout'&&(created<submitted-300||created>deadline)||charge<=0||charge!==minimum||end*1000>through||funded<=0)return[0];
 const reserved=parse(h.get('reserved')),carried=parse(h.get('carried'));
 if(![reserved,carried].every(Number.isSafeInteger)||carried!==carry||reserved<carried||reserved>limit||charge>reserved-carried)return[0];
 let expected=carry;
 for(const [i,name] of ['creator_month','creator_year','pro_month','pro_year','scale_month','scale_year'].entries()){
  const allocated=parse(quotes[i*2]),unit=parse(quotes[i*2+1]),left=parse(h.get('slots:'+name));
  if(![allocated,unit,left].every(Number.isSafeInteger)||unit<=0||left>allocated||name===choice&&(left>=allocated||allocated!==funded||unit!==minimum))return[0];
  expected+=(allocated-left)*unit;if(expected>limit)return[0];
 }
 if(expected!==reserved)return[0];
 const field='resource:'+proof[0]+':'+rawIndex,cohort=rawFrom+'|'+rawUntil,existing=h.get(field);
 if(existing!==undefined&&existing!==cohort)return[0];
 if(existing===undefined)h.set(field,cohort);
 return lost?[]:[[1,until]];
}
