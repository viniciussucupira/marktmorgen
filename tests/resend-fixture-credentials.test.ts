/** Real guard and synthetic provider answers; no environment credential may
 * become a synthetic reviewed account merely by being present. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {currentResendFallbackProofIsMissing,guardedResendPost,prepareResendFallbackFixture} from './resend-fallback-fixture';
import {currentResendFallbackProofIsMissing as browserMissing,guardedResendPost as browserPost} from './e2e/reviewed-resend-transport';
import {store} from './redis-stub';
const known='re_test_fixture1',unknown='re_unrecognized_test_probe_only';
const input=(credential:string)=>({base:'https://api.resend.com',path:'/emails' as const,credential,usageCredential:credential,body:JSON.stringify({from:'owner@example.test',to:['buyer@example.test'],subject:'Synthetic',text:'No real message'}),recipients:1});
test('unrecognized environment credentials never issue a synthetic proof or POST',async()=>{
 const previous=process.env.RESEND_API_KEY,read=process.env.RESEND_READ_API_KEY,fetcher=globalThis.fetch;let posts=0;
 try{store.clear();process.env.RESEND_API_KEY=unknown;delete process.env.RESEND_READ_API_KEY;
  globalThis.fetch=async()=>{posts++;return Response.json({id:'synthetic'});};
  assert.equal(currentResendFallbackProofIsMissing(),true);
  assert.equal((await guardedResendPost(input(unknown))).kind,'blocked');assert.equal(posts,0);
  assert.equal(browserMissing(),true);assert.equal((await browserPost(input(unknown))).kind,'blocked');assert.equal(posts,0);
 }finally{globalThis.fetch=fetcher;if(previous===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=previous;if(read===undefined)delete process.env.RESEND_READ_API_KEY;else process.env.RESEND_READ_API_KEY=read;store.clear();}
});
test('explicit fixture constructors reject unknown credentials before initialization',async()=>{
 let posts=0;assert.throws(()=>prepareResendFallbackFixture({credential:unknown,fetch:async()=>{posts++;return Response.json({id:'synthetic'});}}),/synthetic fixture credential/);assert.equal(posts,0);
});
test('recognized literals still use the real guard and finite inbound-inclusive budget',async()=>{
 let posts=0;const fixture=prepareResendFallbackFixture({credential:known,cap:2,received:1,fetch:async()=>{posts++;return Response.json({id:'synthetic'});}});await fixture.ready;
 assert.equal((await guardedResendPost(input(known),fixture.runtime)).kind,'response');
 assert.equal((await guardedResendPost({...input(known),body:input(known).body+' '},fixture.runtime)).kind,'blocked');
 assert.equal(posts,1);assert.equal(fixture.usage().monthly.used,2);
});
