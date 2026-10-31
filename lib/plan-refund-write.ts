/**
 * Makes the plan refund that lib/plan-refund.ts reads (305 [SY1] unit 2a):
 * the money only. Ending the subscription and closing the store's paid
 * features, the button, its review page and the confirmation email are the
 * next unit; nothing calls this yet, and no route may call it without them.
 *
 * Never twice:
 *   - one store at a time: a lock (lockKeyOf, lib/redis-lock.ts: SET NX
 *     with LOCK_SECONDS, released only by its holder), so a double click or
 *     two tabs do not both go through (the second is told "busy");
 *   - read again under the lock: the amount is what the published policy
 *     gives now, after what was refunded already (planRefund takes
 *     `amount_refunded` off), so once given it is not given again;
 *   - the charge's own refunds are read first (GET /v1/refunds?charge=,
 *     newest first, at most 100): one still pending or waiting for an action
 *     means nothing new is made ("pending") until it settles;
 *   - the refund carries a Stripe idempotency key made of the charge and the
 *     number of its refunds that failed or were canceled: a retry, a time-out
 *     or a crash after Stripe made it replays Stripe's first answer for 24
 *     hours instead of making a second, and only a refund the bank turned
 *     down (which gives the money back to the charge) is made again.
 * The lock is released at the end, even on an error; if the process dies it
 * expires by itself after LOCK_SECONDS. The reading's budget only stops new
 * requests, so its last one may run a whole STRIPE_TIMEOUT_MS past it: the
 * lock covers the budget, three time-outs (that last read, the list, the
 * write) and a minute, and no write starts later than WRITE_BY_MS after the
 * lock was taken, so a write always ends while the lock still holds.
 *
 * Bounded: one reading (lib/plan-refund.ts, at most MAX_CALLS requests), one
 * list and one write.
 */
import { onPlatformAt } from "@/lib/billing";
import { STRIPE_TIMEOUT_MS } from "@/lib/fetch-timeout";
import { READ_BUDGET_MS, readPlanRefund } from "@/lib/plan-refund";
import { isRedisConfigured } from "@/lib/redis";
import { LockBusyError, releaseLock, takeLock } from "@/lib/redis-lock";
import type { Store } from "@/lib/store";

const AT = "2024-06-20";
/** The lock of one store's plan refund. */
export const lockKeyOf = (sid: string): string => `nl:plan-refund:${sid}:lock`;
/** The reading's budget, three Stripe time-outs (its last read, the list, the write) and a minute of room. */
export const LOCK_SECONDS = Math.ceil((READ_BUDGET_MS + 3 * STRIPE_TIMEOUT_MS) / 1000) + 60;
/** The last moment after taking the lock a write may start: it ends, time-out included, a minute before the lock expires. */
export const WRITE_BY_MS = (LOCK_SECONDS - 60) * 1000 - STRIPE_TIMEOUT_MS;
const REFUND_ID = /^re_[A-Za-z0-9]{6,128}$/;

export type PlanRefundMade =
  | { ok: true; cents: number; currency: string; refundId: string; status: "succeeded" | "pending" }
  | { ok: false; reason: "busy" | "no_lock" | "not_owed" | "unknown" | "pending" | "failed" };

type Row = Record<string, unknown>;
const rows = (page: Row): Row[] => (Array.isArray(page.data) ? (page.data as unknown[]).filter((r): r is Row => Boolean(r) && typeof r === "object") : []);

export async function refundPlanPayment(store: Store, nowSeconds = Math.floor(Date.now() / 1000)): Promise<PlanRefundMade> {
  if (!isRedisConfigured()) return { ok: false, reason: "no_lock" };
  let held;
  const takenAt = Date.now();
  try {
    held = await takeLock(lockKeyOf(store.sid), LOCK_SECONDS, 0);
  } catch (error) {
    if (error instanceof LockBusyError) return { ok: false, reason: "busy" };
    throw error;
  }
  try {
    const reading = await readPlanRefund(store, nowSeconds);
    // Not decidable (a failed read, a list too long…): said so, for the page to send the creator to support.
    if (reading.refund.kind === "unknown") return { ok: false, reason: "unknown" };
    if (!("chargeId" in reading)) return { ok: false, reason: "not_owed" };
    const { chargeId, paymentIntent, currency } = reading;
    const cents = reading.refund.cents;
    let refunds: Row[];
    try {
      const page = await onPlatformAt(AT, "GET", `/refunds?${new URLSearchParams({ charge: chargeId, limit: "100" })}`);
      // More than a page of refunds on one plan payment is not read whole: nothing is made.
      if (page.has_more !== false) return { ok: false, reason: "failed" };
      refunds = rows(page);
    } catch (error) {
      console.error("reading a plan payment's refunds failed", error);
      return { ok: false, reason: "failed" };
    }
    if (refunds.some((r) => r.status === "pending" || r.status === "requires_action")) return { ok: false, reason: "pending" };
    if (refunds.some((r) => typeof r.status !== "string" || !["succeeded", "failed", "canceled"].includes(r.status))) return { ok: false, reason: "failed" };
    const turnedDown = refunds.filter((r) => r.status === "failed" || r.status === "canceled").length;
    // Too late to be sure the write ends while the lock holds: nothing is made, the creator may ask again.
    if (Date.now() - takenAt > WRITE_BY_MS) return { ok: false, reason: "failed" };
    try {
      const made = await onPlatformAt(
        AT,
        "POST",
        "/refunds",
        new URLSearchParams({ payment_intent: paymentIntent, amount: String(cents), reason: "requested_by_customer", "metadata[plan_refund]": store.sid }),
        `plan-refund:${chargeId}:${turnedDown}`,
      );
      const refundId = typeof made.id === "string" ? made.id : "";
      if (made.object !== "refund" || !REFUND_ID.test(refundId) || made.amount !== cents || made.currency !== currency) return { ok: false, reason: "failed" };
      if (made.status === "succeeded" || made.status === "pending" || made.status === "requires_action") {
        return { ok: true, cents, currency, refundId, status: made.status === "succeeded" ? "succeeded" : "pending" };
      }
      return { ok: false, reason: "failed" };
    } catch (error) {
      console.error("making a plan refund failed", error);
      return { ok: false, reason: "failed" };
    }
  } finally {
    // Only our own lock: one that expired and was taken by another request is left alone.
    await releaseLock(held);
  }
}
