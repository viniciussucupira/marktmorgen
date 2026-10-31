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
 * Bounded: a deadline, at most MAX_PAGES pages of a hundred, and a cursor
 * kept when either stops it, so the next run carries on where this one
 * stopped. One dispute that cannot be read never stops the others. Only
 * reads Stripe; the one write is the store's own record.
 *
 * The Store assistant's own payments are not handled here: its sync already
 * ends a disputed add-on and never sells it again (lib/assistant-billing.ts).
 * A payment that is not a plan invoice (no invoice, or an invoice whose
 * subscription names no store) is counted as unmatched and logged.
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { isAddOn, isBillingConfigured, onPlatformAt } from "@/lib/billing";
import { coveredUntil, disputeStatusOf } from "@/lib/plan-dispute-rules";
import { recordPlanDispute, storeForHandle, storeRef } from "@/lib/store";

/** The version whose charge still names its invoice and whose invoice names its subscription. */
const DISPUTE_VERSION = "2024-06-20";
export const LOOKBACK_DAYS = 120;
export const MAX_PAGES = 5;
const CURSOR_KEY = "nl:plan-disputes:after";
const CURSOR_SECONDS = 2 * 24 * 60 * 60;
const DISPUTE_ID = /^du_[A-Za-z0-9]+$/;
const SUBSCRIPTION_ID = /^sub_[A-Za-z0-9]+$/;

export type DisputeCounts = { seen: number; recorded: number; unmatched: number; failed: number; complete: boolean };

const objectOf = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
const idOf = (value: unknown): string => (typeof value === "string" ? value : typeof objectOf(value)?.id === "string" ? String(objectOf(value)!.id) : "");

/** Writes one listed dispute on its store. Answers what came of it. */
async function applyDispute(dispute: Record<string, unknown>, nowSeconds: number): Promise<"recorded" | "unchanged" | "unmatched"> {
  const id = typeof dispute.id === "string" ? dispute.id : "";
  const created = Number.isSafeInteger(dispute.created) ? (dispute.created as number) : 0;
  if (!DISPUTE_ID.test(id) || created <= 0) return "unmatched";
  const invoice = objectOf(objectOf(dispute.charge)?.invoice);
  const subscriptionId = idOf(invoice?.subscription);
  if (!invoice || !SUBSCRIPTION_ID.test(subscriptionId)) return "unmatched";
  const subscription = await onPlatformAt(DISPUTE_VERSION, "GET", `/subscriptions/${encodeURIComponent(subscriptionId)}`);
  if (isAddOn(subscription)) return "unmatched";
  const handle = objectOf(subscription.metadata)?.store;
  if (typeof handle !== "string" || !handle) return "unmatched";
  const store = await storeForHandle(handle);
  // Only a subscription this store wrote down as its plan, now or before.
  if (!store || (store.subscriptionId !== subscriptionId && !(store.planDisputes ?? []).some((kept) => kept.id === id) && !sameCustomer(store.stripeCustomerId, subscription))) return "unmatched";
  const before = JSON.stringify(store.planDisputes ?? []);
  const after = await recordPlanDispute(storeRef(store), { id, status: disputeStatusOf(dispute.status), at: created, coversUntil: coveredUntil(invoice) }, nowSeconds);
  if (!after) throw new Error("the dispute could not be written down");
  return JSON.stringify(after.planDisputes ?? []) === before ? "unchanged" : "recorded";
}

function sameCustomer(customerId: string | null | undefined, subscription: Record<string, unknown>): boolean {
  return Boolean(customerId) && idOf(subscription.customer) === customerId;
}

/** Reads the disputes until `deadline` (milliseconds since the epoch). */
export async function syncPlanDisputes(deadline: number, nowSeconds = Math.floor(Date.now() / 1000)): Promise<DisputeCounts> {
  const counts: DisputeCounts = { seen: 0, recorded: 0, unmatched: 0, failed: 0, complete: false };
  if (!isRedisConfigured() || !isBillingConfigured()) return counts;
  const [saved] = await redisPipeline([["GET", CURSOR_KEY]]);
  let after = typeof saved === "string" && DISPUTE_ID.test(saved) ? saved : "";
  const since = nowSeconds - LOOKBACK_DAYS * 24 * 60 * 60;
  const keep = async () => {
    if (after) await redisPipeline([["SET", CURSOR_KEY, after, "EX", CURSOR_SECONDS]]);
    return counts;
  };
  for (let page = 0; page < MAX_PAGES; page += 1) {
    if (Date.now() > deadline) return keep();
    const query = new URLSearchParams({ limit: "100", "created[gte]": String(since) });
    query.append("expand[]", "data.charge.invoice");
    if (after) query.set("starting_after", after);
    const list = await onPlatformAt(DISPUTE_VERSION, "GET", `/disputes?${query}`);
    const rows = Array.isArray(list.data) ? (list.data as unknown[]).map(objectOf).filter((row): row is Record<string, unknown> => row !== null) : [];
    for (const dispute of rows) {
      if (Date.now() > deadline) return keep();
      counts.seen += 1;
      try {
        const result = await applyDispute(dispute, nowSeconds);
        if (result === "recorded") counts.recorded += 1;
        if (result === "unmatched") counts.unmatched += 1;
      } catch (error) {
        counts.failed += 1;
        console.error(`reading plan dispute ${typeof dispute.id === "string" ? dispute.id : "?"} failed`, error);
      }
      if (typeof dispute.id === "string" && DISPUTE_ID.test(dispute.id)) after = dispute.id;
    }
    if (list.has_more !== true || !rows.length) {
      await redisPipeline([["DEL", CURSOR_KEY]]);
      counts.complete = true;
      return counts;
    }
  }
  console.error("plan disputes: more than one run's pages; carrying on next run");
  return keep();
}
