/**
 * Orders past what a plan covers, put on the creator's next invoice.
 *
 * lib/order-rules.ts says what is covered and what a thousand orders past it
 * cost; lib/orders.ts keeps each store's count. How a month is settled, and
 * why never twice, is in lib/usage-billing.ts, shared with lesson video and
 * visits.
 *
 *   nl:orders:billed:<folder>:<month>   cents of that month already on an invoice
 *   nl:orders:adding:<folder>:<month>   a line being added, until it is known to be there
 *   nl:orders:told:<folder>:<month>     the creator was written to about that month
 */
import { type Meter, type Settled, firstWordOf, settleAllUsage, settleUsage } from "@/lib/usage-billing";
import { orderedFolders, ordersIn } from "@/lib/orders";
import { ORDERS_INCLUDED, ordersIncluded, ordersOwedCents, ordersWords } from "@/lib/order-rules";
import { countWords } from "@/lib/traffic-rules";
import { monthWords } from "@/lib/watch-rules";

export const ORDERS: Meter = {
  name: "orders",
  measured: ordersIn,
  // A store nobody is known to own owes nothing: there is no plan to work it out from.
  owed: (orders, store) => (store ? ordersOwedCents(orders, store.tier) : 0),
  byPlan: true,
  // Under the fewest orders any plan covers, nothing is owed.
  covered: Math.min(...Object.values(ORDERS_INCLUDED)),
  describe: (month, orders, store) =>
    `Orders past your plan's ${countWords(ordersIncluded(store?.tier ?? "creator"))} in ${monthWords(month)} (${ordersWords(orders)} so far)`,
  folders: orderedFolders,
};

export type { Settled };

/** Settles one store's month of orders. `final` when the month is over: whatever is left is billed, however small. */
export function settleOrders(folder: string, month: string, final: boolean, now = Date.now()): Promise<Settled> {
  return settleUsage(ORDERS, folder, month, final, now);
}

/** The daily run: this month for every store with orders counted, and the month before while it is still being closed. */
export function settleAllOrders(now = Date.now()): Promise<Settled[]> {
  return settleAllUsage(ORDERS, now);
}

/** Whether the creator still has to be written to about this month's orders: true the first time it is asked, and never again. */
export function firstWordOnOrders(folder: string, month: string): Promise<boolean> {
  return firstWordOf(ORDERS, folder, month);
}
