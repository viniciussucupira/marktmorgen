import { MIN_VIEWS, MIN_SALES, REFUND_DAYS, FALSE_WINNER } from "@/lib/headline-test-rules";

/** Public explanations share the decision constants, never the studio's
 * displayed chance. This module does not decide a winner or read counts. */
export const PAGE_TEST_PAID_WORDS =
  `For a paid product, the winner brings more money per visitor, from sales paid on your own Stripe account. Each version must have at least ${MIN_VIEWS} views and ${MIN_SALES} paid sales, and the test must have run for ${REFUND_DAYS} days. The difference must also be clear enough to count even when you check the result every day. More checkouts alone do not make a paid version win. The totals are gross payments: refunds are not subtracted.`;
export const PAGE_TEST_FREE_WORDS =
  `For a free product, the winner brings clearly more sign-ups. Each version needs at least ${MIN_VIEWS} views, enough sign-ups to compare fairly and a clear difference. If visitors are not split as expected, no winner is called.`;
export const PAGE_TEST_RUNNING_WORDS =
  '“Still running” means there is no winner yet: there may be too little data, too little time or no clear difference. The chance shown in the studio is information, not the rule that chooses the winner. Prices are never tested.';
export const PAGE_TEST_FALSE_WINNER_WORDS =
  `The rule is set for a ${FALSE_WINNER * 100}% chance of choosing a false winner over the whole test. That limit covers all the times you look, rather than starting over on each reading.`;
export const PAGE_TEST_WORDS =
  [PAGE_TEST_PAID_WORDS, PAGE_TEST_FREE_WORDS, PAGE_TEST_RUNNING_WORDS, PAGE_TEST_FALSE_WINNER_WORDS].join(" ");
