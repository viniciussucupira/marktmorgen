import { KIND } from "@/lib/catalog";
import { emptyBlock } from "@/lib/sales-page";
import { readFunnelPaymentChecks } from "@/lib/funnel-payment-checks";
import type { Listing, Store } from "@/lib/store";
import { readFunnelPageChecks } from "@/lib/funnel-page-checks";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
async function main() {
  redis.clear();
  const store = { statsId: "forms-a", sitePages: [{ id: "abcd123456", title: "Apply", from: 0 }] } as unknown as Store;
  const funnel = { steps: [{ kind: "page" as const, id: "abcd123456" }] };
  const key = "nl:product:page:forms-a:site-abcd123456";
  part("Saved page form availability");
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [{ kind: "form", form: "" }] })]]);
  is("empty binding needs correction", (await readFunnelPageChecks(store, funnel))[0]?.includes("no selected form"), true);
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [{ kind: "form", form: "abcdef1234" }] })]]);
  is("removed form is identified", (await readFunnelPageChecks(store, funnel))[0]?.includes("no longer available"), true);
  await redis.pipeline([["HSET", "nl:forms:forms-b", "abcdef1234", "{}"]]);
  is("another store cannot satisfy the binding", (await readFunnelPageChecks(store, funnel)).length, 1);
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [{ kind: "hero" }] })]]);
  is("page without form has no form warning", await readFunnelPageChecks(store, funnel), []);
  await redis.pipeline([["SET", key, "broken"]]);
  let failed = false;
  try { await readFunnelPageChecks(store, funnel); } catch { failed = true; }
  is("malformed page stays unknown", failed, true);
  is("kept-back page is handled by availability review", await readFunnelPageChecks({ ...store, sitePages: [{ ...store.sitePages[0], from: -1 }] }, funnel), []);
  is("foreign page is not read", await readFunnelPageChecks(store, { steps: [{ kind: "page", id: "foreign" }] }), []);
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [{ kind: "form", form: "abcdef1234" }] })]]);
  await redis.pipeline([["HSET", "nl:forms:forms-a", "abcdef1234", JSON.stringify({ id: "abcdef1234", name: "Apply", fields: [{ id: "field1", type: "email", label: "Email", required: true }], outcomes: [], offerList: false, updatedAt: 1 })]]);
  is("valid selected-store form passes", await readFunnelPageChecks(store, funnel), []);
  await redis.pipeline([["HSET", "nl:forms:forms-a", "abcdef1234", "broken"]]);
  let invalidForm = false;
  try { await readFunnelPageChecks(store, funnel); } catch { invalidForm = true; }
  is("malformed stored form stays unknown", invalidForm, true);
  const pipeline = redis.pipeline;
  try {
    redis.pipeline = async () => { throw new Error("Injected read failure"); };
    let unavailable = false;
    try { await readFunnelPageChecks(store, funnel); } catch { unavailable = true; }
    is("storage failure never becomes a clear review", unavailable, true);
  } finally { redis.pipeline = pipeline; }
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [{ kind: "form", form: "" }] })]]);
  is("form warning reaches the existing saved funnel review", (await readFunnelPaymentChecks({ ...store, catalog: { id: null, inline: null, items: [], head: [] } } as unknown as Store, funnel))[0]?.includes("no selected form"), true);
  const blockA = { ...emptyBlock("form"), form: "abcdef1234" };
  const blockB = { ...emptyBlock("form"), form: "bbbbbb1234" };
  const validForm = { id: "abcdef1234", name: "Apply", fields: [{ id: "field1", type: "email", label: "Email", required: true }], updatedAt: 1 };
  await redis.pipeline([["HSET", "nl:forms:forms-a", "abcdef1234", JSON.stringify(validForm)], ["SET", key, JSON.stringify({ blocks: [blockA], variant: { blocks: [blockB] } })]]);
  is("missing B form identifies version B", (await readFunnelPageChecks(store, funnel))[0]?.includes("Version B:"), true);
  await redis.pipeline([["HSET", "nl:forms:forms-a", "bbbbbb1234", JSON.stringify({ ...validForm, id: "bbbbbb1234" })]]);
  is("valid forms in both versions pass", await readFunnelPageChecks(store, funnel), []);
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [{ ...blockA, form: "" }], variant: { blocks: [blockB] } })]]);
  is("empty A form identifies version A", (await readFunnelPageChecks(store, funnel))[0]?.includes("Version A:"), true);
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [blockA], variant: { blocks: "invalid" } })]]);
  let invalidVariant = false;
  try { await readFunnelPageChecks(store, funnel); } catch { invalidVariant = true; }
  is("malformed variant stays unknown", invalidVariant, true);
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [blockA], test: { headline: "Different headline" } })]]);
  is("headline-only test does not invent a second form", await readFunnelPageChecks(store, funnel), []);
  const calls: (string | number)[][][] = [];
  try {
    redis.pipeline = async commands => { calls.push(commands); return pipeline(commands); };
    await readFunnelPageChecks(store, { steps: [...funnel.steps, ...funnel.steps] });
    is("repeated page and form use two reads with unique identifiers", [calls.length, calls[0]?.length, calls[1]?.[0]?.length], [2, 1, 3]);
  } finally { redis.pipeline = pipeline; }
  try {
    redis.pipeline = async commands => commands[0]?.[0] === "GET" ? [] : pipeline(commands);
    let shortPages = false;
    try { await readFunnelPageChecks(store, funnel); } catch { shortPages = true; }
    is("incomplete page batch stays unknown", shortPages, true);
  } finally { redis.pipeline = pipeline; }
  try {
    redis.pipeline = async commands => commands[0]?.[0] === "HMGET" ? [[]] : pipeline(commands);
    let shortForms = false;
    try { await readFunnelPageChecks(store, funnel); } catch { shortForms = true; }
    is("incomplete form batch stays unknown", shortForms, true);
  } finally { redis.pipeline = pipeline; }
  const result = { id: "result", title: "Your next step", body: "", product: "offer001" };
  const quizForm = { ...validForm, outcomes: [result] };
  await redis.pipeline([["HSET", "nl:forms:forms-a", "abcdef1234", JSON.stringify(quizForm)]]);
  const quizStore = { ...store, catalog: { id: null, inline: null, head: [], items: [{ id: "offer001", kind: KIND.paid, options: [] }] } } as unknown as Store;
  is("listed quiz recommendation passes", await readFunnelPageChecks(quizStore, funnel), []);
  const missingRecommendation = await readFunnelPageChecks({ ...quizStore, catalog: { ...quizStore.catalog, items: [] } }, funnel);
  is("removed quiz recommendation identifies result", missingRecommendation[0]?.includes("Your next step") && missingRecommendation[0]?.includes("no longer available in this store"), true);
  const draftRecommendation = await readFunnelPageChecks({ ...quizStore, catalog: { ...quizStore.catalog, items: [{ ...quizStore.catalog.items[0], kind: KIND.paid | KIND.hidden }] } }, funnel);
  is("draft quiz recommendation needs publication", draftRecommendation[0]?.includes("draft product"), true);
  await redis.pipeline([["HSET", "nl:forms:forms-a", "abcdef1234", JSON.stringify({ ...quizForm, outcomes: [{ ...result, product: "" }] })]]);
  is("text-only quiz result needs no product", await readFunnelPageChecks(store, funnel), []);
  await redis.pipeline([["HSET", "nl:forms:forms-a", "abcdef1234", JSON.stringify(quizForm)]]);
  let unknownCatalog = false;
  try { await readFunnelPageChecks(store, funnel); } catch { unknownCatalog = true; }
  is("unavailable product index stays unknown", unknownCatalog, true);
  let unknownKind = false;
  try { await readFunnelPageChecks({ ...quizStore, catalog: { ...quizStore.catalog, items: [{ ...quizStore.catalog.items[0], kind: NaN }] } }, funnel); } catch { unknownKind = true; }
  is("malformed recommendation availability stays unknown", unknownKind, true);
  process.env.STRIPE_SECRET_KEY = "sk_test_local_configuration_only";
  const offer = { id: "offer001", title: "Recommended offer", priceCents: 1000, hidden: false, call: null, course: null, podcast: null, shipping: null, options: [], recurring: null, bundle: null, bumps: [], stock: null, pwyw: null, plan: null, keys: null, file: null, link: null };
  const checkoutStore = { ...quizStore, currency: "usd", stripeAccountId: "acct_test", stripeChargesEnabled: true, subscriptionActive: true, suspended: false, catalog: { ...quizStore.catalog, head: [offer] } } as unknown as Store;
  const deliveryIssues = await readFunnelPaymentChecks(checkoutStore, funnel);
  is("quiz delivery problem identifies result and offer", deliveryIssues[0]?.includes("Your next step") && deliveryIssues[0]?.includes("Recommended offer") && deliveryIssues[0]?.includes("delivery"), true);
  const readyOffer = { ...offer, link: "https://example.com/delivery" };
  const readyStore = { ...checkoutStore, catalog: { ...checkoutStore.catalog, head: [readyOffer] } } as unknown as Store;
  is("configured recommended offer passes", await readFunnelPaymentChecks(readyStore, funnel), []);
  is("recommended paid offer checks payments", (await readFunnelPaymentChecks({ ...readyStore, stripeChargesEnabled: false }, funnel))[0]?.includes("Payments are unavailable"), true);
  const freeStore = { ...readyStore, listId: null, catalog: { ...readyStore.catalog, head: [{ ...readyOffer, priceCents: 0 }] } } as unknown as Store;
  is("recommended free offer checks sign-up eligibility", (await readFunnelPaymentChecks(freeStore, funnel))[0]?.includes("Free sign-up is unavailable"), true);
  const noStock = { ...readyStore, catalog: { ...readyStore.catalog, head: [{ ...readyOffer, stock: 0 }] } } as unknown as Store;
  is("recommended offer checks configured quantity", (await readFunnelPaymentChecks(noStock, funnel))[0]?.includes("quantity of zero"), true);
  const newlyHidden = { ...readyStore, catalog: { ...readyStore.catalog, head: [{ ...readyOffer, hidden: true }] } } as unknown as Store;
  is("listing draft wins over older catalog visibility", (await readFunnelPaymentChecks(newlyHidden, funnel))[0]?.includes("now a draft"), true);
  const failedListing = { ...readyStore, catalog: { ...readyStore.catalog, get head(): Listing[] { throw new Error("Injected recommended listing failure"); } } } as Store;
  let recommendationUnknown = false;
  try { await readFunnelPaymentChecks(failedListing, funnel); } catch { recommendationUnknown = true; }
  is("recommended listing failure keeps review unknown", recommendationUnknown, true);
  done();
}
void main();
