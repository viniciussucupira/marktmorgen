/**
 * The windows of a creator's own plan notices (queue 414 [KX1], added
 * 30 October 2026, docs/kx1-renewal-legal-matrix-2026-10-30.md). What is
 * checked, with synthetic subscriptions only:
 *
 *   - a yearly renewal is first due on the 30th UTC calendar day before the
 *     charge's date, whatever the hour of either, and is on time only then
 *     (the one day every official window read allows: Utah, Illinois,
 *     Virginia, DC, Colorado, Massachusetts, New York, California);
 *   - a notice found later (yearly: any later day; trial: fewer
 *     than 7) is still due, but marked late, never as on time;
 *   - inside the window it is not marked late;
 *   - a monthly plan gets no renewal notice, as before.
 */
import { dueReminder } from "@/lib/billing-reminders";
import { done, is, part } from "./check";

const NOW = 1_791_700_000;
const DAY = 86_400;

function sub(cycle: "year" | "month", left: number, status = "active"): Record<string, unknown> {
  const end = NOW + left;
  return {
    id: `sub_window${cycle}${status}`,
    status,
    created: NOW - 400 * DAY,
    ...(status === "trialing" ? { trial_end: end } : {}),
    customer: { email: "creator@example.com" },
    items: {
      data: [
        {
          current_period_start: end - (cycle === "year" ? 365 : 30) * DAY,
          current_period_end: end,
          price: {
            lookup_key: `nimbus_labs_creator_${cycle}`,
            unit_amount: cycle === "year" ? 29000 : 2900,
            recurring: { interval: cycle },
          },
        },
      ],
    },
  };
}

part("yearly renewal: calendar days, not elapsed seconds");
// NOW is 06:26 UTC. TODAY is its UTC day; a charge "on day N" is at an hour of
// the UTC day N calendar days later.
const TODAY = Math.floor(NOW / DAY) * DAY;
const charge = (days: number, hour: number) => TODAY + days * DAY + hour * 3600 - NOW;
is("the 31st day before, late in the day: nothing yet", dueReminder(sub("year", charge(31, 23)), NOW), null);
is("the 31st day before, early in the day: nothing yet", dueReminder(sub("year", charge(31, 1)), NOW), null);
const early = dueReminder(sub("year", charge(30, 1)), NOW);
is("the 30th day, charge at 01:00 (under 30 x 24 h left): due, on time", [early?.kind, early?.late], ["renewal", false]);
const lateHour = dueReminder(sub("year", charge(30, 23)), NOW);
is("the 30th day, charge at 23:00 (over 30 x 24 h left): due, on time", [lateHour?.kind, lateHour?.late], ["renewal", false]);
const day29 = dueReminder(sub("year", charge(29, 23)), NOW);
is("the 29th day, charge at 23:00 (over 29 x 24 h left): due, marked late", [day29?.kind, day29?.late], ["renewal", true]);
const at15 = dueReminder(sub("year", 15 * DAY), NOW);
is("15 days left: outside Utah's and Illinois' windows, marked late", [at15?.kind, at15?.late], ["renewal", true]);
const at10 = dueReminder(sub("year", 10 * DAY), NOW);
is("10 days left: still due, marked late", [at10?.kind, at10?.late], ["renewal", true]);

part("trial");
const t8 = dueReminder(sub("month", 8 * DAY - 60, "trialing"), NOW);
is("8 days left: due, on time", [t8?.kind, t8?.late], ["trial", false]);
const t3 = dueReminder(sub("month", 3 * DAY, "trialing"), NOW);
is("3 days left: still due, marked late", [t3?.kind, t3?.late], ["trial", true]);

part("monthly");
is("a monthly plan gets no renewal notice", dueReminder(sub("month", 10 * DAY), NOW), null);

done();
