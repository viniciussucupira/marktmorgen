/**
 * Drafts in the language a store sells in (lib/ai.ts, honesty). A store set
 * to Spanish gets its product description, sales page, course outline and
 * emails to its list asked for in Spanish, with every honesty rule still
 * said in full; a store in English keeps American English; a pitch to another
 * company stays in English. A refund promise written in any store language
 * is recognised, so the page draft restates it rather than dropping it.
 */
import { claimHandle, ensureStatsId, setLanguage, setSubscription, storeForEmail } from "@/lib/store";
import { REFUND_WORDS, writeEmail, writeOutline, writePage, writeProduct } from "@/lib/ai";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

const systems: string[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  if (new URL(String(input)).hostname !== "api.anthropic.com") return new Response("{}", { status: 404 });
  systems.push((JSON.parse(String(init?.body)) as { system: string }).system);
  return new Response(JSON.stringify({ content: [{ type: "text", text: "{}" }] }));
}) as typeof fetch;

async function main(): Promise<void> {
  redis.clear();
  process.env.ANTHROPIC_API_KEY = `sk-ant-api03-${"x".repeat(40)}`;
  await claimHandle("owner@example.com", "cocina", "Cocina de Ana", "");
  await ensureStatsId("owner@example.com");
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "pro", trialEnds: 0, period: paidPeriod() });

  part("A store that sells in Spanish");
  await setLanguage("owner@example.com", "es");
  let store = (await storeForEmail("owner@example.com"))!;
  await writeProduct(store, { title: "Pan", price: "", kind: "download", notes: "recetas" });
  await writePage(store, { title: "Pan", price: "", kind: "download", summary: "", about: "", notes: "recetas" });
  await writeOutline(store, { title: "Pan", notes: "para principiantes" });
  await writeEmail(store, { goal: "announce", product: "Pan", link: "", notes: "ya está" });
  is("every draft buyers read is asked for in Spanish", systems.map((s) => s.includes("Write in Spanish, as a native speaker writes it")), [true, true, true, true]);
  is("never in American English", systems.some((s) => s.includes("American English")), false);
  is("with every honesty rule said in full", systems.every((s) => s.includes("Never invent a testimonial") && s.includes("Never promise a result")), true);

  part("A store that sells in English");
  await setLanguage("owner@example.com", "en");
  store = (await storeForEmail("owner@example.com"))!;
  systems.length = 0;
  await writeProduct(store, { title: "Bread", price: "", kind: "download", notes: "recipes" });
  is("keeps American English", systems[0].includes("Write in American English"), true);

  part("A refund promise, in any store language");
  const said = ["30-day refund", "money back", "reembolso de 30 días", "garantía total", "Geld-zurück-Garantie", "remboursement sous 14 jours", "garanzia di rimborso", "geld terug", "devolução do dinheiro"];
  is("is recognised in each", said.map((s) => REFUND_WORDS.test(s)), said.map(() => true));
  is("and nothing else is taken for one", ["free shipping", "envío gratis", "lifetime access"].map((s) => REFUND_WORDS.test(s)), [false, false, false]);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
