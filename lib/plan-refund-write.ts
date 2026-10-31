/**
 * Makes the plan refund that lib/plan-refund.ts reads (305 [SY1] unit 2a):
 * the money only. Ending the subscription and closing the store's paid
 * features, the button, its review page and the confirmation email are the
 * next unit; nothing calls this yet, and no route may call it without them.
 *
 * Never twice:
 *   - one store at a time: a lock (LOCK_PREFIX, SET NX with LOCK_SECONDS),
 *     so a double click or two tabs wait for each other ("busy");
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
 * expires by itself after LOCK_SECONDS, longer than the reading's budget plus
 * the write's time-out.
 *
 * Bounded: one reading (lib/plan-refund.ts, at most MAX_CALLS requests), one
 * list and one write.
 */
import { onPlatformAt } from "@/lib/billing";
import { READ_BUDGET_MS, readPlanRefund } from "@/lib/plan-refund";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import type { Store } from "@/lib/store";

const AT = "2024-06-20";
export const LOCK_PREFIX = "nl:plan-refund:lock:";
/** Longer than the reading's budget and the write's 20-second time-out together. */
export const LOCK_SECONDS = Math.ceil(READ_BUDGET_MS / 1000) + 60;
const REFUND_ID = /^re_[A-Za-z0-9]{6,128}$/;

export type PlanRefundMade =
  | { ok: true; cents: number; currency: string; refundId: string; status: "succeeded" | "pending" }
  | { ok: false; reason: "busy" | "no_lock" | "not_owed" | "pending" | "failed" };

type Row = Record<string, unknown>;
const rows = (page: Row): Row[] => (Array.isArray(page.data) ? (page.data as unknown[]).filter((r): r is Row => Boolean(r) && typeof r === "object") : []);

export async function refundPlanPayment(store: Store, nowSeconds = Math.floor(Date.now() / 1000)): Promise<PlanRefundMade> {
  if (!isRedisConfigured()) return { ok: false, reason: "no_lock" };
  const lock = `${LOCK_PREFIX}${store.sid}`;
  const token = `${nowSeconds}:${Math.random().toString(36).slice(2)}`;
  const [taken] = await redisPipeline([["SET", lock, token, "NX", "EX", LOCK_SECONDS]]);
  if (taken !== "OK") return { ok: false, reason: "busy" };
  try {
    const reading = await readPlanRefund(store, nowSeconds);
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
    const [held] = await redisPipeline([["GET", lock]]);
    if (held === token) await redisPipeline([["DEL", lock]]);
  }
}
