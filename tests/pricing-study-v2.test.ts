/**
 * The pricing study v2 of 18 October 2026 (docs/pricing-study-v2-2026-10-18.md):
 * an ANALYSIS, no price, limit, gate, commission switch or tax assumption in
 * code changes. The solver's input must be what the repository's margin code
 * and the sourced dataset give today; every plan of every design in its output
 * must keep 60% at full use under that code (and fail under the most-tax
 * reading); the program's value must equal a deterministic evaluation written
 * here, independently of the Python, and brute force for one and two plans;
 * and the document must be what renders today. Regenerate with
 * `node scripts/pricing-study-v2.mjs` (needs python3 with scipy). This test
 * needs no Python: it checks the solver's output, it does not run the solver.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PLANS_ON_SALE } from "@/lib/opening";
import { COMMISSION_BPS, COMMISSION_LIVE, PLAN_PRICES, TIERS } from "@/lib/plan";
import { figures } from "./limits-proposal-table";
import { GB } from "./plan-cost-registry";
import { planUnits } from "./margin-alignment-table";
import { SIZING_READING, unitUnder } from "@/lib/receiving-costs";
import type { Cycle, Tier } from "@/lib/plan";
import {
  DATA_FILE, DOC_FILE, INPUT_FILE, MODEL, TEMPLATES, TODAY_IDS, antiStan, candidateById, candidates, cashPath, composition, dataset,
  frontierOf, inPool, isStanProof, ownersChoice, planUnit, pools, renderPricingStudyV2, usageAt, studyInput, studyOutput, verifiedDesign, type StudyInput,
} from "./pricing-study-v2-table";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

test("it changes nothing in force: today's prices, no commission live, nothing on sale", () => {
  assert.deepEqual(PLAN_PRICES, { creator: { month: 6900, year: 69000 }, pro: { month: 44900, year: 449000 }, scale: { month: 99900, year: 999000 } });
  assert.equal(COMMISSION_LIVE, false);
  assert.equal(PLANS_ON_SALE, false);
  assert.deepEqual(COMMISSION_BPS, { creator: 625, pro: 275, scale: 0 });
});

test("every competitor figure has its page and the day it was read", () => {
  const d = dataset();
  assert.equal(d.accessed, "18 October 2026");
  const ids = new Set(d.sources.map((s) => s.id));
  for (const s of d.sources) {
    assert.match(s.url, /^https:\/\//, s.id);
    assert.match(s.accessed, /2026$/, s.id);
  }
  for (const v of d.vendors) {
    assert.ok(v.sources.length > 0, v.name);
    for (const s of v.sources) assert.ok(ids.has(s), `${v.name} cites ${s}, which is not in ${DATA_FILE}`);
  }
});

test("today's three plans enter the study with today's prices and printed figures", () => {
  for (const tier of TIERS) {
    const c = candidateById(TODAY_IDS[TIERS.indexOf(tier)]);
    assert.equal(c.monthCents, PLAN_PRICES[tier].month);
    assert.equal(c.share, 1);
    const f = figures(tier);
    assert.equal(c.figures.visits, f.visits[0]);
    assert.equal(c.figures.orders, f.orders[0]);
    assert.equal(c.figures.listEmails, f["list-email"][0]);
    assert.equal(c.figures.storageGb, f.storage[0] / GB);
    assert.equal(c.figures.aiJobs, f.ai[0]);
  }
  for (const c of candidates()) {
    if (TEMPLATES[c.template].today) assert.equal(c.share, 1, `${c.id}: today's plans keep every figure`);
    assert.ok(c.netBps.month >= 6_000 && c.netBps.year >= 6_000, `${c.id} keeps 60%`);
  }
});

test("at full size the study's usage and margins are the margin alignment's, unit for unit", () => {
  for (const u of planUnits(false)) {
    const [tier, cycle] = u.id.split("-") as [Tier, Cycle];
    assert.equal(usageAt(tier, cycle, 1), u.usageCents, `${u.id}: usage`);
    const ours = planUnit(tier, cycle, PLAN_PRICES[tier].month, 1);
    assert.equal(ours.netCents, unitUnder(u.priceCents, u.usageCents, SIZING_READING, true).netCents, `${u.id}: net`);
  }
});

test("the solver's input is what the repository's margin code gives today (run node scripts/pricing-study-v2.mjs)", () => {
  const close = (a: unknown, b: unknown, path: string): void => {
    if (typeof a === "number" && typeof b === "number") { assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a)), `${INPUT_FILE} is stale at ${path}: ${a} against ${b}`); return; }
    if (a && b && typeof a === "object" && typeof b === "object") {
      assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort(), `${INPUT_FILE} is stale at ${path}`);
      for (const k of Object.keys(a)) close((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`);
      return;
    }
    assert.equal(a, b, `${INPUT_FILE} is stale at ${path}`);
  };
  close(JSON.parse(read(INPUT_FILE)), JSON.parse(JSON.stringify(studyInput())), "input");
});

test("every plan of every design keeps 60% with room on both intervals and fails under the most-tax reading", () => {
  const out = studyOutput();
  const seen = new Set<string>();
  for (const d of out.designs) for (const id of d.plans) seen.add(id);
  for (const id of seen) {
    const [v] = verifiedDesign([id]);
    assert.ok(v.keeps && v.month.netBps >= 6_000 && v.year.netBps >= 6_000, id);
    assert.equal(v.mostTax.meetsFloor, false, `${id} must stay closed under the most-tax reading`);
  }
  const rec = out.designs.find((d) => d.id === out.recommended)!;
  assert.ok(rec.admissible, "the recommendation keeps today's three plans, so no visible limit is removed");
  for (const t of ["creator", "pro", "scale"] as const) assert.ok(rec.plans.some((id) => candidateById(id).template === t), t);
});

// ------------------------------------------------------------- the deterministic model, written again

type Params = { eta: number; asc: number; paymentsAsc: number; hassle: number; aov: number; conv: number; epo: number; usage: number; yearly: number; churn: readonly number[]; horizon: number };
const baseParams = (D: StudyInput): Params => {
  const M = D.model;
  return { eta: M.base.eta, asc: M.base.asc, paymentsAsc: M.paymentsAsc, hassle: M.hassleUsd, aov: M.aovUsd.base, conv: M.conversion.base, epo: M.emailsPerOrder.base, usage: M.usage.base, yearly: M.yearlyShare.base, churn: M.churn.base, horizon: M.horizon.base };
};
/** Each candidate in each sales bin, written again from the input alone: all-in cost, monthly profit, room above 60% at full use, and whether it can serve the bin; and the competitors' inclusive value. */
function cells(D: StudyInput, withPacks: boolean, p: Params) {
  const M = D.model;
  const G = D.bins.middles;
  const proc = D.processing.bps / 10_000, procFixed = D.processing.fixedCents / 100;
  const orders = G.map((g) => g / p.aov), visits = orders.map((o) => o / p.conv), emails = G.map((g, b) => (g >= M.emailFromUsd ? p.epo * orders[b] : 0));
  const inc = G.map((g, b) => {
    const us = D.competitors.map((c) => {
      let cost = c.monthlyUsd + (c.feeBps / 10_000) * g + (c.feeFixedCents / 100) * orders[b];
      if (!c.includesProcessing) cost += proc * g + procFixed * orders[b];
      const ok = c.emailCap === null || emails[b] <= c.emailCap;
      return ok ? (c.kind === "payments" ? p.paymentsAsc : 0) - p.eta * Math.log(cost + p.hassle) : -Infinity;
    });
    const m = Math.max(...us);
    return m + Math.log(us.reduce((s, u) => s + Math.exp(u - m), 0));
  });
  const packs = Object.fromEntries(D.packs.map((x) => [x.id, x]));
  const packCost = (over: number, small: string, large: string): [number, number, number] => {
    if (over <= 0) return [0, 0, 0];
    const s = packs[small], l = packs[large];
    let best: [number, number, number] | null = null;
    for (let nl = 0; nl <= Math.ceil(over / l.units); nl += 1) {
      const ns = Math.max(0, Math.ceil((over - nl * l.units) / s.units));
      const price = nl * l.priceCents + ns * s.priceCents;
      if (!best || price < best[0]) best = [price, nl * l.netCents + ns * s.netCents, nl + ns];
    }
    return [best![0] / 100, best![1] / 100, best![2]];
  };
  const keys = [0, 15, 30, 60, 100];
  const interp = (table: Record<string, number>, u: number) => {
    const pts = keys.map((k) => table[`u${k}`]);
    const x = u * 100;
    for (let i = 0; i < keys.length - 1; i += 1) if (x <= keys[i + 1]) return (pts[i] + ((pts[i + 1] - pts[i]) * (x - keys[i])) / (keys[i + 1] - keys[i])) / 100;
    return pts[pts.length - 1] / 100;
  };
  const netAt = (c: (typeof D.candidates)[number], u: number) => (1 - p.yearly) * interp(c.netMonthCents, u) + p.yearly * interp(c.netYearMonthCents, u);
  const table = D.candidates.map((c) => {
    const comm = c.commissionBps / 10_000;
    const f = c.figures;
    return G.map((g, b) => {
      let cost = c.monthCents / 100 + comm * g + proc * g + procFixed * orders[b];
      let prof = netAt(c, p.usage) + D.commissionKeep.sizing * comm * g;
      let head = c.headroomMonthCents / 100;
      let ok = true, count = 0;
      for (const [need, cap, small, large, allowed] of [
        [visits[b], f.visits, "visits", "visits-x4", true], [orders[b], f.orders, "orders", "orders-x4", true], [emails[b], f.listEmails, "list-email", "list-email-x4", f.listEmails > 0],
      ] as [number, number, string, string, boolean][]) {
        if (need <= cap) continue;
        if (!withPacks || !allowed) { ok = false; break; }
        const [pc, pn, n] = packCost(need - cap, small, large);
        cost += pc; prof += pn; head += pn - 0.6 * pc; count += n;
      }
      if (ok && count > M.maxPacks) ok = false;
      const churn = p.churn[0] + ((p.churn[1] - p.churn[0]) * cost) / (cost + g + 1e-9);
      return { cost, prof, head, ok, churn, util: ok ? p.asc - p.eta * Math.log(cost + p.hassle) : -Infinity };
    });
  });
  return { table, inc };
}

