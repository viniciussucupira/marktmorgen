/**
 * A store closing fairly for the people who bought from it (queue item 307
 * [EC1], lib/closing-buyers-rules.ts), against stand-ins for Stripe (the
 * creator's account and ours) and the email sender. Nothing real is reached.
 *
 * What fails here:
 *   - a member charged between the end of the plan and the closing;
 *   - a membership still running after the closing;
 *   - an unused amount that is not the proportional one;
 *   - a refund made twice (twice pressed, pressed then the closing day, or
 *     after the creator refunded at Stripe);
 *   - a buyer not told at least seven days before the closing;
 *   - a store started again that is charged for the days between, keeps its
 *     members held, or refunds anyone;
 *   - a hold that failed and was not tried again, or a notice that went out
 *     before the hold was in place;
 *   - a refund the creator's balance did not cover that was made anyway, or
 *     whose member was not told;
 *   - an email past the closing's cap, or a store that closes while its
 *     buyers could not be told (no company postal address).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { claimHandle, setStripeAccount, setSubscription, storeFolder, storeForEmail } from "@/lib/store";
import { type Hands, closeOne, closingOf, closingLetter } from "@/lib/plan-closing";
import { CLOSING_DAYS, WARN_MONTH_DAYS, WARN_WEEK_DAYS } from "@/lib/plan-closing-rules";
import {
  BUYER_NOTICE_DAYS,
  CLOSING_ACCESS_SENTENCE,
  EMAILS_PER_BUYER_PER_ENDING,
  buyerNoticeCap,
  holdBody,
  releaseBody,
  stillToGive,
  unusedOf,
} from "@/lib/closing-buyers-rules";
import { HELD_INDEX, paidPeriods, releaseRestarted } from "@/lib/closing-holds";
import { creditKey } from "@/lib/closing-credit";
import { tellStaysOpen } from "@/lib/closing-buyers";
import { giveBackUnused, reviewMark, unusedRows } from "@/lib/closing-refunds";
import { companyPostal } from "@/lib/company-postal";

const DAY = 86_400_000;
const S = (ms: number) => Math.floor(ms / 1000);
const POSTAL = "100 Example Street, Example City, NY 10001, United States";

// ------------------------------------------------------------------ Stripe, the creator's account

type Sub = Record<string, unknown> & { id: string; status: string; metadata: Record<string, string>; pause_collection: { behavior: string; resumes_at?: number } | null; pe: number; amount: number };
type Charge = { amount: number; amount_refunded: number; disputed: boolean };

const world = {
  subs: new Map<string, Sub>(),
  sessions: [] as Record<string, unknown>[],
  charges: new Map<string, Charge>(),
  refunds: [] as { id: string; payment_intent: string; amount: number; status: string; metadata: Record<string, string> }[],
  balance: 1_000_000,
  /** Payments taken from members, by subscription: what must never happen while held. */
  charged: [] as { sub: string; at: number }[],
  failHolds: 0,
  writes: [] as { method: string; path: string; body: string }[],
};

function subscriptionOf(sub: Sub) {
  return {
    ...sub,
    customer: { id: `cus_${sub.id.slice(4)}`, email: `${sub.id.slice(4)}@buyers.example.com` },
    latest_invoice: { id: `in_${sub.id.slice(4)}`, status: "paid", amount_paid: sub.amount, currency: "usd", lines: { data: [{ period: { start: sub.pe - (sub.metadata.yearly ? 365 : 30) * 86_400, end: sub.pe } }] } },
  };
}

/** Stripe renews every membership whose period is over by `at`: one with collection paused gets a voided invoice, any other is charged. */
function renewUntil(at: number) {
  for (const sub of world.subs.values()) {
    while (["active", "trialing", "past_due"].includes(sub.status) && sub.pe <= S(at)) {
      const paused = sub.pause_collection && !(sub.pause_collection.resumes_at && sub.pause_collection.resumes_at <= sub.pe);
      if (!paused) world.charged.push({ sub: sub.id, at: sub.pe });
      sub.pe += (sub.metadata.yearly ? 365 : 30) * 86_400;
    }
  }
}

