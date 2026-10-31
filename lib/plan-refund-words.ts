/**
 * What the plan refund's review page and confirmation email say (305 [SY1]
 * unit 2b2): pure, so the words are tested against the code they describe.
 *
 * Every sentence matches what the code does: the refund comes from the
 * reading of lib/plan-refund.ts and is made by lib/plan-refund-flow.ts, which
 * ends the plan the same day; what happens to the store afterward is the
 * closing of lib/plan-closing-rules.ts, as the Help says
 * (lib/help-content.ts, "What happens when my plan ends?"). No reason is
 * asked: the policy says "No reason is required".
 */
import { formatMoney } from "@/lib/money";
import { CLOSING_DAYS, WARN_MONTH_DAYS, WARN_WEEK_DAYS } from "@/lib/plan-closing-rules";
import { REFUND_DAYS } from "@/lib/plan";
import type { PlanRefundReading } from "@/lib/plan-refund";

export const SUPPORT_ADDRESS = "support@marktmorgen.com";

export const moneyOf = (cents: number, currency: string): string => formatMoney(cents, currency.toUpperCase());

/** What happens to the store once the refund is made, in the order it happens. */
export function refundEffects(o: { assistant: boolean }): string[] {
  return [
    "Your plan ends today. Your checkout stops taking payments today, and the other paid features of your plan stop with it.",
    `Your store stays as it is for ${CLOSING_DAYS} days: its page, products, files, courses, community, contacts and orders, and your buyers go on reaching what they bought. Then it closes.`,
    `We email you when your plan ends, ${WARN_MONTH_DAYS} days before your store closes and ${WARN_WEEK_DAYS} days before it, each time with the date. Starting a plan again before then keeps your store.`,
    ...(o.assistant ? ["Your Store assistant add-on stops at the end of the month you already paid for, and nothing more is charged for it."] : []),
    "Your own Stripe account, its customers and its payouts are not touched.",
  ];
}

type Refusal = Exclude<PlanRefundReading["refund"]["kind"], "guarantee" | "unstarted_months">;

/** Why there is no refund to make, in plain words, and what to do instead. Never a button that would fail. */
export function refusalWords(reading: { refund: { kind: Refusal; reason: string } }): { title: string; body: string } {
  const r = reading.refund.reason;
  if (reading.refund.kind === "unknown") {
    return {
      title: "We cannot work out your refund here",
      body: r === "customer_credit"
        ? `Your account has a credit from an earlier change of plan, so the refund needs a person to work it out. Email ${SUPPORT_ADDRESS} and we will reply.`
        : r === "stripe_unread"
          ? `We could not reach our payment provider just now. Try again in a few minutes, or email ${SUPPORT_ADDRESS}.`
          : `Something about this payment needs a person to check it. Email ${SUPPORT_ADDRESS} and we will work out your refund.`,
    };
  }
  const why: Record<string, string> = {
    no_plan_payment: "You have not been charged for a plan yet, so there is nothing to refund. To stop a trial, cancel the subscription in your studio.",
    not_paid: "Your last plan payment did not go through, so there is nothing to refund.",
    nothing_paid: "Your last plan payment was nothing, so there is nothing to refund.",
    dispute_open: "This payment is in a dispute with your bank. The dispute decides what comes back to you, so we cannot refund it as well.",
    dispute_returned: "Your bank already returned this payment to you through a dispute.",
    already_refunded: "This payment has already been refunded.",
    guarantee_used: "The money-back guarantee is for the first payment on your account, and it was used before.",
    outside_window: `The money-back guarantee is for requests made within ${REFUND_DAYS} days of your first payment, and that time has passed.`,
    renewal: "A monthly renewal is not refunded. You can cancel your subscription in your studio, and it stops at the end of the month you paid for.",
    switch_charge: "A charge for switching plans is not refunded. You can cancel your subscription in your studio, and it stops at the end of the period you paid for.",
    months_used: "Every month of your yearly plan has started, so there are no months left to refund.",
    fee_kept: "What is left of your yearly payment is not more than the card fee we keep, so there is nothing to refund.",
  };
  return {
    title: "There is no refund to make",
    body: `${why[r] ?? "This payment cannot be refunded under our refund policy."} If you think this is wrong, email ${SUPPORT_ADDRESS}.`,
  };
}

/** The confirmation email, once the money is on its way and the plan has ended. */
export function planRefundLetter(o: { store: string; cents: number; currency: string; pending: boolean; assistant: boolean }): { subject: string; text: string } {
  const store = o.store || "your store";
  const lines = [
    `We refunded ${moneyOf(o.cents, o.currency)} for your Marktmorgen plan for ${store}, to the card or account you paid with.`,
    o.pending ? "Your bank is still processing it, and it may take a few days to show." : "Your bank may take a few days to show it.",
    "",
    ...refundEffects({ assistant: o.assistant }),
    "",
    "If you have a question, reply to this email.",
    "",
    "Marktmorgen",
  ];
  return { subject: `${store}: your plan payment was refunded`, text: lines.join("\n") };
}

/**
 * When a refund the creator asked for was not made after all (the daily job found none, or could not tell for
 * GIVE_UP_DAYS): nothing was refunded, the stop set for it was taken back, the plan goes on; how to ask again.
 */
export function planRefundNotMadeLetter(o: { store: string; undecided: boolean }): { subject: string; text: string } {
  const store = o.store || "your store";
  const lines = [
    o.undecided
      ? `We could not confirm the refund you asked for on your Marktmorgen plan for ${store}, so we did not end your plan.`
      : `The refund you asked for on your Marktmorgen plan for ${store} was not made: our payment provider did not take it.`,
    "",
    "Nothing was refunded and your plan goes on as before. It renews as usual unless you cancel it in your studio.",
    `To ask again, open your studio and choose "Refund my payment" under "What you pay us", or email ${SUPPORT_ADDRESS}.`,
    "",
    "Marktmorgen",
  ];
  return { subject: `${store}: your refund was not made`, text: lines.join("\n") };
}
