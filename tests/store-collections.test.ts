/**
 * Collections and "Goes well with" (lib/store-collections.ts, added 17
 * October 2026). Checked:
 *
 *   - every list stops at its number: twelve collections, twenty-four
 *     products in one, three picks per product, a cart of four;
 *   - what the studio sends is refused as a whole when anything in it is
 *     wrong, never cut down; a collection keeps its id, and so its address,
 *     through a rename;
 *   - a collection's address is found by the id at its end, and a draft or a
 *     removed product is never shown in one; removing a product takes it out
 *     of every collection, and one left empty goes;
 *   - a product's picks are other products of the same store, saved in order;
 *   - the open cart offers the creator's picks first, said as their pick
 *     with no number in it, then what buyers really bought together, each
 *     under its own kind, and never something already in the cart.
 */
import { NextRequest } from "next/server";
import {
  addProduct,
  claimHandle,
  ensureStatsId,
  removeProduct,
  setCollections,
  setProductHidden,
  setProductLink,
  setProductPairs,
  setStripeAccount,
  setSubscription,
  storeForEmail,
} from "@/lib/store";
import { readListing, readProduct } from "@/lib/catalog";
import {
  MAX_COLLECTIONS,
  MAX_COLLECTION_PRODUCTS,
  MAX_PAIRS,
  cartPicks,
  collectionInSegment,
  collectionSegment,
  collectionsWithout,
  parseCollections,
  parsePairs,
  readCollectionsInput,
  shownCollections,
  shownProducts,
} from "@/lib/store-collections";
import { CART_WORDS } from "@/lib/buyer-words/cart";
import { storeSitemap } from "@/lib/store-sitemap";
import { GET as readCart } from "@/app/api/store/cart/route";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const OWNER = "owner@example.com";
globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
  const method = init?.method ?? "GET";
  if (method === "GET") return new Response(JSON.stringify({ object: "list", data: [], has_more: false }));
  return new Response(JSON.stringify({ error: { message: "no stand-in" } }), { status: 404 });
}) as typeof fetch;

