/**
 * Pricing study v2 (18 October 2026): plan count, prices, commission, limits
 * and prepaid packs for Marktmorgen. An ANALYSIS for the owner, nothing in
 * force: no price, limit, gate or tax assumption in code changes, and sales
 * stay closed.
 *
 * What this file does, and what it leaves to others:
 *
 *   - every margin is the repository's own: lib/receiving-costs.ts
 *     (unitUnder under the sizing reading and the most-tax reading), the
 *     worst month of tests/plan-cost-registry.ts (COST_LINES,
 *     PER_PAYMENT_LINES), the printed figures and their rounding of
 *     tests/limits-proposal-table.ts (figures, tidy), the packs of
 *     tests/pricing-usage-proposal-table.ts (PACKS, packPriceCents, packUnit,
 *     atScale), and lib/customer-base-rules.ts (assessMinimumCustomerBase);
 *   - the competitors and the demand evidence are
 *     docs/research/pricing-dataset-v2-2026-10-18.json, each figure with its
 *     page and the day it was read;
 *   - the demand model, the mixed-integer program, the logit search, the
 *     Monte Carlo and the regret analysis are scripts/pricing-study-v2.py
 *     (numpy, scipy.optimize.milp with HiGHS), which reads the input this
 *     file writes (studyInput()) and writes the output this file renders and
 *     checks again (renderPricingStudyV2(), verifiedDesign()).
 *
 *   node scripts/pricing-study-v2.mjs
 *
 * writes the input, runs the solver and writes the document;
 * tests/pricing-study-v2.test.ts fails when any of the three files is stale,
 * when a plan in the output stops keeping 60% under the repository's code, or
 * when a figure disagrees with the constants in force.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PLAN_PRICES, PLAN_TITLES, TIERS, COMMISSION_LIVE, type Cycle, type Tier } from "@/lib/plan";
import { MAX_PRODUCTS } from "@/lib/catalog-rules";
import { MAX_LEADS } from "@/lib/contact-rules";
import { MAX_TEAM } from "@/lib/team";
import { MAX_STORES_PER_ACCOUNT } from "@/lib/store";
import { ASSISTANT_PRICE_CENTS } from "@/lib/store-assistant-rules";
import { CENTS_PER_MINUTE, MIN_CENTS } from "@/lib/auto-captions-rules";
import { assessMinimumCustomerBase } from "@/lib/customer-base-rules";
import {
  DISPUTE_RESERVE_BPS, MOST_TAX_READING, PROVIDER_FEES, REFUND_RESERVE_BPS, SIZING_READING, unitUnder, type Reading, type UnitResult,
} from "@/lib/receiving-costs";
import { COST_LINES, GB, PER_PAYMENT_LINES, nonPayingWorst } from "./plan-cost-registry";
import { FREE_POOL_BASE_STORES } from "@/lib/free-pool-rules";
import { figures, tidy, type Printed } from "./limits-proposal-table";
import { PACKS, atScale, packPriceCents, packUnit, type Pack } from "./pricing-usage-proposal-table";

export const READ_ON = "18 October 2026";
export const DATA_FILE = "docs/research/pricing-dataset-v2-2026-10-18.json";
export const INPUT_FILE = "docs/pricing-study-v2-input-2026-10-18.json";
export const OUTPUT_FILE = "docs/pricing-study-v2-output-2026-10-18.json";
export const DOC_FILE = "docs/pricing-study-v2-2026-10-18.md";

const readJson = <T>(file: string): T => JSON.parse(readFileSync(join(process.cwd(), file), "utf8")) as T;

// ------------------------------------------------------------- the dataset

export type Source = { id: string; url: string; accessed: string; type: string; note?: string };
export type VendorPlan = {
  name: string; monthlyUsd: number | null; yearlyUsd?: number | null; perMonthBilledYearlyUsd?: number | null;
  feeOnSalePct: number | null; feeFixedUsd?: number; feeIncludesProcessing?: boolean | null;
  limits: Record<string, unknown>; leadsWith?: string; priceNote?: string;
};
export type Vendor = { name: string; sources: string[]; freeTier: string | null; trialDays: number | null; highlighted: string; yearlyFraming: string; plans: VendorPlan[] };
export type Dataset = {
  schema: number; accessed: string; note: string; sources: Source[]; vendors: Vendor[]; notRead: string[];
  demandEvidence: Record<string, Record<string, unknown>>;
};
let cached: Dataset | null = null;
export const dataset = (): Dataset => (cached ??= readJson<Dataset>(DATA_FILE));
export const sourceOf = (id: string) => dataset().sources.find((s) => s.id === id)!;

// ------------------------------------------------------------- statistics helpers

/** The standard normal distribution function (Abramowitz and Stegun 7.1.26 through erf; absolute error under 1.5e-7). */
export function normalCdf(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}
/** The standard normal quantile (Acklam's rational approximation, relative error under 1.2e-9). */
export function normalQuantile(p: number): number {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425, hi = 1 - lo;
  if (p < lo) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > hi) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

export type Population = { id: string; label: string; mu: number; sigma: number; medianUsd: number; meanUsd: number; basis: string; sources: string[]; fit?: { threshold: number; observed: number; fitted: number }[] };

/**
 * Monthly sales of a creator, as a lognormal, three ways (each a scenario, none
 * a measurement of Marktmorgen's future customers):
 *
 *   1. gumroad-sellers: least squares on the probits of Gumroad's own July
 *      2025 counts (creators who made money that month, over $10, $100,
 *      $1,000 and $10,000);
 *   2. linktree-fulltime: through the two quantiles of Linktree's 2022 survey
 *      of full-time creators (46% under $1,000 a year, 12% over $50,000),
 *      which are earnings from every source, not one store's sales;
 *   3. platform-customers: the spread of (1) and the mean of Thinkific's GMV
 *      per paying customer in 2025, derived from its results (GMV $460.0M a
 *      year over total revenue $73.2M divided by the Q4 ARPU of $175 a month):
 *      an approximation, said as such.
 */
export function populations(): Population[] {
  const ev = dataset().demandEvidence;
  const g = ev.gumroadJuly2025 as Record<string, number>;
  const points = [[10, g.over10], [100, g.over100], [1_000, g.over1000], [10_000, g.over10000]].map(([t, n]) => ({ t, s: n / g.madeMoney }));
  // z = a + b ln g, z = Φ⁻¹(1 − S(g)).
  const xs = points.map((p) => Math.log(p.t)), zs = points.map((p) => normalQuantile(1 - p.s));
  const mx = xs.reduce((s, x) => s + x, 0) / xs.length, mz = zs.reduce((s, z) => s + z, 0) / zs.length;
  const b = xs.reduce((s, x, i) => s + (x - mx) * (zs[i] - mz), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const a = mz - b * mx;
  const sigma1 = 1 / b, mu1 = -a / b;
  const lt = ev.linktreeCreatorReport2022 as Record<string, number>;
  const q1 = Math.log(1_000 / 12), q2 = Math.log(50_000 / 12);
  const z1 = normalQuantile(lt.fullTimeUnder1000PerYearPct / 100), z2 = normalQuantile(1 - lt.fullTimeOver50000PerYearPct / 100);
  const sigma2 = (q2 - q1) / (z2 - z1), mu2 = q1 - sigma2 * z1;
  const th = ev.thinkific as Record<string, number>;
  const payingCustomers = th.revenue2025Usd / (th.arpuMonthlyUsdQ4 * 12);
  const meanMonthly = th.gmv2025Usd / payingCustomers / 12;
  const mu3 = Math.log(meanMonthly) - (sigma1 * sigma1) / 2;
  const make = (id: string, label: string, mu: number, sigma: number, basis: string, sources: string[], fit?: Population["fit"]): Population =>
    ({ id, label, mu, sigma, medianUsd: Math.exp(mu), meanUsd: Math.exp(mu + (sigma * sigma) / 2), basis, sources, fit });
  return [
    make("gumroad-sellers", "Gumroad sellers who made money in July 2025", mu1, sigma1, "least squares on the probits of the four counts", ["gumroad-july-2025"],
      points.map((p) => ({ threshold: p.t, observed: p.s, fitted: 1 - normalCdf((Math.log(p.t) - mu1) / sigma1) }))),
    make("linktree-fulltime", "Full-time creators in Linktree's 2022 survey (all income)", mu2, sigma2, "through the survey's two quantiles", ["techcrunch-linktree-report"]),
    make("platform-customers", "Paying customers of a course platform (Thinkific 2025, derived)", mu3, sigma1, `spread of the Gumroad fit, mean $${meanMonthly.toFixed(0)} a month: GMV over (revenue / (12 × ARPU)), about ${Math.round(payingCustomers).toLocaleString("en-US")} paying customers`, ["thinkific-results", "gumroad-july-2025"]),
  ];
}

/** The segments: monthly sales between these edges, each represented by its geometric middle. */
export const BIN_EDGES = [0, 1, 3, 10, 30, 100, 200, 500, 1_000, 2_000, 5_000, 10_000, 20_000, 50_000, Number.POSITIVE_INFINITY];
export function binMiddles(): number[] {
  return BIN_EDGES.slice(0, -1).map((lo, i) => {
    const hi = BIN_EDGES[i + 1];
    if (lo === 0) return 0.5;
    if (!Number.isFinite(hi)) return lo * 1.5;
    return Math.sqrt(lo * hi);
  });
}
export function binWeights(p: Population): number[] {
  const cdf = (x: number) => (x <= 0 ? 0 : !Number.isFinite(x) ? 1 : normalCdf((Math.log(x) - p.mu) / p.sigma));
  return BIN_EDGES.slice(0, -1).map((lo, i) => cdf(BIN_EDGES[i + 1]) - cdf(lo));
}

// ------------------------------------------------------------- the candidate plans

/**
 * Lines of the worst month that stay at their base plan's level when a new
 * plan is sized down: the creator's own studio (its pages and saves; cutting
 * it would make the studio unusable), this store's share of the stores that
 * pay nothing (a fixed share of the free pool, lib/free-pool-rules.ts), course
 * quizzes (one figure for every plan), and the lines that cost nothing.
 * Every other line scales with the plan's size; the printed ones are rounded
 * down the way a page prints them (tidy) and costed at their rounded share.
 */
export const FIXED_LINES = ["studio", "free-share", "quizzes", "collections", "embed", "free-delivery"] as const;
/** The printed line each cost line moves with, for a plan sized down. */
const PRINTED_OF: Record<string, Printed> = {
  storage: "storage", video: "video", visits: "visits", orders: "orders", "list-email": "list-email",
  "transactional-email": "transactional-email", "store-email": "store-email", ai: "ai",
};

export type Template = "start" | "creator" | "growth" | "pro" | "scale";
/** The templates: today's three plans at their limits, and two new plans sized down from Store and from Studio. */
export const TEMPLATES: Record<Template, { title: string; base: Tier; sized: boolean; today: boolean; grid: number[]; commissions: number[] }> = {
  start: { title: "Start (new)", base: "creator", sized: true, today: false, grid: [1_900, 2_400, 2_900, 3_400, 3_900, 4_400, 4_900, 5_400], commissions: [0, 200, 350, 500, 750, 1_000] },
  creator: { title: PLAN_TITLES.creator, base: "creator", sized: false, today: true, grid: [6_900, 7_900, 8_900, 9_900, 11_900, 14_900], commissions: [0, 200, 350, 500] },
  growth: { title: "Growth (new)", base: "pro", sized: true, today: false, grid: [12_900, 14_900, 19_900, 24_900, 29_900], commissions: [0, 100, 200, 350, 500] },
  pro: { title: PLAN_TITLES.pro, base: "pro", sized: false, today: true, grid: [44_900, 49_900, 54_900, 59_900, 69_900], commissions: [0, 100, 200, 350] },
  scale: { title: PLAN_TITLES.scale, base: "scale", sized: false, today: true, grid: [99_900, 109_900, 119_900, 129_900, 149_900], commissions: [0, 100, 200] },
};
export const TEMPLATE_ORDER: Template[] = ["start", "creator", "growth", "pro", "scale"];
/** Sizes looked at for a new plan: the largest that keeps 60% at its price, and half of it (more room above the floor for the fixed costs). */
export const SIZES = { max: 1, half: 0.5 } as const;
export type Size = keyof typeof SIZES | "today";

const centsUp = (usd: number) => Math.ceil(Math.round(usd * 1e7) / 1e5);
const months = (cycle: Cycle) => (cycle === "year" ? 12 : 1);
/** The room the spend floor test keeps under a plan on sale (tests/margin-alignment-table.ts roomKept). */
export const PLAN_ROOM: Record<Cycle, number> = { month: 25, year: 100 };
export const yearOf = (monthCents: number) => monthCents * 10;

/** A plan's printed figures at a uniform size, rounded down as a page prints them (zero stays zero). */
export function sizedFigures(base: Tier, share: number): Record<Printed, number[]> {
  const today = figures(base);
  return Object.fromEntries((Object.keys(today) as Printed[]).map((id) => [id, today[id].map((n) => (n === 0 ? 0 : share >= 1 ? n : share <= 0 ? 0 : Math.min(n, tidy(id, n * share))))])) as Record<Printed, number[]>;
}
function lineShare(base: Tier, fig: Record<Printed, number[]>, id: Printed): number {
  const today = figures(base)[id];
  const i = today.findIndex((n) => n > 0);
  return i < 0 ? 1 : fig[id][i] / today[i];
}

/**
 * A plan's usage at full use of every figure, in cents, for one payment: every
 * line of the worst month for every window the payment reaches, and what it
 * leaves after its plan ends. At share 1 it is exactly
 * tests/margin-alignment-table.ts planUnits' usage (held in
 * tests/pricing-study-v2.test.ts). Split into the lines that do not move with
 * how much a store uses (FIXED_LINES: its studio, its share of the stores that
 * pay nothing, and the lines that cost nothing) and the rest, which do
 * (what it keeps after its plan ends included: it is what it stored).
 */
export function usageParts(base: Tier, cycle: Cycle, share: number): { fixed: number; variable: number } {
  const fig = sizedFigures(base, share);
  let fixed = 0, variable = 0;
  for (const line of COST_LINES) {
    const usd = line.monthlyUsd(base);
    if ((FIXED_LINES as readonly string[]).includes(line.id)) fixed += usd;
    else if (share >= 1) variable += usd;
    else if (line.id in PRINTED_OF) variable += usd * lineShare(base, fig, PRINTED_OF[line.id]);
    else variable += usd * share;
  }
  let after = 0;
  for (const line of PER_PAYMENT_LINES) {
    const usd = line.monthlyUsd(base);
    after += line.id === "retained-files" && share < 1 ? usd * share : usd;
  }
  return { fixed: months(cycle) * fixed, variable: months(cycle) * variable + after };
}
export function usageAt(base: Tier, cycle: Cycle, share: number): number {
  const u = usageParts(base, cycle, share);
  return centsUp(u.fixed + u.variable);
}
/** One payment's unit under a reading; `usageShare` is the share of every allowance used, which scales only the lines that move with use. */
export function planUnit(base: Tier, cycle: Cycle, monthCents: number, share: number, reading: Reading = SIZING_READING, usageShare = 1): UnitResult {
  const price = cycle === "year" ? yearOf(monthCents) : monthCents;
  if (usageShare >= 1) return unitUnder(price, usageAt(base, cycle, share), reading, true);
  const u = usageParts(base, cycle, share);
  return unitUnder(price, centsUp(u.fixed + u.variable * usageShare), reading, true);
}
export function keepsWithRoom(base: Tier, monthCents: number, share: number): boolean {
  return (["month", "year"] as const).every((cycle) => {
    const u = planUnit(base, cycle, monthCents, share);
    return u.meetsFloor && u.usageRoomCents - u.usageCents >= PLAN_ROOM[cycle];
  });
}
/** The largest uniform size at a price that keeps 60% with room on both intervals (null when even the fixed lines do not). */
export function maxShare(base: Tier, monthCents: number): number | null {
  if (!keepsWithRoom(base, monthCents, 0)) return null;
  if (keepsWithRoom(base, monthCents, 1)) return 1;
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i += 1) { const mid = (lo + hi) / 2; if (keepsWithRoom(base, monthCents, mid)) lo = mid; else hi = mid; }
  return lo;
}

