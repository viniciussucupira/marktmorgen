/**
 * The Store assistant's second function: one next product after a purchase
 * (lib/next-offer.ts, lib/next-offer-rules.ts, added 17 October 2026). Stripe
 * and the model are played by a stand-in for `fetch`. What is checked:
 *
 *   - off until the creator switches it on AND the add-on is paid for;
 *   - only the creator's own products on sale today: never the one bought,
 *     anything in the order, one turned down after paying, a draft, a
 *     limited one, a bundle holding something owned, or anything this
 *     address bought here before (read from Stripe); nothing on a guess
 *     when that cannot be read;
 *   - the creator's own choices first (picks, offers after paying, boxes,
 *     collections), and the model only when there are none and several to
 *     choose between; its choice labeled as AI by the page, never the model;
 *   - the model's sentence shown only when it holds to the creator's words;
 *   - one reply of the month's pool, reserved at the chat's worst cost,
 *     settled at what was billed, given back when nothing was; a spent pool
 *     asks no model and still offers the creator's choice;
 *   - one choice per order, kept: the page opened again and its email ask
 *     nothing more; the buyer can dismiss it;
 *   - the email carries it only where the creator allows and the buyer agreed;
 *   - its costs stay inside the add-on's priced reply and the store's
 *     requests, so the add-on's margin is unchanged; the pages say it.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { addProduct, claimHandle, ensureStatsId, setAssistantPlan, setCollections, setNextOffer, setProductBundle, setProductExtras, setProductHidden, setProductLink, setProductPairs, setStripeAccount, setSubscription, storeForEmail, type Listing, MAX_STORE_BYTES } from "@/lib/store";
import { MAX_PRODUCT_BYTES, readListing } from "@/lib/catalog";
import { aiRequestHoldMicroUsd } from "@/lib/spend-cost-table";
import { confirmationFor } from "@/lib/purchase-email";
import { FEATURE_PAGES } from "@/lib/feature-pages";
import { HELP_SECTIONS } from "@/lib/help-content";
import { PERSON_DATA } from "@/lib/person-data";
import { ASSISTANT_MESSAGE_COMMANDS, ASSISTANT_MESSAGE_DB_BYTES, ASSISTANT_MODEL, ASSISTANT_PRODUCTS, STORE_RECORD_BYTES, assistantMeetsFloor, assistantMessageExtraMicroUsd, assistantMessageWorstMicroUsd, assistantPoolMicroUsd, assistantSettledMicroUsd, assistantWindow } from "@/lib/store-assistant-rules";
import {
  NEXT_OFFER_CHOICES,
  NEXT_OFFER_OUTPUT_TOKENS,
  NEXT_OFFER_PRODUCTS,
  modelAddsValue,
  nextChoice,
  offerable,
  parseNextOffer,
  readReason,
  withinAssistantReply,
} from "@/lib/next-offer-rules";
import { NEXT_OFFER_SYSTEM, dismissNextOffer, nextOfferFor, nextOfferForEmail, nextOfferRequest, nextOfferShown, ownedHere } from "@/lib/next-offer";
import { NEXT_OFFER_WORDS, nextOfferWords } from "@/lib/buyer-words/next-offer";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

process.env.STRIPE_SECRET_KEY = "sk_test_next_offer_only";
process.env.ANTHROPIC_API_KEY = "sk-ant-test-only-a-stand-in-0123456789";

const OWNER = "next@example.com";
const ACCOUNT = "acct_1TestNextOffer01";
const BUYER = "buyer@example.com";

type Sent = { model: string; max_tokens: number; system: string; messages: { role: string; content: string }[] };
const asked: Sent[] = [];
/** Checkouts by the address they were paid from, and one-click payments by customer, as Stripe lists them. */
const sessions: Record<string, Record<string, unknown>[]> = {};
const intents: Record<string, Record<string, unknown>[]> = {};
let stripe: "up" | "down" | "more" = "up";
let model: { reply: string; usage?: unknown } | { status: number } = { reply: "{}" };
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const answer = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (url.hostname === "api.anthropic.com") {
    asked.push(JSON.parse(String(init?.body)) as Sent);
    if ("status" in model) return new Response("overloaded", { status: model.status });
    return answer({ content: [{ type: "text", text: model.reply }], usage: model.usage ?? { input_tokens: 2_000, output_tokens: 40 } });
  }
  if (stripe === "down") return answer({ error: { message: "down" } }, 500);
  const path = url.pathname.replace(/^\/v1/, "");
  if (path === "/checkout/sessions") return answer({ object: "list", data: sessions[url.searchParams.get("customer_details[email]") ?? ""] ?? [], has_more: stripe === "more" });
  if (path === "/payment_intents") return answer({ object: "list", data: intents[url.searchParams.get("customer") ?? ""] ?? [], has_more: false });
  return answer({ object: "list", data: [], has_more: false });
}) as typeof fetch;

