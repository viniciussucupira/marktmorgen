import type { NextRequest } from "next/server";
import { away, creatorFrom } from "@/lib/studio-route";
import { isBillingConfigured, readStartedSubscription } from "@/lib/billing";
import { setSubscription } from "@/lib/store";
import { dropPause } from "@/lib/plan-pause";

/**
 * Where Stripe sends a creator who has finished, or looked like they finished.
 *
 * The session id in the URL is a claim made by a browser, so nothing is
 * believed until Stripe is asked what that session actually created and
 * whether it belongs to this store. Coming back through this door proves the
 * door was walked through, nothing more.
 */
export async function GET(request: NextRequest) {
  const creator = await creatorFrom(request, "billing", { checkOrigin: false });
  if (creator instanceof Response) return creator;
  const { ref, store, origin, studio } = creator;

  if (!isBillingConfigured()) return away(origin, studio("billing=unavailable"));

  const sessionId = request.nextUrl.searchParams.get("session_id") ?? undefined;

  try {
    const started = await readStartedSubscription(store, sessionId);
    if (!started) return away(origin, studio("billing=unfinished"));

    const saved = await setSubscription(ref, {
      customerId: started.customerId,
      subscriptionId: started.subscriptionId,
      active: started.active,
      tier: started.tier,
      cycle: started.cycle,
      trialEnds: started.trialEnds,
    });
    if (!saved) return away(origin, studio("billing=error"));
    // Started again by hand during a break: there is nothing left for the
    // break to start (lib/plan-pause.ts).
    if (started.active) await dropPause(saved).catch((error) => console.error("dropping a break failed", error));

    return away(origin, studio(`billing=${started.active ? "on" : "pending"}`));
  } catch (error) {
    // Stripe did not answer just now. The payment, if there was one, is not
    // lost: it is found by the store's address, when the creator presses
    // start again and by the daily job (lib/billing-sync.ts). So the creator
    // is told that, rather than that nothing was charged.
    console.error("billing return failed", error);
    return away(origin, studio("billing=unconfirmed"));
  }
}
