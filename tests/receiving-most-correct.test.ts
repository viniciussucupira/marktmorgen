import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MOST_CORRECT_READING, MOST_TAX_READING, READINGS, SIZING_READING,
  STRESS_PROFIT_TAX_BPS, mostCorrectTaxesOf, unitUnder,
  type MostCorrectTaxBases } from "../lib/receiving-costs";
import { GATE_READING_ID, gateReading, CONSULTATION_ANSWERS, EU_HOSTING_CONFIRMED } from "../lib/tax-gate";
import { PLANS_ON_SALE } from "../lib/opening";
import { CURRENT_COMMERCIAL_MARGIN_REVIEW } from "../lib/commercial-margin";

const bases = (profit: number, entries: number[]): MostCorrectTaxBases =>
  ({ currency: "BRL", annualProfitCents: profit, incomingExchangeCents: entries });
const calculate = (value: unknown) => mostCorrectTaxesOf(value as MostCorrectTaxBases);

test("IRPF is annual even while all profit remains abroad; exchange entries are a separate base", () => {
  assert.deepEqual(calculate(bases(1_000_000, [])), { currency: "BRL",
    annualProfitCents: 1_000_000, incomingExchangeCents: 0,
    irpfCents: 150_000, iofCents: 0, totalTaxCents: 150_000 });
  assert.deepEqual(calculate(bases(1_000_000, [200_000, 300_000])), { currency: "BRL",
    annualProfitCents: 1_000_000, incomingExchangeCents: 500_000,
    irpfCents: 150_000, iofCents: 1_900, totalTaxCents: 151_900 });
  // Full profit as an entry is explicit, never inferred or reduced by IRPF.
  assert.equal(calculate(bases(1_000_000, [1_000_000]))?.totalTaxCents, 153_800);
});

test("an entry of previously taxed profit creates IOF without taxing that profit again", () => {
  assert.deepEqual(calculate(bases(0, [1_000_000])), { currency: "BRL",
    annualProfitCents: 0, incomingExchangeCents: 1_000_000,
    irpfCents: 0, iofCents: 3_800, totalTaxCents: 3_800 });
  assert.equal(calculate(bases(-1_000_000, [1_000_000]))?.totalTaxCents, 3_800);
});

test("ceilings round each actual exchange entry up separately, with exact safe integer arithmetic", () => {
  assert.equal(calculate(bases(1, [1, 1]))?.totalTaxCents, 3);
  assert.equal(calculate(bases(1, [2]))?.totalTaxCents, 2);
  const large = Number.MAX_SAFE_INTEGER;
  const expected = (BigInt(large) * BigInt(1500) + BigInt(9999)) / BigInt(10000);
  assert.equal(calculate(bases(large, []))?.irpfCents, Number(expected));
  assert.equal(calculate(bases(1, [large, 1])), null);
  assert.equal(calculate(bases(1, [0]))?.iofCents, 0);
});

test("unknown profit, exchange coverage or currency refuses instead of becoming zero", () => {
  for (const value of [null, undefined, {}, [], { ...bases(1, []), currency: "USD" },
    { ...bases(1, []), currency: null }, { annualProfitCents: 1, incomingExchangeCents: [] },
    { ...bases(1, []), annualProfitCents: null }, { ...bases(1, []), annualProfitCents: NaN },
    { ...bases(1, []), annualProfitCents: Infinity }, { ...bases(1, []), annualProfitCents: 0.5 },
    { ...bases(1, []), annualProfitCents: Number.MAX_SAFE_INTEGER + 1 },
    { ...bases(1, []), incomingExchangeCents: null }, { currency: "BRL", annualProfitCents: 1 },
    { ...bases(1, []), incomingExchangeCents: [null] }, { ...bases(1, []), incomingExchangeCents: [-1] },
    { ...bases(1, []), incomingExchangeCents: [NaN] }, { ...bases(1, []), incomingExchangeCents: [0.1] },
    { ...bases(1, []), incomingExchangeCents: new Array(1) },
    Object.create(bases(1, []))]) assert.equal(calculate(value), null);
});

test("accessors and inherited array entries are not evidence and never execute", () => {
  let reads = 0;
  const getter = { get() { reads += 1; throw new Error("must not execute"); } };
  for (const key of ["currency", "annualProfitCents", "incomingExchangeCents"]) {
    const value = Object.defineProperty(bases(1, []), key, getter);
    assert.equal(calculate(value), null);
  }
  const entries = Object.defineProperty([0], "0", getter);
  assert.equal(calculate({ ...bases(1, []), incomingExchangeCents: entries }), null);
  const inherited = new Array(1);
  Object.setPrototypeOf(inherited, { 0: 100 });
  assert.equal(calculate({ ...bases(1, []), incomingExchangeCents: inherited }), null);
  const unreadable = new Proxy(bases(1, []), { getOwnPropertyDescriptor() { throw new Error("unknown"); } });
  assert.equal(calculate(unreadable), null);
  assert.equal(reads, 0);
});

test("the explicit TX scenario does not change any binding tax reading, floor or sale gate", () => {
  assert.deepEqual([MOST_CORRECT_READING.id, MOST_CORRECT_READING.profitTaxBps,
    MOST_CORRECT_READING.incomingExchangeIofBps, MOST_CORRECT_READING.revenueTaxBps,
    MOST_CORRECT_READING.salesTaxInsideBps, MOST_CORRECT_READING.salesTaxOnTopBps],
    ["most-correct", 1500, 38, 0, 0, 2700]);
  assert.equal(Object.isFrozen(MOST_CORRECT_READING), true);
  assert.equal(READINGS.includes(MOST_CORRECT_READING), false);
  assert.match(readFileSync("lib/opening.ts", "utf8"), /const OPENING_REQUESTED: boolean = false;/);
  assert.equal(GATE_READING_ID, "most-tax");
  assert.equal(gateReading(), MOST_TAX_READING);
  assert.deepEqual([MOST_TAX_READING.profitTaxBps, MOST_TAX_READING.revenueTaxBps,
    MOST_TAX_READING.salesTaxInsideBps, STRESS_PROFIT_TAX_BPS, SIZING_READING.profitTaxBps],
    [7818, 500, 2700, 2750, 2750]);
  assert.equal(unitUnder(100_000, 0, MOST_CORRECT_READING).taxCents,
    unitUnder(100_000, 0, SIZING_READING).taxCents);
  assert.deepEqual([PLANS_ON_SALE, EU_HOSTING_CONFIRMED,
    CONSULTATION_ANSWERS.length, CURRENT_COMMERCIAL_MARGIN_REVIEW], [false, false, 0, null]);
});
