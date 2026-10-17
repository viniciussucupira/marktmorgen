import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Pricing } from '@/components/home-parts';
import { PAID_STORAGE_BYTES, STORAGE_BRAKE_BYTES, paidStorageBytes, storageBrakeFor } from '@/lib/storage-rules';
import { SETUP_STORAGE_BYTES, TRIAL_STORAGE_BYTES } from '@/lib/plan-standing';
import { fits, maximumUploadBytes, type StorageUse } from '@/lib/storage-quota';
const GiB=1024**3;
const held=(bytes:number,brake:number):StorageUse=>({bytes,brake,left:Math.max(0,brake-bytes),full:bytes>=brake,available:true});
test('all three paid tiers have explicit smaller immutable storage ceilings',()=>{
 assert.deepEqual(PAID_STORAGE_BYTES,{creator:8*GiB,pro:64*GiB,scale:128*GiB});
 assert.equal(STORAGE_BRAKE_BYTES,PAID_STORAGE_BYTES.creator);assert.equal(Object.isFrozen(PAID_STORAGE_BYTES),true);
 for(const tier of ['creator','pro','scale'] as const){assert.equal(storageBrakeFor('paid',tier),PAID_STORAGE_BYTES[tier]);assert.equal(paidStorageBytes(tier),PAID_STORAGE_BYTES[tier]);assert.ok(PAID_STORAGE_BYTES[tier]<200*GiB);}
});
test('no trial has more storage than its selected paid tier',()=>{
 for(const tier of ['creator','pro','scale'] as const)assert.equal(storageBrakeFor('trial',tier),Math.min(TRIAL_STORAGE_BYTES,PAID_STORAGE_BYTES[tier]));
 assert.equal(storageBrakeFor('trial','creator'),8*GiB);assert.equal(storageBrakeFor('trial','pro'),50*GiB);assert.equal(storageBrakeFor('trial','scale'),50*GiB);
 assert.equal(storageBrakeFor('none','scale'),SETUP_STORAGE_BYTES);assert.equal(storageBrakeFor('ended','scale'),SETUP_STORAGE_BYTES);
});
test('every tier can fill its exact remaining bytes but not authorize one byte beyond',()=>{
 for(const tier of ['creator','pro','scale'] as const)for(const standing of ['paid','trial','none','ended'] as const){const cap=storageBrakeFor(standing,tier),row=held(cap-1,cap);assert.equal(fits(row,1),true);assert.equal(fits(row,2),false);assert.equal(maximumUploadBytes(row,5*GiB),1);assert.equal(fits(held(cap,cap),1),false);}
});
test('a downgrade blocks new uploads while retaining the recorded existing content',()=>{
 const bytes=16*GiB,row=held(bytes,storageBrakeFor('paid','creator'));assert.equal(fits(row,1),false);assert.equal(maximumUploadBytes(row,5*GiB),0);assert.equal(row.bytes,bytes);assert.equal(row.left,0);assert.equal(fits(held(bytes,storageBrakeFor('paid','pro')),1),true);
});
test('actual pricing rendering discloses each tier storage threshold',()=>{
 const text=renderToStaticMarkup(createElement(Pricing)).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
 for(const gb of [8,64,128])assert.ok(text.includes('Up to '+gb+' GB of stored files and videos.'),text.slice(-3000));
 assert.match(text,/free trial never has more storage than its chosen plan/);assert.doesNotMatch(text,/Up to 200 GB of stored files/);
});

test('inherited and unknown tier names receive the smallest paid storage cap',()=>{
 for(const tier of ['__proto__','constructor','unknown'])assert.equal(paidStorageBytes(tier as Parameters<typeof paidStorageBytes>[0]),PAID_STORAGE_BYTES.creator);
});
