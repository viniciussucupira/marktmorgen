/**
 * Recurring revenue month by month, by what moved it (lib/mrr-movements.ts;
 * added 12 October 2026). Checked, on members whose story is known:
 *
 *   - a member who joins is new; one who left and joins again comes back;
 *   - a move to a dearer plan, read from the invoice that charged it, is a
 *     move up in the month it was made, not one leaving and one joining;
 *   - a free trial counts once it ends; another currency never counts;
 *   - the last month ends on the membership as Stripe holds it today;
 *   - ARR, the average per member, and what was kept from a year ago;
 *   - either shape of invoice line Stripe has given.
 */
import { movementsFrom, pricesFrom, type Invoice } from "@/lib/mrr-movements";
import type { Sub } from "@/lib/membership-numbers";
import { done, is, part } from "./check";

const at = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d, 12) / 1000;
const NOW = at(2026, 10, 12);

const sub = (id: string, customer: string, start: number, amount: number, over: Partial<Sub> = {}): Sub => ({
  id,
  customer,
  status: "active",
  product: "club",
  amount,
  currency: "usd",
  interval: "month",
  count: 1,
  start,
  ended: 0,
  trialEnd: 0,
  channel: "direct",
  canceledAt: 0,
  cancelCause: "",
  feedback: "",
  comment: "",
  ...over,
});

const subs = [
  sub("sub_ana", "cus_ana", at(2026, 6, 5), 4000),
  sub("sub_ben1", "cus_ben", at(2026, 5, 10), 2000, { status: "canceled", ended: at(2026, 7, 15) }),
  sub("sub_ben2", "cus_ben", at(2026, 9, 3), 2000),
  sub("sub_cy", "cus_cy", at(2026, 9, 25), 1000, { trialEnd: at(2026, 10, 2) }),
  sub("sub_dee", "cus_dee", at(2026, 1, 15), 24000, { interval: "year" }),
  sub("sub_eve", "cus_eve", at(2025, 8, 1), 3000),
  sub("sub_fay", "cus_fay", at(2025, 7, 1), 1000, { status: "canceled", ended: at(2026, 3, 5) }),
  sub("sub_gus", "cus_gus", at(2026, 2, 1), 9900, { currency: "eur" }),
];

// Ana's invoices: $20 a month, then a move to $40 on August 20 — in the older
// shape of a line, and in the newer one.
const old = (start: number, unit: number, proration = false) => ({ subscription: "sub_ana", amount: proration ? 1500 : unit, quantity: 1, proration, period: { start }, price: { unit_amount: unit, recurring: { interval: "month", interval_count: 1 } } });
const newer = (start: number, unit: number) => ({ amount: unit, quantity: 1, period: { start }, pricing: { unit_amount_decimal: String(unit) }, parent: { subscription_item_details: { subscription: "sub_ana", proration: false } } });
const invoices: Invoice[] = [
  { created: at(2026, 6, 5), lines: { data: [old(at(2026, 6, 5), 2000)] } },
  { created: at(2026, 7, 5), lines: { data: [old(at(2026, 7, 5), 2000)] } },
  { created: at(2026, 8, 5), lines: { data: [newer(at(2026, 8, 5), 2000)] } },
  { created: at(2026, 8, 20), lines: { data: [{ ...old(at(2026, 8, 20), 2000, true), amount: -800 }, old(at(2026, 8, 20), 4000, true)] } },
  { created: at(2026, 9, 5), lines: { data: [newer(at(2026, 9, 5), 4000)] } },
];

part("What each membership was charged at");
const prices = pricesFrom(invoices, new Map(subs.map((s) => [s.id, s])));
is("each line read, either shape, a credit left out", prices.get("sub_ana")?.map((e) => e.value), [2000, 2000, 2000, 4000, 4000]);

part("Month by month");
const moves = movementsFrom(subs, prices, "usd", NOW);
const row = (month: string) => moves.months.find((m) => m.month === month)!;
is("from the first month anything was paid", moves.months[0].month, "2025-11");
is("June: Ana joins", [row("2026-06").new], [2000]);
is("July: Ben leaves", [row("2026-07").canceled], [2000]);
is("August: Ana moves up, the month she did", [row("2026-08").expansion, row("2026-08").new, row("2026-08").canceled], [2000, 0, 0]);
is("September: Ben comes back", [row("2026-09").reactivated, row("2026-09").new], [2000, 0]);
is("October: Cy, once the trial ended", row("2026-10").new, 1000);
is("March: Fay leaves; January: Dee joins, a yearly membership as a month", [row("2026-03").canceled, row("2026-01").new], [1000, 2000]);
is("the last month ends on today's memberships, euros left out", [row("2026-10").end, row("2026-10").members], [12000, 5]);
is("each month starts where the last ended", moves.months.every((m, i) => i === 0 || m.start === moves.months[i - 1].end), true);

part("ARR, per member, and kept from a year ago");
is("a year at this rate, and per paying member", [moves.arr, moves.arpu], [144000, 2400]);
is("Eve stayed and Fay left: three quarters kept", moves.nrr, 0.75);
is("nobody paying a year ago: nothing to say", movementsFrom([subs[0]], prices, "usd", NOW).nrr, null);

done();