export const USAGE_LEVELS = [0, 0.15, 0.3, 0.6, 1] as const;
export type Candidate = {
  id: string; template: Template; title: string; base: Tier; size: Size; share: number; monthCents: number; commissionBps: number;
  figures: { visits: number; orders: number; listEmails: number; aiJobs: number; aiAnswers: number; storageGb: number; videoHours: number; accessEmails: number; storeEmails: number };
  /** Net of one monthly payment, in cents, with this share of every allowance used (sizing reading). */
  netMonthCents: Record<string, number>;
  /** A twelfth of one yearly payment's net, in cents, at the same usage shares (sizing reading): what a yearly payer leaves a month. */
  netYearMonthCents: Record<string, number>;
  /** The same two under the most-tax reading (the gate, lib/tax-gate.ts gateReading()). */
  gateNetMonthCents: Record<string, number>;
  gateNetYearMonthCents: Record<string, number>;
  revenueMonthCents: number;
  /** What the price leaves above the floor and the spend floor's room, in cents, at full use: what raising a printed figure may spend. */
  lpRoomCents: { month: number; year: number };
  netBps: { month: number; year: number };
  mostTaxNetBps: number;
  /** The least one payer of this plan leaves the company a month, at full use, after every cost and the profit tax (the lower of a monthly payment's net and a yearly one's twelfth): the no-loss rule's figure. */
  worstNetPerPayerCents: number;
  /** What one payer of this plan leaves above 60% of its revenue a month at full use, the commission counted as zero (the lower of a monthly payment and a yearly one's twelfth): what covers the fixed costs at 60% consolidated. */
  headroomMonthCents: number;
  /** Paying customers needed, every one on this plan at full use, before the company keeps 60% consolidated (lib/customer-base-rules.ts), for the named fixed costs and for them plus the unreviewed allowance of MODEL.company. */
  minimumBase: { named: number | null; withUnreviewed: number | null };
};
const usageKey = (u: number) => `u${Math.round(u * 100)}`;

let candidatesCache: Candidate[] | null = null;
export function candidates(): Candidate[] {
  if (candidatesCache) return candidatesCache;
  const out: Candidate[] = [];
  for (const template of TEMPLATE_ORDER) {
    const t = TEMPLATES[template];
    for (const monthCents of t.grid) {
      const sizes: { size: Size; share: number }[] = [];
      if (!t.sized) { if (keepsWithRoom(t.base, monthCents, 1)) sizes.push({ size: "today", share: 1 }); }
      else {
        const m = maxShare(t.base, monthCents);
        if (m !== null && m > 0) for (const [size, k] of Object.entries(SIZES)) sizes.push({ size: size as Size, share: Math.min(1, m * k) });
      }
      for (const { size, share } of sizes) {
        const fig = sizedFigures(t.base, share);
        for (const commissionBps of t.commissions) {
          const month = planUnit(t.base, "month", monthCents, share), year = planUnit(t.base, "year", monthCents, share);
          out.push({
            id: `${template}-${monthCents / 100}-${size}-c${commissionBps}`,
            template, title: t.title, base: t.base, size, share, monthCents, commissionBps,
            figures: {
              visits: fig.visits[0], orders: fig.orders[0], listEmails: fig["list-email"][0], aiJobs: fig.ai[0], aiAnswers: fig.ai[1],
              storageGb: fig.storage[0] / GB, videoHours: fig.video[0], accessEmails: fig["transactional-email"][0], storeEmails: fig["store-email"][0],
            },
            netMonthCents: Object.fromEntries(USAGE_LEVELS.map((u) => [usageKey(u), planUnit(t.base, "month", monthCents, share, SIZING_READING, u).netCents])),
            netYearMonthCents: Object.fromEntries(USAGE_LEVELS.map((u) => [usageKey(u), Math.floor(planUnit(t.base, "year", monthCents, share, SIZING_READING, u).netCents / 12)])),
            gateNetMonthCents: Object.fromEntries(USAGE_LEVELS.map((u) => [usageKey(u), planUnit(t.base, "month", monthCents, share, MOST_TAX_READING, u).netCents])),
            gateNetYearMonthCents: Object.fromEntries(USAGE_LEVELS.map((u) => [usageKey(u), Math.floor(planUnit(t.base, "year", monthCents, share, MOST_TAX_READING, u).netCents / 12)])),
            revenueMonthCents: month.revenueCents,
            lpRoomCents: { month: month.usageRoomCents - month.usageCents - PLAN_ROOM.month, year: year.usageRoomCents - year.usageCents - PLAN_ROOM.year },
            netBps: { month: month.netBps, year: year.netBps },
            mostTaxNetBps: planUnit(t.base, "month", monthCents, share, MOST_TAX_READING).netBps,
            worstNetPerPayerCents: Math.min(month.netCents, Math.floor(year.netCents / 12)),
            headroomMonthCents: Math.min(month.netCents - 0.6 * month.revenueCents, (year.netCents - 0.6 * year.revenueCents) / 12),
            minimumBase: {
              named: baseForPlan(t.base, monthCents, share, NAMED_FIXED_MONTHLY_CENTS),
              withUnreviewed: baseForPlan(t.base, monthCents, share, NAMED_FIXED_MONTHLY_CENTS + MODEL.company.unreviewedFixedCents.high),
            },
          });
        }
      }
    }
  }
  return (candidatesCache = out);
}
/** Today's price list, as candidates: what every design is compared with. */
export const TODAY_IDS = TIERS.map((tier) => `${tier}-${PLAN_PRICES[tier].month / 100}-today-c0`);

// ------------------------------------------------------------- packs, commission, competitors

/** The prepaid packs a design may sell (tests/pricing-usage-proposal-table.ts), at the size proposed there and four times larger. */
export function packs(): { id: string; raises: string; units: number; priceCents: number; netCents: number; gateNetCents: number; mostTaxNetBps: number }[] {
  const wanted = PACKS.filter((p) => ["visits", "orders", "list-email"].includes(p.id));
  return wanted.flatMap((p) => [p, atScale(p, 4)].map((pack: Pack, i) => {
    const u = packUnit(pack);
    const g = packUnit(pack, MOST_TAX_READING);
    return { id: `${pack.id}${i ? "-x4" : ""}`, raises: pack.id, units: pack.units, priceCents: packPriceCents(pack), netCents: u.netCents, gateNetCents: g.netCents, mostTaxNetBps: g.netBps };
  }));
}

/**
 * What one dollar of commission keeps, after the remittance, refund and
 * dispute reserves of lib/receiving-costs.ts, an allowance for what taking a
 * share costs that has not been read or reviewed (Stripe Connect's own terms
 * for application fees on direct charges, the share's part of refunds, the
 * EU art. 9a records: COMMISSION_UNREVIEWED_BPS), and the profit tax of the
 * reading. The commission is counted as ZERO in the 60% floor (the owner's
 * rule): this figure is used only for the expected profit above it.
 */
export const COMMISSION_UNREVIEWED_BPS = 1_000;
export function commissionKeep(reading: Reading): number {
  const reserves = reading.remittanceBps + REFUND_RESERVE_BPS + DISPUTE_RESERVE_BPS + COMMISSION_UNREVIEWED_BPS;
  const profitBps = Math.max(reading.profitTaxBps, SIZING_READING.profitTaxBps);
  return ((10_000 - reserves) / 10_000) * ((10_000 - profitBps) / 10_000) - reading.revenueTaxBps / 10_000;
}

export type Competitor = { id: string; vendor: string; plan: string; monthlyUsd: number; feeBps: number; feeFixedCents: number; includesProcessing: boolean; emailCap: number | null; kind: "platform" | "payments"; sources: string[] };
/**
 * The alternatives a creator choosing a store compares with ours: every plan
 * of a store-capable vendor in the dataset with a stated monthly price
 * (communities, email tools, agency CRMs and memberships are left out, and so
 * are prices the page did not show). emailCap: emails a month the plan sends
 * (null for "unlimited"; 0 when the page states no email marketing, which is
 * read as none). "payments" marks the sell-a-link tools with no storefront,
 * courses or community (a lower preference in the model, an assumption).
 */
export function competitors(): Competitor[] {
  const d = dataset();
  const unl = null;
  const rows: { vendor: string; plan: string; emailCap: number | null; kind?: "payments"; monthOverride?: number }[] = [
    { vendor: "Stan", plan: "Creator", emailCap: 0 }, { vendor: "Stan", plan: "Creator Pro", emailCap: unl },
    { vendor: "Beacons", plan: "Free", emailCap: 50 }, { vendor: "Beacons", plan: "Creator", emailCap: 500 },
    { vendor: "Beacons", plan: "Creator Plus", emailCap: unl }, { vendor: "Beacons", plan: "Creator Max", emailCap: unl },
    { vendor: "Kajabi", plan: "Basic", emailCap: unl }, { vendor: "Kajabi", plan: "Growth", emailCap: unl }, { vendor: "Kajabi", plan: "Pro", emailCap: unl },
    { vendor: "ClickFunnels", plan: "Launch", emailCap: 50_000 }, { vendor: "ClickFunnels", plan: "Scale", emailCap: 300_000 }, { vendor: "ClickFunnels", plan: "Optimize", emailCap: 750_000 },
    { vendor: "Teachable", plan: "Starter", emailCap: 0 }, { vendor: "Teachable", plan: "Builder", emailCap: 0 }, { vendor: "Teachable", plan: "Growth", emailCap: 0 },
    { vendor: "Thinkific", plan: "Basic", emailCap: unl }, { vendor: "Thinkific", plan: "Start", emailCap: unl }, { vendor: "Thinkific", plan: "Grow", emailCap: unl },
    // Podia's page states only the price billed yearly; that per-month figure is used.
    { vendor: "Podia", plan: "Mover", emailCap: 400 }, { vendor: "Podia", plan: "Shaker", emailCap: 2_000 }, { vendor: "Podia", plan: "Earthquaker", emailCap: 4_000 },
    { vendor: "Systeme.io", plan: "Startup", emailCap: unl }, { vendor: "Systeme.io", plan: "Webinar", emailCap: unl }, { vendor: "Systeme.io", plan: "Unlimited", emailCap: unl },
    { vendor: "Payhip", plan: "Free Forever", emailCap: 0, kind: "payments" }, { vendor: "Payhip", plan: "Plus", emailCap: 0, kind: "payments" }, { vendor: "Payhip", plan: "Pro", emailCap: 0, kind: "payments" },
    { vendor: "Gumroad", plan: "Direct sales", emailCap: 0, kind: "payments" }, { vendor: "Whop", plan: "Pay-as-you-go", emailCap: 0, kind: "payments" },
    { vendor: "Lemon Squeezy", plan: "Pay per transaction", emailCap: 0, kind: "payments" }, { vendor: "Ko-fi", plan: "Gold", emailCap: 0, kind: "payments" },
  ];
  return rows.map((r) => {
    const v = d.vendors.find((x) => x.name === r.vendor)!;
    const p = v.plans.find((x) => x.name === r.plan)!;
    const monthly = p.monthlyUsd ?? p.perMonthBilledYearlyUsd;
    if (monthly == null || p.feeOnSalePct == null && r.vendor !== "Thinkific") throw new Error(`${r.vendor} ${r.plan}: no stated price or fee`);
    return {
      id: `${r.vendor} ${r.plan}`, vendor: r.vendor, plan: r.plan, monthlyUsd: monthly,
      // Thinkific's page names no fee on a sale beyond processing; read as none.
      feeBps: Math.round((p.feeOnSalePct ?? 0) * 100), feeFixedCents: Math.round((p.feeFixedUsd ?? 0) * 100),
      includesProcessing: p.feeIncludesProcessing === true, emailCap: r.emailCap, kind: r.kind ?? "platform", sources: v.sources,
    };
  });
}

// ------------------------------------------------------------- scenarios

/**
 * Every parameter of the demand model, each a stated assumption with its
 * range; none is a measurement (no sale has been open). The named scenarios
 * cross the three populations with three price sensitivities and three
 * preferences for Marktmorgen; the Monte Carlo draws every parameter.
 */
/** Company fixed costs the analysis can name: half of Delaware ($400), California ($800) and the owner's INSS ($4,520.30), from docs/tax-uncertainty.md. */
export const SHARED_FIXED_ANNUAL_CENTS = Math.round((40_000 + 80_000 + 452_030) / 2);
/**
 * The free pool's base places (lib/free-pool-rules.ts FREE_POOL_BASE_STORES), each at the worst window a store
 * that pays nothing can cost (tests/plan-cost-registry.ts nonPayingWorst): "a fixed cost, covered by the minimum
 * paid base", which the company pays whatever its payers. The places added per paying store are inside each
 * plan's free-share line.
 */
export const FREE_POOL_FIXED_MONTHLY_CENTS = Math.ceil(FREE_POOL_BASE_STORES * nonPayingWorst() * 100);
/** Every fixed cost the analysis can name, a month: the shared ones and the free pool's base places. The registered agent, domains, tools and the funded-exposure ceiling (docs/funded-exposure-review.md) are not reviewed here: MODEL.company.unreviewedFixedCents draws them. */
export const NAMED_FIXED_MONTHLY_CENTS = Math.round(SHARED_FIXED_ANNUAL_CENTS / 12) + FREE_POOL_FIXED_MONTHLY_CENTS;

