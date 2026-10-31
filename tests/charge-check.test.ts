import { decideCharge, type ChargeContext } from "@/lib/charge-check";
import { LEGACY_PLAN_PRICES, PLAN_PRICES } from "@/lib/plan";
import { done, is, part } from "./check";

const DAY = 86400;
const start = 1_790_000_000;
const month = { start, end: start + 30 * DAY };
const year = { start, end: start + 365 * DAY };

function context(over: Partial<ChargeContext> = {}): ChargeContext {
  return {
    currency: "usd",
    allowedUnitCents: (interval) => [PLAN_PRICES.creator[interval], ...LEGACY_PLAN_PRICES.map((p) => p.creator[interval])],
    chargeableAt: () => true,
    otherPaidInvoice: () => null,
    prorationExplained: () => true,
    oneOffExplained: () => true,
    refundedCents: 0,
    ...over,
  };
}

function planLine(unit: number, period = month, extra: Record<string, unknown> = {}) {
  return {
    object: "line_item",
    amount: unit,
    currency: "usd",
    parent: { type: "subscription_item_details", subscription_item_details: { proration: false, subscription: "sub_NC1" } },
    period,
    pricing: { type: "price_details", price_details: { price: "price_NC1" }, unit_amount_decimal: String(unit) },
    quantity_decimal: "1",
    ...extra,
  };
}

function invoice(lines: unknown[], over: Record<string, unknown> = {}) {
  const sum = lines.reduce<number>((n, l) => n + Number((l as { amount?: number }).amount ?? 0), 0);
  return {
    id: "in_NC1",
    object: "invoice",
    status: "paid",
    currency: "usd",
    amount_paid: sum,
    amount_due: sum,
    subtotal: sum,
    total: sum,
    billing_reason: "subscription_cycle",
    status_transitions: { paid_at: start + 60 },
    parent: { type: "subscription_details", subscription_details: { subscription: "sub_NC1" } },
    lines: { object: "list", has_more: false, data: lines },
    ...over,
  };
}

const monthly = PLAN_PRICES.creator.month;
const yearly = PLAN_PRICES.creator.year;

part("A charge at the published price is correct");
is("monthly", decideCharge(invoice([planLine(monthly)]), context()), { kind: "ok" });
is("yearly", decideCharge(invoice([planLine(yearly, year)]), context()), { kind: "ok" });
is("a legacy price the subscription started on", decideCharge(invoice([planLine(LEGACY_PLAN_PRICES[0].creator.month)]), context()), { kind: "ok" });
is("an explained proration", decideCharge(invoice([planLine(monthly), { ...planLine(1234), parent: { type: "subscription_item_details", subscription_item_details: { proration: true } } }]), context()), { kind: "ok" });

part("Nothing to decide");
is("an open invoice charged nothing", decideCharge(invoice([planLine(monthly)], { status: "open" }), context()), { kind: "not_charged" });
is("a trial's zero invoice", decideCharge(invoice([planLine(0)], { amount_paid: 0, amount_due: 0 }), context()), { kind: "not_charged" });

part("Proven wrong: refunded");
is("above the published price: the difference", decideCharge(invoice([planLine(monthly + 500)]), context()), { kind: "wrong", reasons: ["charged above the published price"], refundCents: 500 });
const taxed = invoice([planLine(monthly + 500)], { amount_paid: Math.round((monthly + 500) * 1.1), amount_due: Math.round((monthly + 500) * 1.1) });
is("the difference with its share of tax added on top", decideCharge(taxed, context()), { kind: "wrong", reasons: ["charged above the published price"], refundCents: Math.ceil((500 * taxed.amount_paid) / taxed.subtotal) });
is("charged after the plan was meant to stop: all of it", decideCharge(invoice([planLine(monthly)]), context({ chargeableAt: () => false })), { kind: "wrong", reasons: ["charged after the plan was meant to stop"], refundCents: monthly });
is("the same period paid twice: all of the second", decideCharge(invoice([planLine(monthly)]), context({ otherPaidInvoice: () => "in_OTHER" })), { kind: "wrong", reasons: ["the same period was already paid"], refundCents: monthly });
is("another currency than shown: all of it", decideCharge(invoice([{ ...planLine(monthly), currency: "eur" }], { currency: "eur" }), context()), { kind: "wrong", reasons: ["charged in another currency than the one shown"], refundCents: monthly });
is("paid more than was due: the excess", decideCharge(invoice([planLine(monthly)], { amount_paid: monthly + 100 }), context()), { kind: "wrong", reasons: ["paid more than was due"], refundCents: 100 });

