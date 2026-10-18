/**
 * When a page test may not call a winner yet (lib/headline-test-rules.ts,
 * winner and daysLeft; ClickFunnels audit F19–F20, added 17 October 2026).
 *
 * The defect this file was written around: on a free product, decided by
 * sign-ups, a two-proportion z-test ran as soon as each version had 200
 * views, however few sign-ups there were. 0 sign-ups against 5 came out at
 * z = 2.25 and was called a win, and the losing version stopped being shown
 * by itself — on a split that chance alone produces about one time in
 * sixteen (all five landing on one side, either side). The approximation is
 * only sound when each version would be expected to have at least five
 * sign-ups; below that the test now says "still running".
 *
 * Checked: every insufficient-data state, for sign-ups and for money, stays
 * undecided; a lopsided result with enough data is still decided; and how
 * long a test has left counts the sign-ups it needs, not only the views.
 */
import { MIN_EXPECTED_SIGNUPS, MIN_SALES, MIN_VIEWS, type Counts, chanceBBetter, daysLeft, winner } from "@/lib/headline-test-rules";
import { done, is, part } from "./check";

const signups = (va: number, ca: number, vb: number, cb: number, t0 = 0): Counts => ({ va, vb, ca, cb, t0 });
/** Each sale of the same amount, so the square is that amount squared per sale. */
const money = (va: number, sa: number, vb: number, sb: number, cents = 4_900): Counts => ({ va, vb, ca: sa, cb: sb, sa, sb, ra: sa * cents, rb: sb * cents, qa: sa * cents * cents, qb: sb * cents * cents });

part("Sign-ups: too few to say");
is("no views yet", winner(signups(0, 0, 0, 0)), null);
is("under the views each version needs", winner(signups(MIN_VIEWS - 1, 0, 1_000, 40)), null);
is("views enough, no sign-ups at all", winner(signups(500, 0, 500, 0)), null);
is("0 against 5 on 200 views each is not a win any more", winner(signups(200, 0, 200, 5)), null);
is("nor 1 against 8", winner(signups(200, 1, 200, 8)), null);
is("traffic split unevenly: the smaller side is the one that must have enough", winner(signups(200, 0, 2_000, 30)), null);

part("Sign-ups: enough to say");
// Since 18 October 2026 the line holds however often the test is read (tests/experiment-reliability.test.ts), so a small first look needs a little more.
is("0 against 15 on 300 views each: the second wins", winner(signups(300, 0, 300, 15)), "b");
is("40 against 12 on 500 each: the first wins", winner(signups(500, 40, 500, 12)), "a");
is("close on plenty of data: still running", winner(signups(2_000, 100, 2_000, 110)), null);
is("the floor is the textbook one: five expected each", MIN_EXPECTED_SIGNUPS, 5);

part("Money: too few to say");
is("each needs its paid sales", winner(money(1_000, MIN_SALES - 1, 1_000, 40), "money"), null);
is("each needs its views", winner(money(MIN_VIEWS - 1, 30, 1_000, 60), "money"), null);
is("nothing sold: no chance to state", chanceBBetter(money(500, 0, 500, 0)), null);
is("a close race with its sales: still running", winner(money(1_000, 30, 1_000, 33), "money"), null);
// A money test also waits REFUND_DAYS days for refunds (rule 4).
is("a clear one, a month old: decided", winner({ ...money(1_000, 15, 1_000, 60), t0: Date.UTC(2026, 8, 1) }, "money", { now: Date.UTC(2026, 9, 17) }), "b");

part("How long a sign-up test has left");
const now = Date.UTC(2026, 9, 17);
const day = 86_400_000;
// 100 views a day each, 1 sign-up per 100 views: 500 views each are needed for five expected sign-ups.
is("at 1% the views needed are 500 each, not 200", daysLeft(signups(100, 1, 100, 1, now - day), "checkouts", now), 4);
is("with no sign-ups yet, at least the views", daysLeft(signups(100, 0, 100, 0, now - day), "checkouts", now), 1);
is("and once there is enough of both, nothing left to wait for", daysLeft(signups(600, 6, 600, 6, now - 6 * day), "checkouts", now), 0);

done();
