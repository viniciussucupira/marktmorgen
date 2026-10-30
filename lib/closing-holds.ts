/**
 * The members of a store whose plan ended, on the creator's own Stripe
 * account (queue item 307 [EC1], parts 2 and 4; lib/closing-buyers-rules.ts
 * says why).
 *
 *   holdCharges     the day the plan ended: every membership and payment plan
 *                   the store sold stops being charged (Stripe's pause of
 *                   collection, invoices voided, no day to resume), and each
 *                   member's last payment is written down, for the time they
 *                   paid for past the closing day (lib/closing-refunds.ts)
 *   releaseHolds    the plan was started again before the closing: each one
 *                   goes on exactly as it was, nothing charged for the days
 *                   between (voided invoices are never charged)
 *   releaseRestarted  the daily job's walk of the stores held, for the plans
 *                   started again since (the store record leaves the line of
 *                   ended plans the moment a plan runs, so the closing job
 *                   alone would never see it)
 *
 * Read on 30 October 2026 in Stripe's documentation:
 * docs.stripe.com/billing/subscriptions/pause-payment ("the subscription
 * remains active and invoices continue to generate, but Stripe doesn't
 * collect payment"; void: "No record of charges is created for these
 * periods"; resume by unsetting pause_collection; "Invoices created before
 * you pause subscriptions continue to be retried unless you void them").
 *
 *   nl:closing:paid:<folder>   hash  subscription -> its last payment (PaidPeriod), from the hold to the closing
 *   nl:closing:held            sorted set  a store's key -> when its plan ended, while its members are held
 *
 * Every write to Stripe carries an idempotency key, and a hold or a release
 * that did not reach every member says so: the daily job tries again the
 * next day, and the closing day does not wait on it (on that day every one
 * of them ends at once). Nothing here is silent: what was not done is logged.
 */
import { onAccount } from "@/lib/stripe-account";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { type Store, saleHandles, storeFolder, storeForEmail, storeRef } from "@/lib/store";
import { standingOf } from "@/lib/plan-standing";
import { normaliseEmail } from "@/lib/auth";
import { forgetCredit } from "@/lib/closing-credit";
import { HOLD_PAGES_PER_RUN, type HeldSub, type PaidPeriod, chargeable, holdBody, isPaymentPlan, releaseBody } from "@/lib/closing-buyers-rules";

export const paidKey = (folder: string) => `nl:closing:paid:${folder}`;
export const HELD_INDEX = "nl:closing:held";
const SUB_ID = /^sub_[A-Za-z0-9]{6,64}$/;
const INVOICE_ID = /^in_[A-Za-z0-9]{6,64}$/;

type Row = HeldSub & Record<string, unknown>;

/** Every subscription the store sold, page by page, on its own account; bounded by `until` and HOLD_PAGES_PER_RUN. */
async function eachSold(store: Store, until: number, each: (rows: Row[]) => Promise<void>): Promise<boolean> {
  const account = store.stripeAccountId;
  if (!account) return true;
  let pages = 0;
  for (const handle of saleHandles(store)) {
    let page = "";
    for (;;) {
      if (Date.now() > until || pages >= HOLD_PAGES_PER_RUN) return false;
      const query = new URLSearchParams({ limit: "100", query: `metadata['store']:'${handle}'` });
      query.append("expand[]", "data.latest_invoice");
      query.append("expand[]", "data.customer");
      if (page) query.set("page", page);
      const found = await onAccount("GET", account, `/subscriptions/search?${query}`);
      pages += 1;
      await each(Array.isArray(found.data) ? (found.data as Row[]) : []);
      page = typeof found.next_page === "string" ? found.next_page : "";
      if (found.has_more !== true || !page) break;
    }
  }
  return true;
}

/** A member's last payment, from a subscription read with its latest invoice and customer: null when nothing paid stands for time. */
export function paidPeriodOf(sub: Row): PaidPeriod | null {
  if (isPaymentPlan(sub)) return null;
  const invoice = sub.latest_invoice && typeof sub.latest_invoice === "object" ? (sub.latest_invoice as Record<string, unknown>) : null;
  if (!invoice || invoice.status !== "paid" || typeof invoice.id !== "string" || !INVOICE_ID.test(invoice.id)) return null;
  const amt = typeof invoice.amount_paid === "number" ? invoice.amount_paid : 0;
  const cur = typeof invoice.currency === "string" ? invoice.currency.toLowerCase() : "";
  const lines = (invoice.lines as { data?: { period?: { start?: unknown; end?: unknown } }[] } | undefined)?.data ?? [];
  const period = lines.find((line) => line.period && typeof line.period.end === "number")?.period;
  const ps = Number(period?.start), pe = Number(period?.end);
  const customer = sub.customer && typeof sub.customer === "object" ? (sub.customer as { email?: unknown }) : null;
  const e = typeof customer?.email === "string" ? normaliseEmail(customer.email) : "";
  if (!(amt > 0) || !cur || !Number.isFinite(ps) || !Number.isFinite(pe) || pe <= ps) return null;
  return { inv: invoice.id, amt, cur, ps, pe, e };
}

/**
 * Holds every member's charges for a plan that ended at `endedAt` (ms).
 * `done` when every one the store sold was reached; safe to run again: a
 * membership held already for this ending is passed over, and its payment
 * is not written down twice.
 */
