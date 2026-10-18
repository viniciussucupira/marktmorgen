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
import { LEGACY_PLAN_PRICES, PLAN_PRICES, PLAN_TITLES, TIERS, type Cycle, type Tier } from "@/lib/plan";
import { ADD_ON_ROOM_CENTS, ASSISTANT_MESSAGES_MONTHLY, ASSISTANT_PRICE_CENTS, assistantMonthWorst } from "@/lib/store-assistant-rules";
import { CENTS_PER_MINUTE, MAX_AUTO_LANGUAGES, MAX_AUTO_MINUTES, MIN_CENTS, autoCaptionCents } from "@/lib/auto-captions-rules";
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

/**
 * The base plans at a list of prices, the commission on sales counted as
 * zero: the price list in force (lib/plan.ts, since 18 October 2026 one list)
 * unless another is given, such as one published before that day.
 */
export function planUnits(plansOnSale: boolean, prices: Record<Tier, Record<Cycle, number>> = PLAN_PRICES, tag = "list"): Unit[] {
  return TIERS.flatMap((tier) =>
    (["month", "year"] as const).map((cycle) => ({
      id: `${tier}-${cycle}-${tag}`,
      name: `${PLAN_TITLES[tier]} ${cycle === "year" ? "yearly" : "monthly"} ($${(prices[tier][cycle] / 100).toLocaleString("en-US")})`,
      priceCents: prices[tier][cycle],
      usageCents: centsUp(months(cycle) * monthlyLines(tier) + perPaymentCost(tier)),
      coreUsageCents: centsUp(months(cycle) * monthlyLines(tier, PRINTED_CORE_LINES)),
      ownTransaction: true,
      onSale: plansOnSale,
    })),
  );
}

/** The room the spend floor test keeps under a unit when it is on sale (tests/spend-floor.test.ts, ADD_ON_ROOM_CENTS). */
export function roomKept(unit: Unit): number {
  if (unit.id === "store-assistant") return ADD_ON_ROOM_CENTS;
  if (unit.id.startsWith("captions")) return 0;
  return unit.id.includes("-year-") ? 100 : 25;
}

/** The lowest price, in whole cents, at which a unit's full use keeps 60% under the sizing reading (and with its room, when asked). */
export function floorPriceCents(usageCents: number, room = 0): number {
  let lo = 1, hi = 100_000_000;
  while (lo < hi) { const mid = Math.floor((lo + hi) / 2); const u = unitUnder(mid, usageCents + room, SIZING_READING, true); if (u.meetsFloor) hi = mid; else lo = mid + 1; }
  // The fee and the reserves round up by the cent, so the net is not monotone in the price near the edge: the lowest
  // price that keeps is looked for over the twenty dollars below the bisection's answer.
  let lowest = lo;
  for (let p = lo - 1; p >= Math.max(1, lo - 2_000); p -= 1) if (unitUnder(p, usageCents + room, SIZING_READING, true).meetsFloor) lowest = p;
  return lowest;
}

/** The Store assistant add-on, every reply of its month used at its worst. */
export function assistantUnit(onSale: boolean): Unit {
  const month = assistantMonthWorst();
  return { id: "store-assistant", name: `Store assistant add-on ($${ASSISTANT_PRICE_CENTS / 100}/mo, ${ASSISTANT_MESSAGES_MONTHLY} replies)`, priceCents: ASSISTANT_PRICE_CENTS, usageCents: month.aiCents, coreUsageCents: month.aiCents, ownTransaction: true, onSale };
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
  return [...planUnits(plansOnSale), assistantUnit(assistantOnSale), ...captionUnits(plansOnSale)];
}

export function evaluate(unit: Unit, reading: Reading = SIZING_READING): UnitResult {
  return unitUnder(unit.priceCents, unit.usageCents, reading, unit.ownTransaction);
}

