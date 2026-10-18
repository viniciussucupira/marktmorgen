/**
 * The margin alignment of 18 October 2026 (docs/margin-alignment-2026-10-18.md):
 * one receiving model for every plan, interval and add-on, every unit at full
 * use, and the document that prints it, which must be what
 * tests/margin-alignment-table.ts renders today. Regenerate it with
 * `node scripts/margin-alignment.mjs`; never edit its figures by hand.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PRICES_WITH_COMMISSION, TIERS } from "@/lib/plan";
import { ASSISTANT_ON_SALE, PLANS_ON_SALE } from "@/lib/opening";
import { commercialMarginReady } from "@/lib/commercial-margin";
import { maximumPretaxCostCents } from "@/lib/cost-envelope";
import { PLANNING_PROFIT_TAX_FLOOR_BPS } from "@/lib/net-margin-rules";
import { ASSISTANT_PRICE_CENTS, addOnFeeCents, assistantMeetsFloor, assistantMonthWorst } from "@/lib/store-assistant-rules";
import {
  MOST_TAX_READING, READINGS, SIZING_READING, STRESS_PROFIT_TAX_BPS, costBudgetCents, providerFeeCents, receivingOf, unitUnder,
} from "@/lib/receiving-costs";
import { allUnits, evaluate, floorPriceCents, renderMarginAlignment, roomKept } from "./margin-alignment-table";
import { netOf } from "./plan-cost-model";

const DOC = "docs/margin-alignment-2026-10-18.md";

test("the document is what the numbers render today (run node scripts/margin-alignment.mjs)", () => {
  const onDisk = readFileSync(join(process.cwd(), DOC), "utf8");
  assert.equal(onDisk, renderMarginAlignment(PLANS_ON_SALE, ASSISTANT_ON_SALE), `${DOC} is stale: run node scripts/margin-alignment.mjs`);
});

test("one model: the fee is the dearer provider's on the amount charged, with the buyer's tax on top", () => {
  // $22: $27.94 charged; Stripe 2.9 + 1.5 + 1 + 0.7 + 0.5 on it, each rounded up, and 30 cents.
  const r = receivingOf(2_200);
  assert.deepEqual([r.revenueCents, r.chargedCents, r.feeCents, r.remittanceCents, r.refundReserveCents, r.disputeReserveCents], [2_200, 2_794, 216, 33, 22, 58]);
  assert.equal(providerFeeCents(10_000, false), 660, "a line on a renewal invoice pays only the percentages");
  // The add-on and the plans read the same function.
  assert.equal(addOnFeeCents(), providerFeeCents(receivingOf(ASSISTANT_PRICE_CENTS).chargedCents));
  const month = assistantMonthWorst();
  assert.equal(month.totalCents, receivingOf(ASSISTANT_PRICE_CENTS).totalCents + month.aiCents);
  for (const tier of TIERS) for (const cycle of ["month", "year"] as const) {
    const received = receivingOf(PRICES_WITH_COMMISSION[tier][cycle]);
    const net = netOf(tier, cycle, PRICES_WITH_COMMISSION) * (cycle === "year" ? 12 : 1);
    assert.ok(Math.abs(net * 100 - (received.revenueCents - received.totalCents)) < 1e-6, `${tier} ${cycle}: netOf must be the receiving model`);
  }
});

test("the sizing reading's cost budget is the cost envelope's, at the 27.5% floor", () => {
  assert.equal(SIZING_READING.profitTaxBps, PLANNING_PROFIT_TAX_FLOOR_BPS);
  for (const cents of [2_200, 2_900, 4_900, 14_900, 149_000, 349_000]) assert.equal(costBudgetCents(cents, SIZING_READING), maximumPretaxCostCents(cents, PLANNING_PROFIT_TAX_FLOOR_BPS));
  // And a unit one cent past the budget misses, one at it keeps the floor.
  const budget = costBudgetCents(14_900, SIZING_READING);
  const fee = receivingOf(14_900).totalCents;
  assert.equal(unitUnder(14_900, budget - fee).meetsFloor, true);
  assert.equal(unitUnder(14_900, budget - fee + 1).meetsFloor, false);
});

test("no reading taxes profit below the 27.5% stress floor", () => {
  for (const reading of READINGS) assert.ok(Math.max(reading.profitTaxBps, STRESS_PROFIT_TAX_BPS) >= STRESS_PROFIT_TAX_BPS);
  const under = { ...SIZING_READING, profitTaxBps: 1_000 };
  assert.equal(unitUnder(14_900, 0, under).taxCents, unitUnder(14_900, 0, SIZING_READING).taxCents);
});

test("under the most-tax reading every unit fails, even with nothing used", () => {
  for (const unit of allUnits(PLANS_ON_SALE, ASSISTANT_ON_SALE)) {
    assert.equal(evaluate(unit, MOST_TAX_READING).meetsFloor, false, unit.id);
    assert.equal(unitUnder(unit.priceCents, 0, MOST_TAX_READING, unit.ownTransaction).meetsFloor, false, `${unit.id} with no use`);
  }
});

test("no unit on sale misses 60%, and while any misses, nothing is on sale", () => {
  const units = allUnits(PLANS_ON_SALE, ASSISTANT_ON_SALE);
  for (const unit of units) if (unit.onSale) assert.equal(evaluate(unit).meetsFloor, true, `${unit.id} is on sale and misses 60%`);
  if (units.some((unit) => !evaluate(unit).meetsFloor)) {
    assert.equal(PLANS_ON_SALE, false);
    assert.equal(ASSISTANT_ON_SALE, false);
    assert.equal(commercialMarginReady(), false);
  }
  assert.equal(assistantMeetsFloor(), evaluate(units.find((u) => u.id === "store-assistant")!).meetsFloor && assistantMonthWorst().roomCents >= 25);
});

test("every unit on the price list (owner, 18 October 2026, 11:21) keeps 60% at full use, at or above its floor with the room kept", () => {
  for (const unit of allUnits(PLANS_ON_SALE, ASSISTANT_ON_SALE)) {
    assert.equal(evaluate(unit).meetsFloor, true, `${unit.id} misses 60% at full use`);
    if (unit.id.startsWith("captions")) continue;
    const floor = floorPriceCents(unit.usageCents);
    // The floor is exact: one cent less misses.
    assert.equal(unitUnder(floor, unit.usageCents).meetsFloor, true);
    assert.equal(unitUnder(floor - 1, unit.usageCents).meetsFloor, false, `${unit.id}: the floor is not the lowest price`);
    assert.ok(unit.priceCents >= floorPriceCents(unit.usageCents, roomKept(unit)), `${unit.id}: $${unit.priceCents / 100} is under its floor with room`);
  }
  // The yearly price is ten monthly payments on every plan, and still keeps the room.
  for (const tier of TIERS) assert.equal(PRICES_WITH_COMMISSION[tier].year, PRICES_WITH_COMMISSION[tier].month * 10);
});

test("the value presentation prints the price list and the floors in force as the code computes them", () => {
  const doc = readFileSync(join(process.cwd(), "docs/value-presentation-2026-10-18.md"), "utf8");
  const usd = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
  const usd2 = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  for (const unit of allUnits(PLANS_ON_SALE, ASSISTANT_ON_SALE).filter((u) => !u.id.startsWith("captions"))) {
    assert.ok(doc.includes(`**${usd(unit.priceCents)}`), `${unit.id}: the price ${usd(unit.priceCents)} is not in the value presentation`);
    assert.ok(doc.includes(usd2(floorPriceCents(unit.usageCents))), `${unit.id}: its floor ${usd2(floorPriceCents(unit.usageCents))} is not in the value presentation`);
    assert.ok(doc.includes(usd2(floorPriceCents(unit.usageCents, roomKept(unit)))), `${unit.id}: its floor with room is not in the value presentation`);
    assert.ok(doc.includes(`${(evaluate(unit).netBps / 100).toFixed(2)}%`), `${unit.id}: its net is not in the value presentation`);
  }
  assert.match(doc, /preço: o que maximiza o meu lucro/);
  assert.doesNotMatch(doc, /\bsmall\b|unlimited (visits|orders|emails|storage) on (Store|Studio|Scale)/i);
});
