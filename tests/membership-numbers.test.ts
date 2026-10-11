/**
 * Membership numbers: monthly recurring revenue, churn, trials that became
 * paying — worked out as the page says they are.
 *
 * Measured before it was built (30 September 2026): Whop and Circle show
 * these; Stan's analytics count visits and sales. What is checked is that
 * every figure means exactly what its definition on the page says.
 */
import { monthly, numbersFrom, readSub, type Sub } from "@/lib/membership-numbers";
import { done, is, part } from "./check";

const DAY = 86_400;
const now = 2_000_000_000;

const sub = (over: Partial<Sub>): Sub => ({
  id: "sub_x",
  status: "active",
  product: "club000001",
  amount: 2900,
  currency: "usd",
  interval: "month",
  count: 1,
  start: now - 100 * DAY,
  ended: 0,
  trialEnd: 0,
  channel: "direct",
  ...over,
});

part("A payment as a month");
is("monthly is itself", monthly(2900, "month", 1), 2900);
is("yearly is a twelfth", Math.round(monthly(29000, "year", 1)), 2417);
is("and twelve of them are the yearly price exactly, never a cent over", Math.round(12 * monthly(29000, "year", 1)), 29000);
is("every 3 months is a third", monthly(9000, "month", 3), 3000);
is("weekly is 52 twelfths", Math.round(monthly(1000, "week", 1)), 4333);

part("What counts");
const n = numbersFrom(
  [
    sub({ id: "a" }),
    sub({ id: "b", interval: "year", amount: 29000 }),
    sub({ id: "c", status: "past_due" }),
    sub({ id: "d", status: "trialing", trialEnd: now + 5 * DAY, start: now - 2 * DAY }),
    // Ended 10 days ago, after paying for months: churn.
    sub({ id: "e", status: "canceled", ended: now - 10 * DAY }),
    // Started 5 days ago and ended: not paying 30 days ago, so not churn.
    sub({ id: "f", status: "canceled", start: now - 5 * DAY, ended: now - 1 * DAY }),
    // In another currency: a member, but not in the sums.
    sub({ id: "g", currency: "eur" }),
    // A trial that ended 20 days ago and kept going: converted.
    sub({ id: "h", start: now - 34 * DAY, trialEnd: now - 20 * DAY }),
    // A trial that ended and was canceled the same day: not converted.
    sub({ id: "i", status: "canceled", start: now - 44 * DAY, trialEnd: now - 30 * DAY, ended: now - 30 * DAY }),
  ],
  "usd",
  now,
);
is("MRR counts paying members, a yearly one as a twelfth, not the trial, not another currency", n.mrr, 11117);
is("paying members include the one being retried", n.paying, 5);
is("trials are counted apart", n.trialing, 1);
is("the one being retried is at risk", [n.atRisk, n.atRiskMrr], [1, 2900]);
is("another currency is said apart", n.elsewhere, 1);
is("ended in the last 30 days", n.ended30, 2);
// Paying 30 days ago: a, b, c, e, g. Not h, whose trial ended 20 days ago,
// nor i, whose trial ended exactly then, when it was canceled unpaid.
is("churn: of those paying 30 days ago, the share that ended since", n.churn30, 1 / 5);
is("trials: one of two that ended became paying", [n.trialsConverted, n.trialsEnded], [1, 2]);
is("by membership", n.byProduct.map((p) => [p.product, p.members, p.trialing]), [["club000001", 5, 1]]);
is("nobody paying 30 days ago: no churn figure, rather than 0%", numbersFrom([sub({ start: now - DAY })], "usd", now).churn30, null);

part("What Stripe holds, read");
const handles = new Set(["harbor"]);
is("another store's membership is not read", readSub({ metadata: { store: "other", product: "p1aaaaaa" } }, handles), null);
is("a payment plan is not a membership", readSub({ metadata: { store: "harbor", product: "p1aaaaaa", kind: "plan" } }, handles), null);
is(
  "quantity counts",
  readSub({ id: "sub_1", status: "active", currency: "usd", metadata: { store: "harbor", product: "p1aaaaaa" }, items: { data: [{ quantity: 2, price: { unit_amount: 1500, recurring: { interval: "month", interval_count: 1 } } }] } }, handles)?.amount,
  3000,
);

done();
