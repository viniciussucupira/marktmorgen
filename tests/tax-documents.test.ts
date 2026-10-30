/**
 * The tax number box and the invoice: what a checkout carries when a creator
 * switches them on, and that neither is ever the reason a checkout fails to
 * open.
 *
 * Measured before it was built (6 October 2026): Gumroad takes a business
 * buyer's VAT number at checkout and has an invoice generator; Teachable
 * takes a VAT ID at checkout; Stan's help center names neither. Here both are
 * Stripe's own, on the creator's account, so the creator stays the seller.
 */
import { TEST_CONSENT } from "./digital-consent-fixture";
import { addProduct, claimHandle, ensureStatsId, setProductLink, setStripeAccount, setSubscription, setTax, storeForEmail, type Listing, type Product, type Store } from "@/lib/store";
import { readProduct } from "@/lib/catalog";
import { createCheckout } from "@/lib/store-checkout";
import { callCheckoutBody } from "@/lib/calls";
import { packageCheckoutBody } from "@/lib/call-packages";
import { StripeError } from "@/lib/stripe-account";
import { NO_TAX, openKeepingTheSale, parseTax, refusedTaxDocuments } from "@/lib/tax";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

const OWNER = "owner@example.com";
const checkouts: URLSearchParams[] = [];
/** How Stripe answers the next checkouts: refusing any that carries a field named here. */
let refuses: string[] = [];

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const path = url.pathname.replace(/^\/v1/, "");
  if (path === "/checkout/sessions" && (init?.method ?? "GET") === "POST") {
    const body = new URLSearchParams(String(init?.body));
    checkouts.push(body);
    const refused = refuses.find((field) => body.has(field));
    if (refused) {
      return new Response(JSON.stringify({ error: { code: "parameter_unknown", message: `Received unknown parameter: ${refused.replace(/\[.*$/, "")}` } }), { status: 400 });
    }
    return new Response(JSON.stringify({ id: `cs_test_${"t".repeat(24)}`, url: "https://checkout.stripe.com/c/pay/test" }));
  }
  return new Response("{}", { status: 404 });
}) as typeof fetch;

