/**
 * A store's latest real purchases on its own pages (lib/recent-sales.ts,
 * added 13 October 2026). Checked:
 *
 *   - only a settled live checkout of one of the store's products, paid with
 *     real money, is ever written down: never a test, a free copy, a call, a
 *     tip or a membership;
 *   - nothing is written or shown while the switch is off;
 *   - a page shows what was bought, when and the billing country, never who;
 *     newest first, up to three, only from the last seven days;
 *   - a payment refunded in any part is left out, and when Stripe cannot be
 *     asked, nothing is shown;
 *   - a removed product is left out;
 *   - Stripe is asked at most once in five minutes, and a new purchase shows
 *     at once.
 */
import { readFileSync } from "node:fs";
import { recentSales, rememberSale, showable } from "@/lib/recent-sales";
import { listensToSales } from "@/lib/sale-events";
import { addProduct, claimHandle, ensureStatsId, storeForEmail } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

process.env.STRIPE_SECRET_KEY = "sk_test_recent_only_a_stand_in";
let refunds: Record<string, unknown>[] = [];
let stripeDown = false;
let asked = 0;
globalThis.fetch = (async (input: string | URL | Request) => {
  if (String(input).includes("/refunds")) {
    asked += 1;
    if (stripeDown) return new Response(JSON.stringify({ error: { message: "down" } }), { status: 500 });
    return new Response(JSON.stringify({ object: "list", data: refunds, has_more: false }), { status: 200 });
  }
  return new Response(JSON.stringify({ object: "list", data: [], has_more: false }), { status: 200 });
}) as typeof fetch;

const OWNER = "baker@example.com";
const NOW = Math.floor(Date.now() / 1000);
const checkout = (n: number, product: string, over: Record<string, unknown> = {}) => ({
  id: `cs_live_${String(n).padStart(24, "a")}`,
  mode: "payment",
  created: NOW - n * 3600,
  amount_total: 2900,
  payment_intent: `pi_live${n}abcdef`,
  metadata: { store: "bakery", product },
  customer_details: { email: "buyer@example.com", name: "Dana Buyer", address: { country: "DE" } },
  ...over,
});

async function main(): Promise<void> {
  redis.clear();

  part("What may be shown");
  is("a live purchase of a product", showable(checkout(1, "p1")), true);
  is("a test payment, no", showable(checkout(1, "p1", { id: `cs_test_${"a".repeat(24)}` })), false);
  is("a free copy, no", showable(checkout(1, "p1", { amount_total: 0 })), false);
  is("a membership, no", showable(checkout(1, "p1", { mode: "subscription", payment_intent: null })), false);
  is("a call or a tip, no", [showable(checkout(1, "p1", { metadata: { product: "p1", kind: "call" } })), showable(checkout(1, "p1", { metadata: { product: "p1", kind: "tip" } }))], [false, false]);
  is("a payment Stripe sent whole is read by its id", showable(checkout(1, "p1", { payment_intent: { id: "pi_live1abcdef" } })), true);

  await claimHandle(OWNER, "bakery", "Bakery", "");
  await ensureStatsId(OWNER);
  const bread = await addProduct(OWNER, "Sourdough course", "", "29", null);
  const cakes = await addProduct(OWNER, "Cake templates", "", "19", null);
  if (!bread.ok || !cakes.ok) throw new Error("no products");
  const base = (await storeForEmail(OWNER))!;
  const off = { ...base, stripeAccountId: "acct_test_recent", recentSales: false };
  const on = { ...off, recentSales: true };

  part("Off");
  await rememberSale(off, checkout(1, bread.product.id));
  is("nothing written while it is off", await redis.pipeline([["LLEN", `nl:recent:${base.statsId}`]]), [0]);
  is("and nothing shown", await recentSales(off), []);
  is("a store showing them listens to its sales", [listensToSales(off), listensToSales(on)], [false, true]);

  part("On");
  await rememberSale(on, checkout(30, bread.product.id));
  await rememberSale(on, checkout(3, cakes.product.id, { customer_details: {} }));
  await rememberSale(on, checkout(2, bread.product.id));
  await rememberSale(on, checkout(1, "gone_product"));
  await rememberSale(on, checkout(9 * 24, bread.product.id));
  const shown = await recentSales(on);
  is("newest first, the removed product and the purchase over a week old left out, up to three", shown.map((s) => [s.title, s.at, s.country]), [
    ["Sourdough course", NOW - 2 * 3600, "DE"],
    ["Cake templates", NOW - 3 * 3600, ""],
    ["Sourdough course", NOW - 30 * 3600, "DE"],
  ]);
  is("nothing about who bought", JSON.stringify(shown).includes("Dana") || JSON.stringify(shown).includes("buyer@"), false);

  part("Asked once in five minutes");
  const before = asked;
  await recentSales(on);
  is("the second visit asks Stripe nothing", asked, before);

  part("Refunds");
  refunds = [{ status: "succeeded", payment_intent: "pi_live2abcdef", amount: 500 }];
  await rememberSale(on, checkout(1, cakes.product.id));
  const after = await recentSales(on);
  is("a new purchase shows at once, and one refunded in part is left out", after.map((s) => s.at), [NOW - 3600, NOW - 3 * 3600, NOW - 30 * 3600]);
  stripeDown = true;
  await redis.pipeline([["DEL", `nl:recent:feed:${base.statsId}`]]);
  is("Stripe cannot be asked: nothing shown", await recentSales(on), []);
  stripeDown = false;
  is("and asked again on the next visit, not left empty", (await recentSales(on)).length, 3);

  part("On the pages");
  const productPage = readFileSync("app/[handle]/p/[product]/page.tsx", "utf8");
  const frontPage = readFileSync("app/[handle]/page.tsx", "utf8");
  is("the front page and product pages show them", [productPage.includes("<RecentSales "), frontPage.includes("<RecentSales ")], [true, true]);
  const card = readFileSync("components/recent-sales.tsx", "utf8");
  is("each once a visit, never in a loop", card.includes("setInterval"), false);

  done();
}

void main();
