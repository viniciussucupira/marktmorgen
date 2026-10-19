/**
 * The headline test's rules, which the browser can read too: groups, which
 * version a group sees, and when a version has won. The counting is in
 * lib/headline-test.ts, which only the server loads.
 *
 * Measured in money (added 12 October 2026), as Wingify (ex-VWO) and PostHog
 * measure revenue: on a product sold for money, a version wins by the money
 * it brings per visitor, from sales paid on the creator's Stripe account, not
 * by the checkouts it opens, since a headline that sends more people to the
 * checkout and fewer to paying is not the better one. Each version needs
 * MIN_VIEWS views and MIN_SALES paid sales, and wins when its lead crosses
 * the line below (rule 1): the version that loses stops being shown, by
 * itself. A free product, which has sign-ups and no sales,
 * is still decided by checkouts opened, as before.
 *
 * The chance is worked from each version's visitors, the money they paid and
 * the sum of its squares, as a difference of two means (normal approximation).
 *
 * Measured in sign-ups (a free product), the comparison is a two-proportion
 * z-test, which is only sound when each version would be expected to have at
 * least MIN_EXPECTED_SIGNUPS sign-ups at the rate both have together — the
 * textbook condition for that approximation (added 17 October 2026). Before,
 * 200 views each with 0 sign-ups against 5 was called a win, a split that
 * chance alone makes about one time in sixteen; now it is "still running".
 *
 * Reliable to read every day (added 18 October 2026; ClickFunnels audit
 * priority 6, "Experiment decision reliability"). The winner is worked out on
 * every read, so a fixed 95% line, checked again and again, calls a false
 * winner far more often than one time in twenty. Four rules now hold:
 *
 *   1. The line is valid however often it is looked at: an asymptotic
 *      confidence sequence (Waudby-Smith, Arbour, Sinha, Kennedy and Ramdas,
 *      "Time-uniform central limit theory and asymptotic confidence
 *      sequences", arXiv:2103.06476, Theorem 2.2), at a 5% chance of a false
 *      winner over the whole test, tuned to be tightest near TUNED_VIEWS
 *      views. At 2,000 views the line is |z| >= 3.04 instead of 1.96, so a
 *      real difference is called somewhat later and a chance one far less
 *      often. tests/experiment-reliability.test.ts measures both.
 *   2. The measure is declared when the test is saved (lib/sales-page.ts,
 *      `measure` on the test): money for a product sold, sign-ups for a free
 *      one. If the product changes between free and paid while the test runs,
 *      no winner is called on a measure it did not start with.
 *   3. The split is checked: visitors are put in a version by a fixed share
 *      of the 1,000 groups (expectedShareB). When the views are further from
 *      that share than chance allows (a sample ratio mismatch, p < 0.001),
 *      something is counting one version more than the other, and no winner
 *      is called.
 *   4. Money waits for refunds: a test measured in money is not decided
 *      before it has run REFUND_DAYS days. Refunds are not taken out of
 *      either version's money; the studio says so.
 */
/** Each version must have been seen this many times before a winner is called. */
export const MIN_VIEWS = 200;
/** The chance of a false winner allowed over the whole test, however often it is read. */
export const FALSE_WINNER = 0.05;
/** Where the line is tightest: views of the two versions together. */
export const TUNED_VIEWS = 2_000;
/** A test measured in money is not decided before it has run this many days. */
export const REFUND_DAYS = 14;
/** The chi-square line of a sample ratio mismatch at p < 0.001, one degree of freedom. */
const SRM_CHI2 = 10.828;
/** The cookie that holds a visitor's group number, 0 to 999. */
export const AB_COOKIE = "nl_ab";
export const AB_COOKIE_SECONDS = 90 * 24 * 60 * 60;

export type Version = "a" | "b";
/**
 * Views, checkouts opened, sales paid, money paid (in the store's smallest
 * unit), the sum of each sale's square (for how spread the money is), and
 * when the test was first seen (ms; 0 when not known).
 */
export type Counts = { va: number; vb: number; ca: number; cb: number; sa?: number; sb?: number; ra?: number; rb?: number; qa?: number; qb?: number; t0?: number; unavailable?: boolean };
/** How a test is decided: by money for a product sold, by checkouts for a free one. */
export type Measure = "money" | "checkouts";
/** Each version must have this many paid sales before money decides. */
export const MIN_SALES = 10;
/**
 * Sign-ups each version would be expected to have, at the two versions'
 * rate together, before sign-ups decide. With equal traffic it is 10 sign-ups
 * between the two, at least.
 */
export const MIN_EXPECTED_SIGNUPS = 5;
/**
 * The chance the studio shows of one version bringing more per visitor. It is
 * no longer the line a winner must cross: that is boundary(), which holds
 * however often the test is read (rule 1).
 */
export const WIN_CHANCE = 0.975;


/** A group number as it arrives in the cookie, or null when there is none or it is not one. */
export function readBucket(raw: string | null | undefined): number | null {
  if (!raw || !/^\d{1,3}$/.test(raw)) return null;
  return Number(raw);
}

