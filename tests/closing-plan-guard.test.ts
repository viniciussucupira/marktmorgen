/**
 * A plan paid for a store whose closing day has begun (queue item 307
 * [EC1], held to item 569 [NC1]), against a stand-in for our own Stripe
 * account and the email sender. Nothing real is reached.
 *
 * What fails here:
 *   - a plan finished during the closing day that is written down as the
 *     store's, or left running, or not refunded in full;
 *   - a retry of the way back, of the daily sync or of the closing job that
 *     refunds twice or tells the creator twice;
 *   - a refund that failed (an error, or one the bank turned down) that is
 *     not tried again, or that is dropped from the line;
 *   - a payment made before the day began that is refunded;
 *   - an open plan checkout of the store left open when the day starts, or
 *     another store's expired with it;
 *   - a store whose records are gone that is no longer recognized.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { claimHandle, setSubscription, storeForEmail, storeRef } from "@/lib/store";
import { FINAL_INDEX } from "@/lib/closing-holds";
import { UNDO_KEY, expirePlanCheckouts, markShut, planReturnedLetter, refusePlanIfClosing, refuseSession, retryPlanUndos } from "@/lib/closing-plan-guard";
import { syncSubscriptions } from "@/lib/billing-sync";
import { redisPipeline } from "@/lib/redis";

const S = (ms: number) => Math.floor(ms / 1000);
const DAY = 86_400_000;

type PlanSub = { id: string; status: string; customer: string; metadata: Record<string, string>; created: number };
type Invoice = { id: string; subscription: string; status: string; amount_paid: number; payment_intent: string; created: number; paid_at: number };
type Refund = { id: string; object: "refund"; charge: string; payment_intent: string; amount: number; status: string; currency: string; key: string };

const world = {
  subs: new Map<string, PlanSub>(),
  invoices: [] as Invoice[],
  charges: new Map<string, { amount: number; disputed: boolean }>(),
  refunds: [] as Refund[],
  sessions: [] as Record<string, unknown>[],
  customers: new Map<string, string>(),
  /** Refund requests answered with a server error. */
  refundErrors: 0,
  /** Refunds the bank turns down (status failed). */
  refundsTurnedDown: 0,
  /** What Stripe answered to each idempotency key, as Stripe replays it. */
  replies: new Map<string, string>(),
  expired: [] as string[],
};
const sent: { to: string; subject: string; text: string }[] = [];

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input instanceof Request ? input.url : input));
  const method = init?.method ?? "GET";
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
  if (url.hostname === "api.resend.com") {
    const body = JSON.parse(String(init?.body)) as { to: string | string[]; subject: string; text?: string };
    sent.push({ to: [body.to].flat()[0], subject: body.subject, text: body.text ?? "" });
    return json({ id: `email_${sent.length}` });
  }
  if (url.hostname !== "api.stripe.com") return new Response(null, { status: 404 });
  const headers = new Headers(init?.headers);
  if (headers.get("stripe-account")) return json({ error: { message: "only our own account here" } }, 400);
  const key = headers.get("idempotency-key");
  if (key && method === "POST" && world.replies.has(key)) return new Response(world.replies.get(key), { status: 200, headers: { "content-type": "application/json" } });
  const remember = (data: unknown) => {
    if (key && method === "POST") world.replies.set(key, JSON.stringify(data));
    return json(data);
  };
  const path = url.pathname.replace(/^\/v1/, "");
  const form = new URLSearchParams(String(init?.body ?? ""));

  const sub = path.match(/^\/subscriptions\/(sub_\w+)$/);
  if (sub) {
    const row = world.subs.get(sub[1]);
    if (!row) return json({ error: { message: "No such subscription" } }, 404);
    if (method === "DELETE") {
      if (row.status === "canceled") return json({ error: { code: "resource_missing", message: "already canceled" } }, 400);
      row.status = "canceled";
    }
    return json({ ...row, items: { data: [] } });
  }
  if (path === "/subscriptions" && method === "GET") {
    const data = [...world.subs.values()].map((row) => ({ ...row, customer: { id: row.customer, email: world.customers.get(row.customer) ?? "" }, items: { data: [] } }));
    return json({ object: "list", data, has_more: false });
  }
  if (path === "/subscriptions/search") return json({ object: "search_result", data: [], has_more: false, next_page: null });
  if (path === "/invoices" && method === "GET") {
    const data = world.invoices.filter((row) => row.subscription === url.searchParams.get("subscription")).map((row) => ({ ...row, status_transitions: { paid_at: row.paid_at || null } }));
    return json({ object: "list", data, has_more: false });
  }
  const voided = path.match(/^\/invoices\/(in_\w+)\/void$/);
  if (voided) {
    const row = world.invoices.find((invoice) => invoice.id === voided[1]);
    if (row) row.status = "void";
    return remember({ id: voided[1], status: "void" });
  }
  const intent = path.match(/^\/payment_intents\/(pi_\w+)$/);
  if (intent) {
    const charge = world.charges.get(intent[1]);
    if (!charge) return json({ error: { message: "No such payment_intent" } }, 404);
    return json({ id: intent[1], latest_charge: { id: `ch_${intent[1].slice(3)}`, currency: "usd", amount: charge.amount, disputed: charge.disputed } });
  }
  if (path === "/refunds" && method === "GET") return json({ object: "list", data: world.refunds.filter((row) => row.charge === url.searchParams.get("charge")), has_more: false });
  if (path === "/refunds" && method === "POST") {
    if (world.refundErrors > 0) {
      world.refundErrors -= 1;
      return json({ error: { type: "api_error", message: "a stand-in failure" } }, 500);
    }
    const pi = String(form.get("payment_intent"));
    const status = world.refundsTurnedDown > 0 ? "failed" : "succeeded";
    if (status === "failed") world.refundsTurnedDown -= 1;
    const refund: Refund = { id: `re_${String(world.refunds.length + 1).padStart(8, "0")}`, object: "refund", charge: `ch_${pi.slice(3)}`, payment_intent: pi, amount: Number(form.get("amount")), status, currency: "usd", key: key ?? "" };
    world.refunds.push(refund);
    return remember(refund);
  }
  const customer = path.match(/^\/customers\/(cus_\w+)$/);
  if (customer) return json({ id: customer[1], email: world.customers.get(customer[1]) ?? null });
  if (path === "/checkout/sessions" && method === "GET") {
    const data = world.sessions.filter((row) => row.status === (url.searchParams.get("status") ?? row.status) && row.customer === url.searchParams.get("customer"));
    return json({ object: "list", data, has_more: false });
  }
  const session = path.match(/^\/checkout\/sessions\/(cs_\w+)(\/expire)?$/);
  if (session) {
    const row = world.sessions.find((one) => one.id === session[1]);
    if (!row) return json({ error: { message: "No such checkout session" } }, 404);
    if (session[2]) {
      if (row.status !== "open") return json({ error: { message: "Only Checkout Sessions with a status of open can be expired." } }, 400);
      row.status = "expired";
      world.expired.push(String(row.id));
      return remember(row);
    }
    return json(row);
  }
  return json({ error: { message: `no stand-in for ${method} ${path}` } }, 404);
}) as typeof fetch;

