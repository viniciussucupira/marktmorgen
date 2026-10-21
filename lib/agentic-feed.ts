import type { AgentCatalogEntry } from "@/lib/agentic-catalog";

/** Pinned ACP feed schema: 2026-04-17, upstream 7fdd78df677a94dce04c770644b0fbbb1401272b.
 * Internal partial upsert only. Never a full replacement or provider submission.
 */
export const ACP_FEED_BATCH_MAX = 24;
export const ACP_FEED_BATCH_BYTES = 64_000;
type Seller = { storeId: string; name: string; termsUrl: string; refundsUrl: string };
type FeedProduct = {
  id: string; title: string; description: { plain: string }; url: string;
  variants: { id: string; title: string; description: { plain: string }; url: string;
    price: { amount: number; currency: string }; availability: { available: boolean; status: string };
    seller: { name: string; links: { type: string; url: string }[] };
  }[];
};
const safeUrl = (raw: string) => {
  try {
    const value = new URL(raw);
    return value.protocol === "https:" && !value.username && !value.password && !value.hash ? value : null;
  } catch { return null; }
};
/** Inputs must come from the checked public projection, not raw store/product spreads. */
export function acpFeedBatch(entries: readonly AgentCatalogEntry[], seller: Seller): { products: FeedProduct[] } | null {
  if (!/^[0-9a-f]{32}$/.test(seller.storeId) || !seller.name.trim() || seller.name.length > 200) return null;
  if (!entries.length || entries.length > ACP_FEED_BATCH_MAX) return null;
  const terms = safeUrl(seller.termsUrl), refunds = safeUrl(seller.refundsUrl);
  if (!terms || !refunds || terms.origin !== refunds.origin) return null;
  const seen = new Set<string>();
  const products: FeedProduct[] = [];
  for (const entry of entries) {
    const url = safeUrl(entry.url);
    if (!url || url.origin !== terms.origin || !/^[A-Za-z0-9_-]{1,64}$/.test(entry.id) || seen.has(entry.id)) return null;
    if (!entry.name.trim() || entry.name.length > 80 || !entry.description.trim() || entry.description.length > 300) return null;
    if (!Number.isSafeInteger(entry.priceMinor) || entry.priceMinor < 0 || !/^[a-z]{3}$/.test(entry.currency)) return null;
    if (entry.availability !== "in_stock" && entry.availability !== "out_of_stock") return null;
    seen.add(entry.id);
    const id = seller.storeId + ":" + entry.id;
    const description = { plain: entry.description };
    products.push({
      id, title: entry.name, description, url: url.href,
      variants: [{
        id, title: entry.name, description: { plain: entry.description }, url: url.href,
        price: { amount: entry.priceMinor, currency: entry.currency.toUpperCase() },
        availability: { available: entry.availability === "in_stock", status: entry.availability },
        seller: { name: seller.name, links: [{ type: "terms_of_service", url: terms.href }, { type: "refund_policy", url: refunds.href }] },
      }],
    });
  }
  const result = { products };
  return Buffer.byteLength(JSON.stringify(result), "utf8") <= ACP_FEED_BATCH_BYTES ? result : null;
}
