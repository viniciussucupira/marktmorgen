import {createHash,randomUUID} from 'node:crypto';
import {isRedisConfigured,redisPipeline} from '@/lib/redis';
import {commercialMarginReady,CURRENT_COMMERCIAL_MARGIN_REVIEW,CURRENT_PRICE_AND_RIGHTS_SNAPSHOT} from '@/lib/commercial-margin';
import {CONTRACT_FUNDING_RULES,CONTRACT_KEYS,CURRENT_CONTRACT_FUNDING_POLICY,canonicalFinancialSnapshot,contractFundingConfiguration,type ContractKey,type ContractFundingPolicy,type ContractFundingContext,type ContractFundingConfiguration} from '@/lib/contract-funding-rules';
import type {Tier,Cycle} from '@/lib/plan';
export const contractFundingBinding=(c:ContractFundingConfiguration)=>createHash('sha256').update(c.binding).digest('hex');
export const RESERVE_CONTRACT = `
local function amount(value)
 if not value or not string.match(value,'^%d+$') or (#value>1 and string.sub(value,1,1)=='0') then return nil end
 local n=tonumber(value)
 if not n or n<0 or n>1000000000000 or n~=math.floor(n) then return nil end
 return n
end
if redis.call('TYPE',KEYS[1]).ok~='hash' or redis.call('TTL',KEYS[1])~=-1 then return 0 end
if redis.call('HGET',KEYS[1],'policy')~=ARGV[1] or redis.call('HGET',KEYS[1],'review')~=ARGV[2] then return 0 end
local reserved=amount(redis.call('HGET',KEYS[1],'reserved'))
local carried=amount(redis.call('HGET',KEYS[1],'carried'))
local charge,limit,carry,funded=amount(ARGV[5]),amount(ARGV[6]),amount(ARGV[7]),amount(ARGV[8])
local slot='slots:'..ARGV[4]
local slots=amount(redis.call('HGET',KEYS[1],slot))
if not reserved or not carried or not charge or charge<=0 or not limit or not carry or carried~=carry or reserved<carried or reserved>limit or not funded or funded<=0 or not slots or slots>funded or slots<=0 then return 0 end
if redis.call('HEXISTS',KEYS[1],'pending:'..ARGV[3])==1 or redis.call('HEXISTS',KEYS[1],'grant:'..ARGV[9])==1 then return 0 end
if charge>limit-reserved then return 0 end
redis.call('HINCRBY',KEYS[1],slot,-1)
redis.call('HINCRBY',KEYS[1],'reserved',ARGV[5])
redis.call('HSET',KEYS[1],'pending:'..ARGV[3],ARGV[9])
redis.call('HSET',KEYS[1],'grant:'..ARGV[9],ARGV[10])
return 1
`;
export type ContractGrant={id:string;reviewId:string;statsId:string;key:ContractKey;reservedCents:number;submitUntilSeconds:number;checkoutExpiresAtSeconds:number;activationUntilSeconds:number;liabilitiesThrough:string};
/** Single-use, full-cost grant. Failure or lost acknowledgement never frees
 * money, capacity or the store's pending lock. No initialization or expiry. */
