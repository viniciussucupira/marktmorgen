/**
 * Physical products, shipped by the creator (lib/shipping.ts,
 * lib/shipments.ts, added 11 October 2026). What is checked:
 *
 *   - what is stored or sent is read safely: a cost, a region or a list of
 *     countries Stripe ships to, and a short note;
 *   - only a product sold once, at one price, handing over nothing else can
 *     be shipped, and once it is, nothing else can be attached to it;
 *   - it can be sold, and its checkout asks Stripe for an address in one of
 *     its countries and adds the shipping as its own line, taxed as shipping
 *     where the store collects tax; it is never a gift;
 *   - the address is read from either of Stripe's places for it, said after
 *     paying and in the confirmation email;
 *   - marking it as shipped emails the buyer once, with the tracking link.
 */
import { activeShipping, parseShipping, readCountries, shipProblem, shipsToWords } from "@/lib/shipping";
import { shippingAddressOf } from "@/lib/shipping-address";
import { SHIPPING_WORDS } from "@/lib/buyer-words/shipping";
import { addOption, addProduct, claimHandle, ensureStatsId, setProductLink, setProductShipping, setStripeAccount, setSubscription, setTax, storeForEmail } from "@/lib/store";
import { readProduct } from "@/lib/catalog";
import { canSellProduct, createCheckout } from "@/lib/store-checkout";
import { confirmationFor } from "@/lib/purchase-email";
import { markShipped, readTracking } from "@/lib/shipments";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const OWNER = "owner@example.com";
const checkouts: URLSearchParams[] = [];
const emails: { to: string; subject: string; text: string }[] = [];
let session: Record<string, unknown> = {};
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const method = init?.method ?? "GET";
  const answer = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (url.hostname === "api.resend.com") {
    const body = JSON.parse(String(init?.body)) as { to: string | string[]; subject: string; text: string };
    emails.push({ to: [body.to].flat()[0], subject: body.subject, text: body.text });
    return answer({ id: `email_${emails.length}` });
  }
  const path = url.pathname.replace(/^\/v1/, "");
  if (path === "/checkout/sessions" && method === "POST") {
    checkouts.push(new URLSearchParams(String(init?.body)));
    return answer({ id: `cs_test_${"s".repeat(24)}`, url: "https://checkout.stripe.com/c/pay/test" });
  }
  if (path.startsWith("/checkout/sessions/") && method === "GET") return answer(session);
  if (method === "GET") return answer({ object: "list", data: [], has_more: false });
  return answer({ error: { message: `no stand-in for ${method} ${path}` } }, 404);
}) as typeof fetch;

