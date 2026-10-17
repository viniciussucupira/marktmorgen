/**
 * An empty block written by the writing help (lib/ai.ts, fillBlock;
 * lib/block-rewrite-rules.ts, FILLABLE). The model is played by a stand-in
 * for `fetch`. What is checked:
 *
 *   - only the blocks it may write from nothing are written: never a refund
 *     promise, the creator's story, bonuses or what is inside;
 *   - it is told the store's language, the block's shape and to add no fact;
 *   - what comes back is the block's own kind and id, keeps the creator's
 *     heading and where it shows, and counts as one of the month's jobs;
 *   - a draft with a number the product and page never gave is thrown away
 *     whole, uncounted, and questions without answers are not kept.
 */
import { claimHandle, ensureStatsId, setSubscription, storeForEmail } from "@/lib/store";
import { fillBlock } from "@/lib/ai";
import { FILLABLE } from "@/lib/block-rewrite-rules";
import { emptyBlock, parsePage } from "@/lib/sales-page";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

let reply = "{}";
const asked: { system: string; content: string }[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.hostname !== "api.anthropic.com") return new Response("{}", { status: 404 });
  const body = JSON.parse(String(init?.body)) as { system: string; messages: { content: string }[] };
  asked.push({ system: body.system, content: body.messages[0].content });
  return new Response(JSON.stringify({ content: [{ type: "text", text: reply }] }));
}) as typeof fetch;

async function main(): Promise<void> {
  part("What it may write from nothing");
  is("benefits, who it is for, how it works, questions", FILLABLE, ["benefits", "fit", "steps", "faq"]);

  redis.clear();
  process.env.ANTHROPIC_API_KEY = `sk-ant-api03-${"x".repeat(40)}`;
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await ensureStatsId("owner@example.com");
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "pro", trialEnds: 0, period: paidPeriod() });
  const store = (await storeForEmail("owner@example.com"))!;
  const facts = "Product: Knife Skills\nPrice: $49\nDescription: Ten short video lessons on holding a knife, the claw grip and onions.";

  const before = asked.length;
  for (const kind of ["guarantee", "bio", "bonuses", "inside"] as const) {
    const refused = await fillBlock(store, { block: emptyBlock(kind, `${kind.slice(0, 4)}0001`), facts, language: "English" });
    is(`${kind}: refused, the model never asked`, refused.ok, false);
  }
  is("not one question asked of the model for them", asked.length, before);

  part("A first draft, in the block's own shape");
  const empty = { ...parsePage({ blocks: [{ ...emptyBlock("benefits", "bene0001"), heading: "Why it helps", screens: "phone" }] }).blocks[0] };
  reply = JSON.stringify({ heading: "Lo que recibes", items: ["Diez lecciones en video", "El agarre en garra, paso a paso", "Cebollas sin lágrimas"] });
  const written = await fillBlock(store, { block: empty, facts, language: "Spanish" });
  if (!written.ok) throw new Error(`no draft: ${written.reason}`);
  is("told the language, the shape and to add nothing", [asked.at(-1)!.system.includes("Write in Spanish"), asked.at(-1)!.system.includes('"items": string[]'), asked.at(-1)!.system.includes("Add no number")], [true, true, true]);
  is("its points, its own id and kind", written.value.kind === "benefits" ? [written.value.id, written.value.items.length] : null, ["bene0001", 3]);
  is("the creator's heading and where it shows stay theirs", written.value.kind === "benefits" ? [written.value.heading, written.value.screens] : null, ["Why it helps", "phone"]);
  is("it counts as one of the month's jobs", written.left, 39);

  reply = JSON.stringify({ heading: "Lo que recibes", items: ["Diez lecciones en video"] });
  const fresh = await fillBlock(store, { block: emptyBlock("benefits", "bene0003"), facts, language: "Spanish" });
  is("the heading a new block starts with is the draft's, in the store's language", fresh.ok && fresh.value.kind === "benefits" ? fresh.value.heading : null, "Lo que recibes");

  part("Never a new fact");
  reply = JSON.stringify({ heading: "", items: ["Ten lessons", "Join 2,000 home cooks"] });
  const invented = await fillBlock(store, { block: emptyBlock("benefits", "bene0002"), facts, language: "English" });
  is("a number nobody gave: thrown away, with its attempt still counted", [invented.ok, invented.ok ? "" : invented.reason], [false, "failed"]);

  part("Questions only with answers");
  reply = JSON.stringify({ heading: "Questions", items: [{ q: "How long are the lessons?", a: "" }, { q: "What is it about?", a: "Holding a knife, the claw grip and onions." }] });
  const faq = await fillBlock(store, { block: emptyBlock("faq", "faq00001"), facts, language: "English" });
  is("a question the facts cannot answer is left out", faq.ok && faq.value.kind === "faq" ? faq.value.items.map((i) => i.q) : null, ["What is it about?"]);
  reply = JSON.stringify({ heading: "Questions", items: [{ q: "How long are the lessons?", a: "" }] });
  const none = await fillBlock(store, { block: emptyBlock("faq", "faq00002"), facts, language: "English" });
  is("and none at all is no draft", none.ok, false);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
