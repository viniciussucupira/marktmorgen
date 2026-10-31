/**
 * The daily reading of disputes on our own Stripe account (232 [CA1] unit
 * 5): a creator who disputes a payment they made to us for their plan gets
 * what costs us to run paused, as for an unpaid renewal, and the dispute is
 * written on the store's record (lib/plan-dispute-rules.ts).
 *
 * Stripe keeps the subscription active and the invoice paid when a payment
 * is disputed, and we have no webhook on our own account, so this reads
 * Stripe's list of disputes opened in the last LOOKBACK_DAYS, newest first:
 * a new one is written, and one already written takes its new status, so a
 * decision the bank makes later is seen too.
 *
 * Bounded: a deadline, at most MAX_PAGES pages of a hundred and MAX_REREADS
 * re-reads by id. What each dispute turned out to be is remembered
 * (SEEN_KEY), so a dispute already settled costs no Stripe read when it is
 * listed again and every run reaches the newest first. One dispute that
 * cannot be read never stops the others. Only reads Stripe; the writes are
 * the store's own record and that memory.
 *
 * The Store assistant's own payments are not handled here: its sync already
 * ends a disputed add-on and never sells it again (lib/assistant-billing.ts).
 * A payment that is not a plan invoice (no invoice, or an invoice whose
 * subscription names no store) is counted as unmatched and logged.
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { isAddOn, isBillingConfigured, onPlatformAt } from "@/lib/billing";
import { type PlanDisputeStatus, coveredUntil, disputeStatusOf } from "@/lib/plan-dispute-rules";
import { recordPlanDispute, storeForHandle, storeForEmail, storeRef } from "@/lib/store";

/** The version whose charge still names its invoice and whose invoice names its subscription. */
const DISPUTE_VERSION = "2024-06-20";
export const LOOKBACK_DAYS = 120;
export const MAX_PAGES = 5;
/** The most disputes still open re-read by id in one run. */
export const MAX_REREADS = 50;
/**
 * What each dispute already read turned out to be, by id: "final" (decided,
 * written), "unmatched" (not a plan payment), or "open:<store ref>". A known
 * one costs no Stripe read when it is listed again, so the newest page is
 * always reached first and a run never spends its time on settled ones.
 */
export const SEEN_KEY = "nl:plan-disputes:seen";
const SEEN_SECONDS = 400 * 24 * 60 * 60;
const DISPUTE_ID = /^du_[A-Za-z0-9]+$/;
const SUBSCRIPTION_ID = /^sub_[A-Za-z0-9]+$/;

export type DisputeCounts = { seen: number; recorded: number; unmatched: number; reread: number; failed: number; complete: boolean };

const objectOf = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
const idOf = (value: unknown): string => (typeof value === "string" ? value : typeof objectOf(value)?.id === "string" ? String(objectOf(value)!.id) : "");

async function remember(id: string, what: string): Promise<void> {
  await redisPipeline([["HSET", SEEN_KEY, id, what], ["EXPIRE", SEEN_KEY, SEEN_SECONDS]]);
}

/** Writes a dispute's status on a store already known. Answers whether it changed. */
async function writeStatus(ref: string, id: string, status: PlanDisputeStatus, at: number, coversUntil: number, nowSeconds: number): Promise<boolean> {
  const store = await storeForEmail(ref);
  if (!store) {
    await remember(id, "unmatched");
    return false;
  }
  const before = JSON.stringify(store.planDisputes ?? []);
  const after = await recordPlanDispute(ref, { id, status, at, coversUntil }, nowSeconds);
  if (!after) throw new Error("the dispute could not be written down");
  await remember(id, status === "open" ? `open:${ref}` : "final");
  return JSON.stringify(after.planDisputes ?? []) !== before;
}

