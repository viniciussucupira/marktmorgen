import { answerQuestion, answersAllowance, answersUsed, takeAnswer } from "@/lib/answers";
import { guideVisitor } from "@/lib/store-guide";
import { addProduct, claimHandle, ensureStatsId, setAnswers, storeForEmail } from "@/lib/store";
import { readListing } from "@/lib/catalog";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

async function main() {
  redis.clear();
  process.env.ANTHROPIC_API_KEY = "sk-ant-public-test-not-real-00000000";
  let providerCalls = 0, providerFails = true;
  globalThis.fetch = (async (input: string | URL | Request) => {
    if (new URL(String(input)).hostname !== "api.anthropic.com") return new Response("not found", { status: 404 });
    providerCalls++;
    if (providerFails) return new Response("synthetic refusal", { status: 529 });
    return new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify({ known: true, answer: "It is a PDF.", picks: [{ n: 1, why: "A printable planner." }] }) }] }));
  }) as typeof fetch;
  const owner = "visitor-reserve@example.com";
  await claimHandle(owner, "visitor-reserve", "Visitor Reserve", "");
  await ensureStatsId(owner);
  const ids: string[] = [];
  for (const title of ["Planner", "Workbook"]) {
    const made = await addProduct(owner, title, "Printable PDF", "29", null);
    if (!made.ok) throw Error("missing fixture product");
    ids.push(made.product.id);
  }
  await setAnswers(owner, { on: true, facts: "Printable PDFs." });
  const store = (await storeForEmail(owner))!;
  const statsId = store.statsId;
  if (!statsId) throw Error("missing fixture stats identity");
  const first = await readListing(store, ids[0]), second = await readListing(store, ids[1]);
  if (!first || !second) throw Error("missing fixture listing");
  const now = Date.UTC(2026, 0, 15), allowance = answersAllowance(store, now);
  const quota = `nl:ask:${statsId}:2026-01`, attempts = `nl:ask-attempt:${statsId}:2026-01`;
  const ask = (question = "Can I print this PDF?") => answerQuestion({ store, product: first, about: "A PDF", page: null, question, now });
  const guide = (goal = "I want a printable planner") => guideVisitor({ store, products: [first, second], goal, now });
  const original = redis.pipeline, normal = Symbol("normal");
  let target = quota, reply: unknown = normal, apply = false, reserves = 0, attemptReserves = 0, releases = 0, attemptReleases = 0;
  redis.pipeline = async commands => {
    if (commands.some(c => c[0] === "DECR" && c[1] === quota)) releases++;
    if (commands.some(c => c[0] === "DECR" && c[1] === attempts)) attemptReleases++;
    if (commands.some(c => c[0] === "INCR" && c[1] === quota)) reserves++;
    if (commands.some(c => c[0] === "INCR" && c[1] === attempts)) attemptReserves++;
    if (commands.some(c => c[0] === "INCR" && c[1] === target) && reply !== normal) {
      if (apply) await original.call(redis, commands);
      if (reply instanceof Error) throw reply;
      return reply as unknown[];
    }
    return original.call(redis, commands);
  };
  const reset = async () => {
    await original.call(redis, [["DEL", quota, attempts]]);
    reply = normal; apply = false; providerCalls = reserves = attemptReserves = releases = attemptReleases = 0;
  };
  try {
    part("Both public paths require exact result and attempt reservations");
    for (const path of [ask, guide]) for (target of [quota, attempts]) {
      for (const bad of [null, [], [1], [1, 0], [1, "1"], ["1", 1], [true, 1], [0, 1], [-1, 1], [1.1, 1], [NaN, 1], [Infinity, 1], [Number.MAX_SAFE_INTEGER + 1, 1], [1, 1, 1], new Error("reply lost")]) {
        await reset(); reply = bad; apply = true;
        is("unknown authorization closes the assistant", await path(), { ok: false, reason: "closed" });
        is("no provider call or reservation retry", [providerCalls, reserves, attemptReserves], [0, 1, target === attempts ? 1 : 0]);
        is("uncertain applied counter retained", (await original.call(redis, [["GET", target]]))[0], "1");
        is("no uncertain rollback", [releases, attemptReleases], [target === attempts ? 1 : 0, 0]);
      }
    }
    target = quota;
    part("Shared failed-attempt cap without consuming failed results");
    await reset(); await original.call(redis, [["SET", attempts, allowance * 2 - 1]]);
    is("failed product answer", await ask(), { ok: false, reason: "failed" });
    is("failed answer returns result quota", await answersUsed(store, now), 0);
    is("store guide cannot bypass exhausted shared attempts", await guide(), { ok: false, reason: "closed" });
    is("only final available request reached provider", providerCalls, 1);
    is("no attempt counter is released", attemptReleases, 0);
    await reset(); await original.call(redis, [["SET", attempts, allowance * 2 - 1]]);
    is("failed guide", await guide(), { ok: false, reason: "failed" });
    is("product cannot bypass guide's attempt usage", await ask(), { ok: false, reason: "closed" });
    is("guide failure returns result quota", await answersUsed(store, now), 0);
    is("only guide reached provider", providerCalls, 1);

    part("Concurrent public requests stay within remaining attempts");
    await reset(); providerFails = false;
    await original.call(redis, [["SET", attempts, allowance * 2 - 2]]);
    const results = await Promise.all(Array.from({ length: 20 }, (_, i) => i % 2 ? guide(`Printable planner request ${i}`) : ask(`Printable PDF request ${i}?`)));
    is("two requests succeed, the rest close", [results.filter(r => r.ok).length, providerCalls], [2, 2]);
    is("only successful results consume quota", await answersUsed(store, now), 2);

    part("Cached answers remain usable without new paid work");
    await reset();
    const cachedAnswer = await ask("Does the cached planner print?");
    const cachedGuide = await guide("A cached printable planner please");
    is("both first requests succeed", [cachedAnswer.ok, cachedGuide.ok, providerCalls], [true, true, 2]);
    await original.call(redis, [["SET", quota, allowance], ["SET", attempts, allowance * 2]]);
    const before = [reserves, attemptReserves];
    is("product answer comes from cache", await ask("Does the cached planner print?"), cachedAnswer);
    is("guide comes from cache", await guide("A cached printable planner please"), cachedGuide);
    is("cached reads reserve and call nothing", [reserves, attemptReserves, providerCalls], [...before, 2]);
    is("a new request still closes", await ask("A new question not cached?"), { ok: false, reason: "closed" });
    is("known excess result reservation is released", await answersUsed(store, now), allowance);

    part("Invalid reservation context never writes");
    await reset();
    for (const time of [NaN, Infinity, Number.MAX_VALUE]) is("invalid time denied", await takeAnswer(store, time), false);
    is("missing identity denied", await takeAnswer({ ...store, statsId: null }, now), false);
    is("invalid contexts write nothing", [reserves, attemptReserves, providerCalls], [0, 0, 0]);
  } finally { redis.pipeline = original; }
  done();
}
void main();
