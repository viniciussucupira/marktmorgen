import assert from "node:assert/strict";
import { makeErasureReceipt, readErasureReceipt } from "@/lib/erasure-receipt";
const before = process.env.NIMBUS_DATA_KEY, stripe = process.env.STRIPE_SECRET_KEY;
try {
  process.env.NIMBUS_DATA_KEY = "synthetic-erasure-receipt-key-32-characters";
  const now = 1800000000000, token = "a".repeat(64);
  const done = makeErasureReceipt("done", 2, token, now);
  assert.deepEqual(readErasureReceipt(done, "", now), {state:"done",count:2});
  const more = makeErasureReceipt("more", 1, token, now);
  assert.deepEqual(readErasureReceipt(more, token, now), {state:"more",count:1});
  assert.equal(readErasureReceipt(more, "b".repeat(64), now), null);
  assert.equal(readErasureReceipt(more, "", now), null);
  for (const raw of [undefined, null, [], "", "done", done + "x", done.replace(/.$/, done.endsWith("a") ? "b" : "a")]) assert.equal(readErasureReceipt(raw, token, now), null);
  const [payload, sign] = done.split(".");
  const changed = Buffer.from(JSON.stringify({...JSON.parse(Buffer.from(payload,"base64url").toString()),count:60})).toString("base64url");
  assert.equal(readErasureReceipt(changed+"."+sign,token,now),null);
  assert.equal(readErasureReceipt(done,token,now-1),null);
  assert.equal(readErasureReceipt(done,token,now+600000),null);
  for (const count of [-1, 61, NaN, 1.5]) assert.equal(makeErasureReceipt("done",count,token,now),"");
  assert.equal(makeErasureReceipt("done",1,"bad",now),"");
  process.env.NIMBUS_DATA_KEY = "different-synthetic-key-32-characters";
  assert.equal(readErasureReceipt(done,token,now),null);
  delete process.env.NIMBUS_DATA_KEY; delete process.env.STRIPE_SECRET_KEY;
  assert.equal(makeErasureReceipt("done",1,token,now),"");
  assert.equal(readErasureReceipt(done,token,now),null);
  console.log("Erasure receipts: signed result/count, partial grant binding, expiry, tamper, key rotation and missing-key refusal passed; no external work.");
} finally {
  if(before === undefined) delete process.env.NIMBUS_DATA_KEY; else process.env.NIMBUS_DATA_KEY=before;
  if(stripe === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY=stripe;
}
