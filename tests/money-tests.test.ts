/**
 * Page tests measured in money (lib/headline-test-rules.ts, lib/headline-test.ts,
 * lib/ai.ts writeTestHeadline; added 12 October 2026). Checked:
 *
 *   - on a product sold for money, a version wins by the money it brings per
 *     visitor, once each has its views and paid sales and the chance is
 *     97.5%: more checkouts with less money does not win;
 *   - a free product is still decided by sign-ups;
 *   - the chance is said in plain numbers, and how long is left is worked
 *     from the traffic the test has had;
 *   - a paid checkout counts once for the version it was opened from, in the
 *     store's currency;
 *   - a second headline written with AI is refused if it brings a number
 *     the page does not state.
 */
import { MIN_SALES, MIN_VIEWS, chanceBBetter, daysLeft, perVisitor, winner, type Counts } from "@/lib/headline-test-rules";
import { abMeta, noteTestSales, readCounts } from "@/lib/headline-test";
import { writeTestHeadline } from "@/lib/ai";
import { claimHandle, ensureStatsId, setSubscription, storeForEmail } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

let reply = "";
globalThis.fetch = (async (input: string | URL | Request) => {
  if (new URL(String(input)).hostname === "api.anthropic.com") return new Response(JSON.stringify({ content: [{ type: "text", text: reply }] }));
  return new Response("{}", { status: 404 });
}) as typeof fetch;

/** A version's money from its sales, each `cents`, and the sum of their squares. */
const sold = (views: number, checkouts: number, sales: number, cents: number) => ({ v: views, c: checkouts, s: sales, r: sales * cents, q: sales * cents * cents });
const counts = (a: ReturnType<typeof sold>, b: ReturnType<typeof sold>, t0 = 0): Counts => ({ va: a.v, vb: b.v, ca: a.c, cb: b.c, sa: a.s, sb: b.s, ra: a.r, rb: b.r, qa: a.q, qb: b.q, t0 });

async function main(): Promise<void> {
  process.env.ANTHROPIC_API_KEY = "sk-ant-test-only-a-stand-in-0123456789";
  redis.clear();

  part("Decided by money");
  const moreCheckoutsLessMoney = counts(sold(1000, 40, 30, 4900), sold(1000, 90, 12, 4900));
  is("more checkouts and less money does not win: the first does", [winner(moreCheckoutsLessMoney, "checkouts"), winner(moreCheckoutsLessMoney, "money")], ["b", "a"]);
  is("money per visitor", perVisitor(moreCheckoutsLessMoney.ra ?? 0, 1000), 147);
  is("not before each has its paid sales", winner(counts(sold(1000, 10, MIN_SALES - 1, 4900), sold(1000, 10, 40, 4900)), "money"), null);
  is("not before each has its views", winner(counts(sold(MIN_VIEWS - 1, 10, 30, 4900), sold(1000, 10, 60, 4900)), "money"), null);
  const close = counts(sold(800, 30, 20, 4900), sold(800, 30, 22, 4900));
  is("a close race stays running, with its chance said", [winner(close, "money"), Math.round((chanceBBetter(close) ?? 0) * 100) > 50 && Math.round((chanceBBetter(close) ?? 0) * 100) < 90], [null, true]);
  is("nothing sold: no chance to say", chanceBBetter(counts(sold(500, 5, 0, 0), sold(500, 5, 0, 0))), null);

  part("How long it has left");
  const day = 86_400_000;
  const now = Date.UTC(2026, 9, 12);
  // 100 views a version a day, 2% buy: 10 sales take 500 views each.
  is("from the traffic so far: 500 views each, 200 had, 100 a day", daysLeft(counts(sold(200, 8, 4, 4900), sold(200, 8, 4, 4900), now - 2 * day), "money", now), 3);
  is("sign-ups need only the views", daysLeft(counts(sold(100, 8, 0, 0), sold(100, 8, 0, 0), now - day), "checkouts", now), 1);
  is("not before a day has passed or anything sold", [daysLeft(counts(sold(10, 1, 0, 0), sold(10, 1, 0, 0), now - day), "money", now), daysLeft(counts(sold(10, 1, 1, 100), sold(10, 1, 0, 0)), "money", now)], [null, null]);

  part("A paid checkout counts for its version, once");
  const paid = [
    { id: "cs_test_aaaaaaaaaaaaaaaaaaaa1", amount_total: 4900, currency: "usd", metadata: { product: "pbread0001", ab: abMeta("t3st1d", "b") } },
    { id: "cs_test_aaaaaaaaaaaaaaaaaaaa2", amount_total: 9900, currency: "eur", metadata: { product: "pbread0001", ab: abMeta("t3st1d", "a") } },
    { id: "cs_test_aaaaaaaaaaaaaaaaaaaa3", amount_total: 4900, currency: "usd", metadata: { product: "pbread0001" } as Record<string, string> },
  ];
  is("only the one from a test, in the store's currency", await noteTestSales("s".repeat(32), "usd", paid), 1);
  is("again: nothing more", await noteTestSales("s".repeat(32), "usd", paid), 0);
  const read = await readCounts("s".repeat(32), "pbread0001", "t3st1d");
  is("one sale, its money and its square, for the version it was opened from", [read.sa, read.sb, read.ra, read.rb, read.qb], [0, 1, 0, 4900, 4900 * 4900]);

  part("A second headline written with AI");
  const owner = "owner@example.com";
  await claimHandle(owner, "abshop", "AB Shop", "");
  await ensureStatsId(owner);
  await setSubscription(owner, { customerId: "cus_Ab00001", subscriptionId: "sub_Ab00001", active: true });
  const store = (await storeForEmail(owner))!;
  const facts = "Bread School: a course of 12 lessons on sourdough at home.";
  reply = JSON.stringify({ headline: "Bake the loaf you buy, at home", sub: "Twelve short lessons, one bake at a time." });
  const written = await writeTestHeadline(store, { headline: "Learn sourdough in 12 lessons", sub: "", facts, language: "English" });
  is("another way to say it", written.ok ? written.value.headline : written, "Bake the loaf you buy, at home");
  reply = JSON.stringify({ headline: "Join 5,000 bakers who learned sourdough", sub: "" });
  const invented = await writeTestHeadline(store, { headline: "Learn sourdough in 12 lessons", sub: "", facts, language: "English" });
  is("a number the page does not state is refused, with its attempt still counted", invented.ok ? invented.value : invented.reason, "failed");

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