function deterministicModel(D: StudyInput, withPacks: boolean) {
  const M = D.model;
  const G = D.bins.middles;
  const pop = D.populations.find((x) => x.id === D.model.base.population)!;
  const p = baseParams(D);
  const { table: per, inc } = cells(D, withPacks, p);
  const edges = [0, 0.5, 0.8, 0.9, 0.95, 0.975, 0.99, 0.995, 0.998, 0.999, 0.9995, 0.9999, 1];
  const segs: { b: number; xi: number; w: number }[] = [];
  for (let b = 0; b < G.length; b += 1) for (let i = 0; i < edges.length - 1; i += 1) {
    const q = (edges[i] + edges[i + 1]) / 2;
    segs.push({ b, xi: Math.log(q / (1 - q)), w: pop.weights[b] * (edges[i + 1] - edges[i]) });
  }
  const table = per.map((rows) => segs.map(({ b, xi, w }) => {
    const x = rows[b];
    const life = (1 - (1 - x.churn) ** p.horizon) / x.churn;
    return { buy: x.ok && x.util + xi >= inc[b], cost: x.cost, prof: 1000 * w * life * x.prof };
  }));
  void M;
  const index = new Map(D.candidates.map((c, i) => [c.id, i]));
  return (plans: string[]) => {
    const js = plans.map((id) => index.get(id)!).sort((a, b) => a - b);
    let total = 0;
    for (let s = 0; s < segs.length; s += 1) {
      let best: number | null = null;
      for (const j of js) if (table[j][s].buy && (best === null || table[j][s].cost < table[best][s].cost)) best = j;
      if (best !== null) total += table[best][s].prof;
    }
    return total;
  };
}