const sent: { to: string; subject: string; text: string; html?: string; reply_to?: string }[] = [];

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input instanceof Request ? input.url : input));
  const method = init?.method ?? "GET";
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
  if (url.hostname === "api.resend.com") {
    type One = { to: string | string[]; subject: string; text?: string; html?: string; reply_to?: string };
    const body = JSON.parse(String(init?.body)) as One | One[];
    for (const m of Array.isArray(body) ? body : [body]) sent.push({ to: [m.to].flat()[0], subject: m.subject, text: m.text ?? "", html: m.html, reply_to: m.reply_to });
    return json(Array.isArray(body) ? { data: body.map((_, i) => ({ id: `email_${i}` })) } : { id: `email_${sent.length}` });
  }
  if (url.hostname !== "api.stripe.com") return new Response(null, { status: 404 });
  const account = new Headers(init?.headers).get("stripe-account") ?? "";
  const path = url.pathname.replace(/^\/v1/, "");
  const form = new URLSearchParams(String(init?.body ?? ""));
  if (method !== "GET") world.writes.push({ method, path, body: method === "DELETE" ? "DELETE" : String(init?.body ?? "") });
  // Our own account: the store's plan, which has ended.
  if (!account) {
    if (path.startsWith("/subscriptions/")) return json({ id: path.split("/").pop(), status: "canceled", items: { data: [] } });
    return json({ object: "list", data: [], has_more: false });
  }
  if (path === "/subscriptions/search") {
    const query = url.searchParams.get("query") ?? "";
    return json({ object: "search_result", data: [...world.subs.values()].filter((s) => query.includes(`'${s.metadata.store}'`)).map(subscriptionOf), has_more: false, next_page: null });
  }
  const sub = path.match(/^\/subscriptions\/(sub_\w+)$/);
  if (sub) {
    const row = world.subs.get(sub[1]);
    if (!row) return json({ error: { message: "no such subscription" } }, 404);
    if (method === "DELETE") {
      row.status = "canceled";
      return json(subscriptionOf(row));
    }
    if (form.has("pause_collection[behavior]") && world.failHolds > 0) {
      world.failHolds -= 1;
      return json({ error: { type: "api_error", message: "a stand-in failure" } }, 500);
    }
    if (form.has("pause_collection") && form.get("pause_collection") === "") row.pause_collection = null;
    if (form.has("pause_collection[behavior]")) row.pause_collection = { behavior: String(form.get("pause_collection[behavior]")), ...(form.get("pause_collection[resumes_at]") ? { resumes_at: Number(form.get("pause_collection[resumes_at]")) } : {}) };
    for (const [name, value] of form) {
      const m = name.match(/^metadata\[(\w+)\]$/);
      if (m) {
        if (value === "") delete row.metadata[m[1]];
        else row.metadata[m[1]] = value;
      }
    }
    return json(subscriptionOf(row));
  }
  const invoice = path.match(/^\/invoices\/in_(\w+)$/);
  if (invoice) return json({ id: `in_${invoice[1]}`, payment_intent: `pi_${invoice[1]}` });
  const intent = path.match(/^\/payment_intents\/pi_(\w+)$/);
  if (intent) {
    const charge = world.charges.get(intent[1]) ?? { amount: world.subs.get(`sub_${intent[1]}`)?.amount ?? 0, amount_refunded: 0, disputed: false };
    world.charges.set(intent[1], charge);
    return json({ id: `pi_${intent[1]}`, latest_charge: { id: `ch_${intent[1]}`, ...charge } });
  }
  if (path === "/refunds" && method === "GET") return json({ object: "list", data: world.refunds.filter((r) => r.payment_intent === url.searchParams.get("payment_intent")), has_more: false });
  if (path === "/refunds" && method === "POST") {
    const pi = String(form.get("payment_intent"));
    const amount = Number(form.get("amount"));
    if (amount > world.balance) return json({ error: { code: "balance_insufficient", message: "not enough" } }, 400);
    world.balance -= amount;
    const key = pi.slice(3);
    const charge = world.charges.get(key)!;
    charge.amount_refunded += amount;
    const refund = { id: `re_${world.refunds.length + 1}`, payment_intent: pi, amount, status: "succeeded", metadata: Object.fromEntries([...form].filter(([k]) => k.startsWith("metadata[")).map(([k, v]) => [k.slice(9, -1), v])) };
    world.refunds.push(refund);
    return json(refund);
  }
  if (path === "/balance") return json({ object: "balance", available: [{ amount: world.balance, currency: "usd" }], pending: [] });
  if (path === "/checkout/sessions") {
    const after = url.searchParams.get("starting_after");
    const from = after ? world.sessions.findIndex((s) => s.id === after) + 1 : 0;
    const page = world.sessions.slice(from, from + 100);
    return json({ object: "list", data: page, has_more: from + 100 < world.sessions.length });
  }
  return json({ error: { message: `no stand-in for ${method} ${path}` } }, 404);
}) as typeof fetch;

