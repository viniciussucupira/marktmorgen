import { type NextRequest, after } from "next/server";
import { noticeCreator } from "@/lib/account-notice";
import { away, creatorFrom } from "@/lib/studio-route";
import { checkSeller, paypalSalesConfigured } from "@/lib/paypal-sales";
import { setPayPalSeller } from "@/lib/store";
import { reservePaidResourceWindow } from "@/lib/contract-resource-window";

/**
 * Where PayPal sends the creator back after onboarding. PayPal arrives by
 * redirect, a GET from another site, so the session cookie is what says who
 * this is. Which PayPal account is connected is asked of PayPal by the
 * store's own tracking id; the ids in the address PayPal returns to are not
 * trusted for it.
 */
export async function GET(request: NextRequest) {
  const creator = await creatorFrom(request, "payments", { checkOrigin: false });
  if (creator instanceof Response) return creator;
  const { ref, store, origin, studio } = creator;
  if (!paypalSalesConfigured()) return away(origin, studio("paypal=unavailable#paypal"));
  if (!store.statsId) return away(origin, studio("paypal=error#paypal"));
  if (store.period?.funded === true && !(await reservePaidResourceWindow(store))) return away(origin, studio("paypal=limited#paypal"));
  const checked = await checkSeller(store.statsId);
  if (!checked.ok) return away(origin, studio(`paypal=${checked.reason}#paypal`));
  const saved = await setPayPalSeller(ref, checked.merchant);
  if (!saved) return away(origin, studio("paypal=error#paypal"));
  if (store.paypalSeller?.merchant !== checked.merchant) after(() => noticeCreator(store, { kind: "paypal-connected" }));
  return away(origin, studio("paypal=ready#paypal"));
}