/** The company's expected 60 months for one design at fixed values, written again from the input alone. */
function companyExpected(D: StudyInput, plans: string[], withPacks: boolean, reach: number, ramp: number, fixedUsd: number) {
  const T = D.model.company.months;
  const pop = D.populations.find((x) => x.id === D.model.base.population)!;
  const { table, inc } = cells(D, withPacks, baseParams(D));
  const index = new Map(D.candidates.map((c, i) => [c.id, i]));
  const js = plans.map((id) => index.get(id)!);
  const ws = Array.from({ length: T }, (_, i) => Math.min(1, (i + 1) / ramp));
  const wsum = ws.reduce((s, x) => s + x, 0);
  let cash = -T * fixedUsd, payers = 0, room = 0;
  for (let b = 0; b < D.bins.middles.length; b += 1) {
    const m = Math.max(inc[b], ...js.map((j) => table[j][b].util));
    const den = js.reduce((s, j) => s + Math.exp(table[j][b].util - m), 0) + Math.exp(inc[b] - m);
    for (const j of js) {
      const x = table[j][b];
      const lam = reach * wsum * pop.weights[b] * (Math.exp(x.util - m) / den);
      const r = 1 - x.churn;
      let em = 0, q = 0;
      for (let a = 1; a <= T; a += 1) { const w = ws[a - 1] / wsum; em += (w * (1 - r ** (T + 1 - a))) / x.churn; q += w * r ** (T - a); }
      cash += lam * x.prof * em; payers += lam * q; room += lam * q * x.head;
    }
  }
  return { cash, payers, room };
}

