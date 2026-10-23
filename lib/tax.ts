/**
 * Sales tax, calculated by Stripe Tax on the creator's own account.
 *
 * The creator is the seller, so the tax is theirs to collect and to file, and
 * Stripe Tax is set up in their own Stripe dashboard: their head office, what
 * they sell, and where they are registered. Marktmorgen only switches it on for
 * their checkouts once Stripe says that setup is complete, because a checkout
 * that asks for tax on an account not ready for it fails or charges none.
 */
import { onAccount, StripeError } from "@/lib/stripe-account";
import type { Store } from "@/lib/store";

export type TaxSetting = {
  enabled: boolean;
  included: boolean;
  /**
   * Whether the checkout offers a business buyer the box for their VAT, GST or
   * other tax number, where Stripe supports one for the buyer's country. The
   * number is kept on the creator's own customer and printed on the invoice.
   *
   * What it does to the tax is Stripe Tax's doing, not this box's: with tax on
   * above, Stripe applies the reverse charge or the zero rate where the law
   * says so. With tax off, the number is written down and nothing else
   * changes. Stripe checks the format while the buyer types and the number
   * itself afterwards; whether an unverified one is acceptable stays the
   * creator's call, as the seller.
   */
  ids: boolean;
  /**
   * Whether Stripe draws up an invoice for every single payment, on the
   * creator's account, with the creator as the seller and tax as its own line.
   * Stripe sends the buyer the link to its PDF when the creator has "Successful
   * payments" emails on in their Stripe settings.
   *
   * Stripe charges the creator for each of these (0.4% of the payment, at most
   * $2, when this was written on 6 October 2026), which is why it is a switch
   * and why it is never on for a store that did not ask for it.
   */
  invoices: boolean;
};

export const NO_TAX: TaxSetting = { enabled: false, included: false, ids: false, invoices: false };

export function parseTax(raw: unknown): TaxSetting {
  if (!raw || typeof raw !== "object") return { ...NO_TAX };
  const value = raw as Record<string, unknown>;
  // A setting written before the last two existed reads them as off. One of
  // them costs the creator money at Stripe, and neither changes a checkout
  // that somebody else already decided how to run.
  return {
    enabled: value.enabled === true,
    included: value.included === true,
    ids: value.ids === true,
    invoices: value.invoices === true,
  };
}

export type TaxStatus = { state: "active" } | { state: "pending"; missing: string[] } | { state: "unknown" };

/** Whether Stripe Tax is ready on the creator's account, as Stripe says. */
export async function taxStatus(store: Store): Promise<TaxStatus> {
  if (!store.stripeAccountId) return { state: "unknown" };
  try {
    const settings = await onAccount("GET", store.stripeAccountId, "/tax/settings");
    // A successful HTTP response can still be unreadable or introduce a new
    // status. Only an explicit pending status means setup is incomplete.
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) return { state: "unknown" };
    if (settings.status === "active") return { state: "active" };
    if (settings.status !== "pending") return { state: "unknown" };
    const details = settings.status_details as { pending?: { missing_fields?: unknown } } | null;
    const missing = Array.isArray(details?.pending?.missing_fields) ? (details!.pending!.missing_fields as string[]) : [];
    return { state: "pending", missing };
  } catch (error) {
    console.error("reading tax settings failed", error);
    return { state: "unknown" };
  }
}

/** The fields a checkout needs when tax is on, for every line it charges. */
export function applyTax(store: Store, body: URLSearchParams): void {
  if (!store.tax.enabled) return;
  body.set("automatic_tax[enabled]", "true");
  for (const key of [...body.keys()]) {
    const line = /^line_items\[(\d+)\]\[price_data\]\[unit_amount\]$/.exec(key);
    if (line) body.set(`line_items[${line[1]}][price_data][tax_behavior]`, store.tax.included ? "inclusive" : "exclusive");
  }
}

/**
 * The two things a business buyer needs and a store page cannot give them: the
 * box for their tax number, and an invoice they can file.
 *
 * Both are Stripe's own, drawn on the creator's account, so the seller named on
 * the document is the creator and no money moves anywhere new. Read against
 * Stripe's own pages on 6 October 2026 (docs.stripe.com/tax/checkout/tax-ids
 * and docs.stripe.com/receipts), and sent to Stripe's test mode every day
 * (lib/verify-stripe.ts), so a field Stripe stops taking is heard about.
 *
 * A subscription's invoice is left alone: Stripe already draws one up for
 * every payment of a subscription, and the field that asks for one belongs to
 * single payments only.
 */
export function applyTaxDocuments(store: Store, body: URLSearchParams, subscription: boolean): void {
  if (store.tax.ids) {
    body.set("tax_id_collection[enabled]", "true");
    // Offered, never demanded. A buyer with no tax number is a buyer, and a
    // checkout that stops them to ask for one they do not have is a lost sale.
    body.set("tax_id_collection[required]", "never");
    // Kept on a customer of the creator's rather than only on the checkout:
    // Stripe checks a number against the government's register afterwards,
    // and reports what it found only for a number that was saved to one. A
    // subscription always has a customer, and Stripe refuses the field there.
    if (!subscription) body.set("customer_creation", "always");
  }
  if (store.tax.invoices && !subscription) {
    body.set("invoice_creation[enabled]", "true");
  }
}

/** Whether this checkout asks Stripe for either of them. */
function carriesTaxDocuments(body: URLSearchParams): boolean {
  return body.has("tax_id_collection[enabled]") || body.has("invoice_creation[enabled]");
}

/**
 * The same checkout without them, for an account Stripe refuses them on. The
 * customer stays asked for: another part of the checkout may be the one that
 * asked (lib/store-checkout.ts keeps a card for the offer after paying), and
 * a customer kept on the creator's account never stopped a checkout.
 */
export function withoutTaxDocuments(body: URLSearchParams): void {
  body.delete("tax_id_collection[enabled]");
  body.delete("tax_id_collection[required]");
  body.delete("invoice_creation[enabled]");
}

/** Whether Stripe's refusal is about the fields above. */
export function refusedTaxDocuments(error: unknown): boolean {
  return (
    error instanceof StripeError &&
    error.status === 400 &&
    /tax_id_collection|invoice_creation|tax id|invoice/i.test(error.message)
  );
}

/**
 * Opens a checkout that may carry them and, when Stripe refuses them on this
 * account, opens it once more without them.
 *
 * A tax number box and an invoice are worth a great deal to a business buyer
 * and nothing at all to a sale that never happens, so neither is ever the
 * reason a checkout fails to open.
 */
export async function openKeepingTheSale<T>(body: URLSearchParams, open: () => Promise<T>): Promise<T> {
  try {
    return await open();
  } catch (error) {
    if (!carriesTaxDocuments(body) || !refusedTaxDocuments(error)) throw error;
    console.error("checkout refused the tax number box or the invoice; opened without them", error);
    withoutTaxDocuments(body);
    return open();
  }
}
