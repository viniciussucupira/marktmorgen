/**
 * The margin alignment of 18 October 2026, as numbers: every plan, interval
 * and add-on at full use under the one receiving model of
 * lib/receiving-costs.ts, and the document that prints them
 * (docs/margin-alignment-2026-10-18.md).
 *
 * Nothing in the document is typed: `node scripts/margin-alignment.mjs`
 * writes it from renderMarginAlignment(), and tests/margin-alignment.test.ts
 * fails when the file on disk is not what this renders, so a change to a
 * price, a limit, a fee or a reading that is not regenerated is caught.
 */
import { PRICES_WITH_COMMISSION, PRICES_WITHOUT_COMMISSION, PLAN_TITLES, TIERS, type Cycle, type Tier } from "@/lib/plan";
import { ASSISTANT_PRICE_CENTS, assistantMonthWorst } from "@/lib/store-assistant-rules";
import { CENTS_PER_MINUTE, MAX_AUTO_LANGUAGES, MAX_AUTO_MINUTES, autoCaptionCents } from "@/lib/auto-captions-rules";
import {
  FLOOR_BPS, PROVIDER_FEES, READINGS, REFUND_RESERVE_BPS, DISPUTE_RESERVE_BPS, DISPUTE_FEE_CENTS, DISPUTE_COUNTER_FEE_CENTS,
  SIZING_READING, STRIPE_TOTAL_BPS, unitUnder, type Reading, type UnitResult,
} from "@/lib/receiving-costs";
import { COST_LINES, perPaymentCost } from "./plan-cost-registry";

/** The lines of the worst month whose figure is printed on the pricing and plan pages: visits, orders, video hours, storage, AI drafts and emails. */
export const PRINTED_CORE_LINES = ["storage", "video", "visits", "orders", "list-email", "transactional-email", "store-email", "ai"] as const;

const months = (cycle: Cycle) => (cycle === "year" ? 12 : 1);
const centsUp = (usd: number) => Math.ceil(Math.round(usd * 1e7) / 1e5);

export type Unit = {
  id: string;
  name: string;
  priceCents: number;
  /** Every line of the worst month for every window the payment reaches, and what it leaves after its plan ends, in cents. */
  usageCents: number;
  /** The same with every line but the printed core at zero: the most any cut to a hidden limit could ever save. */
  coreUsageCents: number;
  ownTransaction: boolean;
  /** Whether this unit can be bought today. */
  onSale: boolean;
};

function monthlyLines(tier: Tier, only?: readonly string[]): number {
  return COST_LINES.filter((line) => !only || only.includes(line.id)).reduce((sum, line) => sum + line.monthlyUsd(tier), 0);
}

/** The base plans at a schedule of prices, the commission on sales counted as zero. */
export function planUnits(schedule: "published" | "without", plansOnSale: boolean): Unit[] {
  const prices = schedule === "published" ? PRICES_WITH_COMMISSION : PRICES_WITHOUT_COMMISSION;
  return TIERS.flatMap((tier) =>
    (["month", "year"] as const).map((cycle) => ({
      id: `${tier}-${cycle}-${schedule}`,
      name: `${PLAN_TITLES[tier]} ${cycle === "year" ? "yearly" : "monthly"} ($${prices[tier][cycle] / 100})`,
      priceCents: prices[tier][cycle],
      usageCents: centsUp(months(cycle) * monthlyLines(tier) + perPaymentCost(tier)),
      coreUsageCents: centsUp(months(cycle) * monthlyLines(tier, PRINTED_CORE_LINES)),
      ownTransaction: true,
      onSale: plansOnSale,
    })),
  );
}

/** The Store assistant add-on, every reply of its month used at its worst. */
export function assistantUnit(onSale: boolean): Unit {
  const month = assistantMonthWorst();
  return { id: "store-assistant", name: `Store assistant add-on ($${ASSISTANT_PRICE_CENTS / 100}/mo)`, priceCents: ASSISTANT_PRICE_CENTS, usageCents: month.aiCents, coreUsageCents: month.aiCents, ownTransaction: true, onSale };
}

