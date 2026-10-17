/**
 * Sales tax through a whole checkout (lib/tax.ts applyTax and taxStatus,
 * lib/store-checkout.ts, lib/cart-checkout.ts; ClickFunnels audit F15, added
 * 17 October 2026). tests/tax-documents.test.ts covers the tax number box and
 * the invoice; this covers the tax itself:
 *
 *   - Stripe Tax counts as ready only when Stripe says "active"; pending names
 *     what is missing, and an unreadable answer is unknown, never ready;
 *   - with tax off, no checkout asks Stripe for tax;
 *   - with tax on, every line Stripe charges carries the store's choice of
 *     exclusive (added at checkout) or inclusive (inside the price): the
 *     product, each box checked, every product of a cart and a membership;
 *   - the price the buyer was shown is the unit amount sent, whichever way;
 *   - the currency of every line is the store's, never converted.
 */
import { addProduct, claimHandle, ensureStatsId, setProductExtras, setProductLink, setStripeAccount, setSubscription, setTax, storeForEmail } from "@/lib/store";
import { readProduct } from "@/lib/catalog";
import { createCheckout } from "@/lib/store-checkout";
import { createCartCheckout } from "@/lib/cart-checkout";
import { NO_TAX, taxStatus } from "@/lib/tax";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

process.env.STRIPE_SECRET_KEY = "sk_test_tax_journey_only";

const OWNER = "weaver@example.com";
const checkouts: URLSearchParams[] = [];
let settings: { status: number; body: unknown } = { status: 200, body: { status: "active" } };
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const path = url.pathname.replace(/^\/v1/, "");
  const method = init?.method ?? "GET";
  const answer = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (path === "/tax/settings") return answer(settings.body, settings.status);
  if (path === "/checkout/sessions" && method === "POST") {
    checkouts.push(new URLSearchParams(String(init?.body)));
    return answer({ id: `cs_test_${"t".repeat(24)}`, url: "https://checkout.stripe.com/c/pay/test" });
  }
  if (method === "GET") return answer({ object: "list", data: [], has_more: false });
  return answer({ error: { message: `no stand-in for ${method} ${path}` } }, 404);
}) as typeof fetch;

/** Every line of a checkout: its amount, currency and tax behavior. */
function lines(sent: URLSearchParams): [string, string, string | null][] {
  const out: [string, string, string | null][] = [];
  for (let i = 0; i < 6; i += 1) {
    const amount = sent.get(`line_items[${i}][price_data][unit_amount]`);
    if (amount) out.push([amount, sent.get(`line_items[${i}][price_data][currency]`) ?? "", sent.get(`line_items[${i}][price_data][tax_behavior]`)]);
  }
  return out;
}

async function main(): Promise<void> {
  redis.clear();
  await claimHandle(OWNER, "loomhouse", "Loom House", "");
  await ensureStatsId(OWNER);
  await setStripeAccount(OWNER, "acct_1TestLoom00001", true);
  await setSubscription(OWNER, { customerId: "cus_Owner00003", subscriptionId: "sub_Owner00003", active: true, period: paidPeriod() });
  const add = async (title: string, price: string, recurring: Parameters<typeof addProduct>[4] = null) => {
    const made = await addProduct(OWNER, title, "", price, recurring);
    if (!made.ok) throw new Error(`no ${title}`);
    await setProductLink(OWNER, made.product.id, `https://example.com/${made.product.id}`);
    return made.product.id;
  };
  const course = await add("Weaving Course", "49");
  const pattern = await add("Pattern Pack", "19");
  const club = await add("Weavers Club", "12", { interval: "month" } as Parameters<typeof addProduct>[4]);
  await setProductExtras(OWNER, course, { bump: { productId: pattern, priceCents: 900, pitch: "" }, slot: 0 });
  const load = async () => (await storeForEmail(OWNER))!;
  const open = async (id: string, bumps: string[] = []) => {
    checkouts.length = 0;
    const store = await load();
    await createCheckout(store, (await readProduct(store, id))!, "https://marktmorgen.com", "", { bumps });
    return checkouts[0];
  };

  part("Ready only when Stripe says so");
  is("active", await taxStatus(await load()), { state: "active" });
  settings = { status: 200, body: { status: "pending", status_details: { pending: { missing_fields: ["head_office"] } } } };
  is("pending, with what is missing", await taxStatus(await load()), { state: "pending", missing: ["head_office"] });
  settings = { status: 500, body: { error: { message: "down" } } };
  is("Stripe unreadable: unknown, never ready", await taxStatus(await load()), { state: "unknown" });

  part("Tax off: no checkout asks for it");
  let sent = await open(course, [pattern]);
  is("no automatic tax, no tax behavior on any line", [sent.get("automatic_tax[enabled]"), lines(sent).map((l) => l[2])], [null, [null, null]]);

  part("Tax added at checkout: every line exclusive");
  await setTax(OWNER, { ...NO_TAX, enabled: true, included: false });
  sent = await open(course, [pattern]);
  is("the product and the box checked, at the prices shown, in the store's currency", [sent.get("automatic_tax[enabled]"), lines(sent)], ["true", [["4900", "usd", "exclusive"], ["900", "usd", "exclusive"]]]);
  sent = await open(club);
  is("a membership", [sent.get("mode"), sent.get("automatic_tax[enabled]"), lines(sent).map((l) => l[2])], ["subscription", "true", ["exclusive"]]);
  checkouts.length = 0;
  const store = await load();
  await createCartCheckout(store, [(await readProduct(store, course))!, (await readProduct(store, pattern))!], "https://marktmorgen.com");
  is("every product of a cart, at its own price", [checkouts[0].get("automatic_tax[enabled]"), lines(checkouts[0])], ["true", [["4900", "usd", "exclusive"], ["1900", "usd", "exclusive"]]]);
  const cartConverts = checkouts[0].get("adaptive_pricing[enabled]");
  sent = await open(course, [pattern]);
  is("Stripe is told not to convert the price into the buyer's currency, on a checkout and on a cart", [sent.get("adaptive_pricing[enabled]"), cartConverts], ["false", "false"]);

  part("Tax inside the price: every line inclusive, the amount unchanged");
  await setTax(OWNER, { ...NO_TAX, enabled: true, included: true });
  sent = await open(course, [pattern]);
  is("the same amounts, each inclusive", lines(sent), [["4900", "usd", "inclusive"], ["900", "usd", "inclusive"]]);

  done();
}

void main();
