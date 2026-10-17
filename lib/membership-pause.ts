/**
 * A member pausing their membership, or coming back early, from the page the
 * emailed link opens (app/[handle]/manage). The rules, and why, are in
 * lib/membership-pause-rules.ts.
 *
 * The membership is checked against the link before Stripe is asked anything,
 * as cancelling is (lib/membership-manage.ts, openCancel): it has to belong to
 * the customer the link was issued for, on this store's account, and be one
 * this store sold. Then Stripe is told to skip the payments of the pause
 * (pause_collection, void, resuming on the day it ends), and the membership
 * carries when the pause starts and when it was asked for, which is all the
 * doors read (lib/membership-access.ts, memberState).
 */
import { onAccount, StripeError } from "@/lib/stripe-account";
import { grantOf, subsOf, type SubRow } from "@/lib/membership-manage";
import { forgetStatus } from "@/lib/membership-access";
import { productOfSub } from "@/lib/tier-rules";
import { readListings } from "@/lib/catalog";
import { sendEmail } from "@/lib/email";
import { fromCreator, storeBase } from "@/lib/purchase-email";
import { speech } from "@/lib/buyer-words";
import { membershipWords } from "@/lib/buyer-words/membership";
import type { Store } from "@/lib/store";
import { type PauseSub, addMonths, cannotPause, pauseOf, periodEndOf } from "@/lib/membership-pause-rules";

const SUB_PATTERN = /^sub_[A-Za-z0-9]{6,64}$/;

export type PauseResult = { ok: true; from: number; until: number } | { ok: false; reason: "expired" | "cannot" | "error" };
export type ResumeResult = { ok: true } | { ok: false; reason: "expired" | "cannot" | "declined" | "error" };

async function memberSub(store: Store, token: string, subscription: string): Promise<{ sub: SubRow & PauseSub; account: string; customer: string } | "expired" | null> {
  if (!SUB_PATTERN.test(subscription)) return null;
  const grant = await grantOf(store, token);
  if (!grant) return "expired";
  const sub = (await subsOf(store, grant)).find((s) => s.id === subscription);
  return sub ? { sub: sub as SubRow & PauseSub, account: grant.a, customer: grant.c } : null;
}

/** The date a member reads, in the store's language. */
function day(store: Store, seconds: number): string {
  return speech(store).date(seconds * 1000);
}

/** Pauses one membership for `months`, from the end of the period already paid for. */
export async function pauseMembership(store: Store, token: string, subscription: string, months: number, now = Math.floor(Date.now() / 1000)): Promise<PauseResult> {
  if (!Number.isInteger(months) || months < 1 || months > store.pause) return { ok: false, reason: "cannot" };
  let found: Awaited<ReturnType<typeof memberSub>>;
  try {
    found = await memberSub(store, token, subscription);
  } catch (error) {
    console.error("reading a membership to pause failed", error);
    return { ok: false, reason: "error" };
  }
  if (found === "expired") return { ok: false, reason: "expired" };
  if (!found || cannotPause(found.sub, store.pause, now) !== null) return { ok: false, reason: "cannot" };
  const from = periodEndOf(found.sub);
  const until = addMonths(from, months);
  try {
    await onAccount(
      "POST",
      found.account,
      `/subscriptions/${encodeURIComponent(subscription)}`,
      new URLSearchParams({
        "pause_collection[behavior]": "void",
        "pause_collection[resumes_at]": String(until),
        "metadata[pause_from]": String(from),
        "metadata[paused_at]": String(now),
      }),
      undefined,
      `nimbus-pause:${subscription}:${from}`,
    );
  } catch (error) {
    console.error("pausing a membership failed", error);
    return { ok: false, reason: "error" };
  }
  await forgetStatus(found.account, subscription).catch(() => null);
  await tellPaused(store, found.account, found.customer, found.sub, from, until).catch((error) => console.error("telling a member of their pause failed", error));
  return { ok: true, from, until };
}

/**
 * Ends a pause early. Before it has started, that only takes it off: the
 * member is still inside what they paid for. Once it has, the membership
 * starts a new period today with a payment, and Stripe is asked to refuse the
 * change if that payment fails, so nobody is let back in on a declined card.
 */
export async function resumeMembership(store: Store, token: string, subscription: string, now = Math.floor(Date.now() / 1000)): Promise<ResumeResult> {
  let found: Awaited<ReturnType<typeof memberSub>>;
  try {
    found = await memberSub(store, token, subscription);
  } catch (error) {
    console.error("reading a membership to resume failed", error);
    return { ok: false, reason: "error" };
  }
  if (found === "expired") return { ok: false, reason: "expired" };
  const pause = found ? pauseOf(found.sub) : null;
  if (!found || !pause) return { ok: false, reason: "cannot" };
  const body = new URLSearchParams({ pause_collection: "", "metadata[pause_from]": "" });
  if (now >= pause.from) {
    body.set("billing_cycle_anchor", "now");
    body.set("proration_behavior", "none");
    body.set("payment_behavior", "error_if_incomplete");
  }
  try {
    await onAccount("POST", found.account, `/subscriptions/${encodeURIComponent(subscription)}`, body);
  } catch (error) {
    if (error instanceof StripeError && error.status === 402) return { ok: false, reason: "declined" };
    console.error("resuming a membership failed", error);
    return { ok: false, reason: "error" };
  }
  await forgetStatus(found.account, subscription).catch(() => null);
  return { ok: true };
}

/** The member's note of their pause, from the store, in its language, with the dates. */
async function tellPaused(store: Store, account: string, customer: string, sub: SubRow, from: number, until: number): Promise<void> {
  const person = (await onAccount("GET", account, `/customers/${encodeURIComponent(customer)}`)) as { email?: unknown };
  if (typeof person.email !== "string" || !person.email.includes("@")) return;
  const m = membershipWords(store.language);
  const product = productOfSub(sub);
  const title = (product ? (await readListings(store, [product]).catch(() => []))[0]?.title : "") || store.name;
  await sendEmail({ meter: { by: "store", store: store, kind: "email" },
    from: fromCreator(store),
    to: person.email,
    replyTo: store.email,
    subject: m.pause.emailSubject(title).slice(0, 200),
    text: `${m.pause.emailBody(title, store.name, day(store, from), day(store, until))}\n\n${storeBase(store)}/manage`,
    idempotencyKey: `nimbus-paused:${sub.id}:${from}`,
  });
}
