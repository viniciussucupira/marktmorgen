import { claimHandle, ensureListId, setMailSettings, setSubscription, storeForEmail } from "@/lib/store";
import { upsertContact } from "@/lib/contacts";
import { BroadcastWriteUnconfirmed, createBroadcast } from "@/lib/broadcasts";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

async function main(): Promise<void> {
  redis.clear();
  const owner = "campaign-write@example.com";
  await claimHandle(owner, "write-check", "Write Check", "");
  await ensureListId(owner);
  await setSubscription(owner, { customerId: "cus_Write00001", subscriptionId: "sub_Write00001", active: true, tier: "pro", period: paidPeriod() });
  await setMailSettings(owner, { fromName: "Write Check", address: "1 Test Street" });
  const store = (await storeForEmail(owner))!;
  await upsertContact(store.listId!, "reader@example.com", { agreed: true, explicit: true, source: "free" });
  const input = { subject: "A campaign", body: "A useful message", productId: null, notProductId: null, sendAt: Date.now() + 86_400_000 };
  const original = redis.pipeline;
  const normal = Symbol("normal");
  let recordReply: unknown = normal;
  let indexReply: unknown = normal;
  let apply = false;
  let records = 0;
  let indexes = 0;
  let recordKey = "";
  redis.pipeline = async (commands) => {
    const record = commands.find((c) => c[0] === "SET" && String(c[1]).startsWith("nl:mail:bc:"));
    const indexed = commands.some((c) => c[0] === "LPUSH" && c[1] === "nl:mail:bcs:" + store.listId);
    if (record) { records += 1; recordKey = String(record[1]); }
    if (indexed) indexes += 1;
    const reply = record ? recordReply : indexed ? indexReply : normal;
    if (reply === normal) return original.call(redis, commands);
    if (apply) await original.call(redis, commands);
    if (reply instanceof Error) throw reply;
    return reply as unknown[];
  };
  const reset = () => { records = 0; indexes = 0; recordReply = normal; indexReply = normal; apply = false; };
  const unconfirmed = async () => {
    try { await createBroadcast(store, input); return false; }
    catch (error) { return error instanceof BroadcastWriteUnconfirmed; }
  };
  try {
    part("Record acknowledgement");
    for (const reply of [null, {}, [], [null], [true], [1], ["ok"], ["OK", "OK"], new Error("lost reply")]) {
      reset(); recordReply = reply;
      is("invalid record reply is unconfirmed", await unconfirmed(), true);
      is("one record attempt and no indexing", [records, indexes], [1, 0]);
    }
    part("Index and queue acknowledgements");
    for (const reply of [null, {}, [], [1], ["1", 1], [0, 1], [-1, 1], [1.5, 1], [Number.MAX_SAFE_INTEGER + 1, 1], [1, 2], [1, true], [1, 1, 0], new Error("lost index reply")]) {
      reset(); indexReply = reply;
      is("invalid index reply is unconfirmed", await unconfirmed(), true);
      is("no repeated write", [records, indexes], [1, 1]);
    }
    part("An applied write with a lost response is retained");
    reset(); apply = true; recordReply = new Error("record response lost");
    is("lost record acknowledgement is unconfirmed", await unconfirmed(), true);
    is("the applied record was not removed", (await original.call(redis, [["GET", recordKey]]))[0] !== null, true);
    is("the uncertain record was not retried or indexed", [records, indexes], [1, 0]);
    reset(); apply = true; indexReply = new Error("index response lost");
    is("lost index acknowledgement is unconfirmed", await unconfirmed(), true);
    const id = recordKey.slice("nl:mail:bc:".length);
    const retained = await original.call(redis, [["LRANGE", "nl:mail:bcs:" + store.listId, 0, -1], ["SISMEMBER", "nl:mail:queue", id]]);
    is("history still contains the applied campaign", (retained[0] as string[]).includes(id), true);
    is("queue membership was not rolled back", retained[1], 1);
    is("the uncertain indexing was not retried", [records, indexes], [1, 1]);
    part("Confirmed creation and preflight refusal");
    reset();
    const created = await createBroadcast(store, input);
    is("actual storage replies confirm creation", created.ok, true);
    is("one record and one index operation", [records, indexes], [1, 1]);
    reset(); apply = true; indexReply = [1, 0];
    is("already present queue membership is confirmed", (await createBroadcast(store, input)).ok, true);
    reset();
    is("invalid subject is refused before writes", (await createBroadcast(store, { ...input, subject: "" })).ok, false);
    is("preflight refusal writes nothing", [records, indexes], [0, 0]);
  } finally { redis.pipeline = original; }
  done();
}
void main();
