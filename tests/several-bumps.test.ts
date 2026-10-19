/**
 * Up to three boxes at checkout on one product (lib/product-extras.ts,
 * MAX_BUMPS, added 8 October 2026).
 *
 * Measured that day: Stan allows one order bump per product; Hotmart and
 * Kajabi allow more than one. What is checked:
 *
 *   - a product saved when it could offer one box reads as a list of one;
 *     the same product twice is one box; three at most;
 *   - in the studio: a box is added at the next place, changed in its own
 *     place and taken away with the ones after it moving up; the same
 *     product in two boxes, a fourth box, and a place that does not exist
 *     are refused;
 *   - at checkout: each box checked is its own line at the creator's price
 *     for it, named on the order under its own key; a box not checked, a
 *     product the form names that no box offers, and a box that is not
 *     being shown add nothing; "yes" from a page drawn when there was one
 *     box is the first box; a gift adds nothing;
 *   - every product checked, and every product of a bundle among them, is
 *     handed over (deliveredIds), and a buyer's list of purchases has each.
 */
import { addProduct, claimHandle, editProduct, ensureStatsId, setProductExtras, setProductLink, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { readListing, readProduct } from "@/lib/catalog";
import { MAX_BUMPS, activeBumps, bumpTargets, parseBumps } from "@/lib/product-extras";
import { bumpsFromMeta, deliveredIds } from "@/lib/bundle-rules";
import { createCheckout } from "@/lib/store-checkout";
import { purchasesFor } from "@/lib/buyer-orders";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

const OWNER = "owner@example.com";
const checkouts: URLSearchParams[] = [];
let listed: Record<string, unknown>[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const path = url.pathname.replace(/^\/v1/, "");
  const method = init?.method ?? "GET";
  const answer = (body: unknown) => new Response(JSON.stringify(body));
  if (path === "/checkout/sessions" && method === "POST") {
    checkouts.push(new URLSearchParams(String(init?.body)));
    return answer({ id: `cs_test_${"b".repeat(24)}`, url: "https://checkout.stripe.com/c/pay/test" });
  }
  if (path === "/checkout/sessions" && method === "GET") return answer({ object: "list", data: listed, has_more: false });
  if (method === "GET") return answer({ object: "list", data: [], has_more: false });
  return new Response(JSON.stringify({ error: { message: `no stand-in for ${method} ${path}` } }), { status: 404 });
}) as typeof fetch;

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_bumps_only_a_stand_in";

  part("What is stored");
  const one = { productId: "templates1", priceCents: 900, pitch: "" };
  is("a product saved with one box reads as a list of one", parseBumps(undefined, one), [one]);
  is("the same product twice is one box", parseBumps([one, { ...one, priceCents: 500 }]), [one]);
  is(
    "three at most",
    parseBumps(["aaaaaa1", "bbbbbb2", "cccccc3", "dddddd4"].map((productId) => ({ productId, priceCents: 900, pitch: "" }))).length,
    MAX_BUMPS,
  );
  is("nothing stored is no box", parseBumps(undefined, undefined), []);

  await claimHandle(OWNER, "harbor", "Harbor Kitchen", "");
  await ensureStatsId(OWNER);
  await setStripeAccount(OWNER, "acct_1TestHarbor0001", true);
  await setSubscription(OWNER, { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, period: paidPeriod() });
  const ids: Record<string, string> = {};
  for (const [title, price] of [["Course", "49"], ["Templates", "19"], ["Checklist", "9"], ["Workbook", "29"], ["Planner", "15"]]) {
    const made = await addProduct(OWNER, title, "", price, null);
    if (!made.ok) throw new Error(`no ${title}`);
    ids[title] = made.product.id;
    await setProductLink(OWNER, made.product.id, `https://example.com/${title.toLowerCase()}`);
  }
  const offer = (title: string, cents: number) => ({ productId: ids[title], priceCents: cents, pitch: "" });

  part("In the studio");
  is("the first box", (await setProductExtras(OWNER, ids.Course, { bump: offer("Templates", 900), slot: 0 })).ok, true);
  is("a second, at the next place", (await setProductExtras(OWNER, ids.Course, { bump: offer("Checklist", 500), slot: 1 })).ok, true);
  is("a third", (await setProductExtras(OWNER, ids.Course, { bump: offer("Workbook", 1900), slot: 2 })).ok, true);
  const refused = async (change: Parameters<typeof setProductExtras>[2]) => {
    const result = await setProductExtras(OWNER, ids.Course, change);
    return result.ok ? "saved" : result.reason;
  };
  is("a fourth is refused", await refused({ bump: offer("Planner", 900), slot: 3 }), "full");
  is("the same product in two boxes is refused", await refused({ bump: offer("Templates", 800), slot: 1 }), "twice");
  is("a place past the next one is refused", await refused({ bump: null, slot: 5 }), "slot");
  is("dearer than on its own is refused, as before", await refused({ bump: offer("Planner", 2000), slot: 1 }), "price");
  is("changed in its own place", await refused({ bump: offer("Checklist", 400), slot: 1 }), "saved");
  let store = (await storeForEmail(OWNER))!;
  let course = (await readProduct(store, ids.Course))!;
  is("in the order they were set", course.bumps.map((b) => [b.productId, b.priceCents]), [[ids.Templates, 900], [ids.Checklist, 400], [ids.Workbook, 1900]]);
  is("taking the second away moves the third up", await refused({ bump: null, slot: 1 }), "saved");
  store = (await storeForEmail(OWNER))!;
  course = (await readProduct(store, ids.Course))!;
  is("what is left", bumpTargets(course), [ids.Templates, ids.Workbook]);
  await setProductExtras(OWNER, ids.Course, { bump: offer("Checklist", 400), slot: 2 });
  store = (await storeForEmail(OWNER))!;
  course = (await readProduct(store, ids.Course))!;
  const listings = await Promise.all(bumpTargets(course).map((id) => readListing(store, id)));
  is("all three shown to buyers", activeBumps(listings.filter((l) => l !== null), course).map((b) => b.target.title), ["Templates", "Workbook", "Checklist"]);

  part("At checkout");
  const open = async (bumps: string[], more: Parameters<typeof createCheckout>[4] = {}) => {
    checkouts.length = 0;
    await createCheckout(store, course, "https://marktmorgen.com", "", { bumps, ...more });
    return checkouts[0];
  };
  const lines = (sent: URLSearchParams) => {
    const out: [string, string][] = [];
    for (let i = 0; i < 6; i += 1) {
      const name = sent.get(`line_items[${i}][price_data][product_data][name]`);
      if (name) out.push([name, sent.get(`line_items[${i}][price_data][unit_amount]`) ?? ""]);
    }
    return out;
  };
  let sent = await open([ids.Workbook, ids.Checklist]);
  is("each box checked is its own line, at the price set for it", lines(sent), [["Course", "4900"], ["Workbook", "1900"], ["Checklist", "400"]]);
  is("and named on the order under its own key, in the order shown", [sent.get("metadata[bump]"), sent.get("metadata[bump2]"), sent.get("metadata[bump3]")], [ids.Workbook, ids.Checklist, null]);
  is("on the payment too", [sent.get("payment_intent_data[metadata][bump]"), sent.get("payment_intent_data[metadata][bump2]")], [ids.Workbook, ids.Checklist]);
  is("the title names them all", sent.get("metadata[title]"), "Course + Workbook + Checklist");
  sent = await open([]);
  is("none checked: the product alone", [lines(sent).length, sent.get("metadata[bump]")], [1, null]);
  sent = await open([ids.Planner, "zzzzzzzzzz"]);
  is("a product no box offers adds nothing", [lines(sent).length, sent.get("metadata[bump]")], [1, null]);
  sent = await open(["yes"]);
  is("\"yes\", from a page drawn when there was one box, is the first box", [lines(sent), sent.get("metadata[bump]")], [[["Course", "4900"], ["Templates", "900"]], ids.Templates]);
  sent = await open([ids.Templates, ids.Workbook, ids.Checklist], { gift: "gft_" + "a".repeat(24) });
  is("a gift adds nothing", lines(sent).length, 1);

  // The second box's product now costs less on its own than the box
  // charges for it, so the box is not shown, and cannot be checked.
  await editProduct(OWNER, ids.Workbook, "Workbook", "", "15");
  store = (await storeForEmail(OWNER))!;
  sent = await open([ids.Workbook, ids.Checklist]);
  is("a box not being shown cannot be checked; the others still can", [lines(sent).map(([name]) => name), sent.get("metadata[bump]")], [["Course", "Checklist"], ids.Checklist]);
  await editProduct(OWNER, ids.Workbook, "Workbook", "", "29");
  store = (await storeForEmail(OWNER))!;

  part("What is handed over");
  const meta = { store: "harbor", product: ids.Course, bump: ids.Workbook, bump2: ids.Checklist, bump3_bundle: "aaaaaa1,bbbbbb2", bump3: ids.Templates };
  is("every product ticked, and every product of a bundle among them", deliveredIds(meta), [ids.Course, ids.Workbook, ids.Checklist, ids.Templates, "aaaaaa1", "bbbbbb2"]);
  is("read back in the order of the boxes", bumpsFromMeta(meta).map((b) => b.key), ["bump", "bump2", "bump3"]);
  is("an order from when there was one box reads the same as before", deliveredIds({ product: ids.Course, bump: ids.Templates }), [ids.Course, ids.Templates]);
  is("a gift hands the buyer none of them", deliveredIds({ ...meta, gift: "gft_x" }), []);

  listed = [
    {
      id: "cs_test_" + "c".repeat(24),
      object: "checkout.session",
      status: "complete",
      payment_status: "paid",
      mode: "payment",
      created: Math.floor(Date.now() / 1000),
      amount_total: 7200,
      currency: "usd",
      metadata: { store: "harbor", product: ids.Course, bump: ids.Workbook, bump2: ids.Checklist },
      customer_details: { email: "buyer@example.com" },
      payment_intent: { id: "pi_1", status: "succeeded", latest_charge: { refunded: false, amount_refunded: 0 } },
    },
  ];
  const purchases = (await purchasesFor(store, "buyer@example.com")) ?? [];
  const bought = purchases.find((p) => p.productId === ids.Course);
  is("the buyer's list has each product checked, with its own link", bought?.added.map((a) => [a.key, a.title, a.delivery?.link]), [
    ["bump", "Workbook", "https://example.com/workbook"],
    ["bump2", "Checklist", "https://example.com/checklist"],
  ]);

  done();
}

void main();
