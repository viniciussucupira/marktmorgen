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
