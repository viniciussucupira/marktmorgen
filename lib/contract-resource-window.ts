import {isRedisConfigured,redisPipeline} from '@/lib/redis';
import {allowanceWindow,addMonthsMs,isPeriod,type WindowFields} from '@/lib/allowance-window';
import {commercialMarginReady,CURRENT_COMMERCIAL_MARGIN_REVIEW,CURRENT_PRICE_AND_RIGHTS_SNAPSHOT} from '@/lib/commercial-margin';
import {canonicalFinancialSnapshot,contractFundingConfiguration,CONTRACT_FUNDING_RULES,CONTRACT_KEYS,CURRENT_CONTRACT_FUNDING_POLICY,type ContractFundingPolicy,type ContractFundingContext,type ContractKey} from '@/lib/contract-funding-rules';
import {contractFundingBinding} from '@/lib/contract-funding';
import type {Tier} from '@/lib/plan';
export const RESERVE_PAID_RESOURCE_WINDOW = `
local function amount(value,limit)
 if not value or not string.match(value,'^%d+$') or (#value>1 and string.sub(value,1,1)=='0') then return nil end
 local n=tonumber(value)
 if not n or n<0 or n>limit or n~=math.floor(n) then return nil end
 return n
end
local function parts(raw,max)
 if not raw or #raw>max then return nil end
 local result={}
 for value in string.gmatch(raw,'[^|]+') do table.insert(result,value) end
 if table.concat(result,'|')~=raw then return nil end
 return result
end
if redis.call('TYPE',KEYS[1]).ok~='hash' or redis.call('TTL',KEYS[1])~=-1 then return 0 end
if redis.call('HGET',KEYS[1],'policy')~=ARGV[1] or redis.call('HGET',KEYS[1],'review')~=ARGV[2] then return 0 end
local resourceActive=redis.call('HGET',KEYS[1],'active:'..ARGV[3])
local proof=parts(resourceActive,256)
if not proof or #proof~=7 or #proof[1]>84 or not string.match(proof[1],'^ctr_[%w_-]+$') or proof[2]~=ARGV[4] or proof[3]~=ARGV[5] or proof[5]~='paid' or proof[6]~=ARGV[6] or proof[7]~=ARGV[7] then return 0 end
local created,start,finish=amount(proof[4],1000000000000),amount(proof[6],1000000000000),amount(proof[7],1000000000000)
local from,untilMs,now,index,count=amount(ARGV[8],9007199254740991),amount(ARGV[9],9007199254740991),amount(ARGV[10],9007199254740991),amount(ARGV[11],11),amount(ARGV[12],12)
if not created or not start or not finish or start<created or finish<=start or not from or not untilMs or not now or not index or not count or (count~=1 and count~=12) or index>=count then return 0 end
if count~=(string.sub(ARGV[5],-5)=='_year' and 12 or 1) then return 0 end
if from<start*1000 or untilMs>finish*1000 or untilMs<=from or untilMs-from>31*86400000 or now<from or now>=untilMs then return 0 end
if count==1 and (index~=0 or from~=start*1000 or untilMs~=finish*1000) then return 0 end
if redis.call('HGET',KEYS[1],'activated:'..proof[1])~=resourceActive then return 0 end
local receipt=parts(redis.call('HGET',KEYS[1],'grant:'..proof[1]),1024)
if not receipt or receipt[1]~=ARGV[2] or receipt[2]~=ARGV[3] or receipt[3]~=ARGV[5] or not ((#receipt==9 and receipt[4]=='checkout') or (#receipt==10 and receipt[4]=='switch')) then return 0 end
local charge,through=amount(receipt[5],1000000000000),amount(receipt[9],9007199254740991)
local minimum,limit,carry,funded=amount(ARGV[13],1000000000000),amount(ARGV[14],1000000000000),amount(ARGV[15],1000000000000),amount(ARGV[16],1000000000000)
if not amount(receipt[6],1000000000000) or not amount(receipt[7],1000000000000) or not amount(receipt[8],1000000000000) or tonumber(receipt[7])<tonumber(receipt[6]) or tonumber(receipt[8])<tonumber(receipt[7]) then return 0 end
if receipt[4]=='checkout' and (created<tonumber(receipt[6])-300 or created>tonumber(receipt[8])) then return 0 end
if not charge or charge<=0 or charge~=minimum or not through or finish*1000>through or not limit or not carry or not funded or funded<=0 then return 0 end
local reserved,carried=amount(redis.call('HGET',KEYS[1],'reserved'),1000000000000),amount(redis.call('HGET',KEYS[1],'carried'),1000000000000)
if not reserved or not carried or carried~=carry or reserved<carried or reserved>limit or charge>reserved-carried then return 0 end
local expected=carry
local choices={'creator_month','creator_year','pro_month','pro_year','scale_month','scale_year'}
for i,choice in ipairs(choices) do
 local allocated,unit=amount(ARGV[17+(i-1)*2],1000000000000),amount(ARGV[18+(i-1)*2],1000000000000)
 local left=amount(redis.call('HGET',KEYS[1],'slots:'..choice),1000000000000)
 if not allocated or not unit or unit<=0 or not left or left>allocated then return 0 end
 if choice==ARGV[5] and (left>=allocated or allocated~=funded or unit~=minimum) then return 0 end
 expected=expected+(allocated-left)*unit
 if expected>limit then return 0 end
end
if expected~=reserved then return 0 end
-- One shared cohort per grant/month, never a resource-specific or retry nonce.
local field='resource:'..proof[1]..':'..ARGV[11]
local cohort=ARGV[8]..'|'..ARGV[9]
if #field>100 or #cohort>40 then return 0 end
local existing=redis.call('HGET',KEYS[1],field)
if existing then
 if existing~=cohort then return 0 end
 return {1,untilMs}
end
redis.call('HSET',KEYS[1],field,cohort)
return {1,untilMs}
`;
export type PaidResourceStore=WindowFields&{statsId:string|null;tier:Tier};
/** A cohort spends no new principal: its full paid-term liability is already
 * reserved. It binds at most one monthly or twelve annual resource windows to
 * the immutable active paid proof, retaining every receipt and cent. */
