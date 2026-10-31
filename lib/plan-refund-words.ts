/**
 * What the plan refund tells the creator by email (305 [SY1]): pure, so the words are tested against the code they
 * describe.
 */

export const SUPPORT_ADDRESS = "support@marktmorgen.com";

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
