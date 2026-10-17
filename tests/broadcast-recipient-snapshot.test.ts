import { advanceBroadcast } from "@/lib/broadcasts";
import { claimHandle, ensureListId, setMailSettings, setSubscription, storeForEmail, storeForHandle } from "@/lib/store";
import { upsertContact, leadsKey } from "@/lib/contacts";
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
  const emails = Array.from({ length: 501 }, (_, i) => "reader" + i + "@example.com");
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
  const base = { id, listId: store.listId, handle: store.handle, subject: "Subject", body: "Message", productId: null, notProductId: null, who: "all", narrow: null, status: "scheduled", createdAt: 100, sendAt: 100, finishedAt: 0, total: 501, sent: 0, note: "", failures: 0, listed: false, tagged: true, test: null };
  const original = redis.pipeline;
  const normal = Symbol("normal");
  let reply: unknown = normal, apply = false, partial = false, preparations = 0;
  redis.pipeline = async commands => {
    if (commands.some(c => c[0] === "EXPIRE" && c[1] === toKey)) {
      preparations += 1;
      if (reply !== normal) {
        if (partial) await original.call(redis, commands.slice(0, 2));
        else if (apply) await original.call(redis, commands);
        if (reply instanceof Error) throw reply;
        return reply as unknown[];
      }
    }
    return original.call(redis, commands);
  };
  const seed = async (stale = true) => {
    reply = normal; apply = false; partial = false; preparations = 0; messages = [];
    const commands: (string | number)[][] = [["SET", key, JSON.stringify(base)], ["DEL", toKey], ["SADD", "nl:mail:queue", id]];
    if (stale) commands.push(["RPUSH", toKey, "stale@example.com"]);
    await original.call(redis, commands);
  };
  const advance = () => advanceBroadcast(id, storeForHandle, Date.now() - 1);
  const saved = async () => JSON.parse(String((await original.call(redis, [["GET", key]]))[0]));
  try {
    part("Every snapshot acknowledgement is required before sending");
    for (const invalid of [null, {}, [], [1, 500, 501], [1, 500, 501, 1, 0], ["1", 500, 501, 1], [2, 500, 501, 1], [1, 499, 501, 1], [1, "500", 501, 1], [1, 500, 500, 1], [1, 500, 502, 1], [1, 500, 501, 0], [1, 500, 501, true], new Error("snapshot response lost")]) {
      await seed(); reply = invalid;
      const result = await advance();
      is("incomplete preparation waits", result?.status, "waiting");
      is("unconfirmed snapshot is not marked listed", result?.listed, false);
      is("preparation makes no provider calls", messages.length, 0);
      is("no automatic repeat in the same run", preparations, 1);
      const retained = await saved();
      is("queue and zero progress remain intact", [retained.sent, (await original.call(redis, [["SISMEMBER", "nl:mail:queue", id]]))[0]], [0, 1]);
    }
    part("Partial writes are rebuilt only before the first send");
    await seed(); partial = true; reply = [1, 500, null, 0];
    is("partially applied preparation stays unconfirmed", (await advance())?.listed, false);
    is("partial recipient list is retained until a retry", ((await original.call(redis, [["LRANGE", toKey, 0, -1]]))[0] as unknown[]).length, 500);
    reply = normal;
    const resumed = await advance();
    is("retry confirms the entire snapshot", [resumed?.status, resumed?.listed, resumed?.total, resumed?.sent], ["sending", true, 501, 0]);
    const recipients = (await original.call(redis, [["LRANGE", toKey, 0, -1]]))[0] as string[];
    is("retry replaces rather than appends to the partial list", [recipients.length, new Set(recipients).size], [501, 501]);
    is("every original eligible address is retained", [...recipients].sort(), [...emails].sort());
    is("deadline leaves the confirmed snapshot without sending", messages.length, 0);
    await seed(); apply = true; reply = new Error("applied snapshot response lost");
    is("lost acknowledgement after a full write still waits", (await advance())?.listed, false);
    is("applied snapshot was not rolled back", ((await original.call(redis, [["LRANGE", toKey, 0, -1]]))[0] as unknown[]).length, 501);
    reply = normal;
    is("later confirmation can mark the snapshot listed", (await advance())?.listed, true);
    await seed();
    await original.call(redis, [["SET", key, JSON.stringify({ ...base, sent: 1 })]]);
    const inconsistent = await advance();
    is("recorded progress prevents reconstructing an unconfirmed list", [inconsistent?.status, inconsistent?.sent, inconsistent?.listed], ["waiting", 1, false]);
    is("no preparation after recorded progress", preparations, 0);
    is("no messages after inconsistent progress", messages.length, 0);
    part("Confirmed absence and an empty audience are valid");
    await seed(false);
    is("DEL zero is valid for a previously absent snapshot", (await advance())?.listed, true);
    await original.call(redis, [["DEL", leadsKey(store.listId!)]]);
    await seed();
    const empty = await advance();
    is("empty audience needs no recipient key to expire", [empty?.status, empty?.listed, empty?.total, empty?.sent], ["sent", true, 0, 0]);
    is("empty audience produces no messages", messages.length, 0);
  } finally { redis.pipeline = original; globalThis.fetch = originalFetch; }
  done();
}
void main();