/** The fields in question, as the last checkout carried them. */
function carried(body: URLSearchParams): (string | null)[] {
  return [
    body.get("tax_id_collection[enabled]"),
    body.get("tax_id_collection[required]"),
    body.get("invoice_creation[enabled]"),
    body.get("customer_creation"),
  ];
}

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_tax_only_a_stand_in";

  part("Reading the setting");
  is("nothing saved is everything off", parseTax(null), NO_TAX);
  is("a setting saved before these existed reads them as off", parseTax({ enabled: true, included: true }), { enabled: true, included: true, ids: false, invoices: false });
  is("only a plain true switches one on", parseTax({ ids: "yes", invoices: 1 }), NO_TAX);
  is("each stands on its own, without sales tax", parseTax({ ids: true, invoices: true }), { enabled: false, included: false, ids: true, invoices: true });

  part("A single payment");
  await claimHandle(OWNER, "harbor", "Harbor Kitchen", "");
  await ensureStatsId(OWNER);
  await setStripeAccount(OWNER, "acct_1TestHarbor0001", true);
  await setSubscription(OWNER, { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, period: paidPeriod() });
  const made = await addProduct(OWNER, "Bread Book", "", "49", null);
  if (!made.ok) throw new Error("no product");
  await setProductLink(OWNER, made.product.id, "https://example.com/bread");
  const open = async (product: string): Promise<URLSearchParams> => {
    const store = (await storeForEmail(OWNER))!;
    const full = (await readProduct(store, product))!;
    await createCheckout(store, full, "https://marktmorgen.com", "", { digitalConsent: TEST_CONSENT });
    return checkouts[checkouts.length - 1];
  };

  is("a store that switched neither on sends neither", carried(await open(made.product.id)), [null, null, null, null]);

  await setTax(OWNER, { enabled: false, included: false, ids: true, invoices: true });
  is("both on: the box offered and never demanded, an invoice, and a customer to keep the number on", carried(await open(made.product.id)), ["true", "never", "true", "always"]);

  await setTax(OWNER, { enabled: false, included: false, ids: false, invoices: true });
  is("the invoice alone asks for no customer: Stripe makes the one an invoice needs", carried(await open(made.product.id)), [null, null, "true", null]);

  await setTax(OWNER, { enabled: false, included: false, ids: true, invoices: false });
  is("the box alone", carried(await open(made.product.id)), ["true", "never", null, "always"]);

  part("A membership");
  const member = await addProduct(OWNER, "Bread Club", "", "15", { interval: "month", trialDays: 0, payments: 0 });
  if (!member.ok) throw new Error("no membership");
  await setProductLink(OWNER, member.product.id, "https://example.com/club");
  await setTax(OWNER, { enabled: false, included: false, ids: true, invoices: true });
  const club = await open(member.product.id);
  is("it is a subscription", club.get("mode"), "subscription");
  is("the box, and nothing Stripe takes for single payments only", carried(club), ["true", "never", null, null]);

  part("Never the reason a checkout fails to open");
  let before = checkouts.length;
  refuses = ["invoice_creation[enabled]"];
  const after = await open(made.product.id);
  is("refused once, opened again", checkouts.length - before, 2);
  is("the first try carried them", carried(checkouts[before]), ["true", "never", "true", "always"]);
  is("the second carried neither, and sold", carried(after).slice(0, 3), [null, null, null]);
  is("what the buyer is charged did not change", after.get("line_items[0][price_data][unit_amount]"), "4900");

  before = checkouts.length;
  refuses = ["line_items[0][quantity]"];
  let thrown = "";
  try {
    await open(made.product.id);
  } catch (error) {
    thrown = error instanceof StripeError ? error.code : "not Stripe's";
  }
  is("a refusal about anything else is not hidden", thrown, "parameter_unknown");
  is("and at most one more try was made for it", checkouts.length - before <= 2, true);
  refuses = [];

  is("a refusal that names the box", refusedTaxDocuments(new StripeError(400, "parameter_unknown", "Received unknown parameter: tax_id_collection")), true);
  is("a declined card is not one", refusedTaxDocuments(new StripeError(402, "card_declined", "Your card was declined.")), false);
  is("nor is Stripe being down", refusedTaxDocuments(new StripeError(500, "api_error", "invoice service unavailable")), false);

  const plain = new URLSearchParams({ mode: "payment" });
  let tries = 0;
  let passed = "";
  try {
    await openKeepingTheSale(plain, async () => {
      tries += 1;
      throw new StripeError(400, "parameter_unknown", "Received unknown parameter: invoice_creation");
    });
  } catch (error) {
    passed = error instanceof StripeError ? error.code : "";
  }
  is("a checkout that carried neither is not tried twice", [tries, passed], [1, "parameter_unknown"]);

  part("Calls and packages");
  const both = { handle: "harbor", name: "Harbor Kitchen", currency: "usd", hasDiscounts: false, tax: { enabled: false, included: false, ids: true, invoices: true } } as unknown as Store;
  const none = { ...both, tax: { ...NO_TAX } } as unknown as Store;
  const listing = { id: "call1", title: "Sourdough clinic" } as unknown as Listing;
  const pkg = { sessions: 5, priceCents: 50000, days: 90 };
  is("a package's checkout carries both", carried(packageCheckoutBody(both, listing, pkg, "https://marktmorgen.com")), ["true", "never", "true", "always"]);
  is("and neither when they are off", carried(packageCheckoutBody(none, listing, pkg, "https://marktmorgen.com")), [null, null, null, null]);

  const call = { id: "call1", title: "Sourdough clinic", summary: "", priceCents: 12000, fields: [] } as unknown as Product;
  const start = Date.now() + 3 * 86_400_000;
  const booking = (fromPackage: Parameters<typeof callCheckoutBody>[0]["fromPackage"]) =>
    callCheckoutBody({ store: both, product: call, start, end: start + 3_600_000, buyerTz: "America/New_York", origin: "https://marktmorgen.com", via: null, fromPackage });
  is("a paid call carries both", carried(booking(null)), ["true", "never", "true", "always"]);
  is("a session from a package, where nothing is paid, carries neither", carried(booking({ id: "cs_test_pkg", coupon: "co_Free0001", email: "buyer@example.com", back: "https://marktmorgen.com/@harbor" })), [null, null, null, null]);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
