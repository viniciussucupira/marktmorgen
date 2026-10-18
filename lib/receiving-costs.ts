/**
 * What one payment costs to receive, and what it keeps after every tax, in
 * one model for every plan, interval and add-on (18 October 2026).
 *
 * Until that day the base plans were held to 2.9% + 0.7% + 30¢ on the price
 * with no reserve (tests/plan-cost-model.ts), while the Store assistant
 * add-on carried the dearer 6.6% + 30¢, a remittance allowance and refund
 * and dispute reserves: two models in one repository, and the lighter one
 * decided the plans. This file is the one model, aligned with Hazelsong's
 * (lib/owner-margin.ts there, WORST_CASE), the sister product of the same
 * LLC:
 *
 *   - the dearer, per charge, of Stripe with every surcharge (2.9% + 30¢ a
 *     card, + 1.5% international, + 1% currency conversion, + 0.7% Billing,
 *     + 0.5% Tax: 6.6% + 30¢, stripe.com/pricing read 17 October 2026) and
 *     Paddle (5% + 50¢), ON THE AMOUNT CHARGED, which is the price plus the
 *     buyer's sales tax the provider adds on top, at its highest (27%,
 *     Hungary's VAT); a line carried on a renewal invoice pays only the
 *     percentages;
 *   - remittance of 1.5% of revenue (the larger of this repository's
 *     allowance and Hazelsong's 1%);
 *   - a refund reserve of 1% of revenue, and a dispute reserve of
 *     ($30 + the amount charged) x 1% (a disputed payment is lost in full and
 *     Stripe charges $15, and $15 again to answer it);
 *   - a profit tax of at least 27.5% (lib/net-margin-rules.ts,
 *     PLANNING_PROFIT_TAX_FLOOR_BPS), the sizing reading.
 *
 * And the readings of docs/tax-uncertainty.md (owner's rule 19): the
 * most-tax reading, under which no unit reaches 60% at any limit, and the
 * three design choices that could close a gap (EU hosting removing the US
 * tax, ISS at 0% from a Fortaleza consultation, business-only sales with the
 * buyer's tax on top at 15%). Nothing here opens a sale: the release gate is
 * lib/commercial-margin.ts. This file imports nothing so a page, a test and
 * the add-on read the same numbers.
 */

/** The owner's floor: 60% of revenue kept after every cost and every tax. */
export const FLOOR_BPS = 6_000;
/** The profit tax every reading is held to at least (lib/net-margin-rules.ts PLANNING_PROFIT_TAX_FLOOR_BPS). */
export const STRESS_PROFIT_TAX_BPS = 2_750;

/** The two payment providers' fees, on the amount charged; the dearer is used for every charge. */
export const PROVIDER_FEES = {
  stripe: { cardBps: 290, internationalBps: 150, conversionBps: 100, billingBps: 70, taxBps: 50, fixedCents: 30 },
  paddle: { bps: 500, fixedCents: 50 },
} as const;
/** Stripe's fees summed: 6.6%. */
export const STRIPE_TOTAL_BPS =
  PROVIDER_FEES.stripe.cardBps + PROVIDER_FEES.stripe.internationalBps + PROVIDER_FEES.stripe.conversionBps + PROVIDER_FEES.stripe.billingBps + PROVIDER_FEES.stripe.taxBps;
/** Stripe's fee for a dispute received, and again for one countered (stripe.com/pricing, 17 October 2026). */
export const DISPUTE_FEE_CENTS = 1_500;
export const DISPUTE_COUNTER_FEE_CENTS = 1_500;
/** One payment in a hundred disputed, lost in full with both fees: the card networks' monitoring threshold. */
export const DISPUTE_RESERVE_BPS = 100;
/** One payment in a hundred refunded in full. */
export const REFUND_RESERVE_BPS = 100;
/** Bringing the money from the company's account to the owner's: wire and exchange, a deliberately high allowance (IOF is a tax). */
export const REMITTANCE_BPS = 150;

/** A tax reading: what is inside the price, added on top, sent home, taken of profit and of revenue. */
export type Reading = {
  id: string;
  label: string;
  salesTaxInsideBps: number;
  salesTaxOnTopBps: number;
  remittanceBps: number;
  profitTaxBps: number;
  revenueTaxBps: number;
};

/** The sizing reading: limits are sized to keep 60% here (the most favorable reading the owner may later confirm). */
export const SIZING_READING: Reading = {
  id: "sizing",
  label: "Sizing reading: 27.5% on profit, the buyer's tax on top at 27%",
  salesTaxInsideBps: 0,
  salesTaxOnTopBps: 2_700,
  remittanceBps: REMITTANCE_BPS,
  profitTaxBps: STRESS_PROFIT_TAX_BPS,
  revenueTaxBps: 0,
};

