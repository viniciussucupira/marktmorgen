/**
 * A plan refund from start to finish (305 [SY1] unit 2b1,
 * lib/plan-refund-flow.ts) against a stand-in Stripe that keeps idempotency
 * keys, as Stripe does. Nothing real is reached.
 *
 * What fails here:
 *   - the order: the plan not set to stop before the money goes back, or not
 *     ended after it;
 *   - a refund without the plan ended, its open invoice left payable or its
 *     draft left to be charged, or the store still written down as paid;
 *   - a refused or failed refund that costs the creator their plan (the stop
 *     left behind), or a stop the creator set themselves taken back;
 *   - a second refund from a second click, two requests at once or a retry;
 *   - a refund whose answer was lost, or a plan whose ending failed, never
 *     finished by the daily job; a note never dropped;
 *   - the daily job finishing a store a request is finishing now.
 */
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { claimHandle, setAssistantPlan, setSubscription, storeForEmail } from "@/lib/store";
import { ENDING_KEY, GIVE_UP_DAYS, SETTLE_SECONDS, finishPlanRefunds, flowKeyOf, refundAndEndPlan } from "@/lib/plan-refund-flow";
import { redisPipeline } from "@/lib/redis";

const DAY = 86_400;
const NOW = Date.UTC(2026, 11, 2) / 1000;

