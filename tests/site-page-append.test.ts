import test from "node:test";
import assert from "node:assert/strict";
import { appendSitePages, claimHandle, setSitePages, storeForEmail } from "@/lib/store";
import { MAX_SITE_PAGES, type SitePage } from "@/lib/site-page-rules";
import { store as redis } from "./redis-stub";
process.env.NIMBUS_DATA_KEY="local-page-append-tests-only-0123456789abcdef";
const owner="append@example.test";
const page=(n:number, extra:Partial<SitePage>={}):SitePage=>({id:String(n).padStart(10,"0"),slug:"page-"+n,title:"Page "+n,nav:false,target:"",from:-1,...extra});
async function start(pages:SitePage[]=[]){redis.clear();await claimHandle(owner,"append-pages","Append","Pages");if(pages.length)assert.equal((await setSitePages(owner,pages)).ok,true);}
test("appending uses the latest pages and preserves their contents",async()=>{
  await start([page(1)]);
  const stale=(await storeForEmail(owner))!.sitePages;
  await setSitePages(owner,[{...stale[0],title:"Edited in another session",nav:true,from:0},page(2)]);
  assert.equal((await appendSitePages(owner,[page(3)])).ok,true);
  const pages=(await storeForEmail(owner))!.sitePages;
  assert.deepEqual(pages.map(p=>p.id),[page(1).id,page(2).id,page(3).id]);
  assert.deepEqual([pages[0].title,pages[0].nav,pages[0].from],["Edited in another session",true,0]);
});
test("two concurrent appends preserve both additions",async()=>{
  await start([page(1)]);
  const results=await Promise.all([appendSitePages(owner,[page(2)]),appendSitePages(owner,[page(3)])]);
  assert.equal(results.every(r=>r.ok),true);
  assert.deepEqual((await storeForEmail(owner))!.sitePages.map(p=>p.id).sort(),[page(1).id,page(2).id,page(3).id]);
});
test("concurrent appends share the last page slot",async()=>{
  await start(Array.from({length:MAX_SITE_PAGES-1},(_,i)=>page(i)));
  const results=await Promise.all([appendSitePages(owner,[page(100)]),appendSitePages(owner,[page(101)])]);
  assert.equal(results.filter(r=>r.ok).length,1);
  assert.equal((await storeForEmail(owner))!.sitePages.length,MAX_SITE_PAGES);
});
test("a full store does not truncate existing pages to fit additions",async()=>{
  const initial=Array.from({length:MAX_SITE_PAGES},(_,i)=>page(i));await start(initial);
  assert.equal((await appendSitePages(owner,[page(100)])).ok,false);
  assert.deepEqual((await storeForEmail(owner))!.sitePages,initial);
});
test("an address taken since the request snapshot cannot be duplicated",async()=>{
  await start([page(1)]);
  assert.equal((await appendSitePages(owner,[page(2,{slug:page(1).slug})])).ok,false);
  assert.deepEqual((await storeForEmail(owner))!.sitePages,[page(1)]);
});
test("an existing identity cannot be replaced by an append",async()=>{
  await start([page(1)]);
  assert.equal((await appendSitePages(owner,[page(1,{slug:"replacement",title:"Replacement"})])).ok,false);
  assert.deepEqual((await storeForEmail(owner))!.sitePages,[page(1)]);
});
test("a multi-page conflict appends none of the proposed pages",async()=>{
  await start([page(1)]);
  assert.equal((await appendSitePages(owner,[page(2),page(3,{slug:page(1).slug})])).ok,false);
  assert.deepEqual((await storeForEmail(owner))!.sitePages,[page(1)]);
});
test("invalid or oversized append lists are refused without partial parsing",async()=>{
  await start([page(1)]);
  for(const raw of [null,[],[page(2),null],Array.from({length:MAX_SITE_PAGES+1},(_,i)=>page(i+100)),[page(2),page(2)]])
    assert.equal((await appendSitePages(owner,raw)).ok,false);
  assert.deepEqual((await storeForEmail(owner))!.sitePages,[page(1)]);
});
test("a new page cannot claim a reserved route",async()=>{
  await start([page(1)]);assert.equal((await appendSitePages(owner,[page(2,{slug:"go"})])).ok,false);
  assert.deepEqual((await storeForEmail(owner))!.sitePages,[page(1)]);
});
test("existing reserved addresses remain intact",async()=>{
  await start([page(1,{slug:"go"})]);assert.equal((await appendSitePages(owner,[page(2)])).ok,true);
  assert.equal((await storeForEmail(owner))!.sitePages[0].slug,"go");
});
test("a removed or unknown product target cannot be attached",async()=>{
  await start([page(1)]);assert.equal((await appendSitePages(owner,[page(2,{target:"missing"})])).ok,false);
  assert.deepEqual((await storeForEmail(owner))!.sitePages,[page(1)]);
});
test("a missing store cannot be recreated by appending pages",async()=>{
  redis.clear();assert.deepEqual(await appendSitePages(owner,[page(1)]),{ok:false,reason:"none"});
  assert.equal(await storeForEmail(owner),null);
});
