/**
 * The reserve the platform's Stripe balance keeps for plan refunds and
 * disputes (306 [SY2] unit 1, lib/refund-reserve-rules.ts). Pure.
 *
 * What fails here: a reserve under what the published policy would give
 * back now; a dispute reserve missing for a charge still disputable, or kept
 * past its window; anything unknown turned into a number; a payout that
 * leaves the balance under the reserve; sales opened below it.
 */
import { done, is, part } from "./check";
import { DISPUTE_DAYS, disputeReserveCents, payoutAbove, refundReserve, reserveCovered, type ReserveCharge } from "@/lib/refund-reserve-rules";

const DAY = 86_400;
const NOW = Date.UTC(2026, 11, 2) / 1000;
const month = (o: Partial<ReserveCharge> = {}): ReserveCharge => ({ currency: "usd", chargedCents: 6_900, paidAtSeconds: NOW - 3 * DAY, periodEndSeconds: NOW + 27 * DAY, refund: { kind: "guarantee", cents: 6_900 }, ...o });

part("What the policy would give back now, and the disputes");
is("a dispute reserve is 1% of the charge and both fees, rounded up", [disputeReserveCents(6_900), disputeReserveCents(1)], [99, 31]);
const one = refundReserve([month()], NOW);
is("a first payment inside the guarantee: all of it, and its dispute reserve", one, { kind: "known", byCurrency: { usd: { refundCents: 6_900, disputeCents: 99, totalCents: 6_999 } } });
const yearly = month({ chargedCents: 69_000, periodEndSeconds: NOW + 300 * DAY, refund: { kind: "unstarted_months", cents: 47_000, monthsKept: 3 } });
const renewal = month({ refund: { kind: "none", reason: "renewal" } });
const both = refundReserve([yearly, renewal], NOW);
is("a yearly plan's months not started, and a renewal's dispute reserve only", both.kind === "known" && both.byCurrency.usd, { refundCents: 47_000, disputeCents: disputeReserveCents(69_000) + 99, totalCents: 47_000 + disputeReserveCents(69_000) + 99 });

part("The dispute window");
const old = (end: number) => refundReserve([month({ paidAtSeconds: NOW - 400 * DAY, periodEndSeconds: end, refund: { kind: "none", reason: "outside_window" } })], NOW);
is("past 120 days after its period ended: nothing kept", old(NOW - (DISPUTE_DAYS + 1) * DAY), { kind: "known", byCurrency: { usd: { refundCents: 0, disputeCents: 0, totalCents: 0 } } });
is("a period that ended less than 120 days ago: still kept", old(NOW - (DISPUTE_DAYS - 1) * DAY).kind === "known" && (old(NOW - (DISPUTE_DAYS - 1) * DAY) as { byCurrency: Record<string, { disputeCents: number }> }).byCurrency.usd.disputeCents, 99);

part("Unknown is never a number");
is("a refund the rule cannot decide", refundReserve([month(), month({ refund: { kind: "unknown", reason: "split_payment" } })], NOW), { kind: "unknown", reason: "refund_unknown", index: 1 });
is("an amount that is not whole cents", refundReserve([month({ chargedCents: 69.5 })], NOW), { kind: "unknown", reason: "unreadable", index: 0 });
is("a refund larger than the charge", refundReserve([month({ refund: { kind: "guarantee", cents: 7_000 } })], NOW), { kind: "unknown", reason: "unreadable", index: 0 });
is("another currency than the fees'", refundReserve([month({ currency: "eur" })], NOW), { kind: "unknown", reason: "currency", index: 0 });
is("no charges: nothing to keep", refundReserve([], NOW), { kind: "known", byCurrency: {} });

part("Payouts and sales");
is("only what is above the reserve is paid out", payoutAbove(10_000, one, "usd"), 3_001);
is("a balance under the reserve: nothing paid out", payoutAbove(5_000, one, "usd"), 0);
is("an unknown reserve: no payout at all", payoutAbove(1_000_000, { kind: "unknown", reason: "currency", index: 0 }, "usd"), null);
is("an unread balance: no payout", payoutAbove(null, one, "usd"), null);
is("sales open only when the balance covers the reserve", [reserveCovered({ usd: 6_999 }, one), reserveCovered({ usd: 6_998 }, one)], [true, false]);
is("sales closed when the balance or the reserve is unknown", [reserveCovered(null, one), reserveCovered({ usd: 1e9 }, { kind: "unknown", reason: "unreadable", index: 0 }), reserveCovered({}, one)], [false, false, false]);
done();