type Row = Record<string, unknown>;
const world = {
  customers: new Map<string, string>(),
  subs: new Map<string, Row>(),
  invoices: [] as Row[],
  charges: [] as Row[],
  refunds: [] as Row[],
  replies: new Map<string, string>(),
  /** Every call, "METHOD path", in order. */
  calls: [] as string[],
  /** Stripe makes the refund, then the answer is lost. */
  loseAnswer: false,
  /** Refund writes answer 500 before doing anything. */
  refundsDown: false,
  /** Setting or taking back the stop answers 500 before doing anything. */
  stopDown: false,
  /** Ending a subscription answers 500 before doing anything. */
  endDown: false,
  /** Listing the platform's refunds answers 500. */
  listDown: false,
  /** New refunds come back with this status. */
  refundStatus: "succeeded",
  /** Subscriptions whose updates answer 500. */
  postDownFor: new Set<string>(),
  slow: 0,
  /** Emails sent through the stand-in Resend. */
  emails: [] as { to: string; subject: string; text: string; key: string }[],
};

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input instanceof Request ? input.url : input));
  const method = init?.method ?? "GET";
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
  const fail = () => json({ error: { message: "down", type: "api_error" } }, 500);
  if (url.hostname === "api.resend.com") {
    const body = JSON.parse(String(init?.body)) as { to: string | string[]; subject: string; text: string };
    world.emails.push({ to: [body.to].flat()[0], subject: body.subject, text: body.text, key: new Headers(init?.headers).get("idempotency-key") ?? "" });
    return new Response(JSON.stringify({ id: `email_${world.emails.length}` }), { status: 200 });
  }
  if (url.hostname !== "api.stripe.com") return new Response(null, { status: 404 });
  if (world.slow) await new Promise((r) => setTimeout(r, world.slow));
  const path = url.pathname.replace(/^\/v1/, "");
  const q = url.searchParams;
  world.calls.push(`${method} ${path}`);
  const page = (data: unknown[]) => json({ object: "list", data, has_more: false });
  const form = new URLSearchParams(String(init?.body ?? ""));
  const sub = path.match(/^\/subscriptions\/(sub_\w+)$/);
  if (sub) {
    const row = world.subs.get(sub[1]);
    if (!row) return json({ error: { message: "No such subscription", type: "invalid_request_error" } }, 404);
    if (method === "POST") {
      if (world.stopDown || world.postDownFor.has(sub[1])) return fail();
      if (row.status === "canceled") return json({ error: { message: "canceled", type: "invalid_request_error" } }, 400);
      row.cancel_at_period_end = form.get("cancel_at_period_end") === "true";
    }
    if (method === "DELETE") {
      if (world.endDown) return fail();
      if (row.status === "canceled") return json({ error: { message: "canceled", type: "invalid_request_error" } }, 400);
      row.status = "canceled";
      row.cancel_at_period_end = false;
    }
    const customer = String(row.customer);
    return json({ ...row, customer: q.getAll("expand[]").includes("customer") ? { id: customer, email: world.customers.get(customer), balance: 0 } : customer });
  }
  if (method === "POST" && path === "/refunds") {
    if (world.refundsDown) return fail();
    const key = new Headers(init?.headers).get("idempotency-key") ?? "";
    const kept = world.replies.get(key);
    if (kept) return new Response(kept, { status: 200, headers: { "content-type": "application/json" } });
    const charge = world.charges.find((c) => c.payment_intent === form.get("payment_intent"))!;
    const amount = Number(form.get("amount"));
    const refund = { id: `re_made${world.refunds.length + 1}x`, object: "refund", charge: charge.id, payment_intent: charge.payment_intent, amount, currency: "usd", status: world.refundStatus, created: NOW, metadata: { plan_refund: form.get("metadata[plan_refund]") } };
    world.refunds.push(refund);
    charge.amount_refunded = Number(charge.amount_refunded) + amount;
    world.replies.set(key, JSON.stringify(refund));
    if (world.loseAnswer) throw new TypeError("fetch failed");
    return json(refund);
  }
  if (method === "GET" && path === "/refunds") {
    if (q.get("charge")) return page(world.refunds.filter((r) => r.charge === q.get("charge")));
    if (world.listDown) return fail();
    const since = Number(q.get("created[gte]"));
    const until = Number(q.get("created[lte]") ?? Infinity);
    return page(world.refunds.filter((r) => Number(r.created) >= since && Number(r.created) <= until).reverse());
  }
  const voiding = path.match(/^\/invoices\/(in_\w+)\/void$/);
  if (voiding && method === "POST") {
    const row = world.invoices.find((i) => i.id === voiding[1])!;
    row.status = "void";
    return json(row);
  }
  const invoice = path.match(/^\/invoices\/(in_\w+)$/);
  if (invoice && method === "DELETE") {
    world.invoices = world.invoices.filter((i) => i.id !== invoice[1]);
    return json({ id: invoice[1], deleted: true });
  }
  if (method !== "GET") return json({ error: { message: `no stand-in for ${method} ${path}` } }, 400);
  if (path === "/invoices") return page(world.invoices.filter((i) => i.subscription === q.get("subscription") && i.status === q.get("status")));
  if (path === "/charges") return page(world.charges.filter((c) => c.customer === q.get("customer")));
  const charge = path.match(/^\/charges\/(ch_\w+)$/);
  if (charge) return json(world.charges.find((c) => c.id === charge[1]));
  if (path === "/charges/search" || path === "/customers/search") return page([]);
  if (path === "/disputes") return page([]);
  return json({ error: { message: `no stand-in for ${path}` } }, 404);
}) as typeof fetch;

