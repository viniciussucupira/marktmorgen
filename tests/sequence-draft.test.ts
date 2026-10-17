/**
 * A sequence's emails drafted with AI (lib/sequence-draft.ts and lib/ai.ts,
 * writeSequence, added 11 October 2026). What is checked:
 *
 *   - what the model sends is read safely: an email without a subject or a
 *     body is left out, never more than asked for, and every web address that
 *     is not one of the store's own is taken out of the body;
 *   - the waits keep a sensible pace: the first within a day, each later one
 *     1 to 14 days after the one before;
 *   - the writer is handed the moment, the store's products with their prices
 *     and links, and the creator's words, in the store's language, and is
 *     counted as one job; a reply with nothing usable retains its started attempt.
 */
import { keepOwnLinks, readDraftedSteps } from "@/lib/sequence-draft";
import { writeSequence } from "@/lib/ai";
import { claimHandle, ensureStatsId, setLanguage, storeForEmail, setSubscription } from "@/lib/store";
import { aiLeft } from "@/lib/ai";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

const asked: { system: string; prompt: string }[] = [];
let reply = "";
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.hostname === "api.anthropic.com") {
    const body = JSON.parse(String(init?.body)) as { system: string; messages: { content: string }[] };
    asked.push({ system: body.system, prompt: body.messages[0].content });
    return new Response(JSON.stringify({ content: [{ type: "text", text: reply }] }));
  }
  return new Response(JSON.stringify({ error: { message: "no stand-in" } }), { status: 404 });
}) as typeof fetch;

const STORE = "https://marktmorgen.com/@harbor";
const PLANNER = "https://marktmorgen.com/@harbor/p/planner01";
const links = [STORE, `${STORE}/orders`, PLANNER];

async function main(): Promise<void> {
  redis.clear();
  process.env.ANTHROPIC_API_KEY = "sk-ant-test-sequence-draft-only-a-stand-in";

  part("Only the store's own links");
  is("its own are kept, and a line pointing anywhere else is taken out", keepOwnLinks(`Here it is:\n${PLANNER}\n\nAnd a free guide: https://elsewhere.example/free.\n\nMore at ${STORE}/`, links), `Here it is:\n${PLANNER}\n\nMore at ${STORE}/`);
  is("a look-alike of the store's address is not the store's", keepOwnLinks(`Kept\n${STORE}evil\n${PLANNER}?x=1`, links), "Kept");

  part("Read safely, at a sensible pace");
  const steps = readDraftedSteps(
    [
      { waitDays: 3, subject: "Welcome", body: `Hello.\n\n${STORE}` },
      { waitDays: 0, subject: "A tip", body: "Plan on Sunday." },
      { waitDays: 40, subject: "The planner", body: `It is here:\n${PLANNER}` },
      { waitDays: 2, subject: "", body: "No subject" },
      { waitDays: 2, subject: "Past the count", body: "x" },
    ],
    3,
    links,
  );
  is("the emails with a subject and a body, up to the count", steps.map((s) => s.subject), ["Welcome", "A tip", "The planner"]);
  is("the first within a day, the others 1 to 14 days after the one before", steps.map((s) => s.delayHours), [24, 24, 14 * 24]);
  is("nothing that is not a list is read as emails", [readDraftedSteps(null, 3, links), readDraftedSteps({ subject: "x" }, 3, links)], [[], []]);

  part("Asked of the writer");
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "pro", trialEnds: 0, period: paidPeriod() });
  await ensureStatsId("owner@example.com");
  await setLanguage("owner@example.com", "de");
  const store = (await storeForEmail("owner@example.com"))!;
  const before = await aiLeft(store);
  const input = {
    trigger: "joined" as const,
    product: null,
    products: [{ title: "Weekly Meal Planner", summary: "A week of family dinners on one page.", price: "$27, paid once.", link: PLANNER }],
    storeLink: STORE,
    ordersLink: `${STORE}/orders`,
    notes: "Warm, short, one tip per email.",
    count: 3,
  };
  reply = JSON.stringify({ emails: [{ waitDays: 0, subject: "Willkommen", body: `Hallo!\n\n${STORE}` }, { waitDays: 2, subject: "Ein Tipp", body: "Plane am Sonntag.\n\nMehr: https://elsewhere.example" }, { waitDays: 3, subject: "Der Planer", body: `Hier:\n${PLANNER}` }] });
  const drafted = await writeSequence(store, input);
  is("the emails come back, with only the store's links", drafted.ok ? drafted.value.map((s) => [s.subject, s.delayHours, s.body.includes("elsewhere")]) : drafted.reason, [["Willkommen", 0, false], ["Ein Tipp", 48, false], ["Der Planer", 72, false]]);
  is("the moment, the product with its price and link, and the creator's words are handed over", [asked[0].system.includes("a welcome sequence"), asked[0].prompt.includes(`Weekly Meal Planner ($27, paid once.)`), asked[0].prompt.includes(PLANNER), asked[0].prompt.includes("Warm, short, one tip per email.")], [true, true, true, true]);
  is("in the store's language, that many emails, only the given addresses", [asked[0].system.includes("Write in German"), asked[0].system.includes("exactly 3 emails"), asked[0].system.includes("Never write any other address")], [true, true, true]);
  is("counted as one job", before - (await aiLeft(store)), 1);
  reply = "Sorry, I cannot.";
  const failed = await writeSequence(store, input);
  is("a reply with nothing usable fails, and its attempt stays counted", [failed.ok ? "written" : failed.reason, before - (await aiLeft(store))], ["failed", 2]);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
