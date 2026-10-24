import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalFinancialSnapshot,contractCoverageDays,contractFundingConfiguration,CONTRACT_ADMISSION_COVERAGE,CONTRACT_KEYS} from '@/lib/contract-funding-rules';
import {assessCustomerWorstCase} from '@/lib/net-margin-rules';
import {activateCheckoutContract,type CheckoutContractActivation,reserveContractFunding} from '@/lib/contract-funding';
import {contractFixture} from './contract-funding-fixture';
import {reset,seed,ledger,calls,settings} from './contract-funding-redis';
const key='nl:contract-reserve:v1';
function start(){reset();const f=contractFixture(),config=contractFundingConfiguration(f.policy,f.context,f.now)!;assert.ok(config);seed(config);return {...f,config};}
test('annual coverage funds twelve paid months plus the reviewed tail and repeated pause bounds',()=>{assert.equal(contractCoverageDays('month',60),167);assert.equal(contractCoverageDays('year',60),570);assert.equal(contractCoverageDays('year',null as unknown as number),null);assert.equal(contractCoverageDays('month',59),null);});
test('cash reserve includes the full published refund principal without reducing or changing profit arithmetic',()=>{const f=start();const before=assessCustomerWorstCase(f.review.scenarios.creator_year_full!);assert.equal(f.config.grantCents.creator_month,9316);assert.equal(f.config.grantCents.creator_year,93153);assert.equal(before.netCents,44850);assert.deepEqual(assessCustomerWorstCase(f.review.scenarios.creator_year_full!),before);assert.equal(canonicalFinancialSnapshot(f.review),f.policy.financialSnapshot);});
test('one cent under aggregate grants or a quote covering only the paid year cannot approve',()=>{let f=contractFixture();f.policy.reservedFundsCents--;assert.equal(contractFundingConfiguration(f.policy,f.context,f.now),null);f=contractFixture();f.policy.liabilitiesThrough=new Date(Date.parse(f.policy.admissionsUntil)+365*86400000).toISOString();assert.equal(contractFundingConfiguration(f.policy,f.context,f.now),null);f=contractFixture();f.policy.allTermCostsAndLiabilitiesBounded=false;assert.equal(contractFundingConfiguration(f.policy,f.context,f.now),null);});
test('new trial obligations and missing fixed costs cannot disappear from the quote',()=>{let f=contractFixture();f.policy.fundedGrants.creator_month++;f.policy.reservedFundsCents+=100000;assert.equal(contractFundingConfiguration(f.policy,f.context,f.now),null);f=contractFixture();f.review.companyBase!.monthlyFixedCostsCeilingCents=null;f.policy.financialSnapshot=canonicalFinancialSnapshot(f.review)!;assert.equal(contractFundingConfiguration(f.policy,f.context,f.now),null);});
test('canonical review binding refuses accessors, cycles, changed costs and expired admission',()=>{const f=contractFixture();let reads=0;Object.defineProperty(f.policy,'reservedFundsCents',{get(){reads++;return 1e12;}});assert.equal(contractFundingConfiguration(f.policy,f.context,f.now),null);assert.equal(reads,0);const cyclic:{self?:unknown}={};cyclic.self=cyclic;assert.equal(canonicalFinancialSnapshot(cyclic),null);const g=contractFixture();g.review.scenarios.creator_month_full!.costCeilings.other!++;assert.equal(contractFundingConfiguration(g.policy,g.context,g.now),null);const h=contractFixture();h.policy.admissionsUntil=new Date(h.now.getTime()-1).toISOString();assert.equal(contractFundingConfiguration(h.policy,h.context,h.now),null);});
test('64 concurrent stores cannot reuse two funded grant slots',async()=>{const f=start();const results=await Promise.all(Array.from({length:64},(_,i)=>reserveContractFunding('store'+i,'creator','month','checkout',f.policy,f.context,'ctr_'+i)));assert.equal(results.filter(Boolean).length,2);assert.equal(ledger.get(key)?.get('reserved'),String(f.config.grantCents.creator_month*2));assert.equal(ledger.get(key)?.get('slots:creator_month'),'0');});
test('one pending store cannot open concurrent obligations under different grant IDs',async()=>{const f=start();const results=await Promise.all(Array.from({length:64},(_,i)=>reserveContractFunding('one','creator','month','checkout',f.policy,f.context,'ctr_'+i)));assert.equal(results.filter(Boolean).length,1);assert.equal(ledger.get(key)?.get('reserved'),String(f.config.grantCents.creator_month));assert.equal(await reserveContractFunding('one','creator','year','switch',f.policy,f.context,'ctr_other'),null);});
test('lost acknowledgement retains cash, slot, nonce and pending store lock',async()=>{const f=start();settings({lostAck:true});assert.equal(await reserveContractFunding('one','creator','year','checkout',f.policy,f.context,'ctr_lost'),null);assert.equal(ledger.get(key)?.get('reserved'),String(f.config.grantCents.creator_year));settings({lostAck:false});assert.equal(await reserveContractFunding('one','creator','year','checkout',f.policy,f.context,'ctr_retry'),null);assert.equal(await reserveContractFunding('two','creator','year','checkout',f.policy,f.context,'ctr_lost'),null);assert.equal(ledger.get(key)?.get('slots:creator_year'),'1');});
test('carried liabilities cannot be reset or reused to finance new grants',async()=>{const f=contractFixture();f.policy.carryForwardReservedCents=100;f.policy.reservedFundsCents+=100;const c=contractFundingConfiguration(f.policy,f.context,f.now)!;reset();seed(c);assert.ok(await reserveContractFunding('one','creator','month','checkout',f.policy,f.context,'ctr_carry'));assert.equal(ledger.get(key)?.get('reserved'),String(100+c.grantCents.creator_month));ledger.get(key)!.set('reserved','99');const before=[...ledger.get(key)!];assert.equal(await reserveContractFunding('two','creator','month','checkout',f.policy,f.context,'ctr_other'),null);assert.deepEqual([...ledger.get(key)!],before);});
test('financial review ID alone cannot reuse a changed reserve budget or evidence',async()=>{const f=start();f.policy.reservedFundsCents++;f.policy.reserveEvidence+=' changed';assert.equal(await reserveContractFunding('one','creator','month','checkout',f.policy,f.context,'ctr_changed'),null);assert.equal(ledger.get(key)?.get('reserved'),'0');});
test('corrupt money, slots, policy or storage acknowledgements deny without new rights',async()=>{for(const [field,value] of [['reserved','-1'],['carried','1'],['slots:creator_month','3'],['policy','wrong']]){const f=start();ledger.get(key)!.set(field,value);const before=[...ledger.get(key)!];assert.equal(await reserveContractFunding('one','creator','month','checkout',f.policy,f.context,'ctr_bad'),null);assert.deepEqual([...ledger.get(key)!],before);}const f=start();for(const response of [[],[true],['1'],[1,1]]){settings({response});assert.equal(await reserveContractFunding('one','creator','month','checkout',f.policy,f.context,'ctr_ack'),null);}});
test('absent real approvals and unfinished lifecycle coverage keep admission closed',async()=>{reset();assert.equal(await reserveContractFunding('one','creator','year','checkout'),null);assert.equal(calls.length,0);assert.equal(CONTRACT_ADMISSION_COVERAGE.renewals,false);assert.equal(CONTRACT_ADMISSION_COVERAGE.resourceAllocations,false);assert.equal(CONTRACT_ADMISSION_COVERAGE.settlementAndReserveReconciliation,false);assert.equal(CONTRACT_KEYS.length,6);});

