/** Read-only checkout context. It cannot open sales or change a mission's state. */
export type PathCheckoutState = "preview" | "paused" | "setup" | "test" | "live";
export type PathCheckoutNotice = { state: PathCheckoutState; title: string; body: string };
export function pathCheckoutNotice(input: { plansOpen: boolean; suspended: boolean; checkoutReady: boolean; testMode: boolean }): PathCheckoutNotice {
  if (input.suspended) return { state: "paused", title: "Sales are paused for this store", body: "Review the notice in your studio. Your Path records remain available; preparing a mission does not reopen checkout." };
  if (!input.plansOpen) return { state: "preview", title: "Live sales are not available yet", body: "Marktmorgen is still in preview. You can prepare your offer and campaign pages. The first-sale mission needs a confirmed real Stripe order; preparation alone does not complete it." };
  if (!input.checkoutReady) return { state: "setup", title: "Review payments before inviting buyers", body: "Your store cannot open Stripe checkout right now. Review your payment connection and plan in the studio. Preparing your offer does not enable payments." };
  if (input.testMode) return { state: "test", title: "Stripe checkout is in test mode", body: "Test purchases do not count as real sales. Use test details only; never use a real card to complete a Path mission." };
  return { state: "live", title: "Stripe checkout is configured for live payments", body: "Each product still needs to be available for purchase. A mission closes only after Stripe confirms a real paid order; a full refund takes that sale back off." };
}
