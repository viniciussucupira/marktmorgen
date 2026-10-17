/**
 * A store drafted with AI from a few sentences (lib/ai.ts writeStoreSetup,
 * lib/store-setup.ts; added 10 October 2026). Checked: the model is told to
 * work only from the creator's words and never to invent; what comes back is
 * held to its shapes; and what the creator keeps lands as drafts that are not
 * on sale, the line under the name, and the questions only where there were
 * none.
 */
import { claimHandle, ensureStatsId, setFaq, setSubscription, storeForEmail } from "@/lib/store";
import { writeStoreSetup } from "@/lib/ai";
import { keepStoreSetup } from "@/lib/store-setup";
import { KIND } from "@/lib/catalog";
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
  const owner = "setup@example.com";
  await claimHandle(owner, "setupshop", "Setup Shop", "");
  await ensureStatsId(owner);
  await setSubscription(owner, { customerId: "cus_Setup0001", subscriptionId: "sub_Setup0001", active: true, tier: "pro" });

  part("The draft");
  reply = JSON.stringify({
    bios: ["Weeknight dinners for busy parents.", "Weeknight dinners for busy parents.", "Cook once, eat all week."],
    products: [
      { title: "Sunday Meal Planner", summary: "A week of dinners planned in one page.", kind: "download", price: "$12" },
      { title: "Batch Cooking Course", summary: "Ten short lessons.", kind: "course", price: "49" },
      { title: "Monthly Menu Club", summary: "A new menu every month.", kind: "membership", price: "7" },
      { title: "A fourth", summary: "", kind: "download", price: "5" },
    ],
    faq: [{ q: "How do I get the planner?", a: "As a download after paying, see https://example.com." }, { q: "No answer", a: "" }],
  });
  const drafted = await writeStoreSetup((await storeForEmail(owner))!, { about: "I teach busy parents to batch cook on Sundays.", selling: "A planner, a course, a club." });
  if (!drafted.ok) throw new Error("no draft");
  is("lines once each", drafted.value.bios, ["Weeknight dinners for busy parents.", "Cook once, eat all week."]);
  is("three products at most, prices as plain numbers", drafted.value.products.map((p) => [p.title, p.kind, p.price]), [["Sunday Meal Planner", "download", "12"], ["Batch Cooking Course", "course", "49"], ["Monthly Menu Club", "membership", "7"]]);
  is("answers whole, with no links", drafted.value.faq, [{ q: "How do I get the planner?", a: "As a download after paying, see" }]);
  is("told to work from the creator's words only, and to invent nothing", [
    asked[0].messages[0].content.includes("batch cook on Sundays"),
    /Work ONLY from what the creator says/.test(asked[0].system),
    /Never invent a credential/.test(asked[0].system),
  ], [true, true, true]);
  is("nothing to work from, nothing asked", (await writeStoreSetup((await storeForEmail(owner))!, { about: " ", selling: "" })).ok, false);

  part("What the creator keeps");
  const kept = await keepStoreSetup(owner, (await storeForEmail(owner))!, {
    bio: "Cook once, eat all week.",
    products: [
      { title: "Sunday Meal Planner", summary: "A week of dinners planned in one page.", kind: "download", price: "12" },
      { title: "Monthly Menu Club", summary: "A new menu every month.", kind: "membership", price: "7" },
      { title: "Free?", summary: "", kind: "download", price: "abc" },
    ],
    faq: [{ q: "How do I get the planner?", a: "As a download after paying." }],
  });
  const store = (await storeForEmail(owner))!;
  is("the line, two drafts, the questions, and the one with no price refused by name", kept, { bio: true, products: 2, faq: true, refused: ["Free?"] });
  is("the line is under the name", store.bio, "Cook once, eat all week.");
  is("every product a draft, not on sale", store.catalog.items.map((item) => (item.kind & KIND.hidden) !== 0), [true, true]);
  is("the club is monthly", (store.catalog.items[1].kind & KIND.recurring) !== 0, true);
  await setFaq(owner, [{ q: "Mine", a: "My answer." }]);
  await keepStoreSetup(owner, (await storeForEmail(owner))!, { faq: [{ q: "Theirs", a: "Not kept." }] });
  is("questions already written are never replaced", (await storeForEmail(owner))!.faq, [{ q: "Mine", a: "My answer." }]);
  done();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
