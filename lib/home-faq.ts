/**
 * The questions answered on the home page, and their answers.
 *
 * They live here rather than beside the component that draws them because the
 * page writes them down twice: once for a reader, once in the form a search
 * engine reads. One list, so the two can never say different things.
 */
import { PUBLISHED_PRICE_CENTS as PRICE_CENTS, REFUND_DAYS, TRIAL_DAYS } from "@/lib/plan";
import { MAX_PRODUCTS } from "@/lib/catalog-rules";
import { PLANS_ON_SALE } from "@/lib/opening";
import { feeWords } from "@/lib/fee-words";

export function homeQuestions(paypalAvailable = false) {
return [
  {
    q: "Can I sign up and start selling today?",
    a: !PLANS_ON_SALE
      ? `You can sign up today, and selling starts when Marktmorgen opens. It is still being built, so its plans are not on sale yet and we take no card. What you can do now costs nothing: take your store address, connect your own Stripe account, put up what you sell and set your page up. When plans open, the $${PRICE_CENTS / 100} subscription switches on your checkout, its first ${TRIAL_DAYS} days are free, and your first payment is covered by a ${REFUND_DAYS}-day money-back guarantee.`
      : `Yes. You take your store address, connect your own Stripe account and put up what you sell; a buyer can pay for it on your account, ${feeWords().onTop}. The address, the page, the editor and connecting Stripe cost nothing. The $${PRICE_CENTS / 100} subscription switches on your checkout — selling, and giving things away for an email address — and its first ${TRIAL_DAYS} days are free. Your card is taken when the trial starts and first charged when it ends, so you can make a sale before you decide, and canceling inside the trial means it is never charged. The trial is for your first store; a second store is paid from day one. After that, your first payment is covered by a ${REFUND_DAYS}-day money-back guarantee: ask inside ${REFUND_DAYS} days of it, for any reason or none, and it comes back in full.`,
  },
  {
    q: "Who holds the money from my sales?",
    a: feeWords().whoHoldsLong,
  },
  {
    q: "What happens to my payments and customer data if I leave?",
    a: "Your Stripe account, its customers and its payout history stay with you, because they were never held by us: every charge was made on your account. Your email list, your buyers and your product list download as files at any time. What does not travel is what runs here — your store page, your course pages and the links that deliver your files — so buyers would need somewhere new to collect what they bought. A shutdown would come with notice in writing."
  },
  {
    q: "What does Stan have that Marktmorgen does not, yet?",
    a: `Among other things: automatic Instagram replies, ${paypalAvailable ? "" : "PayPal at checkout, "}an iPhone app from the App Store, affiliate payouts that need no PayPal account of your own, and stores with no limit on products, where ours hold ${MAX_PRODUCTS.toLocaleString("en-US")}. What we have in their place: a studio that installs from the browser with notifications, Google Meet and Zoom links for supported connected accounts, subject to provider availability and connection requirements, a private Jitsi Meet room for each booking and each live event, and an affiliate program whose payouts leave your own PayPal, in one press or on payday by itself. Each gap is listed by name on the feature-by-feature page, with where we stand on it, and nothing is advertised here before it exists.`,
  },
  {
    q: "Who is behind this?",
    a: "Marktmorgen’s creator also handles support, in English and in writing.",
  },
];
}

/** Conservative default for callers without deployment capabilities. */
export const HOME_QUESTIONS = homeQuestions();
