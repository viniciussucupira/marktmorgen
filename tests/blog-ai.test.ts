/**
 * A blog post drafted with AI (lib/ai.ts, writeBlogPost). Checked: asked in
 * the store's language under every honesty rule, with what the store sells
 * and the creator's topic; plain text comes back, any bold taken off; it is
 * one of the month's jobs; nothing to write about is refused before asking.
 */
import { claimHandle, ensureStatsId, setSubscription, storeForEmail } from "@/lib/store";
import { writeBlogPost } from "@/lib/ai";
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
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "pro", trialEnds: 0 });
  const store = (await storeForEmail("owner@example.com"))!;

  part("Asked");
  reply = JSON.stringify({ title: "How to keep a knife sharp", body: "## Why\nA **sharp** knife is safer.\n\n- Hone often" });
  const result = await writeBlogPost(store, { notes: "keeping knives sharp", products: [{ title: "Knife Skills", summary: "Ten lessons" }] });
  is("with the topic and what the store sells", [asked[0].prompt.includes("keeping knives sharp"), asked[0].prompt.includes("- Knife Skills: Ten lessons")], [true, true]);
  is("under every honesty rule, as plain text the blog draws", [asked[0].system.includes("Never invent a testimonial"), asked[0].system.includes('A line starting with "## " is a heading')], [true, true]);

  part("Back");
  is("a title and the words, bold taken off", result.ok ? [result.value.title, result.value.body.includes("**")] : null, ["How to keep a knife sharp", false]);
  is("one of the month's jobs", result.ok ? result.left : null, 39);
  const before = asked.length;
  const empty = await writeBlogPost(store, { notes: "  ", products: [] });
  is("nothing to write about is refused before asking", [empty.ok ? null : empty.reason, asked.length], ["notes", before]);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
