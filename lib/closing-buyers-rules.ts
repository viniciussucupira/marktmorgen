/**
 * A store closing fairly for the people who bought from it (queue item 307
 * [EC1], owner's request of 23 October 2026, 15h58 Fortaleza, and its
 * complement of 30 October 2026, 13h12 Fortaleza). The figures and the words;
 * the server side is lib/closing-holds.ts, lib/closing-buyers.ts and
 * lib/closing-refunds.ts. Browser-safe: the studio and the checkout read these
 * too.
 *
 * What it changes, against what lib/plan-closing.ts did before:
 *
 *   1. Before buying, every buyer of something that lasts (a course, a
 *      download, a private podcast, a community, a membership) reads one
 *      fixed sentence, drawn here and never by the creator: access comes from
 *      the store on Marktmorgen, and if the store closes we email them at
 *      least BUYER_NOTICE_DAYS days first.
 *   2. On the day a plan ends, not on the closing day, no member is charged
 *      again until the closing: Stripe's own pause of collection with its
 *      invoices voided, on the creator's account (lib/closing-holds.ts). The
 *      members keep their access. A plan started again before the closing
 *      resumes each one exactly as it was, with nothing charged for the days
 *      in between.
 *   3. On the closing day every membership and payment plan ends at once,
 *      not at the end of its period.
 *   4. Time members paid for past the closing day is shown to the creator
 *      (UNUSED, below), with a button that gives it back from the creator's
 *      own Stripe account; whatever is left on the closing day is given back
 *      by the code that day, the same amounts, once. A balance that does not
 *      cover it is never made up by Marktmorgen: the member is told, with the
 *      creator's contact.
 *   5. BUYER_NOTICE_DAYS days before the closing every buyer gets one
 *      service email from Marktmorgen; if the plan is started again after
 *      it, one short email says the store stays.
 *   6. The creator's notices and studio say all of that, with the dates.
 */

import type { Tier } from "@/lib/plan";
import { ORDERS_INCLUDED, TRIAL_ORDERS } from "@/lib/order-rules";

const DAY_MS = 86_400_000;

/** Days before the closing every buyer is told, at the least. The creator's last notice is the same week (lib/plan-closing-rules.ts, WARN_WEEK_DAYS). */
export const BUYER_NOTICE_DAYS = 7;
/**
 * The buyers' notices start this many days before the BUYER_NOTICE_DAYS, so
 * that a store with many buyers, told over more than one daily run, still
 * closes on its day. A closing never comes sooner than BUYER_NOTICE_DAYS
 * after the last of them went out (lib/plan-closing.ts).
 */
export const BUYER_SEND_DAYS = 1;
/**
 * Plans that end on or after this day (31 October 2026, UTC) have their
 * buyers told before the closing: the day after this item was built, while
 * no plan was on sale.
 */
export const BUYER_NOTICE_FROM = Date.UTC(2026, 9, 31);
/**
 * Each buyer told takes two emails of the store's closing at the most: the
 * notice, and either "the store stays" or "your refund could not be made".
 */
export const EMAILS_PER_BUYER_PER_ENDING = 2;
/**
 * The cap on one closing's buyers, set before any of them is written to
 * (lib/closing-credit.ts): the orders a store of its plan may take in
 * BUYER_CAP_MONTHS months at full use (every buyer comes from at least one
 * order), and a free trial's orders for a store that never paid. Priced
 * against every payment, with the rest of the closing
 * (tests/plan-cost-registry.ts, closure), as the closing itself is: a store
 * closes after any payment. Addresses past the cap are not written to, and
 * are counted for the creator, who is asked to tell them (never silent).
 */
export const BUYER_CAP_MONTHS = 2;

export function buyerNoticeCap(tier: Tier, paid: boolean): number {
  return paid ? (ORDERS_INCLUDED[tier] ?? ORDERS_INCLUDED.creator) * BUYER_CAP_MONTHS : TRIAL_ORDERS;
}

/**
 * Whether the plan that ended was paid for, as the store's record last said:
 * a plan that ends keeps the trial's end it last ran with (lib/store.ts,
 * setSubscription), which is none once a plan has been paid for.
 */
export function paidBefore(store: { trialEnds?: number }): boolean {
  return !(Number(store.trialEnds) > 0);
}

/** Pages of a hundred checkouts read for one store in one daily run. The rest are read the next day. */
export const BUYER_PAGES_PER_RUN = 20;
/** Memberships held, released or ended at Stripe for one store in one run, a page of a hundred at a time. */
export const HOLD_PAGES_PER_RUN = 50;
/** The most members' payments refunded together in one request to the studio. */
export const REFUNDS_PER_REQUEST = 200;

/**
 * The fixed sentence, part 1: at checkout and on the receipt of everything a
 * buyer keeps coming back to. Drawn by the code; the creator cannot change
 * it or leave it out. Plain US English, about grade 7.
 */
