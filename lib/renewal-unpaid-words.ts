/**
 * What a creator is told when their plan's renewal payment did not go
 * through (232 [CA1] unit 4), in one place, so the studio, the email and the
 * Terms say the same thing and say what the code does:
 *
 *   - checkout, free copies and list sign-ups need a paid-up plan
 *     (lib/billing.ts isPaidUp: lib/store-checkout.ts, lib/free.ts,
 *     lib/store-join.ts, lib/paypal-sales.ts);
 *   - emails to the list need it (lib/plan.ts canUse "email", lib/mail.ts);
 *   - AI drafts, uploads and lesson video follow costStandingOf
 *     (lib/plan-standing.ts: lib/ai.ts, lib/ai-spend.ts, lib/upload-budget.ts,
 *     videoLimitFor, picturesLimitFor, taskRoomFor, and the upload routes'
 *     own refusal).
 */
export const RENEWAL_PAUSED_WORDS =
  "Until it is paid, your checkout takes no new orders, free copies or sign-ups, and emails to your list, AI drafts, lesson video and new uploads are paused.";

export const RENEWAL_KEPT_WORDS =
  "Your store's page stays up, your buyers keep reaching what they already bought except lesson video, your studio stays open, and nothing is deleted.";

export const RENEWAL_RESUME_WORDS = "Everything starts again as soon as Stripe records the payment.";
