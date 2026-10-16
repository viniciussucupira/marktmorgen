import { aiAttemptKey, reserveAiAttempt } from "@/lib/ai-attempts";
import { aiAllowance, aiMonthKey, counted } from "@/lib/ai";
import { draftKit } from "@/lib/affiliate-kit";
import { addProduct, claimHandle, ensureStatsId, setAffiliateSetting, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { parseAffiliateSetting } from "@/lib/affiliate-setting";
import type { Affiliate } from "@/lib/affiliates";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

async function main() {
  redis.clear();
  process.env.ANTHROPIC_API_KEY = "sk-ant-test-attempts-not-real-000000";
  process.env.STRIPE_SECRET_KEY = "sk_test_attempts_not_real";
  let providerCalls = 0;
  globalThis.fetch = (async (input: string | URL | Request) => {
    if (new URL(String(input)).hostname === "api.anthropic.com") providerCalls++;
    return new Response(JSON.stringify({ content: [] }), { status: 200 });
  }) as typeof fetch;
  const owner = "attempts@example.com";
  await claimHandle(owner, "ai-attempts", "Attempts", "");
  await ensureStatsId(owner);
  await setStripeAccount(owner, "acct_1TestAttempts00001", true);
  await setSubscription(owner, { customerId: "cus_attempts", subscriptionId: "sub_attempts", active: true, tier: "creator", trialEnds: 0 });
  const product = await addProduct(owner, "Test product", "", "29", null);
  if (!product.ok) throw Error("missing fixture product");
  await setAffiliateSetting(owner, parseAffiliateSetting({ enabled: true, percent: 30, days: 30 }));
  const store = (await storeForEmail(owner))!;
  const statsId = store.statsId;
  if (!statsId) throw Error("missing fixture stats identity");
  const now = Date.UTC(2026, 0, 15), allowance = aiAllowance(store, now);
  const key = aiAttemptKey(statsId, now), quota = aiMonthKey(store, new Date(now));
  const affiliate: Affiliate = { id: "aaaaaaaaaaaa", email: "test@example.com", code: "test", status: "approved", appliedAt: 1, decidedAt: 1, note: "", rate: null, paypal: "", share: null, cleared: null, by: null };
  const original = redis.pipeline;
  const normal = Symbol("normal");
  let reply: unknown = normal, applied = false, reservations = 0, decrements = 0;
  redis.pipeline = async commands => {
    if (commands.some(c => String(c[0]).startsWith("DECR") && String(c[1]).startsWith("nl:ai-attempt:"))) decrements++;
    if (commands.some(c => c[0] === "INCRBY" && String(c[1]).startsWith("nl:ai-attempt:"))) {
      reservations++;
      if (reply !== normal) {
        if (applied) await original.call(redis, commands);
        if (reply instanceof Error) throw reply;
        return reply as unknown[];
      }
    }
    return original.call(redis, commands);
  };
  const reset = async () => { await original.call(redis, [["DEL", key, quota]]); reply = normal; applied = false; reservations = 0; decrements = 0; providerCalls = 0; };
  try {
    part("Unknown attempts authorize no paid work");
    for (const bad of [null, [], [1], [1, 0], [1, "1"], ["1", 1], [0, 1], [NaN, 1], [1.5, 1], [1, 1, 1], new Error("lost")]) {
      await reset(); reply = bad; applied = true;
      let callbacks = 0;
      is("uncertain attempt refuses callback", await counted(store, now, async () => { callbacks++; return "answer"; }), { ok: false, reason: "failed" });
      is("no provider work", callbacks, 0);
      is("unknown reservation retained", (await original.call(redis, [["GET", key]]))[0], "1");
      is("no retries or attempt refunds", [reservations, decrements], [1, 0]);
      is("result quota is returned", (await original.call(redis, [["GET", quota]]))[0], "0");
    }
    part("Failed results cannot enable unlimited paid attempts");
    await reset();
    let callbacks = 0;
    for (let i = 0; i < 2; i++) is("failed weighted work", await counted(store, now, async () => { callbacks++; return null; }, allowance), { ok: false, reason: "failed" });
    is("next attempt blocked", await counted(store, now, async () => { callbacks++; return "answer"; }), { ok: false, reason: "used" });
    is("only two full weighted batches ran", callbacks, 2);
    is("attempts never released", decrements, 0);
    is("successful output quota still available", (await original.call(redis, [["GET", quota]]))[0], "0");
    await reset();
    is("throwing work fails safely", await counted(store, now, async () => { throw Error("synthetic failure"); }), { ok: false, reason: "failed" });
    is("thrown work keeps attempt", (await original.call(redis, [["GET", key]]))[0], "1");

    part("Affiliate and writing paths share the attempt counter");
    await reset(); await original.call(redis, [["SET", key, allowance * 2 - 1]]);
    is("affiliate failed response", await draftKit(store, affiliate, product.product.id, "", new Date(now)), { ok: false, reason: "failed" });
    is("affiliate reaches provider once", providerCalls, 1);
    is("affiliate uses final shared slot", (await original.call(redis, [["GET", key]]))[0], String(allowance * 2));
    let afterKit = 0;
    is("writing then blocked", await counted(store, now, async () => { afterKit++; return "answer"; }), { ok: false, reason: "used" });
    is("no callback after affiliate exhausted attempts", afterKit, 0);
    await reset(); await original.call(redis, [["SET", key, allowance * 2]]);
    is("exhausted affiliate refuses provider", await draftKit(store, affiliate, product.product.id, "", new Date(now)), { ok: false, reason: "month" });
    is("no affiliate provider call", providerCalls, 0);

    part("Concurrent weighted attempts and scope boundaries");
    await reset();
    const results = await Promise.all(Array.from({ length: 30 }, () => reserveAiAttempt(statsId, now, 10, 3)));
    is("six weighted attempts fit, excess cannot run", [results.filter(x => x === "reserved").length, results.filter(x => x === "exhausted").length], [6, 24]);
    is("another store has its own counter", await reserveAiAttempt("anotherStore", now, 10, 3), "reserved");
    is("a new month has its own counter", await reserveAiAttempt(statsId, Date.UTC(2026, 1, 1), 10, 3), "reserved");
    await reset();
    for (const args of [["", now, 10, 1], ["bad:key", now, 10, 1], [statsId, NaN, 10, 1], [statsId, now, 0, 1], [statsId, now, 1.5, 1], [statsId, now, Number.MAX_SAFE_INTEGER, 1], [statsId, now, 10, 0], [statsId, now, 10, 1.5]] as const) is("invalid reservation denied", await reserveAiAttempt(args[0], args[1], args[2], args[3]), "unavailable");
    is("invalid inputs never write", reservations, 0);
    is("oversized work refused before writes", await reserveAiAttempt(statsId, now, 10, 21), "exhausted");
    is("oversized writes nothing", reservations, 0);
  } finally { redis.pipeline = original; }
  done();
}
void main();
