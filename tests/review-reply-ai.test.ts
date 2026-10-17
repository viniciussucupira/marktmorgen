/**
 * A reply to a buyer's review, drafted with AI (lib/ai.ts, replyToReview;
 * components/review-studio.tsx). The model is played by a stand-in for
 * `fetch`. Checked: it is told the product, the stars and the buyer's own
 * words; told to write in the review's language, answer only what was said,
 * and for a low rating own it without promising anything; every honesty rule
 * is said; the draft is cut to what a reply may hold and counted as a job;
 * the route reads the review as it is kept, never as the browser sends it,
 * and only for a role that answers reviews.
 */
import { readFileSync } from "node:fs";
import { claimHandle, ensureStatsId, setSubscription, storeForEmail } from "@/lib/store";
import { replyToReview } from "@/lib/ai";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

let reply = "";
const asked: { system: string; prompt: string }[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  if (new URL(String(input)).hostname !== "api.anthropic.com") return new Response("{}", { status: 404 });
  const body = JSON.parse(String(init?.body)) as { system: string; messages: { content: string }[] };
  asked.push({ system: body.system, prompt: body.messages[0].content });
  return new Response(JSON.stringify({ content: [{ type: "text", text: reply }] }));
}) as typeof fetch;

async function main(): Promise<void> {
  redis.clear();
  process.env.ANTHROPIC_API_KEY = `sk-ant-api03-${"x".repeat(40)}`;
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await ensureStatsId("owner@example.com");
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "creator", trialEnds: 0 });
  const store = (await storeForEmail("owner@example.com"))!;

  part("What is asked");
  reply = JSON.stringify({ reply: `Thank you, Ana. ${"x".repeat(2_000)}` });
  const result = await replyToReview(store, { productTitle: "Sunday Baking", rating: 2, text: "Las recetas no traen tiempos.", name: "Ana", maxLength: 1_000 });
  is("told the product, the stars and their own words", [asked[0].prompt.includes("Product: Sunday Baking"), asked[0].prompt.includes("Rating: 2 out of 5"), asked[0].prompt.includes("Las recetas no traen tiempos.")], [true, true, true]);
  is("in the review's language, answering only what was said", [asked[0].system.includes("Write in the language the review is written in"), asked[0].system.includes("nothing they did not say")], [true, true]);
  is("a low rating owned, with nothing promised", [asked[0].system.includes("without arguing"), asked[0].system.includes("Never promise a refund, a discount, a fix")], [true, true]);
  is("with every honesty rule", [asked[0].system.includes("Never invent a testimonial"), asked[0].system.includes("never ask for a better rating".replace("never", "Never"))], [true, true]);

  part("What comes back");
  is("cut to what a reply may hold", result.ok ? result.value.length : null, 1_000);
  is("one of the month's jobs", result.ok ? result.left : null, 99);
  reply = "no";
  const failed = await replyToReview(store, { productTitle: "x", rating: 5, text: "", name: "", maxLength: 1_000 });
  is("stars only is asked as stars only, and an empty answer retains its started attempt", [asked.at(-1)?.prompt.includes("They left stars only, no words."), failed.ok], [true, false]);

  part("Where it is asked");
  const route = readFileSync("app/api/store/ai/route.ts", "utf8");
  is("the review read as it is kept", route.includes("await readReview(store.statsId, productId, text(body.id, 80))"), true);
  is("by a role that answers reviews", route.includes('body.kind === "reply" ? "reviews"'), true);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