/**
 * Which version this group sees in this test. Mixed with the test's id, so
 * the same visitor is not always in the same half of every test.
 */
export function versionFor(bucket: number, testId: string): Version {
  let h = bucket * 2654435761;
  for (let i = 0; i < testId.length; i += 1) h = Math.imul(h ^ testId.charCodeAt(i), 2246822519) >>> 0;
  return (h >>> 0) % 2 === 0 ? "a" : "b";
}

/**
 * The z a difference must reach to be called, at `views` views together, so
 * that reading the test after every visitor still calls a false winner at
 * most FALSE_WINNER of the time (rule 1 above). With x = views·ρ², the
 * paper's Eq. (8) half-width divided by the standard error is
 * sqrt(2(x+1)/x · ln(sqrt(x+1)/α)); ρ² is chosen so it is smallest at
 * TUNED_VIEWS, where x is the root of x = −2 ln α + ln(1 + x).
 */
export function boundary(views: number): number {
  const alpha = FALSE_WINNER;
  let x = 8;
  for (let i = 0; i < 50; i += 1) x = -2 * Math.log(alpha) + Math.log(1 + x);
  const rho2 = x / TUNED_VIEWS;
  const at = Math.max(1, views) * rho2;
  return Math.sqrt(((2 * (at + 1)) / at) * Math.log(Math.sqrt(at + 1) / alpha));
}

/** The share of visitors with a group that see the second version of this test: its share of the 1,000 groups. */
export function expectedShareB(testId: string): number {
  let b = 0;
  for (let bucket = 0; bucket < 1000; bucket += 1) if (versionFor(bucket, testId) === "b") b += 1;
  return b / 1000;
}

/**
 * Whether the views are split further from the share each version should
 * have than chance allows (rule 3). Only from 2·MIN_VIEWS views together; a
 * share of 0 or 1 is no test.
 */
export function splitMismatch(counts: Pick<Counts, "va" | "vb">, shareB = 0.5): boolean {
  const total = counts.va + counts.vb;
  if (total < 2 * MIN_VIEWS || shareB <= 0 || shareB >= 1) return false;
  const expectA = total * (1 - shareB);
  const expectB = total * shareB;
  const chi2 = (counts.va - expectA) ** 2 / expectA + (counts.vb - expectB) ** 2 / expectB;
  return chi2 > SRM_CHI2;
}

/** Why a test has no winner yet, or that it has one. */
export type TestState =
  | { state: "won"; winner: Version }
  | { state: "running" | "too_few" | "split" | "measure_changed" | "maturing" | "unavailable"; winner: null };


/** A decision needs finite, exact nonnegative counts and coherent money moments. */
export function usableTestCounts(counts: Counts | null | undefined, measure: Measure): boolean {
  if(!counts || typeof counts!=="object" || Array.isArray(counts) || counts.unavailable)return false;
  const fields=["va","vb","ca","cb","sa","sb","ra","rb","qa","qb","t0"] as const;
  for(const field of fields) {
    const value=counts[field];
    if(value===undefined && !["va","vb","ca","cb"].includes(field))continue;
    if(!Number.isSafeInteger(value) || Number(value)<0)return false;
  }
  if(!Number.isSafeInteger(counts.va+counts.vb))return false;
  if(measure==="checkouts")return counts.ca<=counts.va && counts.cb<=counts.vb;
  for(const version of ["a","b"] as const) {
    const views=version==="a"?counts.va:counts.vb;
    const sales=(version==="a"?counts.sa:counts.sb)??0;
    const money=(version==="a"?counts.ra:counts.rb)??0;
    const squares=(version==="a"?counts.qa:counts.qb)??0;
    if(sales>views || (!sales && (money!==0 || squares!==0)) || (sales>0 && (money<=0 || squares<=0)))return false;
    // Missing/corrupt squares must not be clamped into a fictitious zero variance.
    if(sales>0 && squares*sales < money*money*(1-1e-12))return false;
  }
  return true;
}

/** The standard normal's cumulative chance, to within a ten-thousandth (Abramowitz and Stegun 7.1.26). */
function phi(z: number): number {
  const t = 1 / (1 + 0.3275911 * (Math.abs(z) / Math.SQRT2));
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-(z * z) / 2);
  return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}

/** Money per visitor of one version, in the smallest unit. */
export function perVisitor(money: number, views: number): number {
  return views > 0 ? money / views : 0;
}

/**
 * The chance the second version brings more money per visitor than the
 * first, 0 to 1; null before both have been seen and something has sold.
 */
export function chanceBBetter(counts: Counts): number | null {
  if(!usableTestCounts(counts,"money"))return null;
  const { va, vb } = counts;
  const ra = counts.ra ?? 0;
  const rb = counts.rb ?? 0;
  if (va < 1 || vb < 1 || (counts.sa ?? 0) + (counts.sb ?? 0) === 0) return null;
  const ma = ra / va;
  const mb = rb / vb;
  const varA = Math.max(0, (counts.qa ?? 0) / va - ma * ma);
  const varB = Math.max(0, (counts.qb ?? 0) / vb - mb * mb);
  const se = Math.sqrt(varA / va + varB / vb);
  if (se === 0) return mb === ma ? 0.5 : mb > ma ? 1 : 0;
  return phi((mb - ma) / se);
}

