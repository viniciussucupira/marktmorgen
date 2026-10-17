import test from 'node:test';
import assert from 'node:assert/strict';
import { askModel } from '../lib/ai';
import { aiSpendPolicySnapshot } from '../lib/ai-spend-policy';
import { CURRENT_AI_SPEND_POLICY as fundedPolicy } from './ai-spend-approved-policy';
import type { Store } from '@/lib/store';
import { reset, seed, ledger, settings } from './ai-spend-redis';
const key='nl:ai-spend:v1:'+new Date().toISOString().slice(0,7);
const store={statsId:'one',tier:'creator',createdAt:1} as unknown as Store;
function start(){reset();seed(key,'test_review',aiSpendPolicySnapshot(fundedPolicy));process.env.ANTHROPIC_API_KEY='sk-ant-'+ 'x'.repeat(30);}
test('real provider path blocks an unfunded ledger before fetch',async()=>{start();ledger.clear();let calls=0;const old=globalThis.fetch;globalThis.fetch=async()=>{calls++;throw Error('must not call');};try{assert.equal(await askModel(store,'system','prompt',100,'claude-sonnet-5-5'),null);assert.equal(calls,0);}finally{globalThis.fetch=old;}});
test('failed paid requests and retries retain separate reservations',async()=>{start();let calls=0;const old=globalThis.fetch;globalThis.fetch=async()=>{calls++;return new Response('busy',{status:503});};try{for(let i=0;i<6;i++)assert.equal(await askModel(store,'system','prompt',100,'claude-sonnet-5-5'),null);assert.equal(calls,3);assert.equal(ledger.get(key)?.get('store:one'),'300');assert.equal(ledger.get(key)?.get('company'),'300');}finally{globalThis.fetch=old;}});
test('network failure keeps its ceiling reserved',async()=>{start();const old=globalThis.fetch;globalThis.fetch=async()=>{throw Error('lost response');};try{await assert.rejects(askModel(store,'system','prompt',100,'claude-sonnet-5-5'));assert.equal(ledger.get(key)?.get('company'),'100');}finally{globalThis.fetch=old;}});
test('invalid requests consume no money and make no provider call',async()=>{start();let calls=0;const old=globalThis.fetch;globalThis.fetch=async()=>{calls++;throw Error('must not call');};try{assert.equal(await askModel(store,'system','prompt',6001,'claude-sonnet-5-5'),null);assert.equal(await askModel(store,'system','prompt',100,'claude-unknown'),null);assert.equal(ledger.get(key)?.get('company'),'0');assert.equal(calls,0);}finally{globalThis.fetch=old;}});
test('successful requests also retain the reviewed maximum',async()=>{start();let calls=0;const old=globalThis.fetch;globalThis.fetch=async()=>{calls++;return Response.json({content:[{type:'text',text:'A draft'}],usage:{input_tokens:1,output_tokens:1}});};try{assert.equal(await askModel(store,'system','prompt',100,'claude-sonnet-5-5'),'A draft');assert.equal(ledger.get(key)?.get('company'),'100');settings({failure:true});assert.equal(await askModel(store,'system','prompt',100,'claude-sonnet-5-5'),null);assert.equal(calls,1);}finally{globalThis.fetch=old;}});
