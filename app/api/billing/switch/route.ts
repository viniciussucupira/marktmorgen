import type { NextRequest } from "next/server";
import { away, creatorFrom } from "@/lib/studio-route";
import { isBillingConfigured, switchPlan } from "@/lib/billing";
import { PRO_ON_SALE, parseCycle, parseTier } from "@/lib/plan";
import { setSubscription } from "@/lib/store";
import { limited } from "@/lib/request-guard";
import { PLANS_ON_SALE } from "@/lib/opening";

/**
 * Moves the creator's own subscription to another plan or billing cycle.
 *
 * Like cancelling, the subscription is the one on the creator's store record,
 * never one named in the request. What it costs, or what it leaves as credit,
 * is said on the studio page before the button is pressed.
 */
export async function POST(request: NextRequest) {
  const creator = await creatorFrom(request, "billing");
  if (creator instanceof Response) return creator;
  const { ref, store, origin, studio } = creator;

  if (!isBillingConfigured()) return away(origin, studio("billing=unavailable"));
  if (!PLANS_ON_SALE) return away(origin, studio("billing=not-open"));
  if (!store.subscriptionId) return away(origin, studio("billing=none"));

  let fields: FormData | null = null;
  try {
    fields = await (await limited(request, 8_000)).formData();
  } catch {
    fields = null;
  }
  const cycle = parseCycle(fields?.get("cycle"));
  const tier = parseTier(fields?.get("tier") ?? store.tier);
  if (!cycle || !tier) return away(origin, studio("billing=switch-error"));
  if (tier !== "creator" && !PRO_ON_SALE) return away(origin, studio("billing=pro-closed"));

  try {
    const result = await switchPlan(store.subscriptionId, { tier, cycle });
    if (result.kind === "switched") {
      if (result.state.state === "active") {
        await setSubscription(ref, {
          active: true,
          tier: result.state.tier,
          cycle: result.state.cycle,
          trialEnds: result.state.trialing ? result.state.until : 0,
          shared: result.state.shared,
        });
      }
      const moved = result.state.state === "active" && result.state.tier !== store.tier ? `tier-${result.state.tier}` : cycle;
      return away(origin, studio(`billing=switched-${moved}`));
    }
    if (result.kind === "confirm") {
      return new Response(null, { status: 303, headers: { Location: result.url } });
    }
    if (result.kind === "same") return away(origin, studio("billing=same"));
    return away(origin, studio(`billing=switch-${result.reason}`));
  } catch (error) {
    console.error("switching the plan failed", error);
    return away(origin, studio("billing=switch-error"));
  }
}
