import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { trafficForAdmission, isResting } from '@/lib/traffic';
import { visitLimitFor, VISITS_INCLUDED } from '@/lib/traffic-rules';
import { videoLimitFor } from '@/lib/plan-standing';
import { paidVideoSeconds } from '@/lib/video-admission-rules';
import { world } from './traffic-admission-world';
const folder = 'a'.repeat(32);
const paid = {subscriptionActive:true,subscriptionId:'sub_test',trialEnds:0,planEndedAt:'',tier:'creator' as const};
const store = paid as Parameters<typeof isResting>[0];
beforeEach(()=>Object.assign(world,{configured:true,throws:false,results:[[null,null]],reads:0,folder}));
test('all paid tiers have finite thresholds, independent of monthly/yearly billing',()=>{
 for(const tier of ['creator','pro','scale'] as const)for(const cycle of ['month','year']){
 const customer={...paid,tier,cycle};
 assert.equal(visitLimitFor(customer),VISITS_INCLUDED[tier]);
 assert.equal(videoLimitFor(customer),paidVideoSeconds(tier));
 }
 assert.equal(visitLimitFor({...paid,tier:undefined}),VISITS_INCLUDED.creator);
});
test('inherited and unknown tiers cannot bypass the smallest paid threshold',async()=>{
 for(const tier of ['__proto__','constructor','unknown']){
  const customer={...paid,tier:tier as typeof paid.tier};
  assert.equal(visitLimitFor(customer),VISITS_INCLUDED.creator);
  world.results=[[String(VISITS_INCLUDED.creator),null]];
  assert.equal(await isResting(customer as Parameters<typeof isResting>[0]),true);
 }
});
test('acknowledged unused month and exact integer counters are readable',async()=>{
 assert.deepEqual(await trafficForAdmission(folder),{people:0,parts:0,visits:0});
 world.results=[['2998','199']];
 assert.deepEqual(await trafficForAdmission(folder),{people:2998,parts:199,visits:2999});
 assert.equal(await isResting(store),false);
 world.results=[['2998','200']];
 assert.equal(await isResting(store),true);
});
test('paid pages pause at the threshold and remain paused above it',async()=>{
 for(const n of [VISITS_INCLUDED.creator,VISITS_INCLUDED.creator+1,5000000]){world.results=[[String(n),null]];assert.equal(await isResting(store),true);}
});
test('missing acknowledgements, malformed rows and corrupt counters never authorize',async()=>{
 for(const results of [[],[null],[[0]],[[0,0,0]],[[false,0]],[[{},0]],[['',0]],[['01',0]],[['1.5',0]],[['-1',0]],[[NaN,0]],[[Infinity,0]],[[Number.MAX_SAFE_INTEGER,100]]]){
 world.results=results;assert.equal(await trafficForAdmission(folder),null);assert.equal(await isResting(store),true);
 }
});
test('unavailable ledger and provider exceptions pause admission',async()=>{
 world.configured=false;assert.equal(await isResting(store),true);assert.equal(world.reads,0);
 world.configured=true;world.throws=true;assert.equal(await isResting(store),true);
});
test('invalid folder, month or request clock cannot authorize',async()=>{
 for(const month of ['2026-00','2026-13','2026-1','oops'])assert.equal(await trafficForAdmission(folder,month),null);
 world.folder='invalid';assert.equal(await isResting(store),true);
 world.folder=folder;assert.equal(await isResting(store,NaN),true);
});
