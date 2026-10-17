import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyCampaignLink, type CampaignLinkField } from '../lib/campaign-copy';

const link='https://shop.example/p/guide?utm_campaign=launch';
function field(value=link) {
 const calls:string[]=[];
 return { calls, value, focus:()=>{calls.push('focus');}, select:()=>{calls.push('select');} };
}
test('successful clipboard copying sends the exact campaign link and leaves focus alone',async()=>{
 const input=field();const written:string[]=[];
 assert.equal(await copyCampaignLink(link,()=>input,async text=>{written.push(text);}), 'copied');
 assert.deepEqual(written,[link]);assert.deepEqual(input.calls,[]);
});
test('clipboard denial focuses and selects the current link without claiming it was copied',async()=>{
 const input=field();assert.equal(await copyCampaignLink(link,()=>input,async()=>{throw new Error('denied');}),'selected');
 assert.deepEqual(input.calls,['focus','select']);
});
test('a missing clipboard API still offers manual selection',async()=>{
 const input=field();assert.equal(await copyCampaignLink(link,()=>input),'selected');assert.deepEqual(input.calls,['focus','select']);
});
test('late failure cannot select a different campaign link',async()=>{
 const input=field();let reject!:(error:Error)=>void;
 const pending=copyCampaignLink(link,()=>input,()=>new Promise<void>((_,no)=>{reject=no;}));
 input.value='https://shop.example/p/another';reject(new Error('denied'));
 assert.equal(await pending,'stale');assert.deepEqual(input.calls,[]);
});
test('an unmounted field is not focused',async()=>{
 assert.equal(await copyCampaignLink(link,()=>null),'stale');
});
test('selection failures do not create a false copy confirmation',async()=>{
 const input:CampaignLinkField={value:link,focus(){throw new Error('unavailable');},select(){}};
 assert.equal(await copyCampaignLink(link,()=>input),'unavailable');
});
test('an empty link never touches clipboard or selection',async()=>{
 let touched=false;assert.equal(await copyCampaignLink('',()=>{touched=true;return null;},async()=>{touched=true;}),'unavailable');
 assert.equal(touched,false);
});