const ADDRESS = { name: "Ana Souza", address: { line1: "1 Main St", line2: "Apt 2", city: "Austin", state: "TX", postal_code: "78701", country: "US" } };

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_shipping_only_a_stand_in";
  process.env.RESEND_API_KEY = "re_test_shipping_only_a_stand_in";

  part("Read safely");
  is("a cost, a region and a note", parseShipping({ cents: 500, region: "na", note: " Ships  in 3 days " }), { cents: 500, region: "na", countries: ["US", "CA"], note: "Ships in 3 days" });
  is("a list of countries, kept to those Stripe ships to, once each", readCountries("us, ca, CA, xx, KP, gb"), ["US", "CA", "GB"]);
  is("nothing else is shipping", [parseShipping(null), parseShipping({ cents: -1, region: "us" }), parseShipping({ cents: 0, region: "custom", countries: ["XX"] })], [null, null, null]);
  is("where it goes, in the reader's language", [shipsToWords({ region: "na", countries: ["US", "CA"] }, "en-US", SHIPPING_WORDS.en), shipsToWords({ region: "world", countries: [] }, "de-DE", SHIPPING_WORDS.de)], ["United States and Canada", "die meisten Länder"]);

  part("Only on something sold once that hands over nothing else");
  await claimHandle(OWNER, "harbor", "Harbor Kitchen", "");
  await ensureStatsId(OWNER);
  await setStripeAccount(OWNER, "acct_1TestHarbor0001", true);
  await setSubscription(OWNER, { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true });
  const book = await addProduct(OWNER, "The Supper Book", "Printed, 120 pages.", "35", null);
  const pdf = await addProduct(OWNER, "Supper PDF", "", "12", null);
  if (!book.ok || !pdf.ok) throw new Error("no product");
  await setProductLink(OWNER, pdf.product.id, "https://example.com/pdf");
  const shipping = parseShipping({ cents: 600, region: "na", note: "Ships within 3 business days" })!;
  const refused = await setProductShipping(OWNER, pdf.product.id, shipping);
  is("not on a product that already hands something over", refused.ok ? "saved" : refused.reason, "ship_delivery");
  is("the rules, said", [shipProblem({ priceCents: 0, recurring: null, call: null, options: [], pwyw: null, plan: null, file: null, link: null, course: null, bundle: null }), shipProblem({ priceCents: 100, recurring: null, call: null, options: [{ file: { pathname: "x" } }], pwyw: null, plan: null, file: null, link: null, course: null, bundle: null })], ["free", "delivery"]);
  const saved = await setProductShipping(OWNER, book.product.id, shipping);
  is("saved on a product with nothing else", saved.ok ? saved.product.shipping : null, shipping);
  is("then no link can be put on it", (await setProductLink(OWNER, book.product.id, "https://example.com/x")).ok ? "attached" : "refused", "refused");
  const signed = await addOption(OWNER, book.product.id, "Signed", "45");
  await addOption(OWNER, book.product.id, "Unsigned", "35");
  is("its prices are versions of the same thing, each shipped", signed.ok, true);
  const withOptions = (await readProduct((await storeForEmail(OWNER))!, book.product.id))!;
  is("and nothing can be attached to one of them either", (await setProductLink(OWNER, withOptions.options[0].id, "https://example.com/x")).ok ? "attached" : "refused", "refused");

  part("Its checkout");
  const load = async () => {
    const store = (await storeForEmail(OWNER))!;
    return { store, product: (await readProduct(store, book.product.id))! };
  };
  let { store, product } = await load();
  is("it can be sold", [activeShipping(product) !== null, canSellProduct(store, product)], [true, true]);
  await createCheckout(store, product, "https://marktmorgen.com", product.options[0].id, {});
  let sent = checkouts.at(-1)!;
  is("the version picked, at its price", [sent.get("line_items[0][price_data][unit_amount]"), sent.get("line_items[0][price_data][product_data][name]"), sent.get("metadata[option]")], ["4500", "The Supper Book (Signed)", product.options[0].id]);
  await createCheckout(store, product, "https://marktmorgen.com", product.options[1].id, {});
  sent = checkouts.at(-1)!;
  is("Stripe asks for an address in one of its countries", [sent.get("shipping_address_collection[allowed_countries][0]"), sent.get("shipping_address_collection[allowed_countries][1]")], ["US", "CA"]);
  is("and adds the shipping as its own line", [sent.get("shipping_options[0][shipping_rate_data][fixed_amount][amount]"), sent.get("shipping_options[0][shipping_rate_data][display_name]"), sent.get("line_items[0][price_data][unit_amount]")], ["600", "Shipping · Ships within 3 business days", "3500"]);
  is("the order says it is shipped", sent.get("metadata[ship]"), "yes");
  await setTax(OWNER, { enabled: true, included: false, ids: false, invoices: false } as never);
  ({ store, product } = await load());
  await createCheckout(store, product, "https://marktmorgen.com", product.options[1].id, {});
  sent = checkouts.at(-1)!;
  is("with tax on: shipping taxed as shipping, the book as goods", [sent.get("shipping_options[0][shipping_rate_data][tax_code]"), sent.get("line_items[0][price_data][product_data][tax_code]"), sent.get("shipping_options[0][shipping_rate_data][tax_behavior]")], ["txcd_92010001", "txcd_99999999", "exclusive"]);
  let gift = "sent";
  await createCheckout(store, product, "https://marktmorgen.com", product.options[1].id, { gift: "g".repeat(16) }).catch(() => (gift = "refused"));
  is("never as a gift", gift, "refused");

  part("Where it is going");
  const older = { shipping_details: ADDRESS };
  const newer = { collected_information: { shipping_details: ADDRESS } };
  is("read from either of Stripe's places", [shippingAddressOf(older)?.lines, shippingAddressOf(newer)?.name], [["1 Main St", "Apt 2", "Austin, TX 78701", "United States"], "Ana Souza"]);
  session = {
    id: `cs_test_${"s".repeat(24)}`,
    object: "checkout.session",
    status: "complete",
    payment_status: "paid",
    mode: "payment",
    amount_total: 4100,
    currency: "usd",
    created: Math.floor(Date.now() / 1000),
    customer_details: { email: "ana@example.com" },
    metadata: { store: "harbor", product: book.product.id, ship: "yes", title: "The Supper Book" },
    ...newer,
  };
  const letter = confirmationFor(store, session as never, Date.now() / 1000, [], [product]);
  is("in the confirmation email, with who sends it", [letter?.text.includes("Shipping to:\nAna Souza\n1 Main St"), letter?.text.includes("Harbor Kitchen ships it and emails you when it is on its way.")], [true, true]);

  part("Marked as shipped");
  is("a tracking link is an https address, or nothing", [readTracking(""), readTracking("http://x.com"), readTracking("https://tools.usps.com/go?x=1")], ["", null, "https://tools.usps.com/go?x=1"]);
  is("a link that is not one is refused", (await markShipped(store, session.id as string, "javascript:alert(1)")).ok ? "marked" : "refused", "refused");
  const marked = await markShipped(store, session.id as string, "https://tools.usps.com/go?x=1");
  const mail = emails.at(-1)!;
  is("the buyer gets one email, with the tracking link and the address", [marked.ok && marked.emailed, mail.to, mail.subject, mail.text.includes("https://tools.usps.com/go?x=1"), mail.text.includes("Austin, TX 78701")], [true, "ana@example.com", "The Supper Book is on its way", true, true]);
  const again = await markShipped(store, session.id as string, "");
  is("and never a second one", [again.ok && again.emailed, emails.length], [false, 1]);
  session = { ...session, id: `cs_test_${"t".repeat(24)}`, metadata: { store: "harbor", product: pdf.product.id } };
  is("an order that was not shipped cannot be marked", (await markShipped(store, session.id as string, "")).ok ? "marked" : "refused", "refused");

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
