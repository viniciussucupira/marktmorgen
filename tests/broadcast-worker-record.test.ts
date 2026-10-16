import { advanceBroadcast } from "@/lib/broadcasts";
import { claimHandle, ensureListId, setMailSettings, setSubscription, storeForEmail, storeForHandle } from "@/lib/store";
import { upsertContact } from "@/lib/contacts";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
async function main() {
  redis.clear();
  const owner = "batch-owner@example.com";
  await claimHandle(owner, "batch-check", "Batch Check", "");
  await ensureListId(owner);
  await setSubscription(owner, { customerId: "cus_Batch00001", subscriptionId: "sub_Batch00001", active: true, tier: "pro" });
  await setMailSettings(owner, { fromName: "Batch Check", address: "1 Test Street, Test City" });
  const store = (await storeForEmail(owner))!;
  const emails = ["reader0@example.com", "reader1@example.com", "reader2@example.com"];
  for (const email of emails) await upsertContact(store.listId!, email, { agreed: true, explicit: true, source: "free" });
  process.env.RESEND_API_KEY = "re_test_recipient_batch_only";
  let messages: { to: string[] }[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url, init) => {
    if (String(url).includes("api.resend.com/emails/batch")) {
      messages.push(...JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ data: [] }));
    }
    return new Response("{}", { status: 404 });
  }) as typeof fetch;
  const id = "111111111111111111111111", key = "nl:mail:bc:" + id, toKey = key + ":to";
  const base = { id, listId: store.listId, handle: store.handle, subject: "Subject", body: "Message", productId: null, notProductId: null, who: "all", narrow: null, status: "sending", createdAt: 100, sendAt: 100, finishedAt: 0, total: 2, sent: 0, note: "", failures: 0, listed: true, tagged: true, test: null };
  const original = redis.pipeline;
  const normal = Symbol("normal");
  let reply: unknown = normal, loads = 0;
  const mutations: string[] = [];
  redis.pipeline = async commands => {
    if (commands.some(c => c[0] === "GET" && c[1] === key) && reply !== normal) {
      if (reply instanceof Error) throw reply;
      return reply as unknown[];
    }
    for (const c of commands) {
      if (c[1] === key && c[0] !== "GET" || c[1] === toKey || c[0] === "SREM") mutations.push(String(c[0]));
    }
    return original.call(redis, commands);
  };
  const seed = async (value: unknown = base) => {
    reply = normal; loads = 0; messages = []; mutations.length = 0;
    await original.call(redis, [["SET", key, typeof value === "string" ? value : JSON.stringify(value)], ["DEL", toKey], ["RPUSH", toKey, ...emails.slice(0, 2)], ["SADD", "nl:mail:queue", id]]);
  };
  const advance = () => advanceBroadcast(id, async handle => { loads++; return storeForHandle(handle); }, Date.now() - 1);
  const refused = async () => {
    const before = (await original.call(redis, [["GET", key]]))[0];
    let failed = false;
    try { await advance(); } catch { failed = true; }
    is("unavailable or invalid campaign stops processing", failed, true);
    is("invalid campaign stays queued", (await original.call(redis, [["SISMEMBER", "nl:mail:queue", id]]))[0], 1);
    is("no campaign, recipient or queue mutation", mutations, []);
    is("invalid read cannot trigger store loading", loads, 0);
    is("record remains byte-for-byte unchanged", (await original.call(redis, [["GET", key]]))[0], before);
    is("no provider calls", messages.length, 0);
    is("own execution lock is released", (await original.call(redis, [["GET", key + ":lock"]]))[0], null);
  };
  try {
    part("Malformed read envelopes cannot become missing campaigns");
    for (const invalid of [null, {}, [], [undefined], [null, null], [JSON.stringify(base), null], new Error("read response lost")]) {
      await seed(); reply = invalid; await refused();
    }
    part("Invalid records cannot send, overwrite or dequeue campaigns");
    const invalidRecords: unknown[] = ["{", "null", "[]", "{}", { ...base, id: "222222222222222222222222" }];
    for (const [field, values] of Object.entries({ listId: [null, "", 1], handle: [null, "", " "], subject: [null, ""], body: [null, ""], productId: [2, ""], status: ["unknown", null], total: [-1, 1.5, "2"], sent: [-1, 3, "0"], failures: [-1, "0"], listed: [null, "true"], note: [null], createdAt: [0, -1], sendAt: [0, "100"], finishedAt: [-1], who: ["unknown", null], notProductId: [3, ""], tagged: ["true"], narrow: [{ minSpent: -1, channel: "", quietDays: 0 }, {}], test: [{}] })) {
      for (const value of values) invalidRecords.push({ ...base, [field]: value });
    }
    invalidRecords.push({ ...base, status: "sent", sent: "2" });
    for (const value of invalidRecords) { await seed(value); await refused(); }
    part("Confirmed absence and valid terminal records retain queue cleanup");
    await seed(); reply = [null];
    is("confirmed absence returns null", await advance(), null);
    is("confirmed absence is dequeued", (await original.call(redis, [["SISMEMBER", "nl:mail:queue", id]]))[0], 0);
    for (const status of ["sent", "cancelled", "failed"]) {
      await seed({ ...base, status });
      is("valid terminal campaign is recognized", (await advance())?.status, status);
      is("terminal campaign is dequeued", (await original.call(redis, [["SISMEMBER", "nl:mail:queue", id]]))[0], 0);
      is("terminal campaign sends nothing", messages.length, 0);
    }
    part("Legacy optional fields still use documented defaults");
    const legacy: Record<string, unknown> = { ...base };
    for (const field of ["who", "notProductId", "tagged", "narrow", "test"]) delete legacy[field];
    await seed(legacy);
    const result = await advance();
    is("legacy active campaign remains processable", result?.status, "sending");
    is("legacy defaults remain intact", [result?.who, result?.notProductId, result?.tagged, result?.narrow, result?.test], ["all", null, false, null, null]);
    is("expired deadline prevents delivery", messages.length, 0);
  } finally { redis.pipeline = original; globalThis.fetch = originalFetch; }
  done();
}
void main();