export const MODEL = {
  /**
   * Price sensitivity: utility falls by eta for each natural-log unit of a creator's all-in monthly cost. Named at
   * 1, 2 and 4, the base 2 (docs/research/demand-evidence-v2-2026-10-18.json: a randomized SMB subscription price test,
   * NBER w23775, and Tellis's 1988 meta-analysis put category and brand elasticities about there).
   */
  eta: [1, 2, 4],
  /**
   * Marktmorgen's preference against a competitor platform of the same cost, in log-odds: a new brand with no reviews
   * (−1.5: Spiegel Research Center 2017, reviews raised conversion 2.9 to 4.8 times), a smaller handicap (−0.7, the
   * base), even (0). Nothing supports a new entrant above its incumbents.
   */
  asc: [-1.5, -0.7, 0],
  /** The base scenario of the program and of every table that names one. */
  base: { eta: 2, asc: -0.7 },
  /** The Monte Carlo's ranges, each drawn uniformly (log-uniformly where marked): every parameter of the model at once. */
  mc: {
    eta: [1, 5.5], asc: [-1.5, 0.3], paymentsAsc: [-2, 0], hassleUsd: [2, 10],
    aovUsd: [15, 70], conversion: [0.015, 0.08], emailsPerOrder: [10, 150], usage: [0.1, 0.7],
    churnFloor: [0.01, 0.03], churnCap: [0.15, 0.35], sigmaScale: [0.85, 1.15],
    logUniform: ["aovUsd", "conversion", "emailsPerOrder"],
  },
  /** The preference for a payments-only tool (no storefront, courses or community) against a creator platform, in log-odds. */
  paymentsAsc: -1,
  /** Dollars a month added to every all-in cost inside the logarithm, so a tool that costs nothing is not infinitely preferred. */
  hassleUsd: 5,
  /** Average order value, dollars (Stan: over half of its GMV from downloads priced $4 to $30, sacra-stan-2026). */
  aovUsd: { base: 30, low: 15, high: 70 },
  /** Orders per store visit. */
  conversion: { base: 0.025, low: 0.015, high: 0.08 },
  /** A creator selling at least this much a month keeps an email list and sends to it. */
  emailFromUsd: 1_000,
  /** List emails a month per order a month, for those who email. */
  emailsPerOrder: { base: 30, low: 10, high: 150 },
  /** Share of every allowance a paying store uses on average (the floor is at full use; this is only for the expected profit). */
  usage: { base: 0.3, low: 0.15, high: 0.6 },
  /** Share of paying customers on the yearly payment (each leaves a twelfth of its yearly net a month). No sale has been open; the Monte Carlo draws it. */
  // docs/research/demand-evidence-v2-2026-10-18.json yearlyShare: RevenueCat SOSA 2025, yearly is 20.7% of Business
  // app subscriptions and 41.4% of all; Paddle models 10-20% uptake; no creator-tool figure exists.
  yearlyShare: { base: 0.25, low: 0.1, high: 0.45 },
  /** Monthly churn: floor + (cap − floor) × cost / (cost + sales); Stan's 13% a month (sacra-stan-2024) at its $29 price and typical sales sits inside it. */
  churn: { base: [0.02, 0.25], low: [0.01, 0.15], high: [0.03, 0.35] },
  /** Months the profit of one month's cohort is counted over. */
  horizon: { base: 24, values: [12, 24, 36] },
  /** A store needs at most this many packs a month before it is treated as unable to use the plan. */
  maxPacks: 20,
  monteCarloDraws: 4_000,
  seed: 20_261_018,
  /**
   * The owner's no-loss rule (18 October 2026, 17:36: "obviously I want
   * profit, but the main thing is not to have a loss, because I have no money
   * to sustain the company at a loss"). Slow-growth cash scenarios, the worst
   * case for each design: a fixed number of new paying customers a month
   * whatever the design, every one on the design's plan that leaves the least
   * (worstNetPerPayerCents, full use, after the profit tax: conservative,
   * since a company at a loss pays no profit tax), Stan's measured gross churn
   * of 13% a month (sacra-stan-2024, another product's figure), the fixed
   * costs from the first month. A design is admitted only if it covers the
   * named fixed costs within the months in the slowest scenario; among those,
   * the designs whose cash at risk there is within the tolerance of the
   * safest are equally safe, and the one with the highest expected profit is
   * chosen. $500 a month is an assumption for the unreviewed agent, domains
   * and tools, shown, not used to choose.
   */
  /**
   * The owner's "não cometer o erro do stan" (18 October 2026, 17:46), as a
   * tested criterion. Stan's documented error (sacra-stan-2024,
   * sacra-stan-2026): one fixed price with nothing that grows with the
   * creator's sales, an entry most creators cannot cover, ARPC falling and
   * 13% churn a month. A design passes when (1) its entry plan costs at most
   * half of the monthly sales of the median creator among those who pay a
   * platform (the platform-customers population), and (2) what a subscriber
   * pays Marktmorgen grows with its sales: prepaid packs on, at least three
   * plans, and the model's revenue per subscriber in the highest sales bin
   * anyone subscribes in at least three times the lowest's. Commission is not
   * required (it is counted as zero in the floor and COMMISSION_LIVE is off).
   */
  antiStan: { population: "platform-customers", entryShareOfMedian: 0.5, minPlans: 3, growthRatio: 3 },
  /**
   * The company over its first 60 months, the owner's final objective (18
   * October 2026): "lucro máximo com a menor chance de prejuízo", with (b)
   * "the company never runs at a loss: fixed costs covered and 60%
   * consolidated from a minimum paying base reachable within 60 months in the
   * worst scenario". Every figure here is an assumption with its range (no
   * sale has been open):
   *
   *   - reach: creators a month who choose a creator platform with
   *     Marktmorgen among the alternatives of the model (the logit's market,
   *     before anyone picks), log-uniform between low and high; it grows
   *     linearly from launch to its full level over rampMonths;
   *   - fixed costs: the named ones (NAMED_FIXED_MONTHLY_CENTS, a lower
   *     bound) plus an unreviewed allowance for the registered agent,
   *     domains and tools, uniform between low and high;
   *   - loss, in one draw: the 60 months' cumulative cash is negative, or at
   *     month 60 the paying customers' full-use room above 60% (commission
   *     counted as zero) does not cover the month's fixed costs, i.e. the
   *     company is not yet at 60% consolidated. Both are counted after each
   *     payer's own profit tax, and the fixed costs are not deducted from it
   *     (conservative: a company at a loss pays no profit tax);
   *   - the worst scenario of (b), deterministic: reach at its low end,
   *     the slowest ramp, the high churn, the fixed costs with the whole
   *     unreviewed allowance, and the named demand scenario in which the
   *     design keeps the fewest payers at month 60; the minimum base is the
   *     repository's (lib/customer-base-rules.ts: every customer on the
   *     design's least plan, at full use);
   *   - the choice: among the designs that keep today's three plans and
   *     meet the anti-Stan criterion (and (b), when any does), the lowest
   *     probability of loss p*; the highest expected 60-month profit among
   *     designs within lossTolerance of p*.
   *
   * Every design is screened on `draws` draws; the ones that could be chosen
   * under any relaxed rule are drawn again on `finalDraws` fresh draws (a new
   * seed), and only those are used to choose, so the minimum is not the
   * luckiest of many noisy estimates.
   */
  company: {
    months: 60,
    // Creators a month reaching a pricing page with Marktmorgen among the alternatives, at full ramp, and the months
    // to get there (docs/research/demand-evidence-v2-2026-10-18.json reach and reachGrowth: TrustMRR's median verified
    // project implies about 25 to 225; Senja's self-reported 16,500 to 18,800 visits a month by its second year).
    reach: { low: 30, high: 10_000 },
    rampMonths: { low: 6, high: 60 },
    // Not reviewed here, so drawn: at least half of Hazelsong's $125 registered agent and Marktmorgen's own host and
    // mail plans at Vercel Pro's and Resend Pro's $20 a month each (the figures Hazelsong's cost table carries;
    // Marktmorgen's own invoices are not in this repository), $45 in all; at most $500 more.
    unreviewedFixedCents: { low: 4_500, high: 50_000 },
    draws: 1_000,
    finalDraws: 10_000,
    seed: 20_261_019,
    finalSeed: 20_261_020,
    lossTolerance: 0.01,
    finalWindow: 0.05,
  },
  noLoss: {
    churn: 0.13,
    newPayersPerMonth: [1, 2, 5],
    months: 36,
    fixedMonthlyCents: [NAMED_FIXED_MONTHLY_CENTS, 50_000],
    toleranceCents: 50_000,
    toleranceShare: 0.1,
  },
} as const;

/** One slow-growth cash path: payers grow by a fixed number a month and churn; the company keeps each payer's worst net and pays the fixed costs. */
export function cashPath(netCents: number, newPerMonth: number, fixedCents: number, months: number = MODEL.noLoss.months, churn: number = MODEL.noLoss.churn) {
  let payers = 0, cum = 0, trough = 0, breakEven: number | null = null, recovered: number | null = null;
  for (let t = 1; t <= months; t += 1) {
    payers = payers * (1 - churn) + newPerMonth;
    const flow = payers * netCents - fixedCents;
    cum += flow;
    trough = Math.min(trough, cum);
    if (breakEven === null && flow >= 0) breakEven = t;
    if (recovered === null && breakEven !== null && cum >= 0) recovered = t;
  }
  return { breakEvenMonth: breakEven, recoveredMonth: recovered, troughCents: trough, endCents: cum, steadyPayers: newPerMonth / churn, payersToCover: netCents > 0 ? Math.ceil(fixedCents / netCents) : null };
}
export const designWorstNet = (plans: string[]) => Math.min(...plans.map((id) => candidateById(id).worstNetPerPayerCents));
/** The no-loss rule applied to a design: its worst-case path at the slowest growth and the named fixed costs. */
export function noLossOf(plans: string[]) {
  const net = designWorstNet(plans);
  const worst = cashPath(net, MODEL.noLoss.newPayersPerMonth[0], MODEL.noLoss.fixedMonthlyCents[0]);
  return { net, worst, admitted: worst.breakEvenMonth !== null, lossCents: -worst.troughCents };
}
/** The anti-Stan criterion of MODEL.antiStan, read from the solver's revenue by sales bin. */
export function antiStan(d: DesignResult): { entryUsd: number; limitUsd: number; affordable: boolean; growth: number | null; grows: boolean } {
  const A = MODEL.antiStan;
  const entryUsd = Math.min(...d.plans.map((id) => candidateById(id).monthCents)) / 100;
  const limitUsd = A.entryShareOfMedian * populations().find((p) => p.id === A.population)!.medianUsd;
  const rev = d.revenueBySales.filter((x): x is number => x !== null);
  const growth = rev.length >= 2 && rev[0] > 0 ? rev[rev.length - 1] / rev[0] : null;
  return { entryUsd, limitUsd, affordable: entryUsd <= limitUsd, growth, grows: d.packs && d.plans.length >= A.minPlans && rev.length >= 2 && rev[rev.length - 1] >= A.growthRatio * rev[0] };
}
/** The company's 60 months for one design over a set of draws (scripts/pricing-study-v2.py company_monte_carlo). */
export type CompanyStats = { draws: number; expected: number; simulatedMean: number; p5: number; p50: number; p95: number; pLoss: number; pCashLoss: number; pNotConsolidated: number; se: number; pLossByReach: (number | null)[]; reachBands: number[];
  /** The lowest cumulative cash of each draw's expected month-by-month path (at most 0), its 5th percentile and median, and the share of draws below minus each level in dollars (final draws only). */
  troughP5?: number; troughP50?: number; pTroughBelow?: Record<string, number> };
/** Rule (b) in its worst scenario (scripts/pricing-study-v2.py worst_reach_needed). */
export type WorstB = { minimumBase: number | null; payers60PerReach: number; reachNeeded: number | null; reachNeededMix: number | null; scenario: string | null; meets: boolean };
export const isStanProof = (d: DesignResult) => { const a = antiStan(d); return a.affordable && a.grows; };
export const noCommission = (d: DesignResult) => d.plans.every((id) => candidateById(id).commissionBps === 0);
export type Filter = (d: DesignResult) => boolean;
/** The pools the rule is applied to: the owner's rules (today's three kept, not Stan's error, and rule (b) when any design meets it), each relaxed alone, and none. */
export function pools(ruleBFeasible: boolean): Record<string, Filter[]> {
  const kept: Filter = (d) => d.admissible;
  const meetsB: Filter = (d) => d.company.worst?.meets === true;
  const main = [kept, isStanProof, ...(ruleBFeasible ? [meetsB] : [])];
  return {
    recommended: main,
    withoutCommission: [...main, noCommission],
    withoutKeepingToday: main.filter((f) => f !== kept),
    withoutAntiStan: main.filter((f) => f !== isStanProof),
    withoutRuleB: [kept, isStanProof],
    none: [],
    noneWithoutCommission: [noCommission],
  };
}
export const inPool = (designs: DesignResult[], filters: Filter[]) => designs.filter((d) => filters.every((f) => f(d)));
/** The owner's rule (18 October 2026): the lowest probability of loss p*, then the highest expected 60-month profit within MODEL.company.lossTolerance of p* (ties: the lower probability, then the id). Only designs drawn again on the final draws count. */
export function chooseDesign(designs: DesignResult[]): { chosen: DesignResult; pStar: number; eligible: DesignResult[] } {
  const pool = designs.filter((d) => d.company.final);
  const pStar = Math.min(...pool.map((d) => d.company.final!.pLoss));
  const eligible = pool.filter((d) => d.company.final!.pLoss <= pStar + MODEL.company.lossTolerance + 1e-12);
  const r2 = (x: number) => Math.round(x * 100) / 100;
  const chosen = [...eligible].sort((a, b) => r2(b.company.final!.expected) - r2(a.company.final!.expected) || a.company.final!.pLoss - b.company.final!.pLoss || (a.id < b.id ? -1 : 1))[0];
  return { chosen, pStar, eligible };
}
/** Designs no other beats on both expected profit and probability of loss, from the safest up. */
export function frontierOf(designs: DesignResult[]): DesignResult[] {
  const pool = designs.filter((d) => d.company.final).sort((a, b) => a.company.final!.pLoss - b.company.final!.pLoss || b.company.final!.expected - a.company.final!.expected || (a.id < b.id ? -1 : 1));
  const out: DesignResult[] = [];
  let best = -Infinity;
  for (const d of pool) if (d.company.final!.expected > best + 1e-9) { out.push(d); best = d.company.final!.expected; }
  return out;
}
/** Every choice the document reports, from the output's own figures: the recommendation, without commission, each rule relaxed, and the next design on the frontier. */
export function ownersChoice(out: StudyOutput) {
  const P = pools(out.screened.ruleBFeasible);
  const choices = Object.fromEntries(Object.entries(P).map(([k, f]) => [k, chooseDesign(inPool(out.designs, f))])) as Record<keyof ReturnType<typeof pools>, ReturnType<typeof chooseDesign>>;
  const rec = choices.recommended.chosen;
  const frontier = frontierOf(inPool(out.designs, P.recommended));
  const next = frontier.find((d) => d.company.final!.expected > rec.company.final!.expected + 1e-9) ?? null;
  const maxExpected = [...inPool(out.designs, P.recommended).filter((d) => d.company.final)].sort((a, b) => b.company.final!.expected - a.company.final!.expected)[0];
  return { choices, rec, frontier, next, maxExpected };
}

/** The printed lines a plan's room above its floor could raise, for the linear program: one unit's monthly cost at full use, and its figure today. */
export const LP_LINES = ["visits", "orders", "list-email", "storage", "video", "transactional-email", "store-email"] as const;
/** The keys under which a competitor's page states each line (docs/research/pricing-dataset-v2-2026-10-18.json). */
const PRINT_KEYS: Record<(typeof LP_LINES)[number], string[]> = {
  visits: ["visitors"], orders: ["customers", "students"], "list-email": ["emailsPerMonth", "emailSubscribers"],
  storage: ["storage", "storageGb", "videoStorage"], video: ["video", "videos", "videoBandwidthGbPerMonth", "streamingHoursPerMonth"],
  "transactional-email": [], "store-email": [],
};
export function lpInput(): { tier: Tier; lines: { id: string; figure: number; unitMonthCents: number; printShare: number }[] }[] {
  const plans = competitors().map((c) => dataset().vendors.find((v) => v.name === c.vendor)!.plans.find((p) => p.name === c.plan)!);
  return TIERS.map((tier) => ({
    tier,
    lines: LP_LINES.map((id) => {
      const fig = figures(tier)[id][0];
      const usd = COST_LINES.find((l) => l.id === id)!.monthlyUsd(tier);
      const keys = PRINT_KEYS[id];
      const printShare = keys.length ? plans.filter((p) => keys.some((k) => p.limits[k] != null)).length / plans.length : 0;
      return { id, figure: id === "storage" ? fig / GB : fig, unitMonthCents: fig > 0 ? (usd * 100) / (id === "storage" ? fig / GB : fig) : 0, printShare };
    }),
  }));
}