export async function reserveContractFunding(statsId:string,tier:Tier,cycle:Cycle,action:'checkout'|'switch',policy:ContractFundingPolicy|null=CURRENT_CONTRACT_FUNDING_POLICY,context:ContractFundingContext={termsSnapshot:CURRENT_PRICE_AND_RIGHTS_SNAPSHOT,review:CURRENT_COMMERCIAL_MARGIN_REVIEW},nonce='ctr_'+randomUUID()):Promise<ContractGrant|null>{
 if(typeof statsId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(statsId)||!['checkout','switch'].includes(action)||typeof nonce!=='string'||!/^ctr_[A-Za-z0-9_-]{1,80}$/.test(nonce)||typeof tier!=='string'||typeof cycle!=='string'||!isRedisConfigured())return null;
 const key=(tier+'_'+cycle) as ContractKey;
 const encodedContext=canonicalFinancialSnapshot(context);
 if(!encodedContext)return null;
 context=JSON.parse(encodedContext) as ContractFundingContext;
 if(!context||typeof context!=='object'||Array.isArray(context))return null;
 if(!CONTRACT_KEYS.includes(key)||!commercialMarginReady(context.review))return null;
 const reservedAt=new Date();
 const config=contractFundingConfiguration(policy,context,reservedAt);
 if(!config||config.fundedGrants[key]===0)return null;
 const seconds=Math.floor(reservedAt.getTime()/1000),submitUntilSeconds=seconds+CONTRACT_FUNDING_RULES.submissionSeconds,checkoutExpiresAtSeconds=seconds+CONTRACT_FUNDING_RULES.checkoutLifetimeSeconds,activationUntilSeconds=seconds+CONTRACT_FUNDING_RULES.activationDelayDays*86400;
 const charge=config.grantCents[key],receipt=[config.reviewId,statsId,key,action,charge,submitUntilSeconds,checkoutExpiresAtSeconds,activationUntilSeconds,config.liabilitiesThroughMs].join('|');
 try{const result=await redisPipeline([['EVAL',RESERVE_CONTRACT,1,'nl:contract-reserve:v1',contractFundingBinding(config),config.reviewId,statsId,key,charge,config.cashLimitCents,config.carryForwardCents,config.fundedGrants[key],nonce,receipt]]);return result.length===1&&result[0]===1&&Date.now()<=submitUntilSeconds*1000?{id:nonce,reviewId:config.reviewId,statsId,key,reservedCents:charge,submitUntilSeconds,checkoutExpiresAtSeconds,activationUntilSeconds,liabilitiesThrough:new Date(config.liabilitiesThroughMs).toISOString()}:null;}catch{return null;}
}


/** Checkout activation binds an existing cash receipt to one subscription.
 * It never releases reserved money or replenishes grant slots. */
export const ACTIVATE_CONTRACT = `
local function amount(value)
 if not value or not string.match(value,'^%d+$') or (#value>1 and string.sub(value,1,1)=='0') then return nil end
 local n=tonumber(value)
 if not n or n<0 or n>1000000000000 or n~=math.floor(n) then return nil end
 return n
end
if redis.call('TYPE',KEYS[1]).ok~='hash' or redis.call('TTL',KEYS[1])~=-1 then return 0 end
if redis.call('HGET',KEYS[1],'policy')~=ARGV[1] or redis.call('HGET',KEYS[1],'review')~=ARGV[2] then return 0 end
local raw=redis.call('HGET',KEYS[1],'grant:'..ARGV[5])
if not raw then return 0 end
local receipt={}
for field in string.gmatch(raw,'[^|]+') do table.insert(receipt,field) end
if #receipt~=9 or table.concat(receipt,'|')~=raw then return 0 end
local charge,submitted,expires,activation,through=amount(receipt[5]),amount(receipt[6]),amount(receipt[7]),amount(receipt[8]),tonumber(receipt[9])
local created,now,minimum,limit,carry,submission=amount(ARGV[7]),amount(ARGV[8]),amount(ARGV[9]),amount(ARGV[10]),amount(ARGV[11]),amount(ARGV[12])
local reserved,carried=amount(redis.call('HGET',KEYS[1],'reserved')),amount(redis.call('HGET',KEYS[1],'carried'))
local slots,funded=amount(redis.call('HGET',KEYS[1],'slots:'..ARGV[4])),amount(ARGV[13])
if receipt[1]~=ARGV[2] or receipt[2]~=ARGV[3] or receipt[3]~=ARGV[4] or receipt[4]~='checkout' then return 0 end
if not charge or not minimum or charge~=minimum or not submitted or not expires or not activation or not through or through<0 or through>9007199254740991 or through~=math.floor(through) or not string.match(receipt[9],'^%d+$') or (#receipt[9]>1 and string.sub(receipt[9],1,1)=='0') or not created or not now or not submission or not limit or not carry or not reserved or not carried or not slots or not funded or funded<=0 or slots>=funded then return 0 end
if carried~=carry or reserved<carried or reserved>limit or charge>reserved-carried or submitted<submission or created<submitted-submission or created>activation or created>now or now>activation or through<now*1000 then return 0 end
local binding=ARGV[5]..'|'..ARGV[6]..'|'..ARGV[4]..'|'..ARGV[7]
local consumed=redis.call('HGET',KEYS[1],'activated:'..ARGV[5])
local active=redis.call('HGET',KEYS[1],'active:'..ARGV[3])
if consumed then
 if consumed~=binding or active~=binding then return 0 end
 return {1,activation}
end
if redis.call('HGET',KEYS[1],'pending:'..ARGV[3])~=ARGV[5] then return 0 end
-- An already active subscription is reconciled by the switch/renewal lifecycle.
if active then return 0 end
redis.call('HSET',KEYS[1],'activated:'..ARGV[5],binding,'active:'..ARGV[3],binding)
redis.call('HDEL',KEYS[1],'pending:'..ARGV[3])
return {1,activation}
`;
export type CheckoutContractActivation={
 statsId:string;grantId:string;reviewId:string;subscriptionId:string;tier:Tier;cycle:Cycle;
 createdSeconds:number;trialing:boolean;periodStartSeconds:number;periodEndSeconds:number;
};
/** Trusted provider observations only, never request/session query parameters.
 * This covers checkout activation, not resource grants or renewal admission. */
