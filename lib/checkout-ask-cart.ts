/**
 * A reminder asked for about a whole cart (lib/checkout-ask.ts): it waits in
 * the same queue as one about a product, under the same rules, with its
 * products where a product's id would be, as "cart:<id>,<id>".
 */
import { MAX_CART, readCartIds } from "@/lib/cart-rules";

export const CART_ASK = "cart:";

/** What a cart's ask keeps for its products. */
export function cartAskKey(ids: string[]): string {
  return `${CART_ASK}${readCartIds(ids).join(",")}`;
}

/** The products of a cart's ask, or null when the ask is about one product. */
export function cartAskIds(productId: string): string[] | null {
  if (!productId.startsWith(CART_ASK)) return null;
  const ids = readCartIds(productId.slice(CART_ASK.length).split(",")).slice(0, MAX_CART);
  return ids.length ? ids : null;
}