/** A store whose plan ended, in its closing day since `day`, with a plan checkout finished on that day and paid. */
async function closingStore(handle: string, day: number, amount = 6_900) {
  const email = `${handle}@example.com`;
  const customer = `cus_${handle}0001`;
  await claimHandle(email, handle, `${handle[0].toUpperCase()}${handle.slice(1)} Shop`, "");
  await setSubscription(email, { customerId: customer, subscriptionId: `sub_${handle}old001`, active: true, tier: "creator", cycle: "month", trialEnds: 0 });
  await setSubscription(email, { active: false });
  world.customers.set(customer, email);
  await redisPipeline([["ZADD", FINAL_INDEX, day - 30 * DAY, storeRef((await storeForEmail(email))!)]]);
  await markShut((await storeForEmail(email))!, day);
  const id = `sub_${handle}late01`;
  world.subs.set(id, { id, status: "active", customer, metadata: { store: handle, tier: "creator" }, created: S(day) - 3_600 });
  const pi = `pi_${handle}late01`;
  world.invoices.push({ id: `in_${handle}late01`, subscription: id, status: "paid", amount_paid: amount, payment_intent: pi, created: S(day) - 3_600, paid_at: S(day) + 600 });
  world.charges.set(pi, { amount, disputed: false });
  world.sessions.push({ id: `cs_test_${handle}late0001`, status: "complete", mode: "subscription", customer, subscription: id, metadata: { store: handle } });
  return { email, id, pi, customer };
}