export async function holdCharges(store: Store, endedAt: number, until: number): Promise<{ done: boolean; held: number; failed: number }> {
  const out = { done: true, held: 0, failed: 0 };
  if (!store.stripeAccountId) return out;
  const account = store.stripeAccountId;
  const folder = await storeFolder(storeRef(store));
  const reached = await eachSold(store, until, async (rows) => {
    const paid: (string | number)[] = [];
    for (const sub of rows) {
      const id = typeof sub.id === "string" ? sub.id : "";
      if (!SUB_ID.test(id) || !chargeable(sub)) continue;
      const period = paidPeriodOf(sub);
      if (period) paid.push(id, JSON.stringify(period));
      if (sub.metadata?.store_hold === String(endedAt) && sub.pause_collection) continue;
      try {
        await onAccount("POST", account, `/subscriptions/${encodeURIComponent(id)}`, holdBody(sub, endedAt), undefined, `closing-hold:${id}:${endedAt}`);
        out.held += 1;
      } catch (error) {
        out.failed += 1;
        console.error("holding a member's charges after the plan ended failed; tried again tomorrow", error);
      }
    }
    // Each payment written once (HSETNX): the first reading is the one before any hold.
    for (let i = 0; i + 1 < paid.length; i += 2) await redisPipeline([["HSETNX", paidKey(folder), paid[i], paid[i + 1]]]);
  });
  await redisPipeline([["ZADD", HELD_INDEX, endedAt, storeRef(store)]]);
  out.done = reached && out.failed === 0;
  return out;
}

/** Lets every held member of the store go again, as they were. `done` when every one was reached. */
export async function releaseHolds(store: Store, until: number, nowSeconds = Math.floor(Date.now() / 1000)): Promise<{ done: boolean; released: number; failed: number }> {
  const out = { done: true, released: 0, failed: 0 };
  const account = store.stripeAccountId;
  if (!account) return out;
  const reached = await eachSold(store, until, async (rows) => {
    for (const sub of rows) {
      const id = typeof sub.id === "string" ? sub.id : "";
      const hold = sub.metadata?.store_hold;
      if (!SUB_ID.test(id) || !hold || !chargeable(sub)) continue;
      try {
        await onAccount("POST", account, `/subscriptions/${encodeURIComponent(id)}`, releaseBody(sub, nowSeconds), undefined, `closing-release:${id}:${hold}`);
        out.released += 1;
      } catch (error) {
        out.failed += 1;
        console.error("letting a held member's charges go again failed; tried again tomorrow", error);
      }
    }
  });
  out.done = reached && out.failed === 0;
  return out;
}

/** The members' last payments a store has written down, by subscription. */
export async function paidPeriods(store: Store): Promise<Map<string, PaidPeriod>> {
  const out = new Map<string, PaidPeriod>();
  if (!isRedisConfigured()) return out;
  const [raw] = await redisPipeline([["HGETALL", paidKey(await storeFolder(storeRef(store)))]]);
  const flat = Array.isArray(raw) ? (raw as unknown[]).map(String) : [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    try {
      const row = JSON.parse(flat[i + 1]) as PaidPeriod;
      if (SUB_ID.test(flat[i]) && typeof row.amt === "number" && typeof row.inv === "string") out.set(flat[i], row);
    } catch {
      // A row that cannot be read is left out, never guessed at.
    }
  }
  return out;
}

/** Writes back what became of one member's refund. */
export async function savePaidPeriod(store: Store, sub: string, row: PaidPeriod): Promise<void> {
  await redisPipeline([["HSET", paidKey(await storeFolder(storeRef(store))), sub, JSON.stringify(row)]]);
}

/** Once the store is closed or runs again: its written-down payments are deleted, and it leaves the line. */
export async function forgetHeld(store: Store, folder: string): Promise<void> {
  await redisPipeline([["DEL", paidKey(folder)], ["ZREM", HELD_INDEX, storeRef(store)]]);
  await forgetCredit(folder);
}

export type Released = { key: string; state: "released" | "held" | "closing" | "gone" };

/**
 * The daily walk of the stores whose members are held: a store whose plan
 * runs again (or ended again, on another day) has every member let go, its
 * buyers told it stays (`staysOpen`, lib/closing-buyers.ts), and leaves the
 * line. Bounded by `deadline`; what is not reached is the next day's.
 */
export async function releaseRestarted(deadline: number, staysOpen: (store: Store, until: number) => Promise<boolean>, now = Date.now()): Promise<Released[]> {
  if (!isRedisConfigured()) return [];
  const out: Released[] = [];
  const flat: string[] = [];
  for (let from = 0; from < 100_000; from += 500) {
    const [raw] = await redisPipeline([["ZRANGEBYSCORE", HELD_INDEX, "-inf", "+inf", "WITHSCORES", "LIMIT", from, 500]]);
    const page = Array.isArray(raw) ? (raw as unknown[]).map(String) : [];
    flat.push(...page);
    if (page.length < 1000) break;
  }
  for (let i = 0; i + 1 < flat.length; i += 2) {
    if (Date.now() > deadline) break;
    const key = flat[i];
    const endedAt = Number(flat[i + 1]);
    const store = await storeForEmail(key).catch(() => null);
    if (!store) {
      await redisPipeline([["ZREM", HELD_INDEX, key]]);
      out.push({ key, state: "gone" });
      continue;
    }
    const stillClosing = standingOf(store, now / 1000) === "ended" && Date.parse(store.planEndedAt) === endedAt;
    if (stillClosing) {
      out.push({ key, state: "closing" });
      continue;
    }
    try {
      const done = await releaseHolds(store, deadline, Math.floor(now / 1000));
      const told = done.done ? await staysOpen(store, deadline) : false;
      if (!done.done || !told) {
        out.push({ key, state: "held" });
        continue;
      }
      await forgetHeld(store, await storeFolder(storeRef(store)));
      out.push({ key, state: "released" });
    } catch (error) {
      console.error("letting a restarted store's members go again failed; tried again tomorrow", error);
      out.push({ key, state: "held" });
    }
  }
  return out;
}