const usd = (cents: number) => `${cents < 0 ? "−" : ""}$${(Math.abs(cents) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  out.push("Under that model no unit kept 60% at the prices published before the owner's decision. The owner's decision (18 October 2026, 11:21, in his words): \"preço: o que maximiza o meu lucro. limites: combinação que potencializa o que maximiza meu lucro + o que cliente percebe alto valor + não remover limites visíveis\", and (11:22) \"preço e limites = preço e limites de cada plano\". So the prices changed, no limit a customer sees was cut, and the commission variant became the same price list (docs/value-presentation-2026-10-18.md has the method and the competitors). Paid sales stay closed (lib/opening.ts, PLANS_ON_SALE, behind lib/commercial-margin.ts, the tax gate and the EU art. 9a gate).");
  out.push("");
  out.push("## Every unit at full use, sizing reading");
  out.push("");
  out.push("“Floor” is the lowest price at which the unit's full use keeps 60%; “with room” adds the room the spend floor test keeps under a unit on sale (25¢ a month, $1 a year, the add-on's 25¢). “Usage room” is the most the unit's use may cost at its price and keep 60%.");
  out.push("");
  out.push("| Unit | Revenue | Charged | Receiving | Usage at full use | Usage room | Floor | Floor with room | Net | Short of 60% | On sale |");
  out.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const unit of units) {
    const now = evaluate(unit);
    const captions = unit.id.startsWith("captions");
    const floor = captions ? "—" : usd(floorPriceCents(unit.usageCents));
    const withRoom = captions ? "—" : usd(floorPriceCents(unit.usageCents, roomKept(unit)));
    out.push(`| ${unit.name} | ${usd(now.revenueCents)} | ${usd(now.chargedCents)} | ${usd(now.totalCents)} | ${usd(unit.usageCents)} | ${usd(now.usageRoomCents)} | ${floor} | ${withRoom} | ${pctOf(now.netBps)} | ${now.meetsFloor ? "—" : usd(now.gapCents)} | ${unit.onSale ? "yes" : "no"} |`);
  }
  out.push("");
  const missing = units.filter((u) => !evaluate(u).meetsFloor);
  out.push(missing.length ? `${missing.length} of ${units.length} units miss 60% under the sizing reading: ${missing.map((u) => u.name).join("; ")}.` : `All ${units.length} units keep 60% under the sizing reading. AI captions (${usd(CENTS_PER_MINUTE)} a minute a language, never less than ${usd(MIN_CENTS)}) are shown at their worst length for each number of languages.`);
  out.push("");
  out.push("## Before the decision: the prices published until 18 October 2026, at the limits in force");
  out.push("");
  out.push("| Unit | Net at full use | Short of 60% |");
  out.push("| --- | --- | --- |");
  LEGACY_PLAN_PRICES.forEach((list, i) => {
    for (const unit of planUnits(false, list, `legacy${i}`)) {
      const now = evaluate(unit);
      out.push(`| ${unit.name}${i === 1 ? " with a share of each sale, counted as zero" : ""} | ${pctOf(now.netBps)} | ${now.meetsFloor ? "—" : usd(now.gapCents)} |`);
    }
  });
  out.push("");
  out.push("## Every reading, net kept");
  out.push("");
  out.push("The candidate design choices, each applied on its own and together. EU hosting removes the US federal tax (Brazil 15% + IOF 0.38% + California 13.3% on profit remain, and ISS 5% of revenue); ISS 0% needs a favorable answer to the Fortaleza consultation; business-only sales put the buyer's tax on top at 15% instead of 27%. The most-tax reading (rule 19) stacks every tax and must fail everywhere: it is the gate (lib/tax-gate.ts), so nothing opens.");
  out.push("");
  out.push(`| Unit | ${READINGS.map((r) => r.label).join(" | ")} |`);
  out.push(`| --- | ${READINGS.map(() => "---").join(" | ")} |`);
  for (const unit of units) out.push(`| ${unit.name} | ${READINGS.map((r) => pctOf(evaluate(unit, r).netBps)).join(" | ")} |`);
  out.push("");
  out.push("## For the owner");
  out.push("");
  out.push("- Nothing here opens a sale. The plans, the add-on and AI captions stay closed: the gate reading is the most-tax one (every unit far below 60%), EU art. 9a is not built (lib/deemed-supplier.ts), and the commercial review is still absent (lib/commercial-margin.ts).");
  out.push("- No limit a customer sees was cut. Each unit's price is at or above its floor with room; the room the round prices left was spent raising printed limits where competitors print more (docs/value-presentation-2026-10-18.md).");
  out.push("- The floor is about twenty times what a plan's full use costs, because receiving one payment takes about 12% of revenue (the fee on the price with the buyer's tax on top, remittance, refund and dispute reserves) and the 60% floor after a 27.5% tax leaves 17.24% for every cost; each dollar a month of use needs about twenty dollars of price.");
  out.push(`- AI captions are a charge of their own at ${usd(CENTS_PER_MINUTE)} a minute a language, never less than ${usd(MIN_CENTS)}, against a cost of up to 10¢ a minute a language and 10¢ more.`);
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
