/**
 * A page test that may be read every day (lib/headline-test-rules.ts, rules
 * 1–4; ClickFunnels audit priority 6, "Experiment decision reliability",
 * added 18 October 2026): a predeclared measure, a line valid however often
 * the test is looked at, a check of the split, refund maturity for money, and
 * an insufficient-data state for each.
 *
 * The simulations are seeded, synthetic and of the product's own functions:
 * not production figures.
 */
import {
  FALSE_WINNER,
  MIN_SALES,
  MIN_VIEWS,
  REFUND_DAYS,
  TUNED_VIEWS,
  type Counts,
  boundary,
  daysLeft,
  expectedShareB,
  splitMismatch,
  testState,
  versionFor,
  winner,
} from "@/lib/headline-test-rules";
import { EMPTY_PAGE, type SalesPage, declareMeasure, declaredMeasure, parsePage } from "@/lib/sales-page";
import { done, is, part } from "./check";

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The old line: a fixed 95% two-sided z, read the same way. */
function oldWinner(c: Counts): boolean {
  if (c.va < MIN_VIEWS || c.vb < MIN_VIEWS) return false;
  const pooled = (c.ca + c.cb) / (c.va + c.vb);
  if (pooled * Math.min(c.va, c.vb) < 5) return false;
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / c.va + 1 / c.vb));
  return se > 0 && Math.abs((c.cb / c.vb - c.ca / c.va) / se) >= 1.96;
}

/**
 * Runs `tests` sign-up tests of `views` visitors each, both versions at
 * rateA and rateB, reading the test after every `every` visitors; returns the
 * share in which a winner was ever called, by the new line and by the old.
 */
function simulate(seed: number, tests: number, views: number, every: number, rateA: number, rateB: number) {
  const r = rng(seed);
  let wonNew = 0;
  let wonOld = 0;
  let rightNew = 0;
  for (let t = 0; t < tests; t += 1) {
    const c: Counts = { va: 0, vb: 0, ca: 0, cb: 0 };
    let calledNew: string | null = null;
    let calledOld = false;
    for (let v = 1; v <= views; v += 1) {
      if (r() < 0.5) {
        c.va += 1;
        if (r() < rateA) c.ca += 1;
      } else {
        c.vb += 1;
        if (r() < rateB) c.cb += 1;
      }
      if (v % every === 0) {
        if (!calledNew) calledNew = winner(c, "checkouts");
        if (!calledOld) calledOld = oldWinner(c);
        if (calledNew && calledOld) break;
      }
    }
    if (calledNew) wonNew += 1;
    if (calledNew === "b") rightNew += 1;
    if (calledOld) wonOld += 1;
  }
  return { newRate: wonNew / tests, oldRate: wonOld / tests, rightRate: rightNew / tests };
}

part("Rule 1: a line valid however often the test is read");
const at = (v: number) => Math.round(boundary(v) * 100) / 100;
is("the line is tightest near the tuned views, 3.04 standard errors", at(TUNED_VIEWS), 3.04);
is("wider early and later, never down to the fixed 1.96", [at(400) > at(TUNED_VIEWS), at(100_000) > at(TUNED_VIEWS), at(TUNED_VIEWS) > 1.96], [true, true, true]);
const aa = simulate(20261018, 400, 6_000, 50, 0.04, 0.04);
is(`A/A tests read every 50 visitors: a false winner at most ${FALSE_WINNER * 100}% of the time (measured ${(aa.newRate * 100).toFixed(1)}%)`, aa.newRate <= FALSE_WINNER, true);
is(`the old fixed line, read the same way, called far more (measured ${(aa.oldRate * 100).toFixed(1)}%)`, aa.oldRate > 2 * FALSE_WINNER, true);
const ab = simulate(7, 200, 8_000, 50, 0.04, 0.06);
is(`a real 4% to 6% difference is still found most of the time (measured ${(ab.rightRate * 100).toFixed(1)}%)`, ab.rightRate >= 0.8, true);
is("0 against 10 on 200 each is no longer called on the first look", winner({ va: 200, vb: 200, ca: 0, cb: 10 }), null);
is("but 0 against 15 on 300 each is", winner({ va: 300, vb: 300, ca: 0, cb: 15 }), "b");