export async function reservePaidResourceWindow(
 store:PaidResourceStore,
 policy:ContractFundingPolicy|null=CURRENT_CONTRACT_FUNDING_POLICY,
 context:ContractFundingContext={termsSnapshot:CURRENT_PRICE_AND_RIGHTS_SNAPSHOT,review:CURRENT_COMMERCIAL_MARGIN_REVIEW},
):Promise<boolean>{
 let selected:Record<string,unknown>;
 try{
  if(!store||typeof store!=='object')return false;
  selected=Object.fromEntries(['statsId','tier','cycle','subscriptionId','subscriptionActive','trialEnds','planEndedAt','period'].map(name=>{
   const field=Object.getOwnPropertyDescriptor(store,name);
   return[name,field&&Object.hasOwn(field,'value')?field.value:null];
  }));
 }catch{return false;}
 const encoded=canonicalFinancialSnapshot({store:selected,context});if(!encoded)return false;
 ({store,context}=JSON.parse(encoded) as {store:PaidResourceStore;context:ContractFundingContext});
 if(!store||!context||typeof store.statsId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(store.statsId)||typeof store.subscriptionId!=='string'||!/^sub_[A-Za-z0-9]{6,64}$/.test(store.subscriptionId)||!isPeriod(store.period)||store.period.funded!==true||!isRedisConfigured())return false;
 const key=(store.tier+'_'+store.cycle) as ContractKey;
 if(!CONTRACT_KEYS.includes(key)||!commercialMarginReady(context.review))return false;
 const now=new Date(),config=contractFundingConfiguration(policy,context,now),window=allowanceWindow(store,now.getTime());
 if(!config||!window?.billing||now.getTime()<window.start||now.getTime()>=window.end)return false;
 const count=store.cycle==='year'?12:1;let index=-1;
 for(let i=0;i<count;i++){
  const start=store.cycle==='year'?addMonthsMs(store.period.start*1000,i):store.period.start*1000;
  const end=store.cycle==='year'?Math.min(addMonthsMs(store.period.start*1000,i+1),store.period.end*1000):store.period.end*1000;
  if(start===window.start&&end===window.end){index=i;break;}
 }
 if(index<0||window.end-window.start>31*86400000)return false;
 try{
  const commands:(string|number)[][]=[['EVAL',RESERVE_PAID_RESOURCE_WINDOW,1,'nl:contract-reserve:v1',contractFundingBinding(config),config.reviewId,store.statsId,store.subscriptionId,key,store.period.start,store.period.end,window.start,window.end,now.getTime(),index,count,config.grantCents[key],config.cashLimitCents,config.carryForwardCents,config.fundedGrants[key],...CONTRACT_KEYS.flatMap(choice=>[config.fundedGrants[choice],config.grantCents[choice]])]];
  if(new TextEncoder().encode(JSON.stringify(commands)).length>CONTRACT_FUNDING_RULES.resourceCohortRequestBytes)return false;
  const result=await redisPipeline(commands);
  const ack=result[0],checkedAt=Date.now(),current=contractFundingConfiguration(policy,context,new Date(checkedAt));
  return current!==null&&current.binding===config.binding&&commercialMarginReady(context.review)&&result.length===1&&Array.isArray(ack)&&ack.length===2&&ack[0]===1&&ack[1]===window.end&&checkedAt>=window.start&&checkedAt<window.end;
 }catch{return false;}
}
