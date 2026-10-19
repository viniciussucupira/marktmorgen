/**
 * A/B test of a sales page's headline: the creator writes a second headline
 * and line under it, half the visitors see each, and the page itself starts
 * showing the one that brings more people to the checkout once the
 * difference is real.
 *
 * Measured before it was built (7 October 2026): Kajabi, Stan, Hotmart,
 * Gumroad and Whop offer no A/B test of a product page; creators who want one
 * pay for a separate page builder (Replo, Unbounce) and send buyers across to
 * the checkout. Here it is on the page they already have.
 *
 * What keeps it honest and cheap:
 *
 *   - Only the words of the hero change. Never the price, the options or
 *     anything about what is sold: two visitors may read different headlines,
 *     never be charged different amounts.
 *   - A visitor is put in a group by one random number kept in a cookie for
 *     the store's pages (proxy.ts, nl_ab), and keeps seeing the same version.
 *     Where the law asks for consent before such a cookie (the places the ad
 *     pixels ask first, lib/pixels.ts), none is set: those visitors see the
 *     first version and are not counted.
 *   - A view is counted when the page is drawn for a visitor with a group,
 *     and a checkout when one is opened from it. One small hash per test.
 *   - The winner is decided by arithmetic, not by a hunch: both versions seen
 *     at least MIN_VIEWS times, enough checkouts for the test to hold
 *     (MIN_EXPECTED_SIGNUPS), and the difference in checkouts per view
 *     significant at 95% (a two-proportion z-test). Until then both run; after
 *     it, everybody sees the winner until the creator keeps it or ends the
 *     test. Nothing is written to decide it: it is worked out on each read.
 *
 * Paid sales (added 12 October 2026): a checkout opened from a page running a
 * test carries the test and the version in its metadata (ab: "<test>:<a|b>"),
 * and the five-minute job that reads each store's settled checkouts
 * (lib/checkout-sweep.ts) adds each paid one to its version, once: the sale,
 * the money and its square. Nothing is read from Stripe on a page view.
 *
 *   nl:ab:<statsId>:<productId>:<testId>   hash: va vb ca cb sa sb ra rb qa qb t0
 *   nl:ab:paid:<checkout id>               counted, 40 days
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { RECORD_TEST_SALE } from "@/lib/headline-test-atomic";
import { parseTestCounts, unavailableTestCounts } from "@/lib/headline-test-counts";
import type { Counts, Version } from "@/lib/headline-test-rules";

export * from "@/lib/headline-test-rules";

const key = (statsId: string, productId: string, testId: string) => `nl:ab:${statsId}:${productId}:${testId}`;

export async function readCounts(statsId: string | null, productId: string, testId: string): Promise<Counts> {
  if (!statsId || !isRedisConfigured()) return unavailableTestCounts();
  try {
    const replies=await redisPipeline([["HGETALL",key(statsId,productId,testId)]]);
    if(!Array.isArray(replies)||replies.length!==1)return unavailableTestCounts();
    return parseTestCounts(replies[0]);
  } catch { return unavailableTestCounts(); }
}

/** Counts one view or one checkout of a version. Best effort: a test is never worth a failed page. */
export async function count(statsId: string | null, productId: string, testId: string, what: "v" | "c", version: Version): Promise<void> {
  if (!statsId || !isRedisConfigured()) return;
  const k = key(statsId, productId, testId);
  await redisPipeline([
    ["HINCRBY", k, `${what}${version}`, 1],
    // When the test was first seen, for how long it has left (daysLeft).
    ...(what === "v" ? [["HSETNX", k, "t0", Date.now()]] : []),
    ["EXPIRE", k, 400 * 86_400],
  ]).catch(() => {});
}

const AB_META = /^([a-z0-9]{4,12}):(a|b)$/;

/** What a checkout's metadata says about the test it was opened from: `${test}:${version}`. */
export function abMeta(testId: string, version: Version): string {
  return `${testId}:${version}`;
}

type PaidRow = { id?: unknown; amount_total?: unknown; currency?: unknown; metadata?: Record<string, string> | null };

/**
 * Adds each paid checkout opened from a test to its version, once: one sale,
 * its money, and that money's square. Only sales in the store's currency, and
 * with money paid: a free order through a discount is not a sale here.
 */
export async function noteTestSales(statsId: string | null, currency: string, paid: PaidRow[]): Promise<number> {
  if (!statsId || !isRedisConfigured()) return 0;
  // In the store's currency only: money in two currencies does not add up, and a sale without its money would skew the version it counts for.
  const rows = paid.filter(
    (row) => typeof row.id === "string" && AB_META.test(row.metadata?.ab ?? "") && typeof row.metadata?.product === "string" && row.currency === currency && typeof row.amount_total === "number" && Number.isSafeInteger(row.amount_total) && row.amount_total > 0,
  );
  let noted = 0;
  for (const row of rows) {
    const [, test, version] = (row.metadata?.ab ?? "").match(AB_META) as RegExpMatchArray;
    const cents = row.amount_total as number;
    const square = cents * cents;
    const [recorded] = await redisPipeline([[
      "EVAL", RECORD_TEST_SALE, 2,
      key(statsId, row.metadata?.product as string, test), `nl:ab:paid:${row.id as string}`,
      version, cents, Number.isSafeInteger(square) ? square : "overflow",
    ]]);
    if (recorded === 0) continue;
    if (recorded !== 1) throw new Error("Test sale totals unavailable; checkout not acknowledged");
    noted += 1;
  }
  return noted;
}