let n = 0;
const fixed = () => {
  n += 1;
  return (n * 0.137) % 1;
};

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_collections_only_a_stand_in";

  part("Rules");
  const ids = Array.from({ length: 30 }, (_, i) => `prod${String(i).padStart(4, "0")}`);
  const has = (id: string) => ids.includes(id);
  const many = Array.from({ length: MAX_COLLECTIONS + 1 }, (_, i) => ({ title: `C${i}`, products: [ids[0]] }));
  is(`more than ${MAX_COLLECTIONS} collections is refused, not cut down`, readCollectionsInput(many, [], has, fixed), { ok: false, reason: "too_many" });
  is(`more than ${MAX_COLLECTION_PRODUCTS} products in one is refused`, readCollectionsInput([{ title: "All", products: ids.slice(0, 25) }], [], has, fixed), { ok: false, reason: "too_big" });
  is("a collection with no name is refused", readCollectionsInput([{ title: "  ", products: [ids[0]] }], [], has, fixed), { ok: false, reason: "title" });
  is("an empty one is refused", readCollectionsInput([{ title: "Guides", products: [] }], [], has, fixed), { ok: false, reason: "empty" });
  is("a product the store does not have is refused", readCollectionsInput([{ title: "Guides", products: ["nothere1"] }], [], has, fixed), { ok: false, reason: "unknown" });
  is("the same product twice is refused, not quietly merged", readCollectionsInput([{ title: "Guides", products: [ids[0], ids[0]] }], [], has, fixed), { ok: false, reason: "unknown" });
  const made = readCollectionsInput([{ title: "Beginner guides", blurb: "Start  here.\n", products: [ids[1], ids[0]] }], [], has, fixed);
  const first = made.ok ? made.collections[0] : null;
  is("a new one is given an id of its own, keeps the order and tidies its words", first ? [/^[a-z0-9]{8}$/.test(first.id), first.products, first.blurb] : null, [true, [ids[1], ids[0]], "Start here."]);
  const renamed = readCollectionsInput([{ id: first?.id, title: "Guides for beginners", products: [ids[0]] }], first ? [first] : [], has, fixed);
  is("renamed, it keeps its id", renamed.ok ? renamed.collections[0].id : null, first?.id);
  const forged = readCollectionsInput([{ id: "zzzzzzzz", title: "Other", products: [ids[0]] }], first ? [first] : [], has, fixed);
  is("an id the store does not have is not taken over: it is a new one", forged.ok ? forged.collections[0].id !== "zzzzzzzz" : null, true);
  is("a stored list is read back to its numbers", parseCollections(many.map((c, i) => ({ ...c, id: `abcd${String(i).padStart(4, "0")}` }))).length, MAX_COLLECTIONS);
  if (first) {
    const segment = collectionSegment(first);
    is("its address is its words and its id", segment, `beginner-guides-${first.id}`);
    is("found by the id at its end, whatever words come before", [collectionInSegment(segment, [first])?.id, collectionInSegment(`old-name-${first.id}`, [first])?.id, collectionInSegment(first.id, [first])?.id], [first.id, first.id, first.id]);
    is("an address with no id of ours finds nothing", collectionInSegment("beginner-guides", [first]), null);
    is("a draft is not shown in it", shownProducts(first, [{ id: ids[1], hidden: true }, { id: ids[0], hidden: false }]), [ids[0]]);
    is("one with nothing published is not linked to", shownCollections([first], [{ id: ids[1], hidden: true }]), []);
    is("taking out its last product takes it away", collectionsWithout([{ ...first, products: [ids[0]] }], ids[0]), []);
  }
  is(`picks: other products, each once, ${MAX_PAIRS} at most`, parsePairs([ids[0], ids[0], ids[1], ids[2], ids[3], ids[4]], ids[1]), [ids[0], ids[2], ids[3]]);
  is(
    "the cart's picks: in the creator's order, the first product's first, never what is in the cart, never twice",
    cartPicks([{ id: "a", pairs: ["b", "c", "d"] }, { id: "b", pairs: ["d", "e"] }], ["a", "b", "soon1"]),
    [{ id: "c", with: "a" }, { id: "d", with: "a" }, { id: "e", with: "b" }],
  );
  for (const [lang, words] of Object.entries(CART_WORDS)) {
    is(`a pick is said as the creator's, with no number in it (${lang})`, /\d/.test(words.pickWhy("Oven Notes", "Bread")), false);
  }

  part("In the store");
  await claimHandle(OWNER, "harbor", "Harbor Kitchen", "");
  await ensureStatsId(OWNER);
  await setStripeAccount(OWNER, "acct_1TestHarbor0002", true);
  await setSubscription(OWNER, { customerId: "cus_Owner00002", subscriptionId: "sub_Owner00002", active: true });
  const p: Record<string, string> = {};
  for (const [title, price] of [["Bread", "19"], ["Starter", "9"], ["Pizza", "29"], ["Cakes", "15"], ["Pies", "12"]]) {
    const added = await addProduct(OWNER, title, "", price, null);
    if (!added.ok) throw new Error(`no ${title}`);
    p[title] = added.product.id;
    await setProductLink(OWNER, added.product.id, `https://example.com/${title.toLowerCase()}`);
  }
  const saved = await setCollections(OWNER, [{ title: "Baking basics", blurb: "Where to start.", products: [p.Bread, p.Starter, p.Pizza] }, { title: "Sweet", products: [p.Cakes, p.Pies, p.Bread] }]);
  is("saved", saved.ok, true);
  let store = (await storeForEmail(OWNER))!;
  is("kept on the store, in order", (store.collections ?? []).map((c) => [c.title, c.products.length]), [["Baking basics", 3], ["Sweet", 3]]);
  is("a product the store does not have is refused by the store too", (await setCollections(OWNER, [{ title: "X", products: ["nothere1"] }])).ok, false);
  is("and what was saved is untouched", ((await storeForEmail(OWNER))!.collections ?? []).length, 2);
  const basics = store.collections![0];
  const map = await storeSitemap(store);
  is("each collection is in the store's map", map.some((entry) => entry.url.endsWith(`/shop/${collectionSegment(basics)}`)), true);
  await setProductHidden(OWNER, p.Starter, true);
  store = (await storeForEmail(OWNER))!;
  const index = store.catalog.items.map((item) => ({ id: item.id, hidden: (item.kind & 2048) !== 0 }));
  is("a product made a draft drops out of what the collection shows", shownProducts(store.collections![0], index), [p.Bread, p.Pizza]);
  await setProductHidden(OWNER, p.Starter, false);
  await removeProduct(OWNER, p.Bread);
  store = (await storeForEmail(OWNER))!;
  is("a removed product is taken out of every collection", (store.collections ?? []).map((c) => c.products), [[p.Starter, p.Pizza], [p.Cakes, p.Pies]]);

  part("Goes well with");
  is(`more than ${MAX_PAIRS} is refused`, await setProductPairs(OWNER, p.Pizza, [p.Starter, p.Cakes, p.Pies, "another1"]), { ok: false, reason: "too_many" });
  is("a product the store does not have is refused", (await setProductPairs(OWNER, p.Pizza, ["nothere1"])).ok, false);
  is("the product itself is refused", (await setProductPairs(OWNER, p.Pizza, [p.Pizza])).ok, false);
  is("saved", (await setProductPairs(OWNER, p.Pizza, [p.Cakes, p.Starter])).ok, true);
  store = (await storeForEmail(OWNER))!;
  is("kept on the product, in order, on its full record and its listing", [(await readProduct(store, p.Pizza))?.pairs, (await readListing(store, p.Pizza))?.pairs], [[p.Cakes, p.Starter], [p.Cakes, p.Starter]]);

  part("The open cart");
  const ask = async (ids: string[]) => {
    const response = await readCart(new NextRequest(`https://marktmorgen.com/api/store/cart?handle=harbor&ids=${ids.join(",")}`));
    return (await response.json()) as { ok: boolean; items: { id: string; cents: number; ok: boolean }[]; total: string; suggest: { id: string; kind: string; why: string }[] };
  };
  let cart = await ask([p.Pizza]);
  is("the creator's picks are offered, in their order, as their pick", cart.suggest.map((s) => [s.id, s.kind]), [[p.Cakes, "pick"], [p.Starter, "pick"]]);
  is("said as the creator's pick, with the product it goes with", cart.suggest[0]?.why, "Harbor Kitchen picked it to go with Pizza");
  cart = await ask([p.Pizza, p.Cakes]);
  is("never something already in the cart", cart.suggest.map((s) => s.id), [p.Starter]);
  cart = await ask([p.Pizza, p.Cakes, p.Starter, p.Pies]);
  is("nothing more is offered to a full cart", cart.suggest, []);
  is("the cart's total is each line as charged", [cart.items.map((i) => i.cents), cart.total], [[2900, 1500, 900, 1200], "$65"]);

  done();
}

void main();