part("Already refunded or partly refunded: never more than is left");
is("partly refunded leaves the rest", decideCharge(invoice([planLine(monthly)]), context({ chargeableAt: () => false, refundedCents: 1000 })), { kind: "wrong", reasons: ["charged after the plan was meant to stop"], refundCents: monthly - 1000 });
is("fully refunded asks for nothing", decideCharge(invoice([planLine(monthly)]), context({ chargeableAt: () => false, refundedCents: monthly })), { kind: "wrong", reasons: ["charged after the plan was meant to stop"], refundCents: 0 });
is("the excess is capped at what is left", decideCharge(invoice([planLine(monthly + 500)]), context({ refundedCents: monthly + 300 })), { kind: "wrong", reasons: ["charged above the published price"], refundCents: 200 });

part("A doubt is never correct: treated as wrong, refunded whole");
is("a price that is not published", decideCharge(invoice([planLine(monthly - 1)]), context()), { kind: "unproven", reasons: ["a plan price that is not published"], refundCents: monthly - 1 });
is("cannot tell whether the plan was to be charged", decideCharge(invoice([planLine(monthly)]), context({ chargeableAt: () => null })), { kind: "unproven", reasons: ["cannot tell whether the plan was still to be charged"], refundCents: monthly });
is("a proration with no switch on record", decideCharge(invoice([{ ...planLine(700), parent: { type: "subscription_item_details", subscription_item_details: { proration: true } } }]), context({ prorationExplained: () => false })).kind, "unproven");
is("a one-off line with no record", decideCharge(invoice([{ ...planLine(3500), parent: { type: "invoice_item_details", invoice_item_details: { proration: false } } }]), context({ oneOffExplained: () => null })).kind, "unproven");
is("a quantity of two", decideCharge(invoice([planLine(monthly, month, { quantity_decimal: "2" })]), context()).kind, "unproven");
is("a period that is neither a month nor a year", decideCharge(invoice([planLine(monthly, { start, end: start + 90 * DAY })]), context()).kind, "unproven");
is("the old shape with a top-level price is not read as correct", decideCharge(invoice([{ ...planLine(monthly), pricing: undefined, price: { unit_amount: monthly } }]), context()).kind, "unproven");
is("a line of another currency", decideCharge(invoice([{ ...planLine(monthly), currency: "eur" }]), context()).kind, "unproven");
const both = decideCharge(invoice([planLine(monthly + 500), planLine(monthly - 1)]), context());
is("a proven excess beside a doubt refunds the whole", both, { kind: "wrong", reasons: ["charged above the published price", "a plan price that is not published"], refundCents: monthly + 500 + monthly - 1 });

part("What it could not read is decided later, never correct and never refunded");
is("lines not read whole", decideCharge(invoice([planLine(monthly)], { lines: { has_more: true, data: [planLine(monthly)] } }), context()), { kind: "unread", reason: "lines not read whole" });
is("refunds not read", decideCharge(invoice([planLine(monthly)]), context({ refundedCents: null })), { kind: "unread", reason: "refunds unreadable" });
is("no paid time", decideCharge(invoice([planLine(monthly)], { status_transitions: {} }), context()), { kind: "unread", reason: "paid time unreadable" });
is("amounts that are not whole cents", decideCharge(invoice([planLine(monthly)], { amount_paid: 12.5 }), context()), { kind: "unread", reason: "amounts unreadable" });
is("not an invoice", decideCharge(null, context()), { kind: "unread", reason: "not an invoice" });

done();
