/**
 * The windows of a creator's own plan notices (queue 414 [KX1], added
 * 30 October 2026, docs/kx1-renewal-legal-matrix-2026-10-30.md). What is
 * checked, with synthetic subscriptions only:
 *
 *   - a yearly renewal is first due with 45 days left (California's top of
 *     15 to 45), not only from 30, so a missed run has later runs before 15;
 *   - nothing is due with more than 45 days left;
 *   - a notice found with fewer than 15 days left (yearly) or fewer than 7
 *     (trial) is still due, but marked late, never as on time;
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

part("yearly renewal");
is("46 days left: nothing yet", dueReminder(sub("year", 46 * DAY), NOW), null);
const at44 = dueReminder(sub("year", 44 * DAY), NOW);
is("44 days left: due, on time", [at44?.kind, at44?.late], ["renewal", false]);
const at15 = dueReminder(sub("year", 15 * DAY), NOW);
is("15 days left: due, on time", [at15?.kind, at15?.late], ["renewal", false]);
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
