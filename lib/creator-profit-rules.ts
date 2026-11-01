/**
 * The creator's own profit, before taxes (545 [LU1], unit 1; added
 * 1 November 2026): per order and per product, with where each number comes
 * from. Not Marktmorgen's own margin (lib/company-margin-report.ts), which
 * is another thing entirely.
 *
 *   paid      the order's payments, from the creator's own Stripe account
 *   refunded  what was given back, from the same place
 *   fee       Stripe's real fee on each payment, read from its balance
 *             transaction, never estimated
 *   cost      what the creator entered as their cost per sale; empty is
 *             "not set", never 0
 *   ads       ads the creator already recorded
 *
 * A cost not set makes that line "Incomplete: cost not set"; a fee or a
 * payment that could not be read makes it "Count unavailable". Neither is
 * ever counted as zero. Each currency stands on its own: nothing converted.
 * Always said: before taxes, and nothing about the creator's taxes.
 *
 * Reading the fees, keeping the costs, the panel and the export are the next
 * units. Browser-safe: plain data and pure functions.
 */
import { formatMoney, readMoney, type Currency } from "@/lib/money";

/** The sentence that always goes with the panel and the export. */
export const BEFORE_TAXES = "Before taxes. Marktmorgen does not know your taxes; check with your own tax rules.";

/** Where each number comes from, said beside it. */
export const SOURCES = { paid: "from your Stripe account", refunded: "from your Stripe account", fee: "from your Stripe account", cost: "you entered", ads: "recorded ads" } as const;

/** The most a cost per sale may be, in the smallest unit: the same ceiling as a price. */
const MAX_COST = 100_000_000;

/** The creator's cost per sale as typed: an amount in the store's currency, or null when left empty ("not set"); undefined when it is not an amount. */
export function readCostPerSale(raw: string, currency: Currency): number | null | undefined {
  if (!raw.trim()) return null;
  const cents = readMoney(raw, currency);
  return cents === null || cents < 0 || cents > MAX_COST ? undefined : cents;
}

export type OrderLine = { productId: string; units: number; costPerSale: number | null };
export type OrderMoney = {
  currency: string;
  paid: number | null;
  refunded: number | null;
  fee: number | null;
  lines: OrderLine[];
  /** Shipping labels and print on demand, once those exist: null when they could not be read. */
  otherCosts: number | null;
};

export type Profit = { state: "complete"; cents: number } | { state: "incomplete"; why: "cost not set" } | { state: "unavailable" };

const known = (n: number | null): n is number => n !== null && Number.isSafeInteger(n) && n >= 0;

/** One order's profit before taxes. */
export function orderProfit(order: OrderMoney): Profit {
  if (!known(order.paid) || !known(order.refunded) || !known(order.fee) || !known(order.otherCosts)) return { state: "unavailable" };
  if (order.lines.some((l) => l.costPerSale === null)) return { state: "incomplete", why: "cost not set" };
  const cost = order.lines.reduce((n, l) => n + (l.costPerSale as number) * Math.max(0, Math.trunc(l.units)), 0);
  return { state: "complete", cents: order.paid - order.refunded - order.fee - cost - order.otherCosts };
}

/**
 * A period's profit, per currency: the orders' profits added up, less the
 * ads recorded in that currency. One incomplete or unavailable order makes
 * its currency's total so too, said as such.
 */
export function periodProfit(orders: OrderMoney[], ads: Record<string, number | null>): Map<string, Profit> {
  const out = new Map<string, Profit>();
  for (const order of orders) {
    const so = out.get(order.currency) ?? { state: "complete", cents: 0 };
    const one = orderProfit(order);
    if (so.state === "unavailable" || one.state === "unavailable") out.set(order.currency, { state: "unavailable" });
    else if (so.state === "incomplete" || one.state === "incomplete") out.set(order.currency, { state: "incomplete", why: "cost not set" });
    else out.set(order.currency, { state: "complete", cents: so.cents + one.cents });
  }
  for (const [currency, profit] of out) {
    const spent = Object.hasOwn(ads, currency) ? ads[currency] : 0;
    if (profit.state === "complete") out.set(currency, known(spent) ? { state: "complete", cents: profit.cents - spent } : { state: "unavailable" });
  }
  return out;
}

/** How a profit reads: a loss said in words, never only by a color. */
export function profitWords(profit: Profit, currency: string): string {
  if (profit.state === "unavailable") return "Count unavailable";
  if (profit.state === "incomplete") return "Incomplete: cost not set";
  if (profit.cents < 0) return `${formatMoney(-profit.cents, currency)} loss`;
  return formatMoney(profit.cents, currency);
}

/** One row of the export: the same words as the panel, so the file never says more than the page. */
export function csvRow(cells: (string | number)[]): string {
  return cells.map((cell) => {
    const text = String(cell);
    // A cell that starts like a formula is kept as text in a spreadsheet.
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  }).join(",");
}
