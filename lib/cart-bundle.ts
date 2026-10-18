/**
 * The creator's own bundle, offered in the open cart when it holds what is
 * in the cart and makes the cart cost less (added 18 October 2026,
 * ClickFunnels audit row F13). Pure: the cart's route (app/api/store/cart)
 * gives it the cart's lines and the bundles, priced the way the checkout
 * charges them, and the cart in the browser swaps on the buyer's press.
 *
 * What it will and will not say:
 *
 *   - Only a bundle the creator made and sells now, at its own published
 *     price for this visitor's country, as the cart prices everything; never
 *     a product of anyone else, never a discount nobody published.
 *   - Only when swapping the products it holds for it makes the whole cart
 *     cost less, the store's deal for buying more counted both ways as the
 *     checkout would count it. The saving said is that difference, exactly;
 *     when there is none, nothing is offered and nothing is claimed.
 *   - It replaces, never adds: a buyer is never asked to pay twice for a
 *     product the cart already holds.
 *   - One bundle at the most: the one that saves the most, then the one that
 *     holds more of the cart, then the creator's own order.
 *
 * The bundles looked at are the ones the store's record already carries for
 * its first page (lib/catalog.ts, the catalog's head): the cart reads nothing
 * more to offer one.
 */
import { MAX_CART, type CartDeal, dealOff } from "@/lib/cart-rules";
import { salePrice } from "@/lib/store-sale";

export type CartLine = { id: string; cents: number };
export type BundleOffer = { id: string; cents: number; items: readonly string[] };

export type BundleSwap = {
  id: string;
  /** The cart's products the bundle holds, in the cart's order: what the swap takes out. */
  replaces: string[];
  /** How many more products the bundle holds. */
  more: number;
  /** The whole cart now, and after the swap, deal included, in the store's smallest unit. */
  before: number;
  after: number;
};

/** What a cart of these lines costs at the till, the deal for buying more included (lib/cart-rules.ts). */
export function cartTotal(lines: readonly { cents: number }[], deal: CartDeal | undefined): number {
  const off = dealOff(deal, lines.length);
  return lines.reduce((sum, line) => sum + salePrice(line.cents, off), 0);
}

/** The cart after swapping the products a bundle holds for it: what goes to the checkout. */
export function swapped(ids: readonly string[], swap: Pick<BundleSwap, "id" | "replaces">): string[] {
  const kept = ids.filter((id) => !swap.replaces.includes(id) && id !== swap.id);
  return [...kept, swap.id].slice(0, MAX_CART);
}

/** The bundle to offer for this cart, or null when none makes it cost less. */
export function bestBundleSwap(lines: readonly CartLine[], bundles: readonly BundleOffer[], deal: CartDeal | undefined): BundleSwap | null {
  if (lines.length === 0) return null;
  const before = cartTotal(lines, deal);
  let best: BundleSwap | null = null;
  for (const bundle of bundles) {
    if (lines.some((line) => line.id === bundle.id) || bundle.cents <= 0) continue;
    const held = new Set(bundle.items);
    const replaces = lines.filter((line) => held.has(line.id)).map((line) => line.id);
    if (replaces.length === 0) continue;
    const kept = lines.filter((line) => !held.has(line.id));
    const after = cartTotal([...kept, { cents: bundle.cents }], deal);
    if (after >= before) continue;
    const candidate: BundleSwap = { id: bundle.id, replaces, more: Math.max(0, held.size - replaces.length), before, after };
    if (!best || before - after > best.before - best.after || (before - after === best.before - best.after && replaces.length > best.replaces.length)) best = candidate;
  }
  return best;
}
