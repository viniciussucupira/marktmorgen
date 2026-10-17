/**
 * The whole sales page, drafted by the writing help (lib/ai.ts, writePage) and
 * laid out as blocks (lib/sales-page.ts, blocksFromDraft).
 *
 * Measured before it was built (7 October 2026): Kajabi and SamCart draft
 * whole sales pages; Stan does not. The model is played by a stand-in for
 * `fetch`. What is checked:
 *
 *   - it drafts from what the product already says, with no notes needed,
 *     and refuses only when nothing at all was said about the product;
 *   - it is told never to write the creator's story or a guarantee it was
 *     not given, and a guarantee it returns anyway is dropped;
 *   - a price written into the button is taken out;
 *   - the draft becomes a page in the order that sells, held to every rule a
 *     page typed by hand is: one hero, first; one place for reviews; no
 *     "About you" block.
 */
import { claimHandle, ensureStatsId, setSubscription, storeForEmail } from "@/lib/store";
import { writePage } from "@/lib/ai";
import { blocksFromDraft, parsePage } from "@/lib/sales-page";
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

const DRAFT = {
  headline: "Forty weeknight dinners your kids will actually eat",
  sub: "For busy parents: one page per recipe, with the shopping list.",
  story: { heading: "Why this exists", body: "Dinner should not be a fight.\n\nThese are the forty that worked." },
  benefits: ["40 recipes on one page each", "A shopping list for every week", "Swaps for picky eaters"],
  inside: [{ title: "Week 1", detail: "Ten fast dinners" }],
  faq: [{ q: "What format is it?", a: "A PDF you download right after paying." }],
  guarantee: "Full refund within 30 days, no questions asked.",
  cta: "Get the pack for $27",
  seoTitle: "Weeknight Recipe Pack",
  seoDescription: "Forty weeknight dinners, one page each.",
};

async function main(): Promise<void> {
  redis.clear();
  process.env.ANTHROPIC_API_KEY = `sk-ant-api03-${"x".repeat(40)}`;
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await ensureStatsId("owner@example.com");
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "pro", trialEnds: 0 });
  const store = (await storeForEmail("owner@example.com"))!;

  part("What it drafts from");
  const nothing = await writePage(store, { title: "Pack", price: "$27", kind: "download", summary: "", about: "", notes: "" });
  is("nothing said about the product: refused before asking", nothing.ok ? "ran" : nothing.reason, "notes");
  is("and the model was not asked", asked.length, 0);

  reply = `Sure:\n${JSON.stringify(DRAFT)}`;
  const drafted = await writePage(store, {
    title: "Weeknight Recipe Pack",
    price: "$27",
    kind: "download",
    summary: "Forty weeknight recipes, each on one page.",
    about: "For busy parents.",
    notes: "",
  });
  if (!drafted.ok) throw new Error(`no draft: ${drafted.reason}`);
  is("the product's own words are enough", drafted.ok, true);
  is("the description is what it was given", asked[0].content.includes("For busy parents."), true);
  is("it is told not to write the creator's story", asked[0].system.includes("Never write about the creator's life"), true);
  is("nor a guarantee it was not given", asked[0].system.includes("Only draft a guarantee if the creator's own words"), true);
  is("a guarantee nobody gave is dropped", drafted.value.guarantee, "");
  is("a price in the button is taken out", drafted.value.cta, "Get the pack");

  part("A refund promise the creator did give");
  const promised = await writePage(store, {
    title: "Weeknight Recipe Pack",
    price: "$27",
    kind: "download",
    summary: "",
    about: "",
    notes: "I refund anyone within 30 days.",
  });
  is("is kept", promised.ok ? promised.value.guarantee : "failed", DRAFT.guarantee);

  part("Laid out as a page");
  const page = blocksFromDraft({ ...DRAFT, cta: "Get the pack" }, true);
  is("in the order that sells", page.blocks.map((b) => b.kind), ["hero", "benefits", "text", "inside", "cta", "faq", "guarantee", "cta", "reviews"]);
  is("the hero keeps the product's picture", page.blocks[0].kind === "hero" ? page.blocks[0].media : "", "picture");
  is("never an About you block", page.blocks.some((b) => b.kind === "bio"), false);
  is("what parsePage would keep, unchanged", JSON.stringify(parsePage(page)), JSON.stringify(page));
  const bare = blocksFromDraft({ ...DRAFT, story: null, inside: [], faq: [], guarantee: "" }, false);
  is("a thin draft: one button, no picture", [bare.blocks.map((b) => b.kind), bare.blocks[0].kind === "hero" ? bare.blocks[0].media : ""], [["hero", "benefits", "cta", "reviews"], "none"]);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
