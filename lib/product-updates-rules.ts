/**
 * The rules of telling a product's buyers about an update, which the studio's
 * browser reads too. The sending is lib/product-updates.ts, server only.
 */
import type { Listing } from "@/lib/store";

/** How often one product's buyers may be told of an update. */
export const UPDATE_GAP_SECONDS = 7 * 86_400;
/** The most buyers one update goes to. */
export const MAX_UPDATE_RECIPIENTS = 5_000;
/** The longest the creator's own words may be. */
export const MAX_UPDATE_NOTE = 1_500;

/** Whether a product's buyers can be told of an update: one bought once that hands something over. */
export function canTellBuyers(product: Pick<Listing, "priceCents" | "recurring" | "call">): boolean {
  return product.priceCents > 0 && product.recurring === null && product.call === null;
}
