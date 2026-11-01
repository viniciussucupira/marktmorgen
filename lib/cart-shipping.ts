/**
 * Physical products in the cart (513 [PF1], unit 1; added 1 November 2026):
 * the rules, before the checkout uses them.
 *
 * A product shipped by the creator (lib/shipping.ts) is sold today on its
 * own. In a cart, with other physical products and with digital ones, it is
 * paid in one direct charge on the creator's Stripe account, and Stripe asks
 * for one address. So:
 *
 *   - The address may be in a country every physical product in the cart
 *     ships to, and only there: the countries Stripe offers are the ones they
 *     all share.
 *   - When they share none, the cart names the fewest products to take out
 *     (those that do not reach the one country most of them reach, the
 *     buyer's own when it is one of those), before anybody pays.
 *   - A physical product whose shipping cannot be read (or has no country,
 *     or an amount out of its bounds) is refused, never taken as digital.
 *   - Shipping is each physical product's own amount, as its creator set it
 *     ("one amount per order" on each), added together, so no product ships
 *     for less than its creator asked. Shipping by quantity, and combining
 *     amounts, is 515 [PF3]'s.
 *
 * Digital products in the cart ship nothing and change none of this.
 * Browser-safe: the cart shows the same answer the checkout acts on.
 */
import { MAX_SHIPPING_CENTS, type Shipping } from "@/lib/shipping";

/**
 * A product as the cart has it. `physical` comes from the product itself, so
 * a physical product whose shipping cannot be read is refused, never taken
 * for a digital one (unknown fails).
 */
export type CartItem = { id: string; title: string; physical: boolean; shipping: Pick<Shipping, "cents" | "countries"> | null };

export type CartShipping =
  /** Nothing in the cart is shipped. */
  | { kind: "none" }
  /** One address, in one of `countries`; `cents` is the shipping for the order, made of each product's own `each`. */
  | { kind: "ships"; countries: string[]; cents: number; each: { id: string; cents: number }[] }
  /** No country is shared: take out `apart`, the fewest products, and the rest ship to `to`. */
  | { kind: "apart"; to: string; apart: { id: string; title: string }[] }
  /** A physical product whose shipping cannot be read or is out of its bounds: it cannot be bought in a cart. */
  | { kind: "unreadable"; items: { id: string; title: string }[] };

const readable = (cents: number) => Number.isSafeInteger(cents) && cents >= 0 && cents <= MAX_SHIPPING_CENTS;

/**
 * Where a cart can be sent and what shipping comes to, from its physical
 * products. `buyerCountry`, when known, is preferred when nothing is shared,
 * so the product the buyer can receive is never the one named.
 */
export function cartShipping(items: CartItem[], buyerCountry?: string): CartShipping {
  const physical = items.filter((item) => item.physical || item.shipping !== null);
  if (physical.length === 0) return { kind: "none" };
  const bad = physical.filter((item) => !item.shipping || !readable(item.shipping.cents) || item.shipping.countries.length === 0);
  if (bad.length > 0) return { kind: "unreadable", items: bad.map(({ id, title }) => ({ id, title })) };
  const shipped = physical.map((item) => ({ id: item.id, title: item.title, cents: item.shipping!.cents, countries: [...new Set(item.shipping!.countries)] }));

  let shared = new Set(shipped[0].countries);
  for (const item of shipped.slice(1)) shared = new Set(item.countries.filter((code) => shared.has(code)));
  if (shared.size > 0) {
    return {
      kind: "ships",
      countries: shipped[0].countries.filter((code) => shared.has(code)),
      cents: shipped.reduce((sum, item) => sum + item.cents, 0),
      each: shipped.map(({ id, cents }) => ({ id, cents })),
    };
  }
  // One country: the one most of them reach (the buyer's first, on a tie or when reached at all by the most),
  // then the first in the cart's own order. Taking out what does not reach it leaves the fewest to take out.
  const reach = new Map<string, number>();
  for (const item of shipped) for (const code of item.countries) reach.set(code, (reach.get(code) ?? 0) + 1);
  const most = Math.max(...reach.values());
  const order = shipped.flatMap((item) => item.countries).filter((code, i, all) => all.indexOf(code) === i);
  const best = order.filter((code) => reach.get(code) === most);
  const to = buyerCountry && best.includes(buyerCountry) ? buyerCountry : best[0];
  return { kind: "apart", to, apart: shipped.filter((item) => !item.countries.includes(to)).map(({ id, title }) => ({ id, title })) };
}
