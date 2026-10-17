/**
 * The writing help: what is asked of the model, what is read back, and what
 * a store pays for it out of its month.
 *
 * Measured before it was built (30 September 2026): Circle, Mighty Networks,
 * Kajabi, Teachable, Thinkific and Beacons all write for a creator; Stan's
 * Stanley answers questions about Stan. The model is played by a stand-in for
 * `fetch`. What is checked:
 *
 *   - no key, no writing help, and nothing counted;
 *   - every request carries the rules against invented reviews, numbers,
 *     results and urgency;
 *   - only what fits the studio's boxes comes back, cut to their limits;
 *   - a started attempt stays counted if it fails, and a month's allowance is a ceiling;
 *   - an outline goes into a course whole, or not at all when it would not fit.
 */
import { claimHandle, ensureStatsId, setSubscription, storeForEmail } from "@/lib/store";
import { aiAllowance, aiLeft, isAiConfigured, jsonIn, writeEmail, writeOutline, writeProduct } from "@/lib/ai";
import { AI_MONTHLY } from "@/lib/ai-rules";
import { type Course, editCourse } from "@/lib/course";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";
import { windowId } from "@/lib/allowance-window";

let reply: { status: number; text: string } = { status: 200, text: "{}" };
const asked: { system: string; content: string; model: string }[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.hostname !== "api.anthropic.com") return new Response("{}", { status: 404 });
  const body = JSON.parse(String(init?.body)) as { system: string; model: string; messages: { content: string }[] };
  asked.push({ system: body.system, content: body.messages[0].content, model: body.model });
  return new Response(JSON.stringify({ content: [{ type: "text", text: reply.text }] }), { status: reply.status });
}) as typeof fetch;