const hands: Hands = { measure: async () => 0, list: async () => [], remove: async () => {} };

const realNow = Date.now.bind(Date);
const clockAt = (ms: number) => {
  Date.now = () => ms;
};

let made = 0;
/** A store on a paid plan, connected to its own Stripe account, with members and buyers. */
async function storeWith(handle: string, options: { tier?: "creator" | "pro" | "scale"; trial?: boolean } = {}) {
  made += 1;
  const email = `${handle}@example.com`;
  await claimHandle(email, handle, `${handle[0].toUpperCase()}${handle.slice(1)} Shop`, "");
  await setSubscription(email, { customerId: `cus_${handle}0001`, subscriptionId: `sub_${handle}plan01`, active: true, tier: options.tier ?? "creator", cycle: "month", trialEnds: options.trial ? S(Date.now()) + 86_400 : 0 });
  await setStripeAccount(email, `acct_1Fair${String(made).padStart(10, "0")}`, true);
  return email;
}

function member(handle: string, id: string, amount: number, periodEnd: number, extra: Partial<Sub> = {}): Sub {
  const sub: Sub = { id: `sub_${id}`, status: "active", metadata: { store: handle }, pause_collection: null, pe: periodEnd, amount, ...extra };
  world.subs.set(sub.id, sub);
  world.sessions.push({ id: `cs_${id}`, status: "complete", payment_status: "paid", mode: "subscription", customer_details: { email: `${id}@buyers.example.com` }, metadata: { store: handle } });
  return sub;
}

function buyer(handle: string, id: string) {
  world.sessions.push({ id: `cs_${id}`, status: "complete", payment_status: "paid", mode: "payment", customer_details: { email: `${id}@buyers.example.com` }, metadata: { store: handle } });
}

async function ended(email: string) {
  await setSubscription(email, { active: false });
  return Date.parse((await storeForEmail(email))!.planEndedAt);
}

/** The daily job for one store, day by day from `from` to `to` (both days after the plan's end), with Stripe renewing between. */
async function daily(email: string, E: number, from: number, to: number) {
  const out: string[] = [];
  for (let d = from; d <= to; d += 1) {
    const at = E + d * DAY + 60_000;
    renewUntil(at);
    clockAt(at);
    const row = await closeOne(email, at, hands, Number.POSITIVE_INFINITY);
    out.push(`${d}:${row.state}${row.note ? `:${row.note}` : ""}`);
  }
  return out;
}

