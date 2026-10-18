/**
 * The creator's own bundle offered in the open cart (lib/cart-bundle.ts,
 * app/api/store/cart; added 18 October 2026, ClickFunnels audit row F13).
 * Checked against the in-memory Redis:
 *
 *   - a bundle is offered only when swapping what it holds for it makes the
 *     whole cart cost less, the store's deal for buying more counted both
 *     ways; the saving said is that difference, exactly;
 *   - it replaces what it holds, never adds a second copy of a product;
 *   - only the creator's published bundles at their own price; a draft is
 *     never offered;
 *   - the cart reads nothing more for it: the bundle comes from what the
 *     store's record already carries.
 */
import { NextRequest } from "next/server";
import { bestBundleSwap, cartTotal, swapped } from "@/lib/cart-bundle";
import { CART_WORDS } from "@/lib/buyer-words/cart";
import { addProduct, claimHandle, ensureStatsId, setCartDeal, setProductBundle, setProductHidden, setProductLink, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { GET as readCart } from "@/app/api/store/cart/route";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
  if ((init?.method ?? "GET") === "GET") return new Response(JSON.stringify({ object: "list", data: [], has_more: false }));
  return new Response(JSON.stringify({ error: { message: "no stand-in" } }), { status: 404 });
}) as typeof fetch;

const OWNER = "baker@example.com";
const NO_DEAL = { on: false, min: 2, percent: 10 };

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_cart_bundle_only_a_stand_in";

  part("The rule");
  const lines = [{ id: "bread", cents: 1900 }, { id: "pizza", cents: 2900 }];
  const set = { id: "set", cents: 3900, items: ["bread", "starter", "pizza"] };
  is("a bundle that holds both and costs less: swap them, saving the difference", bestBundleSwap(lines, [set], NO_DEAL), { id: "set", replaces: ["bread", "pizza"], more: 1, before: 4800, after: 3900 });
  is("one that would cost more is not offered", bestBundleSwap([{ id: "bread", cents: 1900 }, { id: "starter", cents: 900 }], [set], NO_DEAL), null);
  is("what it does not hold stays in the cart and is counted", bestBundleSwap([{ id: "pizza", cents: 2900 }, { id: "cakes", cents: 1500 }], [set], NO_DEAL), null);
  is("the deal for buying more is counted both ways: 20% off two lines can beat one bundle", bestBundleSwap(lines, [set], { on: true, min: 2, percent: 20 }), null);
  is("and a deal that still applies after the swap is counted on the bundle's line too", bestBundleSwap([...lines, { id: "cakes", cents: 1500 }], [{ ...set, cents: 3500 }], { on: true, min: 2, percent: 10 })?.after, cartTotal([{ cents: 1500 }, { cents: 3500 }], { on: true, min: 2, percent: 10 }));
  is("a bundle already in the cart, or one that holds none of it, is never offered", [bestBundleSwap([{ id: "set", cents: 3900 }, ...lines], [set], NO_DEAL), bestBundleSwap(lines, [{ id: "other", cents: 100, items: ["cakes", "pies"] }], NO_DEAL)], [null, null]);
  const cheaper = { id: "cheap", cents: 3000, items: ["bread", "pizza"] };
  is("the one that saves the most", bestBundleSwap(lines, [set, cheaper], NO_DEAL)?.id, "cheap");
  is("the swap replaces, never adds a second copy", swapped(["bread", "cakes", "pizza"], { id: "set", replaces: ["bread", "pizza"] }), ["cakes", "set"]);
  for (const [lang, words] of Object.entries(CART_WORDS)) {
    is(`the words name what it holds and the saving, and promise nothing more (${lang})`, [words.bundleHolds("A", 2).includes("A") && words.bundleHolds("A", 2).includes("2"), words.bundleSave("$9.00").includes("$9.00"), /guarantee|limited|only today|best/i.test(words.bundleHead + words.bundleSave("x"))], [true, true, false]);
  }

  part("In the store's cart");
  await claimHandle(OWNER, "ovenhouse", "Oven House", "");
  await ensureStatsId(OWNER);
  await setStripeAccount(OWNER, "acct_1TestOvenHouse01", true);
  await setSubscription(OWNER, { customerId: "cus_Oven00001", subscriptionId: "sub_Oven00001", active: true, period: paidPeriod() });
  const p: Record<string, string> = {};
  for (const [title, price] of [["Bread", "19"], ["Starter", "9"], ["Pizza", "29"], ["Cakes", "15"]]) {
    const added = await addProduct(OWNER, title, "", price, null);
    if (!added.ok) throw new Error(`no ${title}`);
    p[title] = added.product.id;
    await setProductLink(OWNER, added.product.id, `https://example.com/${title.toLowerCase()}`);
  }
  const made = await addProduct(OWNER, "Baker's set", "", "39", null);
  if (!made.ok) throw new Error("no bundle");
  p.Set = made.product.id;
  is("the creator's bundle holds three of them", (await setProductBundle(OWNER, p.Set, [p.Bread, p.Starter, p.Pizza])).ok, true);

  type Answer = { ok: boolean; total: string; bundle: { id: string; title: string; price: string; holds: string; save: string; replaces: string[] } | null };
  const asked: string[] = [];
  const pipeline = redis.pipeline.bind(redis);
  redis.pipeline = (commands) => {
    for (const command of commands) asked.push(command.map(String).join(" "));
    return pipeline(commands);
  };
  const ask = async (ids: string[]) => (await (await readCart(new NextRequest(`https://marktmorgen.com/api/store/cart?handle=ovenhouse&ids=${ids.join(",")}`))).json()) as Answer;

  asked.length = 0;
  let cart = await ask([p.Bread, p.Pizza]);
  is("offered at its own price, with what it holds from the cart and the exact saving", [cart.bundle?.id, cart.bundle?.price, cart.bundle?.holds, cart.bundle?.save, cart.bundle?.replaces], [p.Set, "$39", "Holds Bread and Pizza from your cart, and 1 more product.", "Your cart costs $9 less with it.", [p.Bread, p.Pizza]]);
  is("the cart read nothing of the bundle's own record for it", asked.filter((command) => command.includes(p.Set)), []);
  is("a cart it would make dearer is offered nothing", (await ask([p.Bread, p.Starter])).bundle, null);
  is("nor one where what it does not hold makes the swap dearer", (await ask([p.Pizza, p.Cakes])).bundle, null);
  cart = await ask(swapped([p.Bread, p.Pizza], { id: p.Set, replaces: [p.Bread, p.Pizza] }));
  is("swapped, the cart is the bundle alone, at its price, and offers nothing more", [cart.total, cart.bundle], ["$39", null]);
  await setCartDeal(OWNER, { on: true, min: 2, percent: 20 });
  is("with 20% off two or more, the two cost less than the bundle: nothing offered", (await ask([p.Bread, p.Pizza])).bundle, null);
  await setCartDeal(OWNER, { on: false, min: 2, percent: 10 });
  await setProductHidden(OWNER, p.Set, true);
  is("a draft bundle is never offered", (await ask([p.Bread, p.Pizza])).bundle, null);
  redis.pipeline = pipeline;
  is("the store record still has its bundle", Boolean((await storeForEmail(OWNER))?.catalog.items.find((item) => item.id === p.Set)), true);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
