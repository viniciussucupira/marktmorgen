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
 *   - Since 17 October 2026 orders past that are not sold. They were billed
 *     at ORDER_CENTS_PER_THOUSAND_OVER, half a cent an order, against about a
 *     fifth of a cent of cost: more than the 17.2% of a price a cost may be
 *     and still leave the owner's 60% after a 27.5% tax. The price is not
 *     changed; it is no longer charged. Instead a paid store's new orders stop
 *     at its plan's figure (lib/order-admission.ts): every checkout, cart,
 *     tip, offer after paying, PayPal order, purchase for several people and
 *     free copy is admitted only while the month's orders, with the checkouts
 *     opened in the last day that may still be paid, are under the figure. A
 *     buyer past it is told plainly that the store is not taking new orders
 *     right now and nothing is charged; a checkout already open is never cut
 *     off, so a buyer in the middle of paying finishes, and gets everything.
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

/**
 * Orders every plan covers, per store, per calendar month, and where a paid
 * store's new orders stop.
 *
 * Store was 500 until October 17, 2026 and 400 that day (tests/spend-floor.test.ts);
 * the same day, when the per-plan worst case came to count every feature
 * (tests/plan-cost-registry.ts), Store went to 250, Studio from 1,500 to
 * 750 and Scale from 3,000 to 1,500. Orders are the cut that harms a
 * creator least for what they cost: an order is counted only while no share
 * of its sale is taken, and each figure is far more than the plan's visits
 * sell at an ordinary conversion rate (250 of Store's 2,850 public visits is
 * almost 9%, 750 of Studio's 9,500 about 8%).
 */
export const ORDERS_INCLUDED: Record<Tier, number> = {
  creator: 250,
  pro: 750,
  scale: 1_500,
};

/**
 * What a thousand orders past that cost the creator, in cents, until 17
 * October 2026: half a cent an order. Kept as the published price it was;
 * nothing is billed at it any more (see the top of this file).
 */
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

/**
 * How many orders a store may have in a month before free copies stop: the
 * plan's figure for a store that pays (where its paid orders stop too,
 * lib/order-admission.ts), the trial's in a trial. A store with no plan gives
 * no free copies whatever this says (lib/free.ts).
 */
export function freeCopiesLimitFor(store: PlanFields & { tier?: Tier }, nowSeconds = Date.now() / 1000): number {
  const standing = standingOf(store, nowSeconds);
  if (standing === "paid") return ordersIncluded(store.tier ?? "creator");
  return standing === "trial" ? TRIAL_ORDERS : 0;
}

/**
 * Where a store's new paid orders stop in a month, or null where they do not:
 * the plan's figure for a store that pays. A store in its free trial or with
 * no plan has no invoice past which an order could be sold; its paid orders
 * are a funded exposure (docs/funded-exposure-review.md), as before.
 */
export function paidOrdersLimitFor(store: PlanFields & { tier?: Tier }, nowSeconds = Date.now() / 1000): number | null {
  return standingOf(store, nowSeconds) === "paid" ? ordersIncluded(store.tier ?? "creator") : null;
}

/** "1,204 orders", "1 order". */
export function ordersWords(orders: number): string {
  const counted = Number.isFinite(orders) && orders > 0 ? Math.floor(orders) : 0;
  return `${counted.toLocaleString("en-US")} ${counted === 1 ? "order" : "orders"}`;
}