const pick = (n: number, reason: string, usage?: unknown) => {
  model = { reply: JSON.stringify({ pick: n, reason }), usage };
};
const poolOf = async (statsId: string, id: string) => {
  const [raw] = await redis.pipeline([["HGETALL", `nl:assist:pool:${statsId}:${id}`]]);
  const flat = (Array.isArray(raw) ? raw : []).map(String);
  const out: Record<string, number> = {};
  for (let i = 0; i + 1 < flat.length; i += 2) out[flat[i]] = Number(flat[i + 1]);
  return out;
};
let n = 0;
const session = () => `cs_test_nextoffer${String((n += 1)).padStart(6, "0")}`;

async function main(): Promise<void> {
  redis.clear();
  const now = Date.now();

  part("The rules");
  is("off on a store written before it existed; the email only with the page", [parseNextOffer(undefined), parseNextOffer({ on: false, email: true }), parseNextOffer({ on: true, email: true })], [{ on: false, email: false }, { on: false, email: false }, { on: true, email: true }]);
  is("a sentence of why is one line, and none when too long", [readReason("  It goes\n further. "), readReason("x".repeat(400)), readReason(7)], ["It goes further.", "", ""]);
  is("inside what one chat reply is priced at: products read, answer length, commands", [withinAssistantReply(ASSISTANT_MESSAGE_COMMANDS), NEXT_OFFER_PRODUCTS + NEXT_OFFER_CHOICES <= ASSISTANT_PRODUCTS], [true, true]);
  is(
    "and the bytes it moves: the store record, its listings and one product's heavy record",
    STORE_RECORD_BYTES + (NEXT_OFFER_PRODUCTS + NEXT_OFFER_CHOICES) * 16_384 + MAX_PRODUCT_BYTES <= ASSISTANT_MESSAGE_DB_BYTES,
    true,
  );
  is("the store record priced is the largest", STORE_RECORD_BYTES, MAX_STORE_BYTES);
  is("its model request at every cap holds no more than a chat message's worst", aiRequestHoldMicroUsd(ASSISTANT_MODEL, { inputBytes: 24_576, blocks: 1, media: null, maxTokens: NEXT_OFFER_OUTPUT_TOKENS })! + assistantMessageExtraMicroUsd() <= assistantMessageWorstMicroUsd(), true);
  is("so the add-on's month is unchanged, and still keeps the owner's floor", assistantMeetsFloor(), true);

  part("Off until switched on and paid for");
  await claimHandle(OWNER, "nextshop", "Next Shop", "Recipes for busy weeknights.");
  await setSubscription(OWNER, { customerId: "cus_NextShop001", subscriptionId: "sub_NextPlan01", active: true, tier: "creator", trialEnds: 0, period: paidPeriod(now) });
  await setStripeAccount(OWNER, ACCOUNT, true);
  await ensureStatsId(OWNER);
  const make = async (title: string, summary: string, price: string) => {
    const made = await addProduct(OWNER, title, summary, price, null);
    if (!made.ok) throw new Error(`no product ${title}`);
    await setProductLink(OWNER, made.product.id, `https://example.com/${made.product.id}`);
    return made.product.id;
  };
  const planner = await make("Meal Planner", "A week of dinners, planned.", "27");
  const grocery = await make("Grocery Lists", "Printable lists for every week of the planner.", "9");
  const course = await make("Batch Cooking Course", "Cook the planner's dinners in two hours on Sunday.", "49");
  const draft = await make("Draft Thing", "Not ready.", "5");
  const limited = await make("Signed Print", "A signed kitchen print.", "30");
  await setProductHidden(OWNER, draft, true);
  await setProductExtras(OWNER, limited, { stock: 10 });
  let store = (await storeForEmail(OWNER))!;
  const listing = async (id: string) => (await readListing(store, id))!;
  const bought = async () => [await listing(planner)];
  const ask = async (over: Partial<Parameters<typeof nextOfferFor>[0]> = {}) => nextOfferFor({ store, session: session(), email: BUYER, bought: await bought(), alsoOwned: [], declined: [], now, ...over });
  is("not shown: switched off, no add-on", [nextOfferShown(store, now), await ask()], [false, null]);
  await setNextOffer(OWNER, { on: true, email: true });
  store = (await storeForEmail(OWNER))!;
  is("switched on but the add-on not paid for: still nothing", await ask(), null);
  const plan = { subscriptionId: "sub_Assist00002", active: true, period: paidPeriod(now), cancelsAtEnd: false, disputedAt: "" };
  await setAssistantPlan(OWNER, plan);
  store = (await storeForEmail(OWNER))!;
  is("switched on and paid for: shown", nextOfferShown(store, now), true);
  const window = assistantWindow(plan, now / 1000)!;

  part("Only the creator's own products on sale today, and never one owned");
  const all = await Promise.all([planner, grocery, course, draft, limited].map(listing));
  const known = new Map(all.map((p) => [p.id, p]));
  const sellable = (p: Listing) => !p.hidden;
  is("a draft and a limited product are never offered; one owned neither", [offerable(known.get(draft)!, new Set(), sellable), offerable(known.get(limited)!, new Set(), sellable), offerable(known.get(grocery)!, new Set([grocery]), sellable), offerable(known.get(course)!, new Set(), sellable)], [false, false, false, true]);
  const base = { bought: [known.get(planner)!], funnelTargets: [] as string[], collections: [] as { products: string[] }[], candidates: all, known, owned: new Set([planner]), declined: new Set<string>(), sellable };
  is("with no choice of the creator's: the store's order, and the model may choose", ((r) => r && [r.choice.reason, r.choice.productId, r.ranked.map((p) => p.id), modelAddsValue(r.choice, r.ranked)])(nextChoice(base)), ["order", grocery, [grocery, course], true]);
  is("the creator's picks come first, then offers after paying, boxes, collections", [
    nextChoice({ ...base, bought: [{ ...known.get(planner)!, pairs: [course] }] })?.choice.reason,
    nextChoice({ ...base, funnelTargets: [course] })?.choice.reason,
    nextChoice({ ...base, bought: [{ ...known.get(planner)!, bumps: [{ productId: course, priceCents: 900, pitch: "" }] }] })?.choice.reason,
    nextChoice({ ...base, collections: [{ products: [planner, course] }] })?.choice.reason,
  ], ["pick", "funnel", "bump", "collection"]);
  is("and the model is not asked when the creator chose", modelAddsValue({ productId: course, reason: "pick", why: "" }, [known.get(course)!, known.get(grocery)!]), false);
  is("one turned down after paying is not offered", nextChoice({ ...base, funnelTargets: [course], declined: new Set([course]) })?.choice.productId, grocery);
  is("one left to choose from: no model", ((r) => r && modelAddsValue(r.choice, r.ranked))(nextChoice({ ...base, owned: new Set([planner, grocery]) })), false);
  is("nothing left: nothing offered", nextChoice({ ...base, owned: new Set([planner, grocery, course]) }), null);
  const bundle = { ...known.get(course)!, id: "bundle0001", bundle: [planner, grocery], pick: null };
  is("a bundle holding something the buyer has is never offered", offerable(bundle, new Set([planner]), sellable), false);

  sessions[BUYER] = [{ id: "cs_test_earlier0000001", status: "complete", payment_status: "paid", customer: "cus_Buyer000001", metadata: { store: "nextshop", product: grocery } }];
  intents.cus_Buyer000001 = [{ id: "pi_Upsell0000001", status: "succeeded", metadata: { kind: "upsell", store: "nextshop", product: limited } }];
  is("what the address bought here before is read from Stripe: checkouts and offers after paying", [...((await ownedHere(store, BUYER)) ?? [])].sort(), [grocery, limited].sort());
  stripe = "down";
  is("when Stripe cannot be asked, nothing is offered on a guess", [await ownedHere(store, BUYER), await ask()], [null, null]);
  stripe = "more";
  is("nor when it holds more than one page of purchases", await ownedHere(store, BUYER), null);
  stripe = "up";
  is("another store's purchases do not count", await ownedHere(store, "nobody@example.com").then((s) => s?.size), 0);

  part("The creator's own choice, with no model");
  await setProductPairs(OWNER, planner, [course]);
  store = (await storeForEmail(OWNER))!;
  const callsBefore = asked.length;
  const first = session();
  const pairOffer = await nextOfferFor({ store, session: first, email: BUYER, bought: await bought(), alsoOwned: [], declined: [], now });
  is("what the creator says goes well with it, not labeled as AI, and no model asked", [pairOffer?.product.id, pairOffer?.ai, asked.length - callsBefore], [course, false, 0]);
  await setProductPairs(OWNER, planner, []);
  store = (await storeForEmail(OWNER))!;
  is("one choice per order, kept: opened again, the same product, and nothing asked", [(await nextOfferFor({ store, session: first, email: BUYER, bought: await bought(), alsoOwned: [], declined: [], now }))?.product.id, asked.length - callsBefore], [course, 0]);
  is("kept three days under the order, with no address", await (async () => {
    const [raw, ttl] = await redis.pipeline([["GET", `nl:assist:next:${first}`], ["TTL", `nl:assist:next:${first}`]]);
    return [Number(ttl) > 3 * 86_400 - 60 && Number(ttl) <= 3 * 86_400, String(raw).includes("@")];
  })(), [true, false]);
  is("what the buyer bought in this order is never offered", (await ask({ alsoOwned: [course] })), null);

  part("The model, only when the creator chose nothing");
  delete sessions[BUYER];
  delete intents.cus_Buyer000001;
  pick(2, "It cooks the dinners the planner plans.", { input_tokens: 1_500, output_tokens: 30 });
  const before = (await poolOf(store.statsId!, window.id)).spent ?? 0;
  const aiOffer = await ask();
  const sent = asked[asked.length - 1];
  is("asked of the assistant's model, with its own small answer cap", [sent.model, sent.max_tokens, sent.system === NEXT_OFFER_SYSTEM("Next Shop")], [ASSISTANT_MODEL, NEXT_OFFER_OUTPUT_TOKENS, true]);
  is("told only the products, nothing about the buyer", [sent.messages[0].content.includes("Batch Cooking Course"), JSON.stringify(sent).includes(BUYER), JSON.stringify(sent).includes("Draft Thing")], [true, false, false]);
  is("its choice, labeled as AI, with its sentence when it holds", [aiOffer?.product.id, aiOffer?.ai, aiOffer?.why], [course, true, "It cooks the dinners the planner plans."]);
  const after = await poolOf(store.statsId!, window.id);
  is("one reply of the month's pool, settled at what was billed", [after.held, after.spent - before, after.n >= 1, after.cap], [0, assistantSettledMicroUsd({ input_tokens: 1_500, output_tokens: 30 }), true, assistantPoolMicroUsd()]);
  pick(1, "Over 5,000 cooks loved it, and it is 50% off today only.");
  const invented = await ask();
  is("a sentence with a figure, a deal or pressure the creator never wrote is not shown: their own summary is", [invented?.ai, invented?.why, invented?.product.summary], [true, "", "Printable lists for every week of the planner."]);
  pick(9, "No such product.");
  is("a choice outside the list falls back to the creator's order", ((o) => [o?.product.id, o?.ai])(await ask()), [grocery, false]);
  model = { status: 529 };
  const errBefore = await poolOf(store.statsId!, window.id);
  const refused = await ask();
  const errAfter = await poolOf(store.statsId!, window.id);
  is("the provider refused: nothing billed, all given back, the creator's order shown", [refused?.product.id, refused?.ai, errAfter.held, errAfter.spent, errAfter.n], [grocery, false, 0, errBefore.spent, errBefore.n]);

  part("A spent pool asks no model, and still offers");
  await redis.pipeline([["HSET", `nl:assist:pool:${store.statsId}:${window.id}`, "spent", String(assistantPoolMicroUsd())]]);
  pick(2, "It cooks the dinners.");
  const spentCalls = asked.length;
  const spent = await ask();
  is("no model asked, no cost, the creator's order", [asked.length - spentCalls, spent?.product.id, spent?.ai], [0, grocery, false]);
  await redis.pipeline([["HSET", `nl:assist:pool:${store.statsId}:${window.id}`, "spent", "0"]]);

  part("The confirmation email, and the buyer's no thanks");
  const order = session();
  pick(2, "It cooks the dinners the planner plans.");
  const shown = await nextOfferFor({ store, session: order, email: BUYER, bought: await bought(), alsoOwned: [], declined: [], now });
  const checkout = (news: boolean) => ({ id: order, status: "complete", payment_status: "paid", created: Math.floor(now / 1000) - 60, amount_total: 2700, currency: "usd", customer_details: { email: BUYER }, metadata: { store: "nextshop", product: planner, ...(news ? { news: "yes" } : {}) } });
  const forEmail = await nextOfferForEmail(store, order, checkout(true).metadata);
  is("the email gets the page's own choice, only to a buyer who agreed to hear from the creator", [forEmail?.product.id, await nextOfferForEmail(store, order, checkout(false).metadata)], [shown?.product.id, null]);
  const letter = confirmationFor(store, checkout(true), now / 1000, [], [await listing(planner), await listing(course)], null, forEmail);
  const w = nextOfferWords("en");
  is("in the order's own email: labeled, its price, its page, and why it is there", [letter?.text.includes(`${w.aiLabel}: Batch Cooking Course, $49`), letter?.text.includes("/p/batch-cooking-course-"), letter?.text.includes(w.aiNote("Next Shop")), letter?.text.includes(w.emailConsent("Next Shop"))], [true, true, true, true]);
  is("never to a buyer who did not agree", confirmationFor(store, checkout(false), now / 1000, [], [await listing(planner)], null, forEmail)?.text.includes(w.aiLabel), false);
  await setNextOffer(OWNER, { on: true, email: false });
  store = (await storeForEmail(OWNER))!;
  is("nor when the creator keeps it to the page", await nextOfferForEmail(store, order, checkout(true).metadata), null);
  await setNextOffer(OWNER, { on: true, email: true });
  store = (await storeForEmail(OWNER))!;
  is("no thanks: dismissed for this order, on the page and in its email", [await dismissNextOffer(store, order), await nextOfferFor({ store, session: order, email: BUYER, bought: await bought(), alsoOwned: [], declined: [], now }), await nextOfferForEmail(store, order, checkout(true).metadata)], [true, null, null]);
  is("an order with no choice is not created by a dismissal", [await dismissNextOffer(store, session()), await dismissNextOffer(store, "nonsense")], [false, false]);

  part("A bundle holding what was bought, and a choice no longer on sale");
  const kitMade = await addProduct(OWNER, "Kitchen Kit", "The planner and the lists together.", "30", null);
  if (!kitMade.ok) throw new Error("no kit");
  const kit = kitMade.product.id;
  const kitSet = await setProductBundle(OWNER, kit, [planner, grocery]);
  store = (await storeForEmail(OWNER))!;
  const kitListing = (await readListing(store, kit))!;
  is("a bundle, on sale", [kitSet.ok, kitListing.bundle, offerable(kitListing, new Set(), (p) => !p.hidden)], [true, [planner, grocery], true]);
  const kitOffer = await ask({ declined: [grocery, course] });
  is("but one with the product bought inside it is not offered", kitOffer?.product.id === kit, false);
  const gone = session();
  await nextOfferFor({ store, session: gone, email: BUYER, bought: await bought(), alsoOwned: [], declined: [], now });
  const keptId = JSON.parse(String((await redis.pipeline([["GET", `nl:assist:next:${gone}`]]))[0])).p as string;
  await setProductHidden(OWNER, keptId, true);
  store = (await storeForEmail(OWNER))!;
  is("a kept choice made a draft since is no longer shown", await nextOfferFor({ store, session: gone, email: BUYER, bought: await bought(), alsoOwned: [], declined: [], now }), null);

  part("The request is bounded");
  const many = Array.from({ length: 200 }, (_, i) => ({ ...known.get(course)!, id: `p${i}`, title: `Product ${i} with a long title`, summary: "s".repeat(290) }));
  const request = nextOfferRequest(store, [known.get(planner)!], many)!;
  is("a long list is cut to the facts' cap, inside the chat's input cap", [request.inputBytes <= 24_576, request.shown.length < 200, request.shown.length > 0], [true, true, true]);

  part("What the pages say is the code's");
  const pages = JSON.stringify(FEATURE_PAGES) + JSON.stringify(HELP_SECTIONS);
  is("the feature page and the help describe it", [/one next product/i.test(pages), /AI suggestion/.test(pages)], [true, true]);
  const privacy = readFileSync(join(process.cwd(), "app/privacy/page.tsx"), "utf8").replace(/\s+/g, " ");
  is("the privacy policy says what is read, sent and kept", [privacy.includes("next product"), /three days/.test(privacy)], [true, true]);
  is("the registry says what is kept, and for how long", PERSON_DATA.filter((d) => d.file === "lib/next-offer.ts").map((d) => d.how), ["expires"]);
  const words = Object.values(NEXT_OFFER_WORDS.en).map((v) => (typeof v === "function" ? v("Shop") : v)).join(" ");
  is("in US English, with no urgency, scarcity or invented claims", [/\b(colour|cancelled|centre)/i.test(words), /unlimited|hurry|only \d|left|today only|best/i.test(words)], [false, false]);
  is("every language has every word", Object.values(NEXT_OFFER_WORDS).every((l) => Object.keys(l).length === Object.keys(NEXT_OFFER_WORDS.en).length), true);
}

main()
  .then(done)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
