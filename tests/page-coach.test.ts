/**
 * The page coach (lib/page-coach.ts) and the writing help's review of a page
 * (lib/ai.ts, reviewPage). The model is played by a stand-in for `fetch`.
 * What is checked:
 *
 *   - an empty page scores nothing and a complete one scores 100, and each
 *     missing part is listed with the block that answers it;
 *   - the numbers check is asked for only when the store has a number to
 *     show, so the coach never asks a creator to type one;
 *   - the steepest fall in readers is found, and nothing is said below 30;
 *   - the review is told the page, what is missing and the store's language,
 *     is held to the honesty rules, and comes back cleaned: a one-sided
 *     "who it is for" is dropped rather than half shown.
 */
import { claimHandle, ensureStatsId, setSubscription, storeForEmail } from "@/lib/store";
import { reviewPage } from "@/lib/ai";
import { coachChecks, coachScore, scoreWord, steepestDrop } from "@/lib/page-coach";
import { CELL_YES, parsePage } from "@/lib/sales-page";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

let reply = "{}";
const asked: { system: string; content: string }[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.hostname !== "api.anthropic.com") return new Response("{}", { status: 404 });
  const body = JSON.parse(String(init?.body)) as { system: string; messages: { content: string }[] };
  asked.push({ system: body.system, content: body.messages[0].content });
  return new Response(JSON.stringify({ content: [{ type: "text", text: reply }] }));
}) as typeof fetch;

const FULL = parsePage({
  blocks: [
    { id: "hero0001", kind: "hero", headline: "Cut faster, safely, in ten days", sub: "Ten short lessons.", media: "picture", video: null },
    { id: "cta00001", kind: "cta", label: "", note: "" },
    { id: "fact0001", kind: "facts", heading: "", show: ["lessons"] },
    { id: "bene0001", kind: "benefits", heading: "", items: ["One", "Two", "Three"] },
    { id: "step0001", kind: "steps", heading: "", items: [{ title: "Pay" }, { title: "Watch" }, { title: "Cook" }] },
    { id: "pict0001", kind: "video", heading: "", video: { provider: "youtube", id: "dQw4w9WgXcQ", hash: "" }, caption: "" },
    { id: "fit00001", kind: "fit", heading: "", yesLabel: "", noLabel: "", yes: ["You cook daily", "You fear knives"], no: ["You are a chef"] },
    { id: "bio00001", kind: "bio", heading: "", body: "I teach cooking.", photo: true },
    { id: "faq00001", kind: "faq", heading: "", items: [{ q: "A?", a: "a" }, { q: "B?", a: "b" }, { q: "C?", a: "c" }] },
    { id: "guar0001", kind: "guarantee", heading: "", body: "Refund in 30 days." },
    { id: "cta00002", kind: "cta", label: "", note: "" },
    { id: "revi0001", kind: "reviews", heading: "Reviews" },
  ],
  seoTitle: "",
  seoDescription: "Learn to cut fast.",
  next: null,
  test: { id: "", headline: "Ten days to safer, faster cutting", sub: "" },
});
const LESSONS = { lessons: { key: "lessons" as const, value: "10", label: "lessons" } };

