import { AI_MONTHLY } from "@/lib/ai-rules";
/**
 * Posts about a product, drafted with AI (lib/ai.ts, writePosts;
 * components/ai-posts.tsx). The model is played by a stand-in for `fetch`.
 * Checked: it is given what the page says and asked in the store's language
 * under every honesty rule, with no link of its own; a link it writes anyway
 * is taken out, since the studio adds the tagged one; each post is kept to
 * its length; it is one of the month's jobs; an answer missing a post
 * changes nothing but its attempt stays counted.
 */
import { readFileSync } from "node:fs";
import { claimHandle, ensureStatsId, setLanguage, setSubscription, storeForEmail } from "@/lib/store";
import { aiLeft, writePosts } from "@/lib/ai";
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
  await claimHandle("owner@example.com", "cocina", "Cocina de Ana", "");
  await ensureStatsId("owner@example.com");
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "creator", trialEnds: 0 });
  await setLanguage("owner@example.com", "es");
  const store = (await storeForEmail("owner@example.com"))!;

  part("What is asked");
  reply = JSON.stringify({ x: `Seis panes en un domingo. https://example.com/x ${"y".repeat(400)}`, instagram: "Hornear sin prisa.\n\nEl enlace está en mi bio.", linkedin: "Aprendí a hornear pan los domingos." });
  const result = await writePosts(store, { facts: "Product: Sunday Baking\nSix loaves, step by step." });
  is("given what the page says", asked[0].prompt.includes("Six loaves, step by step."), true);
  is("in the store's language, under every honesty rule, with no link of its own", [asked[0].system.includes("Write in Spanish"), asked[0].system.includes("Never invent a testimonial"), asked[0].system.includes("no links or addresses at all")], [true, true, true]);

  part("What comes back");
  const posts = result.ok ? result.value : null;
  is("a link the model wrote is taken out", posts?.x.includes("http"), false);
  is("each kept to its length", (posts?.x.length ?? 0) <= 260, true);
  is("the caption says the link is in the bio", posts?.instagram.includes("bio"), true);
  is("one of the month's jobs", result.ok ? result.left : null, AI_MONTHLY.creator - 1);

  part("What changes nothing");
  reply = JSON.stringify({ x: "Only one." });
  const missing = await writePosts(store, { facts: "Product: x" });
  is("an unusable response is refused but its started attempt is counted", [missing.ok, await aiLeft(store)], [false, AI_MONTHLY.creator - 2]);

  part("Where the link comes from");
  const panel = readFileSync("components/ai-posts.tsx", "utf8");
  is("the studio adds the address, tagged for where it goes", [panel.includes('taggedFor(url, "x")'), panel.includes('taggedFor(url, "linkedin")')], [true, true]);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