/**
 * The reading with MORE tax for every open question (rule 19), as in
 * Hazelsong: 27% VAT inside every price; US federal 37% on effectively
 * connected income, California 13.3%, Brazil 27.5% and IOF 0.38% on profit,
 * added, with no credit (78.18%); ISS at 5% of revenue, not deductible; IOF
 * at 3.5% on what is sent home on top of the remittance allowance.
 */
export const MOST_TAX_READING: Reading = {
  id: "most-tax",
  label: "Most-tax reading: 27% VAT inside, 78.18% on profit, ISS 5% of revenue",
  salesTaxInsideBps: 2_700,
  salesTaxOnTopBps: 0,
  remittanceBps: REMITTANCE_BPS + 350,
  profitTaxBps: 3_700 + 1_330 + 2_750 + 38,
  revenueTaxBps: 500,
};

/**
 * EU hosting, so the LLC has no US-source income: Brazil 15% (Lei
 * 14.754/2023) + IOF 0.38% + California 13.3% on profit, on every customer;
 * ISS at 5% of revenue; the buyer's tax on top at 27%.
 */
export const EU_HOSTING_READING: Reading = {
  id: "eu-hosting",
  label: "EU hosting (no US tax): 28.68% on profit, ISS 5% of revenue, tax on top 27%",
  salesTaxInsideBps: 0,
  salesTaxOnTopBps: 2_700,
  remittanceBps: REMITTANCE_BPS,
  profitTaxBps: 1_500 + 38 + 1_330,
  revenueTaxBps: 500,
};

/** EU hosting with ISS at 0% (a Fortaleza consultation answered in the owner's favor). */
export const EU_HOSTING_ISS_ZERO: Reading = { ...EU_HOSTING_READING, id: "eu-iss0", label: "EU hosting, ISS 0% (Fortaleza consultation)", revenueTaxBps: 0 };
/** EU hosting with business-only sales: the buyer's tax on top at 15%, the realistic worst (US state tax, BC/SK/MB PST). */
export const EU_HOSTING_BUSINESS: Reading = { ...EU_HOSTING_READING, id: "eu-b2b", label: "EU hosting, business-only sales (tax on top 15%)", salesTaxOnTopBps: 1_500 };
/** All three design choices at once. */
export const EU_HOSTING_ISS_ZERO_BUSINESS: Reading = { ...EU_HOSTING_READING, id: "eu-iss0-b2b", label: "EU hosting, ISS 0% and business-only sales", revenueTaxBps: 0, salesTaxOnTopBps: 1_500 };
/** Business-only sales under the sizing reading. */
export const SIZING_BUSINESS: Reading = { ...SIZING_READING, id: "sizing-b2b", label: "Sizing reading, business-only sales (tax on top 15%)", salesTaxOnTopBps: 1_500 };

/** Every reading the alignment report prints, the sizing one first. */
export const READINGS: readonly Reading[] = [SIZING_READING, SIZING_BUSINESS, MOST_TAX_READING, EU_HOSTING_READING, EU_HOSTING_ISS_ZERO, EU_HOSTING_BUSINESS, EU_HOSTING_ISS_ZERO_BUSINESS];

const pct = (cents: number, bps: number) => Math.ceil((cents * bps) / 10_000);

/** What a price brings in once the sales tax inside it is taken out, rounded down. */
export function revenueOf(priceCents: number, reading: Reading = SIZING_READING): number {
  return Math.floor((priceCents * 10_000) / (10_000 + reading.salesTaxInsideBps));
}
/** What the buyer is charged for a price: the price plus the sales tax added on top, rounded up. */
export function chargedOf(priceCents: number, reading: Reading = SIZING_READING): number {
  return priceCents + pct(priceCents, reading.salesTaxOnTopBps);
}

/** The dearer provider's fee on one charge. A line on a renewal invoice (ownTransaction false) pays only the percentages. */
export function providerFeeCents(chargedCents: number, ownTransaction = true): number {
  const s = PROVIDER_FEES.stripe;
  const stripe = pct(chargedCents, s.cardBps) + pct(chargedCents, s.internationalBps) + pct(chargedCents, s.conversionBps) + pct(chargedCents, s.billingBps) + pct(chargedCents, s.taxBps) + (ownTransaction ? s.fixedCents : 0);
  const paddle = pct(chargedCents, PROVIDER_FEES.paddle.bps) + (ownTransaction ? PROVIDER_FEES.paddle.fixedCents : 0);
  return Math.max(stripe, paddle);
}

