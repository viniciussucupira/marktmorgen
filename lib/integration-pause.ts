/**
 * New connections to Zoom, Google Calendar and Meta while what costs us to
 * run is paused (232 [CA1] unit 4b3): the plan's renewal is unpaid, or a
 * payment for it is disputed (lib/plan-standing.ts costPauseCode).
 *
 * A new connection is new work on our side: tokens to keep, meetings to make
 * for every booking, and for Meta a daily read of the ad account. So while the
 * plan's costs are paused, starting a connection and finishing one (the
 * provider's return) are refused before any provider call, and Meta's daily
 * read and the account picker's read wait. Accounts already connected stay
 * connected, and disconnecting stays open: the creator can always take a
 * permission back.
 */
import { costPauseCode, type PlanFields } from "@/lib/plan-standing";

/** The word a connection route sends back to the studio, or null when the store's costs run. */
export function integrationPauseWord(store: Pick<PlanFields, "subscriptionActive" | "renewalUnpaidSince" | "planDisputes">, nowSeconds = Date.now() / 1000): "paused_unpaid" | "paused_disputed" | null {
  const code = costPauseCode(store, nowSeconds);
  return code === "renewal_unpaid" ? "paused_unpaid" : code === "plan_disputed" ? "paused_disputed" : null;
}

const KEPT = "Accounts already connected stay connected, and you can still disconnect any of them.";

/** What the studio says for each word, the same on the video calls, calendar and numbers pages. */
export const INTEGRATION_PAUSED_WORDS: Record<"paused_unpaid" | "paused_disputed", string> = {
  paused_unpaid: `Nothing was connected: your plan's renewal payment did not go through, so new connections wait until it is paid. Check the notice at the top of your studio to pay it. ${KEPT}`,
  paused_disputed: `Nothing was connected: a payment for your plan is disputed with your bank, so new connections wait until the dispute is settled. Check the notice at the top of your studio for what happens next. ${KEPT}`,
};

/** Meta's own notice adds that its daily read waits too. */
export const META_READ_PAUSED = "Reading your Meta ad spend also waits, and starts again on its own once everything starts again.";
