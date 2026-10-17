/**
 * The line under a store's name, written with AI (lib/ai.ts, writeBio).
 * The model is played by a stand-in for `fetch`. Checked: it is told what
 * the store sells and asked in the store's language with every honesty rule;
 * three different lines come back, each short enough for the box and with no
 * quotation marks around it; it is one of the month's jobs; a store with
 * nothing to write from is refused before the model is asked.
 */
import { claimHandle, ensureStatsId, setLanguage, setSubscription, storeForEmail } from "@/lib/store";
import { writeBio } from "@/lib/ai";
import { MAX_BIO_LENGTH } from "@/lib/store";
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
  reply = JSON.stringify({ lines: ["“Recetas de domingo para familias con prisa.”", "Pan casero paso a paso.", "Pan casero paso a paso.", "x".repeat(400)] });
  const result = await writeBio(store, { products: [{ title: "Sunday Baking", summary: "Six loaves" }], notes: "para familias" });
  is("told what the store sells and what the creator adds", [asked[0].prompt.includes("- Sunday Baking: Six loaves"), asked[0].prompt.includes("para familias")], [true, true]);
  is("in the store's language, with every honesty rule", [asked[0].system.includes("Write in Spanish"), asked[0].system.includes("Never invent a testimonial")], [true, true]);

  part("What comes back");
  const lines = result.ok ? result.value : [];
  is("three different lines, quotation marks taken off", lines.slice(0, 2), ["Recetas de domingo para familias con prisa.", "Pan casero paso a paso."]);
  is("each short enough for the box", lines.every((l) => l.length <= MAX_BIO_LENGTH), true);
  is("one of the month's jobs", result.ok ? result.left : null, 99);

  part("What is refused");
  const before = asked.length;
  const empty = await writeBio(store, { products: [], notes: "  " });
  is("nothing to write from, before the model is asked", [empty.ok ? null : empty.reason, asked.length], ["notes", before]);
  reply = "not json";
  const failed = await writeBio(store, { products: [{ title: "Bread", summary: "" }], notes: "" });
  const after = await writeBio(store, { products: [{ title: "Bread", summary: "" }], notes: "" }).catch(() => null);
  is("an answer that is not lines changes nothing but retains its started attempt", [failed.ok, after && !after.ok ? after.reason : null], [false, "failed"]);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
