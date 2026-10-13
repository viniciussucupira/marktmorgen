import type { Listing, Store } from "@/lib/store";
import type { PageFunnel } from "@/lib/page-funnel";
import { readListings } from "@/lib/catalog";
import { canSell, canSellProduct } from "@/lib/store-checkout";
import { offeredItems } from "@/lib/bundles";
import { bundleReady } from "@/lib/bundle-rules";

/** Saved configuration only: never opens a checkout or probes delivery URLs. */
export function paidStepProblem(store: Store, product: Listing, bundleItems: number): string | null {
  if (product.priceCents === 0 || product.hidden || product.call) return null;
  if (!canSell(store)) return "Payments are unavailable for this store. Review the store subscription and payment connection.";
  if (!canSellProduct(store, product)) return "This paid offer is not sellable with its current delivery. Review its file, link, lessons, episodes or price options.";
  if (product.bundle && !bundleReady(product, bundleItems)) return "This bundle does not have enough deliverable products for the buyer's selection.";
  return null;
}

/** Strict reads: a storage failure is unknown, never a clean bill of health. */
export async function readFunnelPaymentChecks(store: Store, funnel: Pick<PageFunnel, "steps">): Promise<string[]> {
  const products = await readListings(store, funnel.steps.filter(s => s.kind === "product").map(s => s.id));
  const bundles = await offeredItems(store, products);
  return funnel.steps.flatMap((step, i) => {
    if (step.kind !== "product") return [];
    const product = products.find(p => p.id === step.id);
    if (!product) return ["Step " + (i + 1) + ": product could not be found. Review the step."];
    const issue = paidStepProblem(store, product, bundles.get(product.id)?.length ?? 0);
    return issue ? ["Step " + (i + 1) + ", " + product.title + ": " + issue] : [];
  });
}
