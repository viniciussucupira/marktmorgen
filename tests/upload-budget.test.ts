import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reserveStoreUpload, reserveUploadControl, uploadScopeFor, type UploadStore } from '../lib/upload-budget';
import { isUploadBudgetConfigured, uploadAllowanceWords, UPLOAD_BUDGET_SCOPES, uploadBudgetSnapshot } from '../lib/upload-budget-policy';
import { uploadTestPolicy } from './upload-budget-approved-policy';
import { calls, reset, seed, hashes, settings } from './upload-budget-redis';
const id=(n:number)=>n.toString(16).padStart(32,'0');
const store=(n=1,scope='creator'):UploadStore=>({statsId:id(n),tier:scope==='pro'?'pro':scope==='scale'?'scale':'creator',subscriptionActive:!['setup','ended'].includes(scope),subscriptionId:scope==='setup'?null:'sub_test123',trialEnds:scope==='trial'?Date.now()/1000+600:0,planEndedAt:scope==='ended'?'2026-01-01':''});

test('unknown funding policy and missing ledgers never authorize a provider upload',async()=>{
 reset();assert.equal(await reserveStoreUpload(store(),1,'r2'),false);assert.equal(calls.length,0);
 assert.equal(await reserveStoreUpload(store(),1,'r2',uploadTestPolicy()),false);
});
test('policy covers every allocated store at every maximum, not an average',()=>{
 const p=uploadTestPolicy();assert.equal(isUploadBudgetConfigured(p),true);
 for(const key of ['opens','authorizedBytes','controlRequests'] as const){const bad=structuredClone(p);bad.company[key]--;assert.equal(isUploadBudgetConfigured(bad),false);}
 const huge=uploadTestPolicy();huge.fundedStores.creator=1e12;assert.equal(isUploadBudgetConfigured(huge),false);
});
test('impossible file-volume and signing allowances are rejected',()=>{
 for(const mutate of [(p:ReturnType<typeof uploadTestPolicy>)=>p.perStore.creator.authorizedBytes=1,(p:ReturnType<typeof uploadTestPolicy>)=>p.perStore.creator.authorizedBytes=1e12,(p:ReturnType<typeof uploadTestPolicy>)=>p.perStore.creator.controlRequests=1]){const p=uploadTestPolicy();mutate(p);assert.equal(isUploadBudgetConfigured(p),false);}
});
test('invalid numbers, dates and evidence fail closed',()=>{
 for(const value of [-1,0.5,NaN,Infinity,Number.MAX_SAFE_INTEGER]){const p=uploadTestPolicy();p.perStore.creator.opens=value;assert.equal(isUploadBudgetConfigured(p),false);}
 const old=uploadTestPolicy();old.month='2000-01';assert.equal(isUploadBudgetConfigured(old),false);
 const empty=uploadTestPolicy();empty.evidence=' ';assert.equal(isUploadBudgetConfigured(empty),false);
 assert.equal(isUploadBudgetConfigured(uploadTestPolicy(),new Date(NaN)),false);
});
test('concurrent opens share a store allowance across all grants',async()=>{
 reset();const p=uploadTestPolicy(),row=seed(p);const results=await Promise.all(Array.from({length:20},()=>reserveStoreUpload(store(),4,'r2',p)));
 assert.equal(results.filter(Boolean).length,2);assert.equal(row.get('store:'+id(1)+':bytes'),'8');assert.equal(row.get('store:'+id(1)+':opens'),'2');
});
test('every allocated store can use all byte, opening and link-request rights simultaneously',async()=>{
 reset();const p=uploadTestPolicy(),row=seed(p);
 for(const [n,scope] of UPLOAD_BUDGET_SCOPES.entries()){const s=store(n+1,scope);assert.equal(await reserveStoreUpload(s,5,'r2',p),true);assert.equal(await reserveStoreUpload(s,5,'r2',p),true);for(let i=0;i<4;i++)assert.equal(await reserveUploadControl(s,p),true);assert.equal(await reserveUploadControl(s,p),false);}
 assert.equal(row.get('company:opens'),String(p.company.opens));assert.equal(row.get('company:bytes'),String(p.company.authorizedBytes));assert.equal(row.get('company:controls'),String(p.company.controlRequests));
});
test('exhausted allocation slots cannot promise a second store the same capacity',async()=>{
 reset();const p=uploadTestPolicy();seed(p);assert.equal(await reserveStoreUpload(store(1),1,'r2',p),true);assert.equal(await reserveStoreUpload(store(2),1,'r2',p),false);assert.equal(await reserveStoreUpload(store(1),1,'r2',p),true);
});
test('changing tiers cannot reset prior counters or consume another plan allocation',async()=>{
 reset();const p=uploadTestPolicy(),row=seed(p);await reserveStoreUpload(store(),4,'r2',p);
 assert.equal(await reserveStoreUpload(store(1,'pro'),1,'r2',p),false);assert.equal(row.get('slots:pro'),'1');assert.equal(row.get('store:'+id(1)+':bytes'),'4');
});
test('an existing session can claim a funded control allocation after a month boundary',async()=>{
 reset();const p=uploadTestPolicy(),row=seed(p);assert.equal(await reserveUploadControl(store(),p),true);assert.equal(row.get('store:'+id(1)+':opens'),'0');assert.equal(row.get('store:'+id(1)+':bytes'),'0');
});
test('missing, corrupt, expiring and wrong-type ledger state denies admission',async()=>{
 for(const flag of ['expiring','wrongType','failing','available'] as const){reset();const p=uploadTestPolicy();seed(p);settings({[flag]:flag==='available'?false:true});assert.equal(await reserveStoreUpload(store(),1,'r2',p),false);}
 for(const value of ['', '-1','01','1.5','not-a-number']){reset();const p=uploadTestPolicy(),row=seed(p);row.set('company:bytes',value);assert.equal(await reserveStoreUpload(store(),1,'r2',p),false);}
 reset();const p=uploadTestPolicy(),row=seed(p);row.set('store:'+id(1)+':bytes','0');assert.equal(await reserveStoreUpload(store(),1,'r2',p),false);
});
test('ambiguous acknowledgements cannot authorize an upload',async()=>{
 for(const reply of [[],[true],['1'],[1,1]]){reset();const p=uploadTestPolicy();seed(p);settings({reply});assert.equal(await reserveStoreUpload(store(),1,'r2',p),false);}
});
test('a lost acknowledgement retains the reservation instead of refunding it',async()=>{
 reset();const p=uploadTestPolicy(),row=seed(p);settings({lostAck:true});assert.equal(await reserveStoreUpload(store(),6,'r2',p),false);settings({lostAck:false});assert.equal(await reserveStoreUpload(store(),5,'r2',p),false);assert.equal(await reserveStoreUpload(store(),4,'r2',p),true);assert.equal(row.get('store:'+id(1)+':bytes'),'10');
});
test('changing a reviewed limit invalidates the existing ledger binding',async()=>{
 reset();const p=uploadTestPolicy();seed(p);const changed=structuredClone(p);changed.evidence+=' Changed';assert.notEqual(uploadBudgetSnapshot(p),uploadBudgetSnapshot(changed));assert.equal(await reserveStoreUpload(store(),1,'r2',changed),false);
});
test('unproven direct Blob and Bunny grants remain unavailable',async()=>{
 reset();const p=uploadTestPolicy();seed(p);for(const backend of ['blob','stream'] as const)assert.equal(await reserveStoreUpload(store(),1,backend,p),false);assert.equal(calls.length,0);
});
test('invalid identifiers and byte counts cannot reach Redis',async()=>{
 reset();const p=uploadTestPolicy();seed(p);for(const bytes of [0,-1,0.5,NaN,Infinity,1e12+1])assert.equal(await reserveStoreUpload(store(),bytes,'r2',p),false);assert.equal(await reserveStoreUpload({...store(),statsId:'bad:id'},1,'r2',p),false);assert.equal(await reserveStoreUpload({...store(),statsId:null},1,'r2',p),false);assert.equal(calls.length,0);
});
test('public wording is honest when paused and uses the reviewed numerical ceilings',()=>{
 assert.match(uploadAllowanceWords('creator',null),/paused/);const words=uploadAllowanceWords('creator',uploadTestPolicy());assert.match(words,/2 upload starts/);assert.match(words,/10 bytes/);assert.match(words,/6 requests/);
});
