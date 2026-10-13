/**
 * Orders a store hands over, and what a plan covers of them: the rules.
 *
 * Every order costs us something however small it is: the email that
 * confirms it (and, for a physical product, the one that says it was
 * shipped), the pages and the jobs that settle it, the writes to the
 * database. About a fifth of a cent all told (tests/plan-margin.test.ts has
 * the sum). It went into no limit at all, because the receipts were counted
 * as a fixed number of emails in each plan's worst month. A store that sells
 * a hundred thousand copies of a video in a month on a plan with no share
 * of its sales would cost more than that plan brings in, and a free product
 * given away to that many addresses would cost the same with nothing paid
 * at all.
 *
 * So orders are covered and priced the way visits are (lib/traffic-rules.ts):
 *
 *   - An order is one purchase confirmed (whatever it holds, a bundle or a
 *     cart of several products included), one offer taken after paying, one
 *     place taken in a purchase made for several people, and one free copy
 *     sent to an address. Counted once, however often it is looked at
 *     (lib/orders.ts).
 *   - An order that paid a share of its sale (lib/platform-share.ts) is
 *     covered by that share and is not counted: the smallest share there is,
 *     on the smallest payment Stripe takes, is several times what the order
 *     costs. While no share is taken, every order counts.
 *   - Every plan covers a number of orders in a calendar month
 *     (ORDERS_INCLUDED), more on a larger plan.
 *   - A thousand orders past that are ORDER_CENTS_PER_THOUSAND_OVER cents, to
 *     the order, added to the creator's next invoice by the daily job
 *     (lib/usage-billing.ts). Nothing is ever refused to a buyer for it and
 *     nothing is asked of the creator.
 *   - A store in its free trial has no invoice to add an order to. A paid
 *     order there still costs its buyer a card payment, which nobody runs up
 *     for fun; a free copy costs nobody anything, so free copies in a trial
 *     stop at TRIAL_ORDERS a month (lib/free.ts), until the plan is paid or
 *     the month turns. A store with no plan gives no free copies at all.
 *
 * Nothing here touches the network or a secret: the pages that publish
 * these figures read the same ones the bill is made from.
 */
import type { Tier } from "@/lib/plan";
import { type PlanFields, standingOf } from "@/lib/plan-standing";

/** Orders every plan covers, per store, per calendar month. */
export const ORDERS_INCLUDED: Record<Tier, number> = {
  creator: 500,
  pro: 1_500,
  scale: 3_000,
};

/** What a thousand orders past that cost the creator, in cents: half a cent an order. */
export const ORDER_CENTS_PER_THOUSAND_OVER = 500;

/**
 * Orders a store has in a month of its free trial before free copies stop,
 * whichever plan the trial is of: what the smallest plan covers.
 */
export const TRIAL_ORDERS = ORDERS_INCLUDED.creator;

/** The orders a store's plan covers in a month. */
export function ordersIncluded(tier: Tier): number {
  return ORDERS_INCLUDED[tier] ?? ORDERS_INCLUDED.creator;
}

/** What a month's orders cost past the plan's, in whole cents, to the order and rounded down. */
export function ordersOwedCents(orders: number, tier: Tier): number {
  const included = ordersIncluded(tier);
  if (!Number.isFinite(orders) || orders <= included) return 0;
  return Math.floor(((Math.floor(orders) - included) * ORDER_CENTS_PER_THOUSAND_OVER) / 1000);
}

/**
 * How many orders a store may have in a month before free copies stop; null
 * for a store that pays, whose orders past its plan are charged instead.
 * A store with no plan gives no free copies whatever this says (lib/free.ts).
 */
export function freeCopiesLimitFor(store: PlanFields, nowSeconds = Date.now() / 1000): number | null {
  const standing = standingOf(store, nowSeconds);
  if (standing === "paid") return null;
  return standing === "trial" ? TRIAL_ORDERS : 0;
}

/** "1,204 orders", "1 order". */
export function ordersWords(orders: number): string {
  const counted = Number.isFinite(orders) && orders > 0 ? Math.floor(orders) : 0;
  return `${counted.toLocaleString("en-US")} ${counted === 1 ? "order" : "orders"}`;
}

/** What one order past a plan costs, in words: "half a cent". */
export function perOrderWords(centsPerThousand = ORDER_CENTS_PER_THOUSAND_OVER): string {
  const cents = centsPerThousand / 1000;
  if (cents === 0.5) return "half a cent";
  if (cents === 1) return "one cent";
  return `${Number(cents.toFixed(2))} of a cent`;
}