export type StudyInput = {
  readOn: string; processing: { bps: number; fixedCents: number };
  lp: ReturnType<typeof lpInput>;
  commissionKeep: { sizing: number; mostTax: number; unreviewedBps: number };
  bins: { middles: number[]; edges: (number | null)[] };
  populations: (Population & { weights: number[] })[];
  candidates: Candidate[]; todayIds: string[];
  templates: Record<Template, { title: string; today: boolean }>; templateOrder: Template[];
  packs: ReturnType<typeof packs>;
  competitors: Competitor[];
  model: typeof MODEL;
  namedFixedMonthlyCents: number;
};
export function studyInput(): StudyInput {
  return {
    readOn: READ_ON,
    processing: { bps: PROVIDER_FEES.stripe.cardBps, fixedCents: PROVIDER_FEES.stripe.fixedCents },
    lp: lpInput(),
    commissionKeep: { sizing: commissionKeep(SIZING_READING), mostTax: commissionKeep(MOST_TAX_READING), unreviewedBps: COMMISSION_UNREVIEWED_BPS },
    bins: { middles: binMiddles(), edges: BIN_EDGES.map((e) => (Number.isFinite(e) ? e : null)) },
    populations: populations().map((p) => ({ ...p, weights: binWeights(p) })),
    candidates: candidates(), todayIds: TODAY_IDS,
    templates: Object.fromEntries(TEMPLATE_ORDER.map((t) => [t, { title: TEMPLATES[t].title, today: TEMPLATES[t].today }])) as StudyInput["templates"],
    templateOrder: TEMPLATE_ORDER,
    packs: packs(), competitors: competitors(), model: MODEL,
    namedFixedMonthlyCents: NAMED_FIXED_MONTHLY_CENTS,
  };
}

// ------------------------------------------------------------- the solver's output

export type DesignResult = {
  id: string; label: string; plans: string[]; packs: boolean; origin: string; names: string[]; admissible: boolean;
  profitByScenario: Record<string, number>; meanProfit: number; worstRegret: number; meanRegret: number;
  commissionShare: number; subscribersPer1000: number; baseProfit: number;
  monteCarlo: { mean: number; p5: number; p50: number; p95: number; probBest: number } | null;
  horizon: Record<string, number>;
  revenueBySales: (number | null)[];
  company: { screen: CompanyStats | null; final: CompanyStats | null; gate?: CompanyStats | null; worst: WorstB | null };
};
export type StudyOutput = {
  solver: string;
  scenarios: { id: string; population: string; eta: number; asc: number }[];
  milp: { k: number; packs: boolean; admissibleOnly: boolean; status: string; objective: number; value: number; plans: string[]; bruteForce: number | null; seconds: number }[];
  designs: DesignResult[];
  recommended: string;
  regretBest: string;
  bestWithoutCommission: string;
  nextFrontier: string | null;
  choice: Record<string, { design: string; pStar: number }>;
  frontier: string[];
  screened: { designs: number; draws: number; finalDesigns: number; finalDraws: number; grid: Record<string, number>; ruleBFeasible: boolean; leastReachNeeded: number | null; leastReachNeededDesign: string };
  companyCheck: { design: string; reach: number; rampMonths: number; fixedCents: number; population: string; expectedCashUsd: number; payers60: number; room60Usd: number };
  paretoByCount: { k: number; admissibleOnly: boolean; design: string; meanProfit: number; worstRegret: number }[];
  hypothesis: { design: string; label: string; meanProfit: number; worstRegret: number; commissionShare: number; subscribersPer1000: number }[];
  elasticity: { plan: string; byScenario: Record<string, number> }[];
  sensitivity: { parameter: string; low: number; base: number; high: number }[];
  lp: { plan: string; roomCents: number; raised: { line: string; from: number; to: number }[]; status: string }[];
  monteCarloDraws: number;
};
export const studyOutput = (): StudyOutput => readJson<StudyOutput>(OUTPUT_FILE);
export const candidateById = (id: string) => candidates().find((c) => c.id === id)!;

/** A design's plans checked again with the repository's own code: 60% at full use with room on both intervals, and below 60% under the most-tax reading. */
export function verifiedDesign(plans: string[]): { id: string; keeps: boolean; month: UnitResult; year: UnitResult; mostTax: UnitResult }[] {
  return plans.map((id) => {
    const c = candidateById(id);
    return {
      id, keeps: keepsWithRoom(c.base, c.monthCents, c.share),
      month: planUnit(c.base, "month", c.monthCents, c.share), year: planUnit(c.base, "year", c.monthCents, c.share),
      mostTax: planUnit(c.base, "month", c.monthCents, c.share, MOST_TAX_READING),
    };
  });
}

/** Paying customers needed per $100 a month of fixed cost at a plan's price and full use (lib/customer-base-rules.ts); null when none suffices. */
export function basePerFixed(id: string, monthlyFixedCents = 10_000): number | null {
  const c = candidateById(id);
  return baseForPlan(c.base, c.monthCents, c.share, monthlyFixedCents);
}
export function baseForPlan(base: Tier, monthCents: number, share: number, monthlyFixedCents: number): number | null {
  const unit = (cycle: Cycle) => {
    const u = planUnit(base, cycle, monthCents, share);
    return {
      months: (cycle === "year" ? 12 : 1) as 1 | 12,
      scenario: {
        collectedRevenueCents: u.revenueCents, refundableRevenueCents: 0, taxesCeilingCents: u.taxCents,
        costCeilings: { infrastructure: u.usageCents, storageDeliveryVideo: 0, email: 0, ai: 0, paymentAndFx: u.feeCents + u.remittanceCents, supportAndOperations: 0, acquisitionAndAffiliates: 0, fixedBusinessCosts: 0, postCancellation: 0, refundAndDisputeFees: u.refundReserveCents + u.disputeReserveCents, other: 0 },
        allCostsBounded: true, allTaxesReviewed: true, revenueCollected: true,
      },
    };
  };
  const r = assessMinimumCustomerBase([unit("month"), unit("year")], {
    monthlyFixedCostsCeilingCents: monthlyFixedCents, monthlyFixedTaxesCeilingCents: 0, allFixedCostsBounded: true, allFixedTaxesReviewed: true,
    fixedCostsEvidence: "hypothetical, to scale the count; not a reviewed budget", fixedTaxEvidence: "hypothetical: none", reviewedPayingCustomers: 0,
  });
  return r.status === "calculated" ? r.minimumCustomers : null;
}

/** The paying customers a design needs before the company keeps 60% after a monthly fixed cost: the worst of its plans, every customer on it (lib/customer-base-rules.ts). */
export function designBase(plans: string[], monthlyFixedCents: number): number | null {
  let worst = 0;
  for (const id of plans) {
    const n = basePerFixed(id, monthlyFixedCents);
    if (n === null) return null;
    worst = Math.max(worst, n);
  }
  return worst;
}


// ------------------------------------------------------------- composition

/**
 * Which feature goes in which plan (the owner, 18 October 2026, 17:45:
 * "preço, quantidades de planos, valor dos planos, limites dos planos,
 * composição dos planos"). The rule applied: a feature that costs nothing per
 * use is in every plan, because no data here can show that gating one raises
 * upgrade revenue without hurting retention (no sale has been open); a feature
 * that costs per use sits only where its worst-case cost keeps 60% at full
 * use, through the plan's figure; a feature whose per-use cost has not been
 * reviewed stays where it is, since an unknown cost counts as failing.
 * Competitor cells say only what the page read says: "Pro only" for Stan's
 * Creator Pro list (stan-blog), "listed from Shaker" for Podia's plan rows,
 * "—" where the page does not say.
 */
export type CompositionRow = { feature: string; cost: "none" | "per use" | "not reviewed"; evidence: string; placement: string; reason: string; competitors: Record<string, string> };
export const COMPETITOR_COLUMNS = ["Stan Creator $29", "Stan Creator Pro $99", "Podia Mover", "Podia Shaker", "Beacons Creator $10", "Beacons Creator Plus $30", "Kajabi Basic $179"] as const;
const everyPlan = "every plan";
const stanPro = { "Stan Creator $29": "no (Creator Pro)", "Stan Creator Pro $99": "yes" };
export function composition(): CompositionRow[] {
  const zero = (feature: string, evidence: string, competitors: Record<string, string> = {}): CompositionRow => ({ feature, cost: "none", evidence, placement: everyPlan, reason: "costs nothing per use: in every plan", competitors });
  return [
    zero("Storefront, products, digital downloads", "lib/store.ts, lib/product-file.ts", { "Stan Creator $29": "yes", "Stan Creator Pro $99": "yes" }),
    zero("Courses", "lib/course.ts", { "Stan Creator $29": "yes", "Stan Creator Pro $99": "yes" }),
    zero("Memberships and recurring subscriptions", "lib/membership-access.ts, lib/product-recurring.ts"),
    zero("Calls and booking", "lib/calls.ts"),
    zero("Community", "lib/community.ts"),
    zero("Lead magnets and email collection", "lib/free.ts"),
    zero("Discount codes", "lib/discount.ts", stanPro),
    zero("Upsells and order bumps", "lib/upsell.ts, lib/checkout-ask.ts", { ...stanPro, "Podia Shaker": "listed from Shaker" }),
    zero("Payment plans", "lib/product-recurring.ts, lib/payment-methods.ts"),
    zero("Funnels", "lib/funnel.ts"),
    zero("Affiliates", "lib/affiliates.ts", { ...stanPro, "Podia Shaker": "listed from Shaker" }),
    zero("Contact import", "lib/imports.ts"),
    zero("Meta, Google, Pinterest and TikTok pixels", "lib/pixels.ts", stanPro),
    zero("Store analytics", "lib/stats.ts"),
    zero(`Several stores per account (up to ${MAX_STORES_PER_ACCOUNT}, each on its own plan)`, "lib/store.ts MAX_STORES_PER_ACCOUNT"),
    { feature: "Marktmorgen's name off the foot of the page", cost: "none", evidence: "lib/plan.ts ProFeature \"branding\"", placement: `${PLAN_TITLES.pro} and ${PLAN_TITLES.scale} (as today)`, reason: "costs nothing, but the name is how a store brings the next creator (lib/plan.ts); kept gated as the one exception, an owner decision, since no data measures either side", competitors: {} },
    { feature: "Own domain", cost: "not reviewed", evidence: "lib/domains.ts", placement: `${PLAN_TITLES.pro} and ${PLAN_TITLES.scale} (as today)`, reason: "the host's per-domain cost and limits are not reviewed here: an unknown cost counts as failing, so it does not move down", competitors: {} },
    { feature: "Email to a list (campaigns and sequences)", cost: "per use", evidence: "lib/broadcasts.ts, lib/flows.ts, lib/plan.ts monthlyEmails", placement: "by figure: none on Start and Store, a sized figure on Growth, today's on Studio and Scale; prepaid list-email packs only where list email is included", reason: "$0.90 per 1,000 sends: where the worst case keeps 60%", competitors: { ...stanPro, "Podia Mover": "100 subscribers", "Podia Shaker": "500 subscribers", "Beacons Creator $10": "500 a month", "Beacons Creator Plus $30": "\"unlimited\"", "Kajabi Basic $179": "\"unlimited\"" } },
    { feature: "AI writing jobs and answers", cost: "per use", evidence: "tests/plan-cost-registry.ts ai line", placement: "by figure: none on Start and Store, a sized figure on Growth, today's on Studio and Scale", reason: "a model call per use: where the worst case keeps 60%", competitors: { "Beacons Creator $10": "300 daily credits", "Beacons Creator Plus $30": "\"unlimited\" daily credits", "Kajabi Basic $179": "0 credits" } },
    { feature: "Storage and video hours", cost: "per use", evidence: "tests/plan-cost-registry.ts storage and video lines", placement: "every plan, by figure", reason: "billed per GB and per hour: the figure keeps 60%", competitors: {} },
    { feature: "Prepaid packs (visits, orders, list email)", cost: "per use", evidence: "tests/pricing-usage-proposal-table.ts PACKS", placement: "every plan, bought before use and stopping at zero", reason: "each pack keeps 60% on its own payment, used in full", competitors: {} },
    { feature: `Store assistant add-on (${"$"}${ASSISTANT_PRICE_CENTS / 100} a month)`, cost: "per use", evidence: "lib/store-assistant.ts", placement: "any paid plan, as an add-on", reason: "its own price keeps 60% with its pool reserved before every call", competitors: {} },
    { feature: `AI captions (${"$"}${CENTS_PER_MINUTE / 100} a minute a language, at least ${"$"}${MIN_CENTS / 100})`, cost: "per use", evidence: "lib/auto-captions.ts", placement: "any paid plan, prepaid per order", reason: "charged by amount before the work", competitors: {} },
  ];
}

/** What one plan of a design carries of a composition row: "yes", "no", its figure, or "add-on". */
export function planCell(row: CompositionRow, c: Candidate, packsOn: boolean): string {
  const studioOrScale = c.template === "pro" || c.template === "scale";
  if (row.cost === "none" && row.placement === everyPlan) return "yes";
  if (row.feature.startsWith("Marktmorgen's name off") || row.feature === "Own domain") return studioOrScale ? "yes" : "no";
  if (row.feature.startsWith("Email to a list")) return c.figures.listEmails ? `${c.figures.listEmails.toLocaleString("en-US")} a month` : "no";
  if (row.feature.startsWith("AI writing")) return c.figures.aiJobs ? `${c.figures.aiJobs} jobs, ${c.figures.aiAnswers} answers a month` : "no";
  if (row.feature.startsWith("Storage")) return `${c.figures.storageGb.toLocaleString("en-US")} GB, ${c.figures.videoHours} video hour${c.figures.videoHours === 1 ? "" : "s"}`;
  if (row.feature.startsWith("Prepaid packs")) return packsOn ? "yes" : "no";
  return "add-on";
}
/** The competitor plans each recommended plan is set beside: the store-capable leaders the owner named, at prices from Stan's entry to Kajabi's. */
export const CLOSEST: [string, string][] = [
  ["Stan", "Creator"], ["Stan", "Creator Pro"], ["Beacons", "Creator Plus"], ["Podia", "Shaker"], ["Teachable", "Starter"], ["Thinkific", "Basic"],
  ["Systeme.io", "Webinar"], ["Skool", "Pro"], ["ClickFunnels", "Launch"], ["Kajabi", "Basic"], ["Kajabi", "Growth"],
];

// ------------------------------------------------------------- the value check