test("the program's value equals the deterministic model written here, its objective, and brute force for one and two plans", () => {
  const D = JSON.parse(read(INPUT_FILE)) as StudyInput;
  const value = { true: deterministicModel(D, true), false: deterministicModel(D, false) };
  const out = studyOutput();
  assert.ok(out.milp.length >= 16);
  for (const r of out.milp) {
    const label = `${r.k} plans, packs ${r.packs}, kept ${r.admissibleOnly}`;
    assert.match(r.status, /optimal/i, label);
    assert.equal(r.plans.length, r.k, label);
    const mine = value[String(r.packs) as "true" | "false"](r.plans);
    assert.ok(Math.abs(mine - r.value) <= 1e-6 * Math.max(1, Math.abs(mine)), `${label}: ${mine} against ${r.value}`);
    assert.ok(Math.abs(r.objective - r.value) <= 0.1, `${label}: the objective is the value but the tie-break (at most 1e-7 a cent of price)`);
    if (r.bruteForce !== null) assert.ok(Math.abs(r.bruteForce - r.value) <= 1e-6 * Math.max(1, r.value), `${label}: brute force ${r.bruteForce}`);
    if (r.admissibleOnly) for (const t of ["creator", "pro", "scale"] as const) assert.ok(r.plans.some((id) => candidateById(id).template === t), `${label} keeps ${t}`);
  }
});

test("the named scenarios and the Monte Carlo are the ones the document describes", () => {
  const out = studyOutput();
  assert.equal(out.scenarios.length, 3 * MODEL.eta.length * MODEL.asc.length);
  assert.equal(out.monteCarloDraws, MODEL.monteCarloDraws);
  assert.equal(out.screened.draws, MODEL.company.draws, "the company screening ran on the model's draws (no development override)");
  assert.equal(out.screened.finalDraws, MODEL.company.finalDraws, "the final draws are the model's");
  const best = out.designs.find((d) => d.id === out.regretBest)!;
  const adm = out.designs.filter((d) => d.admissible);
  assert.ok(adm.every((d) => d.worstRegret >= best.worstRegret - 1e-9), "the regret-best design has the smallest worst-case regret among the admissible designs");
  for (const d of out.designs) for (const s of out.scenarios) assert.ok(Number.isFinite(d.profitByScenario[s.id]), `${d.id} ${s.id}`);
  assert.ok(out.designs.some((d) => d.names.includes("today")), "today's price list is evaluated");
  for (const d of out.designs) if (d.company.final) {
    const f = d.company.final;
    assert.equal(f.draws, MODEL.company.finalDraws, d.id);
    assert.ok(f.pLoss >= Math.max(f.pCashLoss, f.pNotConsolidated) - 1e-12 && f.pLoss <= f.pCashLoss + f.pNotConsolidated + 1e-12, `${d.id}: a loss is a cash loss or no 60% consolidated, or both`);
    assert.ok(f.p5 <= f.p50 && f.p50 <= f.p95, d.id);
    assert.equal(d.company.gate!.pNotConsolidated, 1, `${d.id}: under the gate reading no plan keeps 60%, so the company is never at 60% consolidated`);
  }
});

test("the company's expected 60 months, written again here, is the solver's", () => {
  const D = JSON.parse(read(INPUT_FILE)) as StudyInput;
  const out = studyOutput();
  const c = out.companyCheck;
  assert.equal(c.design, out.recommended);
  const rec = out.designs.find((d) => d.id === out.recommended)!;
  const mine = companyExpected(D, rec.plans, rec.packs, c.reach, c.rampMonths, c.fixedCents / 100);
  assert.ok(Math.abs(mine.cash - c.expectedCashUsd) <= 1e-6 * Math.max(1, Math.abs(mine.cash)), `cash ${mine.cash} against ${c.expectedCashUsd}`);
  assert.ok(Math.abs(mine.payers - c.payers60) <= 1e-6 * Math.max(1, mine.payers), `payers ${mine.payers} against ${c.payers60}`);
  assert.ok(Math.abs(mine.room - c.room60Usd) <= 1e-6 * Math.max(1, Math.abs(mine.room)), `room ${mine.room} against ${c.room60Usd}`);
});