/** AI captions at their dearest per charge: the service's ten cents a minute a language, and a dime more for the spoken language counted apart. */
export function captionUnits(onSale: boolean): Unit[] {
  const worst: Unit[] = [];
  for (let languages = 1; languages <= MAX_AUTO_LANGUAGES; languages += 1) {
    let lowest: Unit | null = null;
    let lowestBps = Infinity;
    for (let minutes = 1; minutes <= MAX_AUTO_MINUTES; minutes += 1) {
      const priceCents = autoCaptionCents(minutes * 60, languages);
      const usageCents = minutes * (languages + 1) * 10;
      const bps = unitUnder(priceCents, usageCents, SIZING_READING, true).netBps;
      if (bps < lowestBps) {
        lowestBps = bps;
        lowest = { id: `captions-${languages}`, name: `AI captions, ${languages} language${languages > 1 ? "s" : ""} (${minutes} min, $${(priceCents / 100).toFixed(2)})`, priceCents, usageCents, coreUsageCents: usageCents, ownTransaction: true, onSale };
      }
    }
    worst.push(lowest!);
  }
  return worst;
}

export function allUnits(plansOnSale: boolean, assistantOnSale: boolean): Unit[] {
  // AI captions are charged only to a store with an active subscription (lib/auto-captions.ts), so they are sold only while the plans are.
  return [...planUnits("published", plansOnSale), ...planUnits("without", plansOnSale), assistantUnit(assistantOnSale), ...captionUnits(plansOnSale)];
}

export function evaluate(unit: Unit, reading: Reading = SIZING_READING): UnitResult {
  return unitUnder(unit.priceCents, unit.usageCents, reading, unit.ownTransaction);
}

const usd = (cents: number) => `${cents < 0 ? "−" : ""}$${(Math.abs(cents) / 100).toFixed(2)}`;
const pctOf = (bps: number) => `${bps < 0 ? "−" : ""}${(Math.abs(bps) / 100).toFixed(2)}%`;