async function main(): Promise<void> {
  redis.clear();
  const made = await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  if (!made.ok) throw new Error("no store");
  await ensureStatsId("owner@example.com");
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "pro", trialEnds: 0, period: paidPeriod() });
  const store = (await storeForEmail("owner@example.com"))!;

  part("No key, no writing help");
  delete process.env.ANTHROPIC_API_KEY;
  is("off", isAiConfigured(), false);
  const off = await writeProduct(store, { title: "Pantry Guide", price: "$27", kind: "download", notes: "40 recipes" });
  is("says so", off.ok ? "ran" : off.reason, "off");
  is("and asks nothing", asked.length, 0);

  process.env.ANTHROPIC_API_KEY = `sk-ant-api03-${"x".repeat(40)}`;
  part("A product's description");
  reply = {
    status: 200,
    text: `Here you go:\n{"summary": "Forty weeknight recipes, each on one page, as a PDF.", "about": "Dinner in 30 minutes.\\n\\n- Shopping lists\\n- Swaps for picky eaters${"!".repeat(6000)}"}`,
  };
  const copy = await writeProduct(store, { title: "Pantry Guide", price: "$27", kind: "download", notes: "40 recipes for busy parents" });
  if (!copy.ok) throw new Error(`no copy: ${copy.reason}`);
  is("the summary comes back", copy.value.summary, "Forty weeknight recipes, each on one page, as a PDF.");
  is("the description is cut to the box's limit", copy.value.about.length, 5000);
  is("the lists and paragraphs are kept", copy.value.about.startsWith("Dinner in 30 minutes.\n\n- Shopping lists"), true);
  const rules = asked[0].system;
  is("the rules forbid invented testimonials and numbers", rules.includes("Never invent a testimonial") && rules.includes("number of students"), true);
  is("and promised results", rules.includes("Never promise a result"), true);
  is("in American English", rules.includes("American English"), true);
  is("it is told how the product is delivered, so it never guesses", asked[0].content.includes("downloads the file from the thank-you page"), true);
  is("one job counted", await aiLeft(store), AI_MONTHLY.pro - 1);

  part("Nothing to write from");
  const empty = await writeProduct(store, { title: "Pantry Guide", price: "", kind: "download", notes: "   " });
  is("is refused before asking", empty.ok ? "ran" : empty.reason, "notes");
  is("and not counted", await aiLeft(store), AI_MONTHLY.pro - 1);

  part("A job that fails");
  reply = { status: 529, text: "overloaded" };
  const failed = await writeProduct(store, { title: "Pantry Guide", price: "", kind: "download", notes: "40 recipes" });
  is("says so", failed.ok ? "ran" : failed.reason, "failed");
  is("and the started attempt stays counted", await aiLeft(store), AI_MONTHLY.pro - 2);
  reply = { status: 200, text: "I cannot help with that." };
  const nonsense = await writeProduct(store, { title: "Pantry Guide", price: "", kind: "download", notes: "40 recipes" });
  is("an answer that is not the shape asked for is a failure too", nonsense.ok ? "ran" : nonsense.reason, "failed");
  is("and an unusable answer also consumes its request", await aiLeft(store), AI_MONTHLY.pro - 3);

  part("An outline");
  const lots = Array.from({ length: 12 }, (_, i) => ({ title: `Module ${i + 1}`, lessons: Array.from({ length: 11 }, (_, n) => `Lesson ${n + 1}`) }));
  reply = { status: 200, text: JSON.stringify({ modules: [...lots, { title: "", lessons: ["x"] }] }) };
  const outline = await writeOutline(store, { title: "Sourdough", notes: "for beginners" });
  if (!outline.ok) throw new Error("no outline");
  is("at most 8 modules", outline.value.modules.length, 8);
  is("of at most 8 lessons", Math.max(...outline.value.modules.map((m) => m.lessons.length)), 8);

  const course: Course = { id: "c".repeat(32), modules: [], certificate: false } as unknown as Course;
  const added = editCourse(course, { op: "outline", modules: outline.value.modules });
  is("goes into the course whole", added.ok && [added.course.modules.length, added.course.modules[0].lessons.length], [8, 8]);
  const full = editCourse({ ...course, modules: Array.from({ length: 25 }, (_, i) => ({ id: `m${i}`.padEnd(12, "0"), title: `M${i}`, dripDays: 0, lessons: [] })) } as Course, { op: "outline", modules: outline.value.modules });
  is("or not at all when it would not fit", full.ok ? "added" : full.reason, "too_many");

  part("An email");
  reply = { status: 200, text: JSON.stringify({ subject: "The recipe pack is out", body: "Hi,\n\nIt's here.\n\nhttps://example.com/p/1\n\nAna" }) };
  const email = await writeEmail(store, { goal: "announce", product: "Pantry Guide", link: "https://example.com/p/1", notes: "it's out, $27" });
  is("subject and body come back", email.ok && email.value.subject, "The recipe pack is out");
  is("it is told not to add its own unsubscribe line", asked[asked.length - 1].system.includes("Do not add an unsubscribe line"), true);

  part("The month is a ceiling");
  const key = `nl:ai:${store.statsId}:${windowId(store)}`;
  await redis.pipeline([["SET", key, String(AI_MONTHLY.pro)]]);
  const over = await writeEmail(store, { goal: "announce", product: "", link: "", notes: "hello" });
  is("past it, nothing is asked", over.ok ? "ran" : over.reason, "used");
  is("and the count stays at the ceiling", await aiLeft(store), 0);
  is("Pro has more", aiAllowance({ ...store, tier: "pro" }), AI_MONTHLY.pro);
  is("the free trial has fewer", aiAllowance({ ...store, trialEnds: Math.floor(Date.now() / 1000) + 86_400 }), AI_MONTHLY.trial);

  part("Reading an answer");
  is("the JSON inside whatever surrounds it", jsonIn('Sure! {"a": 1} Hope it helps.'), { a: 1 });
  is("nothing when there is none", jsonIn("no json here"), null);

  done();
}

void main();