export type ValueRow = { attribute: string; ours: number; competitor: string; theirs: number | "unlimited"; meets: boolean };
/** Our printed figures against every competitor plan in the price band (three quarters to four thirds of the price) that states the same attribute. */
export function valueCheck(id: string): ValueRow[] {
  const c = candidateById(id);
  const lo = (c.monthCents / 100) * 0.75, hi = (c.monthCents / 100) * (4 / 3);
  const ours: Record<string, number> = { emailsPerMonth: c.figures.listEmails, contacts: MAX_LEADS, seats: MAX_TEAM, products: MAX_PRODUCTS, storageGb: c.figures.storageGb };
  const rows: ValueRow[] = [];
  for (const v of dataset().vendors) for (const p of v.plans) {
    const price = p.monthlyUsd ?? p.perMonthBilledYearlyUsd;
    if (price == null || price < lo || price > hi) continue;
    for (const [attr, mine] of Object.entries(ours)) {
      const theirs = p.limits[attr];
      if (typeof theirs === "number") rows.push({ attribute: attr, ours: mine, competitor: `${v.name} ${p.name} ($${price})`, theirs, meets: mine >= theirs });
      else if (theirs === "unlimited") rows.push({ attribute: attr, ours: mine, competitor: `${v.name} ${p.name} ($${price})`, theirs: "unlimited", meets: false });
    }
  }
  return rows;
}

// ------------------------------------------------------------- the document

const usd = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
const money = (dollars: number) => `$${Math.round(dollars).toLocaleString("en-US")}`;
const pctOf = (bps: number) => `${(bps / 100).toFixed(2)}%`;
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
const num = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

function planWords(id: string): string {
  const c = candidateById(id);
  const size = c.size === "today" ? "" : ` (${c.size === "max" ? "largest size that keeps 60%" : "half that size"})`;
  return `${c.title.replace(" (new)", "")} ${usd(c.monthCents)}/mo${c.commissionBps ? ` + ${c.commissionBps / 100}% of sales` : ", 0% of sales"}${size}`;
}
function figureWords(c: Candidate): string {
  const f = c.figures;
  return `${num(f.visits)} visits, ${num(f.orders)} orders, ${num(f.listEmails)} list emails, ${f.aiJobs ? `${f.aiJobs} AI writing jobs and ${f.aiAnswers} answers` : "no AI"}, ${num(f.storageGb)} GB, ${f.videoHours} video hour${f.videoHours === 1 ? "" : "s"}, ${num(f.accessEmails)} access and ${num(f.storeEmails)} store emails a month`;
}
const scenarioWords = (id: string) => {
  const [pop, eta, asc] = id.split("|");
  return `${pop}, η ${eta.slice(3)}, preference ${asc.slice(3)}`;
};