export const CLOSING_ACCESS_SENTENCE =
  `Your access is provided by this store on Marktmorgen. If the store closes, we will email you at least ${BUYER_NOTICE_DAYS} days before, so you can download what can be downloaded.`;

/** The Stripe subscription fields these rules read. */
export type HeldSub = {
  id?: unknown;
  status?: unknown;
  metadata?: Record<string, string> | null;
  pause_collection?: { behavior?: unknown; resumes_at?: unknown } | null;
};

/** States a subscription can still be charged in. */
const CHARGEABLE = new Set(["active", "trialing", "past_due", "unpaid", "incomplete"]);

export function chargeable(sub: HeldSub): boolean {
  return typeof sub.status === "string" && CHARGEABLE.has(sub.status);
}

/** A payment plan (installments for one product), told apart from a membership: it buys a thing, not time. */
export function isPaymentPlan(sub: HeldSub): boolean {
  const meta = sub.metadata ?? {};
  return meta.kind === "plan" || Boolean(meta.ends_after);
}

/**
 * The update that holds one subscription's charges from the day the plan
 * ended: Stripe's pause of collection, its invoices voided, with no day to
 * resume on (resumed only by us). A pause the member chose themselves
 * (lib/membership-pause.ts) is kept in the metadata, to be put back as it
 * was; while the hold lasts its doors are open, since nothing is charged.
 */
export function holdBody(sub: HeldSub, endedAt: number): URLSearchParams {
  const body = new URLSearchParams({ "pause_collection[behavior]": "void", "metadata[store_hold]": String(endedAt) });
  const own = sub.pause_collection;
  const resumes = own && typeof own === "object" ? Number(own.resumes_at) : 0;
  if (Number.isFinite(resumes) && resumes > 0 && !sub.metadata?.store_hold) body.set("metadata[hold_member_resumes]", String(Math.floor(resumes)));
  return body;
}

/**
 * The update that lets one go again when the plan is started before the
 * closing: exactly as it was. A pause the member chose that has not ended
 * is put back with its own day; otherwise collection simply resumes, and the
 * voided invoices of the days between are never charged (Stripe: voided
 * invoices create no charge).
 */
export function releaseBody(sub: HeldSub, nowSeconds: number): URLSearchParams {
  const resumes = Number(sub.metadata?.hold_member_resumes ?? 0);
  const body = new URLSearchParams({ "metadata[store_hold]": "", "metadata[hold_member_resumes]": "" });
  if (Number.isFinite(resumes) && resumes > nowSeconds) {
    body.set("pause_collection[behavior]", "void");
    body.set("pause_collection[resumes_at]", String(Math.floor(resumes)));
  } else body.set("pause_collection", "");
  return body;
}

/** One member's last payment, kept from the day the plan ended until the closing (lib/closing-holds.ts). */
export type PaidPeriod = {
  /** The invoice paid. */
  inv: string;
  /** What was paid on it, in the currency's smallest unit, and the currency. */
  amt: number;
  cur: string;
  /** The period it paid for, in seconds. */
  ps: number;
  pe: number;
  /** The member's address, for the one email that says a refund could not be made. */
  e: string;
  /** What became of the refund: done, short (the balance did not cover it), disputed, pending at Stripe, none (nothing left to give). */
  r?: "done" | "short" | "disputed" | "pending" | "none";
  /** What was given back, when done or pending; what was to be, when short. */
  back?: number;
  want?: number;
  /** The member was emailed that their refund could not be made. */
  m?: 1;
};

/**
 * The part of a payment a member paid for past the closing day, in the
 * currency's smallest unit: the payment times the share of its period that
 * lies after the day, rounded to the nearest unit. Nothing for a period that
 * ends by then, for a period of no length, or for a payment of nothing.
 */
export function unusedOf(paid: Pick<PaidPeriod, "amt" | "ps" | "pe">, closingDayMs: number): number {
  const day = Math.floor(closingDayMs / 1000);
  const length = paid.pe - paid.ps;
  if (!Number.isFinite(length) || length <= 0 || !(paid.amt > 0) || paid.pe <= day) return 0;
  const after = paid.pe - Math.max(day, paid.ps);
  return Math.min(paid.amt, Math.round((paid.amt * after) / length));
}

/**
 * What is given back for it, now that `refunded` has been already (by the
 * creator, at Stripe or here): never more than the unused part in all, so a
 * member is never given the same time back twice.
 */
export function stillToGive(unused: number, refunded: number): number {
  return Math.max(0, unused - Math.max(0, refunded));
}

