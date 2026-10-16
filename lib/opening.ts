/**
 * Whether Marktmorgen is open.
 *
 * Open means one thing: a creator can start a paid plan, which is the only
 * moment we take a card. While it is not, the site is a preview of something
 * still being built, and it says so on every public page instead of leaving
 * a visitor to work it out from a list: a store can be opened and set up, and
 * no plan can be started (app/api/billing/checkout/route.ts refuses, and the
 * studio shows no button that would be refused).
 *
 * A store that already pays is left exactly as it is: changing, canceling
 * and keeping a subscription do not read this.
 *
 * The server and browser read the same answer. Requesting opening is not
 * enough: the per-customer, after-tax margin review must also be complete.
 */
import { commercialPlansMayOpen } from "@/lib/commercial-margin";

const OPENING_REQUESTED: boolean = false;
export const PLANS_ON_SALE: boolean = commercialPlansMayOpen(OPENING_REQUESTED);

/** What every public page says at its top while plans are not on sale. */
export const PREVIEW_LINE =
  "Marktmorgen is still being built. You can open a store and set it up today; its paid plans are not on sale yet.";

/** Where that line sends somebody who wants the detail: both lists, in full. */
export const PREVIEW_LINK = { href: "/mission", label: "See what is built" };

/**
 * The words on a button that leads to making a store. The free days belong
 * to a plan, so a button promises them only while a plan can be started.
 */
export function startWords(trialDays: number): string {
  return PLANS_ON_SALE ? `Try it free for ${trialDays} days` : "Start your store";
}