test('computed financial context is not executed or accepted as reserve evidence',async()=>{const f=start();let reads=0;Object.defineProperty(f.context,'review',{get(){reads++;return f.review;}});assert.equal(contractFundingConfiguration(f.policy,f.context),null);assert.equal(await reserveContractFunding('one','creator','month','checkout',f.policy,f.context,'ctr_getter'),null);assert.equal(reads,0);assert.equal(calls.length,0);});

test('missing or primitive financial contexts refuse admission without throwing',async()=>{const f=start();for(const value of [null,0,false,[],{}]){const context=value as unknown as typeof f.context;assert.equal(contractFundingConfiguration(f.policy,context),null);assert.equal(await reserveContractFunding('one','creator','month','checkout',f.policy,context,'ctr_invalid'),null);}assert.equal(calls.length,0);});

function activation(statsId='one',grantId='ctr_activate',createdSeconds=Math.floor(Date.now()/1000)):CheckoutContractActivation{
 return{statsId,grantId,reviewId:'contract_test',subscriptionId:'sub_Activation001',tier:'creator',cycle:'month',createdSeconds,trialing:false,periodStartSeconds:createdSeconds,periodEndSeconds:createdSeconds+30*86400};
}
test('checkout activation binds one receipt and provider subscription without releasing a cent or slot',async()=>{
 const f=start(),g=await reserveContractFunding('one','creator','month','checkout',f.policy,f.context,'ctr_activate');assert.ok(g);
 const before=ledger.get(key)!,reserved=before.get('reserved'),slots=before.get('slots:creator_month');
 const input=activation();assert.equal(await activateCheckoutContract(input,f.policy,f.context),true);
 assert.equal(before.get('reserved'),reserved);assert.equal(before.get('slots:creator_month'),slots);
 assert.equal(before.has('pending:one'),false);assert.ok(before.get('activated:ctr_activate'));assert.ok(before.get('grant:ctr_activate'));
 assert.equal(await activateCheckoutContract(input,f.policy,f.context),true);
 assert.equal(await activateCheckoutContract({...input,subscriptionId:'sub_Another001'},f.policy,f.context),false);
 assert.equal(before.get('reserved'),reserved);
});
test('lost activation acknowledgement is recoverable only for the identical committed binding',async()=>{
 const f=start();assert.ok(await reserveContractFunding('one','creator','month','checkout',f.policy,f.context,'ctr_activate'));
 const input=activation();settings({lostAck:true});assert.equal(await activateCheckoutContract(input,f.policy,f.context),false);
 const before=[...ledger.get(key)!];settings({lostAck:false});
 assert.equal(await activateCheckoutContract(input,f.policy,f.context),true);assert.deepEqual([...ledger.get(key)!],before);
 assert.equal(await activateCheckoutContract({...input,statsId:'other'},f.policy,f.context),false);
});
test('activation rejects wrong store, plan, review, missing receipt and reused renewal period',async()=>{
 const f=start();assert.ok(await reserveContractFunding('one','creator','month','checkout',f.policy,f.context,'ctr_activate'));
 const before=[...ledger.get(key)!],input=activation();
 for(const changes of [{statsId:'other'},{tier:'scale'},{reviewId:'other'},{grantId:'ctr_missing'},{createdSeconds:1},{periodEndSeconds:input.createdSeconds+61*86400},{trialing:true,periodEndSeconds:input.createdSeconds+15*86400}]){
  assert.equal(await activateCheckoutContract({...input,...changes} as CheckoutContractActivation,f.policy,f.context),false);
  assert.deepEqual([...ledger.get(key)!],before);
 }
});
test('activation never treats a switch receipt, corrupt ledger or ambiguous response as rights',async()=>{
 const f=start();assert.ok(await reserveContractFunding('one','creator','month','switch',f.policy,f.context,'ctr_activate'));
 assert.equal(await activateCheckoutContract(activation(),f.policy,f.context),false);
 for(const [field,value] of [['reserved','0'],['carried','1'],['slots:creator_month','2'],['policy','wrong']]){
  const g=start();assert.ok(await reserveContractFunding('one','creator','month','checkout',g.policy,g.context,'ctr_activate'));
  ledger.get(key)!.set(field,value);const before=[...ledger.get(key)!];
  assert.equal(await activateCheckoutContract(activation(),g.policy,g.context),false);assert.deepEqual([...ledger.get(key)!],before);
 }
 const g=start();assert.ok(await reserveContractFunding('one','creator','month','checkout',g.policy,g.context,'ctr_activate'));
 for(const response of [[],[1],[[true,9999999999]],[[1,0]],[[1,'9999999999']],[[1,9999999999,1]]]){
  settings({response});assert.equal(await activateCheckoutContract(activation(),g.policy,g.context),false);
 }
});
test('unconfigured or executable activation input makes no Redis request',async()=>{
 reset();assert.equal(await activateCheckoutContract(activation()),false);assert.equal(calls.length,0);
 const f=start(),input=activation();let reads=0;
 Object.defineProperty(input,'statsId',{get(){reads++;return 'one';}});
 assert.equal(await activateCheckoutContract(input,f.policy,f.context),false);assert.equal(reads,0);assert.equal(calls.length,0);
});
