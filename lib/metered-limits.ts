/**
 * A short-window limit and a store's monthly figure, checked together
 * (added 17 October 2026). The short limit (lib/request-guard.ts,
 * withinLimit) keeps one connection or one loop from a burst; the figure is
 * what bounds the store's month, the one each plan's worst month prices
 * (tests/plan-cost-registry.ts):
 *
 *   withinStore    a public request a store answers: its cart, a search, a
 *                  download, the page after paying... counted with the pages
 *                  it draws (lib/traffic.ts, takePublicRequest).
 *   withinService  a call to another service made for a store: counted as
 *                  one of its "integration" figure (lib/store-allowance-rules.ts).
 *
 * The registry finds every scope used with either, so a public path or a
 * call out cannot be added without a figure.
 */
import { withinLimit } from "@/lib/request-guard";
import type { Store } from "@/lib/store";
import { takeAllowance } from "@/lib/store-allowance";
import { takePublicRequest } from "@/lib/traffic";

export async function withinStore(scope: string, who: string, limit: number, windowSeconds: number, store: Store, side: "public" | "buyer" = "public"): Promise<boolean> {
  if (!(await withinLimit(scope, who, limit, windowSeconds))) return false;
  return takePublicRequest(store, side);
}

export async function withinService(scope: string, who: string, limit: number, windowSeconds: number, store: Store): Promise<boolean> {
  if (!(await withinLimit(scope, who, limit, windowSeconds))) return false;
  return (await takeAllowance(store, "integration")).ok;
}