export function renderMarginAlignment(plansOnSale: boolean, assistantOnSale: boolean): string {
  const units = allUnits(plansOnSale, assistantOnSale);
  const out: string[] = [];
  out.push("# Margin alignment, 18 October 2026");
  out.push("");
  out.push("<!-- Generated by `node scripts/margin-alignment.mjs` from tests/margin-alignment-table.ts. Do not edit by hand: tests/margin-alignment.test.ts fails when this file is stale. -->");
  out.push("");
  out.push("Marktmorgen's base plans were held to a lighter fee model than its own Store assistant add-on and than Hazelsong: 2.9% + 0.7% + 30¢ on the price, with no remittance, refund or dispute reserve (tests/plan-cost-model.ts before this change). Since 18 October 2026 every plan, interval and add-on is held to one model, lib/receiving-costs.ts, aligned with Hazelsong's WORST_CASE:");
  out.push("");
  out.push(`- the dearer, per charge, of Stripe with every surcharge (${STRIPE_TOTAL_BPS / 100}% + ${PROVIDER_FEES.stripe.fixedCents}¢) and Paddle (${PROVIDER_FEES.paddle.bps / 100}% + ${PROVIDER_FEES.paddle.fixedCents}¢), on the amount charged: the price plus the buyer's sales tax added on top at ${SIZING_READING.salesTaxOnTopBps / 100}%;`);
  out.push(`- remittance of ${SIZING_READING.remittanceBps / 100}% of revenue, a refund reserve of ${REFUND_RESERVE_BPS / 100}% of revenue, and a dispute reserve of ($${(DISPUTE_FEE_CENTS + DISPUTE_COUNTER_FEE_CENTS) / 100} + the amount charged) × ${DISPUTE_RESERVE_BPS / 100}%;`);
  out.push(`- a profit tax of at least ${SIZING_READING.profitTaxBps / 100}% (the sizing reading), and the floor: ${FLOOR_BPS / 100}% of revenue kept after every cost and every tax;`);
  out.push("- every allowance of the plan used in full, for every window one payment reaches (one a month, twelve a year), plus what the store keeps after its plan ends; the commission on sales counted as zero.");
  out.push("");
  out.push("The owner's decision (18 October 2026): no cut to any limit the customer sees, no price change, no change to the number of plans. Paid sales stay closed (lib/opening.ts, PLANS_ON_SALE, behind lib/commercial-margin.ts).");
  out.push("");
  out.push("## Every unit at full use, sizing reading");
  out.push("");
  out.push("“Was” is the model each unit was held to before this change (a plan: 3.6% + 30¢ on the price, no reserve; the add-on: 6.6% + 30¢ on the price with its reserves; AI captions: the card's 2.9% + 30¢); “Now” is the aligned one. “Usage room” is the most the unit's use may cost and keep 60%; “Printed lines only” is the net if every line of the worst month other than the printed ones (storage, video hours, visits, orders, emails, AI drafts) cost nothing, which bounds what any cut to a hidden limit could ever achieve.");
  out.push("");
  out.push("| Unit | Revenue | Charged | Receiving | Usage at full use | Usage room | Net, was | Net, now | Short of 60% | Printed lines only | On sale |");
  out.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const unit of units) {
    const now = evaluate(unit);
    const was = wasNetBps(unit);
    const core = unitUnder(unit.priceCents, unit.coreUsageCents, SIZING_READING, unit.ownTransaction);
    out.push(`| ${unit.name} | ${usd(now.revenueCents)} | ${usd(now.chargedCents)} | ${usd(now.totalCents)} | ${usd(unit.usageCents)} | ${usd(now.usageRoomCents)} | ${pctOf(was)} | ${pctOf(now.netBps)} | ${now.meetsFloor ? "—" : usd(now.gapCents)} | ${pctOf(core.netBps)} | ${unit.onSale ? "yes" : "no"} |`);
  }
  out.push("");
  const missing = units.filter((u) => !evaluate(u).meetsFloor);
  const coreMissing = missing.filter((u) => !unitUnder(u.priceCents, u.coreUsageCents, SIZING_READING, u.ownTransaction).meetsFloor);
  out.push(`${missing.length} of ${units.length} units miss 60% under the sizing reading. ${coreMissing.length} of those would still miss with every hidden line at zero, so no cut to a limit the customer never sees can close them; ${missing.length - coreMissing.length === 0 ? "none" : missing.length - coreMissing.length} could be closed that way.`);
  out.push("");
  out.push("## What would close the gap: every reading, net kept");
  out.push("");
  out.push("The candidate design choices, each applied on its own and together. EU hosting removes the US federal tax (Brazil 15% + IOF 0.38% + California 13.3% on profit remain, and ISS 5% of revenue); ISS 0% needs a favorable answer to the Fortaleza consultation; business-only sales put the buyer's tax on top at 15% instead of 27%. The most-tax reading (rule 19) stacks every tax and must fail everywhere.");
  out.push("");
  out.push(`| Unit | ${READINGS.map((r) => r.label).join(" | ")} |`);
  out.push(`| --- | ${READINGS.map(() => "---").join(" | ")} |`);
  for (const unit of units) out.push(`| ${unit.name} | ${READINGS.map((r) => pctOf(evaluate(unit, r).netBps)).join(" | ")} |`);
  out.push("");
  const closers = READINGS.slice(1).filter((r) => r.id !== "most-tax");
  const closedBy = missing.map((u) => ({ u, by: closers.filter((r) => evaluate(u, r).meetsFloor).map((r) => r.label) }));
  out.push("## Which unit misses, by how much, and what would close it");
  out.push("");
  out.push("| Unit | Net now | Short of 60% | Use would have to fall by | Closed by a candidate reading |");
  out.push("| --- | --- | --- | --- | --- |");
  for (const { u, by } of closedBy) {
    const now = evaluate(u);
    const cut = u.usageCents - Math.max(0, now.usageRoomCents);
    const share = u.usageCents > 0 ? Math.round((cut * 10_000) / u.usageCents) : 0;
    out.push(`| ${u.name} | ${pctOf(now.netBps)} | ${usd(now.gapCents)} | ${now.usageRoomCents < 0 ? `all of it, and receiving alone misses by ${usd(-now.usageRoomCents)}` : `${usd(cut)} (${pctOf(share)} of its use)`} | ${by.length ? by.join("; ") : "none"} |`);
  }
  out.push("");
  out.push("## For the owner");
  out.push("");
  out.push("- Nothing here opens a sale. The plans, the add-on and AI captions stay closed: no unit on sale may miss 60% (tests/spend-floor.test.ts), and the commercial review is still absent (lib/commercial-margin.ts).");
  const plans = missing.filter((u) => !u.id.startsWith("captions") && u.id !== "store-assistant");
  const plansCore = plans.filter((u) => coreMissing.includes(u));
  const anyCloser = closedBy.some(({ by }) => by.length > 0);
  out.push(`- No hidden limit was lowered: the “Printed lines only” column shows that with every limit the customer never sees at zero, ${plansCore.length} of the ${plans.length} base-plan units that miss still miss, so such a cut cannot close them. Every cut that could is to a printed limit (visits, orders, video hours, storage, AI drafts, emails), which the owner has ruled out.`);
  out.push(`- ${anyCloser ? "Some units are closed by a candidate reading (table above); the rest are not." : "None of the candidate design choices closes any unit that misses, on its own or together"}: receiving one payment and using the plan in full take more than the floor leaves of revenue (17.24% after a 27.5% tax, less under every candidate reading, whose profit tax is higher). What would close the base plans: a price change, cuts to printed limits, or a cheaper way to receive payments (for example without the Stripe Tax and Billing surcharges, or domestic cards only), each the owner's decision.`);
  out.push(`- The Store assistant add-on misses by ${usd(evaluate(assistantUnit(false)).gapCents)}: the one lever that is not a printed limit is the input it sends the model for each reply (lib/store-assistant-rules.ts, ASSISTANT_INPUT_BYTES and ASSISTANT_FACTS_BYTES), and cutting it shortens the catalog the assistant reads for a buyer's question, which a buyer sees; it was not cut.`);
  out.push("- Use past a plan (visits, orders, video hours) is not sold since 17 October 2026, so it is no unit here; at the old published prices it would not pay its way under this model either (tests/plan-margin.test.ts).");
  out.push(`- AI captions are a charge of their own at ${CENTS_PER_MINUTE}¢ a minute a language against a cost of up to 10¢ a minute a language and 10¢ more: their price, not a hidden limit, is what misses.`);
  out.push("");
  return `${out.join("\n")}`;
}

/**
 * The net share under the model each unit was held to before this change, at
 * 27.5% on profit: a plan at 2.9% + 0.7% + 30 cents on the price with no
 * reserve; the add-on at 6.6% + 30 cents on the price with its reserves; AI
 * captions at the card's 2.9% + 30 cents.
 */
export function wasNetBps(unit: Unit): number {
  const p = unit.priceCents;
  const up = (cents: number, bps: number) => Math.ceil((cents * bps) / 10_000);
  const receiving = unit.id === "store-assistant"
    ? up(p, 660) + 30 + up(p, 150) + up(p, 100) + up(p + 3000, 100)
    : unit.id.startsWith("captions") ? up(p, 290) + 30 : up(p, 360) + 30;
  const pretax = p - receiving - unit.usageCents;
  const net = pretax - up(Math.max(0, pretax), 2750);
  return Math.floor((net * 10_000) / p);
}