/**
 * How the test stands: won, or why not yet. `declared` is the measure the
 * test was saved with (absent for a test saved before 18 October 2026, which
 * is then read with today's), `shareB` the second version's share of the
 * groups (expectedShareB), `now` the time read.
 */
export function testState(
  counts: Counts,
  measure: Measure = "checkouts",
  options: { declared?: Measure | null; shareB?: number; now?: number } = {},
): TestState {
  const none = (state: Exclude<TestState["state"], "won">): TestState => ({ state, winner: null });
  if(!usableTestCounts(counts,measure) || (options.shareB!==undefined && (!Number.isFinite(options.shareB)||options.shareB<=0||options.shareB>=1)) || (options.now!==undefined && (!Number.isSafeInteger(options.now)||options.now<=0)))return none("unavailable");
  if (options.declared && options.declared !== measure) return none("measure_changed");
  if (counts.va < MIN_VIEWS || counts.vb < MIN_VIEWS) return none("too_few");
  if (splitMismatch(counts, options.shareB ?? 0.5)) return none("split");
  const line = boundary(counts.va + counts.vb);
  let z: number;
  if (measure === "money") {
    if ((counts.sa ?? 0) < MIN_SALES || (counts.sb ?? 0) < MIN_SALES) return none("too_few");
    const ma = (counts.ra ?? 0) / counts.va;
    const mb = (counts.rb ?? 0) / counts.vb;
    const varA = Math.max(0, (counts.qa ?? 0) / counts.va - ma * ma);
    const varB = Math.max(0, (counts.qb ?? 0) / counts.vb - mb * mb);
    const se = Math.sqrt(varA / counts.va + varB / counts.vb);
    if (se === 0) return none("running");
    z = (mb - ma) / se;
  } else {
    const pa = counts.ca / counts.va;
    const pb = counts.cb / counts.vb;
    const pooled = (counts.ca + counts.cb) / (counts.va + counts.vb);
    // Too few sign-ups for the normal approximation to say anything yet.
    if (pooled * Math.min(counts.va, counts.vb) < MIN_EXPECTED_SIGNUPS) return none("too_few");
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / counts.va + 1 / counts.vb));
    if (se === 0) return none("running");
    z = (pb - pa) / se;
  }
  if(!Number.isFinite(z) || !Number.isFinite(line))return none("unavailable");
  if (Math.abs(z) < line) return none("running");
  if (measure === "money") {
    const t0 = counts.t0 ?? 0;
    const now = options.now ?? Date.now();
    if (!t0 || now - t0 < REFUND_DAYS * 86_400_000) return none("maturing");
  }
  return { state: "won", winner: z > 0 ? "b" : "a" };
}

/** The version that has won, or null while the test is still running or nothing is clear (testState). */
export function winner(counts: Counts, measure: Measure = "checkouts", options: { declared?: Measure | null; shareB?: number; now?: number } = {}): Version | null {
  return testState(counts, measure, options).winner;
}

/** Checkouts per hundred views, to one decimal, for the studio. */
export function rate(checkouts: number, views: number): number {
  return views > 0 ? Math.round((checkouts / views) * 1000) / 10 : 0;
}


/**
 * About how many more days, at the traffic the test has had, until each
 * version has the views (and, measured in money, the sales) it needs before a
 * winner can be called: the least it can take, since a close race needs more.
 * null when it cannot be said yet: no start, or nothing sold to set a pace by.
 */
export function daysLeft(counts: Counts, measure: Measure, now = Date.now()): number | null {
  if(!usableTestCounts(counts,measure) || !Number.isSafeInteger(now) || now<=0)return null;
  const t0 = counts.t0 ?? 0;
  if (!t0 || now <= t0) return null;
  const days = Math.max(1, (now - t0) / 86_400_000);
  const perDay = (counts.va + counts.vb) / 2 / days;
  if (perDay <= 0) return null;
  let need = MIN_VIEWS;
  if (measure === "checkouts") {
    // Enough views for the sign-ups each version is expected to need, at
    // the rate seen so far; with none yet, the views are the least it takes.
    const rate = (counts.ca + counts.cb) / (counts.va + counts.vb);
    if (rate > 0) need = Math.max(MIN_VIEWS, Math.ceil(MIN_EXPECTED_SIGNUPS / rate));
  }
  if (measure === "money") {
    const sold = (counts.sa ?? 0) + (counts.sb ?? 0);
    if (sold === 0) return null;
    need = Math.max(MIN_VIEWS, Math.ceil(MIN_SALES / (sold / (counts.va + counts.vb))));
  }
  const left = Math.max(0, need - Math.min(counts.va, counts.vb));
  const byViews = Math.ceil(left / perDay);
  // Money waits for refunds (rule 4): never less than the days the test still has to run.
  return measure === "money" ? Math.max(byViews, Math.ceil(Math.max(0, t0 + REFUND_DAYS * 86_400_000 - now) / 86_400_000)) : byViews;
}
