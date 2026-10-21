import type { Listing } from "@/lib/catalog";
import { productSegment } from "@/lib/product-slug";

/** Internal projection only: no provider feed, route, checkout or activation. */
export const AGENTIC_COMMERCE_APPROVED: boolean = false;
type Context = { optedIn: boolean; storePublished: boolean; currency: string; productBase: string; terms: string; refunds: string; checkoutReady: boolean };
export type AgentCatalogEntry = { id: string; name: string; description: string; priceMinor: number; currency: string; availability: "in_stock" | "out_of_stock"; url: string; terms: string; refunds: string };

/** A caller must supply a current, complete stock reading. Unknown is refusal.
 * Complex pricing/delivery stays excluded until its protocol representation is verified.
 * Fields are copied explicitly; listingOf is not a public privacy boundary.
 */
export function projectAgentCatalogEntry(product: Listing, context: Context, remaining: { known: false } | { known: true; left: number | null }): AgentCatalogEntry | null {
  if (context.optedIn !== true || context.storePublished !== true || context.checkoutReady !== true || product.hidden !== false) return null;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(product.id) || !product.title.trim() || !product.summary.trim()) return null;
  if (!Number.isSafeInteger(product.priceCents) || product.priceCents < 0 || !/^[a-z]{3}$/.test(context.currency)) return null;
  if (product.options.length || product.recurring || product.call || product.pwyw || product.plan || product.intro || product.yearly || product.bundle || product.shipping || product.keys || product.callPackage) return null;
  if (remaining.known !== true || (remaining.left !== null && (!Number.isSafeInteger(remaining.left) || remaining.left < 0))) return null;
  if (product.stock !== null && remaining.left === null) return null;
  if (!context.terms.trim() || !context.refunds.trim()) return null;
  let base: URL;
  try { base = new URL(context.productBase); } catch { return null; }
  if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash || !base.pathname.endsWith("/p/")) return null;
  return {
    id: product.id, name: product.title, description: product.summary,
    priceMinor: product.priceCents, currency: context.currency,
    availability: remaining.left === null || remaining.left > 0 ? "in_stock" : "out_of_stock",
    url: new URL(productSegment(product), base).href,
    terms: context.terms, refunds: context.refunds,
  };
}