let n = 0;
async function paidShop(o: { at?: number; stopSet?: boolean } = {}) {
  n += 1;
  const handle = `flow${n}`;
  const email = `${handle}@example.com`;
  const customer = `cus_${handle}0001`;
  const subId = `sub_${handle}0001`;
  await claimHandle(email, handle, `Flow ${n}`, "");
  await setSubscription(email, { customerId: customer, subscriptionId: subId, active: true, tier: "creator", cycle: "month", trialEnds: 0 });
  world.customers.set(customer, email);
  world.subs.set(subId, { id: subId, customer, status: "active", cancel_at_period_end: o.stopSet ?? false, metadata: { store: handle } });
  const at = o.at ?? NOW - 3 * DAY;
  const id = `ch_${handle}x1`;
  world.invoices.push({ id: `in_${handle}x1`, subscription: subId, status: "paid", created: at, total: 6_900, tax: null, billing_reason: "subscription_create", charge: id, status_transitions: { paid_at: at }, lines: { data: [{ type: "subscription", period: { start: at }, price: { unit_amount: 6_900, currency: "usd", recurring: { interval: "month" } } }] } });
  world.invoices.push({ id: `in_${handle}open`, subscription: subId, status: "open" }, { id: `in_${handle}draft`, subscription: subId, status: "draft" });
  world.charges.push({ id, customer, invoice: `in_${handle}x1`, payment_intent: `pi_${handle}x1`, status: "succeeded", paid: true, currency: "usd", created: at, amount_captured: 6_900, amount_refunded: 0, disputed: false, payment_method_details: { card: { fingerprint: `fp${handle}` } }, balance_transaction: { fee: 230, currency: "usd" } });
  const store = async () => (await storeForEmail(email))!;
  return {
    subId,
    store,
    sub: () => world.subs.get(subId)!,
    refunds: () => world.refunds.filter((r) => r.charge === id),
    invoices: () => world.invoices.filter((i) => i.subscription === subId && i.status !== "paid").map((i) => `${i.id}:${i.status}`),
    note: async () => (await redisPipeline([["HGET", ENDING_KEY, (await store()).sid]]))[0],
  };
}
const order = (subId: string) => world.calls.filter((c) => c.includes(subId) || c === "POST /refunds").map((c) => c.replace(`/${subId}`, "/:sub"));

