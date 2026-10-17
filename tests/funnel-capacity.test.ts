import test from "node:test";
import assert from "node:assert/strict";
import { MAX_PAGE_FUNNELS, type PageFunnel } from "@/lib/page-funnel";
import { writePageFunnel, readPageFunnels, dropPageFunnel } from "@/lib/page-funnel-store";
import { store as redis } from "./redis-stub";
import { ROOM, roomOnly } from "./data-room";
const sid = "atomic-funnel-test", key = "nl:pfunnels:" + sid;
const funnel = (n: number, slug = "journey-" + n): PageFunnel => ({ id: String(n).padStart(10, "0"), name: "Journey " + n, slug, steps: [{ kind: "page", id: "page000001" }], on: false, since: 1760000000 });
test("concurrent creation cannot exceed the store funnel cap", async () => {
  redis.clear();
  const outcomes = await Promise.allSettled(Array.from({length:64}, (_,n) => writePageFunnel(sid,funnel(n),[], ROOM)));
  assert.equal(outcomes.filter(x=>x.status==="fulfilled").length,MAX_PAGE_FUNNELS);
  assert.equal((await redis.pipeline([["HLEN",key]]))[0],MAX_PAGE_FUNNELS);
});
test("concurrent creators share exactly the last available slot", async () => {
  redis.clear();
  for(let n=0;n<MAX_PAGE_FUNNELS-1;n++)await writePageFunnel(sid,funnel(n),[], ROOM);
  const outcomes=await Promise.allSettled(Array.from({length:64},(_,n)=>writePageFunnel(sid,funnel(n+100),[], ROOM)));
  assert.equal(outcomes.filter(x=>x.status==="fulfilled").length,1);
  assert.equal((await readPageFunnels(sid)).length,MAX_PAGE_FUNNELS);
});
test("two concurrent creations cannot take the same address", async () => {
  redis.clear();
  const outcomes=await Promise.allSettled([writePageFunnel(sid,funnel(1,"launch"),[], ROOM),writePageFunnel(sid,funnel(2,"Launch"),[], ROOM)]);
  assert.equal(outcomes.filter(x=>x.status==="fulfilled").length,1);
  assert.equal((await readPageFunnels(sid)).length,1);
});
test("existing funnels remain editable at capacity", async () => {
  redis.clear();
  for(let n=0;n<MAX_PAGE_FUNNELS;n++)await writePageFunnel(sid,funnel(n),[], ROOM);
  const existing=await readPageFunnels(sid);
  await writePageFunnel(sid,{...existing[0],name:"Edited"},existing, ROOM);
  assert.equal((await readPageFunnels(sid)).find(x=>x.id===existing[0].id)?.name,"Edited");
  assert.equal((await readPageFunnels(sid)).length,MAX_PAGE_FUNNELS);
});
test("a stale creation cannot replace an existing identity", async () => {
  redis.clear();await writePageFunnel(sid,funnel(1),[], ROOM);
  await assert.rejects(writePageFunnel(sid,{...funnel(1),name:"Replacement"},[], ROOM));
  assert.equal((await readPageFunnels(sid))[0].name,"Journey 1");
});
test("an edit cannot resurrect a concurrently removed funnel", async () => {
  redis.clear();await writePageFunnel(sid,funnel(1),[], ROOM);const existing=await readPageFunnels(sid);
  await dropPageFunnel(sid,funnel(1).id, ROOM);
  await assert.rejects(writePageFunnel(sid,{...funnel(1),name:"Removed edit"},existing, ROOM));
  assert.equal((await readPageFunnels(sid)).length,0);
});
test("two edits cannot claim the same new address", async () => {
  redis.clear();await writePageFunnel(sid,funnel(1),[], ROOM);await writePageFunnel(sid,funnel(2),[], ROOM);
  const existing=await readPageFunnels(sid);
  const outcomes=await Promise.allSettled(existing.map(x=>writePageFunnel(sid,{...x,slug:"new-address"},existing, ROOM)));
  assert.equal(outcomes.filter(x=>x.status==="fulfilled").length,1);
  assert.equal(new Set((await readPageFunnels(sid)).map(x=>x.slug)).size,2);
});
test("confirmed deletion makes one slot available", async () => {
  redis.clear();for(let n=0;n<MAX_PAGE_FUNNELS;n++)await writePageFunnel(sid,funnel(n),[], ROOM);
  await dropPageFunnel(sid,funnel(0).id, ROOM);await writePageFunnel(sid,funnel(100),[], ROOM);
  assert.equal((await readPageFunnels(sid)).length,MAX_PAGE_FUNNELS);
});
test("unreadable stored records prevent unsafe address assumptions", async () => {
  for(const value of ["not-json","null",'{"id":"0000000001"}','{"id":"wrong","slug":"held"}']){
    redis.clear();await redis.pipeline([["HSET",key,funnel(1).id,value]]);
    await assert.rejects(writePageFunnel(sid,funnel(2),[], ROOM));
    assert.equal((await redis.pipeline([["HLEN",key]]))[0],1);
    assert.equal((await redis.pipeline([["HGET",key,funnel(1).id]]))[0],value);
  }
});
test("only an explicit successful script reply confirms a save", async () => {
  const previous=redis.pipeline;
  try{for(const reply of [[],[0],["1"],[true],[1,1],[-1],[-2],[-3],[null]]){
    // The data room is counted as it is (lib/store-data.ts); only the funnel's own save answers oddly.
    redis.pipeline=async commands=>(roomOnly(commands)?previous(commands):reply);
    await assert.rejects(writePageFunnel(sid,funnel(1),[], ROOM));
  }}finally{redis.pipeline=previous;}
});
test("an unacknowledged completed write requires review rather than an automatic repeat", async () => {
  redis.clear();const previous=redis.pipeline;
  try{redis.pipeline=async commands=>{const answer=await previous(commands);return roomOnly(commands)?answer:[];};await assert.rejects(writePageFunnel(sid,funnel(1),[], ROOM));}
  finally{redis.pipeline=previous;}
  assert.equal((await readPageFunnels(sid))[0].id,funnel(1).id);
  await assert.rejects(writePageFunnel(sid,funnel(1),[], ROOM));
  assert.equal((await readPageFunnels(sid)).length,1);
});
test("the same address remains independent across stores", async () => {
  redis.clear();await writePageFunnel(sid,funnel(1,"launch"),[], ROOM);await writePageFunnel(sid+"-other",funnel(2,"launch"),[], ROOM);
  assert.equal((await readPageFunnels(sid))[0].slug,"launch");
  assert.equal((await readPageFunnels(sid+"-other"))[0].slug,"launch");
});
