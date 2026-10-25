import {activationObservations,switchActivationObservations} from './contract-activation-billing';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createBillingCheckout,switchPlan,readSubscription,readStartedSubscription,startedFromObservedSubscription,findStoreSubscriptions} from '@/lib/billing';
import type {ContractGrant} from '@/lib/contract-funding';
import type {Store} from '@/lib/store';
import {PUBLISHED_PLAN_PRICES} from '@/lib/plan';
process.env.STRIPE_SECRET_KEY='sk_test_not_a_real_deployment_key';
const store={statsId:'metadata-one',handle:'harbor',email:'owner@example.test',stripeCustomerId:null,subscriptionId:null,extra:false} as Store;
function grant(action:ContractGrant['action']='checkout'):ContractGrant{const now=Math.floor(Date.now()/1000);return{sourceSubscriptionId:action==='switch'?'sub_Test000001':null,action,id:'ctr_metadata',reviewId:'test_only',statsId:'metadata-one',key:'creator_year',reservedCents:93153,submitUntilSeconds:now+300,checkoutExpiresAtSeconds:now+3600,activationUntilSeconds:now+86400,liabilitiesThrough:'2099-01-01T00:00:00.000Z'};}
function sourcePeriod(){const now=Math.floor(Date.now()/1000);return{current_period_start:now-86400,current_period_end:now+30*86400};}
test('funded checkout carries its reserve reference, fixed price and bounded expiration to Stripe',async()=>{const old=globalThis.fetch;const g=grant();let body:URLSearchParams|null=null;globalThis.fetch=async(input,init)=>{const url=new URL(String(input));if(url.pathname==='/v1/checkout/sessions'){body=new URLSearchParams(String(init?.body));return Response.json({url:'https://checkout.stripe.test/session'});}return Response.json({error:{message:'TEST ONLY no catalog'}},{status:404});};try{assert.equal(await createBillingCheckout(store,'https://marktmorgen.test',{tier:'creator',cycle:'year'},null,g),'https://checkout.stripe.test/session');const sent=body as URLSearchParams|null;assert.ok(sent);assert.equal(sent.get('metadata[funding_grant]'),g.id);assert.equal(sent.get('subscription_data[metadata][funding_review]'),g.reviewId);assert.equal(sent.get('line_items[0][price_data][unit_amount]'),'69000');assert.equal(sent.get('expires_at'),String(g.checkoutExpiresAtSeconds));}finally{globalThis.fetch=old;}});
test('wrong plan, wrong store, insufficient principal or an expired grant reaches no provider',async()=>{const old=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('must not call');};try{for(const change of [{key:'scale_year'},{statsId:'other'},{reservedCents:68999},{submitUntilSeconds:1}])await assert.rejects(createBillingCheckout(store,'https://marktmorgen.test',{tier:'creator',cycle:'year'},null,{...grant(),...change} as ContractGrant));assert.equal(calls,0);}finally{globalThis.fetch=old;}});
test('pending plan changes retain a separate funding reference without replacing the active grant',async()=>{const old=globalThis.fetch;const g=grant('switch');const writes:URLSearchParams[]=[];const subscription={id:'sub_Test000001',status:'active',metadata:{funding_grant:'ctr_prior'},items:{data:[{...sourcePeriod(),id:'si_test',quantity:1,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}};globalThis.fetch=async(input,init)=>{const url=new URL(String(input));if(url.pathname==='/v1/prices')return Response.json({data:[{id:'price_year',unit_amount:69000,currency:'usd',recurring:{interval:'year',interval_count:1}}]});if(init?.method==='POST'){const body=new URLSearchParams(String(init.body));writes.push(body);if(body.has('items[0][price]'))return Response.json({...subscription,metadata:{...subscription.metadata,funding_pending_grant:g.id,funding_pending_review:g.reviewId},pending_update:{expires_at:Math.floor(Date.now()/1000)+23*3600},latest_invoice:{hosted_invoice_url:'https://invoice.stripe.com/i/test'}});}return Response.json(subscription);};try{const result=await switchPlan(subscription.id,{tier:'creator',cycle:'year'},g);assert.equal(result.kind,'confirm');assert.equal(writes[0].get('metadata[funding_pending_grant]'),g.id);assert.equal(writes[0].has('metadata[funding_grant]'),false);assert.equal(writes[1].get('payment_behavior'),'pending_if_incomplete');}finally{globalThis.fetch=old;}});

test('funded return reuses the provider read and adopts no rights until its receipt is acknowledged',async()=>{
 const old=globalThis.fetch,created=Math.floor(Date.now()/1000);
 const session={mode:'subscription',customer:'cus_Test000001',subscription:'sub_Test000001',metadata:{store:'harbor',funding_grant:'ctr_metadata',funding_review:'test_only'}};
 const subscription={id:'sub_Test000001',customer:'cus_Test000001',created,status:'active',metadata:{...session.metadata},items:{data:[{quantity:1,current_period_start:created,current_period_end:created+30*86400,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}};
 let reads=0,writes=0;globalThis.fetch=async(input,init)=>{reads++;if(init?.method==='POST')writes++;return Response.json(new URL(String(input)).pathname.includes('/checkout/sessions/')?session:subscription);};
 activationObservations.calls.length=0;activationObservations.accept=false;
 try{
  assert.equal(await readStartedSubscription(store,'cs_test_Activation001'),null);
  assert.equal(activationObservations.calls.length,1);assert.equal(reads,2);assert.equal(writes,0);
  assert.deepEqual(activationObservations.calls[0],{statsId:store.statsId,grantId:'ctr_metadata',reviewId:'test_only',subscriptionId:'sub_Test000001',tier:'creator',cycle:'month',createdSeconds:created,trialing:false,periodStartSeconds:created,periodEndSeconds:created+30*86400});
  activationObservations.accept=true;
  const result=await readStartedSubscription(store,'cs_test_Activation001');assert.ok(result?.active);assert.equal(reads,4);assert.equal(writes,0);
 }finally{globalThis.fetch=old;activationObservations.accept=false;}
});
test('foreign ownership, currency, interval or funding references never reach activation',async()=>{
 const old=globalThis.fetch,created=Math.floor(Date.now()/1000);
 const session={mode:'subscription',customer:'cus_Test000001',subscription:'sub_Test000001',metadata:{store:'harbor',funding_grant:'ctr_metadata',funding_review:'test_only'}};
 const base={id:'sub_Test000001',customer:'cus_Test000001',created,status:'active',metadata:{...session.metadata},items:{data:[{quantity:1,current_period_start:created,current_period_end:created+30*86400,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}};
 try{
  for(const change of [{customer:'cus_Other001'},{metadata:{...session.metadata,store:'other'}},{metadata:{...session.metadata,funding_grant:'ctr_other'}},{pending_update:{expires_at:created+100}},{items:{data:[{...base.items.data[0],price:{...base.items.data[0].price,currency:'eur'}}]}},{items:{data:[{...base.items.data[0],price:{...base.items.data[0].price,recurring:{interval:'month',interval_count:2}}}]}},{items:{data:[{...base.items.data[0],price:{...base.items.data[0].price,unit_amount:1}}]}}]){
   activationObservations.calls.length=0;globalThis.fetch=async(input)=>Response.json(new URL(String(input)).pathname.includes('/checkout/sessions/')?session:{...base,...change});
   assert.equal(await readStartedSubscription(store,'cs_test_Activation001'),null);assert.equal(activationObservations.calls.length,0);
  }
 }finally{globalThis.fetch=old;}
});

test('missing session funding fields cannot downgrade a funded subscription to legacy',async()=>{
 const old=globalThis.fetch,created=Math.floor(Date.now()/1000);
 const references={funding_grant:'ctr_metadata',funding_review:'test_only'};
 const baseSession={mode:'subscription',customer:'cus_Test000001',subscription:'sub_Test000001',metadata:{store:'harbor',...references}};
 const subscription={id:'sub_Test000001',customer:'cus_Test000001',created,status:'active',metadata:{store:'harbor',...references},items:{data:[{quantity:1,current_period_start:created,current_period_end:created+30*86400,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}};
 activationObservations.accept=true;
 try{
  for(const metadata of [{store:'harbor'},{store:'harbor',funding_grant:references.funding_grant},{store:'harbor',funding_review:references.funding_review}]){
   activationObservations.calls.length=0;let reads=0,writes=0;
   globalThis.fetch=async(input,init)=>{reads++;if(init?.method==='POST')writes++;return Response.json(new URL(String(input)).pathname.includes('/checkout/sessions/')?{...baseSession,metadata}:subscription);};
   assert.equal(await readStartedSubscription(store,'cs_test_Activation001'),null);
   assert.equal(reads,2);assert.equal(writes,0);assert.equal(activationObservations.calls.length,0);
  }
 }finally{globalThis.fetch=old;activationObservations.accept=false;}
});
test('only two unmarked provider records keep the legacy return path; missing or unavailable subscriptions grant no rights',async()=>{
 const old=globalThis.fetch,created=Math.floor(Date.now()/1000);
 const session={mode:'subscription',customer:'cus_Test000001',subscription:'sub_Test000001',metadata:{store:'harbor'}};
 const subscription={id:'sub_Test000001',customer:'cus_Test000001',created,status:'active',metadata:{store:'harbor'},items:{data:[{quantity:1,current_period_start:created,current_period_end:created+30*86400,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}};
 try{
  for(const status of [200,404,503]){
   let reads=0,writes=0;activationObservations.calls.length=0;
   globalThis.fetch=async(input,init)=>{reads++;if(init?.method==='POST')writes++;if(new URL(String(input)).pathname.includes('/checkout/sessions/'))return Response.json(session);return status===200?Response.json(subscription):Response.json({error:{message:'synthetic provider failure'}},{status});};
   const result=await readStartedSubscription(store,'cs_test_Activation001');
   assert.equal(result?.active,status===200);assert.equal(reads,2);assert.equal(writes,0);assert.equal(activationObservations.calls.length,0);
  }
 }finally{globalThis.fetch=old;}
});

test('missed-return observations and subscription search cannot adopt a funded plan before receipt acknowledgement',async()=>{
 const old=globalThis.fetch,created=Math.floor(Date.now()/1000);
 const owner={...store,stripeCustomerId:'cus_Test000001',previousHandles:[],releasedHandles:[]} as Store;
 const subscription={id:'sub_Test000001',customer:{id:'cus_Test000001',email:owner.email},created,status:'active',metadata:{store:'harbor',funding_grant:'ctr_metadata',funding_review:'test_only'},items:{data:[{quantity:1,current_period_start:created,current_period_end:created+30*86400,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}};
 let reads=0,writes=0;globalThis.fetch=async(_input,init)=>{reads++;if(init?.method!=='GET')writes++;return Response.json({data:[subscription]});};
 try{
  activationObservations.calls.length=0;activationObservations.accept=false;
  assert.equal(await startedFromObservedSubscription(owner,subscription),null);assert.equal(reads,0);
  assert.equal((await findStoreSubscriptions(owner)).live,null);assert.equal(reads,1);
  activationObservations.accept=true;
  assert.equal((await startedFromObservedSubscription(owner,subscription))?.subscriptionId,subscription.id);assert.equal(reads,1);
  assert.equal((await findStoreSubscriptions(owner)).live?.subscriptionId,subscription.id);assert.equal(reads,2);assert.equal(writes,0);
  assert.equal(activationObservations.calls.length,4);
  for(const change of [{metadata:{...subscription.metadata,funding_review:undefined}},{customer:{id:'cus_Other001',email:'other@example.test'}},{pending_update:{expires_at:created+100}},{items:{data:[{...subscription.items.data[0],price:{...subscription.items.data[0].price,currency:'eur'}}]}}]){
   activationObservations.calls.length=0;
   assert.equal(await startedFromObservedSubscription(owner,{...subscription,...change}),null);
   assert.equal(activationObservations.calls.length,0);
  }
  activationObservations.calls.length=0;
  assert.ok(await startedFromObservedSubscription(owner,{...subscription,metadata:{store:'harbor'}}));
  assert.equal(activationObservations.calls.length,0);assert.equal(writes,0);
 }finally{globalThis.fetch=old;activationObservations.accept=false;}
});

test('checkout and switch grants cannot cross their reserved purpose or omit it',async()=>{
 const old=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;throw Error('must not reach provider');};
 try{
  for(const action of ['switch',undefined,'renewal']){
   await assert.rejects(createBillingCheckout(store,'https://marktmorgen.test',{tier:'creator',cycle:'year'},null,{...grant(),action} as ContractGrant));
  }
  for(const action of ['checkout',undefined,'renewal']){
   await assert.rejects(switchPlan('sub_Test000001',{tier:'creator',cycle:'year'},{...grant('switch'),action} as ContractGrant));
  }
  assert.equal(calls,0);
 }finally{globalThis.fetch=old;}
});
test('a customer recovery cannot retry a checkout after its funding submission expires',async()=>{
 const old=globalThis.fetch,oldNow=Date.now,g=grant();let clock=oldNow(),writes=0;
 Date.now=()=>clock;
 globalThis.fetch=async(input,init)=>{
  const url=new URL(String(input));
  if(url.pathname==='/v1/checkout/sessions'&&init?.method==='POST'){
   writes++;clock=(g.submitUntilSeconds+1)*1000;
   return Response.json({error:{message:'No such customer'}},{status:400});
  }
  return Response.json({error:{message:'TEST ONLY no catalog'}},{status:404});
 };
 try{
  await assert.rejects(createBillingCheckout(store,'https://marktmorgen.test',{tier:'creator',cycle:'year'},'cus_Test000001',g),/Funding grant/);
  assert.equal(writes,1);
 }finally{globalThis.fetch=old;Date.now=oldNow;}
});

test('a slow price lookup cannot write pending funding after its submission window',async()=>{
 const old=globalThis.fetch,oldNow=Date.now;
 const g:ContractGrant={...grant('switch'),key:'pro_year',reservedCents:1_000_000};
 let clock=oldNow(),writes=0,priceReads=0;Date.now=()=>clock;
 globalThis.fetch=async(input,init)=>{
  const url=new URL(String(input));
  if(init?.method==='POST'){writes++;throw Error('must not write');}
  if(url.pathname==='/v1/prices'){
   priceReads++;clock=(g.submitUntilSeconds+1)*1000;
   return Response.json({data:[{id:'price_pro_year_purpose',unit_amount:449000,currency:'usd',recurring:{interval:'year',interval_count:1}}]});
  }
  return Response.json({id:'sub_Test000001',status:'active',items:{data:[{...sourcePeriod(),id:'si_test',quantity:1,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}});
 };
 try{
  await assert.rejects(switchPlan('sub_Test000001',{tier:'pro',cycle:'year'},g),/Funding grant/);
  assert.equal(priceReads,1);assert.equal(writes,0);
 }finally{globalThis.fetch=old;Date.now=oldNow;}
});

test('a switch grant for another or missing source subscription makes no provider request',async()=>{
 const old=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('must not reach provider');};
 try{
  for(const sourceSubscriptionId of [null,undefined,'sub_Other0001']){
   await assert.rejects(switchPlan('sub_Test000001',{tier:'creator',cycle:'year'},{...grant('switch'),sourceSubscriptionId} as ContractGrant));
  }
  assert.equal(calls,0);
 }finally{globalThis.fetch=old;}
});

function switchObservation(g:ContractGrant){
 const created=Math.floor(Date.now()/1000)-86400,now=Math.floor(Date.now()/1000);
 return{id:'sub_Test000001',created,customer:'cus_Test000001',status:'active',metadata:{store:'harbor',funding_grant:'ctr_source',funding_review:g.reviewId,funding_pending_grant:g.id,funding_pending_review:g.reviewId},items:{data:[{id:'si_test',quantity:1,current_period_start:now,current_period_end:now+365*86400,price:{lookup_key:'nimbus_creator_year',unit_amount:69000,currency:'usd',recurring:{interval:'year',interval_count:1}}}]}};
}
test('a paid switch cannot report new rights until its durable funding activation is acknowledged',async()=>{
 const old=globalThis.fetch,g=grant('switch'),updated=switchObservation(g),writes:URLSearchParams[]=[];
 globalThis.fetch=async(input,init)=>{
  const url=new URL(String(input));
  if(url.pathname==='/v1/prices')return Response.json({data:[{id:'price_year',unit_amount:69000,currency:'usd',recurring:{interval:'year',interval_count:1}}]});
  if(init?.method==='POST'){const body=new URLSearchParams(String(init.body));writes.push(body);return Response.json(updated);}
  return Response.json({...updated,metadata:{store:'harbor',funding_grant:'ctr_source'},items:{data:[{...sourcePeriod(),id:'si_test',quantity:1,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}});
 };
 switchActivationObservations.calls.length=0;switchActivationObservations.accept=false;
 try{
  await assert.rejects(switchPlan('sub_Test000001',{tier:'creator',cycle:'year'},g),/activation was not acknowledged/);
  assert.equal(writes.length,2);assert.equal(switchActivationObservations.calls.length,1);
  assert.equal(writes.some(v=>v.has('metadata[funding_action]')),false);
  switchActivationObservations.accept=true;writes.length=0;
  const result=await switchPlan('sub_Test000001',{tier:'creator',cycle:'year'},g);
  assert.equal(result.kind,'switched');assert.equal(writes.length,3);assert.equal(writes[2].get('metadata[funding_action]'),'switch');
  assert.equal(switchActivationObservations.calls[0].createdSeconds,updated.created);
 }finally{globalThis.fetch=old;switchActivationObservations.accept=false;}
});
test('switch recovery uses pending or finalized references without treating either as a fresh Checkout',async()=>{
 const g=grant('switch'),raw=switchObservation(g),own={...store,stripeCustomerId:'cus_Test000001',previousHandles:[],releasedHandles:[]} as Store;
 activationObservations.calls.length=0;switchActivationObservations.calls.length=0;switchActivationObservations.accept=false;
 assert.equal(await startedFromObservedSubscription(own,raw),null);
 switchActivationObservations.accept=true;
 try{
  assert.equal((await startedFromObservedSubscription(own,raw))?.cycle,'year');
  const final={...raw,metadata:{store:'harbor',funding_action:'switch',funding_grant:g.id,funding_review:g.reviewId}};
  assert.equal((await startedFromObservedSubscription(own,final))?.cycle,'year');
  assert.equal(await startedFromObservedSubscription(own,{...raw,pending_update:{expires_at:9999999999}}),null);
  assert.equal(await startedFromObservedSubscription(own,{...raw,metadata:{...raw.metadata,funding_pending_review:undefined}}),null);
  assert.equal(activationObservations.calls.length,0);
 }finally{switchActivationObservations.accept=false;}
});

test('a switch read stays unknown without its store and acknowledged phase proof',async()=>{
 const old=globalThis.fetch,g=grant('switch'),raw=switchObservation(g),own={...store,stripeCustomerId:'cus_Test000001',subscriptionId:raw.id,previousHandles:[],releasedHandles:[]} as Store;let reads=0;
 globalThis.fetch=async()=>{reads++;return Response.json(raw);};switchActivationObservations.calls.length=0;switchActivationObservations.accept=false;
 try{
  assert.equal((await readSubscription(raw.id)).state,'unknown');assert.equal(switchActivationObservations.calls.length,0);
  assert.equal((await readSubscription(raw.id,own)).state,'unknown');
  switchActivationObservations.accept=true;assert.equal((await readSubscription(raw.id,own)).state,'active');
  assert.equal(reads,3);assert.equal(switchActivationObservations.calls.length,2);
 }finally{globalThis.fetch=old;switchActivationObservations.accept=false;}
});

test('a foreign or malformed switch result cannot finalize metadata or request activation',async()=>{
 const old=globalThis.fetch,g=grant('switch'),base=switchObservation(g);
 const cases=[
  {...base,id:'sub_Other0001'},
  {...base,metadata:{...base.metadata,funding_pending_review:'other'}},
  {...base,items:{data:[{...base.items.data[0],price:{...base.items.data[0].price,currency:'eur'}}]}},
  {...base,items:{data:[{...base.items.data[0],price:{...base.items.data[0].price,recurring:{interval:'year',interval_count:2}}}]}},
 ];
 switchActivationObservations.accept=true;
 try{
  for(const updated of cases){
   const writes:URLSearchParams[]=[];switchActivationObservations.calls.length=0;
   globalThis.fetch=async(input,init)=>{
    const url=new URL(String(input));
    if(url.pathname==='/v1/prices')return Response.json({data:[{id:'price_year',unit_amount:69000,currency:'usd',recurring:{interval:'year',interval_count:1}}]});
    if(init?.method==='POST'){writes.push(new URLSearchParams(String(init.body)));return Response.json(updated);}
    return Response.json({...base,items:{data:[{...sourcePeriod(),id:'si_test',quantity:1,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}});
   };
   await assert.rejects(switchPlan('sub_Test000001',{tier:'creator',cycle:'year'},g));
   assert.equal(writes.length,2);assert.equal(switchActivationObservations.calls.length,0);assert.equal(writes.some(v=>v.has('metadata[funding_action]')),false);
  }
 }finally{globalThis.fetch=old;switchActivationObservations.accept=false;}
});

test('a marked checkout read requires its store and exact current funded phase proof too',async()=>{
 const old=globalThis.fetch,created=Math.floor(Date.now()/1000),own={...store,stripeCustomerId:'cus_Test000001',previousHandles:[],releasedHandles:[]} as Store;
 const raw={id:'sub_Test000001',customer:'cus_Test000001',created,status:'active',metadata:{store:'harbor',funding_grant:'ctr_metadata',funding_review:'test_only'},items:{data:[{quantity:1,current_period_start:created,current_period_end:created+30*86400,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}};
 let reads=0;globalThis.fetch=async()=>{reads++;return Response.json(raw);};activationObservations.calls.length=0;activationObservations.accept=false;
 try{
  assert.equal((await readSubscription(raw.id)).state,'unknown');assert.equal(activationObservations.calls.length,0);
  assert.equal((await readSubscription(raw.id,own)).state,'unknown');
  activationObservations.accept=true;assert.equal((await readSubscription(raw.id,own)).state,'active');
  assert.equal(reads,3);assert.equal(activationObservations.calls.length,2);
  assert.equal(activationObservations.calls[1].periodEndSeconds,created+30*86400);
 }finally{globalThis.fetch=old;activationObservations.accept=false;}
});

test('only acknowledged observations mark a paid allowance period as funded',async()=>{
 const g=grant('switch'),raw=switchObservation(g),own={...store,stripeCustomerId:'cus_Test000001',previousHandles:[],releasedHandles:[]} as Store;
 switchActivationObservations.accept=false;
 assert.equal(await startedFromObservedSubscription(own,raw),null);
 switchActivationObservations.accept=true;
 try{
  const observed=await startedFromObservedSubscription(own,raw);assert.equal(observed?.period?.funded,true);assert.equal(observed?.period?.renews,true);
  const legacy={...raw,metadata:{store:'harbor'}};
  const old=await startedFromObservedSubscription(own,legacy);assert.ok(old);assert.equal(old.period?.funded,undefined);
 }finally{switchActivationObservations.accept=false;}
});

test('checkout and plan-switch grants cannot reach a provider before their issuing second',async(t)=>{
 t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-10T12:00:00Z')});
 const checkout=grant(),change=grant('switch'),old=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;throw Error('a future-issued grant must not reach the provider');};
 try{
  t.mock.timers.setTime(Date.now()-1000);
  await assert.rejects(createBillingCheckout(store,'https://marktmorgen.test',{tier:'creator',cycle:'year'},null,checkout),/Funding grant/);
  await assert.rejects(switchPlan('sub_Test000001',{tier:'creator',cycle:'year'},change),/Funding grant/);
  assert.equal(calls,0);
 }finally{globalThis.fetch=old;}
});


test('funded return, missed return and switch reject unknown or multiple units before activation',async()=>{
 const old=globalThis.fetch,created=Math.floor(Date.now()/1000);
 const session={mode:'subscription',customer:'cus_Test000001',subscription:'sub_Test000001',metadata:{store:'harbor',funding_grant:'ctr_metadata',funding_review:'test_only'}};
 const own={...store,stripeCustomerId:'cus_Test000001',previousHandles:[],releasedHandles:[]} as Store;
 const raw={id:'sub_Test000001',customer:'cus_Test000001',created,status:'active',metadata:{...session.metadata},items:{data:[{quantity:1,current_period_start:created,current_period_end:created+30*86400,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}};
 activationObservations.accept=true;switchActivationObservations.accept=true;
 try{
  for(const quantity of [undefined,0,2,'1']){
   const invalid={...raw,items:{data:[{...raw.items.data[0],quantity}]}};
   activationObservations.calls.length=0;switchActivationObservations.calls.length=0;
   let reads=0;
   globalThis.fetch=async(input,init)=>{assert.notEqual(init?.method,'POST');reads++;return Response.json(new URL(String(input)).pathname.includes('/checkout/sessions/')?session:invalid);};
   assert.equal(await readStartedSubscription(own,'cs_test_Activation001'),null);
   assert.equal(reads,2);assert.equal(activationObservations.calls.length,0);
   assert.equal(await startedFromObservedSubscription(own,invalid),null);assert.equal(reads,2);
   const switched=switchObservation(grant('switch'));
   assert.equal(await startedFromObservedSubscription(own,{...switched,items:{data:[{...switched.items.data[0],quantity}]}}),null);
   assert.equal(activationObservations.calls.length,0);assert.equal(switchActivationObservations.calls.length,0);
  }
 }finally{globalThis.fetch=old;activationObservations.accept=false;switchActivationObservations.accept=false;}
});


test('an uncertain source unit cannot reach any funded switch write or price lookup',async()=>{
 const old=globalThis.fetch,g=grant('switch');
 try{
  for(const shape of ['missing','double','extra','other-id']){
   const item:{id:string;quantity?:number;price:Record<string,unknown>}={...sourcePeriod(),id:'si_test',quantity:1,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}};
   if(shape==='missing')delete item.quantity;
   if(shape==='double')item.quantity=2;
   const raw={id:shape==='other-id'?'sub_Other0001':'sub_Test000001',status:'active',items:{data:shape==='extra'?[item,{...item}]:[item]}};
   let reads=0,writes=0;
   globalThis.fetch=async(input,init)=>{if((init?.method??'GET')!=='GET'){writes++;throw Error('must not write');}reads++;assert.equal(new URL(String(input)).pathname,'/v1/subscriptions/sub_Test000001');return Response.json(raw);};
   await assert.rejects(switchPlan('sub_Test000001',{tier:'creator',cycle:'year'},g),/exactly one plan unit/);
   assert.equal(reads,1);assert.equal(writes,0);
  }
 }finally{globalThis.fetch=old;}
});


test('a different funded source price interval cannot start any provider mutation',async()=>{
 const old=globalThis.fetch,g=grant('switch');
 const price={lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}};
 try{
  for(const invalid of [{...price,currency:'eur'},{...price,unit_amount:1},{...price,recurring:{interval:'month',interval_count:2}}]){
   let reads=0,writes=0;
   globalThis.fetch=async(input,init)=>{if((init?.method??'GET')!=='GET'){writes++;throw Error('must not write');}reads++;assert.equal(new URL(String(input)).pathname,'/v1/subscriptions/sub_Test000001');return Response.json({id:'sub_Test000001',status:'active',items:{data:[{...sourcePeriod(),id:'si_test',quantity:1,price:invalid}]}});};
   await assert.rejects(switchPlan('sub_Test000001',{tier:'creator',cycle:'year'},g),/source price/);
   assert.equal(reads,1);assert.equal(writes,0);
  }
 }finally{globalThis.fetch=old;}
});


test('a funded switch source phase must contain both reservation and observation',async()=>{
 const old=globalThis.fetch,oldNow=Date.now;
 const clock=Math.floor(oldNow()/1000)*1000;Date.now=()=>clock;
 const now=clock/1000,g=grant('switch');
 const price={lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}};
 try{
  for(const phase of [
   {},{current_period_start:now-86400,current_period_end:now},
   {current_period_start:now+1,current_period_end:now+30*86400},
   {current_period_start:now-0.5,current_period_end:now+30*86400},
   {current_period_start:now-86400,current_period_end:now+30*86400+0.5},
   {current_period_start:now-86400,current_period_end:now-86400},
  ]){
   let reads=0,writes=0;
   globalThis.fetch=async(input,init)=>{if((init?.method??'GET')!=='GET'){writes++;throw Error('must not write');}reads++;assert.equal(new URL(String(input)).pathname,'/v1/subscriptions/sub_Test000001');return Response.json({id:'sub_Test000001',status:'active',items:{data:[{id:'si_test',quantity:1,price,...phase}]}});};
   await assert.rejects(switchPlan('sub_Test000001',{tier:'creator',cycle:'year'},g),/source phase/);
   assert.equal(reads,1);assert.equal(writes,0);
  }
 }finally{globalThis.fetch=old;Date.now=oldNow;}
});


test('source phase is checked again after price, metadata and stale-price waits',async()=>{
 const old=globalThis.fetch,oldNow=Date.now,initial=Math.floor(Date.now()/1000);
 try{
  for(const stage of ['price','metadata','fallback']){
   let clock=initial*1000;Date.now=()=>clock;
   const g=grant('switch'),end=initial+30;
   const choice=stage==='price'?{tier:'scale' as const,cycle:'month' as const}:stage==='metadata'?{tier:'pro' as const,cycle:'month' as const}:{tier:'scale' as const,cycle:'year' as const};
   let sourceReads=0,priceReads=0,metadataWrites=0,changeWrites=0;
   const raw={id:'sub_Test000001',status:'active',items:{data:[{id:'si_test',quantity:1,current_period_start:initial-86400,current_period_end:end,price:{lookup_key:'nimbus_creator_month',unit_amount:6900,currency:'usd',recurring:{interval:'month',interval_count:1}}}]}};
   globalThis.fetch=async(input,init)=>{
    const url=new URL(String(input));
    if((init?.method??'GET')==='GET'&&url.pathname==='/v1/subscriptions/sub_Test000001'){sourceReads++;return Response.json(raw);}
    if((init?.method??'GET')==='GET'&&url.pathname==='/v1/prices'){
     priceReads++;if(stage==='price')clock=end*1000;
     return Response.json({data:[{id:'price_source_wait_'+stage,unit_amount:PUBLISHED_PLAN_PRICES[choice.tier][choice.cycle],currency:'usd',recurring:{interval:choice.cycle,interval_count:1}}]});
    }
    if(init?.method==='POST'){
     const body=new URLSearchParams(String(init.body));
     if(body.has('items[0][price]')){
      changeWrites++;assert.equal(stage,'fallback');clock=end*1000;
      return Response.json({error:{message:'No such price',code:'resource_missing'}},{status:400});
     }
     metadataWrites++;assert.ok(body.has('metadata[funding_pending_grant]'));
     if(stage==='metadata')clock=end*1000;
     return Response.json(raw);
    }
    throw Error('unexpected operation');
   };
   await assert.rejects(switchPlan(raw.id,choice,{...g,key:choice.tier+'_'+choice.cycle,reservedCents:2_000_000} as ContractGrant),/source phase/);
   assert.equal(sourceReads,1);assert.equal(priceReads,1);
   assert.equal(metadataWrites,stage==='price'?0:1);assert.equal(changeWrites,stage==='fallback'?1:0);
  }
 }finally{globalThis.fetch=old;Date.now=oldNow;}
});
