/**
 * A break from the plan instead of leaving it (added 11 October 2026,
 * lib/plan-pause.ts). What is checked:
 *
 *   - who may take one: paid up, past the trial, monthly, not stopping, with
 *     no change waiting, paid for long enough, once a year;
 *   - a break sets the subscription to stop at the end of the paid period,
 *     writes down when the plan starts again and on which card, and the
 *     closing of what the store keeps waits while it runs;
 *   - taken back before it starts, the plan goes on and the year is given
 *     back; taken back after, the plan simply is not started again;
 *   - a week before the end the creator is told the date and the price,
 *     once; on the day the plan is started again on the same card, charged
 *     at once, and written down on the store;
 *   - a card the bank refuses ends the break and the creator is told; Stripe
 *     not answering is tried again the next day instead;
 *   - a store that started again by hand is left alone.
 */
import { claimHandle, setSubscription, storeForEmail, storeRef } from "@/lib/store";
import { onBreak, pauseEmail, pauseOf, pausePlan, pauseRefusal, runBreaks, undoPause } from "@/lib/plan-pause";
import { addPeriods } from "@/lib/plans";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";
import { PLAN_PRICES } from "@/lib/plan";
import { store as pauseRedis } from "./redis-stub";

process.env.STRIPE_SECRET_KEY = "sk_test_plan_pause_only";
process.env.RESEND_API_KEY = "re_test_plan_pause_only";

const DAY = 86_400;
const NOW = 1_791_700_000;
const emails: { to: string; subject: string; text: string }[] = [];
const subs: Record<string, Record<string, unknown>> = {};
const created: URLSearchParams[] = [];
let keepScheduledStop = false;
let createAnswer: "ok" | "declined" | "down" | "otherCustomer" | "otherTier" | "yearly" | "trial" | "pastDue" | "otherPrice" | "amount" | "currency" | "intervalCount" | "extraItem" | "intervalMismatch" = "ok";

function subscription(id: string, over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id,
    status: "active",
    customer: "cus_TestPause0001",
    default_payment_method: "pm_TestCard00001",
    cancel_at_period_end: false,
    start_date: NOW - 100 * DAY,
    trial_end: NOW - 86 * DAY,
    items: {
      data: [
        {
          current_period_end: NOW + 10 * DAY,
          price: { lookup_key: "nimbus_labs_creator_month", unit_amount: 2900, recurring: { interval: "month" } },
        },
      ],
    },
    ...over,
  };
}

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const method = init?.method ?? "GET";
  if (url.hostname === "api.stripe.com") {
    if (url.pathname === "/v1/prices" || url.pathname.startsWith("/v1/prices/search") || url.pathname.startsWith("/v1/products")) {
      return new Response(JSON.stringify({ data: [{ id: "price_creator_month", lookup_key: "nimbus_labs_creator_month", active: true, unit_amount: 2900, recurring: { interval: "month" } }], has_more: false, id: "price_creator_month" }), { status: 200 });
    }
    if (url.pathname === "/v1/subscriptions" && method === "POST") {
      const body = new URLSearchParams(String(init?.body ?? ""));
      created.push(body);
      if (createAnswer === "declined") return new Response(JSON.stringify({ error: { code: "card_declined", message: "Your card was declined." } }), { status: 402 });
      if (createAnswer === "down") return new Response(JSON.stringify({ error: { type: "api_error", message: "down" } }), { status: 500 });
      const freshPrice = {
        id: body.get("items[0][price]"), lookup_key: "nimbus_labs_creator_month",
        currency: "usd", unit_amount: PLAN_PRICES.creator.month,
        recurring: { interval: "month", interval_count: 1 },
      };
      if (createAnswer === "otherPrice") freshPrice.id = "price_NotRequested01";
      if (createAnswer === "amount") freshPrice.unit_amount += 1;
      if (createAnswer === "currency") freshPrice.currency = "eur";
      if (createAnswer === "intervalCount") freshPrice.recurring.interval_count = 2;
      if (createAnswer === "intervalMismatch") freshPrice.recurring.interval = "year";
      const items = [{ current_period_end: NOW + 10 * DAY, price: freshPrice }];
      if (createAnswer === "extraItem") items.push({ ...items[0] });
      const fresh = subscription("sub_Restarted00001", {
        start_date: NOW, trial_end: null,
        customer: { id: body.get("customer"), email: "x@example.com" },
        items: { data: items },
      });
      if (createAnswer === "otherCustomer") fresh.customer = { id: "cus_OtherRestart01", email: "other@example.com" };
      if (createAnswer === "otherTier" || createAnswer === "yearly") {
        fresh.items = { data: [{ current_period_end: NOW + 10 * DAY, price: {
          lookup_key: createAnswer === "otherTier" ? "nimbus_labs_pro_month" : "nimbus_labs_creator_year",
          unit_amount: createAnswer === "otherTier" ? 44900 : 69000,
          recurring: { interval: createAnswer === "yearly" ? "year" : "month" },
        } }] };
      }
      if (createAnswer === "trial") { fresh.status = "trialing"; fresh.trial_end = NOW + DAY; }
      if (createAnswer === "pastDue") fresh.status = "past_due";
      subs.sub_Restarted00001 = fresh;
      return new Response(JSON.stringify(fresh), { status: 200 });
    }
    const m = url.pathname.match(/^\/v1\/subscriptions\/(sub_[A-Za-z0-9]+)$/);
    if (m && subs[m[1]]) {
      if (method === "POST") {
        const body = new URLSearchParams(String(init?.body ?? ""));
        if (body.has("cancel_at_period_end") && !(keepScheduledStop && body.get("cancel_at_period_end") === "false")) subs[m[1]].cancel_at_period_end = body.get("cancel_at_period_end") === "true";
      }
      return new Response(JSON.stringify(subs[m[1]]), { status: 200 });
    }
    return new Response(JSON.stringify({ error: { message: `no route ${method} ${url.pathname}` } }), { status: 404 });
  }
  if (url.hostname === "api.resend.com") {
    const body = JSON.parse(String(init?.body ?? "{}"));
    emails.push({ to: Array.isArray(body.to) ? body.to[0] : body.to, subject: body.subject, text: body.text });
    return new Response(JSON.stringify({ id: "re_1" }), { status: 200 });
  }
  return new Response("{}", { status: 404 });
}) as typeof fetch;