test("the recommendation follows the owner's rules: 60% per customer, today's plans kept, not Stan's error, rule (b), then the lowest chance of loss, then profit", () => {
  const out = studyOutput();
  const oc = ownersChoice(out);
  assert.equal(out.recommended, oc.rec.id, "the solver and the rule written here choose the same design");
  assert.equal(out.bestWithoutCommission, oc.choices.withoutCommission.chosen.id);
  assert.equal(out.nextFrontier, oc.next?.id ?? null);
  for (const [k, v] of Object.entries(out.choice)) assert.equal(v.design, oc.choices[k as keyof typeof oc.choices].chosen.id, k);
  assert.deepEqual(out.frontier, oc.frontier.map((d) => d.id));
  const rec = oc.rec;
  assert.ok(rec.admissible);
  const a = antiStan(rec);
  assert.ok(a.affordable, `entry ${a.entryUsd} within ${a.limitUsd}`);
  assert.ok(a.grows, "what a subscriber pays grows with its sales");
  assert.ok(withoutCommission(out.bestWithoutCommission), "a design without commission is given too");
  const pool = inPool(out.designs, pools(out.screened.ruleBFeasible).recommended).filter((d) => d.company.final);
  const pStar = Math.min(...pool.map((d) => d.company.final!.pCashLoss));
  assert.ok(rec.company.final!.pCashLoss <= pStar + MODEL.company.lossTolerance + 1e-12, "within one point of the lowest probability of a cash loss");
  for (const d of pool) if (d.company.final!.pCashLoss <= pStar + MODEL.company.lossTolerance + 1e-12) assert.ok(Math.round(d.company.final!.expected * 100) <= Math.round(rec.company.final!.expected * 100), d.id);
  if (oc.next) assert.ok(oc.next.company.final!.pCashLoss > pStar + MODEL.company.lossTolerance, "the next frontier design lies outside the tolerance");
  const meetsAll = out.designs.some((d) => d.admissible && isStanProof(d) && d.company.worst?.meets);
  if (!out.screened.ruleBFeasible) assert.equal(meetsAll, false, "rule (b) is reported as infeasible only when no design written out meets it");
  assert.ok(frontierOf(pool).some((d) => d.id === rec.id) || pool.some((d) => d.id === rec.id));
  // Stan-like single fixed prices are evaluated, side by side.
  for (const name of ["single fixed price: Store $69, no packs", "single fixed price: Start $29, no packs", "Stan-like: Start $29 + Store $99, 0%"]) {
    const d = out.designs.find((x) => x.names.includes(name));
    assert.ok(d, name);
    assert.equal(antiStan(d!).grows, false, `${name} has nothing that grows with sales`);
  }
});

function withoutCommission(id: string): boolean {
  return studyOutput().designs.find((d) => d.id === id)!.plans.every((p) => candidateById(p).commissionBps === 0);
}

test("the slow-growth cash path is the arithmetic it says", () => {
  // One payer a month, 13% churn, $10 a payer, $50 fixed: payers 1, 1.87, ...; the month covers once payers reach 5.
  const c = cashPath(1_000, 1, 5_000, 36, 0.13);
  let payers = 0, cum = 0, trough = 0, be: number | null = null;
  for (let t = 1; t <= 36; t += 1) { payers = payers * 0.87 + 1; const f = payers * 1_000 - 5_000; cum += f; trough = Math.min(trough, cum); if (be === null && f >= 0) be = t; }
  assert.equal(c.breakEvenMonth, be);
  assert.equal(c.troughCents, trough);
  assert.equal(c.payersToCover, 5);
  assert.equal(cashPath(1_000, 1, 50_000, 36, 0.13).breakEvenMonth, null, "7.7 steady payers never cover $500");
});

test("composition: every zero-cost feature is on every plan but the one named exception, and costly ones follow the figures", () => {
  const rows = composition();
  const zero = rows.filter((r) => r.cost === "none");
  assert.ok(zero.length >= 15);
  assert.deepEqual(zero.filter((r) => r.placement !== "every plan").map((r) => r.feature), ["Marktmorgen's name off the foot of the page"]);
  const store = candidateById(TODAY_IDS[0]);
  assert.equal(store.figures.listEmails, 0, "Store has no list email, as the composition says");
  assert.equal(store.figures.aiJobs, 0, "Store has no AI, as the composition says");
  for (const r of rows) for (const v of Object.values(r.competitors)) assert.doesNotMatch(v, /^unlimited$/, "an \"unlimited\" is the page's word, quoted");
});

test("the document is what renders today (run node scripts/pricing-study-v2.mjs --render)", () => {
  const doc = renderPricingStudyV2();
  assert.equal(read(DOC_FILE), doc, `${DOC_FILE} is stale`);
  assert.doesNotMatch(doc, /(Marktmorgen|our|ours)\b[^.|\n]{0,40}\bunlimited/i, "never \"unlimited\" for Marktmorgen");
  for (const m of doc.matchAll(/accountant/gi)) assert.match(doc.slice(Math.max(0, (m.index ?? 0) - 80), (m.index ?? 0) + 20), /\bno accountant|without an accountant|none/i);
});