/** Totals by currency, for a creator to read. */
export function totalsOf(rows: { amount: number; cur: string }[]): { cur: string; amount: number }[] {
  const by = new Map<string, number>();
  for (const row of rows) if (row.amount > 0) by.set(row.cur, (by.get(row.cur) ?? 0) + row.amount);
  return [...by].map(([cur, amount]) => ({ cur, amount })).sort((a, b) => a.cur.localeCompare(b.cur));
}

/** The day the buyers' notices may start, for a closing on `day` (ms). */
export function buyersStartOn(day: number): number {
  return day - (BUYER_NOTICE_DAYS + BUYER_SEND_DAYS) * DAY_MS;
}

/** The closing day, given the day the last buyer was told: never sooner than BUYER_NOTICE_DAYS after. */
export function afterBuyersTold(day: number, toldDone: number | undefined): number {
  return toldDone ? Math.max(day, toldDone + BUYER_NOTICE_DAYS * DAY_MS) : day;
}

const dateWords = (ms: number) => new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export type BuyerLetter = { subject: string; text: string };

/**
 * The one service email to a buyer, BUYER_NOTICE_DAYS days before the
 * closing at the least. Not marketing: no offer, no urgency words, no figure
 * but the date and, for a member, their own amount.
 */
export function buyerNotice(input: {
  store: string;
  storeUrl: string;
  day: number;
  contact: string;
  /** For a member who paid for time past the day: what is given back, already written as money. */
  refund?: string;
  member?: boolean;
}): BuyerLetter {
  const day = dateWords(input.day);
  return {
    subject: `${input.store} closes on ${day}`,
    text: [
      `You bought from ${input.store}, a store on Marktmorgen. The store closes on ${day}.`,
      "",
      "After that day, what you got from it will no longer open here. Until then, you can",
      "download what can be downloaded: files, podcast episodes, course certificates and",
      "the work you handed in. Go to the store, open what you bought and save a copy:",
      "",
      input.storeUrl,
      "",
      ...(input.member
        ? [
            "Your membership payments have stopped: nothing more will be charged, and you keep",
            "your access until that day.",
            ...(input.refund
              ? [`You paid for time after that day. ${input.refund} will be given back to you from the store's`, "own Stripe account by that day. If it cannot be, we will email you."]
              : []),
            "",
          ]
        : []),
      `Questions about what you bought go to ${input.store}: ${input.contact}`,
      "",
      `You are getting this one email because you bought from ${input.store} and its access`,
      "depends on the store being open. It is not a newsletter, and there is nothing to",
      "stop.",
    ].join("\n"),
  };
}

/** The short email when the store's plan was started again after the notice. */
export function staysOpenLetter(input: { store: string; storeUrl: string; contact: string }): BuyerLetter {
  return {
    subject: `${input.store} is staying open`,
    text: [
      `We wrote to you that ${input.store} would close. It is staying open: you do not need to do`,
      "anything, and what you bought works as before.",
      "",
      input.storeUrl,
      "",
      `Questions go to ${input.store}: ${input.contact}`,
    ].join("\n"),
  };
}

/** The email to a member whose refund the store's balance did not cover. */
export function refundShortLetter(input: { store: string; amount: string; contact: string }): BuyerLetter {
  return {
    subject: `Your refund from ${input.store} could not be made`,
    text: [
      `${input.store} closed today. You had paid for time after today, and ${input.amount} was to be`,
      "given back to you from the store's own Stripe account. The store's balance did not",
      "cover it, so the refund could not be made.",
      "",
      `Marktmorgen does not hold the store's money and cannot make the refund. Please contact`,
      `${input.store} directly: ${input.contact}`,
    ].join("\n"),
  };
}

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/**
 * A service email as HTML beside its text (accessibility AAA, AX274): the same
 * words, one paragraph a block, links as their own text, dark text on white
 * (#1c1917 on #ffffff, about 17:1) and the footer at #44403c on #f7f5f0
 * (about 9.5:1), at 16px with a line height of 1.6, no image, no layout
 * table. `postal` is the company's address, drawn under it.
 */
export function letterHtml(text: string, postal: string): string {
  const blocks = text.split(/\n\s*\n/).map((block) => block.replace(/\n/g, " ").trim()).filter(Boolean);
  const linked = (block: string) => escape(block).replace(/https?:\/\/[^\s<]+/g, (url) => `<a href="${url}" style="color:#4c1d95;text-decoration:underline">${url}</a>`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:0;background:#f7f5f0">
<div role="article" aria-roledescription="email" lang="en" style="max-width:560px;margin:0 auto;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1c1917">
<div style="background:#ffffff;border-radius:16px;padding:24px">${blocks.map((b) => `<p style="margin:0 0 16px">${linked(b)}</p>`).join("")}</div>
<p style="margin:16px 8px 0;font-size:14px;line-height:1.6;color:#44403c">Marktmorgen, ${escape(postal)}</p>
</div></body></html>`;
}
