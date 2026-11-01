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
 *   - When they share none, the cart says which products do not go where the
 *     others go, before anybody pays, so the buyer can take one out.
 *   - Shipping is each physical product's own amount, as its creator set it
 *     ("one amount per order" on each), added together, so no product ships
 *     for less than its creator asked. Shipping by quantity, and combining
 *     amounts, is 515 [PF3]'s.
 *
 * Digital products in the cart ship nothing and change none of this.
 * Browser-safe: the cart shows the same answer the checkout acts on.
 */
import type { Shipping } from "@/lib/shipping";

export type CartItem = { id: string; title: string; shipping: Pick<Shipping, "cents" | "countries"> | null };

export type CartShipping =
  /** Nothing in the cart is shipped. */
  | { kind: "none" }
  /** One address, in one of `countries`; `cents` is the shipping for the order. */
  | { kind: "ships"; countries: string[]; cents: number }
  /** No country is shared: `apart` are the products that ship to none of the countries most of the others share. */
  | { kind: "apart"; apart: { id: string; title: string }[] };

/** Where a cart can be sent and what shipping comes to, from its physical products. */
export function cartShipping(items: CartItem[]): CartShipping {
  const shipped = items.filter((item): item is CartItem & { shipping: NonNullable<CartItem["shipping"]> } => item.shipping !== null);
  if (shipped.length === 0) return { kind: "none" };
  let shared = new Set(shipped[0].shipping.countries);
  for (const item of shipped.slice(1)) shared = new Set(item.shipping.countries.filter((code) => shared.has(code)));
  if (shared.size > 0) {
    const order = shipped[0].shipping.countries.filter((code) => shared.has(code));
    return { kind: "ships", countries: order, cents: shipped.reduce((sum, item) => sum + Math.max(0, Math.round(item.shipping.cents)), 0) };
  }
  // The country most of them reach; the ones that do not reach it are the ones to name.
  const reach = new Map<string, number>();
  for (const item of shipped) for (const code of new Set(item.shipping.countries)) reach.set(code, (reach.get(code) ?? 0) + 1);
  const most = Math.max(0, ...reach.values());
  const best = [...reach].filter(([, n]) => n === most).map(([code]) => code);
  const apart = shipped.filter((item) => !best.some((code) => item.shipping.countries.includes(code)));
  // Every product equally alone (nothing shared by two or more): name all but the first.
  const named = apart.length > 0 && apart.length < shipped.length ? apart : shipped.slice(1);
  return { kind: "apart", apart: named.map(({ id, title }) => ({ id, title })) };
}