export async function activateCheckoutContract(
 input:CheckoutContractActivation,
 policy:ContractFundingPolicy|null=CURRENT_CONTRACT_FUNDING_POLICY,
 context:ContractFundingContext={termsSnapshot:CURRENT_PRICE_AND_RIGHTS_SNAPSHOT,review:CURRENT_COMMERCIAL_MARGIN_REVIEW},
):Promise<boolean>{
 const encoded=canonicalFinancialSnapshot({input,context});
 if(!encoded)return false;
 ({input,context}=JSON.parse(encoded) as {input:CheckoutContractActivation;context:ContractFundingContext});
 if(!input||!context||typeof input!=='object'||typeof context!=='object')return false;
 const {statsId,grantId,reviewId,subscriptionId,tier,cycle,createdSeconds,trialing,periodStartSeconds,periodEndSeconds}=input;
 const key=(tier+'_'+cycle) as ContractKey;
 if(typeof statsId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(statsId)||typeof grantId!=='string'||!/^ctr_[A-Za-z0-9_-]{1,80}$/.test(grantId)||typeof reviewId!=='string'||typeof subscriptionId!=='string'||!/^sub_[A-Za-z0-9]{6,64}$/.test(subscriptionId)||!CONTRACT_KEYS.includes(key)||typeof trialing!=='boolean'||!isRedisConfigured())return false;
 if(![createdSeconds,periodStartSeconds,periodEndSeconds].every(n=>Number.isSafeInteger(n)&&n>0)||periodStartSeconds<createdSeconds||periodEndSeconds<=periodStartSeconds)return false;
 const paidDays=CONTRACT_FUNDING_RULES.paidMonths[cycle]*CONTRACT_FUNDING_RULES.longestMonthDays;
 const longest=(trialing?CONTRACT_FUNDING_RULES.trialDays:paidDays)*86400;
 const lastEnd=createdSeconds+(CONTRACT_FUNDING_RULES.trialDays+(trialing?0:paidDays))*86400;
 if(!Number.isSafeInteger(lastEnd)||periodEndSeconds-periodStartSeconds>longest||periodEndSeconds>lastEnd||!commercialMarginReady(context.review))return false;
 const now=new Date(),config=contractFundingConfiguration(policy,context,now);
 if(!config||config.reviewId!==reviewId)return false;
 const seconds=Math.floor(now.getTime()/1000);
 if(createdSeconds>seconds||periodEndSeconds<=seconds)return false;
 try{
  const result=await redisPipeline([['EVAL',ACTIVATE_CONTRACT,1,'nl:contract-reserve:v1',contractFundingBinding(config),reviewId,statsId,key,grantId,subscriptionId,createdSeconds,seconds,config.grantCents[key],config.cashLimitCents,config.carryForwardCents,CONTRACT_FUNDING_RULES.submissionSeconds,config.fundedGrants[key]]]);
  const ack=result[0];
  return result.length===1&&Array.isArray(ack)&&ack.length===2&&ack[0]===1&&Number.isSafeInteger(ack[1])&&ack[1]>=createdSeconds&&ack[1]<=createdSeconds+CONTRACT_FUNDING_RULES.activationDelayDays*86400&&Date.now()<=ack[1]*1000&&Date.now()<periodEndSeconds*1000;
 }catch{return false;}
}
