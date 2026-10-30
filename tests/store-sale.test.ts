/**
 * A sale across the store: when it applies, the price it shows, and what the
 * checkout carries.
 *
 * Measured before it was built (30 September 2026): Stan's discount codes can
 * expire, on its $99 plan, and must be typed; nothing on the store shows a
 * price crossed out or a sale that starts and ends by itself.
 */
import { TEST_CONSENT } from "./digital-consent-fixture";
import { addProduct, claimHandle, ensureStatsId, setProductLink, setStoreSale, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { readProduct } from "@/lib/catalog";
import { createCheckout } from "@/lib/store-checkout";
import { endsWords, parseSale, saleOff, salePrice, saleRunning } from "@/lib/store-sale";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

const checkouts: URLSearchParams[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const path = url.pathname.replace(/^\/v1/, "");
  if (path === "/checkout/sessions" && (init?.method ?? "GET") === "POST") {
    checkouts.push(new URLSearchParams(String(init?.body)));
    return new Response(JSON.stringify({ id: `cs_test_${"s".repeat(24)}`, url: "https://checkout.stripe.com/c/pay/test" }));
  }
  return new Response("{}", { status: 404 });
}) as typeof fetch;

const product = (over: Record<string, unknown> = {}) =>
  ({ id: "p1", priceCents: 4900, recurring: null, call: null, pwyw: null, options: [], ...over }) as Parameters<typeof saleOff>[1];

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_sale_only_a_stand_in";
  const now = 2_000_000_000;
  const sale = parseSale({ name: "  Black   Friday ", percent: 30, starts: now - 60, ends: now + 3_600, all: true, products: [], coupon: "co_Sale0001" });

  part("Reading it");
  is("the name tidied", sale.name, "Black Friday");
  is("a percentage not offered is no sale", parseSale({ ...sale, percent: 33 }).percent, 0);
  is("an end before the start is no sale", parseSale({ ...sale, ends: sale.starts - 1 }).percent, 0);
  is("without its coupon, no sale", parseSale({ ...sale, coupon: "" }).percent, 0);

  part("When it applies");
  is("while it runs", saleOff(sale, product(), now), 30);
  is("not before", saleOff(sale, product(), now - 120), 0);
  is("not at its end", [saleRunning(sale, now + 3_600), saleOff(sale, product(), now + 3_600)], [false, 0]);
  is("not on a membership", saleOff(sale, product({ recurring: { interval: "month" } }), now), 0);
  is("not on a call", saleOff(sale, product({ call: {} }), now), 0);
  is("not where the buyer names the price", saleOff(sale, product({ pwyw: {} }), now), 0);
  is("not with price options", saleOff(sale, product({ options: [{}] }), now), 0);
  is("not on something free", saleOff(sale, product({ priceCents: 0 }), now), 0);
  const some = { ...sale, all: false, products: ["p2"] };
  is("only the products picked", [saleOff(some, product(), now), saleOff(some, product({ id: "p2" }), now)], [0, 30]);

  part("The price shown");
  is("30% off $49", salePrice(4900, 30), 3430);
  is("rounded to the cent as Stripe rounds", salePrice(999, 15), 849);
  is("nothing off is the price", salePrice(999, 0), 999);
  is("how long is left", [endsWords(now + 3 * 86_400, now), endsWords(now + 5 * 3_600, now), endsWords(now + 3_660, now), endsWords(now + 90, now)], ["Ends in 3 days", "Ends in 5 hours", "Ends in 1 hour", "Ends in 2 minutes"]);

  part("The checkout");
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await ensureStatsId("owner@example.com");
  await setStripeAccount("owner@example.com", "acct_1TestHarbor0001", true);
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, period: paidPeriod() });
  const made = await addProduct("owner@example.com", "Bread Book", "", "49", null);
  if (!made.ok) throw new Error("no product");
  await setProductLink("owner@example.com", made.product.id, "https://example.com/bread");
  const real = Math.floor(Date.now() / 1000);
  await setStoreSale("owner@example.com", { ...sale, starts: real - 60, ends: real + 3_600 });
  let store = (await storeForEmail("owner@example.com"))!;
  const full = (await readProduct(store, made.product.id))!;
  await createCheckout(store, full, "https://marktmorgen.com", "", { digitalConsent: TEST_CONSENT });
  is("the sale's coupon, with no code box", [checkouts[0].get("discounts[0][coupon]"), checkouts[0].get("metadata[sale]"), checkouts[0].get("allow_promotion_codes")], ["co_Sale0001", "30", null]);
  is("the price sent is the product's; Stripe takes the sale off", checkouts[0].get("line_items[0][price_data][unit_amount]"), "4900");
  await setStoreSale("owner@example.com", { ...sale, starts: real - 7_200, ends: real - 3_600 });
  store = (await storeForEmail("owner@example.com"))!;
  await createCheckout(store, full, "https://marktmorgen.com", "", { digitalConsent: TEST_CONSENT });
  is("after it ends, nothing comes off", checkouts[1].get("discounts[0][coupon]"), null);

  done();
}

void main();