export function renderPricingStudyV2(): string {
  const out = studyOutput();
  const input = studyInput();
  const d = dataset();
  const L: string[] = [];
  const push = (...xs: string[]) => L.push(...xs);
  const rec = out.designs.find((x) => x.id === out.recommended)!;
  const today = out.designs.find((x) => x.names.includes("today"))!;
  const fixedMonthly = Math.round(SHARED_FIXED_ANNUAL_CENTS / 12);
  const byId = new Map(out.designs.map((x) => [x.id, x]));
  const byName = (name: string) => out.designs.find((x) => x.names.includes(name))!;

  push("# Pricing study v2: plan count, prices, commission, limits and composition, 18 October 2026");
  push("");
  push("<!-- Generated by `node scripts/pricing-study-v2.mjs` from docs/research/pricing-dataset-v2-2026-10-18.json, tests/pricing-study-v2-table.ts and scripts/pricing-study-v2.py. Do not edit by hand: tests/pricing-study-v2.test.ts fails when this file, the program's input or its output is stale. -->");
  push("");
  push("**An analysis for the owner, not a change.** No price, limit, gate, commission switch or tax assumption in code changes with it; `PLANS_ON_SALE` stays false behind the tax gate (most-tax reading), the EU art. 9a gate and the commercial review. Every margin below is the repository's own (lib/receiving-costs.ts `unitUnder` under the sizing reading; the worst month of tests/plan-cost-registry.ts; lib/customer-base-rules.ts). Every competitor figure is in docs/research/pricing-dataset-v2-2026-10-18.json with its page and the day it was read. **Demand is unknown**: no sale has ever been open, so every profit figure is under labeled assumptions and scenarios, not a forecast.");
  push("");
  push("The owner's request (18 October 2026, verbatim): \"faça novamente as pesquisas para os dois produtos. use tudo de bom, inclusive estatistica, pesquisa operacional, programacao linear e tudo de bom e necessario. pesquise os limites de uso, e preços de cada plano dos dois produtos. veja quantos planos deve ser. para maximizar meu lucro. e eu oferecer tudo de bom dos maiores e mais ricos e poderosos concorrentes\". This document is Marktmorgen's.");
  push("");

  // ------------------------------------------------ the recommendation
  const oc = ownersChoice(out);
  const F = (x: DesignResult) => x.company.final!;
  const regretBest = byId.get(out.regretBest)!;
  const noComm = oc.choices.withoutCommission.chosen;
  const next = oc.next;
  const as = antiStan(rec);
  const co = MODEL.company;
  const nl = MODEL.noLoss;
  const [fNamed] = nl.fixedMonthlyCents;
  const fHigh = NAMED_FIXED_MONTHLY_CENTS + co.unreviewedFixedCents.high;
  const byPrice = (x: DesignResult) => [...x.plans].sort((a, b) => candidateById(a).monthCents - candidateById(b).monthCents);
  const ppt = (x: number) => `${(x * 100).toFixed(1)}%`;
  const pStar = oc.choices.recommended.pStar;
  push("## The recommendation");
  push("");
  push(`The owner's objective (18 October 2026): **the highest profit with the lowest chance of loss**, under his rules in this order: (a) **every paying customer keeps 60% alone at full use** (a candidate plan that does not, does not exist here; the commission counts as zero in that floor; prepaid only); **today's three plans and their printed figures are kept** (no visible limit cut); **not Stan's error** (an entry the median creator can afford, and revenue that grows with the creator's success); (b) **the company never runs at a loss**: fixed costs covered and 60% consolidated from a minimum paying base reachable within 60 months. The rule that chooses: among the designs that meet the rules, the lowest probability of loss p*; then the highest expected 60-month profit among the designs within ${ppt(co.lossTolerance)} of p*.`);
  push("");
  push(`**${rec.plans.length} plans${COMMISSION_LIVE ? "" : ", no share of sales"}:**`);
  push("");
  push("| Plan | Monthly / yearly | Share of sales | Included a month | Net at full use, monthly / yearly | Under the most-tax reading (the gate) | Room above 60% a payer leaves a month | Payers for 60% consolidated, all on this plan (named fixed costs / with the unreviewed allowance) | Today |");
  push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const id of byPrice(rec)) {
    const c = candidateById(id);
    const v = verifiedDesign([id])[0];
    const t = TEMPLATES[c.template];
    const todayPrice = t.today ? usd(PLAN_PRICES[t.base].month) : "new plan";
    push(`| ${c.title.replace(" (new)", "")}${t.today ? "" : " (new)"} | **${usd(c.monthCents)} / ${usd(yearOf(c.monthCents))}** | ${c.commissionBps / 100}% | ${figureWords(c)} | ${pctOf(v.month.netBps)} / ${pctOf(v.year.netBps)} | ${pctOf(v.mostTax.netBps)} | ${usd(Math.floor(c.headroomMonthCents))} | ${c.minimumBase.named ?? "none"} / ${c.minimumBase.withUnreviewed ?? "none"} | ${todayPrice} |`);
  }
  push("");
  push(`Prepaid packs: **${rec.packs ? "on" : "off"}**${rec.packs ? `, sold before use and stopping at zero: ${input.packs.map((p) => `${num(p.units)} ${p.raises} ${usd(p.priceCents)} (net ${usd(p.netCents)})`).join("; ")}. Each keeps 60% on its own payment, used in full.` : "."} Add-ons: the Store assistant stays at ${usd(ASSISTANT_PRICE_CENTS)} a month and AI captions at ${usd(CENTS_PER_MINUTE)} a minute a language (at least ${usd(MIN_CENTS)}), each keeping 60% on its own payment.`);
  push("");
  const rc = F(rec);
  push(`**The company over ${co.months} months** (${num(rc.draws)} Monte Carlo draws of every demand parameter, the reach, its ramp and the fixed costs; the model's units are dollars of cash after each payer's own profit tax and the fixed costs): expected **${money(rc.expected)}**, 5th to 95th percentile ${money(rc.p5)} to ${money(rc.p95)}, median ${money(rc.p50)}. **Probability of loss ${ppt(rc.pLoss)}** (± ${ppt(rc.se)}): of which the ${co.months} months' cash ends negative in ${ppt(rc.pCashLoss)} of the draws, and at month ${co.months} the paying customers' room above 60% does not yet cover the month's fixed costs (the company is not at 60% consolidated) in ${ppt(rc.pNotConsolidated)}. The lowest probability of loss among the designs that meet the rules is p* = ${ppt(pStar)}; ${oc.choices.recommended.eligible.length === 1 ? "only this design is" : `${oc.choices.recommended.eligible.length} designs are`} within ${ppt(co.lossTolerance)} of it${oc.choices.recommended.eligible.length === 1 ? "" : ", and this one earns the most of them"}. Today's price list with packs: expected ${money(F(byName("today + packs")).expected)}, probability of loss ${ppt(F(byName("today + packs")).pLoss)}; without packs ${money(F(today).expected)} and ${ppt(F(today).pLoss)}.`);
  push("");
  const G = (x: DesignResult) => x.company.gate!;
  const tb = (x: CompanyStats, k: string) => ppt(x.pTroughBelow![k]);
  const rg = G(rec);
  push(`**What the owner must carry first** (the same draws, sizing reading). Fixed costs are paid from the first month and payers arrive over the ramp, so cumulative cash falls before it rises. On each draw's expected month-by-month path (its own reach, ramp, demand and churn, without the arrivals' chance), the lowest point of cumulative cash is ${money(rc.troughP50!)} in the median draw and ${money(rc.troughP5!)} or lower in one draw in twenty; it goes below −$500 in ${tb(rc, "500")} of the draws, below −$2,000 in ${tb(rc, "2000")}, and below −$5,000 in ${tb(rc, "5000")}. Today's price list with packs: median ${money(F(byName("today + packs")).troughP50!)}, below −$5,000 in ${tb(F(byName("today + packs")), "5000")}.`);
  push("");
  push(`**Under the gate reading** (the most-tax reading of lib/tax-gate.ts, under which paid sales stay closed): every payer leaves about a fifth of what it leaves under the sizing reading, no plan keeps 60%, and so the company is never at 60% consolidated. On the same draws the recommendation's 60 months' cash is expected at ${money(rg.expected)} (median ${money(rg.p50)}), negative in ${ppt(rg.pCashLoss)} of the draws, its lowest point ${money(rg.troughP50!)} in the median draw and below −$5,000 in ${tb(rg, "5000")}; today's price list with packs, ${money(G(byName("today + packs")).expected)} and negative in ${ppt(G(byName("today + packs")).pCashLoss)}. **Every figure of this document is the sizing reading unless it says otherwise.**`);
  push("");
  const pops = input.populations;
  push(`**What the probability of loss measures.** It is mostly the second half: in ${ppt(rc.pNotConsolidated)} of the draws the payers' room above 60% does not yet cover the fixed costs at month ${co.months}, against ${ppt(rc.pCashLoss)} with negative cash. That half favors higher prices by arithmetic, not by demand: a plan at today's price sits a few tenths of a point above 60% (Store leaves ${usd(Math.floor(candidateById(TODAY_IDS[0]).headroomMonthCents))} a month above it), so it takes ${num(candidateById(TODAY_IDS[0]).minimumBase.named ?? 0)} Store payers to cover the named fixed costs, and a dearer plan needs fewer. The fixed costs are ${usd(NAMED_FIXED_MONTHLY_CENTS)} a month named (half of Delaware's, California's and the owner's INSS, ${usd(Math.round(SHARED_FIXED_ANNUAL_CENTS / 12))}; the free pool's ten base places at the worst a store that pays nothing can cost, ${usd(FREE_POOL_FIXED_MONTHLY_CENTS)}) plus ${usd(co.unreviewedFixedCents.low)} to ${usd(co.unreviewedFixedCents.high)} drawn for what is not reviewed (the registered agent, the host and mail plans, domains, and the reviewed funded-exposure ceiling of docs/funded-exposure-review.md, not reviewed in this study). **And it rests on the reach**, the one parameter with no measurement of Marktmorgen: drawn log-uniformly from ${num(co.reach.low)} to ${num(co.reach.high)} creators a month (TrustMRR's median verified project implies about 25 to 225; Senja reported 16,500 to 18,800 visits a month in its second year; docs/research/demand-evidence-v2-2026-10-18.json). The table by reach below is the honest reading: at low reach every design loses, at high reach the ones with room do not.`);
  push("");
  const aff = pops.map((p) => ({ p, limit: MODEL.antiStan.entryShareOfMedian * p.medianUsd }));
  push(`**The entry against each population's median** (the anti-Stan rule uses the platform customers'): ${aff.map(({ p, limit }) => `${p.label.split(" (")[0]}: half the median is ${usd(Math.round(limit * 100))}, the entry ${usd(as.entryUsd * 100)} ${as.entryUsd <= limit ? "passes" : "does not pass"}`).join("; ")}. Against the Gumroad sellers' median no plan that keeps 60% passes, since the lowest any plan can cost is about $23 a month (docs/pricing-study-v2-architecture-2026-10-18.md).`);
  push("");
  const w = rec.company.worst!;
  const leastNeed = byId.get(out.screened.leastReachNeededDesign);
  push(`**Rule (b) in its worst scenario.** Reach at its low end (${num(co.reach.low)} creators a month choosing a platform with Marktmorgen among the alternatives), the slowest ramp (${co.rampMonths.high} months), the high churn, the fixed costs with the whole unreviewed allowance (${usd(fHigh)} a month), and the named scenario in which the design keeps the fewest payers (${w.scenario ? scenarioWords(w.scenario) : "—"}). The repository's minimum base for 60% consolidated at those fixed costs (lib/customer-base-rules.ts: every customer on the design's least plan, at full use, the commission counted as zero) is **${w.minimumBase === null ? "none" : num(w.minimumBase)} paying customers**; the design keeps ${w.payers60PerReach.toFixed(4)} payers at month ${co.months} for each creator a month of reach, so it needs a reach of **${w.reachNeeded === null ? "none suffices" : num(Math.ceil(w.reachNeeded))} creators a month** (${w.reachNeededMix === null ? "—" : num(Math.ceil(w.reachNeededMix))} if its own mix of plans is counted instead of every customer on the least plan). ${out.screened.ruleBFeasible ? "Some designs meet it at the low end of the reach, and the choice is made among them." : `**No design meets it at the low end of the reach: the rule as stated cannot be guaranteed by prices, plans or limits, because the worst scenario's reach is too small for any minimum base.** It is therefore reported, not applied (the owner's rule: say so and ask, never weaken it silently). The least reach any design that keeps today's plans and is not Stan's error needs is ${out.screened.leastReachNeeded === null ? "—" : num(Math.ceil(out.screened.leastReachNeeded))} creators a month (${leastNeed ? leastNeed.label : out.screened.leastReachNeededDesign}); the Monte Carlo's probability of loss is how this rule is weighed instead, and the owner decides whether to keep it as stated (no design qualifies), to name a worst-case reach the company can count on, or to read it as the Monte Carlo does.`}`);
  push("");
  push(`**Not Stan's error.** Entry ${usd(as.entryUsd * 100)} a month, at most half of the median monthly sales (${money(as.limitUsd * 2)}) of creators who pay a platform; what a subscriber pays Marktmorgen grows ${as.growth ? `${as.growth.toFixed(1)} times` : "—"} from the lowest sales to the highest in the model (packs and the larger plans${rec.plans.some((id) => candidateById(id).commissionBps > 0) ? " and a share of sales" : ", not a commission"}). ${COMMISSION_LIVE ? "" : "No commission is switched on in code (COMMISSION_LIVE is false), and every floor above counts it as zero."}`);
  push("");
  const nc = F(noComm);
  push(`**With and without commission.** ${noComm.id === rec.id ? `The best design takes no share of sales: allowing a commission (each plan at each share its template allows, one plan at a time and all at once, drawn on the same draws) found no design that earns more within the loss tolerance, because a share of sales raises what a creator pays at the same subscription, and the subscription alone must hold the 60% floor, so the price cannot fall to make room for it. It works as it is while COMMISSION_LIVE is off.` : `With a commission: ${rec.label}, ${money(rc.expected)} expected, ${ppt(rc.pLoss)} probability of loss. Without: **${noComm.label}**, ${money(nc.expected)} expected, ${ppt(nc.pLoss)}. The commission adds ${money(rc.expected - nc.expected)} expected; it is counted as zero in every floor and needs, from the owner, **Stripe's written permission for application fees on direct charges**, the test-mode proof and the pages (lib/plan.ts COMMISSION_LIVE).`}`);
  push("");
  push(next
    ? `**The next design on the frontier** (more expected profit, more chance of loss): ${next.label}, expected ${money(F(next).expected)} (${money(F(next).expected - rc.expected)} more), probability of loss ${ppt(F(next).pLoss)} (${ppt(F(next).pLoss - rc.pLoss)} more), outside the ${ppt(co.lossTolerance)} tolerance.`
    : "**The next design on the frontier**: none earns more among the designs that meet the rules.");
  push("");
  const bands = rc.reachBands;
  push(`**What the probability of loss depends on: reach.** By reach (creators a month choosing a platform with Marktmorgen among the alternatives, at full ramp), the share of draws that end in a loss:`);
  push("");
  push(`| Design | ${num(Math.round(bands[0]))} to ${num(Math.round(bands[1]))} | ${num(Math.round(bands[1]))} to ${num(Math.round(bands[2]))} | ${num(Math.round(bands[2]))} to ${num(Math.round(bands[3]))} |`);
  push("| --- | --- | --- | --- |");
  const bandRows: [string, DesignResult][] = [["Recommended", rec]];
  if (noComm.id !== rec.id) bandRows.push(["Without commission", noComm]);
  if (next) bandRows.push(["Next on the frontier", next]);
  bandRows.push(["Today's price list with packs", byName("today + packs")], ["Today's price list", today]);
  for (const [label, x] of bandRows) push(`| ${label}: ${x.label} | ${F(x).pLossByReach.map((v) => (v === null ? "—" : ppt(v))).join(" | ")} |`);
  push("");
  push("**What each rule costs** (each relaxed alone, the rest kept, chosen by the same rule on the same draws; a cost is the expected 60-month profit given up by keeping the rule):");
  push("");
  push("| Rule | Best design without it | Expected profit | Probability of loss | Profit the rule costs |");
  push("| --- | --- | --- | --- | --- |");
  const costRow = (label: string, x: DesignResult | null, note?: string) => push(x ? `| ${label} | ${x.id === rec.id ? "the same design" : x.label} | ${money(F(x).expected)} | ${ppt(F(x).pLoss)} | ${money(F(x).expected - rc.expected)}${note ? ` ${note}` : ""} |` : `| ${label} | — | — | — | ${note ?? "—"} |`);
  push(`| 60% per customer at full use (a) | not relaxed: no candidate below the floor is generated | — | — | not measured; the owner's rule |`);
  costRow("Today's three plans kept (no visible limit cut)", oc.choices.withoutKeepingToday.chosen);
  costRow("Not Stan's error", oc.choices.withoutAntiStan.chosen);
  if (out.screened.ruleBFeasible) costRow("Rule (b) in the worst scenario", oc.choices.withoutRuleB.chosen);
  else push("| Rule (b) in the worst scenario | not applied: no design meets it (above) | — | — | — |");
  costRow(`Within ${ppt(co.lossTolerance)} of the lowest probability of loss`, oc.maxExpected, "(the most expected profit among designs that meet the rules, at any probability of loss)");
  costRow("No commission (Stripe's permission absent)", noComm, noComm.id === rec.id ? "" : "(the best design without commission, against the best with it)");
  costRow("Every rule above (only the 60% floor kept)", oc.choices.none.chosen);
  push("");
  push(`**The frontier** among the designs that meet the rules (each earns more than every design at a lower or equal probability of loss; ${num(out.screened.finalDesigns)} designs drawn again on ${num(out.screened.finalDraws)} fresh draws out of ${num(out.screened.designs)} screened on ${num(out.screened.draws)}):`);
  push("");
  push("| Design | Expected 60-month profit | 5th–95th percentile | Probability of loss | Cash loss | Not at 60% consolidated at month 60 | Lowest cash, median / below −$5,000 | Cash loss under the gate reading | Minimum base, worst | Reach needed, worst |");
  push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const x of oc.frontier) {
    const f = F(x), wx = x.company.worst!;
    push(`| ${x.id === rec.id ? "**Recommended:** " : x.id === next?.id ? "*Next:* " : ""}${x.label} | ${money(f.expected)} | ${money(f.p5)} to ${money(f.p95)} | ${ppt(f.pLoss)} | ${ppt(f.pCashLoss)} | ${ppt(f.pNotConsolidated)} | ${money(f.troughP50!)} / ${tb(f, "5000")} | ${ppt(G(x).pCashLoss)} | ${wx.minimumBase === null ? "none" : num(wx.minimumBase)} | ${wx.reachNeeded === null ? "none" : num(Math.ceil(wx.reachNeeded))} |`);
  }
  push("");
  push("**What it needs from the owner, and what it changes nowhere:**");
  push("");
  const newPlans = rec.plans.filter((id) => !TEMPLATES[candidateById(id).template].today);
  const priceChanges = rec.plans.filter((id) => { const c = candidateById(id); return TEMPLATES[c.template].today && c.monthCents !== PLAN_PRICES[c.base].month; });
  const commissions = rec.plans.filter((id) => candidateById(id).commissionBps > 0);
  push(`- **Visible limits cut: none.** Today's ${TIERS.map((t) => PLAN_TITLES[t]).join(", ")} keep every printed figure.${newPlans.length ? ` The new plan${newPlans.length > 1 ? "s" : ""} (${newPlans.map((id) => candidateById(id).title.replace(" (new)", "")).join(", ")}) print${newPlans.length > 1 ? "" : "s"} smaller figures than the plan ${newPlans.length > 1 ? "they are" : "it is"} sized from, beside it: an addition, not a cut.` : ""}`);
  push(`- **Hidden limits cut: ${newPlans.length ? "on the new plans only" : "none"}.** ${newPlans.length ? "A new plan's unprinted ceilings are sized with it; the studio's own requests, the free-pool share, quizzes, collections, embeds and free delivery stay at the base plan's." : ""}`);
  push(`- **Prices changed: ${priceChanges.length ? priceChanges.map((id) => `${candidateById(id).title} ${usd(PLAN_PRICES[candidateById(id).base].month)} → ${usd(candidateById(id).monthCents)}`).join("; ") : "none of today's three"}.** No price changes in code with this document.`);
  push(`- **Commission: ${commissions.length ? commissions.map((id) => `${candidateById(id).title} ${candidateById(id).commissionBps / 100}%`).join("; ") + `; COMMISSION_LIVE is ${COMMISSION_LIVE} and stays so until its three conditions in lib/plan.ts hold, Stripe's written permission for application fees first` : "none"}.**`);
  push("- **Sales stay closed.** Under the most-tax reading no plan keeps 60% at any price here (column above); the EU art. 9a records are not built.");
  push("");

  // ------------------------------------------------ no loss, deterministic
  push("## A deterministic check: the slowest growth");
  push("");
  push(`The Monte Carlo above weighs every reach; this table fixes it. Slow-growth cash paths: a fixed number of new paying customers a month whatever the design, every one on the design's plan that leaves the least at full use after every cost and the profit tax, ${pct(nl.churn, 0)} churn a month (Stan's measured gross churn, sacra-stan-2024: another product's figure), the fixed costs from the first month, ${nl.months} months.`);
  push("");
  const nlDesigns: [string, DesignResult][] = [["Recommended", rec]];
  if (noComm.id !== rec.id) nlDesigns.push(["Without commission", noComm]);
  if (next) nlDesigns.push(["Next on the frontier", next]);
  nlDesigns.push(["Today's price list", today], ["Today's price list with packs", byName("today + packs")]);
  for (const label of ["single fixed price: Store $69, no packs", "single fixed price: Start $29, no packs", "Stan-like: Start $29 + Store $99, 0%"]) {
    const x = out.designs.find((y) => y.names.includes(label));
    if (x) nlDesigns.push([`Stan-like (${label.replace("single fixed price: ", "one price, ").replace("Stan-like: ", "")})`, x]);
  }
  const head = nl.newPayersPerMonth.flatMap((n) => nl.fixedMonthlyCents.map((f) => `${n} a month, ${usd(f)} fixed`));
  push(`| Design | Least a payer leaves | Payers to cover ${usd(fNamed)} / ${usd(nl.fixedMonthlyCents[1])} | ${head.join(" | ")} |`);
  push(`| --- | --- | --- | ${head.map(() => "---").join(" | ")} |`);
  for (const [label, x] of nlDesigns) {
    const net = designWorstNet(x.plans);
    const cells = nl.newPayersPerMonth.flatMap((n) => nl.fixedMonthlyCents.map((f) => {
      const c = cashPath(net, n, f);
      return `${c.breakEvenMonth ? `covers from month ${c.breakEvenMonth}` : "never covers"}; most out ${usd(Math.round(-c.troughCents))}`;
    }));
    push(`| ${label}: ${x.label} | ${usd(net)} | ${Math.ceil(fNamed / net)} / ${Math.ceil(nl.fixedMonthlyCents[1] / net)} | ${cells.join(" | ")} |`);
  }
  push("");

  // ------------------------------------------------ not Stan's error
  push("## Not Stan's error, side by side");
  push("");
  push(`Stan's documented pattern: one fixed price with nothing that grows with the creator's sales, an entry most creators cannot cover (Gumroad, July 2025: 77.0% of the creators who made money made $100 or less that month), ARPC falling from $491 to about $437 and gross churn of 13% a month (sacra-stan-2024, sacra-stan-2026). The criterion (MODEL.antiStan): an entry at most half of the median monthly sales of creators who pay a platform, prepaid packs on, at least ${MODEL.antiStan.minPlans} plans, and what a subscriber pays Marktmorgen in the highest sales bin anyone subscribes in at least ${MODEL.antiStan.growthRatio} times the lowest's.`);
  push("");
  push("| Design | Entry | Revenue per subscriber, lowest to highest sales | Meets the criterion | Expected 60-month profit | Probability of loss |");
  push("| --- | --- | --- | --- | --- | --- |");
  for (const [label, x] of nlDesigns) {
    const a = antiStan(x);
    const rev = x.revenueBySales.filter((v): v is number => v !== null);
    push(`| ${label}: ${x.label} | ${usd(a.entryUsd * 100)} | ${rev.length ? `${money(rev[0])} to ${money(rev[rev.length - 1])} (${a.growth ? a.growth.toFixed(1) : "—"}×)` : "nobody subscribes"} | ${a.affordable && a.grows ? "yes" : "no"} | ${x.company.final ? money(F(x).expected) : "—"} | ${x.company.final ? ppt(F(x).pLoss) : "—"} |`);
  }
  push("");

  // ------------------------------------------------ the hypothesis
  push("## The commission hypothesis");
  push("");
  push("The lead's hypothesis: #553 repeated Stan's documented pattern (a fixed price only, ARPC falling from $491 in early 2024 to about $437, gross churn of 13% a month: sacra-stan-2024, sacra-stan-2026) because most creators sell little (Gumroad, July 2025: of 37,006 creators who made money, 8,507 made over $100, so **77.0% made $100 or less** that month), while a commission is counted as zero in the 60% floor and so would be pure upside on top of a floor the subscription alone satisfies.");
  push("");
  push("What the repository's margin code says first, before any demand model: **under the owner's floor a commission cannot buy a lower subscription price.** The floor is held by the subscription alone at full use, so the lowest price a plan can have depends only on its included figures, never on its commission. A commission therefore only adds to what a creator pays at the same subscription price; it is upside only if demand does not move. What does fix the entry problem is a **smaller new plan** at a lower price, whose own figures keep 60%.");
  push("");
  push("| Design | Mean profit | Worst regret | Subscribers per 1,000 creators (base scenario) | Commission's share of profit (base) |");
  push("| --- | --- | --- | --- | --- |");
  for (const h of out.hypothesis) push(`| ${h.label} | ${money(h.meanProfit)} | ${pct(h.worstRegret)} | ${num(h.subscribersPer1000)} | ${pct(h.commissionShare)} |`);
  push("");
  const hyp = (label: string) => out.hypothesis.find((h) => h.label === label);
  const startRows = out.hypothesis.filter((h) => h.label.startsWith("today + Start"));
  const bestNoComm = startRows.filter((h) => h.label.endsWith("+ 0%")).sort((a, b) => b.meanProfit - a.meanProfit)[0];
  const bestComm = startRows.filter((h) => !h.label.endsWith("+ 0%")).sort((a, b) => b.meanProfit - a.meanProfit)[0];
  const commWins = out.designs.filter((x) => x.plans.some((id) => candidateById(id).commissionBps > 0));
  push(`Result: adding a smaller entry plan multiplies the model's profit (best named: ${bestNoComm.label}, ${money(bestNoComm.meanProfit)} against ${money(hyp("today")!.meanProfit)}), so the half of the hypothesis about the entry price holds. The half about the commission does not: the best named entry with a commission (${bestComm.label}) makes ${money(bestComm.meanProfit)}, ${pct(1 - bestComm.meanProfit / bestNoComm.meanProfit)} less than the same entry at 0%, in the mean of the named scenarios. Of the ${out.designs.length} designs produced, ${commWins.length} carry a commission somewhere; the recommendation carries ${commissions.length ? "one" : "none"}. A commission wins only where price sensitivity is low; see the sensitivity table.`);
  push("");

  // ------------------------------------------------ plan count
  push("## How many plans");
  push("");
  push("For each plan count, the design with the smallest worst-case regret among those produced, with today's three plans kept (no visible limit removed) and without that restriction. Dropping Studio or Scale removes the largest printed figures a customer can buy, which the owner's rule does not allow without his decision.");
  push("");
  push("| Plans | Today's three kept | Design | Mean profit | Worst regret | Base per $100 a month |");
  push("| --- | --- | --- | --- | --- | --- |");
  for (const p of out.paretoByCount) {
    const des = byId.get(p.design)!;
    push(`| ${p.k} | ${p.admissibleOnly ? "yes" : "no"} | ${des.label} | ${money(p.meanProfit)} | ${pct(p.worstRegret)} | ${designBase(des.plans, 10_000) ?? "none"} |`);
  }
  push("");

  // ------------------------------------------------ competitors
  push("## 1. The competitors, as read");
  push("");
  push(`${d.vendors.reduce((s, v) => s + v.plans.length, 0)} plans of ${d.vendors.length} vendors, read on ${d.accessed}. "—" means the page did not state it; "unlimited" is the page's word. Fees are the vendor's on a sale (processing included only where marked).`);
  push("");
  push("| Vendor | Plan | Monthly | Yearly | Fee on a sale | Emails a month | Contacts | Products | Seats | Storage | AI | Highlighted | Source |");
  push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  const show = (x: unknown) => (x === null || x === undefined ? "—" : typeof x === "number" ? num(x) : String(x));
  for (const v of d.vendors) for (const p of v.plans) {
    const l = p.limits;
    const yearly = p.yearlyUsd != null ? `$${num(p.yearlyUsd)}` : p.perMonthBilledYearlyUsd != null ? `$${num(p.perMonthBilledYearlyUsd)}/mo billed yearly` : "—";
    const fee = p.feeOnSalePct == null ? "not stated" : `${p.feeOnSalePct}%${p.feeFixedUsd ? ` + $${p.feeFixedUsd.toFixed(2)}` : ""}${p.feeIncludesProcessing ? " (incl. processing)" : ""}`;
    const storage = l.storageGb != null ? `${show(l.storageGb)} GB` : l.videoStorage ? show(l.videoStorage) : l.storage ? show(l.storage) : "—";
    push(`| ${v.name} | ${p.name} | ${p.monthlyUsd != null ? `$${num(p.monthlyUsd)}` : p.priceNote ? "not rendered" : "—"} | ${yearly} | ${fee} | ${show(l.emailsPerMonth ?? l.emailSubscribers)} | ${show(l.contacts ?? l.subscribers)} | ${show(l.products)} | ${show(l.seats ?? l.admins ?? l.hosts)} | ${storage} | ${show(l.ai)} | ${v.highlighted.split(";")[0]} | ${v.sources.map((s) => `[${s}](${sourceOf(s).url})`).join(" ")} |`);
  }
  push("");
  for (const n of d.notRead) push(`- ${n}`);
  push("");
  push("**How the leaders present value** (the vendors above, counted from their pages): ");
  const framed = d.vendors.filter((v) => /2 months free|ten monthly|ten payments|Save \$|save \$|save \d|Save \d/i.test(v.yearlyFraming));
  const badged = d.vendors.filter((v) => !/^none/i.test(v.highlighted) && /most popular|recommended|popular/i.test(v.highlighted));
  const plus = d.vendors.filter((v) => v.plans.some((p) => /Everything in/i.test(p.leadsWith ?? "")));
  const whom = d.vendors.filter((v) => v.plans.some((p) => /^(For |Perfect for|Built for|Ideal for|Designed for|When you)/i.test(p.leadsWith ?? "") || /you|your/i.test(p.leadsWith ?? "")));
  push("");
  push(`- ${framed.length} of ${d.vendors.length} frame the year as a saving (\"2 months free\", \"Save $X\", ten monthly payments): ${framed.map((v) => v.name).join(", ")}.`);
  push(`- ${badged.length} badge one plan (\"Most popular\", \"Recommended\", \"Popular\"), always a middle or upper one: ${badged.map((v) => `${v.name} (${v.highlighted.split(";")[0]})`).join(", ")}.`);
  push(`- ${plus.length} build each card as "Everything in the plan below, plus": ${plus.map((v) => v.name).join(", ")}; ${whom.length} open the card with whom it is for or what it does for the buyer: ${whom.map((v) => v.name).join(", ")}.`);
  push("- Kajabi, ClickFunnels, Thinkific and Teachable print their limits on the card; Stan, Beacons, Systeme.io, Skool and Payhip print \"unlimited\" on the lines that cost them least (products, customers, members, storage).");
  push("");

  // ------------------------------------------------ demand
  push("## 2. The demand model");
  push("");
  push("**Who buys.** Monthly sales of a creator, as a lognormal, in three populations (scenarios):");
  push("");
  push("| Population | μ | σ | Median a month | Mean a month | How it was fitted | Source |");
  push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const p of input.populations) push(`| ${p.label} | ${p.mu.toFixed(3)} | ${p.sigma.toFixed(3)} | ${money(p.medianUsd)} | ${money(p.meanUsd)} | ${p.basis} | ${p.sources.map((s) => `[${s}](${sourceOf(s).url})`).join(" ")} |`);
  push("");
  const gp = input.populations[0];
  push("The Gumroad fit against its own counts (share of the 37,006 who made money above each level):");
  push("");
  push("| Above | Observed | Fitted |");
  push("| --- | --- | --- |");
  for (const f of gp.fit!) push(`| $${num(f.threshold)} a month | ${pct(f.observed, 2)} | ${pct(f.fitted, 2)} |`);
  push("");
  push(`Other evidence read and not fitted: Patreon (Graphtreon's count, 2019): more than 4,300 of 132,500 creators (about 3.2%) earned $1,000 a month or more, and creators at $500 a month churned under 1% a year; Linktree's 2022 survey: 46% of full-time creators under $1,000 a year and 66% of creators treat it as a side hustle; Kajabi (company release, August 2025): over 100 thousand creators, nearly 1,800 past $1M, and 60% arriving after outgrowing an entry-level platform; Thinkific 2025: ARPU $175 a month, GMV $460.0M, net income $1.3M; Stan: ARR about $40M (Sacra estimate, April 2026), 13% gross churn a month (2024). Sources are in the dataset.`);
  push("");
  push(`**How they choose.** Each creator picks among the competitor plans that can serve its needs and Marktmorgen's plans on offer, by multinomial logit. Utility is a preference minus η times the logarithm of the all-in monthly cost (the subscription, the commission or fee on its sales, Stripe's 2.9% + 30¢ processing where the vendor's fee does not include it, and the prepaid packs a plan's figures make it buy) plus a hassle cost. Needs: orders = sales ÷ the average order value; visits = orders ÷ conversion; a list of email at ${MODEL.emailsPerOrder.base} emails per order for a creator selling $${num(MODEL.emailFromUsd)} a month or more. A Marktmorgen plan that cannot serve a need (Store and Start send no list email; figures without packs) is not a choice for that creator. Each subscriber churns at a monthly rate that rises with what the platform costs against what the creator sells; the profit of one month's cohort is counted over the horizon.`);
  push("");
  push("| Parameter | Base | Range | Basis |");
  push("| --- | --- | --- | --- |");
  const mc = MODEL.mc;
  const rng = (r: readonly number[], f: (x: number) => string = (x) => `${x}`) => `${f(r[0])} to ${f(r[1])}`;
  push(`| Price sensitivity η (per log unit of all-in cost) | ${MODEL.base.eta} | ${MODEL.eta.join(", ")} (named), ${rng(mc.eta)} (Monte Carlo) | evidence: a randomized SMB subscription price test (NBER w23775) and Tellis's 1988 meta-analysis center near 2 (docs/research/demand-evidence-v2-2026-10-18.json); no price test of Marktmorgen exists |`);
  push(`| Preference for Marktmorgen, log-odds | ${MODEL.base.asc} | ${MODEL.asc.join(", ")}; ${rng(mc.asc)} | evidence for the handicap of a brand with no reviews: Spiegel Research Center 2017 (reviews raised conversion 2.9 to 4.8 times); nothing supports a new entrant above its incumbents |`);
  push(`| Preference for a payments-only tool (no storefront) | ${MODEL.paymentsAsc} | ${rng(mc.paymentsAsc)} | assumption |`);
  push(`| Hassle cost inside the logarithm | $${MODEL.hassleUsd} | ${rng(mc.hassleUsd, (x) => `$${x}`)} | assumption |`);
  push(`| Average order value | $${MODEL.aovUsd.base} | $${MODEL.aovUsd.low} to $${MODEL.aovUsd.high} (log-uniform) | Stan: over half its GMV from downloads priced $4 to $30 (sacra-stan-2026); $67 average per sale in 2025 as Stan reports it |`);
  push(`| Orders per visit | ${pct(MODEL.conversion.base, 1)} | ${pct(MODEL.conversion.low, 1)} to ${pct(MODEL.conversion.high, 0)} (log-uniform) | Littledata: Shopify stores average 1.4%, the top fifth above 3.3%; Linktree's self-reported $1.25 of sales per commerce click |`);
  push(`| List emails per order, from $${num(MODEL.emailFromUsd)} a month of sales | ${MODEL.emailsPerOrder.base} | ${MODEL.emailsPerOrder.low} to ${MODEL.emailsPerOrder.high} (log-uniform) | no direct creator measure; campaign conversion of 0.08% (Omnisend) to 1.07% (Klaviyo, one category) allows values well above 40 |`);
  push(`| Average use of the allowances | ${pct(MODEL.usage.base, 0)} | ${rng(mc.usage, (x) => pct(x, 0))} | assumption; the floor is always held at full use |`);
  push(`| Payers on the yearly payment | ${pct(MODEL.yearlyShare.base, 0)} | ${pct(MODEL.yearlyShare.low, 0)} to ${pct(MODEL.yearlyShare.high, 0)} | RevenueCat SOSA 2025 (yearly 20.7% of Business app subscriptions, 41.4% of all); Paddle models 10-20%; a yearly payer leaves a twelfth of its yearly net a month (less than a monthly one) |`);
  push(`| Churn a month, floor and cap | ${MODEL.churn.base.map((x) => pct(x, 0)).join(" / ")} | floor ${rng(mc.churnFloor, (x) => pct(x, 0))}, cap ${rng(mc.churnCap, (x) => pct(x, 0))} | Stan 13% gross a month (sacra-stan-2024); RevenueCat monthly plans about 13.7%; ChartMogul above $500 ARPA about 2.1% |`);
  push(`| Horizon | ${MODEL.horizon.base} months | ${MODEL.horizon.values.join(", ")} | assumption |`);
  push(`| Commission kept per dollar | ${input.commissionKeep.sizing.toFixed(4)} (sizing reading) | ${input.commissionKeep.mostTax.toFixed(4)} (most-tax reading) | remittance 1.5%, refund 1%, dispute 1% reserves, ${COMMISSION_UNREVIEWED_BPS / 100}% for unreviewed costs of taking a share, then the profit tax |`);
  push("");

  // ------------------------------------------------ optimization
  push("## 3. The optimization");
  push("");
  push(`**Decisions.** Which of five plan templates are offered (1 to 5 plans): Start (new, sized down from Store), Store, Growth (new, sized down from Studio), Studio and Scale; each one's monthly price on a grid (the year at ten monthly payments), its commission (0% to 10%), and for a new plan its size (the largest that keeps 60% at its price, or half). ${input.candidates.length} candidate plans in all, each checked by the repository's code at full use on both intervals with the spend floor test's room (25¢ a month, $1 a year); a candidate that does not keep 60% does not exist. Prepaid packs on or off.`);
  push("");
  push("**The mixed-integer program** (scipy.optimize.milp, HiGHS) is the deterministic version of the logit: each population bin is split into preference intervals of the logistic error (concentrated in the upper tail), a segment buys the cheapest offered plan it prefers to its competitors' inclusive value, and the program chooses the plans that maximize the profit summed over segments, with at most one plan per template and exactly K plans. Its optimum is checked against brute force for one and two plans, and against a TypeScript evaluation of the same model in tests/pricing-study-v2.test.ts.");
  push("");
  push("| Plans | Packs | Today's three kept | Status | Profit (program) | Brute force | Seconds | Plans chosen |");
  push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const r of out.milp) push(`| ${r.k} | ${r.packs ? "on" : "off"} | ${r.admissibleOnly ? "yes" : "no"} | ${/Optimal/.test(r.status) ? "optimal" : r.status} | ${money(r.value)} | ${r.bruteForce === null ? "—" : money(r.bruteForce)} | ${r.seconds} | ${r.plans.map(planWords).join("; ")} |`);
  push("");
  push(`**The logit search** starts from each program solution in its own scenario and replaces one plan at a time while the logit profit rises. **Regret**: for each design and scenario, its shortfall from the best design produced for that scenario, as a share of it. The ${Math.min(15, out.designs.length)} designs with the smallest worst-case regret:`);
  push("");
  push("| Design | Today's three kept | Mean profit | Worst regret | Mean regret | Monte Carlo mean (5th–95th) | Best in Monte Carlo draws |");
  push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const x of out.designs.slice(0, 15)) push(`| ${x.label} | ${x.admissible ? "yes" : "no"} | ${money(x.meanProfit)} | ${pct(x.worstRegret)} | ${pct(x.meanRegret)} | ${x.monteCarlo ? `${money(x.monteCarlo.mean)} (${money(x.monteCarlo.p5)}–${money(x.monteCarlo.p95)})` : "—"} | ${x.monteCarlo ? pct(x.monteCarlo.probBest) : "—"} |`);
  push("");
  push("**The recommendation in each named scenario** (profit, and the best design produced for that scenario):");
  push("");
  push("| Scenario | Recommendation | Today's price list | Best produced |");
  push("| --- | --- | --- | --- |");
  for (const s of out.scenarios) {
    const best = Math.max(...out.designs.map((x) => x.profitByScenario[s.id]));
    push(`| ${scenarioWords(s.id)} | ${money(rec.profitByScenario[s.id])} | ${money(today.profitByScenario[s.id])} | ${money(best)} |`);
  }
  push("");
  push("**Sensitivity of the recommendation** (base scenario; each parameter alone at its low and high value):");
  push("");
  push("| Parameter | Low | Base | High |");
  push("| --- | --- | --- | --- |");
  for (const s of out.sensitivity) push(`| ${s.parameter} | ${money(s.low)} | ${money(s.base)} | ${money(s.high)} |`);
  push("");
  push("**Implied own-price elasticity** of each recommended plan (its subscribers when its own price is 1% higher), across the named scenarios:");
  push("");
  push("| Plan | Lowest | Median | Highest |");
  push("| --- | --- | --- | --- |");
  for (const e of out.elasticity) {
    const vals = Object.values(e.byScenario).filter((x): x is number => x !== null).sort((a, b) => a - b);
    push(`| ${planWords(e.plan)} | ${vals.length ? vals[0].toFixed(2) : "—"} | ${vals.length ? vals[Math.floor(vals.length / 2)].toFixed(2) : "—"} | ${vals.length ? vals[vals.length - 1].toFixed(2) : "—"} |`);
  }
  push("");
  push("**Horizon.** The recommendation's base-scenario profit over 12, 24 and 36 months: " + Object.entries(rec.horizon).map(([h, v]) => `${h} months ${money(v)}`).join(", ") + ".");
  push("");

  // ------------------------------------------------ new plans
  push("## 4. The new plans at each price");
  push("");
  push("A new plan's size is the largest uniform share of its base plan's figures (every per-use line, printed and unprinted, but the studio's own requests, the free-pool share, quizzes, collections, embeds and free delivery, which stay at the base plan's) that keeps 60% at full use on both intervals with room, its printed figures rounded down as a page prints them.");
  push("");
  push("| Plan | Price | Size | Included a month | Net monthly / yearly | Base per $100 a month |");
  push("| --- | --- | --- | --- | --- | --- |");
  for (const c of input.candidates.filter((x) => TEMPLATES[x.template].sized && x.commissionBps === 0)) push(`| ${c.title.replace(" (new)", "")} | ${usd(c.monthCents)} | ${c.size} (${pct(c.share)}) | ${figureWords(c)} | ${pctOf(c.netBps.month)} / ${pctOf(c.netBps.year)} | ${basePerFixed(c.id) ?? "none"} |`);
  push("");
  push("Below the lowest price listed for Start ($19 was tried), no size keeps 60%: receiving one payment and the lines that stay at Store's figure take more than the floor leaves.");
  push("");

  // ------------------------------------------------ value
  push("## 5. Composition: which feature goes in which plan");
  push("");
  push("Feature placement is decided by one rule, because no data here can measure what gating a feature does to upgrades or churn (no sale has been open): **a feature that costs nothing per use is in every plan**, to raise what every plan is worth; a feature that costs per use is placed by its figure, only where its worst case keeps 60% at full use; a feature whose per-use cost is not reviewed stays where it is. The model's decision variables for composition are therefore the figures (sizes and the room above the floor, section 7) and the packs; zero-cost features are fixed in every plan by the rule. Competitor cells say only what the page read says.");
  push("");
  const recOrder = [...rec.plans].sort((a, b) => candidateById(a).monthCents - candidateById(b).monthCents).map((id) => candidateById(id));
  push(`| Feature | Cost per use | Marktmorgen (${recOrder.map((c) => `${c.title.replace(" (new)", "")} ${usd(c.monthCents)}`).join(", ")}) | Why | ${COMPETITOR_COLUMNS.join(" | ")} | Evidence |`);
  push(`| --- | --- | --- | --- | ${COMPETITOR_COLUMNS.map(() => "---").join(" | ")} | --- |`);
  for (const r of composition()) push(`| ${r.feature} | ${r.cost} | ${r.placement} | ${r.reason} | ${COMPETITOR_COLUMNS.map((c) => r.competitors[c] ?? "—").join(" | ")} | ${r.evidence} |`);
  push("");
  push("**Feature by plan**, the recommended plans beside the closest competitors (competitor cells as above: what the page read says, \"—\" where it does not say, which is not \"no\"):");
  push("");
  push(`| Feature | ${recOrder.map((c) => `${c.title.replace(" (new)", "")} ${usd(c.monthCents)}`).join(" | ")} | ${COMPETITOR_COLUMNS.join(" | ")} |`);
  push(`| --- | ${recOrder.map(() => "---").join(" | ")} | ${COMPETITOR_COLUMNS.map(() => "---").join(" | ")} |`);
  for (const r of composition()) push(`| ${r.feature} | ${recOrder.map((c) => planCell(r, c, rec.packs)).join(" | ")} | ${COMPETITOR_COLUMNS.map((c) => r.competitors[c] ?? "—").join(" | ")} |`);
  push("");
  const closest = CLOSEST.map(([vn, pn]) => { const v = d.vendors.find((x) => x.name === vn)!; return { v, p: v.plans.find((x) => x.name === pn)! }; });
  push(`**The figures beside the closest competitors**, every competitor figure from its own page, read on ${d.accessed} (the source under each column); "unlimited" is the page's word, which no finite figure that keeps 60% at full use can match:`);
  push("");
  const lim = (p: VendorPlan, ...keys: string[]) => { for (const k of keys) { const x = p.limits[k]; if (x !== null && x !== undefined) return typeof x === "number" ? num(x) : x === "unlimited" ? "\"unlimited\"" : String(x); } return "—"; };
  push(`| Line | ${recOrder.map((c) => `Marktmorgen ${c.title.replace(" (new)", "")}`).join(" | ")} | ${closest.map(({ v, p }) => `${v.name} ${p.name}`).join(" | ")} |`);
  push(`| --- | ${recOrder.map(() => "---").join(" | ")} | ${closest.map(() => "---").join(" | ")} |`);
  push(`| Price a month | ${recOrder.map((c) => usd(c.monthCents)).join(" | ")} | ${closest.map(({ p }) => (p.monthlyUsd != null ? `$${num(p.monthlyUsd)}` : p.perMonthBilledYearlyUsd != null ? `$${num(p.perMonthBilledYearlyUsd)} billed yearly` : "not rendered")).join(" | ")} |`);
  push(`| Year | ${recOrder.map((c) => `${usd(yearOf(c.monthCents))} (ten months)`).join(" | ")} | ${closest.map(({ p }) => (p.yearlyUsd != null ? `$${num(p.yearlyUsd)}` : "—")).join(" | ")} |`);
  push(`| Fee on each sale | ${recOrder.map((c) => `${c.commissionBps / 100}%`).join(" | ")} | ${closest.map(({ p }) => (p.feeOnSalePct == null ? "not stated" : `${p.feeOnSalePct}%${p.feeFixedUsd ? ` + $${p.feeFixedUsd.toFixed(2)}` : ""}`)).join(" | ")} |`);
  push(`| List emails a month | ${recOrder.map((c) => (c.figures.listEmails ? num(c.figures.listEmails) : "none")).join(" | ")} | ${closest.map(({ p }) => lim(p, "emailsPerMonth", "emailSubscribers")).join(" | ")} |`);
  push(`| Contacts | ${recOrder.map(() => num(MAX_LEADS)).join(" | ")} | ${closest.map(({ p }) => lim(p, "contacts", "subscribers", "students", "members")).join(" | ")} |`);
  push(`| Products | ${recOrder.map(() => num(MAX_PRODUCTS)).join(" | ")} | ${closest.map(({ p }) => lim(p, "products", "courses")).join(" | ")} |`);
  push(`| Orders a month (theirs: customers, as the page counts them) | ${recOrder.map((c) => num(c.figures.orders)).join(" | ")} | ${closest.map(({ p }) => lim(p, "customers")).join(" | ")} |`);
  push(`| Visits a month (theirs: visitors) | ${recOrder.map((c) => num(c.figures.visits)).join(" | ")} | ${closest.map(({ p }) => lim(p, "visitors")).join(" | ")} |`);
  push(`| AI | ${recOrder.map((c) => (c.figures.aiJobs ? `${c.figures.aiJobs} jobs, ${c.figures.aiAnswers} answers` : "none")).join(" | ")} | ${closest.map(({ p }) => lim(p, "ai")).join(" | ")} |`);
  push(`| Storage | ${recOrder.map((c) => `${num(c.figures.storageGb)} GB`).join(" | ")} | ${closest.map(({ p }) => lim(p, "storageGb", "videoStorage", "storage", "videoBandwidthGbPerMonth")).join(" | ")} |`);
  push(`| Seats | ${recOrder.map(() => num(MAX_TEAM)).join(" | ")} | ${closest.map(({ p }) => lim(p, "seats", "admins", "hosts")).join(" | ")} |`);
  push(`| Source, read | ${recOrder.map(() => "this repository's constants").join(" | ")} | ${closest.map(({ v }) => v.sources.map((id) => `[${id}](${sourceOf(id).url}), ${sourceOf(id).accessed}`).join("; ")).join(" | ")} |`);
  push("");
  push(`Read across: Stan sells discount codes, upsells, order bumps, affiliates, email broadcasts and flows and pixels only on Creator Pro at $99 (stan-blog); Podia lists affiliates and upsells from Shaker. Marktmorgen puts all of these, at no cost per use, on every plan, its entry included: the strongest honest value line the code can back. The one zero-cost feature still gated is the name off the page, and only because the name is the store's way of bringing the next creator; that is the owner's call.`);
  push("");
  push("## 6. Value beside the competitors, and how to present it");
  push("");
  push("Each recommended plan's printed figures against every competitor plan in its price band (three quarters to four thirds of its price) that states the same line. \"unlimited\" cannot be matched by any finite figure that keeps 60% at full use.");
  push("");
  for (const id of rec.plans) {
    const rows = valueCheck(id);
    push(`**${planWords(id)}**: ${rows.length ? `${rows.filter((r) => r.meets).length} of ${rows.length} comparisons met.` : "no competitor in the band states a comparable line."}`);
    push("");
    if (rows.length) {
      push("| Line | Ours | Competitor | Theirs | Met |");
      push("| --- | --- | --- | --- | --- |");
      for (const r of rows) push(`| ${r.attribute} | ${num(r.ours)} | ${r.competitor} | ${typeof r.theirs === "number" ? num(r.theirs) : r.theirs} | ${r.meets ? "yes" : "**no**"} |`);
      push("");
    }
  }
  push("How to present it, from the leaders' pages (no figure invented, no badge without customers, no \"unlimited\"):");
  push("");
  push("- **Lead each card with whom it is for** (Kajabi, HighLevel, Thinkific, Beacons do), then the price a month, then \"0% of your sales\" where it is true (every leader with 0% prints it).");
  push("- **Then the figures a buyer compares**, from the constants the product enforces: visits, orders, list emails, AI, storage, and \"Everything in the plan below, plus\" for what each step adds (Stan, Linktree, Kit, Beacons build cards this way).");
  push("- **The year as \"two months free\"**, the ten-payment convention of ClickFunnels, HighLevel, Beacons, Skool, Systeme.io and Mighty Networks; Marktmorgen's year is already ten monthly payments.");
  push("- **No \"Most popular\"** until a plan is: every badge on the pages read is a claim about customers, and Marktmorgen has none.");
  push("- **Zero-cost features on every plan.** docs/zero-cost-value-2026-10-18.md marks 88 rows of competitor features as already built (Stan's Creator Pro, at $99, is \"Everything in Creator, plus\" discount codes, upsells, order bumps, affiliates, email broadcasts and flows and pixels: stan-blog; Marktmorgen has all but list email on every plan, section 5). Printing that list on the entry plan is the strongest honest value line the code can back.");
  push("- **The all-in cost at a creator's own sales**, computed from each page's stated fee (e.g. what a $500 month of sales costs on Gumroad's 10% + 50¢ against a 0% plan): factual, and the commission-free plans win it above a few hundred dollars a month.");
  push("");

  // ------------------------------------------------ LP
  push("## 7. Spending the room above the floor (linear program)");
  push("");
  push("Where a recommended plan's price leaves room above its floor, the linear program (scipy.optimize.linprog) chooses which printed figures to raise to maximize the share of competitors' printed lines matched per unit, at each line's full-use cost from the registry, raising no line past twice today's figure, within the tighter of the monthly and yearly room. It is shown, not applied: raising a figure spends margin the owner may prefer to keep.");
  push("");
  push("| Plan | Room a month | Raised | Status |");
  push("| --- | --- | --- | --- |");
  for (const r of out.lp) push(`| ${planWords(r.plan)} | ${usd(Math.round(r.roomCents))} | ${r.raised.length ? r.raised.map((x) => `${x.line} ${num(x.from)} → ${num(Math.floor(x.to))}`).join("; ") : "nothing"} | ${r.status} |`);
  push("");

  // ------------------------------------------------ disagreements
  push("## 8. Where this study differs from the earlier ones");
  push("");
  push("- **docs/pricing-optimization-2026-10-18.md** (price-only constant-elasticity demand anchored on band medians) recommended Store $89, Studio $569, Scale $1,269 by minimax regret. With |ε| ≤ 1 that model has no finite optimum, so the regret was driven by the grid's top; it had no competitor alternatives, no needs and no churn. Here each creator chooses among the competitors read, by all-in cost at its own sales, which bounds prices from above.");
  push("- **docs/pricing-usage-proposal-2026-10-18.md** proposed entry prices by cutting the included figures of today's plans. Here today's plans keep every figure and the entry is a new plan beside them, so no visible limit is cut on any existing plan.");
  push("- **The commission hypothesis** (above): its entry-price half holds, its commission half does not under the floor rule.");
  push("");

  // ------------------------------------------------ unknowns
  push("## What is not known, and every assumption that could not be sourced");
  push("");
  push("- **Demand.** No sale has been open: price sensitivity, the preference for Marktmorgen, conversion, emails per order, average usage and the churn curve are assumptions with stated ranges; the Monte Carlo draws all of them.");
  push("- **Who would buy.** The three populations are other platforms' creators; none is Marktmorgen's.");
  push("- **Growth over time.** The model is a steady state per segment: a creator who grows past a plan's figures buys packs or another plan; movement between platforms over time is not modelled.");
  push("- **Competitor preferences.** Every competitor platform has the same preference (0) and payments-only tools a lower one; market shares by vendor are not public.");
  push("- **The commission's costs** beyond the reserves (Stripe Connect's terms for application fees on direct charges, the EU art. 9a records) were not read; 10% of the commission is held for them.");
  push("- **Fixed costs.** Marktmorgen's company review is absent (lib/commercial-margin.ts); the base is per $100 a month and for the part this analysis can name.");
  push("- **Pages not read**: " + d.notRead.join(" "));
  push("");
  push("## For the owner to decide");
  push("");
  push(`1. **Rule (b) as stated.** ${out.screened.ruleBFeasible ? "Some designs meet it in the worst scenario; the recommendation is one of them." : `No design meets it in the worst scenario named here (reach ${num(co.reach.low)} creators a month): the recommendation needs ${rec.company.worst!.reachNeeded === null ? "an unbounded reach" : `${num(Math.ceil(rec.company.worst!.reachNeeded))} creators a month`} there. Keep it as stated (nothing can be launched under it), name the worst-case reach the company can count on, or accept the Monte Carlo's probability of loss as the measure.`} Either way, the fixed costs should stay at the named ${usd(fNamed)} a month until the paying customers arrive, since every plan sits close to its 60% floor and leaves little room for them.`);
  push(`2. **The new plan${newPlans.length > 1 ? "s" : ""}** (${newPlans.map((id) => planWords(id)).join("; ") || "none"}): smaller printed figures on a new plan beside today's, not a cut, but listed for authorization.${priceChanges.length ? ` **Price changes**: ${priceChanges.map((id) => `${candidateById(id).title} ${usd(PLAN_PRICES[candidateById(id).base].month)} → ${usd(candidateById(id).monthCents)}`).join("; ")}; each keeps every printed figure and leaves more room above 60% for the fixed costs.` : ""}`);
  push("3. **The prepaid packs** (not built: the charge, the crediting to the window, the pages and the terms). List-email packs on Start and Store would each keep 60% on their own payment too; the model did not offer them, so its profit understates that option.");
  push(`4. **Commission.** ${commissions.length ? "The recommendation uses one; " : "The recommendation uses none; "}COMMISSION_LIVE stays off until **Stripe's written permission for application fees on direct charges**, the test-mode proof and the pages are in place: an owner dependency. ${noComm.id === rec.id ? "The model finds no design with a commission that earns more within the loss tolerance." : `The best design without one is ${noComm.label}.`}`);
  push("5. **The name off the foot of the page** stays a Studio and Scale feature: the one zero-cost feature gated, because it is the store's referral channel. Moving it to every plan is the owner's call.");
  push(`6. **An entry at ${usd(Math.floor(as.limitUsd) * 100)}** (the highest the anti-Stan rule allows, half of ${money(as.limitUsd * 2)}) is not on the price grid; it would leave a little more a payer than ${usd(as.entryUsd * 100)}. Worth a run before a decision.`);
  push("");
  return L.join("\n");
}
