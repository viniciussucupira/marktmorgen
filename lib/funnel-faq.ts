/**
 * The questions someone starting out asks about funnels (534 [FQ1], added
 * 1 November 2026), answered only by what the code does today, read from
 * its own sources: the kinds of funnel (lib/funnel-types.ts), the studio's
 * own buttons (components/funnel-type-picker.tsx), what a step counts
 * (lib/funnel-metrics.ts), whether paid plans are on sale (lib/opening.ts)
 * and the trial's length (lib/plan.ts).
 *
 * No number of customers or sales, no time promise, no "proven". Shown on
 * the funnels page in its "Questions" block, so the page and its FAQPage
 * data are one text (components/topic-page.tsx).
 */
import { FUNNEL_TYPES } from "@/lib/funnel-types";
import { funnelStepMetrics } from "@/lib/funnel-metrics";
import { PLANS_ON_SALE } from "@/lib/opening";
import { TRIAL_DAYS } from "@/lib/plan";

/** The studio's own buttons, in the order a funnel is made (components/funnel-type-picker.tsx). */
export const FUNNEL_STUDIO_BUTTONS = ["Choose a kind", "Review funnel", "Create disabled funnel"] as const;

/** One step's line as the studio writes it, for an example the answer says is one. */
const EXAMPLE_STEP = funnelStepMetrics({ seen: 40, done: 6, product: true, free: false });

export function funnelBeginnerQuestions(onSale = PLANS_ON_SALE, trialDays = TRIAL_DAYS): { q: string; a: string }[] {
  const [choose, review, create] = FUNNEL_STUDIO_BUTTONS;
  return [
    {
      q: "What is a funnel?",
      a: "A few pages a visitor walks through in order, from one address: your own pages and your products' pages. After someone pays, it can offer them one more of your products, which they take with one tap.",
    },
    {
      q: "Which kind of funnel should I use?",
      a: `Pick the one that matches what you sell. ${FUNNEL_TYPES.map((type) => `${type.label}: ${type.hint}`).join(" ")}`,
    },
    {
      q: "How long does it take to build one?",
      a: `It depends on how much you write, so no time is promised. In your studio, under Funnels, press “${choose}”, pick a kind, choose one of your products for each step, press “${review}”, then “${create}”. The pages it makes stay hidden and the funnel stays off until you fill them in and switch it on.`,
    },
    {
      q: "Can I try it before paying?",
      a: onSale
        ? `Yes. An eligible first store can start a ${trialDays}-day trial when it picks a plan. Funnels are on every plan, within that plan's limits.`
        : "Paid plans are not on sale yet, so there is nothing to pay for now. You can open the demo store at https://marktmorgen.com/demo, a made-up store marked as a demo, to see a store working with Stripe's test card.",
    },
    {
      q: "Does it count opens and clicks?",
      a: "It does not count email opens, on purpose: there is no tracking pixel and no open rate. Links to your store in an email carry that email's tag, so the visits and sales it brought are counted for it. On a funnel, each step shows how many people opened it and how many paid or signed up.",
    },
    {
      q: "Do funnels work?",
      a: `We publish no number of customers or sales, because we do not have a real, checked count to show. Your own funnel tells you whether it works for you: each step shows a line such as “${EXAMPLE_STEP}” (an example), and if the counts cannot be read it says “Counts unavailable” rather than showing a zero.`,
    },
  ];
}
