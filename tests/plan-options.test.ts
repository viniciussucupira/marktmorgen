/**
 * A payment plan on a product with several prices (lib/product-extras.ts,
 * added 10 October 2026). What is checked:
 *
 *   - what is stored or sent is read safely: a payment for each price, the
 *     smallest kept as the plan's "from" amount;
 *   - it is saved only when every price a buyer can pick has a payment that
 *     adds up to at least that price, and only for prices the product has;
 *   - a price added later without a payment, or raised past its payments,
 *     stops the plan everywhere, and the studio is told which price and why;
 *   - at checkout the buyer pays the picked price's payment, in that many
 *     payments, and the order keeps which price it was;
 *   - it is said without one amount where several apply, in every store
 *     language, and with each price's own amount in the store's answers.
 */
import { activePlan, parsePlan, planFor, planPauseWords, planState, planWords } from "@/lib/product-extras";
import { planLine } from "@/lib/buyer-words";
import { LANGUAGE_CODES } from "@/lib/store-language";
import { addOption, addProduct, claimHandle, editOption, ensureStatsId, setProductExtras, setProductLink, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { readProduct } from "@/lib/catalog";
import { createCheckout } from "@/lib/store-checkout";
import { priceWords } from "@/lib/answers";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const OWNER = "owner@example.com";
const checkouts: URLSearchParams[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const path = url.pathname.replace(/^\/v1/, "");
  const method = init?.method ?? "GET";
  const answer = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (path === "/checkout/sessions" && method === "POST") {
    checkouts.push(new URLSearchParams(String(init?.body)));
    return answer({ id: `cs_test_${"p".repeat(24)}`, url: "https://checkout.stripe.com/c/pay/test" });
  }
  if (method === "GET") return answer({ object: "list", data: [], has_more: false });
  return answer({ error: { message: `no stand-in for ${method} ${path}` } }, 404);
}) as typeof fetch;

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_plan_options_stand_in";

  part("Read safely");
  is("a payment for each price, the smallest kept as where it starts", parsePlan({ payments: 3, interval: "month", options: { optA: 1000, optB: 1400 } }), { payments: 3, interval: "month", amountCents: 1000, options: { optA: 1000, optB: 1400 } });
  is("ids no option can have, and amounts no payment can be, are left out", parsePlan({ payments: 3, interval: "month", options: { "bad id!": 1000, optA: 10, optB: 1400 } })?.options, { optB: 1400 });
  is("a plan saved before, with one amount, reads as it did", parsePlan({ payments: 3, interval: "month", amountCents: 11000 }), { payments: 3, interval: "month", amountCents: 11000 });

  await claimHandle(OWNER, "harbor", "Harbor Kitchen", "");
  await ensureStatsId(OWNER);
  await setStripeAccount(OWNER, "acct_1TestHarbor0001", true);
  await setSubscription(OWNER, { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true });
  const made = await addProduct(OWNER, "Meal Planner", "", "27", null);
  if (!made.ok) throw new Error("no product");
  const id = made.product.id;
  await addOption(OWNER, id, "1 week", "27");
  await addOption(OWNER, id, "5 weeks", "39");
  const load = async () => {
    const store = (await storeForEmail(OWNER))!;
    return { store, product: (await readProduct(store, id))! };
  };
  const [one, five] = (await load()).product.options;
  await setProductLink(OWNER, one.id, "https://example.com/one-week");
  await setProductLink(OWNER, five.id, "https://example.com/five-weeks");

  part("Saved only when every price is covered");
  const save = (options: Record<string, number>) => setProductExtras(OWNER, id, { plan: { payments: 3, interval: "month", amountCents: Math.min(...Object.values(options)), options } });
  const reason = (result: Awaited<ReturnType<typeof save>>) => (result.ok ? "saved" : result.reason);
  is("not with a price left without a payment", reason(await save({ [one.id]: 900 })), "plan_price");
  is("not when one price's payments come to less than it", reason(await save({ [one.id]: 900, [five.id]: 1200 })), "plan_price");
  const saved = await save({ [one.id]: 900, [five.id]: 1300, someoneElse: 500 });
  is("saved when each adds up to its price, and only for this product's prices", saved.ok ? saved.product.plan : null, { payments: 3, interval: "month", amountCents: 900, options: { [one.id]: 900, [five.id]: 1300 } });

  part("Offered as a whole, paid at the price picked");
  let { store, product } = await load();
  is("the plan is offered", activePlan(product) !== null, true);
  is("each price has its own payments", [planFor(product, one.id)?.amountCents, planFor(product, five.id)?.amountCents], [900, 1300]);
  is("and a price the plan does not know has none", planFor(product, "nothing0001"), null);
  is("the studio says how many, and from what", planWords(product.plan!, "usd"), "3 monthly payments");

  checkouts.length = 0;
  await createCheckout(store, product, "https://marktmorgen.com", five.id, { plan: true });
  const sent = checkouts[0];
  is("the picked price's payment, charged monthly", [sent.get("mode"), sent.get("line_items[0][price_data][unit_amount]"), sent.get("line_items[0][price_data][recurring][interval]")], ["subscription", "1300", "month"]);
  is("a plan of 3 payments", [sent.get("metadata[kind]"), sent.get("metadata[plan_payments]")], ["plan", "3"]);
  is("and the order keeps which price it was, on the charge and on the plan", [sent.get("metadata[option]"), sent.get("subscription_data[metadata][option]")], [five.id, five.id]);
  is("named with the price and its payments", sent.get("line_items[0][price_data][product_data][name]"), "Meal Planner (5 weeks) (3 monthly payments of $13)");
  checkouts.length = 0;
  await createCheckout(store, product, "https://marktmorgen.com", one.id, {});
  is("paying in full is unchanged", [checkouts[0].get("mode"), checkouts[0].get("line_items[0][price_data][unit_amount]")], ["payment", "2700"]);

  part("Stopped by a price it does not cover, and said why");
  await addOption(OWNER, id, "10 weeks", "59");
  ({ store, product } = await load());
  const ten = product.options[2];
  is("a new price without a link is not offered, so the plan goes on", activePlan(product) !== null, true);
  await setProductLink(OWNER, ten.id, "https://example.com/ten-weeks");
  ({ store, product } = await load());
  const paused = planState(product);
  is("once it can be bought, the plan stops until it has a payment", paused && "paused" in paused ? paused.paused : "offered", "options");
  is("and the studio is told which price", planPauseWords("options", product.plan!, product, "usd"), "The plan has no payment for the “10 weeks” price. Change the plan and set one, so every price can be paid in it.");
  let refused = false;
  await createCheckout(store, product, "https://marktmorgen.com", one.id, { plan: true }).catch(() => (refused = true));
  is("a checkout that asks for it is refused rather than charged in full", refused, true);
  await save({ [one.id]: 900, [five.id]: 1300, [ten.id]: 2000 });
  await editOption(OWNER, five.id, "5 weeks", "45");
  ({ store, product } = await load());
  const short = planState(product);
  is("a price raised past its payments stops it too", short && "paused" in short ? short.paused : "offered", "short");
  is("with the arithmetic, for that price", planPauseWords("short", product.plan!, product, "usd"), "3 payments of $13 come to $39, less than the “5 weeks” price of $45. Raise each payment, add one, or lower the price.");

  part("Said without one amount where several apply");
  await save({ [one.id]: 900, [five.id]: 1500, [ten.id]: 2000 });
  ({ store, product } = await load());
  is("in English", planLine(store, activePlan(product)!), "3 monthly payments");
  const lines = LANGUAGE_CODES.map((language) => planLine({ language, currency: "usd" }, activePlan(product)!));
  is("in every store language, each its own words, none with an amount", [new Set(lines).size, lines.every((line) => line.startsWith("3") && !line.includes("$"))], [LANGUAGE_CODES.length, true]);
  is("each price with its own payments in the store's answers", priceWords(product, "usd").includes("5 weeks for $45 (or 3 monthly payments of $15)"), true);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
