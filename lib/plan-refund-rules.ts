/**
 * What the plans' refund policy gives back, and never more than was paid.
 * 232 [CA1] unit 6; the button that uses it is 305 [SY1].
 *
 * The policy is app/refunds/page.tsx, sections 2, 3 and 5:
 *   - the first payment on an account, refunded in full when asked within
 *     REFUND_DAYS of it ("guarantee");
 *   - a yearly payment, at any time, less the months that have started at the
 *     plan's monthly price and less Stripe's card fee on that payment, which
 *     Stripe does not give back ("unstarted_months"); a first yearly payment
 *     asked about within REFUND_DAYS takes the guarantee instead;
 *   - nothing else: a monthly renewal, a switch charge, any later charge.
 *
 * Pure: it reads the charge as Stripe reports it and answers how many cents a
 * refund may be, why there is none, or that it cannot tell yet. It calls
 * nothing. Rules the rest of the code relies on:
 *   - the amount is what the charge took (Stripe's `charge.amount`), which is
 *     already net of coupons, discounts and any customer balance applied to
 *     the invoice; the list price is never used for the guarantee;
 *   - what was already refunded (`charge.amount_refunded`) is taken off, so
 *     the total ever given back for one charge never passes what the policy
 *     gives, nor what the charge took; a repeated call after a refund answers
 *     the smaller rest, never the same amount twice;
 *   - a dispute (Stripe's dispute `status`): open, or a status this code does
 *     not know, means no refund now (the bank may return it); `lost` and
 *     `prevented` mean the money went back that way already; `won` and
 *     `warning_closed` let the policy apply again (statuses read on
 *     docs.stripe.com/api/disputes/object, 31/10/2026);
 *   - tax shown on top comes back with the part refunded, in proportion,
 *     rounded down; for the guarantee the whole payment, tax included;
 *   - anything that is not a whole, non-negative number of cents, or a
 *     currency the monthly price is not in, is "unknown", never a guess and
 *     never zero dressed up as "nothing is owed".
 */
import { REFUND_DAYS } from "@/lib/plan";

const DAY_SECONDS = 86_400;

export type PlanRefundCharge = {
  /** Stripe's lowercase three-letter code. */
  currency: string;
  /** What the charge took, in the smallest unit: `charge.amount`. */
  amountCents: number;
  /** What has been refunded from it already: `charge.amount_refunded`. */
  refundedCents: number;
  /** Tax on the invoice this charge paid, included in amountCents. */
  taxCents: number;
  /** Stripe's fee on the charge (its balance transaction), or null if not read. */
  feeCents: number | null;
  /** When it was paid, in seconds. */
  paidAtSeconds: number;
  /** The status of a dispute on it, or null when there is none. */
  disputeStatus: string | null;
};

export type PlanRefundInput = {
  cycle: "month" | "year";
  /** Whether this is the first charge on the account (decided by the caller). */
  firstPayment: boolean;
  /** Start of the billing period this charge paid for, in seconds. */
  periodStartSeconds: number;
  /** The plan's monthly price when this yearly payment was made, same currency; null if not known. */
  monthlyCents: number | null;
  /** The currency of monthlyCents; "usd" when absent, as every plan price is. */
  monthlyCurrency?: string;
  nowSeconds: number;
  charge: PlanRefundCharge;
};

export type PlanRefund =
  | { kind: "guarantee"; cents: number }
  | { kind: "unstarted_months"; cents: number; monthsKept: number }
  | { kind: "none"; reason: "dispute_open" | "dispute_returned" | "already_refunded" | "outside_window" | "renewal" | "months_used" }
  | { kind: "unknown"; reason: "unreadable" | "fee_unread" | "monthly_price_unknown" | "currency" };

const RETURNED = new Set(["lost", "prevented"]);
const SETTLED = new Set(["won", "warning_closed"]);

function cents(n: unknown): n is number {
  return typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
}

/**
 * A date some whole months after `startSeconds`, the way Stripe moves a
 * billing anchor: the same day and time, or the month's last day when it has
 * no such day (an anchor on the 31st bills on Feb 28). UTC throughout.
 */
export function addMonthsLikeStripe(startSeconds: number, months: number): number {
  const d = new Date(startSeconds * 1000);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + months;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const day = Math.min(d.getUTCDate(), last);
  return Date.UTC(y, m, day, d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()) / 1000;
}

/** How many of a yearly period's twelve months have started by `nowSeconds` (0 to 12). */
export function monthsStarted(periodStartSeconds: number, nowSeconds: number): number {
  let n = 0;
  for (let k = 0; k < 12; k += 1) {
    if (addMonthsLikeStripe(periodStartSeconds, k) <= nowSeconds) n += 1;
    else break;
  }
  return n;
}

export function planRefund(input: PlanRefundInput): PlanRefund {
  const c = input.charge;
  if (!cents(c.amountCents) || !cents(c.refundedCents) || !cents(c.taxCents) || c.taxCents > c.amountCents) return { kind: "unknown", reason: "unreadable" };
  if (c.feeCents !== null && !cents(c.feeCents)) return { kind: "unknown", reason: "unreadable" };
  if (!Number.isFinite(c.paidAtSeconds) || !Number.isFinite(input.nowSeconds) || !Number.isFinite(input.periodStartSeconds)) return { kind: "unknown", reason: "unreadable" };

  if (c.disputeStatus !== null) {
    if (RETURNED.has(c.disputeStatus)) return { kind: "none", reason: "dispute_returned" };
    if (!SETTLED.has(c.disputeStatus)) return { kind: "none", reason: "dispute_open" };
  }

  const left = c.amountCents - c.refundedCents;
  if (left <= 0) return { kind: "none", reason: "already_refunded" };

  const inWindow = input.nowSeconds <= c.paidAtSeconds + REFUND_DAYS * DAY_SECONDS;
  if (input.firstPayment && inWindow) return { kind: "guarantee", cents: left };

  if (input.cycle !== "year") return { kind: "none", reason: input.firstPayment ? "outside_window" : "renewal" };

  if (input.monthlyCents === null) return { kind: "unknown", reason: "monthly_price_unknown" };
  if (!cents(input.monthlyCents)) return { kind: "unknown", reason: "unreadable" };
  if (c.currency !== (input.monthlyCurrency ?? "usd")) return { kind: "unknown", reason: "currency" };
  if (c.feeCents === null) return { kind: "unknown", reason: "fee_unread" };

  const kept = monthsStarted(input.periodStartSeconds, input.nowSeconds);
  const preTaxPaid = c.amountCents - c.taxCents;
  const keptCents = Math.min(preTaxPaid, kept * input.monthlyCents);
  const preTaxBack = preTaxPaid - keptCents;
  const taxBack = preTaxPaid > 0 ? Math.floor((c.taxCents * preTaxBack) / preTaxPaid) : 0;
  const policy = preTaxBack + taxBack - c.feeCents;
  if (policy <= 0) return { kind: "none", reason: "months_used" };
  const now = Math.min(policy - c.refundedCents, left);
  if (now <= 0) return { kind: "none", reason: "already_refunded" };
  return { kind: "unstarted_months", cents: now, monthsKept: kept };
}