async function storeWith(email: string, handle: string, sub: string) {
  await claimHandle(email, handle, "A store", "");
  await setSubscription(email, { customerId: "cus_TestPause0001", subscriptionId: sub, active: true, tier: "creator", cycle: "month" });
  return (await storeForEmail(email))!;
}

async function main() {
  part("Who may take a break");
  {
    is("a monthly plan paid for months, never paused", pauseRefusal(subscription("sub_a"), NOW, false), null);
    is("not in the trial", pauseRefusal(subscription("sub_a", { status: "trialing", trial_end: NOW + DAY }), NOW, false), "trial");
    is("not a yearly plan", pauseRefusal(subscription("sub_a", { items: { data: [{ current_period_end: NOW + DAY, price: { lookup_key: "nimbus_labs_creator_year", unit_amount: 30000, recurring: { interval: "year" } } }] } }), NOW, false), "yearly");
    is("not one set to stop", pauseRefusal(subscription("sub_a", { cancel_at_period_end: true }), NOW, false), "canceling");
    is("not with a change waiting", pauseRefusal(subscription("sub_a", { pending_update: { expires_at: NOW + DAY } }), NOW, false), "pending");
    is("not one behind on paying", pauseRefusal(subscription("sub_a", { status: "past_due" }), NOW, false), "standing");
    // One month paid: the trial ended 20 days ago, so only the first charge went through.
    is("not before two months are paid", pauseRefusal(subscription("sub_a", { trial_end: NOW - 20 * DAY, start_date: NOW - 34 * DAY }), NOW, false), "early");
    // Exactly at the second charge.
    const first = NOW - 31 * DAY;
    is("from the second charge on", pauseRefusal(subscription("sub_a", { trial_end: first, start_date: first - 14 * DAY }), addPeriods(first, "month", 1), false), null);
    is("not twice in a year", pauseRefusal(subscription("sub_a"), NOW, true), "recent");
  }

  part("Taking a break");
  {
    subs.sub_Pause0000001 = subscription("sub_Pause0000001");
    const store = await storeWith("pause@example.com", "pausestore", "sub_Pause0000001");
    const result = await pausePlan(store, 2, NOW);
    is("it is set", result.kind, "paused");
    is("the subscription stops at the end of the paid period", subs.sub_Pause0000001.cancel_at_period_end, true);
    const record = await pauseOf(store);
    is("from the end of the paid period", record?.from, NOW + 10 * DAY);
    is("to two months after", record?.until, addPeriods(NOW + 10 * DAY, "month", 2));
    is("on the card the plan is paid with", record?.paymentMethod, "pm_TestCard00001");
    is("the closing waits while it runs", await onBreak(storeRef(store), NOW + 20 * DAY), true);
    is("and not after it", await onBreak(storeRef(store), (record?.until ?? 0) + 1), false);

    const again = await pausePlan(store, 1, NOW);
    is("a second break the same year is refused", again.kind === "refused" ? again.reason : again.kind, "canceling");

    const undone = await undoPause(store, NOW + DAY);
    is("taken back before it starts, the plan goes on", undone, "kept");
    is("the subscription no longer stops", subs.sub_Pause0000001.cancel_at_period_end, false);
    is("and nothing is left set", await pauseOf(store), null);
    const third = await pausePlan(store, 1, NOW + DAY);
    is("the year is given back for a break that never began", third.kind, "paused");
    // Taken back again, so this store's break does not end beside the next part's.
    await undoPause(store, NOW + DAY);
  }

  part("Taking a break back requires acknowledgement of the removed stop");
  {
    const id = "sub_UndoAck00001";
    subs[id] = subscription(id);
    const store = await storeWith("undo-ack@example.com", "undoackstore", id);
    const set = await pausePlan(store, 1, NOW);
    is("the break is available to take back", set.kind, "paused");
    const before = await pauseOf(store);
    keepScheduledStop = true;
    let refused = false;
    try { await undoPause(store, NOW + DAY); } catch { refused = true; }
    keepScheduledStop = false;
    is("an unchanged scheduled stop is not reported as kept", refused, true);
    is("the original pause is retained exactly", await pauseOf(store), before);
    is("the provider still plans to stop it", subs[id].cancel_at_period_end, true);
    is("a later acknowledged undo still works", await undoPause(store, NOW + DAY), "kept");
    is("the pause is removed only after acknowledgement", await pauseOf(store), null);
    is("the provider no longer plans to stop it", subs[id].cancel_at_period_end, false);
  }

  part("The emails say the dates and the price");
  {
    const record = { subscription: "sub_x", customer: "cus_x", paymentMethod: "pm_x", tier: "creator" as const, from: NOW, until: NOW + 61 * DAY, told: 0 };
    const set = pauseEmail("set", record);
    is("set: when the checkout closes and when it opens", set.text.includes("Your store keeps taking payments until") && set.text.includes("starts again by itself, at $69 a month"), true);
    const soon = pauseEmail("soon", record);
    is("a week before: the charge and how to stop it", soon.text.includes("your card is charged $69") && soon.text.includes("one click"), true);
    const failed = pauseEmail("failed", record);
    is("failed: a card refusal does not rule out an earlier charge", failed.text.includes("Nothing was charged."), false);
    is("failed: distinguishes the latest refusal from earlier attempts", failed.text.includes("latest attempt was refused") && failed.text.includes("does not confirm the outcome of any earlier attempt"), true);
    is("failed: asks for billing review before another charge", failed.text.includes("Check your billing in the studio before starting the plan again") && failed.text.includes("do not send card details"), true);
  }

  part("The end of a break");
  {
    subs.sub_Restart00001 = subscription("sub_Restart00001");
    const store = await storeWith("restart@example.com", "restartstore", "sub_Restart00001");
    const set = await pausePlan(store, 1, NOW);
    const until = set.kind === "paused" ? set.record.until : 0;
    // The paid period ends: the store's plan has ended, as cancelling leaves it.
    await setSubscription("restart@example.com", { active: false });

    emails.length = 0;
    await runBreaks(until - 10 * DAY);
    is("nothing yet ten days before", emails.length, 0);
    await runBreaks(until - 6 * DAY);
    is("told a week before", emails.map((e) => e.subject), ["Your Marktmorgen plan starts again on " + new Date(until * 1000).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" })]);
    await runBreaks(until - 5 * DAY);
    is("once", emails.length, 1);

    const counts = await runBreaks(until + 60);
    is("started again on the day", counts.restarted, 1);
    is("on the same customer and card, charged at once", [created[0].get("customer"), created[0].get("default_payment_method"), created[0].get("payment_behavior"), created[0].get("off_session")], ["cus_TestPause0001", "pm_TestCard00001", "error_if_incomplete", "true"]);
    const after = await storeForEmail("restart@example.com");
    is("written down on the store", [after?.subscriptionActive, after?.subscriptionId], [true, "sub_Restarted00001"]);
    is("the creator is told", emails[emails.length - 1]?.subject, "Your Marktmorgen plan has started again");
    is("and the break is gone", await pauseOf(after!), null);
  }

  part("When the card is refused, or Stripe does not answer");
  {
    subs.sub_Decline00001 = subscription("sub_Decline00001");
    const store = await storeWith("decline@example.com", "declinestore", "sub_Decline00001");
    const set = await pausePlan(store, 1, NOW);
    const until = set.kind === "paused" ? set.record.until : 0;
    await setSubscription("decline@example.com", { active: false });

    createAnswer = "down";
    await runBreaks(until + 60);
    is("Stripe not answering keeps the break, for the next day", (await pauseOf(store)) !== null, true);
    createAnswer = "declined";
    emails.length = 0;
    const counts = await runBreaks(until + DAY);
    is("a refused card ends the break", [counts.failed, await pauseOf(store)], [1, null]);
    is("and the creator is told", emails.map((e) => e.subject), ["Your Marktmorgen plan could not start again"]);
    const notice = emails[0]?.text ?? "";
    is("a refusal after an unknown attempt never promises no charge", notice.includes("Nothing was charged."), false);
    is("earlier uncertainty remains explicit after the later refusal", notice.includes("does not confirm the outcome of any earlier attempt") && notice.includes("contact us before trying again"), true);
    is("the store does not sell", (await storeForEmail("decline@example.com"))?.subscriptionActive, false);
    createAnswer = "ok";
  }

  part("An unknown provider outcome never promises that nothing was charged");
  {
    subs.sub_Unknown00001 = subscription("sub_Unknown00001");
    const store = await storeWith("unknown@example.com", "unknownrestart", "sub_Unknown00001");
    const set = await pausePlan(store, 1, NOW);
    const until = set.kind === "paused" ? set.record.until : 0;
    await setSubscription("unknown@example.com", { active: false });
    createAnswer = "down";
    emails.length = 0;
    const counts = await runBreaks(until + 4 * DAY);
    is("the existing retry horizon still ends", counts.failed, 1);
    is("unknown outcome has its own truthful notice", emails.map((e) => e.subject), ["Your Marktmorgen plan restart needs a check"]);
    const text = emails[0]?.text ?? "";
    is("it does not claim that no charge occurred", text.includes("Nothing was charged."), false);
    is("it states uncertainty and asks for checking before another restart", text.includes("whether a charge went through") && text.includes("Before starting the plan again, contact us") && text.includes("do not send card details"), true);
    is("it does not claim the plan is taking payments", text.includes("your checkout is taking payments"), false);
    createAnswer = "ok";
  }

  part("A restart response must match the requested paid monthly plan");
  {
    const mismatches = ["otherCustomer", "otherTier", "yearly", "trial", "pastDue", "otherPrice", "amount", "currency", "intervalCount", "extraItem", "intervalMismatch"] as const;
    for (const [index, answer] of mismatches.entries()) {
      const id = `sub_Mismatch0000${index}`;
      const email = `restart-mismatch-${index}@example.com`;
      subs[id] = subscription(id);
      const store = await storeWith(email, `restartmismatch${index}`, id);
      const set = await pausePlan(store, 1, NOW);
      const until = set.kind === "paused" ? set.record.until : 0;
      await setSubscription(email, { active: false });
      createAnswer = answer;
      emails.length = 0;
      const before = created.length;
      const counts = await runBreaks(until + 60);
      const after = await storeForEmail(email);
      is(`${answer}: observed response does not activate the store`, [counts.restarted, counts.failed, after?.subscriptionActive], [0, 1, false]);
      is(`${answer}: no success or no-charge message`, emails.length, 0);
      is(`${answer}: pause remains for existing uncertain-outcome handling`, (await pauseOf(store)) !== null, true);
      is(`${answer}: no additional provider attempt in this pass`, created.length - before, 1);
      await undoPause(store, until + 60);
    }
    createAnswer = "ok";
  }

  part("Unreadable pause evidence is retained without attempting a charge");
  {
    const email = "unreadable-pause@example.com";
    const id = "sub_Unreadable001";
    subs[id] = subscription(id);
    const store = await storeWith(email, "unreadablepause", id);
    const set = await pausePlan(store, 1, NOW);
    const until = set.kind === "paused" ? set.record.until : 0;
    await setSubscription(email, { active: false });
    const ref = storeRef(store);
    const key = `nl:pause:${ref}`;
    const good = set.kind === "paused" ? set.record : {};
    for (const raw of [
      "{", "null", JSON.stringify({ subscription: "sub_InvalidRecord" }),
      JSON.stringify({ ...good, from: -1 }),
      JSON.stringify({ ...good, until: until + 0.5 }),
      JSON.stringify({ ...good, until: Number.MAX_SAFE_INTEGER + 1 }),
      JSON.stringify({ ...good, paymentMethod: "not_a_card" }),
      JSON.stringify({ ...good, told: -1 }),
      JSON.stringify({ ...good, told: "unknown" }),
    ]) {
      await pauseRedis.pipeline([["SET", key, raw]]);
      const before = created.length;
      emails.length = 0;
      const counts = await runBreaks(until + DAY);
      const [retained, due] = await pauseRedis.pipeline([
        ["GET", key],
        ["ZRANGEBYSCORE", "nl:pause:due", "-inf", String(until + DAY)],
      ]);
      is("unreadable evidence is not treated as a missing pause", [counts.failed, counts.dropped, counts.restarted], [1, 0, 0]);
      is("the exact stored evidence remains", retained, raw);
      is("unreadable pause evidence makes closing wait", await onBreak(ref, until + DAY), true);
      is("the pending entry remains available for reconciliation", Array.isArray(due) && due.includes(ref), true);
      is("no provider charge or notice follows unreadable evidence", [created.length - before, emails.length], [0, 0]);
    }
    // An explicit Redis miss remains ordinary stale-index cleanup.
    await pauseRedis.pipeline([["DEL", key]]);
    const before = created.length;
    emails.length = 0;
    const missing = await runBreaks(until + DAY);
    const [due] = await pauseRedis.pipeline([["ZRANGEBYSCORE", "nl:pause:due", "-inf", String(until + DAY)]]);
    is("an explicit missing record is still dropped", [missing.dropped, missing.failed, missing.restarted], [1, 0, 0]);
    is("its stale due entry is removed", Array.isArray(due) && due.includes(ref), false);
    is("absence never initiates a charge or notice", [created.length - before, emails.length], [0, 0]);
    is("explicit absence does not indefinitely hold closing", await onBreak(ref, until + DAY), false);
    const pipeline = pauseRedis.pipeline;
    pauseRedis.pipeline = async () => { throw new Error("synthetic pause read unavailable"); };
    try {
      is("unavailable pause evidence also makes closing wait", await onBreak(ref, until + DAY), true);
    } finally {
      pauseRedis.pipeline = pipeline;
    }
  }

  part("A store that started again by hand");
  {
    subs.sub_ByHand000001 = subscription("sub_ByHand000001");
    const store = await storeWith("byhand@example.com", "byhandstore", "sub_ByHand000001");
    const set = await pausePlan(store, 1, NOW);
    const until = set.kind === "paused" ? set.record.until : 0;
    await setSubscription("byhand@example.com", { subscriptionId: "sub_OtherOne00001", active: true, period: paidPeriod() });
    const before = created.length;
    const counts = await runBreaks(until + 60);
    is("is left alone", [counts.dropped, created.length - before], [1, 0]);
  }

  done();
}

main();