async function main() {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_a_stand_in_key_for_tests_only";
  process.env.RESEND_API_KEY = "re_test_a_stand_in_key_for_tests_only";
  process.env.COMPANY_POSTAL_ADDRESS = POSTAL;

  part("The rules");
  const ps = S(Date.UTC(2026, 10, 1)), pe = S(Date.UTC(2027, 10, 1));
  const day = Date.UTC(2026, 11, 2);
  is("the unused part is the payment times the share of its period after the closing day, rounded", unusedOf({ amt: 36_500, ps, pe }, day), Math.round((36_500 * (pe - S(day))) / (pe - ps)));
  is("nothing for a period that ends by the closing day, or for nothing paid", [unusedOf({ amt: 1_000, ps, pe: S(day) }, day), unusedOf({ amt: 0, ps, pe }, day)], [0, 0]);
  is("never more than the payment, even for a period that starts after the day", unusedOf({ amt: 1_000, ps: S(day) + 10, pe: S(day) + 100 }, day), 1_000);
  is("what was refunded already is taken off, never below nothing", [stillToGive(900, 300), stillToGive(900, 900), stillToGive(900, 2_000)], [600, 0, 0]);
  is("a hold pauses collection with its invoices voided and no day to resume, and keeps a member's own pause", [...holdBody({ pause_collection: { behavior: "void", resumes_at: 2_000_000_000 }, metadata: {} }, 5)].map(([k, v]) => `${k}=${v}`), ["pause_collection[behavior]=void", "metadata[store_hold]=5", "metadata[hold_member_resumes]=2000000000"]);
  is("a release resumes collection, or puts a member's own pause back with its own day", [[...releaseBody({ metadata: { store_hold: "5" } }, 100)].map(([k, v]) => `${k}=${v}`), releaseBody({ metadata: { store_hold: "5", hold_member_resumes: "2000000000" } }, 100).get("pause_collection[resumes_at]")], [["metadata[store_hold]=", "metadata[hold_member_resumes]=", "pause_collection="], "2000000000"]);
  is("the fixed sentence says the access comes from the store and the notice is at least seven days", [CLOSING_ACCESS_SENTENCE.includes("provided by this store on Marktmorgen"), CLOSING_ACCESS_SENTENCE.includes(`at least ${BUYER_NOTICE_DAYS} days`), BUYER_NOTICE_DAYS >= WARN_WEEK_DAYS], [true, true, true]);
  is("a paid store's cap is two years of its plan's orders, a trial's is its orders", [buyerNoticeCap("creator", true), buyerNoticeCap("scale", false)], [200 * 24, 100]);

  part("A store whose plan ends: held, told, ended and settled");
  clockAt(Date.UTC(2026, 10, 2, 12));
  const anna = await storeWith("anna");
  const annaFolder = await storeFolder(anna);
  // A monthly member who renews in the closing days, a yearly member who paid for most of a year, one with their own pause, and a buyer of a download.
  member("anna", "monthly1", 2_000, S(Date.UTC(2026, 10, 10)));
  const yearly = member("anna", "yearly1", 24_000, S(Date.UTC(2027, 9, 1)), { metadata: { store: "anna", yearly: "1" } });
  member("anna", "paused1", 2_000, S(Date.UTC(2026, 10, 20)), { pause_collection: { behavior: "void", resumes_at: S(Date.UTC(2026, 10, 25)) }, metadata: { store: "anna", pause_from: String(S(Date.UTC(2026, 10, 20))) } });
  buyer("anna", "download1");
  const E = await ended(anna);
  const first = await daily(anna, E, 0, 0);
  is("on the day the plan ends every member is held, before the first notice goes out", [first[0], [...world.subs.values()].filter((s) => s.metadata.store === "anna").map((s) => [s.id, s.pause_collection?.behavior, s.metadata.store_hold === String(E)])], ["0:told:ended", [["sub_monthly1", "void", true], ["sub_yearly1", "void", true], ["sub_paused1", "void", true]]]);
  is("the member's own pause is kept to be put back", world.subs.get("sub_paused1")!.metadata.hold_member_resumes, String(S(Date.UTC(2026, 10, 25))));
  is("and their last payments are written down", [...(await paidPeriods((await storeForEmail(anna))!)).keys()].sort(), ["sub_monthly1", "sub_paused1", "sub_yearly1"]);
  const firstLetter = sent.filter((m) => m.to === anna)[0];
  const closesOn = new Date(E + CLOSING_DAYS * DAY).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  is("the first notice says members are not charged, buyers will be told, the refund that will be made and that a new plan keeps the store", [
    firstLetter.text.includes("none of your members is charged again"),
    firstLetter.text.includes("we email everyone who bought from it"),
    /1 member has paid for time after .*: \$/.test(firstLetter.text),
    firstLetter.text.includes("each is given back the unused part of their last payment"),
    firstLetter.text.includes(`Starting a plan again before ${closesOn} keeps your store`),
  ], [true, true, true, true, true]);
  const run = await daily(anna, E, 1, CLOSING_DAYS - 1);
  is("between the plan's end and the closing no member is charged", world.charged.filter((c) => c.sub.startsWith("sub_")), []);
  is("the creator is told three times, the buyers once, at least seven days before", [sent.filter((m) => m.to === anna).length, run.filter((r) => r.includes(":told:")).map((r) => r.split(":").slice(2).join(":"))], [3, ["month", "week"]]);
  const notices = sent.filter((m) => m.to.endsWith("@buyers.example.com"));
  is("every buyer and member is told, once each", notices.map((m) => m.to).sort(), ["download1@buyers.example.com", "monthly1@buyers.example.com", "paused1@buyers.example.com", "yearly1@buyers.example.com"]);
  const closing = (await closingOf((await storeForEmail(anna))!, E + (CLOSING_DAYS - 1) * DAY))!;
  is("the closing day is at least seven days after the last buyer was told", [closing.buyers!.done, closing.day - closing.buyers!.by >= BUYER_NOTICE_DAYS * DAY], [true, true]);
  const yearlyNotice = notices.find((m) => m.to === "yearly1@buyers.example.com")!;
  is("a member's notice says their payments stopped and what they will be refunded, from Marktmorgen with its address, in text and in HTML", [
    yearlyNotice.text.includes("Your membership payments have stopped"),
    /\$[0-9,.]+ will be given back to you/.test(yearlyNotice.text),
    yearlyNotice.text.includes(POSTAL),
    (yearlyNotice.html ?? "").includes('lang="en"') && (yearlyNotice.html ?? "").includes(POSTAL),
    yearlyNotice.reply_to,
    /\b(hurry|last chance|only \d+ left|offer|discount)\b/i.test(yearlyNotice.text),
  ], [true, true, true, true, "anna@example.com", false]);
  is("no refund is made before the closing day", world.refunds.length, 0);
  const owed = unusedOf({ amt: 24_000, ps: yearly.pe - 365 * 86_400, pe: yearly.pe }, closing.day);

  // The creator presses the button for the yearly member only, then presses again.
  const annaStore = (await storeForEmail(anna))!;
  const rows = await unusedRows(annaStore, closing.day);
  is("the review lists each member who paid past the day, with the proportional amount", rows.map((r) => [r.sub, r.unused]), [["sub_yearly1", owed], ["sub_paused1", unusedOf({ amt: 2_000, ps: S(Date.UTC(2026, 10, 20)) - 30 * 86_400, pe: S(Date.UTC(2026, 10, 20)) }, closing.day)]].filter(([, n]) => Number(n) > 0));
  is("a screen drawn before something changed refunds nothing", await giveBackUnused(annaStore, closing.day, { mark: "0".repeat(64) }), "changed");
  const pressed = await giveBackUnused(annaStore, closing.day, { mark: reviewMark(rows) });
  const again = await giveBackUnused(annaStore, closing.day, { mark: reviewMark(await unusedRows(annaStore, closing.day)) });
  is("pressed twice, each member is refunded once, the proportional amount, from the creator's own account", [typeof pressed === "object" && pressed.done.map((d) => d.amount), typeof again === "object" && again.done.length, world.refunds.map((r) => [r.payment_intent, r.amount])], [rows.map((r) => r.unused), 0, rows.map((r) => [`pi_${r.sub.slice(4)}`, r.unused])]);

  const last = await daily(anna, E, CLOSING_DAYS, CLOSING_DAYS);
  is("on its day the store closes", last[0].split(":")[1], "removed");
  is("every membership ends at once, none left running", [...world.subs.values()].filter((s) => s.metadata.store === "anna").map((s) => s.status), ["canceled", "canceled", "canceled"]);
  is("and the closing day refunds nobody twice", world.refunds.length, rows.length);
  is("what it kept for the closing is let go", await redis.pipeline([["EXISTS", `nl:closing:paid:${annaFolder}`], ["EXISTS", `nl:closing:told:${annaFolder}`], ["EXISTS", creditKey(annaFolder)], ["ZSCORE", HELD_INDEX, anna]]), [0, 0, 0, null]);
  renewUntil(E + 400 * DAY);
  is("and nobody is charged after it either", world.charged.filter((c) => c.sub.startsWith("sub_")), []);

  part("On the closing day, what the creator did not refund is refunded for them, once");
  world.refunds.length = 0;
  const ben = await storeWith("ben");
  const benYear = member("ben", "benyear", 12_000, S(Date.UTC(2027, 8, 1)), { metadata: { store: "ben", yearly: "1" } });
  const benMonth = member("ben", "benmonth", 1_000, S(Date.UTC(2026, 11, 20)));
  const benDone = member("ben", "bendone", 6_000, S(Date.UTC(2027, 5, 1)), { metadata: { store: "ben", yearly: "1" } });
  clockAt(Date.UTC(2026, 10, 3, 12));
  const B = await ended(ben);
  await daily(ben, B, 0, CLOSING_DAYS - 1);
  // The creator refunded one member in full at Stripe, before the day.
  world.charges.set("bendone", { amount: 6_000, amount_refunded: 6_000, disputed: false });
  is("nothing is refunded before the day", world.refunds.length, 0);
  const benDay = (await closingOf((await storeForEmail(ben))!, B + (CLOSING_DAYS - 1) * DAY))!.day;
  await daily(ben, B, CLOSING_DAYS, CLOSING_DAYS);
  const unusedYear = unusedOf({ amt: 12_000, ps: benYear.pe - 365 * 86_400, pe: benYear.pe }, benDay);
  const unusedMonth = unusedOf({ amt: 1_000, ps: benMonth.pe - 30 * 86_400, pe: benMonth.pe }, benDay);
  is("on the day, each member's proportional part is refunded, once, and the one already refunded is not", world.refunds.map((r) => [r.payment_intent, r.amount, r.metadata.closing_refund]).sort(), [["pi_benmonth", unusedMonth, "in_benmonth"], ["pi_benyear", unusedYear, "in_benyear"]].filter(([, n]) => Number(n) > 0).sort());
  is("a refund twice is impossible: the next day refunds nothing", [(await daily(ben, B, CLOSING_DAYS + 1, CLOSING_DAYS + 1)).length, world.refunds.length], [1, [unusedYear, unusedMonth].filter((n) => n > 0).length]);
  void benDone;

  part("A balance that does not cover a refund: never made, the member told");
  world.refunds.length = 0;
  const cleo = await storeWith("cleo");
  member("cleo", "cleoyear", 30_000, S(Date.UTC(2027, 9, 1)), { metadata: { store: "cleo", yearly: "1" } });
  clockAt(Date.UTC(2026, 10, 4, 12));
  const Cl = await ended(cleo);
  await daily(cleo, Cl, 0, CLOSING_DAYS - 1);
  world.balance = 100;
  const before = sent.length;
  const cleoLast = await daily(cleo, Cl, CLOSING_DAYS, CLOSING_DAYS);
  const shortMail = sent.slice(before).filter((m) => m.to === "cleoyear@buyers.example.com");
  is("no refund is made and nothing is owed by Marktmorgen", [world.refunds.length, world.balance], [0, 100]);
  is("the member is emailed that it could not be made, with the creator's contact", [shortMail.length, shortMail[0]?.subject, shortMail[0]?.text.includes("cleo@example.com"), shortMail[0]?.text.includes("Marktmorgen does not hold the store's money")], [1, "Your refund from Cleo Shop could not be made", true, true]);
  is("and the store still closes that day", cleoLast[0].split(":")[1], "removed");
  world.balance = 1_000_000;

  part("A plan started again before the closing: as it was, nothing charged for the days between, nobody refunded");
  world.refunds.length = 0;
  world.charged.length = 0;
  const dan = await storeWith("dan");
  const danMember = member("dan", "danmonth", 1_500, S(Date.UTC(2026, 10, 12)));
  const danPaused = member("dan", "danpaused", 1_500, S(Date.UTC(2026, 10, 15)), { pause_collection: { behavior: "void", resumes_at: S(Date.UTC(2027, 0, 15)) }, metadata: { store: "dan", pause_from: String(S(Date.UTC(2026, 10, 15))) } });
  clockAt(Date.UTC(2026, 10, 5, 12));
  const D = await ended(dan);
  await daily(dan, D, 0, CLOSING_DAYS - 3);
  const danNotices = sent.filter((m) => m.to.startsWith("dan") && m.to.endsWith("@buyers.example.com")).length;
  // The creator starts a plan again.
  await setSubscription(dan, { customerId: "cus_dan0001", subscriptionId: "sub_danplan02", active: true, tier: "creator", cycle: "month", trialEnds: 0 });
  const restartAt = D + (CLOSING_DAYS - 2) * DAY;
  clockAt(restartAt);
  const released = await releaseRestarted(restartAt + 60_000, tellStaysOpen, restartAt);
  is("its members are let go", [released.find((r) => r.key === dan)?.state, danMember.pause_collection, danMember.metadata.store_hold], ["released", null, undefined]);
  is("a member's own pause is put back with its own day", danPaused.pause_collection, { behavior: "void", resumes_at: S(Date.UTC(2027, 0, 15)) });
  is("nothing is charged for the days between: voided while held, and no invoice is collected for them", world.charged.filter((c) => c.sub === "sub_danmonth" && c.at < S(restartAt)), []);
  const stays = sent.filter((m) => m.to.startsWith("dan") && m.subject === "Dan Shop is staying open");
  is("every buyer told it closes is told it stays, once", [danNotices, stays.length], [2, 2]);
  is("nobody is refunded", world.refunds.length, 0);
  is("and it leaves the line", await redis.pipeline([["ZSCORE", HELD_INDEX, dan]]), [null]);

  part("A hold that fails is tried again the next day, and nothing is said before it holds");
  const eve = await storeWith("eve");
  member("eve", "evemonth", 1_000, S(Date.UTC(2026, 10, 30)));
  clockAt(Date.UTC(2026, 10, 6, 12));
  const Ev = await ended(eve);
  world.failHolds = 1;
  const real = console.error;
  console.error = () => {};
  const tries = await daily(eve, Ev, 0, 1);
  console.error = real;
  is("the first day is held, with no notice; the next day holds it and the first notice goes", [tries, sent.filter((m) => m.to === eve).length, world.subs.get("sub_evemonth")!.pause_collection?.behavior], [["0:held:its members' charges are not all held yet", "1:told:ended"], 1, "void"]);

  part("The closing's emails are capped before any goes; none past the cap, never silent");
  const fay = await storeWith("fay", { trial: true });
  for (let i = 0; i < 103; i += 1) buyer("fay", `fay${String(i).padStart(3, "0")}`);
  clockAt(Date.UTC(2026, 10, 7, 12));
  const F = await ended(fay);
  await daily(fay, F, 0, CLOSING_DAYS - 1);
  const fayFolder = await storeFolder(fay);
  const fayTold = sent.filter((m) => m.to.startsWith("fay") && m.to.endsWith("@buyers.example.com")).length;
  const fayClosing = (await closingOf((await storeForEmail(fay))!, F + (CLOSING_DAYS - 1) * DAY))!;
  is("a store that never paid tells up to a trial's orders, and counts the rest for its creator", [fayTold, fayClosing.buyers?.untold, Number((await redis.pipeline([["GET", creditKey(fayFolder)]]))[0])], [100, 3, 100 * EMAILS_PER_BUYER_PER_ENDING - 100 * EMAILS_PER_BUYER_PER_ENDING]);
  is("the creator's last notice says how many and asks them to tell those buyers", sent.filter((m) => m.to === fay).at(-1)?.text.includes("3 addresses were not covered"), true);

  part("Without a company postal address no buyer is written to, and the store does not close");
  process.env.COMPANY_POSTAL_ADDRESS = "";
  is("there is no address in the code yet", companyPostal(), null);
  const gus = await storeWith("gus");
  buyer("gus", "gusbuyer");
  clockAt(Date.UTC(2026, 10, 8, 12));
  const G = await ended(gus);
  console.error = () => {};
  const gusDays = await daily(gus, G, 0, CLOSING_DAYS + 3);
  console.error = real;
  is("the buyers' notice waits, and so does the closing", [sent.some((m) => m.to === "gusbuyer@buyers.example.com"), gusDays.at(-1)], [false, `${CLOSING_DAYS + 3}:held:no company postal address for its buyers' notice`]);
  process.env.COMPANY_POSTAL_ADDRESS = POSTAL;

  part("What the creator's notices and studio say");
  const letter = closingLetter("ended", "Anna Shop", E, E + CLOSING_DAYS * DAY, E, { buyersBy: E + (CLOSING_DAYS - 7) * DAY, untold: 0, members: 1, unused: "$10" });
  is("the letter says the members' charges stopped, when buyers are told and the refund, from the first", [letter.text.includes("none of your members is charged again"), letter.text.includes("at least 7 days before your store closes"), letter.text.includes("1 member has paid for time after")], [true, true, true]);
  const studio = readFileSync(join(process.cwd(), "app/studio/page.tsx"), "utf8");
  is("the studio says buyers are told and when, and leads to the review screen", [studio.includes("we email everyone who bought from it, once, from Marktmorgen"), studio.includes('"closing-refunds"')], [true, true]);
  const review = readFileSync(join(process.cwd(), "app/studio/closing-refunds/page.tsx"), "utf8");
  is("the review screen shows each amount before the one button, with a way back", [review.includes("<table"), review.includes("ClosingRefundsConfirm"), readFileSync(join(process.cwd(), "components/closing-refunds-confirm.tsx"), "utf8").includes("Go back without refunding")], [true, true, true]);
  is("the closing job lets restarted stores go every day", readFileSync(join(process.cwd(), "app/api/cron/closing/route.ts"), "utf8").includes("releaseRestarted(Date.now() + 12_000, tellStaysOpen)"), true);
  is("and the two notices before it are still the creator's", [WARN_MONTH_DAYS, WARN_WEEK_DAYS], [14, 7]);

  Date.now = realNow;
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
