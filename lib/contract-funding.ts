import {createHash,randomUUID} from 'node:crypto';
import {isRedisConfigured,redisPipeline} from '@/lib/redis';
import {commercialMarginReady,CURRENT_COMMERCIAL_MARGIN_REVIEW,CURRENT_PRICE_AND_RIGHTS_SNAPSHOT} from '@/lib/commercial-margin';
import {CONTRACT_FUNDING_RULES,CONTRACT_ADMISSION_COVERAGE,CONTRACT_KEYS,CURRENT_CONTRACT_FUNDING_POLICY,canonicalFinancialSnapshot,contractFundingConfiguration,type ContractKey,type ContractFundingPolicy,type ContractFundingContext,type ContractFundingConfiguration} from '@/lib/contract-funding-rules';
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
if ARGV[11]~='checkout' and ARGV[11]~='switch' and ARGV[11]~='restart' then return 0 end
local receiptPrefix=ARGV[2]..'|'..ARGV[3]..'|'..ARGV[4]..'|'..ARGV[11]..'|'
if string.sub(ARGV[10] or '',1,#receiptPrefix)~=receiptPrefix then return 0 end
-- An activated contract cannot open a second new-enrollment obligation.
-- Switches retain their distinct funded lifecycle and never overwrite active.
if ARGV[11]=='checkout' and redis.call('HEXISTS',KEYS[1],'active:'..ARGV[3])==1 then return 0 end
local sourceGrant=nil
local sourceCharge=nil
if ARGV[11]=='checkout' then
 if ARGV[12]~='' then return 0 end
else
 -- Switch/restart obligations name the same immutable funded subscription.
 -- A restart reserve does not prove that the provider actually stopped it.
 local active=redis.call('HGET',KEYS[1],'active:'..ARGV[3])
 if not active or #active>256 then return 0 end
 local source={}
 for field in string.gmatch(active,'[^|]+') do table.insert(source,field) end
 if #source~=7 or table.concat(source,'|')~=active or source[2]~=ARGV[12] or #source[1]>84 or not string.match(source[1],'^ctr_[%w_-]+$') then return 0 end
 if source[3]~='creator_month' and source[3]~='creator_year' and source[3]~='pro_month' and source[3]~='pro_year' and source[3]~='scale_month' and source[3]~='scale_year' then return 0 end
 local created,start,finish,now=amount(source[4]),amount(source[6]),amount(source[7]),amount(ARGV[13])
 if (source[5]~='trial' and source[5]~='paid') or not created or not start or not finish or not now or start<created or start>now or finish<=start then return 0 end
 if ARGV[11]=='switch' and finish<=now then return 0 end
 if ARGV[11]=='restart' then
  if source[5]~='paid' or created<=0 or start<=0 or now<=0 or finish>now or source[3]~=ARGV[4] or (ARGV[4]~='creator_month' and ARGV[4]~='pro_month' and ARGV[4]~='scale_month') then return 0 end
  local proposed={}
  local proposedRaw=ARGV[10]
  if not proposedRaw or #proposedRaw+#source[1]+1>1024 then return 0 end
  for field in string.gmatch(proposedRaw,'[^|]+') do table.insert(proposed,field) end
  if #proposed~=9 or table.concat(proposed,'|')~=proposedRaw or proposed[1]~=ARGV[2] or proposed[2]~=ARGV[3] or proposed[3]~=ARGV[4] or proposed[4]~='restart' or amount(proposed[5])~=amount(ARGV[5]) then return 0 end
  local submitted,expires,activation,submission=amount(proposed[6]),amount(proposed[7]),amount(proposed[8]),amount(ARGV[14])
  local through=tonumber(proposed[9])
  if not submitted or not expires or not activation or not submission or submission<=0 or submitted<submission or now<submitted-submission or now>submitted or expires<submitted or activation<expires or not through or not string.match(proposed[9],'^%d+$') or (#proposed[9]>1 and string.sub(proposed[9],1,1)=='0') or through>9007199254740991 or through~=math.floor(through) or activation*1000>through then return 0 end
 end
 if redis.call('HGET',KEYS[1],'activated:'..source[1])~=active then return 0 end
 local raw=redis.call('HGET',KEYS[1],'grant:'..source[1])
 if not raw or #raw>1024 then return 0 end
 local receipt={}
 for field in string.gmatch(raw,'[^|]+') do table.insert(receipt,field) end
 if table.concat(receipt,'|')~=raw or receipt[1]~=ARGV[2] or receipt[2]~=ARGV[3] or receipt[3]~=source[3] then return 0 end
 if not ((receipt[4]=='checkout' and #receipt==9) or ((receipt[4]=='switch' or receipt[4]=='restart') and #receipt==10 and string.match(receipt[10],'^ctr_[%w_-]+$'))) then return 0 end
 sourceCharge=amount(receipt[5])
 local submitted,expires,activation=amount(receipt[6]),amount(receipt[7]),amount(receipt[8])
 if not submitted or not expires or not activation or (receipt[4]=='checkout' and (submitted<300 or created<submitted-300 or created>activation)) then return 0 end
 local through=tonumber(receipt[9])
 if not sourceCharge or sourceCharge<=0 or not through or not string.match(receipt[9],'^%d+$') or (#receipt[9]>1 and string.sub(receipt[9],1,1)=='0') or through>9007199254740991 or through~=math.floor(through) or finish*1000>through then return 0 end
 sourceGrant=source[1]
end
local reserved=amount(redis.call('HGET',KEYS[1],'reserved'))
local carried=amount(redis.call('HGET',KEYS[1],'carried'))
local charge,limit,carry,funded=amount(ARGV[5]),amount(ARGV[6]),amount(ARGV[7]),amount(ARGV[8])
local slot='slots:'..ARGV[4]
local slots=amount(redis.call('HGET',KEYS[1],slot))
if not reserved or not carried or not charge or charge<=0 or not limit or not carry or carried~=carry or reserved<carried or reserved>limit or not funded or funded<=0 or not slots or slots>funded or slots<=0 then return 0 end
if redis.call('HEXISTS',KEYS[1],'pending:'..ARGV[3])==1 or redis.call('HEXISTS',KEYS[1],'grant:'..ARGV[9])==1 then return 0 end
if charge>limit-reserved or (sourceCharge and sourceCharge>reserved-carried) then return 0 end
redis.call('HINCRBY',KEYS[1],slot,-1)
redis.call('HINCRBY',KEYS[1],'reserved',ARGV[5])
redis.call('HSET',KEYS[1],'pending:'..ARGV[3],ARGV[9])
redis.call('HSET',KEYS[1],'grant:'..ARGV[9],ARGV[10]..(sourceGrant and '|'..sourceGrant or ''))
return 1
`;
export type ContractGrant={sourceSubscriptionId:string|null;action:'checkout'|'switch'|'restart';id:string;reviewId:string;statsId:string;key:ContractKey;reservedCents:number;submitUntilSeconds:number;checkoutExpiresAtSeconds:number;activationUntilSeconds:number;liabilitiesThrough:string};
/** Single-use, full-cost grant. Failure or lost acknowledgement never frees
 * money, capacity or the store's pending lock. No initialization or expiry. */
export async function reserveContractFunding(statsId:string,tier:Tier,cycle:Cycle,action:'checkout'|'switch'|'restart',policy:ContractFundingPolicy|null=CURRENT_CONTRACT_FUNDING_POLICY,context:ContractFundingContext={termsSnapshot:CURRENT_PRICE_AND_RIGHTS_SNAPSHOT,review:CURRENT_COMMERCIAL_MARGIN_REVIEW},nonce='ctr_'+randomUUID(),sourceSubscriptionId:string|null=null):Promise<ContractGrant|null>{
 if(typeof statsId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(statsId)||!['checkout','switch','restart'].includes(action)||typeof nonce!=='string'||!/^ctr_[A-Za-z0-9_-]{1,80}$/.test(nonce)||typeof tier!=='string'||typeof cycle!=='string'||!isRedisConfigured())return null;
 if(action==='restart'&&(!Boolean(CONTRACT_ADMISSION_COVERAGE.pauseRestart)||cycle!=='month'))return null;
 if((action==='switch'||action==='restart')?(typeof sourceSubscriptionId!=='string'||!/^sub_[A-Za-z0-9]{6,64}$/.test(sourceSubscriptionId)):sourceSubscriptionId!==null)return null;
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
 try{
  const result=await redisPipeline([['EVAL',RESERVE_CONTRACT,1,'nl:contract-reserve:v1',contractFundingBinding(config),config.reviewId,statsId,key,charge,config.cashLimitCents,config.carryForwardCents,config.fundedGrants[key],nonce,receipt,action,sourceSubscriptionId??'',seconds,...(action==='restart'?[CONTRACT_FUNDING_RULES.submissionSeconds]:[])]]);
  const current=contractFundingConfiguration(policy,context,new Date()),ready=commercialMarginReady(context.review);
  const checkedAt=Date.now();
  const acknowledged=current!==null&&current.binding===config.binding&&ready&&checkedAt>=reservedAt.getTime()&&checkedAt<=config.admissionsUntilMs&&new Date(checkedAt).toISOString().slice(0,7)===context.review?.fundedExposure?.month&&result.length===1&&result[0]===1&&checkedAt<=submitUntilSeconds*1000;
  return acknowledged?{sourceSubscriptionId,action,id:nonce,reviewId:config.reviewId,statsId,key,reservedCents:charge,submitUntilSeconds,checkoutExpiresAtSeconds,activationUntilSeconds,liabilitiesThrough:new Date(config.liabilitiesThroughMs).toISOString()}:null;
 }catch{return null;}
}

/** A switch reserves a separate obligation against the existing funded
 * subscription. Legacy/unmigrated contracts keep their current rights. */
export async function reserveSwitchContractFunding(
 statsId:string,subscriptionId:string,tier:Tier,cycle:Cycle,
 policy:ContractFundingPolicy|null=CURRENT_CONTRACT_FUNDING_POLICY,
 context:ContractFundingContext={termsSnapshot:CURRENT_PRICE_AND_RIGHTS_SNAPSHOT,review:CURRENT_COMMERCIAL_MARGIN_REVIEW},
 nonce='ctr_'+randomUUID(),
):Promise<ContractGrant|null>{
 return reserveContractFunding(statsId,tier,cycle,'switch',policy,context,nonce,subscriptionId);
}


/** Reservation primitive only. The uncovered real lifecycle refuses before
 * Redis even with a supplied review. This cannot authorize ensurePrice,
 * a charge, a retry, or activation.
 */
export async function reserveRestartContractFunding(
 statsId:string,subscriptionId:string,tier:Tier,
 policy:ContractFundingPolicy|null=CURRENT_CONTRACT_FUNDING_POLICY,
 context:ContractFundingContext={termsSnapshot:CURRENT_PRICE_AND_RIGHTS_SNAPSHOT,review:CURRENT_COMMERCIAL_MARGIN_REVIEW},
 nonce='ctr_'+randomUUID(),
):Promise<ContractGrant|null>{
 return reserveContractFunding(statsId,tier,'month','restart',policy,context,nonce,subscriptionId);
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
if carried~=carry or reserved<carried or reserved>limit or charge>reserved-carried or submitted<submission or created<submitted-submission or created>activation or created>now or through<now*1000 then return 0 end
local start,finish=amount(ARGV[15]),amount(ARGV[16])
if (ARGV[14]~='trial' and ARGV[14]~='paid') or not start or not finish or start<created or start>now or finish<=now or finish<=start or finish*1000>through then return 0 end
local binding=ARGV[5]..'|'..ARGV[6]..'|'..ARGV[4]..'|'..ARGV[7]..'|'..ARGV[14]..'|'..ARGV[15]..'|'..ARGV[16]
local consumed=redis.call('HGET',KEYS[1],'activated:'..ARGV[5])
local active=redis.call('HGET',KEYS[1],'active:'..ARGV[3])
if consumed then
 if consumed~=binding or active~=binding then return 0 end
 return {2,finish}
end
if now>activation then return 0 end
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
  const result=await redisPipeline([['EVAL',ACTIVATE_CONTRACT,1,'nl:contract-reserve:v1',contractFundingBinding(config),reviewId,statsId,key,grantId,subscriptionId,createdSeconds,seconds,config.grantCents[key],config.cashLimitCents,config.carryForwardCents,CONTRACT_FUNDING_RULES.submissionSeconds,config.fundedGrants[key],trialing?'trial':'paid',periodStartSeconds,periodEndSeconds]]);
  const ack=result[0];
  const current=contractFundingConfiguration(policy,context,new Date());
  return current!==null&&current.binding===config.binding&&commercialMarginReady(context.review)&&Date.now()>=now.getTime()&&contractObservationAcknowledged(result,ack,createdSeconds,periodStartSeconds,periodEndSeconds);
 }catch{return false;}
}

/** A switch replaces only the active pointer; all cash and prior proofs stay. */
export const ACTIVATE_SWITCH_CONTRACT = `
local function amount(value)
 if not value or not string.match(value,'^%d+$') or (#value>1 and string.sub(value,1,1)=='0') then return nil end
 local n=tonumber(value)
 if not n or n<0 or n>1000000000000 or n~=math.floor(n) then return nil end
 return n
end
local function parts(raw,max)
 if not raw or #raw>max then return nil end
 local result={}
 for field in string.gmatch(raw,'[^|]+') do table.insert(result,field) end
 if table.concat(result,'|')~=raw then return nil end
 return result
end
if redis.call('TYPE',KEYS[1]).ok~='hash' or redis.call('TTL',KEYS[1])~=-1 then return 0 end
if redis.call('HGET',KEYS[1],'policy')~=ARGV[1] or redis.call('HGET',KEYS[1],'review')~=ARGV[2] then return 0 end
local receipt=parts(redis.call('HGET',KEYS[1],'grant:'..ARGV[5]),1024)
if not receipt or #receipt~=10 or receipt[1]~=ARGV[2] or receipt[2]~=ARGV[3] or receipt[3]~=ARGV[4] or receipt[4]~='switch' or #receipt[10]>84 or not string.match(receipt[10],'^ctr_[%w_-]+$') or receipt[10]==ARGV[5] then return 0 end
local charge,submitted,expires,deadline=amount(receipt[5]),amount(receipt[6]),amount(receipt[7]),amount(receipt[8])
local through=tonumber(receipt[9])
local created,now,minimum,limit,carry,submission,funded,start,finish,span=amount(ARGV[7]),amount(ARGV[8]),amount(ARGV[9]),amount(ARGV[10]),amount(ARGV[11]),amount(ARGV[12]),amount(ARGV[13]),amount(ARGV[15]),amount(ARGV[16]),amount(ARGV[17])
if not charge or charge<=0 or not submitted or not expires or not deadline or not through or through>9007199254740991 or through~=math.floor(through) or not string.match(receipt[9],'^%d+$') or (#receipt[9]>1 and string.sub(receipt[9],1,1)=='0') then return 0 end
if not created or not now or not minimum or not limit or not carry or not submission or not funded or not start or not finish or not span or span<=0 then return 0 end
if charge~=minimum or submitted<submission or expires<submitted or deadline<expires or now<submitted-submission or created>now or start<created or start>now or finish<=now or finish<=start or finish-start>span or finish>submitted-submission+span or finish*1000>through or (ARGV[14]~='trial' and ARGV[14]~='paid') then return 0 end
local reserved,carried,slots=amount(redis.call('HGET',KEYS[1],'reserved')),amount(redis.call('HGET',KEYS[1],'carried')),amount(redis.call('HGET',KEYS[1],'slots:'..ARGV[4]))
if not reserved or not carried or not slots or carried~=carry or reserved<carried or reserved>limit or funded<=0 or slots>=funded then return 0 end
local switchSource=redis.call('HGET',KEYS[1],'activated:'..receipt[10])
local source=parts(switchSource,256)
if not source or #source~=7 or source[1]~=receipt[10] or source[2]~=ARGV[6] or source[4]~=ARGV[7] then return 0 end
local sourceStart,sourceFinish=amount(source[6]),amount(source[7])
if not sourceStart or not sourceFinish or sourceStart<created or sourceStart>submitted-submission or sourceFinish<=submitted-submission or (source[5]~='trial' and source[5]~='paid') then return 0 end
if ARGV[14]=='trial' and (source[5]~='trial' or finish>sourceFinish) then return 0 end
local original=parts(redis.call('HGET',KEYS[1],'grant:'..receipt[10]),1024)
if not original or original[1]~=ARGV[2] or original[2]~=ARGV[3] or original[3]~=source[3] or not ((#original==9 and original[4]=='checkout') or (#original==10 and original[4]=='switch')) then return 0 end
local originalCharge=amount(original[5])
local originalThrough=tonumber(original[9])
if not amount(original[6]) or not amount(original[7]) or not amount(original[8]) or not originalThrough or not string.match(original[9],'^%d+$') or (#original[9]>1 and string.sub(original[9],1,1)=='0') or originalThrough>9007199254740991 or originalThrough~=math.floor(originalThrough) or sourceFinish*1000>originalThrough then return 0 end
if not originalCharge or originalCharge<=0 or charge+originalCharge>reserved-carried then return 0 end
local binding=ARGV[5]..'|'..ARGV[6]..'|'..ARGV[4]..'|'..ARGV[7]..'|'..ARGV[14]..'|'..ARGV[15]..'|'..ARGV[16]
if #binding>256 then return 0 end
local consumed=redis.call('HGET',KEYS[1],'activated:'..ARGV[5])
local active=redis.call('HGET',KEYS[1],'active:'..ARGV[3])
if consumed then
 if consumed~=binding or active~=binding then return 0 end
 return {2,finish}
end
if now>deadline then return 0 end
if active~=switchSource or redis.call('HGET',KEYS[1],'pending:'..ARGV[3])~=ARGV[5] then return 0 end
redis.call('HSET',KEYS[1],'activated:'..ARGV[5],binding,'active:'..ARGV[3],binding)
redis.call('HDEL',KEYS[1],'pending:'..ARGV[3])
return {1,deadline}
`;
export async function activateSwitchContract(
 input:CheckoutContractActivation,
 policy:ContractFundingPolicy|null=CURRENT_CONTRACT_FUNDING_POLICY,
 context:ContractFundingContext={termsSnapshot:CURRENT_PRICE_AND_RIGHTS_SNAPSHOT,review:CURRENT_COMMERCIAL_MARGIN_REVIEW},
):Promise<boolean>{
 const encoded=canonicalFinancialSnapshot({input,context});if(!encoded)return false;
 ({input,context}=JSON.parse(encoded) as {input:CheckoutContractActivation;context:ContractFundingContext});
 if(!input||!context||typeof input!=='object'||typeof context!=='object')return false;
 const {statsId,grantId,reviewId,subscriptionId,tier,cycle,createdSeconds,trialing,periodStartSeconds,periodEndSeconds}=input;
 const key=(tier+'_'+cycle) as ContractKey;
 if(typeof statsId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(statsId)||typeof grantId!=='string'||!/^ctr_[A-Za-z0-9_-]{1,80}$/.test(grantId)||typeof reviewId!=='string'||typeof subscriptionId!=='string'||!/^sub_[A-Za-z0-9]{6,64}$/.test(subscriptionId)||!CONTRACT_KEYS.includes(key)||typeof trialing!=='boolean'||!isRedisConfigured())return false;
 if(![createdSeconds,periodStartSeconds,periodEndSeconds].every(n=>Number.isSafeInteger(n)&&n>0)||periodStartSeconds<createdSeconds||periodEndSeconds<=periodStartSeconds)return false;
 const span=(trialing?CONTRACT_FUNDING_RULES.trialDays:CONTRACT_FUNDING_RULES.paidMonths[cycle]*CONTRACT_FUNDING_RULES.longestMonthDays)*86400;
 if(periodEndSeconds-periodStartSeconds>span||!commercialMarginReady(context.review))return false;
 const now=new Date(),config=contractFundingConfiguration(policy,context,now);if(!config||config.reviewId!==reviewId)return false;
 const seconds=Math.floor(now.getTime()/1000);if(createdSeconds>seconds||periodStartSeconds>seconds||periodEndSeconds<=seconds)return false;
 try{
  const result=await redisPipeline([['EVAL',ACTIVATE_SWITCH_CONTRACT,1,'nl:contract-reserve:v1',contractFundingBinding(config),reviewId,statsId,key,grantId,subscriptionId,createdSeconds,seconds,config.grantCents[key],config.cashLimitCents,config.carryForwardCents,CONTRACT_FUNDING_RULES.submissionSeconds,config.fundedGrants[key],trialing?'trial':'paid',periodStartSeconds,periodEndSeconds,span]]);
  const ack=result[0];
  const current=contractFundingConfiguration(policy,context,new Date());
  return current!==null&&current.binding===config.binding&&commercialMarginReady(context.review)&&Date.now()>=now.getTime()&&contractObservationAcknowledged(result,ack,seconds,periodStartSeconds,periodEndSeconds);
 }catch{return false;}
}

/** A committed proof may be observed for its exact current period. This never
 * turns an expired, unconsumed grant into an activation or a renewal. Admission
 * policy and commercial review must still be current; archives are separate. */
function contractObservationAcknowledged(result:unknown[],ack:unknown,earliestDeadline:number,start:number,finish:number):boolean{
 const checkedAt=Date.now();
 if(result.length!==1||!Array.isArray(ack)||ack.length!==2||!Number.isSafeInteger(ack[1])||checkedAt<start*1000||checkedAt>=finish*1000)return false;
 if(ack[0]===2)return ack[1]===finish;
 return ack[0]===1&&ack[1]>=earliestDeadline&&ack[1]<=earliestDeadline+CONTRACT_FUNDING_RULES.activationDelayDays*86400&&checkedAt<=ack[1]*1000;
}
