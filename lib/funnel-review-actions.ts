import { paypalSalesConfigured } from "@/lib/paypal-sales";
import { studioPath } from "@/lib/studio-route";
import { can, type Role } from "@/lib/team-roles";
import type { Store } from "@/lib/store";

export type FunnelRepairAction = { label: string; href: string };
/** Navigation only. The destination still checks permissions on every request. */
export function funnelRepairActions(store: Pick<Store, "sid">, role: Role): FunnelRepairAction[] {
  const home = studioPath(store);
  return [
    ...(can(role, "products") ? [{ label: "Review products and delivery", href: home + "#products" }] : []),
    ...(can(role, "page") ? [{ label: "Review your pages", href: studioPath(store, "", "site") }] : []),
    ...(can(role, "payments") ? [
      { label: "Review Stripe connection", href: home + "#stripe" },
      ...(paypalSalesConfigured() ? [{ label: "Review PayPal connection", href: home + "#paypal" }] : []),
    ] : []),
    ...(can(role, "billing") ? [{ label: "Review store plan", href: home + "#billing" }] : []),
  ];
}
