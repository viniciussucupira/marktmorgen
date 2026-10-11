/**
 * Two emails during a trial to a store that has not sold yet (added 11
 * October 2026, lib/trial-nudges.ts). What is checked:
 *
 *   - the step named is the first missing one, in the order a store can
 *     sell: a product, the Stripe account, the store coach's weightiest
 *     check;
 *   - an email on the fourth day and one on the tenth, each once; a day the
 *     job missed is made up, but never two in one day;
 *   - none to a store that has sold, a trial set to stop, a trial that is
 *     over, or a subscription its store has not written down.
 */
import { addProduct, claimHandle, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { dueNudge, nextStep, nudgeEmail, sendTrialNudges } from "@/lib/trial-nudges";
import { redisPipeline } from "./redis-stub";
import { done, is, part } from "./check";

process.env.STRIPE_SECRET_KEY = "sk_test_trial_nudges_only";
process.env.RESEND_API_KEY = "re_test_trial_nudges_only";

const DAY = 86_400;
const START = 1_791_000_000;
const emails: { to: string; subject: string; text: string }[] = [];
let trials: Record<string, unknown>[] = [];

const trial = (id: string, handle: string, over: Record<string, unknown> = {}) => ({
  id,
  status: "trialing",
  trial_start: START,
  trial_end: START + 14 * DAY,
  cancel_at_period_end: false,
  metadata: { store: handle },
  customer: { email: "x@example.com" },
  ...over,
});

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.hostname === "api.stripe.com" && url.pathname === "/v1/subscriptions") {
    return new Response(JSON.stringify({ data: trials, has_more: false }), { status: 200 });
  }
  if (url.hostname === "api.resend.com") {
    const body = JSON.parse(String(init?.body ?? "{}"));
    emails.push({ to: Array.isArray(body.to) ? body.to[0] : body.to, subject: body.subject, text: body.text });
    return new Response(JSON.stringify({ id: "re_1" }), { status: 200 });
  }
  return new Response("{}", { status: 404 });
}) as typeof fetch;

async function main() {
  part("The step named");
  {
    await claimHandle("steps@example.com", "stepsstore", "Steps", "");
    let store = (await storeForEmail("steps@example.com"))!;
    is("with nothing to sell: put something up", nextStep(store).title, "Put up the first thing to sell");
    await addProduct("steps@example.com", "A guide", "", "19", null);
    store = (await storeForEmail("steps@example.com"))!;
    is("with no Stripe account: connect it", nextStep(store).title, "Connect your Stripe account");
    await setStripeAccount("steps@example.com", "acct_1TestNudges0001", true);
    store = (await storeForEmail("steps@example.com"))!;
    is("then the coach's weightiest check", nextStep(store).title, "A picture on every product");
    is("with a link to the place it is fixed", nextStep(store).url.includes("/studio") && nextStep(store).url.endsWith("#products"), true);
    const mail = nudgeEmail(store, nextStep(store), 10, 0);
    is("the first email says it is one of two", mail.text.includes("We write about this twice during your trial, and this is the first."), true);
    const last = nudgeEmail(store, nextStep(store), 4, 1);
    is("the second says the days left", last.subject, "4 days of your trial left: one thing that helps you sell");
  }

  part("Which day");
  {
    is("nothing on the first days", dueNudge(trial("sub_a", "x"), START + 2 * DAY), null);
    is("the first on the fourth day", dueNudge(trial("sub_a", "x"), START + 3 * DAY)?.which, 0);
    is("the second on the tenth", dueNudge(trial("sub_a", "x"), START + 9 * DAY)?.which, 1);
    is("none once the trial is over", dueNudge(trial("sub_a", "x"), START + 14 * DAY), null);
    is("none on a trial set to stop", dueNudge(trial("sub_a", "x", { cancel_at_period_end: true }), START + 3 * DAY), null);
    is("none on a plan already paying", dueNudge(trial("sub_a", "x", { status: "active" }), START + 3 * DAY), null);
  }

  part("Sent once each, never to a store that sold");
  {
    await claimHandle("nudge@example.com", "nudgestore", "Nudge", "");
    await setSubscription("nudge@example.com", { subscriptionId: "sub_Nudge0000001", active: true, tier: "creator", cycle: "month", trialEnds: START + 14 * DAY });
    await claimHandle("sold@example.com", "soldstore", "Sold", "");
    await setSubscription("sold@example.com", { subscriptionId: "sub_Sold00000001", active: true, tier: "creator", cycle: "month", trialEnds: START + 14 * DAY });
    const sold = (await storeForEmail("sold@example.com"))!;
    await redisPipeline([["SET", `nl:firstsale:${sold.sid || `h:${sold.handle}`}`, String(START + DAY)]]);
    await claimHandle("other@example.com", "otherstore", "Other", "");
    trials = [trial("sub_Nudge0000001", "nudgestore"), trial("sub_Sold00000001", "soldstore"), trial("sub_NotWritten01", "otherstore")];

    await sendTrialNudges(START + 3 * DAY);
    is("the first, to the store that has not sold only", emails.map((e) => e.to), ["nudge@example.com"]);
    await sendTrialNudges(START + 4 * DAY);
    is("not again the next day", emails.length, 1);
    await sendTrialNudges(START + 9 * DAY);
    is("the second on the tenth day", emails.length, 2);
    await sendTrialNudges(START + 10 * DAY);
    is("and no more", emails.length, 2);
  }

  part("A day the job missed");
  {
    await claimHandle("late@example.com", "latestore", "Late", "");
    await setSubscription("late@example.com", { subscriptionId: "sub_Late00000001", active: true, tier: "creator", cycle: "month", trialEnds: START + 14 * DAY });
    trials = [trial("sub_Late00000001", "latestore")];
    emails.length = 0;
    await sendTrialNudges(START + 10 * DAY);
    is("first seen on the eleventh day: only the second is sent", emails.map((e) => e.subject.startsWith("4 days") || e.subject.includes("days of your trial left")), [true]);
    await sendTrialNudges(START + 11 * DAY);
    is("and the first is not sent after it", emails.length, 1);
  }

  done();
}

main();