part("Rule 2: the measure is the one the test was saved with");
const money = (va: number, sa: number, vb: number, sb: number, t0: number, cents = 4_900): Counts => ({ va, vb, ca: sa, cb: sb, sa, sb, ra: sa * cents, rb: sb * cents, qa: sa * cents * cents, qb: sb * cents * cents, t0 });
const now = Date.UTC(2026, 9, 18);
const day = 86_400_000;
const clear = money(1_500, 15, 1_500, 70, now - 30 * day);
is("a clear money test, saved as money, is decided", winner(clear, "money", { declared: "money", now }), "b");
is("the product made free mid-test: no winner on a measure it did not start with", testState(clear, "checkouts", { declared: "money", now }).state, "measure_changed");
is("a test saved before measures were declared is read with today's", winner(clear, "money", { declared: null, now }), "b");
const hero = { id: "hero0001", kind: "hero", headline: "Learn to bake", sub: "In a weekend", media: "none", video: null };
const raw = { blocks: [hero], test: { headline: "Bake bread at home", sub: "In a weekend", measure: "checkouts" } };
const parsed = parsePage(raw);
const first = declareMeasure(parsed, null, "money");
is("saving a new test declares the product's measure, whatever the browser sent", declaredMeasure(first), "money");
const resaved = declareMeasure(parsePage({ ...raw, test: { ...raw.test, measure: "checkouts" } }), first, "checkouts");
is("saving the same test again after the price changed keeps the measure it started with", declaredMeasure(resaved), "money");
const changed = declareMeasure(parsePage({ ...raw, test: { headline: "Your first loaf", sub: "In a weekend" } }), first, "checkouts");
is("new words are a new test, with the product's measure now", [declaredMeasure(changed), changed.test?.id !== first.test?.id], ["checkouts", true]);
const old: SalesPage = { ...EMPTY_PAGE, blocks: parsed.blocks, test: parsed.test ? { id: parsed.test.id, headline: parsed.test.headline, sub: parsed.test.sub } : null };
is("a test saved before 18 October keeps no measure rather than one invented for it", declaredMeasure(declareMeasure(parsed, old, "money")), null);
is("the measure is read back from a stored page", declaredMeasure(parsePage(JSON.parse(JSON.stringify(first)))), "money");

part("Rule 3: the split is checked");
const id = "abc12345";
const share = expectedShareB(id);
let b = 0;
for (let bucket = 0; bucket < 1000; bucket += 1) if (versionFor(bucket, id) === "b") b += 1;
is("the expected share is the test's own share of the 1,000 groups", share, b / 1000);
is("an even split is no mismatch", splitMismatch({ va: 5_000, vb: 5_000 }), false);
is("chance-sized wobble is no mismatch", splitMismatch({ va: 5_100, vb: 4_900 }), false);
is("a split far off is one", splitMismatch({ va: 5_400, vb: 4_600 }), true);
is("judged against the test's own share", [splitMismatch({ va: 4_400, vb: 5_600 }, 0.56), splitMismatch({ va: 4_400, vb: 5_600 }, 0.5)], [false, true]);
is("too few views to judge", splitMismatch({ va: 300, vb: 50 }), false);
is("no winner while the split is off, however clear the lead", testState({ va: 6_000, vb: 4_000, ca: 60, cb: 200 }, "checkouts").state, "split");
let falseSplit = 0;
const r = rng(11);
for (let t = 0; t < 300; t += 1) {
  let va = 0;
  for (let v = 0; v < 4_000; v += 1) if (r() >= share) va += 1;
  if (splitMismatch({ va, vb: 4_000 - va }, share)) falseSplit += 1;
}
is(`a fair split is seldom called off (${falseSplit} of 300 at p < 0.001)`, falseSplit <= 3, true);

part("Rule 4: money waits for refunds");
const young = money(1_500, 15, 1_500, 70, now - 5 * day);
is(`a money test under ${REFUND_DAYS} days old is maturing, not won`, testState(young, "money", { now }).state, "maturing");
is("a money test with no known start is never called", testState(money(1_500, 15, 1_500, 70, 0), "money", { now }).state, "maturing");
is("and how long it has left counts the days until it is old enough", daysLeft(money(1_500, 15, 1_500, 70, now - 5 * day), "money", now), REFUND_DAYS - 5);
is("a sign-up test does not wait for refunds", winner({ va: 300, vb: 300, ca: 0, cb: 15, t0: now - day }, "checkouts", { now }), "b");

part("Insufficient data, each measure");
is("too few views", testState({ va: MIN_VIEWS - 1, vb: 5_000, ca: 0, cb: 500 }, "checkouts").state, "too_few");
is("too few sign-ups for the approximation", testState({ va: 500, vb: 500, ca: 0, cb: 4 }, "checkouts").state, "too_few");
is("too few sales", testState(money(1_500, MIN_SALES - 1, 1_500, 70, now - 30 * day), "money", { now }).state, "too_few");
is("close on plenty of data: running", testState({ va: 4_000, vb: 4_000, ca: 200, cb: 215 }, "checkouts").state, "running");

done();