const refundsOf = (pi: string) => world.refunds.filter((row) => row.payment_intent === pi);
const undo = async (id: string) => {
  const [raw] = await redisPipeline([["HGET", UNDO_KEY, id]]);
  return typeof raw === "string" ? (JSON.parse(raw) as { n: number; done?: number; to: string }) : null;
};

async function main() {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_a_stand_in_key_for_tests_only";
  process.env.RESEND_API_KEY = "re_test_a_stand_in_key_for_tests_only";
  const day = Date.UTC(2026, 11, 2);

  part("The race: a plan checkout opened before the closing day and finished on it");
  const rosa = await closingStore("rosa", day);
  const back = await refuseSession((await storeForEmail(rosa.email))!, "cs_test_rosalate0001");
  is("the way back ends it and returns the payment at once", back, "returned");
  is("the subscription is canceled at Stripe", world.subs.get(rosa.id)?.status, "canceled");
  is("the payment is refunded in full, once", refundsOf(rosa.pi).map((row) => [row.amount, row.status]), [[6_900, "succeeded"]]);
  is("the plan is never written down as the store's", [(await storeForEmail(rosa.email))?.subscriptionActive, (await storeForEmail(rosa.email))?.subscriptionId], [false, "sub_rosaold001"]);
  const told = sent.filter((m) => m.to === rosa.email);
  is("the creator is told once, honestly, that the store had closed and the payment was returned", [told.length, told[0]?.subject, told[0]?.text.includes("had already begun closing"), told[0]?.text.includes("$69 in full"), told[0]?.text.includes("Nothing else will be charged")], [1, "Rosa Shop: your plan payment was returned", true, true, true]);
  is("settled, it keeps only its dates", [(await undo(rosa.id))?.to, Boolean((await undo(rosa.id))?.done)], ["", true]);

  part("Retries: the way back twice, the daily sync and the closing job");
  is("the way back again changes nothing", await refuseSession((await storeForEmail(rosa.email))!, "cs_test_rosalate0001"), "returned");
  is("asked again directly, the same", await refusePlanIfClosing({ store: (await storeForEmail(rosa.email))!, handle: "rosa", subscriptionId: rosa.id, customerId: rosa.customer }), "returned");
  await retryPlanUndos(Date.now() + 10_000);
  is("still one refund and one letter", [refundsOf(rosa.pi).length, sent.filter((m) => m.to === rosa.email).length], [1, 1]);

  part("A refund the bank sends back after it was settled");
  refundsOf(rosa.pi)[0].status = "failed";
  await retryPlanUndos(Date.now() + 10_000);
  is("the next run makes it again, under a new key, and does not write again", [refundsOf(rosa.pi).map((row) => row.status), new Set(refundsOf(rosa.pi).map((row) => row.key)).size, sent.filter((m) => m.to === rosa.email).length], [["failed", "succeeded"], 2, 1]);
  await retryPlanUndos(Date.now() + 10_000);
  is("and once it went through, nothing more", refundsOf(rosa.pi).length, 2);

  part("The daily sync finds a plan paid during the closing day before the way back did");
  const tina = await closingStore("tina", day);
  const synced = await syncSubscriptions(Date.now() + 10_000);
  is("it is not adopted", [synced.adopted, (await storeForEmail(tina.email))?.subscriptionActive], [0, false]);
  is("it is ended and refunded in full, and the creator told", [world.subs.get(tina.id)?.status, refundsOf(tina.pi).map((row) => row.amount), sent.filter((m) => m.to === tina.email).length], ["canceled", [6_900], 1]);
  await syncSubscriptions(Date.now() + 10_000);
  is("a second sync refunds nothing more", [refundsOf(tina.pi).length, sent.filter((m) => m.to === tina.email).length], [1, 1]);

  part("A refund that fails is tried again on every run, and never dropped");
  const sara = await closingStore("sara", day, 69_000);
  world.refundErrors = 2;
  is("Stripe failing to refund leaves it in line, not settled", await refuseSession((await storeForEmail(sara.email))!, "cs_test_saralate0001"), "returning");
  is("ended already, nothing refunded, nobody told yet", [world.subs.get(sara.id)?.status, refundsOf(sara.pi).length, sent.filter((m) => m.to === sara.email).length], ["canceled", 0, 0]);
  is("in line, with the failed run counted", (await undo(sara.id))?.n, 1);
  let run = await retryPlanUndos(Date.now() + 10_000);
  is("the next run fails too and keeps it", [run.left, (await undo(sara.id))?.n, Boolean((await undo(sara.id))?.done)], [1, 2, false]);
  run = await retryPlanUndos(Date.now() + 10_000);
  is("the run after refunds it in full, once, and tells the creator", [run.settled, refundsOf(sara.pi).map((row) => row.amount), sent.filter((m) => m.to === sara.email).length], [1, [69_000], 1]);

  const lena = await closingStore("lena", day);
  world.refundsTurnedDown = 1;
  is("a refund the bank turns down is not taken as returned", await refusePlanIfClosing({ store: (await storeForEmail(lena.email))!, handle: "lena", subscriptionId: lena.id, customerId: lena.customer }), "returning");
  run = await retryPlanUndos(Date.now() + 10_000);
  const lenaRefunds = refundsOf(lena.pi);
  is("the next run makes it again under a new key, and it goes through", [lenaRefunds.map((row) => row.status), new Set(lenaRefunds.map((row) => row.key)).size, run.settled], [["failed", "succeeded"], 2, 1]);
  is("the creator is told once, with the amount that came back", [sent.filter((m) => m.to === lena.email).length, sent.find((m) => m.to === lena.email)?.text.includes("$69 in full")], [1, true]);

  part("Only what was paid since the day began");
  const nora = await closingStore("nora", day);
  world.invoices.push({ id: "in_noraearly1", subscription: nora.id, status: "paid", amount_paid: 6_900, payment_intent: "pi_noraearly1", created: S(day) - 40 * 86_400, paid_at: S(day) - 40 * 86_400 });
  world.charges.set("pi_noraearly1", { amount: 6_900, disputed: false });
  world.invoices.push({ id: "in_noraopen01", subscription: nora.id, status: "open", amount_paid: 0, payment_intent: "", created: S(day) + 60, paid_at: 0 });
  await refusePlanIfClosing({ store: (await storeForEmail(nora.email))!, handle: "nora", subscriptionId: nora.id, customerId: nora.customer });
  is("a payment from before the day is not refunded; the one on it is", [refundsOf("pi_noraearly1").length, refundsOf(nora.pi).length], [0, 1]);
  is("an open invoice of it is voided, so it is never collected", world.invoices.find((row) => row.id === "in_noraopen01")?.status, "void");

  part("Not closing: nothing is touched");
  const owen = `owen@example.com`;
  await claimHandle(owen, "owen", "Owen Shop", "");
  world.subs.set("sub_owenplan01", { id: "sub_owenplan01", status: "active", customer: "cus_owen0001", metadata: { store: "owen" }, created: S(day) });
  is("a store with a running plan is not in a closing day", await refusePlanIfClosing({ store: (await storeForEmail(owen))!, handle: "owen", subscriptionId: "sub_owenplan01", customerId: "cus_owen0001" }), "no");
  is("and its plan runs", world.subs.get("sub_owenplan01")?.status, "active");

  part("A store whose records are gone is still known by its marked address");
  const gone = { handle: "gone-shop", previousHandles: [], releasedHandles: [] };
  await markShut(gone, day);
  world.customers.set("cus_gone0001", "gone@example.com");
  world.subs.set("sub_gonelate01", { id: "sub_gonelate01", status: "active", customer: "cus_gone0001", metadata: { store: "gone-shop" }, created: S(day) });
  world.invoices.push({ id: "in_gonelate01", subscription: "sub_gonelate01", status: "paid", amount_paid: 6_900, payment_intent: "pi_gonelate01", created: S(day) + 60, paid_at: S(day) + 60 });
  world.charges.set("pi_gonelate01", { amount: 6_900, disputed: false });
  is("ended and returned, the creator told at the customer's address", [await refusePlanIfClosing({ store: null, handle: "gone-shop", subscriptionId: "sub_gonelate01", customerId: "cus_gone0001" }), refundsOf("pi_gonelate01").length, sent.filter((m) => m.to === "gone@example.com").length], ["returned", 1, 1]);
  is("an address never marked is left alone", await refusePlanIfClosing({ store: null, handle: "never-closed", subscriptionId: "sub_neverclosed1", customerId: "cus_never0001" }), "no");

  part("When the day starts, the store's open plan checkouts are expired");
  world.sessions.push(
    { id: "cs_test_rosaopen00001", status: "open", mode: "subscription", customer: rosa.customer, metadata: { store: "rosa" } },
    { id: "cs_test_rosaother0001", status: "open", mode: "subscription", customer: rosa.customer, metadata: { store: "rosa-two" } },
    { id: "cs_test_rosaaddon0001", status: "open", mode: "payment", customer: rosa.customer, metadata: { store: "rosa" } },
  );
  const expired = await expirePlanCheckouts((await storeForEmail(rosa.email))!, [rosa.customer]);
  is("only its own open plan checkout is expired", [expired, world.expired], [1, ["cs_test_rosaopen00001"]]);
  is("another store's checkout is not this store's to refuse or expire", [await refuseSession((await storeForEmail(rosa.email))!, "cs_test_rosaother0001"), world.expired.length], ["no", 1]);
  world.sessions.push({ id: "cs_test_rosaopen00002", status: "open", mode: "subscription", customer: rosa.customer, metadata: { store: "rosa" } });
  is("one of its own still open when met on the way back is expired there", [await refuseSession((await storeForEmail(rosa.email))!, "cs_test_rosaopen00002"), world.expired.at(-1)], ["no", "cs_test_rosaopen00002"]);

  part("Where it is wired");
  const route = readFileSync(join(process.cwd(), "app/api/billing/return/route.ts"), "utf8");
  is("the way back asks before it reads what the checkout made", route.indexOf("refuseSession(store, sessionId)") > 0 && route.indexOf("refuseSession(store, sessionId)") < route.indexOf("readStartedSubscription(store, sessionId)"), true);
  const closing = readFileSync(join(process.cwd(), "lib/plan-closing.ts"), "utf8");
  is("the closing day expires the checkouts right after it is entered, and each later run looks for a late plan", [closing.indexOf("expirePlanCheckouts(store") > closing.indexOf('["ZADD", FINAL_INDEX, endedAt, key]'), closing.includes("await refuseLatePlans(store);")], [true, true]);
  is("the closing job tries the line again on every run", readFileSync(join(process.cwd(), "app/api/cron/closing/route.ts"), "utf8").includes("retryPlanUndos("), true);
  is("the letter with nothing paid says so", planReturnedLetter("Kim Shop", 0, 0, "usd").text.includes("No payment was taken for it."), true);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
