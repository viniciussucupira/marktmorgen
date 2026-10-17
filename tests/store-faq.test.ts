/**
 * The store's own questions and answers (lib/store-faq.ts, lib/ai.ts
 * writeStoreFaq; added 9 October 2026). Checked: a kept list is made safe;
 * search engines get an FAQPage; the AI draft is told only the store's facts,
 * is counted once, and comes back held to the rules (no links, both halves).
 */
import { claimHandle, ensureStatsId, setFaq, setSubscription, storeForEmail } from "@/lib/store";
import { MAX_FAQ, faqData, parseFaq } from "@/lib/store-faq";
import { aiLeft, writeStoreFaq } from "@/lib/ai";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

type Sent = { system: string; messages: { content: string }[] };
const asked: Sent[] = [];
let reply = "";
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.hostname === "api.anthropic.com") {
    asked.push(JSON.parse(String(init?.body)) as Sent);
    return new Response(JSON.stringify({ content: [{ type: "text", text: reply }] }));
  }
  return new Response("{}", { status: 404 });
}) as typeof fetch;

async function main(): Promise<void> {
  redis.clear();
  process.env.ANTHROPIC_API_KEY = "sk-ant-test-only-a-stand-in-0123456789";

  part("A kept list, made safe");
  is("both halves, tidied, at most twelve", [
    parseFaq([{ q: "  How do I get it? ", a: "By email.\r\n\r\n\r\nRight away." }, { q: "No answer", a: "" }, "x"]),
    parseFaq(Array.from({ length: 20 }, (_, i) => ({ q: `Q${i}`, a: "A" }))).length,
  ], [[{ q: "How do I get it?", a: "By email.\n\nRight away." }], MAX_FAQ]);
  is("for search engines, an FAQ page", (faqData([{ q: "Q", a: "A" }]) as { "@type": string; mainEntity: unknown[] })["@type"], "FAQPage");
  is("and nothing when there are none", faqData([]), null);

  part("Kept on the store");
  const owner = "faq@example.com";
  await claimHandle(owner, "faqshop", "Faq Shop", "");
  await ensureStatsId(owner);
  await setSubscription(owner, { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "pro", trialEnds: 0 });
  await setFaq(owner, [{ q: "How do I pay?", a: "With a card, on Stripe's page." }]);
  let store = (await storeForEmail(owner))!;
  is("saved", store.faq, [{ q: "How do I pay?", a: "With a card, on Stripe's page." }]);

  part("Drafted with AI, from the store's facts only");
  is("nothing to go on: not asked", [(await writeStoreFaq(store, { facts: "", notes: "" })).ok, asked.length], [false, 0]);
  reply = JSON.stringify({ items: [{ q: "How do files arrive?", a: "By email, right after paying. See https://evil.example" }, { q: "Empty", a: "" }] });
  const before = await aiLeft(store);
  const drafted = await writeStoreFaq(store, { facts: "Store: Faq Shop\nWhat it sells:\n- Bread Book: $19. A download.", notes: "" });
  store = (await storeForEmail(owner))!;
  is("held to the rules, and counted once", [drafted, before - (await aiLeft(store))], [{ ok: true, value: [{ q: "How do files arrive?", a: "By email, right after paying. See" }], left: 39 }, 1]);
  is("told only the facts, under the rules on refunds and guarantees", [asked[0].messages[0].content.includes("Bread Book"), /Never state a refund/.test(asked[0].system)], [true, true]);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