async function main() {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_a_stand_in_key_for_tests_only";

  part("Refunded and ended, in the safe order");
  const a = await paidShop();
  world.calls = [];
  const first = await refundAndEndPlan(await a.store(), NOW);
  is("the first payment comes back and the plan is ended", first, { ok: true, cents: 6_900, currency: "usd", refundId: "re_made1x", status: "succeeded", ended: true, earlier: false });
  const steps = order(a.subId);
  const stop = steps.indexOf("POST /subscriptions/:sub"), refund = steps.indexOf("POST /refunds"), end = steps.indexOf("DELETE /subscriptions/:sub");
  is("set to stop, then refunded, then ended", stop >= 0 && stop < refund && refund < end, true);
  is("ended at Stripe", a.sub().status, "canceled");
  is("its open invoice voided, its draft deleted", a.invoices(), [`in_flow${n}open:void`]);
  const after = await a.store();
  is("the store has no plan any more (the closing rules start)", [after.subscriptionActive, after.planEndedAt !== ""], [false, true]);
  is("no note left", await a.note(), null);
  is("no lock left", (await redisPipeline([["GET", flowKeyOf(after.sid)]]))[0], null);

  part("Never twice");
  const again = await refundAndEndPlan(await a.store(), NOW);
  is("a second click: the earlier refund is reported, nothing new", [again.ok && again.earlier, again.ok && again.refundId, a.refunds().length], [true, "re_made1x", 1]);
  const b = await paidShop();
  world.slow = 5;
  const both = await Promise.all([refundAndEndPlan(await b.store(), NOW), refundAndEndPlan(await b.store(), NOW)]);
  world.slow = 0;
  is("two at once: one made, the other told to wait", both.map((r) => (r.ok ? "made" : r.reason)).sort(), ["busy", "made"]);
  is("one refund at Stripe", b.refunds().length, 1);

  part("Not owed: the plan goes on as it was");
  const late = await paidShop({ at: NOW - 40 * DAY });
  const refused = await refundAndEndPlan(await late.store(), NOW);
  is("outside the 30 days: refused, nothing changed", [refused, late.refunds().length], [{ ok: false, reason: "not_owed", stopLeft: false }, 0]);
  is("the stop set for it is taken back", [late.sub().status, late.sub().cancel_at_period_end], ["active", false]);
  is("still paid, invoices untouched, no note", [(await late.store()).subscriptionActive, late.invoices(), await late.note()], [true, [`in_flow${n}open:open`, `in_flow${n}draft:draft`], null]);
  const own = await paidShop({ at: NOW - 40 * DAY, stopSet: true });
  await refundAndEndPlan(await own.store(), NOW);
  is("a stop the creator had set is left as it was", own.sub().cancel_at_period_end, true);

  part("Failures on the way");
  const s = await paidShop();
  world.stopDown = true;
  is("the stop cannot be set: nothing refunded", [await refundAndEndPlan(await s.store(), NOW), s.refunds().length], [{ ok: false, reason: "stop_failed", stopLeft: false }, 0]);
  world.stopDown = false;
  is("and no note left", await s.note(), null);

  const d = await paidShop();
  world.refundsDown = true;
  const down = await refundAndEndPlan(await d.store(), NOW);
  world.refundsDown = false;
  is("Stripe failing at the refund: failed, and the stop KEPT while a refund may still turn up (no renewal meanwhile)", [down, d.sub().cancel_at_period_end, d.refunds().length], [{ ok: false, reason: "failed", stopLeft: true }, true, 0]);
  is("the note stays for the daily job", JSON.parse(String(await d.note())).m, 1);
  is("the daily job before SETTLE_SECONDS: left, stop still set", [(await finishPlanRefunds(Date.now() + 10_000, NOW + 60)).left >= 1, d.sub().cancel_at_period_end], [true, true]);
  process.env.RESEND_API_KEY = "re_a_stand_in_key_for_tests_only";
  world.emails = [];
  is("after it, none found: the stop taken back, the note dropped, the plan untouched", [await (async () => { await finishPlanRefunds(Date.now() + 10_000, NOW + SETTLE_SECONDS + 1); return d.note(); })(), d.sub().status, d.sub().cancel_at_period_end], [null, "active", false]);

  is("and the creator is told by email that nothing was refunded and the plan goes on", world.emails.map((e) => [e.subject.endsWith("your refund was not made"), e.text.includes("Nothing was refunded and your plan goes on as before.")]), [[true, true]]);
  delete process.env.RESEND_API_KEY;
  const t = await paidShop();
  world.loseAnswer = true;
  world.listDown = true;
  const timeout = await refundAndEndPlan(await t.store(), NOW);
  world.loseAnswer = false;
  world.listDown = false;
  is("made at Stripe but the answer lost and the list unread: the stop stays", [timeout.ok, t.sub().status, t.sub().cancel_at_period_end, t.refunds().length], [false, "active", true, 1]);
  await finishPlanRefunds(Date.now() + 10_000, NOW + 3_600);
  is("the daily job finds it and ends the plan; nothing renewed in between", [t.sub().status, await t.note()], ["canceled", null]);

  const p = await paidShop();
  world.refundStatus = "pending";
  const pending = await refundAndEndPlan(await p.store(), NOW);
  is("a pending refund: said so, the plan not ended on it, the stop and the note kept", [pending.ok && pending.status, pending.ok && pending.ended, p.sub().status, p.sub().cancel_at_period_end, (await p.note()) !== null], ["pending", false, "active", true, true]);
  await finishPlanRefunds(Date.now() + 10_000, NOW + 3_600);
  is("still pending at the daily job: left as it is", [p.sub().status, (await p.note()) !== null], ["active", true]);
  p.refunds()[0].status = "succeeded";
  world.refundStatus = "succeeded";
  await finishPlanRefunds(Date.now() + 10_000, NOW + 7_200);
  is("succeeded: the daily job ends the plan", [p.sub().status, await p.note()], ["canceled", null]);

  const lost = await paidShop();
  world.loseAnswer = true;
  const lostAnswer = await refundAndEndPlan(await lost.store(), NOW);
  world.loseAnswer = false;
  is("the answer lost after Stripe made it: found by its metadata, the plan ended", [lostAnswer.ok && lostAnswer.refundId, lost.sub().status, lost.refunds().length, await lost.note()], [lost.refunds()[0]?.id, "canceled", 1, null]);

  const e = await paidShop();
  world.endDown = true;
  const notEnded = await refundAndEndPlan(await e.store(), NOW);
  world.endDown = false;
  is("refunded but not ended yet: said so, the stop and the note stay", [notEnded.ok && notEnded.ended, e.sub().cancel_at_period_end, (await e.store()).subscriptionActive, (await e.note()) !== null], [false, true, true, true]);
  const run = await finishPlanRefunds(Date.now() + 10_000, NOW + 60);
  is("the daily job ends it, once, and drops the note", [run.ended >= 1, e.sub().status, (await e.store()).subscriptionActive, await e.note(), e.refunds().length], [true, "canceled", false, null, 1]);

  part("The add-on");
  const ad = await paidShop();
  const asst = `sub_asst${n}0001`;
  world.subs.set(asst, { id: asst, customer: `cus_flow${n}0001`, status: "active", cancel_at_period_end: false, metadata: { addon: "assistant", assistant_for: `flow${n}` } });
  await setAssistantPlan((await ad.store()).email, { subscriptionId: asst, active: true, period: null, cancelsAtEnd: false, disputedAt: "" });
  world.postDownFor.add(asst);
  const withAddOn = await refundAndEndPlan(await ad.store(), NOW);
  is("the add-on could not be set to stop: the plan's ending is not done, the note stays for the daily job", [withAddOn.ok && withAddOn.ended, (await ad.note()) !== null], [false, true]);
  world.postDownFor.delete(asst);
  await finishPlanRefunds(Date.now() + 10_000, NOW + 60);
  is("the daily job sets the add-on to stop at the end of its paid month and drops the note", [world.subs.get(asst)!.cancel_at_period_end, await ad.note(), ad.refunds().length], [true, null, 1]);

  part("The daily job");
  const h = await paidShop();
  world.endDown = true;
  await refundAndEndPlan(await h.store(), NOW);
  world.endDown = false;
  await redisPipeline([["SET", flowKeyOf((await h.store()).sid), "a-request", "EX", 60]]);
  await finishPlanRefunds(Date.now() + 10_000, NOW + 60);
  is("a store a request is finishing now is left alone", [h.sub().status, (await h.note()) !== null], ["active", true]);
  await redisPipeline([["DEL", flowKeyOf((await h.store()).sid)]]);
  world.listDown = true;
  await finishPlanRefunds(Date.now() + 10_000, NOW + 60);
  is("refunds unreadable: kept for tomorrow", (await h.note()) !== null, true);
  process.env.RESEND_API_KEY = "re_a_stand_in_key_for_tests_only";
  world.emails = [];
  await finishPlanRefunds(Date.now() + 10_000, NOW + GIVE_UP_DAYS * DAY + 1);
  world.listDown = false;
  is(`undecidable for ${GIVE_UP_DAYS} days: dropped, the stop taken back`, [await h.note(), h.sub().cancel_at_period_end], [null, false]);
  is("and the creator is told the refund could not be confirmed, the plan renews as usual, how to ask again", world.emails.map((e) => [e.text.includes("We could not confirm the refund"), e.text.includes("It renews as usual unless you cancel it"), e.text.includes("Refund my payment")]), [[true, true, true]]);
  delete process.env.RESEND_API_KEY;
  await redisPipeline([["HSET", ENDING_KEY, "gone-store-id", JSON.stringify({ s: "sub_gonestore01", at: NOW, m: 1 })]]);
  await finishPlanRefunds(Date.now() + 10_000, NOW + 60);
  is("the note of a store that is gone is dropped", (await redisPipeline([["HGET", ENDING_KEY, "gone-store-id"]]))[0], null);
  is("an exhausted deadline touches nothing", await finishPlanRefunds(Date.now() - 1, NOW), { ended: 0, dropped: 0, left: 0 });
  done();
}

void main();
