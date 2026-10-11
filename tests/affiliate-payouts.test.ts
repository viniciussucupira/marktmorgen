/**
 * What a creator may pay an affiliate today.
 *
 * The case that matters most is the last one: with no wait set, `payable`
 * has to equal `owed` exactly, because that is what every store already
 * running does, and a change in this arithmetic would quietly change what
 * they pay out.
 */
import { MAX_PAYDAY, nextPayday, ordinal, paydayWords, payoutPromise } from "@/lib/affiliate-setting";
import { done, is, part } from "./check";

/** The same arithmetic readBook does, on its own so it can be checked. */
const payable = (earned: number, waiting: number, paid: number) => {
  const owed = earned - paid;
  return owed <= 0 ? owed : Math.max(0, Math.min(owed, earned - waiting - paid));
};

part("What can be paid today");
is("nothing waiting, nothing paid", payable(100, 0, 0), 100);
is("some still clearing", payable(100, 30, 0), 70);
is("what cleared has been paid", payable(100, 30, 70), 0);
is("paid past what cleared", payable(100, 30, 90), 0);
is("all of it still clearing", payable(100, 100, 0), 0);
is("a refund after a payout is money back", payable(50, 0, 100), -50);
is("no wait behaves exactly as before", payable(100, 0, 40), 60);

part("When the creator said they pay");
is("the 1st, seen on the 15th, is next month", nextPayday(1, new Date("2026-09-15T10:00:00Z"))?.toISOString().slice(0, 10), "2026-10-01");
is("the 1st, seen on the 1st, is today", nextPayday(1, new Date("2026-09-01T10:00:00Z"))?.toISOString().slice(0, 10), "2026-09-01");
is("the 28th exists in February", nextPayday(28, new Date("2027-02-01T10:00:00Z"))?.toISOString().slice(0, 10), "2027-02-28");
is("the day after it is next month", nextPayday(28, new Date("2026-12-29T01:00:00Z"))?.toISOString().slice(0, 10), "2027-01-28");
is("no promised day gives no date", nextPayday(0, new Date("2026-09-15T10:00:00Z")), null);
is("nothing past the 28th is allowed", nextPayday(MAX_PAYDAY + 1, new Date("2026-09-15T10:00:00Z")), null);
is("the date reads in American English", paydayWords(new Date("2026-10-01T00:00:00Z")), "October 1, 2026");

part("How the promise reads");
is("1st", ordinal(1), "1st");
is("2nd", ordinal(2), "2nd");
is("3rd", ordinal(3), "3rd");
is("11th, not 11st", ordinal(11), "11th");
is("21st", ordinal(21), "21st");
is("23rd", ordinal(23), "23rd");
is(
  "a day and a wait",
  payoutPromise({ enabled: true, percent: 20, days: 30, rule: "last" as const, rates: {}, payday: 5, hold: 14, buyers: false, directory: false, numbers: false, kit: true, lifetime: false }, "Harbor Kitchen"),
  "Harbor Kitchen pays on the 5th of each month. A sale is payable 14 days after it is made, so a refund in that time comes off it first.",
);
is(
  "no day promised says so plainly",
  payoutPromise({ enabled: true, percent: 20, days: 30, rule: "last" as const, rates: {}, payday: 0, hold: 0, buyers: false, directory: false, numbers: false, kit: true, lifetime: false }, "Harbor Kitchen"),
  "Harbor Kitchen has not set a payment day, and pays when they choose.",
);

done();
