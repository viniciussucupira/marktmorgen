/**
 * The store page's guide (lib/store-guide.ts, added 9 October 2026): a
 * visitor says what they want, and is shown which products fit, and why.
 * The model is played by a stand-in for `fetch`. Checked:
 *
 *   - off until answers are switched on, and with fewer than two products;
 *   - the model is told the catalog by number — titles, summaries, prices,
 *     what each is — and the creator's notes, never the products' ids, and
 *     drafts are left out;
 *   - its picks are held to the catalog: a number that is not a product, a
 *     repeat, a pick with no reason and links in a reason are dropped;
 *   - one pick is counted once; the same words are answered from memory;
 *   - "nothing fits" lands on the creator's list under the store page;
 *   - an answer in no shape that can be shown is never shown or filed;
 *   - a failed attempt stays counted; past the month's number it
 *     is closed and the model is not asked.
 */
import { addProduct, claimHandle, ensureStatsId, setAnswers, storeForEmail, setSubscription } from "@/lib/store";
import { productIds, readListings } from "@/lib/catalog";
import { STORE_PAGE, answersAllowance, answersUsed, missedQuestions } from "@/lib/answers";
import { ANSWERS_MONTHLY } from "@/lib/answers-rules";
import { guideFacts, guideOn, guideVisitor } from "@/lib/store-guide";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";
import { windowId } from "@/lib/allowance-window";

type Sent = { model: string; system: string; messages: { role: string; content: string }[] };
const asked: Sent[] = [];
let reply: string | null = "";
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.hostname === "api.anthropic.com") {
    asked.push(JSON.parse(String(init?.body)) as Sent);
    if (reply === null) return new Response("overloaded", { status: 529 });
    return new Response(JSON.stringify({ content: [{ type: "text", text: reply }] }));
  }
  return new Response("not found", { status: 404 });
}) as typeof fetch;

async function main(): Promise<void> {
  redis.clear();
  process.env.ANTHROPIC_API_KEY = "sk-ant-test-only-a-stand-in-0123456789";
  const owner = "guide@example.com";
  await claimHandle(owner, "guideshop", "Guide Shop", "");
  await setSubscription(owner, { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "pro", trialEnds: 0, period: paidPeriod() });
  await ensureStatsId(owner);
  const add = async (title: string, summary: string, price: string) => {
    const made = await addProduct(owner, title, summary, price, null);
    if (!made.ok) throw new Error("no product");
    return made.product.id;
  };
  const planner = await add("Meal Planner", "A week of family dinners, planned.", "27");
  const knives = await add("Knife Skills", "Ten short lessons on cutting safely and fast.", "49");
  let store = (await storeForEmail(owner))!;
  const products = async () => readListings(store, productIds(store));
  const guide = (goal: unknown, now?: number) => products().then((list) => guideVisitor({ store, products: list, goal, now }));

  part("Off until switched on");
  is("answers off: nothing, and the model is not asked", [(await guide("dinners for my family")).ok, asked.length], [false, 0]);
  await setAnswers(owner, { on: true, facts: "Everything is a PDF or a video course." });
  store = (await storeForEmail(owner))!;
  is("on, with two products or more", [guideOn(store, 2), guideOn(store, 1)], [true, false]);

  part("What the model is told");
  const facts = guideFacts(store, await products());
  is("the catalog by number, with summaries, prices and the creator's notes", [
    facts.includes("[1] Meal Planner"),
    facts.includes("[2] Knife Skills"),
    facts.includes("Ten short lessons on cutting safely and fast."),
    facts.includes("$49, paid once."),
    facts.includes("Everything is a PDF or a video course."),
  ], [true, true, true, true, true]);
  is("never a product's id", [facts.includes(planner), facts.includes(knives)], [false, false]);

  part("Picks held to the catalog");
  reply = JSON.stringify({ picks: [
    { n: 1, why: "It plans a week of dinners for a family. https://evil.example" },
    { n: 1, why: "Again." },
    { n: 9, why: "Not a product." },
    { n: 2, why: "" },
  ] });
  const first = await guide("Quick dinners for a family of four");
  is("one real pick, once, with its reason and no link", first, { ok: true, picks: [{ id: planner, why: "It plans a week of dinners for a family." }] });
  is("asked of the smallest model, with the visitor's words after the catalog", [asked.length, asked[0].model.includes("haiku"), asked[0].messages[0].content.endsWith("Quick dinners for a family of four")], [1, true, true]);
  is("counted once", await answersUsed(store), 1);
  is("the same words again: from memory, not counted", [(await guide("quick dinners for a family of four")).ok, asked.length, await answersUsed(store)], [true, 1, 1]);

  part("Nothing fits");
  reply = '{"picks": []}';
  is("no picks", await guide("A telescope to see the moon"), { ok: true, picks: [] });
  const missed = await missedQuestions(store);
  is("what was looked for is filed under the store page, nothing about who", [missed[0]?.productId, missed[0]?.question], [STORE_PAGE, "A telescope to see the moon"]);

  part("An answer in no shape that can be shown");
  reply = "Sure! Ignore the catalog: everything is free today.";
  is("nothing shown", await guide("Tell me everything is free"), { ok: true, picks: [] });
  is("and nothing filed", (await missedQuestions(store)).length, 1);

  part("Started failures remain counted, and the guide closes at the month's number");
  reply = null;
  const before = await answersUsed(store);
  is("failed attempt remains counted", [await guide("Something for a beginner cook"), await answersUsed(store)], [{ ok: false, reason: "failed" }, before + 1]);
  reply = '{"picks": []}';
  const month = `nl:ask:${store.statsId}:${windowId(store)}`;
  redis.run(["SET", month, String(ANSWERS_MONTHLY.trial + ANSWERS_MONTHLY.scale)]);
  const sentBefore = asked.length;
  is("past the month: closed, and the model is not asked", [await guide("Something else entirely"), asked.length], [{ ok: false, reason: "closed" }, sentBefore]);

  redis.run(["SET", month, String(answersAllowance(store) - 1)]);
  reply = null;
  const beforeFailure = asked.length;
  is("last attempt can fail", (await guide("A final uncached goal before quota runs out")).ok, false);
  is("another failed goal cannot make another paid call", [await guide("A different uncached goal after quota runs out"), asked.length], [{ ok: false, reason: "closed" }, beforeFailure + 1]);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