export type Receiving = {
  revenueCents: number;
  chargedCents: number;
  feeCents: number;
  remittanceCents: number;
  refundReserveCents: number;
  disputeReserveCents: number;
  totalCents: number;
};

/** What receiving one payment costs, every fee and reserve, in whole cents rounded up. */
export function receivingOf(priceCents: number, reading: Reading = SIZING_READING, ownTransaction = true): Receiving {
  const revenueCents = revenueOf(priceCents, reading);
  const chargedCents = chargedOf(priceCents, reading);
  const feeCents = providerFeeCents(chargedCents, ownTransaction);
  const remittanceCents = pct(revenueCents, reading.remittanceBps);
  const refundReserveCents = pct(revenueCents, REFUND_RESERVE_BPS);
  // A line on the renewal invoice is disputed with that invoice, whose own unit already reserves the fees.
  const disputeReserveCents = pct(chargedCents + (ownTransaction ? DISPUTE_FEE_CENTS + DISPUTE_COUNTER_FEE_CENTS : 0), DISPUTE_RESERVE_BPS);
  return { revenueCents, chargedCents, feeCents, remittanceCents, refundReserveCents, disputeReserveCents, totalCents: feeCents + remittanceCents + refundReserveCents + disputeReserveCents };
}

export type UnitResult = Receiving & {
  usageCents: number;
  costCents: number;
  pretaxCents: number;
  taxCents: number;
  netCents: number;
  /** Net over revenue, in basis points, rounded down. */
  netBps: number;
  /** The net the floor needs: 60% of revenue, rounded up. */
  floorCents: number;
  meetsFloor: boolean;
  /** How much more net the unit needs to keep 60%, in cents (0 when it does). */
  gapCents: number;
  /** The most usage may cost for the unit to keep 60% (negative when even no use misses). */
  usageRoomCents: number;
};

/** The profit and revenue taxes on a pretax profit. The profit tax is never below the stress floor. */
export function taxOf(revenueCents: number, pretaxCents: number, reading: Reading): number {
  const profitBps = Math.max(reading.profitTaxBps, STRESS_PROFIT_TAX_BPS);
  return pct(Math.max(0, pretaxCents), profitBps) + pct(revenueCents, reading.revenueTaxBps);
}

/** Whether a unit with this non-tax cost keeps the floor under a reading. */
function keeps(revenueCents: number, costCents: number, reading: Reading): boolean {
  const pretax = revenueCents - costCents;
  return pretax - taxOf(revenueCents, pretax, reading) >= pct(revenueCents, FLOOR_BPS);
}

/** The largest non-tax cost that still keeps 60% under a reading, in cents (negative when none does). */
export function costBudgetCents(revenueCents: number, reading: Reading): number {
  const profitBps = Math.max(reading.profitTaxBps, STRESS_PROFIT_TAX_BPS);
  const target = pct(revenueCents, FLOOR_BPS) + pct(revenueCents, reading.revenueTaxBps);
  let budget = revenueCents - Math.ceil((target * 10_000) / (10_000 - profitBps));
  while (budget > -revenueCents && !keeps(revenueCents, budget, reading)) budget -= 1;
  while (keeps(revenueCents, budget + 1, reading)) budget += 1;
  return budget;
}

/** One unit of sale under a reading: its price, its usage at full use (in cents), its receiving, its taxes and its net. */
export function unitUnder(priceCents: number, usageCents: number, reading: Reading = SIZING_READING, ownTransaction = true): UnitResult {
  const r = receivingOf(priceCents, reading, ownTransaction);
  const costCents = r.totalCents + usageCents;
  const pretaxCents = r.revenueCents - costCents;
  const taxCents = taxOf(r.revenueCents, pretaxCents, reading);
  const netCents = pretaxCents - taxCents;
  const floorCents = pct(r.revenueCents, FLOOR_BPS);
  const budget = costBudgetCents(r.revenueCents, reading);
  return {
    ...r,
    usageCents,
    costCents,
    pretaxCents,
    taxCents,
    netCents,
    netBps: r.revenueCents > 0 ? Math.floor((netCents * 10_000) / r.revenueCents) : 0,
    floorCents,
    meetsFloor: netCents >= floorCents,
    gapCents: Math.max(0, floorCents - netCents),
    usageRoomCents: budget - r.totalCents,
  };
}
