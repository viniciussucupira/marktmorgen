import { advanceAll } from "@/lib/broadcasts";
import { claimHandle, ensureListId, setMailSettings, setSubscription, storeForEmail, storeForHandle } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";
async function main() {
  redis.clear();
  const owner = "queue-owner@example.com";
  await claimHandle(owner, "queue-check", "Queue Check", "");
  await ensureListId(owner);
  await setSubscription(owner, { customerId: "cus_Queue00001", subscriptionId: "sub_Queue00001", active: true, tier: "pro", period: paidPeriod() });
  await setMailSettings(owner, { fromName: "Queue Check", address: "1 Test Street, Test City" });
  const store = (await storeForEmail(owner))!;
  const bad = "111111111111111111111111", good = "222222222222222222222222", queue = "nl:mail:queue";
  const key = (id: string) => "nl:mail:bc:" + id;
  const base = { listId: store.listId, handle: store.handle, subject: "Subject", body: "Message", productId: null, notProductId: null, who: "all", narrow: null, status: "sending", createdAt: 100, sendAt: 100, finishedAt: 0, total: 0, sent: 0, note: "", failures: 0, listed: true, tagged: true, test: null };
  const original = redis.pipeline, originalError = console.error;
  const normal = Symbol("normal");
  let reply: unknown = normal, mode = "record", errors: unknown[][] = [];
  let claims: string[] = [];
  redis.pipeline = async commands => {
    if (commands.some(c => c[0] === "SMEMBERS" && c[1] === queue) && reply !== normal) {
      if (reply instanceof Error) throw reply;
      return reply as unknown[];
    }
    for (const c of commands) {
      if (c[0] === "SET" && String(c[1]).endsWith(":lock")) {
        claims.push(String(c[1]));
        if (c[1] === key(bad) + ":lock" && mode === "lock") throw new Error("lost lock reply");
      }
      if (c[0] === "GET" && c[1] === key(bad) && mode === "read") throw new Error("lost record reply");
      if (c[0] === "SET" && c[1] === key(bad) && mode === "save") throw new Error("lost progress reply");
    }
    return original.call(redis, commands);
  };
  console.error = (...args) => { errors.push(args); };
  const seed = async (nextMode: string) => {
    mode = nextMode; reply = normal; claims = []; errors = [];
    await original.call(redis, [["DEL", queue, key(bad) + ":lock", key(good) + ":lock"], ["SET", key(bad), mode === "record" ? "{" : JSON.stringify({ ...base, id: bad, handle: mode === "load" ? "faulty-store" : store.handle })], ["SET", key(good), JSON.stringify({ ...base, id: good })], ["SADD", queue, bad, good]]);
  };
  const load = async (handle: string) => {
    if (mode === "load" && handle === "faulty-store") throw new Error("store lookup failed");
    return storeForHandle(handle);
  };
  try {
    part("A single campaign failure does not stop the next campaign");
    for (const failure of ["record", "read", "lock", "load", "save"]) {
      await seed(failure);
      is("only confirmed successful work is counted", await advanceAll(load, Date.now() + 5000), 1);
      is("failed campaign stays queued", (await original.call(redis, [["SISMEMBER", queue, bad]]))[0], 1);
      is("following campaign completes", JSON.parse(String((await original.call(redis, [["GET", key(good)]]))[0])).status, "sent");
      is("completed campaign leaves queue", (await original.call(redis, [["SISMEMBER", queue, good]]))[0], 0);
      is("each campaign is attempted once in the pass", claims, [key(bad) + ":lock", key(good) + ":lock"]);
      is("failure is logged once without message content", errors, [["Advancing a queued campaign failed", bad]]);
    }
    part("Unknown queue reads never masquerade as empty");
    for (const invalid of [null, {}, [], [null], [""], [[bad], []], [[bad, bad]], [[bad, "wrong"]], [Array(1)], new Error("queue read failed")]) {
      await seed("record"); reply = invalid;
      let failed = false;
      try { await advanceAll(load, Date.now() + 5000); } catch { failed = true; }
      is("invalid queue read is reported", failed, true);
      is("no campaign starts from an invalid queue", claims, []);
      is("queue failure is not logged as a campaign failure", errors, []);
      is("original queue remains intact", (await original.call(redis, [["SMEMBERS", queue]]))[0], [bad, good]);
    }
    await seed("record"); reply = [[]];
    is("confirmed empty queue returns zero", await advanceAll(load, Date.now() + 5000), 0);
    is("confirmed empty queue starts nothing", claims, []);
    part("Deadline and lock contention retain their contracts");
    await seed("record");
    is("expired deadline starts no work", await advanceAll(load, Date.now() - 1), 0);
    is("deadline prevents every lock claim", claims, []);
    await seed("busy");
    await original.call(redis, [["SET", key(bad) + ":lock", "another-holder", "EX", 90]]);
    is("busy campaign does not block the following campaign", await advanceAll(load, Date.now() + 5000), 1);
    is("other holder lock is preserved", (await original.call(redis, [["GET", key(bad) + ":lock"]]))[0], "another-holder");
    is("confirmed contention is not logged as failure", errors, []);
    await seed("record");
    await original.call(redis, [["DEL", key(bad)]]);
    is("confirmed missing campaign does not count as progress", await advanceAll(load, Date.now() + 5000), 1);
    is("confirmed missing campaign is removed", (await original.call(redis, [["SISMEMBER", queue, bad]]))[0], 0);
    is("confirmed absence is not a failure", errors, []);
  } finally { redis.pipeline = original; console.error = originalError; }
  done();
}
void main();
