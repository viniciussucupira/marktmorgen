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
 * MIN_VIEWS views and MIN_SALES paid sales, and wins when the chance it
 * brings more per visitor is at least 97.5%: the version that loses stops
 * being shown, by itself. A free product, which has sign-ups and no sales,
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
 */
/** Each version must have been seen this many times before a winner is called. */
export const MIN_VIEWS = 200;
/** The z-score of a difference significant at 95%, two-sided. */
const Z_95 = 1.96;
/** The cookie that holds a visitor's group number, 0 to 999. */
export const AB_COOKIE = "nl_ab";
export const AB_COOKIE_SECONDS = 90 * 24 * 60 * 60;

export type Version = "a" | "b";
/**
 * Views, checkouts opened, sales paid, money paid (in the store's smallest
 * unit), the sum of each sale's square (for how spread the money is), and
 * when the test was first seen (ms; 0 when not known).
 */
export type Counts = { va: number; vb: number; ca: number; cb: number; sa?: number; sb?: number; ra?: number; rb?: number; qa?: number; qb?: number; t0?: number };
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
/** The chance one version must have of bringing more per visitor to win. */
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

/** The version that has won, or null while the test is still running or nothing is clear. */
export function winner(counts: Counts, measure: Measure = "checkouts"): Version | null {
  if (measure === "money") {
    if (counts.va < MIN_VIEWS || counts.vb < MIN_VIEWS) return null;
    if ((counts.sa ?? 0) < MIN_SALES || (counts.sb ?? 0) < MIN_SALES) return null;
    const chance = chanceBBetter(counts);
    if (chance === null) return null;
    return chance >= WIN_CHANCE ? "b" : chance <= 1 - WIN_CHANCE ? "a" : null;
  }
  if (counts.va < MIN_VIEWS || counts.vb < MIN_VIEWS) return null;
  const pa = counts.ca / counts.va;
  const pb = counts.cb / counts.vb;
  const pooled = (counts.ca + counts.cb) / (counts.va + counts.vb);
  // Too few sign-ups for the normal approximation to say anything yet.
  if (pooled * Math.min(counts.va, counts.vb) < MIN_EXPECTED_SIGNUPS) return null;
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / counts.va + 1 / counts.vb));
  if (se === 0) return null;
  const z = (pb - pa) / se;
  if (Math.abs(z) < Z_95) return null;
  return z > 0 ? "b" : "a";
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
  return Math.ceil(left / perDay);
}
