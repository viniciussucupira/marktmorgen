/**
 * One block rewritten by the writing help (lib/ai.ts, rewriteBlock;
 * lib/block-rewrite-rules.ts). The model is played by a stand-in for `fetch`.
 * What is checked:
 *
 *   - it is told the style, the store's language and to add no fact;
 *   - what comes back keeps the block's id, kind and non-word parts, and a
 *     list never grows;
 *   - a rewrite that brings a number the block and the page never had is
 *     thrown away whole, with its attempt still counted;
 *   - a price is taken off a button, and a block with no words is refused
 *     before the model is asked.
 */
import { claimHandle, ensureStatsId, setSubscription, storeForEmail } from "@/lib/store";
import { rewriteBlock } from "@/lib/ai";
import { addsNumbers, numbersIn } from "@/lib/block-rewrite-rules";
import { type PageBlock, parsePage } from "@/lib/sales-page";
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

const block = (raw: Record<string, unknown>) => parsePage({ blocks: [raw] }).blocks[0]!;

async function main(): Promise<void> {
  part("Numbers, read the way a page writes them");
  is("1,200 and 1200 are one number", [...numbersIn("1,200 students and 1200 more, 4.5 stars.")], ["1200", "45"]);
  const hero = block({ id: "hero0001", kind: "hero", headline: "Cut faster in 10 days", sub: "Ten lessons.", media: "picture", video: null }) as Extract<PageBlock, { kind: "hero" }>;
  is("a number the block had is fine", addsNumbers(hero, { ...hero, headline: "In 10 days, cut faster" }, ""), false);
  is("one the page states is fine too", addsNumbers(hero, { ...hero, sub: "For $49." }, "Price: $49"), false);
  is("a new one is not", addsNumbers(hero, { ...hero, sub: "Join 500 students." }, "Price: $49"), true);

  redis.clear();
  process.env.ANTHROPIC_API_KEY = `sk-ant-api03-${"x".repeat(40)}`;
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await ensureStatsId("owner@example.com");
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "pro", trialEnds: 0 });
  const store = (await storeForEmail("owner@example.com"))!;
  const facts = "Product: Knife Skills\nPrice: $49";

  part("A rewrite, in the block's own shape");
  reply = JSON.stringify({ headline: "Cortar más rápido en 10 días", sub: "Diez lecciones cortas.", media: "video" });
  const done1 = await rewriteBlock(store, { block: hero, style: "clearer", facts, language: "Spanish" });
  if (!done1.ok) throw new Error(`no rewrite: ${done1.reason}`);
  is("told the way, the language, and to add nothing", [asked[0].system.includes("Make it clearer"), asked[0].system.includes("Write in Spanish"), asked[0].system.includes("add none")], [true, true, true]);
  is("the words change, the picture beside them does not", done1.value.kind === "hero" ? [done1.value.id, done1.value.headline, done1.value.media] : null, ["hero0001", "Cortar más rápido en 10 días", "picture"]);
  is("it counts as one of the month's jobs", done1.left, 39);

  part("Never a new fact");
  reply = JSON.stringify({ headline: "Cut faster in 10 days", sub: "Loved by 2,000 home cooks." });
  const invented = await rewriteBlock(store, { block: hero, style: "warmer", facts, language: "English" });
  is("a number nobody wrote: thrown away, with its attempt still counted", [invented.ok, invented.ok ? "" : invented.reason], [false, "failed"]);

  part("Lists never grow");
  const benefits = block({ id: "bene0001", kind: "benefits", heading: "What you get", items: ["Ten lessons", "A grip guide"] });
  reply = JSON.stringify({ heading: "Lo que recibes", items: ["Diez lecciones", "Una guía de agarre", "Un regalo extra"] });
  const listed = await rewriteBlock(store, { block: benefits, style: "shorter", facts, language: "Spanish" });
  is("two points stay two", listed.ok && listed.value.kind === "benefits" ? listed.value.items : null, ["Diez lecciones", "Una guía de agarre"]);

  part("Buttons, and blocks with nothing to rewrite");
  const cta = block({ id: "cta00001", kind: "cta", label: "Get it", note: "" });
  reply = JSON.stringify({ label: "Get it now for $49", note: "" });
  const button = await rewriteBlock(store, { block: cta, style: "specific", facts, language: "English" });
  is("a price is taken off a button", button.ok && button.value.kind === "cta" ? button.value.label : null, "Get it now");
  const before = asked.length;
  const blank = await rewriteBlock(store, { block: block({ id: "text0001", kind: "text", heading: "", body: "" }), style: "clearer", facts, language: "English" });
  const video = await rewriteBlock(store, { block: block({ id: "vide0001", kind: "video", heading: "Watch", video: null, caption: "" }), style: "clearer", facts, language: "English" });
  is("an empty block, or one that is not words, is refused before the model is asked", [blank.ok, video.ok, asked.length], [false, false, before]);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
