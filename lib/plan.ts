/**
 * What we charge, in one place.
 *
 * These numbers are read by the checkout that actually bills a creator and by
 * the pages that tell the world the price. They live here, rather than in
 * lib/billing.ts, because that file talks to Stripe with a secret key and must
 * never be pulled into a browser bundle — and a marketing page that cannot
 * import the real number ends up retyping it, which is how a site starts
 * advertising a price the checkout does not open with.
 *
 * Nothing in this file may ever read an environment variable or a secret. That
 * is the whole reason it is safe for a client component to import it.
 */

/**
 * The plans. Pro adds what costs us money to run for you, and Scale is Pro
 * with room for a list that has outgrown it.
 */
export type Tier = "creator" | "pro" | "scale";
/** Every plan, from the least to the most. */
export const TIERS: readonly Tier[] = ["creator", "pro", "scale"];
/** How often it is billed. */
export type Cycle = "month" | "year";

/** Every price we charge, in cents. Never below what Stan charges for the same. */
export const PLAN_PRICES: Record<Tier, Record<Cycle, number>> = {
  creator: { month: 2900, year: 30000 },
  pro: { month: 9900, year: 94800 },
  // What Kajabi charges for its middle plan, monthly and yearly, read from its
  // pricing page on October 6, 2026. See SCALE_MONTHLY_EMAILS for why it exists.
  scale: { month: 24900, year: 238800 },
};

/** The monthly subscription, in cents: the price the site leads with. */
export const PRICE_CENTS = PLAN_PRICES.creator.month;
/** The same plan, paid once a year. */
export const YEAR_PRICE_CENTS = PLAN_PRICES.creator.year;

/** What paying yearly saves over twelve monthly payments, in cents. */
export function yearSaving(tier: Tier): number {
  return PLAN_PRICES[tier].month * 12 - PLAN_PRICES[tier].year;
}

/** "$29 a month", "$300 a year". */
export function priceWords(tier: Tier, cycle: Cycle): string {
  const cents = PLAN_PRICES[tier][cycle];
  // "$2,388 a year": a price in the thousands is written the way it is said.
  const dollars = (cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 });
  return `$${dollars} a ${cycle}`;
}

/**
 * What each plan is called on an invoice, at Stripe, and in the studio.
 *
 * These are billing identities. They are the names already on the Stripe
 * products a paying creator's subscription points at, so they do not change
 * for the sake of a page.
 */
export const PLAN_NAMES: Record<Tier, string> = {
  creator: "Marktmorgen",
  pro: "Marktmorgen Pro",
  scale: "Marktmorgen Scale",
};

/**
 * What each plan is called where somebody is choosing between them.
 *
 * "Marktmorgen" and "Marktmorgen Pro" name the seller, not the plan: told
 * only that, a creator still has to read two columns of features to work out
 * which one is their own business. A title has one job in front of somebody
 * deciding — to say what this plan is for — and "Pro" does the opposite of
 * that, because it describes the person rather than the plan and implies the
 * cheaper one is for amateurs.
 *
 * So the chooser reads these, and the small print under the button names the
 * plan the way the invoice will name it, from PLAN_NAMES above. One file, so
 * the two can never drift apart.
 */
export const PLAN_TITLES: Record<Tier, string> = {
  creator: "Storefront",
  pro: "Storefront & Email",
  scale: "Storefront & Email for a big list",
};

/**
 * Whether Pro can be bought.
 *
 * Pro is what costs us money to run for a creator, or what a creator buys
 * back from us. Three things are built and in it today: email to their
 * list, their own domain, and taking our name off the foot of their page.
 * Nothing else is
 * part of it until it exists in the code. The API that reads a store
 * (app/api/v1) is built and is on every plan, not only Pro; one that writes
 * is not built, and is not sold. Several stores per account are built, and are not a Pro feature: an
 * account runs up to five (lib/store.ts, MAX_STORES_PER_ACCOUNT), each on a
 * plan of its own, Creator or Pro. Funnels and affiliates are built and are
 * on every plan, not only Pro. It went on sale with the first of
 * those two, and not a day before: a plan that costs more and adds nothing
 * yet is not something we will take money for.
 */
export const PRO_ON_SALE = true;

/**
 * Emails a Pro store may send to its list in a calendar month: one-off
 * emails and automatic sequences together. Published, like every limit here.
 *
 * Twenty-five thousand, and the number is set against the price rather than
 * picked for the page. Every email costs us $0.0009 to send, so this is
 * $22.50 at the top, against the $95.83 a $99 subscription leaves after the
 * card fee. It was fifty thousand, which was $45 — nearly half the plan on
 * one line, and enough to put Pro into a loss once every other brake was at
 * its limit too.
 *
 * It is still five full sends a month to a list of five thousand, which is
 * more than almost anybody writes.
 */