/** Writes one listed dispute on its store. Answers what came of it. */
async function applyDispute(dispute: Record<string, unknown>, known: string | undefined, nowSeconds: number): Promise<"recorded" | "unchanged" | "unmatched"> {
  const id = typeof dispute.id === "string" ? dispute.id : "";
  const created = Number.isSafeInteger(dispute.created) ? (dispute.created as number) : 0;
  if (!DISPUTE_ID.test(id) || created <= 0) return "unmatched";
  if (known === "final") return "unchanged";
  if (known === "unmatched") return "unmatched";
  const invoice = objectOf(objectOf(dispute.charge)?.invoice);
  const status = disputeStatusOf(dispute.status);
  if (known?.startsWith("open:")) {
    return (await writeStatus(known.slice(5), id, status, created, coveredUntil(invoice), nowSeconds)) ? "recorded" : "unchanged";
  }
  const subscriptionId = idOf(invoice?.subscription);
  if (!invoice || !SUBSCRIPTION_ID.test(subscriptionId)) {
    await remember(id, "unmatched");
    return "unmatched";
  }
  const subscription = await onPlatformAt(DISPUTE_VERSION, "GET", `/subscriptions/${encodeURIComponent(subscriptionId)}`);
  const handle = objectOf(subscription.metadata)?.store;
  const store = isAddOn(subscription) || typeof handle !== "string" || !handle ? null : await storeForHandle(handle);
  // Only a subscription this store wrote down as its plan, or one of the same Stripe customer.
  if (!store || (store.subscriptionId !== subscriptionId && !sameCustomer(store.stripeCustomerId, subscription))) {
    await remember(id, "unmatched");
    return "unmatched";
  }
  return (await writeStatus(storeRef(store), id, status, created, coveredUntil(invoice), nowSeconds)) ? "recorded" : "unchanged";
}

function sameCustomer(customerId: string | null | undefined, subscription: Record<string, unknown>): boolean {
  return Boolean(customerId) && idOf(subscription.customer) === customerId;
}

/**
 * Reads the disputes until `deadline` (milliseconds since the epoch): the
 * newest first, every run, so a new one is never left behind older ones;
 * then, by id, the ones still open that the list no longer reaches (older
 * than LOOKBACK_DAYS), so a late decision is still seen.
 */
export async function syncPlanDisputes(deadline: number, nowSeconds = Math.floor(Date.now() / 1000)): Promise<DisputeCounts> {
  const counts: DisputeCounts = { seen: 0, recorded: 0, unmatched: 0, reread: 0, failed: 0, complete: false };
  if (!isRedisConfigured() || !isBillingConfigured()) return counts;
  const [raw] = await redisPipeline([["HGETALL", SEEN_KEY]]);
  const seen = new Map<string, string>();
  if (Array.isArray(raw)) for (let i = 0; i + 1 < raw.length; i += 2) seen.set(String(raw[i]), String(raw[i + 1]));
  else if (raw && typeof raw === "object") for (const [key, value] of Object.entries(raw)) seen.set(key, String(value));
  const listed = new Set<string>();
  const since = nowSeconds - LOOKBACK_DAYS * 24 * 60 * 60;
  let after = "";
  let listDone = false;
  for (let page = 0; page < MAX_PAGES && !listDone; page += 1) {
    if (Date.now() > deadline) return counts;
    const query = new URLSearchParams({ limit: "100", "created[gte]": String(since) });
    query.append("expand[]", "data.charge.invoice");
    if (after) query.set("starting_after", after);
    const list = await onPlatformAt(DISPUTE_VERSION, "GET", `/disputes?${query}`);
    const rows = Array.isArray(list.data) ? (list.data as unknown[]).map(objectOf).filter((row): row is Record<string, unknown> => row !== null) : [];
    for (const dispute of rows) {
      if (Date.now() > deadline) return counts;
      counts.seen += 1;
      const id = typeof dispute.id === "string" ? dispute.id : "";
      if (id) listed.add(id);
      try {
        const result = await applyDispute(dispute, seen.get(id), nowSeconds);
        if (result === "recorded") counts.recorded += 1;
        if (result === "unmatched") counts.unmatched += 1;
      } catch (error) {
        counts.failed += 1;
        console.error(`reading plan dispute ${id || "?"} failed`, error);
      }
      if (DISPUTE_ID.test(id)) after = id;
    }
    listDone = list.has_more !== true || !rows.length;
  }
  if (!listDone) console.error("plan disputes: more than one run's pages; the oldest wait for the next run");
  // Still open, and no longer in the list: asked by id.
  const stale = [...seen].filter(([id, what]) => what.startsWith("open:") && !listed.has(id)).slice(0, MAX_REREADS);
  for (const [id, what] of stale) {
    if (Date.now() > deadline) return counts;
    try {
      const dispute = await onPlatformAt(DISPUTE_VERSION, "GET", `/disputes/${encodeURIComponent(id)}`);
      if (dispute.id !== id) throw new Error("Stripe answered another dispute");
      counts.reread += 1;
      const created = Number.isSafeInteger(dispute.created) ? (dispute.created as number) : 0;
      if (await writeStatus(what.slice(5), id, disputeStatusOf(dispute.status), created, 0, nowSeconds)) counts.recorded += 1;
    } catch (error) {
      counts.failed += 1;
      console.error(`re-reading plan dispute ${id} failed`, error);
    }
  }
  counts.complete = listDone && stale.length < MAX_REREADS;
  return counts;
}
