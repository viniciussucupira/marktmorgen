import type { Listing, Store } from "@/lib/store";
import type { PageFunnel } from "@/lib/page-funnel";
import { readListings } from "@/lib/catalog";
import { canSell, canSellProduct } from "@/lib/store-checkout";
import { offeredItems } from "@/lib/bundles";
import { canGiveProduct } from "@/lib/free";
import { paypalReady, sellsThroughPayPal } from "@/lib/paypal-sales";
import { bundleReady } from "@/lib/bundle-rules";
import { planState, planPauseWords, bumpStates, bumpTargets, bumpPauseWords, limitedStock } from "@/lib/product-extras";

/** Saved configuration only: never opens a checkout or probes delivery URLs. */
export function paidStepProblem(store: Store, product: Listing, bundleItems: number): string | null {
  if (product.priceCents === 0 || product.hidden || product.call) return null;
  const paypal = paypalReady(store, product);
  if (!canSell(store) && !sellsThroughPayPal(store)) return "Payments are unavailable for this store. Review the store subscription and payment connection.";
  if (!canSellProduct(store, product) && !paypal) return "This paid offer is not sellable with its current delivery. Review its file, link, lessons, episodes or price options.";
  if (limitedStock(product) === 0) return "This offer has a configured quantity of zero. Review its quantity before sending buyers to checkout. Reservations and live stock have not been checked.";
  if (product.bundle && !bundleReady(product, bundleItems)) return "This bundle does not have enough deliverable products for the buyer's selection.";
  return null;
}

/** The same eligibility check used by the free product page; no email is sent. */
export function freeStepProblem(store: Store, product: Listing): string | null {
  if (product.priceCents !== 0 || product.hidden || product.call) return null;
  return canGiveProduct(store, product) ? null : "Free sign-up is unavailable with the saved configuration. Review delivery, the mailing list, the store subscription and email configuration.";
}

/** A suppressed payment plan does not mean the up-front purchase is blocked. */
export function planStepProblem(store: Store, product: Listing): string | null {
  if (product.hidden) return null;
  const state = planState(product);
  if (state && !("paused" in state) && !canSell(store)) return "The configured payment plan requires an available Stripe connection and store plan. Review installments separately from the up-front purchase, which may still be available through PayPal.";
  return state && "paused" in state
    ? "The configured payment plan is not offered to buyers. " + planPauseWords(state.paused, state.plan, product, store.currency) + " Review the plan separately from the up-front purchase."
    : null;
}

/** Explain saved order bumps suppressed by the checkout rules, without changing charges. */
export function bumpStepProblems(product: Listing, targets: Listing[]): string[] {
  if (product.hidden || !product.bumps?.length) return [];
  return bumpStates(targets, product).flatMap(state => {
    if (!("paused" in state)) return [];
    const target = targets.find(p => p.id === state.bump.productId);
    return ["A configured checkout add-on is not offered. " + bumpPauseWords(state.paused, target?.title ?? "") + " Review the add-on separately from the main purchase."];
  });
}

/** Strict reads: a storage failure is unknown, never a clean bill of health. */
export async function readFunnelPaymentChecks(store: Store, funnel: Pick<PageFunnel, "steps">): Promise<string[]> {
  const products = await readListings(store, funnel.steps.filter(s => s.kind === "product").map(s => s.id));
  const targetIds = [...new Set(products.flatMap(p => p.bumps?.length ? bumpTargets(p) : []))];
  const knownIds = new Set(products.map(p => p.id));
  const missingTargets = targetIds.filter(id => !knownIds.has(id));
  const targets = [...products, ...(missingTargets.length ? await readListings(store, missingTargets) : [])];
  const bundles = await offeredItems(store, products);
  return funnel.steps.flatMap((step, i) => {
    if (step.kind !== "product") return [];
    const product = products.find(p => p.id === step.id);
    if (!product) return ["Step " + (i + 1) + ": product could not be found. Review the step."];
    const issue = product.priceCents === 0 ? freeStepProblem(store, product) : paidStepProblem(store, product, bundles.get(product.id)?.length ?? 0);
    return [issue, planStepProblem(store, product), ...bumpStepProblems(product, targets)].filter((problem): problem is string => problem !== null)
      .map(problem => "Step " + (i + 1) + ", " + product.title + ": " + problem);
  });
}