async function main(): Promise<void> {
  part("The score");
  const empty = coachChecks({ page: parsePage({ blocks: [] }), productTitle: "Knife Skills", free: false, picture: true, facts: {} });
  is("an empty page scores nothing", coachScore(empty), 0);
  is("and says so in a word", scoreWord(coachScore(empty)), "Just started");
  is("each missing part comes with the block that answers it", empty.filter((c) => c.add).map((c) => c.add), ["hero", "cta", "benefits", "inside", "fit", "faq", "guarantee", "cta", "reviews", "pictures", "bio"]);
  const full = coachChecks({ page: FULL, productTitle: "Knife Skills", free: false, picture: true, facts: LESSONS });
  is("a complete page scores 100", [coachScore(full), full.filter((c) => !c.done).map((c) => c.id)], [100, []]);
  const named = parsePage({ ...FULL, blocks: FULL.blocks.map((b) => (b.kind === "hero" ? { ...b, headline: "knife skills" } : b)) });
  is("a headline that is only the product's name is not one", coachChecks({ page: named, productTitle: "Knife Skills", free: false, picture: true, facts: LESSONS }).find((c) => c.id === "headline")?.done, false);
  const late = parsePage({ ...FULL, blocks: FULL.blocks.filter((b) => b.id !== "cta00001") });
  is("a first button five blocks down is too far", coachChecks({ page: late, productTitle: "Knife Skills", free: false, picture: true, facts: LESSONS }).find((c) => c.id === "early-button")?.done, false);

  part("Never a reason to type a number");
  is("no number counted: the numbers check is not asked", empty.some((c) => c.id === "facts"), false);
  is("one counted: it is", full.some((c) => c.id === "facts"), true);

  part("A free product's page");
  const free = coachChecks({ page: parsePage({ blocks: [] }), productTitle: "Free list", free: true, picture: false, facts: {} });
  is("asks nothing about payment: no guarantee, buttons or headline test", free.some((c) => ["guarantee", "closing-button", "test", "reviews"].includes(c.id)), false);

  part("Where readers stop");
  const order = [
    { id: "a", kind: "hero" as const },
    { id: "b", kind: "text" as const },
    { id: "c", kind: "faq" as const },
  ];
  is("the steepest fall, and where", steepestDrop(order, { shares: { a: 100, b: 90, c: 40 }, visitors: 120 }), { at: "c", kind: "faq", lost: 50, before: 90 });
  is("below thirty readers, nothing is said", steepestDrop(order, { shares: { a: 100, b: 90, c: 40 }, visitors: 12 }), null);
  is("a gentle slope is not a fall", steepestDrop(order, { shares: { a: 100, b: 92, c: 85 }, visitors: 400 }), null);

  part("The review");
  redis.clear();
  process.env.ANTHROPIC_API_KEY = `sk-ant-api03-${"x".repeat(40)}`;
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await ensureStatsId("owner@example.com");
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "pro", trialEnds: 0 });
  const store = (await storeForEmail("owner@example.com"))!;
  reply = `Here:\n${JSON.stringify({
    verdict: "Clear offer. Put a button under the headline.",
    fixes: [{ title: "Add a button near the top", detail: "Ready buyers should not scroll." }, { title: "" }],
    headlines: [{ headline: "Cortar más rápido en diez días", sub: "Diez lecciones cortas." }, { headline: "", sub: "x" }, { headline: "El curso, por 49 $", sub: "" }, { headline: "Only $49 today", sub: "" }],
    fit: { yes: ["Cocinas a diario"], no: [] },
    questions: [{ q: "¿Cuánto dura el acceso?", a: "" }, { q: "¿En qué formato?", a: "Vídeos." }],
  })}`;
  const reviewed = await reviewPage(store, {
    facts: "Product: Knife Skills\nPrice: $49",
    missing: ["A button near the top"],
    drop: "",
    language: "Spanish",
    free: false,
    notes: "",
  });
  if (!reviewed.ok) throw new Error(`no review: ${reviewed.reason}`);
  is("it is given the page and what is missing", [asked[0].content.includes("Product: Knife Skills"), asked[0].content.includes("- A button near the top")], [true, true]);
  is("told to write the page's words in the store's language", asked[0].system.includes("write them in Spanish"), true);
  is("and held to the rules every draft is", asked[0].system.includes("Never invent a testimonial"), true);
  is("only answers the page's facts give", asked[0].system.includes("Give the answer only when the facts given answer it"), true);
  is("empty items are dropped, and so is a headline that states a price", [reviewed.value.fixes.length, reviewed.value.headlines.length], [1, 1]);
  is("it is told never to put a price in a headline", asked[0].system.includes("Never a price"), true);
  is("a one-sided who-it-is-for is left out, not half shown", reviewed.value.fit, null);
  is("a question the page cannot answer keeps its empty answer", reviewed.value.questions[0], { q: "¿Cuánto dura el acceso?", a: "" });
  is("it counts as one of the month's jobs", reviewed.left, 39);

  reply = "not json";
  const broken = await reviewPage(store, { facts: "x", missing: [], drop: "", language: "English", free: false, notes: "" });
  is("an answer that cannot be read retains its started attempt", [broken.ok, broken.ok ? 0 : broken.reason], [false, "failed"]);

  part("Comparison cells read as words for the model");
  is("a tick is kept as the tick character", CELL_YES, "✓");

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
