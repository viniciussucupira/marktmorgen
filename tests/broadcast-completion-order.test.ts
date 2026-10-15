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
  let finalReply: unknown = ["OK"], applyFinal = false;
  const events: string[] = [];
  redis.pipeline = async commands => {
    for (const c of commands) {
      if (c[0] === "SET" && c[1] === key && JSON.parse(String(c[2])).status === "sent") {
        events.push("terminal-save");
        if (applyFinal) await original.call(redis, commands);
        if (finalReply instanceof Error) throw finalReply;
        return finalReply as unknown[];
      }
      if (c[0] === "DEL" && c[1] === toKey) events.push("snapshot-delete");
    }
    return original.call(redis, commands);
  };
  const seed = async () => {
    messages = []; events.length = 0; applyFinal = false;
    await original.call(redis, [["SET", key, JSON.stringify(base)], ["DEL", toKey], ["RPUSH", toKey, ...emails.slice(0, 2)], ["SADD", "nl:mail:queue", id]]);
  };
  const advance = () => advanceBroadcast(id, storeForHandle, Date.now() + 5000);
  try {
    part("Unconfirmed completion retains the recipient snapshot");
    for (const invalid of [[], [null], [true], ["ok"], ["OK", "OK"], new Error("terminal response lost")]) {
      await seed(); finalReply = invalid;
      let failed = false;
      try { await advance(); } catch { failed = true; }
      is("unconfirmed completion throws", failed, true);
      is("snapshot was not deleted", events, ["terminal-save"]);
      is("snapshot remains readable", (await original.call(redis, [["LRANGE", toKey, 0, -1]]))[0], emails.slice(0, 2));
      is("campaign remains queued", (await original.call(redis, [["SISMEMBER", "nl:mail:queue", id]]))[0], 1);
      const progress = JSON.parse(String((await original.call(redis, [["GET", key]]))[0]));
      is("last confirmed progress retains processed offset", [progress.status, progress.sent], ["sending", 2]);
      is("only the original synthetic messages were sent", messages.length, 2);
      finalReply = ["OK"]; applyFinal = true;
      is("retry completes from saved offset", (await advance())?.status, "sent");
      is("retry does not resend the processed batch", messages.length, 2);
      is("confirmed completion precedes cleanup", events.slice(-2), ["terminal-save", "snapshot-delete"]);
      is("confirmed completion leaves queue", (await original.call(redis, [["SISMEMBER", "nl:mail:queue", id]]))[0], 0);
    }
    part("Applied terminal write with a lost response is not rolled back");
    await seed(); finalReply = []; applyFinal = true;
    let lost = false;
    try { await advance(); } catch { lost = true; }
    is("lost acknowledgement remains uncertain", lost, true);
    is("snapshot retained after lost acknowledgement", events, ["terminal-save"]);
    is("applied terminal status stays saved", JSON.parse(String((await original.call(redis, [["GET", key]]))[0])).status, "sent");
    is("next run recognizes saved completion", (await advance())?.status, "sent");
    is("completed campaign is not sent twice", messages.length, 2);
    is("next run removes completed campaign from queue", (await original.call(redis, [["SISMEMBER", "nl:mail:queue", id]]))[0], 0);
  } finally { redis.pipeline = original; globalThis.fetch = originalFetch; }
  done();
}
void main();