export const PRO_MONTHLY_EMAILS = 25_000;
/** The same, while the free trial runs, so a trial cannot be used to spam. */
export const TRIAL_MONTHLY_EMAILS = 1_000;

/**
 * Emails a store on Scale may send to its list in a calendar month.
 *
 * Scale is here because of what happened to the store this one was first
 * measured against. Stan sold one $29 plan and then a $99 one, and a creator
 * who went on to sell ten times as much still paid the same: Sacra put it at
 * $35M of yearly revenue in 2025, growing 24% after 93% the year before, and
 * named the cause as a flat price with nothing to move up to. A store whose
 * list has outgrown Pro had the same wall here: the month's emails ran out
 * and the only answer was to wait for the first of the next one.
 *
 * So this is Pro with three times the email, at the price Kajabi charges for
 * the plan a business of that size is on. It is the same product with a
 * larger number, said as that: nothing is held back from Pro to make it look
 * better.
 *
 * Seventy-five thousand, set against the price like Pro's own number. At
 * $0.0009 an email that is $67.50 at the top. With every other brake at its
 * limit too the plan costs about $102 against the $241 a monthly charge
 * leaves, and against $193 a month on the yearly price: 58% kept in the
 * worst month on the one and 47% on the other, more than Pro keeps on
 * either (tests/plan-margin.test.ts adds it up). A hundred thousand was the
 * first figure, and left 36% on the yearly price.
 */
export const SCALE_MONTHLY_EMAILS = 75_000;

/** Whether a plan has what Pro switches on: Pro itself, and Scale above it. */
export function hasPro(tier: Tier): boolean {
  return tier === "pro" || tier === "scale";
}

/** Emails to a list that a paid-up store on this plan may send in a month. */
export function monthlyEmails(tier: Tier): number {
  return tier === "scale" ? SCALE_MONTHLY_EMAILS : tier === "pro" ? PRO_MONTHLY_EMAILS : 0;
}

/**
 * What only Pro switches on. "email", "domain" and "branding" are the ones
 * built. "api" is a name kept for when it is, and "stores" one kept from
 * when several stores were planned for Pro: they are built and on every
 * plan (above), and nothing reads either name.
 *
 * "branding" is the one that costs us nothing to run and something to give:
 * it takes our name off the foot of the creator's page. It is here rather
 * than on every plan because the name at the foot of a page is how a store
 * brings us the next creator, and a store that would rather not carry it is
 * buying back the thing it would otherwise have paid us in.
 */
export type ProFeature = "email" | "domain" | "branding" | "stores" | "api";

/**
 * Whether a store may use a Pro feature right now: paid up, on Pro. Read from
 * the snapshot the studio refreshes, so a buyer's page never waits on Stripe.
 */
export function canUse(
  store: { subscriptionActive: boolean; tier: Tier },
  feature: ProFeature,
): boolean {
  void feature;
  return store.subscriptionActive && hasPro(store.tier);
}

export function parseTier(raw: unknown): Tier | null {
  return raw === "creator" || raw === "pro" || raw === "scale" ? raw : null;
}

export function parseCycle(raw: unknown): Cycle | null {
  return raw === "month" || raw === "year" ? raw : null;
}

/**
 * Days of the subscription that are free.
 *
 * The card is taken when the trial starts and first charged when it ends, and
 * cancelling inside it — one click in the studio — means it is never charged.
 * Every public sentence about the trial has to say exactly that, no more.
 *
 * Long enough for a creator to put a product up and actually sell something
 * before deciding whether we are worth paying for. A trial that ends before
 * the first sale proves nothing to anybody.
 */
export const TRIAL_DAYS = 14;

/**
 * Days after a charge in which we give it back in full, on request.
 *
 * The trial answers "is this the right tool", which you can tell in a
 * fortnight. This answers a different question — "was paying for it worth
 * it" — and that one is only answered by using it on a real month of real
 * sales, which is longer than the trial and starts after it. A window
 * shorter than that asks a creator to decide before they can know, which is
 * how a refund policy ends up being a formality rather than a promise.
 *
 * It covers the first payment on an account, in full (changed 12 October
 * 2026; until then every charge). A month given back after it was used is a
 * month we served for nothing, up to the plan's whole worst case plus the
 * card fee Stripe keeps: a bounded cost, taken once, so somebody can try a
 * paid plan for real. On every charge it was a way to use every month free
 * by asking, with no bound at all. A yearly plan is refunded at any time for
 * the months not started, the months used kept at the monthly price, which
 * always covers that month's worst case (tests/plan-margin.test.ts); so
 * three hundred dollars taken in one payment is still the charge most worth
 * standing behind, and a creator who regrets it in week three loses one
 * month, not twelve.
 *
 * Every public sentence about refunds reads this number, including the
 * Refund Policy and the Terms, and INVITE_HOLD_DAYS is derived from it so
 * credit is never paid out on a payment that can still be given back.
 */
export const REFUND_DAYS = 30;
