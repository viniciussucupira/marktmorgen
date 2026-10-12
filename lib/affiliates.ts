/**
 * A creator's affiliates: people who send buyers to the store and earn a
 * share of what those buyers pay.
 *
 * The one rule this file is built around: Marktmorgen never holds, moves or pays
 * out any of this money. Every sale is paid to the creator's own Stripe
 * account, in full, like every other sale here. What is kept is the record —
 * who applied, who the creator let in, which sale came through whose link,
 * what that earns and what the creator says they have paid — and the creator
 * pays their affiliates themselves, however they like. The studio says so,
 * and so does every page an affiliate sees.
 *
 * How a sale is credited:
 *
 *   - an affiliate's link is the store's address with ?via=<code>. Following
 *     it leaves a first-party cookie on the store's own address (proxy.ts)
 *     holding the code and the time. The last link followed wins;
 *   - when the buyer opens a checkout within the store's window, and the code
 *     belongs to someone the creator approved, the affiliate and the share
 *     the product earns today travel with the charge in its metadata. Only
 *     one-off payments are credited: memberships and payment plans are not;
 *   - once Stripe says the checkout is settled, the sale is written down here
 *     with what was paid before tax, read from Stripe. The thanks page and
 *     the five-minute job both do this, so a buyer who never comes back is
 *     still counted, and each sale is written once;
 *   - what it earns is worked out when it is shown, against the refunds on
 *     the creator's Stripe account, so a refunded sale earns nothing and a
 *     partly refunded one earns on what was kept;
 *   - a membership or a payment plan, where the creator credits them (added
 *     12 October 2026, lib/affiliate-setting.ts recurring), carries the
 *     affiliate on its subscription, and each of its paid invoices is read
 *     from the creator's Stripe account when the book is: a membership's
 *     while it is within the months agreed when it was sold, a plan's every
 *     one. Nothing is written for them here;
 *   - a bonus for each goal reached in a calendar month is worked out from
 *     the same lines, so a refund that takes the month back under the goal
 *     takes the bonus back too.
 *
 * What stops it being gamed:
 *
 *   - nobody earns on their own purchase: a sale paid with the affiliate's own
 *     address is written down as such and earns nothing, and a browser signed
 *     in as that affiliate is not credited at all;
 *   - the creator cannot be their own affiliate;
 *   - a click counts once per visitor per day, clicks from one connection are
 *     capped per hour, and the creator's own clicks and known robots are not
 *     counted;
 *   - two affiliates paid at the same address, or signing up with the same
 *     inbox written two ways (a "+" tag, Gmail's dots), and an affiliate
 *     whose link was reached from a paid search ad where the creator does
 *     not allow those, have what they are owed held, out of every payment,
 *     until the creator looks and releases it;
 *   - a purchase paid from the affiliate's inbox written another way is
 *     their own purchase all the same;
 *   - applying needs the address to be real — the application only exists
 *     once its emailed link is opened — and is capped per hour, per
 *     connection and per address.
 *   - where the creator lets buyers join on their own, the proof is the
 *     order itself: the checkout's id, which only the thanks page and the
 *     purchase email carry, is read back from the creator's Stripe account,
 *     and the address that paid is the one that joins.
 *
 * Records, under the store's own stats id so they move with the store:
 *
 *   nl:aff:<id>:people   hash  affiliate id -> the affiliate
 *   nl:aff:<id>:emails   hash  address -> affiliate id
 *   nl:aff:<id>:codes    hash  code -> affiliate id
 *   nl:aff:<id>:clicks   hash  affiliate id -> clicks counted
 *   nl:aff:<id>:paid     hash  affiliate id -> clicks counted that came from a paid search ad
 *   nl:aff:<id>:sales    hash  Stripe reference -> the sale
 *   nl:aff:<id>:payouts  hash  payout id -> what the creator says they paid
 */
import { saleHandles } from "@/lib/store";
import { createHash, randomBytes } from "node:crypto";
import { EMAIL_PATTERN, MAX_EMAIL_LENGTH, normaliseEmail } from "@/lib/auth";
import { NIMBUS_FROM, isSenderConfigured, sendEmail } from "@/lib/email";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { onAccount } from "@/lib/stripe-account";
import { isSettled } from "@/lib/instant-pay";
import { SITE_URL } from "@/lib/site-url";
import {
  AFFILIATE_CODE_PATTERN,
  MAX_AFFILIATES,
  MAX_COMMISSION,
  MIN_COMMISSION,
  commissionOn,
  commissionRate,
  RECURRING_ALWAYS,
  readViaCookie,
} from "@/lib/affiliate-setting";
import { readListings } from "@/lib/catalog";
import { affiliateForCodes, codeOwners } from "@/lib/affiliate-codes";
import { type PartnerShare, parsePartnerShare, shareOn } from "@/lib/partner-share";
import { bondFor, rememberBuyer } from "@/lib/affiliate-bond";
import { offerPartnership } from "@/lib/partner-invites";
import type { Store } from "@/lib/store";
import { plainAmount } from "@/lib/money";
import { alertCreator } from "@/lib/phone-alerts";
import { bumpsFromMeta } from "@/lib/bundle-rules";
import { affiliatesWords } from "@/lib/buyer-words/affiliates";

/** How long the emailed link to apply or sign in keeps working. */
export const AFFILIATE_LINK_SECONDS = 24 * 60 * 60;
/** How long an affiliate stays signed in on one browser. */
export const AFFILIATE_SESSION_SECONDS = 30 * 24 * 60 * 60;
export const AFFILIATE_TOKEN_PATTERN = /^[0-9a-f]{64}$/;
export const AFFILIATE_ID_PATTERN = /^[0-9a-f]{12}$/;
export const MAX_NOTE_LENGTH = 200;
export const MAX_REFERENCE_LENGTH = 80;
/** Applications from one connection to one store, and for one inbox, per hour. */
const APPLY_IP_LIMIT = 10;
const APPLY_ADDRESS_LIMIT = 5;
/** Clicks counted from one connection to one store per hour. */
const CLICK_IP_LIMIT = 30;
const RATE_WINDOW_SECONDS = 60 * 60;
/** How many pages of a hundred refunds are read when the book is opened. */
const REFUND_PAGES = 10;

/** The cookie an affiliate's own browser is signed in with, one per store. */
export function affiliateCookieName(handle: string): string {
  return `nl_aff_${handle.replace(/[^a-z0-9._-]/g, "")}`;
}

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
const peopleKey = (id: string) => `nl:aff:${id}:people`;
const emailsKey = (id: string) => `nl:aff:${id}:emails`;
const codesKey = (id: string) => `nl:aff:${id}:codes`;
const clicksKey = (id: string) => `nl:aff:${id}:clicks`;
const paidClicksKey = (id: string) => `nl:aff:${id}:paid`;
const salesKey = (id: string) => `nl:aff:${id}:sales`;
const payoutsKey = (id: string) => `nl:aff:${id}:payouts`;
/** A partner's share of one sale, keyed "<sale reference>:<partner id>". */
const sharesKey = (id: string) => `nl:aff:${id}:shares`;
const linkKey = (token: string) => `nl:aff:link:${sha(`nimbus-aff-link:${token}`).slice(0, 40)}`;
const sessionKey = (token: string) => `nl:aff:session:${sha(`nimbus-aff-session:${token}`).slice(0, 40)}`;
const seenKey = (parts: string) => `nl:aff:seen:${sha(`nimbus-aff-seen:${parts}`).slice(0, 40)}`;
const clickIpKey = (ip: string, id: string) => `nl:rl:aff:click:${sha(`nimbus-aff-click:${ip}:${id}`).slice(0, 32)}`;
const applyIpKey = (ip: string, handle: string) => `nl:rl:aff:ip:${sha(`nimbus-aff-ip:${ip}:${handle}`).slice(0, 32)}`;
const applyAddressKey = (email: string) => `nl:rl:aff:addr:${sha(`nimbus-aff-addr:${email}`).slice(0, 32)}`;

export type AffiliateStatus = "pending" | "approved" | "declined" | "removed";

export type Affiliate = {
  id: string;
  email: string;
  /** What their link carries: ?via=<code>. */
  code: string;
  status: AffiliateStatus;
  /** When they applied, and when the creator last decided, in ms. */
  appliedAt: number;
  decidedAt: number;
  /** Where they said they would share the store, in their words. */
  note: string;
  /**
   * A share the creator set for this affiliate alone, in percent, replacing
   * the store's and each product's (lib/affiliate-setting.ts commissionRate).
   * Null: the program's own shares.
   */
  rate: number | null;
  /** The PayPal address they asked to be paid at; empty: the address they joined with. */
  paypal: string;
  /**
   * A standing share of every sale of certain products, whoever brought the
   * buyer — what Hotmart calls co-production (lib/partner-share.ts). Null for
   * an ordinary affiliate, which is almost everybody. Somebody can hold both:
   * the two add up, and the cap counts them together.
   */
  share: PartnerShare | null;
  /**
   * What the creator looked at and let through (releaseHold): the paid-search
   * clicks there were then, and the affiliates they shared an address with
   * then. Somebody new sharing it holds it again. Null for anybody never held.
   */
  cleared: { paid: number; with: string[] } | null;
};

/**
 * What tied a sale to an affiliate:
 *
 *   "click"  they followed the affiliate's link (lib/affiliate-setting.ts);
 *   "code"   they typed a discount code given to that affiliate, with no
 *            click anywhere (lib/affiliate-codes.ts);
 *   "buyer"  they had been credited to that affiliate before, and the creator
 *            asked for their buyers to stay theirs (lib/affiliate-bond.ts);
 *   "partner" nobody brought this buyer to them: they hold a standing share
 *            of the product itself (lib/partner-share.ts);
 *   "recurring" a payment of a membership or payment plan sold through their
 *            link, read from its invoice;
 *   "bonus"  a goal reached in a month, not a sale at all.
 */
export type Credit = "click" | "code" | "buyer" | "partner" | "recurring" | "bonus";

/** A sale that came through an affiliate's link. */
export type Referral = {
  /** The Checkout Session, or the one-click payment, that paid for it. */
  ref: string;
  /** The payment behind it, which is what a refund is made against. */
  pi: string;
  aff: string;
  /** When it was paid, in seconds. */
  at: number;
  product: string;
  title: string;
  /** What was paid before tax, in the currency's smallest unit: what the share is taken of. */
  base: number;
  /** What was paid in all, tax included, in the currency's smallest unit. */
  total: number;
  /**
   * What it was paid in, as Stripe says. Sales written down before stores
   * had a choice have none, and were in US dollars.
   */
  currency: string;
  /** The share it earns, in percent, as it was when the buyer paid. */
  rate: number;
  /** Paid with the affiliate's own address: written down, earns nothing. */
  self: boolean;
  /** What credited it: a click, a code, or the buyer being theirs already. */
  how: Credit;
};

/**
 * A partner's share of one sale (lib/partner-share.ts).
 *
 * Written for every sale of a product they share in, whoever brought the
 * buyer — which is the whole difference from a Referral, and why it is kept
 * apart rather than squeezed into one. One sale can produce several of these
 * and a Referral besides: the affiliate who brought the buyer, and each
 * partner who shares in the product. They all end up in the same row of the
 * same book, and are paid in the same batch.
 */
export type PartnerEarning = {
  /** The Checkout Session, or one-click payment, that paid for it. */
  ref: string;
  /** The payment behind it, which is what a refund is made against. */
  pi: string;
  /** The partner. */
  aff: string;
  /** When it was paid, in seconds. */
  at: number;
  product: string;
  title: string;
  /** What was paid before tax, in the currency's smallest unit. */
  base: number;
  /** What was paid in all, tax included. */
  total: number;
  currency: string;
  /** The share it earns, in percent, as it stood when the buyer paid. */
  percent: number;
  /** Bought by the partner themselves: written down, earns nothing. */
  self: boolean;
};

export type Payout = {
  id: string;
  aff: string;
  /** In the currency's smallest unit. */
  cents: number;
  /** The store's currency when it was written down; US dollars before there was a choice. */
  currency: string;
  /** The day the creator paid it, as they typed it: YYYY-MM-DD. */
  date: string;
  /** Their own note of it: a PayPal id, a bank reference, "cash". */
  reference: string;
  at: number;
};

/** Whether the programme is on and can keep its records. */
export function affiliatesOn(store: Store): boolean {
  return store.affiliates.enabled && Boolean(store.statsId) && isRedisConfigured();
}

/** Whether people can apply: the programme is on and its emails can be sent. */
export function canApply(store: Store): boolean {
  return affiliatesOn(store) && isSenderConfigured();
}

function parseAffiliate(raw: unknown): Affiliate | null {
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as Partial<Affiliate>;
    if (typeof value.id !== "string" || !AFFILIATE_ID_PATTERN.test(value.id)) return null;
    if (typeof value.email !== "string" || typeof value.code !== "string") return null;
    const status: AffiliateStatus =
      value.status === "approved" || value.status === "declined" || value.status === "removed" ? value.status : "pending";
    return {
      id: value.id,
      email: value.email,
      code: value.code,
      status,
      appliedAt: typeof value.appliedAt === "number" ? value.appliedAt : 0,
      decidedAt: typeof value.decidedAt === "number" ? value.decidedAt : 0,
      note: typeof value.note === "string" ? value.note : "",
      rate:
        typeof value.rate === "number" && Number.isInteger(value.rate) && value.rate >= MIN_COMMISSION && value.rate <= MAX_COMMISSION
          ? value.rate
          : null,
      paypal: typeof value.paypal === "string" && EMAIL_PATTERN.test(value.paypal) ? value.paypal : "",
      share: parsePartnerShare(value.share),
      cleared:
        value.cleared && typeof value.cleared === "object"
          ? {
              paid: Math.max(0, Number((value.cleared as { paid?: unknown }).paid) || 0),
              with: (Array.isArray((value.cleared as { with?: unknown }).with) ? ((value.cleared as { with: unknown[] }).with) : [])
                .filter((id): id is string => typeof id === "string" && AFFILIATE_ID_PATTERN.test(id))
                .slice(0, 50),
            }
          : null,
    };
  } catch {
    return null;
  }
}

/** Where an affiliate is paid through PayPal: the address they asked for, or the one they joined with. */
export function payAddress(affiliate: Pick<Affiliate, "email" | "paypal">): string {
  return affiliate.paypal || affiliate.email;
}

/** Sets, or clears with null, the share one affiliate earns. */
export async function setAffiliateRate(store: Store, id: string, rate: number | null): Promise<Affiliate | null> {
  const affiliate = await readAffiliate(store, id);
  if (!affiliate) return null;
  if (rate !== null && (!Number.isInteger(rate) || rate < MIN_COMMISSION || rate > MAX_COMMISSION)) return null;
  const next: Affiliate = { ...affiliate, rate };
  await writeAffiliate(store, next);
  return next;
}

/**
 * Sets, or clears with null, a partner's standing share of certain products.
 *
 * Whether the share is allowed at all — the cap over everything promised on
 * one product, affiliate commission included — is decided by the caller with
 * lib/partner-share.ts shareProblem, which needs the other partners and the
 * programme's own rates. This only writes what it is given.
 *
 * Shares already earned are untouched by a change here: each one was written
 * down with the percentage it was made at, exactly as a commission is.
 */
export async function setPartnerShare(store: Store, id: string, share: PartnerShare | null): Promise<Affiliate | null> {
  const affiliate = await readAffiliate(store, id);
  if (!affiliate) return null;
  const next: Affiliate = { ...affiliate, share };
  await writeAffiliate(store, next);
  return next;
}

/** Everybody in this programme who holds a standing share of something. */
export async function listPartners(store: Store): Promise<Affiliate[]> {
  return (await listAffiliates(store)).filter((a) => a.share !== null);
}

/**
 * The affiliate choosing the PayPal address they are paid at, from their own
 * signed-in page. Where money goes is the one thing on that page worth taking
 * over, so the address they joined with is told every time it changes.
 */
export async function setPayAddress(store: Store, affiliate: Affiliate, raw: string): Promise<{ ok: true } | { ok: false; reason: "email" }> {
  const typed = raw.trim().slice(0, MAX_EMAIL_LENGTH);
  const paypal = typed ? normaliseEmail(typed) : "";
  if (paypal && !EMAIL_PATTERN.test(paypal)) return { ok: false, reason: "email" };
  const value = paypal === normaliseEmail(affiliate.email) ? "" : paypal;
  if (value === affiliate.paypal) return { ok: true };
  await writeAffiliate(store, { ...affiliate, paypal: value });
  if (isSenderConfigured()) {
    const a = affiliatesWords(store.language);
    await sendEmail({
      from: `"${displayName(store.name)} via Marktmorgen" <${senderAddress()}>`,
      to: affiliate.email,
      subject: a.payChangedSubject(store.name),
      text: [
        a.payChangedLine(store.name, value || affiliate.email),
        "",
        a.payChangedIfNot,
        `${SITE_URL}/@${store.handle}/affiliates`,
      ].join("\n"),
      replyTo: store.email,
    }).catch((error) => console.error("telling an affiliate their pay address changed failed", error));
  }
  return { ok: true };
}

function parseReferral(raw: unknown): Referral | null {
  if (typeof raw !== "string") return null;
  try {
    // `byCode` is not on Referral any more: it is the older spelling of
    // `how`, still read so a sale written down then keeps its credit.
    const value = JSON.parse(raw) as Partial<Referral> & { byCode?: unknown };
    if (typeof value.ref !== "string" || typeof value.aff !== "string") return null;
    const n = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : 0);
    return {
      ref: value.ref,
      pi: typeof value.pi === "string" ? value.pi : "",
      aff: value.aff,
      at: n(value.at),
      product: typeof value.product === "string" ? value.product : "",
      title: typeof value.title === "string" ? value.title : "",
      base: n(value.base),
      total: n(value.total),
      currency: readCurrencyCode(value.currency),
      rate: n(value.rate),
      self: value.self === true,
      // Sales written down before a code or a bond could credit anybody have
      // neither field, and every one of those came from a click. `byCode` is
      // read for the ones written in between.
      how:
        value.how === "code" || value.how === "buyer" || value.how === "partner"
          ? value.how
          : value.byCode === true
            ? "code"
            : "click",
    };
  } catch {
    return null;
  }
}

function parsePartnerEarning(raw: unknown): PartnerEarning | null {
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as Partial<PartnerEarning>;
    if (typeof value.ref !== "string" || typeof value.aff !== "string") return null;
    const n = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : 0);
    return {
      ref: value.ref,
      pi: typeof value.pi === "string" ? value.pi : "",
      aff: value.aff,
      at: n(value.at),
      product: typeof value.product === "string" ? value.product : "",
      title: typeof value.title === "string" ? value.title : "",
      base: n(value.base),
      total: n(value.total),
      currency: readCurrencyCode(value.currency),
      percent: n(value.percent),
      self: value.self === true,
    };
  } catch {
    return null;
  }
}

function parsePayout(raw: unknown): Payout | null {
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as Partial<Payout>;
    if (typeof value.id !== "string" || typeof value.aff !== "string" || typeof value.cents !== "number") return null;
    return {
      id: value.id,
      aff: value.aff,
      cents: value.cents,
      currency: readCurrencyCode(value.currency),
      date: typeof value.date === "string" ? value.date : "",
      reference: typeof value.reference === "string" ? value.reference : "",
      at: typeof value.at === "number" ? value.at : 0,
    };
  } catch {
    return null;
  }
}

/** A three-letter currency code as Stripe writes it; US dollars when absent. */
function readCurrencyCode(raw: unknown): string {
  return typeof raw === "string" && /^[a-z]{3}$/.test(raw) ? raw : "usd";
}

/** A Redis hash reply, as pairs. */
function pairs(reply: unknown): [string, string][] {
  const list = Array.isArray(reply) ? reply.map(String) : [];
  const out: [string, string][] = [];
  for (let i = 0; i + 1 < list.length; i += 2) out.push([list[i], list[i + 1]]);
  return out;
}

export async function listAffiliates(store: Store): Promise<Affiliate[]> {
  if (!store.statsId || !isRedisConfigured()) return [];
  const [reply] = await redisPipeline([["HGETALL", peopleKey(store.statsId)]]);
  return pairs(reply)
    .map(([, raw]) => parseAffiliate(raw))
    .filter((a): a is Affiliate => a !== null)
    .sort((a, b) => b.appliedAt - a.appliedAt);
}

export async function readAffiliate(store: Store, id: string): Promise<Affiliate | null> {
  if (!store.statsId || !isRedisConfigured() || !AFFILIATE_ID_PATTERN.test(id)) return null;
  const [raw] = await redisPipeline([["HGET", peopleKey(store.statsId), id]]);
  return parseAffiliate(raw);
}

async function writeAffiliate(store: Store, affiliate: Affiliate): Promise<void> {
  await redisPipeline([["HSET", peopleKey(store.statsId as string), affiliate.id, JSON.stringify(affiliate)]]);
}

async function within(key: string, limit: number): Promise<boolean> {
  const [, count] = await redisPipeline([
    ["SET", key, "0", "EX", RATE_WINDOW_SECONDS, "NX"],
    ["INCR", key],
  ]);
  return Number(count) <= limit;
}

/** A name that can sit inside the quotes of an email's From line. */
function displayName(name: string): string {
  return name.replace(/["\\<>\r\n]/g, "").trim().slice(0, 60) || "A store";
}

/** The address part of NIMBUS_FROM, whatever form it was written in. */
function senderAddress(): string {
  const match = NIMBUS_FROM.match(/<([^>]+)>/);
  return (match ? match[1] : NIMBUS_FROM).trim();
}


/** The address an affiliate shares: the store's own domain when it has one live. */
export function affiliateLink(store: Store, code: string): string {
  const base = store.domain?.liveAt ? `https://${store.domain.name}` : `${SITE_URL}/@${store.handle}`;
  return `${base}${store.domain?.liveAt ? "/" : ""}?via=${code}`;
}

// ---- Applying and signing in ---------------------------------------------

export type ApplyRequest = "sent" | "email" | "limited" | "unavailable" | "owner" | "error";

/**
 * What an emailed link stands for.
 *
 * `s` the store, `e` the address it was sent to, `n` what they wrote about
 * where they would share it. And for a partner the creator invited rather than
 * somebody who applied: `k` marks it an invitation, so opening it makes a
 * record that is already approved, and `p` is the share that comes with it.
 *
 * A partner is not an applicant. Hotmart has the producer send the invitation,
 * and that is the right way round: somebody who helped make the product should
 * not have to apply to an affiliate programme to be paid for it.
 */
type LinkGrant = { s: string; e: string; n: string; k?: 1; p?: PartnerShare };

/**
 * Emails a link to the address typed. Opening it is what makes the
 * application — so every applicant has proved the address is theirs — and it
 * is also how a returning affiliate signs in to see their numbers.
 */
export async function requestAffiliateLink(input: {
  store: Store;
  email: string;
  note: string;
  ip: string;
  origin: string;
}): Promise<ApplyRequest> {
  const { store, ip, origin } = input;
  const raw = input.email.trim();
  if (!raw || raw.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(raw)) return "email";
  const email = normaliseEmail(raw);
  if (!canApply(store)) return "unavailable";
  if (email === normaliseEmail(store.email)) return "owner";
  if (!(await within(applyIpKey(ip, store.handle), APPLY_IP_LIMIT))) return "limited";
  if (!(await within(applyAddressKey(email), APPLY_ADDRESS_LIMIT))) return "limited";

  const [known] = await redisPipeline([["HGET", emailsKey(store.statsId as string), email]]);
  const token = randomBytes(32).toString("hex");
  const note = input.note.replace(/\s+/g, " ").trim().slice(0, MAX_NOTE_LENGTH);
  const grant: LinkGrant = { s: store.statsId as string, e: email, n: note };
  await redisPipeline([["SET", linkKey(token), JSON.stringify(grant), "EX", AFFILIATE_LINK_SECONDS]]);

  const name = store.name;
  const a = affiliatesWords(store.language);
  const link = `${origin}/@${store.handle}/affiliates?token=${token}`;
  const sent = await sendEmail({
    from: `"${displayName(name)} via Marktmorgen" <${senderAddress()}>`,
    to: email,
    subject: typeof known === "string" ? a.yourPageFor(name) : a.linkSubjectNew(name),
    text: [
      typeof known === "string" ? a.linkIntroKnown(name) : a.linkIntroNew(name),
      "",
      link,
      "",
      typeof known === "string" ? a.linkShowsKnown : a.linkAboutNew(name, store.affiliates.days),
      "",
      a.paidByStore(name),
      "",
      a.linkExpires,
    ].join("\n"),
  });
  return sent ? "sent" : "error";
}

export type InviteResult = "sent" | "waiting" | "email" | "owner" | "unavailable" | "full" | "error";

/**
 * Invites somebody to be a partner on certain products, at a share.
 *
 * Nothing is written down until they open the link, so an address typed wrong
 * leaves no half-made partner behind. Opening it makes a record that is
 * already approved, with the share attached — they agreed to it by opening an
 * email that states it, which is the whole point of sending the terms in the
 * message rather than afterwards.
 *
 * Whether the share is allowed — the cap over everything promised on a
 * product — is the caller's to check with lib/partner-share.ts, the same as
 * setting one on somebody already in the programme.
 */
export async function invitePartner(input: {
  store: Store;
  email: string;
  share: PartnerShare;
  titles: Map<string, string>;
  origin: string;
  /** True when this address already has a store here, so the studio asks instead. */
  alreadyHere?: boolean;
}): Promise<InviteResult> {
  const { store, share, origin } = input;
  const raw = input.email.trim();
  if (!raw || raw.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(raw)) return "email";
  if (!affiliatesOn(store) || !isSenderConfigured()) return "unavailable";
  const email = normaliseEmail(raw);
  if (email === normaliseEmail(store.email)) return "owner";

  const statsId = store.statsId as string;
  const [known] = await redisPipeline([["HGET", emailsKey(statsId), email]]);
  if (typeof known !== "string") {
    const [count] = await redisPipeline([["HLEN", peopleKey(statsId)]]);
    if (Number(count) >= MAX_AFFILIATES) return "full";
  }

  const named = share.products.map((id) => input.titles.get(id) ?? "a product").slice(0, 12);
  // The same list in the email, in the store's language; the studio's copy stays English.
  const a = affiliatesWords(store.language);
  const listed = share.products.map((id) => input.titles.get(id) ?? a.someProduct).slice(0, 12);

  // Somebody who already has a store here has a better place to be asked than
  // an inbox: their own studio (lib/partner-invites.ts). The offer waits there
  // with the terms written out. This moves the agreement, it does not skip it —
  // nothing is written into this programme until they accept.
  if (input.alreadyHere) {
    const left = await offerPartnership(email, {
      sid: store.sid,
      storeName: store.name,
      handle: store.handle,
      share,
      titles: named,
    });
    if (!left.ok) return left.reason === "full" ? "full" : "error";
    await sendEmail({
      from: `"${displayName(store.name)} via Marktmorgen" <${senderAddress()}>`,
      to: email,
      subject: a.partnerSubject(store.name),
      text: [
        a.partnerOffer(store.name, share.percent),
        "",
        ...listed.map((title) => `  • ${title}`),
        "",
        a.partnerInStudio,
        "",
        `${SITE_URL}/studio/affiliates`,
        "",
        a.partnerAnswer,
      ].join("\n"),
      replyTo: store.email,
    }).catch((error) => console.error("telling a creator about a partnership offer failed", error));
    return "waiting";
  }

  const token = randomBytes(32).toString("hex");
  const grant: LinkGrant = { s: statsId, e: email, n: "Invited as a partner", k: 1, p: share };
  await redisPipeline([["SET", linkKey(token), JSON.stringify(grant), "EX", AFFILIATE_LINK_SECONDS]]);
  const sent = await sendEmail({
    from: `"${displayName(store.name)} via Marktmorgen" <${senderAddress()}>`,
    to: email,
    subject: a.partnerSubject(store.name),
    text: [
      a.partnerOffer(store.name, share.percent),
      "",
      ...listed.map((title) => `  • ${title}`),
      "",
      a.partnerTerms(share.percent),
      "",
      a.partnerOpen,
      "",
      `${origin}/@${store.handle}/affiliates?token=${token}`,
      "",
      a.partnerPays(store.name),
      "",
      a.partnerExpires,
    ].join("\n"),
    replyTo: store.email,
  });
  return sent ? "sent" : "error";
}

/**
 * Writes in a partner who has just accepted, from their own studio.
 *
 * The only path that makes a partner without an emailed link, and it is not a
 * shortcut: the person pressed the button, on a page showing the share and the
 * products. That is a better record of agreement than a link opened in a mail
 * app, not a worse one. It goes through the same grant the email would have
 * carried, so the record is made exactly as it is made everywhere else.
 */
export async function acceptPartnership(store: Store, email: string, share: PartnerShare): Promise<OpenResult> {
  if (!affiliatesOn(store)) return { ok: false, reason: "unavailable" };
  const token = randomBytes(32).toString("hex");
  const grant: LinkGrant = { s: store.statsId as string, e: normaliseEmail(email), n: "Accepted a partnership", k: 1, p: share };
  await redisPipeline([["SET", linkKey(token), JSON.stringify(grant), "EX", 600]]);
  return openAffiliateLink(store, token);
}

function parseGrant(raw: unknown): LinkGrant | null {
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as Partial<LinkGrant>;
    if (typeof value.s !== "string" || typeof value.e !== "string") return null;
    const share = parsePartnerShare(value.p);
    return {
      s: value.s,
      e: value.e,
      n: typeof value.n === "string" ? value.n : "",
      ...(value.k === 1 ? { k: 1 as const } : {}),
      ...(share ? { p: share } : {}),
    };
  } catch {
    return null;
  }
}

/** The address an emailed link is for, while it still works. For the page. */
export async function linkEmail(store: Store, token: string): Promise<string | null> {
  if (!AFFILIATE_TOKEN_PATTERN.test(token) || !isRedisConfigured()) return null;
  const [raw] = await redisPipeline([["GET", linkKey(token)]]);
  const grant = parseGrant(raw);
  return grant && grant.s === store.statsId ? grant.e : null;
}

/** A readable code for a new affiliate, from their address, not yet taken here. */
async function claimCode(store: Store, email: string, id: string): Promise<string> {
  const stem = (email.split("@")[0] ?? "").replace(/[^a-z0-9]/g, "").slice(0, 14);
  const first = stem.length >= 3 ? stem : `${stem}aff`.slice(0, 14);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = attempt === 0 ? first : `${first}${Math.floor(10 + Math.random() * (attempt < 4 ? 90 : 9990))}`;
    if (!AFFILIATE_CODE_PATTERN.test(code)) continue;
    const [won] = await redisPipeline([["HSETNX", codesKey(store.statsId as string), code, id]]);
    if (Number(won) === 1) return code;
  }
  const code = randomBytes(5).toString("hex");
  await redisPipeline([["HSETNX", codesKey(store.statsId as string), code, id]]);
  return code;
}

export type OpenResult =
  | { ok: true; session: string; affiliate: Affiliate; created: boolean }
  | { ok: false; reason: "expired" | "full" | "unavailable" };

/**
 * The button on the page an emailed link opens. The first time for an
 * address, it makes the application; every time, it signs this browser in.
 */
export async function openAffiliateLink(store: Store, token: string): Promise<OpenResult> {
  if (!affiliatesOn(store)) return { ok: false, reason: "unavailable" };
  if (!AFFILIATE_TOKEN_PATTERN.test(token)) return { ok: false, reason: "expired" };
  const statsId = store.statsId as string;
  const [raw] = await redisPipeline([["GET", linkKey(token)]]);
  const grant = parseGrant(raw);
  if (!grant || grant.s !== statsId) return { ok: false, reason: "expired" };

  let affiliate: Affiliate | null = null;
  let created = false;
  const [knownId] = await redisPipeline([["HGET", emailsKey(statsId), grant.e]]);
  if (typeof knownId === "string") affiliate = await readAffiliate(store, knownId);
  // An invitation the creator sent (grant.k) arrives already decided: opening
  // it approves them and attaches the share the email stated. Somebody the
  // creator had declined or removed is let back in by it, because inviting
  // them is the creator changing their mind, in their own words.
  if (affiliate && grant.k === 1) {
    affiliate = { ...affiliate, status: "approved", decidedAt: Date.now(), share: grant.p ?? affiliate.share };
    await writeAffiliate(store, affiliate);
  }
  if (!affiliate) {
    const [count] = await redisPipeline([["HLEN", peopleKey(statsId)]]);
    if (Number(count) >= MAX_AFFILIATES) return { ok: false, reason: "full" };
    const id = randomBytes(6).toString("hex");
    // One application per address, however many links are opened at once.
    const [won] = await redisPipeline([["HSETNX", emailsKey(statsId), grant.e, id]]);
    if (Number(won) !== 1) {
      const [other] = await redisPipeline([["HGET", emailsKey(statsId), grant.e]]);
      affiliate = typeof other === "string" ? await readAffiliate(store, other) : null;
      if (!affiliate) return { ok: false, reason: "expired" };
    } else {
      const code = await claimCode(store, grant.e, id);
      const now = Date.now();
      const invited = grant.k === 1;
      affiliate = {
        id,
        email: grant.e,
        code,
        status: invited ? "approved" : "pending",
        appliedAt: now,
        decidedAt: invited ? now : 0,
        note: grant.n,
        rate: null,
        paypal: "",
        share: invited ? grant.p ?? null : null,
        cleared: null,
      };
      await writeAffiliate(store, affiliate);
      created = true;
    }
  }

  const session = randomBytes(32).toString("hex");
  await redisPipeline([
    ["SET", sessionKey(session), JSON.stringify({ s: statsId, a: affiliate.id }), "EX", AFFILIATE_SESSION_SECONDS],
    // Spent: an emailed link signs in once.
    ["DEL", linkKey(token)],
  ]);

  if (created && isSenderConfigured() && grant.k !== 1) {
    await sendEmail({
      from: `Marktmorgen <${senderAddress()}>`,
      to: store.email,
      subject: `New affiliate application: ${affiliate.email}`,
      text: [
        `${affiliate.email} applied to be an affiliate of ${store.name}.`,
        ...(affiliate.note ? [`Where they will share it: ${affiliate.note}`] : []),
        "",
        `Approve or decline them in your studio: ${SITE_URL}/studio/affiliates${store.sid ? `?store=${store.sid}` : ""}`,
        "",
        "Nothing changes until you decide. Commissions are paid by you, directly, never by Marktmorgen.",
      ].join("\n"),
    }).catch((error) => console.error("telling a creator about an application failed", error));
  }
  // And their phone, when a device of theirs asked for applications
  // (lib/phone-alerts.ts): no address on a lock screen, only that one came.
  if (created) {
    await alertCreator(
      store,
      "affiliate",
      grant.k === 1
        ? { title: "Your partner accepted", body: `Somebody you invited as a partner on ${store.name} opened their link.`, url: store.sid ? `/studio/affiliates?store=${store.sid}` : "/studio/affiliates" }
        : { title: "New affiliate application", body: `Someone applied to promote ${store.name}. Approve or decline them in your studio.`, url: store.sid ? `/studio/affiliates?store=${store.sid}` : "/studio/affiliates" },
      { seed: affiliate.id },
    ).catch((error) => console.error("an application notification failed", error));
  }
  return { ok: true, session, affiliate, created };
}

/** Whether buyers may join this store's programme on their own (lib/affiliate-setting.ts). */
export function buyersJoin(store: Store): boolean {
  return affiliatesOn(store) && store.affiliates.buyers;
}

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

/**
 * The address that paid for a checkout of this store, read from the creator's
 * own Stripe account, or null. The checkout's id is what the thanks page and
 * the purchase email already carry as the buyer's proof of the order, so it
 * proves the same thing here: this is the person who paid.
 */
export async function buyerOfOrder(store: Store, sessionId: string): Promise<string | null> {
  if (!SESSION_ID.test(sessionId) || !store.stripeAccountId) return null;
  let session: Record<string, unknown>;
  try {
    session = await onAccount("GET", store.stripeAccountId, `/checkout/sessions/${encodeURIComponent(sessionId)}`);
  } catch {
    return null;
  }
  const meta = (session.metadata ?? {}) as Record<string, string>;
  if (!saleHandles(store).has(meta.store ?? "")) return null;
  if (!isSettled(session)) return null;
  const details = session.customer_details as { email?: unknown } | null | undefined;
  const email = typeof details?.email === "string" ? details.email : typeof session.customer_email === "string" ? session.customer_email : "";
  return email && EMAIL_PATTERN.test(email) ? normaliseEmail(email) : null;
}

export type JoinResult =
  | { ok: true; session: string; affiliate: Affiliate; created: boolean }
  | { ok: false; reason: "unavailable" | "order" | "owner" | "declined" | "full" };

/**
 * A buyer taking their own link, where the creator lets buyers join: made
 * and approved at once, or — for a buyer who had applied and was waiting —
 * approved now. Somebody the creator declined or removed is not let back in
 * this way: that decision was theirs.
 */
export async function joinAsBuyer(store: Store, sessionId: string): Promise<JoinResult> {
  if (!buyersJoin(store)) return { ok: false, reason: "unavailable" };
  const email = await buyerOfOrder(store, sessionId);
  if (!email) return { ok: false, reason: "order" };
  if (email === normaliseEmail(store.email)) return { ok: false, reason: "owner" };
  const statsId = store.statsId as string;

  let affiliate: Affiliate | null = null;
  let created = false;
  const [knownId] = await redisPipeline([["HGET", emailsKey(statsId), email]]);
  if (typeof knownId === "string") affiliate = await readAffiliate(store, knownId);
  if (affiliate) {
    if (affiliate.status === "declined" || affiliate.status === "removed") return { ok: false, reason: "declined" };
    if (affiliate.status === "pending") {
      affiliate = { ...affiliate, status: "approved", decidedAt: Date.now() };
      await writeAffiliate(store, affiliate);
    }
  } else {
    const [count] = await redisPipeline([["HLEN", peopleKey(statsId)]]);
    if (Number(count) >= MAX_AFFILIATES) return { ok: false, reason: "full" };
    const id = randomBytes(6).toString("hex");
    const [won] = await redisPipeline([["HSETNX", emailsKey(statsId), email, id]]);
    if (Number(won) !== 1) {
      // The same buyer pressing twice at once: the other press made them.
      const [other] = await redisPipeline([["HGET", emailsKey(statsId), email]]);
      affiliate = typeof other === "string" ? await readAffiliate(store, other) : null;
      if (!affiliate) return { ok: false, reason: "order" };
    } else {
      const code = await claimCode(store, email, id);
      const now = Date.now();
      affiliate = { id, email, code, status: "approved", appliedAt: now, decidedAt: now, note: "Joined after buying", rate: null, paypal: "", share: null, cleared: null };
      await writeAffiliate(store, affiliate);
      created = true;
    }
  }

  const session = randomBytes(32).toString("hex");
  await redisPipeline([["SET", sessionKey(session), JSON.stringify({ s: statsId, a: affiliate.id }), "EX", AFFILIATE_SESSION_SECONDS]]);
  if (created) {
    await alertCreator(
      store,
      "affiliate",
      { title: "A buyer became an affiliate", body: `Someone who bought from ${store.name} took their own link to share it.`, url: store.sid ? `/studio/affiliates?store=${store.sid}` : "/studio/affiliates" },
      { seed: affiliate.id },
    ).catch((error) => console.error("a new-affiliate notification failed", error));
  }
  return { ok: true, session, affiliate, created };
}

/** The affiliate a browser is signed in as, on this store, or null. */
export async function affiliateForSession(store: Store, session: string | undefined): Promise<Affiliate | null> {
  if (!session || !AFFILIATE_TOKEN_PATTERN.test(session) || !store.statsId || !isRedisConfigured()) return null;
  const [raw] = await redisPipeline([["GET", sessionKey(session)]]);
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as { s?: unknown; a?: unknown };
    if (value.s !== store.statsId || typeof value.a !== "string") return null;
    return await readAffiliate(store, value.a);
  } catch {
    return null;
  }
}

export async function endAffiliateSession(session: string | undefined): Promise<void> {
  if (!session || !AFFILIATE_TOKEN_PATTERN.test(session) || !isRedisConfigured()) return;
  await redisPipeline([["DEL", sessionKey(session)]]);
}

// ---- The creator's decisions ---------------------------------------------

export type Decision = "approve" | "decline" | "remove" | "restore";

/** Lets someone in, turns them down, or takes them out. Their history stays. */
export async function decide(store: Store, id: string, decision: Decision): Promise<Affiliate | null> {
  const affiliate = await readAffiliate(store, id);
  if (!affiliate) return null;
  const status: AffiliateStatus =
    decision === "approve" || decision === "restore" ? "approved" : decision === "decline" ? "declined" : "removed";
  const next: Affiliate = { ...affiliate, status, decidedAt: Date.now() };
  await writeAffiliate(store, next);
  if (decision === "approve" && affiliate.status === "pending" && isSenderConfigured()) {
    const a = affiliatesWords(store.language);
    await sendEmail({
      from: `"${displayName(store.name)} via Marktmorgen" <${senderAddress()}>`,
      to: affiliate.email,
      subject: a.approvedSubject(store.name),
      text: [
        a.approvedIntro(store.name),
        "",
        affiliateLink(store, affiliate.code),
        "",
        a.approvedTerms(
          store.affiliates.days,
          affiliate.rate ?? store.affiliates.percent,
          affiliate.rate === null && Object.keys(store.affiliates.rates).length > 0,
        ),
        "",
        a.termDisclose,
        "",
        a.approvedPage(`${SITE_URL}/@${store.handle}/affiliates`),
        "",
        a.paidByStore(store.name),
      ].join("\n"),
    }).catch((error) => console.error("telling an affiliate they were approved failed", error));
  }
  return next;
}

export async function addPayout(
  store: Store,
  input: { aff: string; cents: number; currency: string; date: string; reference: string },
): Promise<Payout | null> {
  if (!(await readAffiliate(store, input.aff))) return null;
  const payout: Payout = {
    id: randomBytes(6).toString("hex"),
    aff: input.aff,
    cents: input.cents,
    currency: input.currency,
    date: input.date,
    reference: input.reference.replace(/\s+/g, " ").trim().slice(0, MAX_REFERENCE_LENGTH),
    at: Date.now(),
  };
  await redisPipeline([["HSET", payoutsKey(store.statsId as string), payout.id, JSON.stringify(payout)]]);
  return payout;
}

export async function removePayout(store: Store, id: string): Promise<boolean> {
  if (!store.statsId || !/^[0-9a-f]{12}$/.test(id)) return false;
  const [removed] = await redisPipeline([["HDEL", payoutsKey(store.statsId), id]]);
  return Number(removed) === 1;
}

// ---- Clicks and the checkout ---------------------------------------------

/** The approved affiliate behind a code, or null. */
async function approvedByCode(store: Store, code: string): Promise<Affiliate | null> {
  if (!affiliatesOn(store) || !AFFILIATE_CODE_PATTERN.test(code)) return null;
  const [id] = await redisPipeline([["HGET", codesKey(store.statsId as string), code]]);
  if (typeof id !== "string") return null;
  const affiliate = await readAffiliate(store, id);
  return affiliate?.status === "approved" ? affiliate : null;
}

/**
 * Counts a click on an affiliate's link: once per visitor per day, a limited
 * number per connection per hour, and not from the affiliate's own browser.
 * The caller has already left out the creator and known robots.
 */
export async function recordClick(
  store: Store,
  code: string,
  visitor: { ip: string; userAgent: string; session: string | undefined; paid?: boolean },
): Promise<boolean> {
  const affiliate = await approvedByCode(store, code);
  if (!affiliate) return false;
  const own = await affiliateForSession(store, visitor.session);
  if (own?.id === affiliate.id) return false;
  const statsId = store.statsId as string;
  if (!(await within(clickIpKey(visitor.ip, statsId), CLICK_IP_LIMIT))) return false;
  const day = Math.floor(Date.now() / 86_400_000);
  const [fresh] = await redisPipeline([
    ["SET", seenKey(`${statsId}|${affiliate.id}|${visitor.ip}|${visitor.userAgent}|${day}`), "1", "NX", "EX", 2 * 86_400],
  ]);
  if (fresh === null) return false;
  await redisPipeline([
    ["HINCRBY", clicksKey(statsId), affiliate.id, 1],
    // Reached from a paid search ad (lib/affiliate-setting.ts paidSearch): counted apart, so it can be held.
    ...(visitor.paid ? [["HINCRBY", paidClicksKey(statsId), affiliate.id, 1]] : []),
  ]);
  return true;
}

/**
 * Who a checkout is credited to, read from the click cookie: an approved
 * affiliate, within the store's window — and never the browser of that
 * affiliate themselves.
 *
 * Which click is read is the store's own rule (lib/affiliate-setting.ts):
 * the latest link followed, or the first one the visitor ever followed. The
 * window is counted from whichever click that is, so a store on first click
 * gives its affiliates a window that starts when the buyer was found, not one
 * that restarts every time they come back.
 *
 * `rate` is this product's own share, and it may be 0. That is deliberate.
 * An order can hold more than this product: a bump rides in the same charge
 * and earns its own product's share. So whether the order earns anything at
 * all is not knowable here, only where the order is finally assembled, and
 * the guard belongs there — in lib/store-checkout.ts for a checkout, in
 * lib/calls.ts for a booking. Deciding it here voided the bump's commission
 * whenever the main product happened to be set to 0%, which is exactly the
 * case a creator uses to pay on the add-on and not on the front offer.
 */
export async function attributionFor(
  store: Store,
  productId: string,
  cookies: { via: string | undefined; session: string | undefined },
): Promise<{ aff: string; rate: number; own: number | null } | null> {
  if (!affiliatesOn(store)) return null;
  const via = readViaCookie(cookies.via);
  if (!via) return null;
  const click = store.affiliates.rule === "first" ? via.first : via.last;
  const now = Math.floor(Date.now() / 1000);
  if (click.at > now + 60 || now - click.at > store.affiliates.days * 86_400) return null;
  let affiliate = await approvedByCode(store, click.code);
  // On first click, somebody the creator has since declined or removed leaves
  // the sale to the affiliate who actually brought the buyer back, rather than
  // taking it away from everyone.
  if (!affiliate && store.affiliates.rule === "first" && via.last.code !== click.code) {
    const back = via.last;
    if (back.at <= now + 60 && now - back.at <= store.affiliates.days * 86_400) {
      affiliate = await approvedByCode(store, back.code);
    }
  }
  if (!affiliate) return null;
  const own = await affiliateForSession(store, cookies.session);
  if (own?.id === affiliate.id) return null;
  return { aff: affiliate.id, rate: commissionRate(store.affiliates, productId, affiliate.rate), own: affiliate.rate };
}

/** The share an offer after paying earns the affiliate the order came through. */
export async function funnelRate(store: Store, affId: string, productId: string): Promise<number> {
  if (!affiliatesOn(store)) return 0;
  const affiliate = await readAffiliate(store, affId);
  if (affiliate?.status !== "approved") return 0;
  return commissionRate(store.affiliates, productId, affiliate.rate);
}

async function writeReferral(store: Store, referral: Referral): Promise<void> {
  if (!store.statsId || !isRedisConfigured()) return;
  // Once per sale, whichever of the thanks page and the five-minute job is first.
  await redisPipeline([["HSETNX", salesKey(store.statsId), referral.ref, JSON.stringify(referral)]]);
}

/**
 * Writes down every partner's share of one sale.
 *
 * Called for every settled sale of the store, not only the ones an affiliate
 * brought — a partner shares in the product, so the buyer's route to it is
 * beside the point. Each line is written once per sale per partner, so the
 * thanks page and the five-minute sweep can both call this and the second one
 * changes nothing.
 *
 * A sale of a product nobody shares in writes nothing and costs one read of
 * the programme's people, which is why the caller passes `partners` in when it
 * is looking at a page of sales at a time.
 */
export async function notePartners(
  store: Store,
  sale: { ref: string; pi: string; at: number; product: string; title: string; base: number; total: number; currency: string; buyer: string },
  partners?: Affiliate[],
): Promise<void> {
  if (!store.statsId || !isRedisConfigured() || !sale.ref || !sale.product) return;
  const holders = (partners ?? (await listAffiliates(store))).filter(
    (a) => a.status === "approved" && shareOn(a.share, sale.product) > 0,
  );
  if (!holders.length) return;
  const buyer = sale.buyer ? normaliseEmail(sale.buyer) : "";
  const commands: (string | number)[][] = [];
  for (const partner of holders) {
    const earning: PartnerEarning = {
      ref: sale.ref,
      pi: sale.pi,
      aff: partner.id,
      at: sale.at,
      product: sale.product,
      title: sale.title.slice(0, 200),
      base: sale.base,
      total: sale.total,
      currency: readCurrencyCode(sale.currency),
      percent: shareOn(partner.share, sale.product),
      // A 50% partner buying their own product at 50% off is not a sale.
      self: Boolean(buyer) && normaliseEmail(partner.email) === buyer,
    };
    commands.push(["HSETNX", sharesKey(store.statsId), `${sale.ref}:${partner.id}`, JSON.stringify(earning)]);
  }
  await redisPipeline(commands);
}

async function isSelf(store: Store, aff: string, buyer: string): Promise<boolean> {
  if (!buyer) return false;
  const affiliate = await readAffiliate(store, aff);
  return Boolean(affiliate) && canonicalEmail(affiliate!.email) === canonicalEmail(buyer);
}

/**
 * One inbox however it is written: lower case, without a "+" tag, and for
 * Gmail without its dots, which Gmail itself ignores. Two addresses that
 * come out the same here reach the same person.
 */
export function canonicalEmail(raw: string): string {
  const email = normaliseEmail(raw);
  const at = email.lastIndexOf("@");
  if (at < 1) return email;
  let name = email.slice(0, at).split("+")[0];
  let domain = email.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") name = name.replace(/\./g, "");
  return `${name}@${domain}`;
}

type SessionLike = {
  id?: unknown;
  mode?: unknown;
  status?: unknown;
  payment_status?: unknown;
  created?: unknown;
  amount_total?: unknown;
  amount_subtotal?: unknown;
  currency?: unknown;
  total_details?: { amount_tax?: unknown } | null;
  payment_intent?: unknown;
  metadata?: Record<string, string> | null;
  customer_details?: { email?: unknown } | null;
  /** The codes typed into it, which can credit an affiliate on their own. */
  discounts?: unknown;
};

/**
 * Writes down a settled checkout that came through an affiliate's link.
 * Anything else is left alone, so it is safe to call on every checkout.
 *
 * `owners` is the store's given-away discount codes (lib/affiliate-codes.ts),
 * passed in by a caller looking at many orders so they are read once. Left
 * out, they are read here. An order with no affiliate in its metadata is
 * credited from the code typed into it, if that code was given to somebody —
 * which is how a sale made on a podcast or from a stage earns anything at all.
 */
export async function noteSession(
  store: Store,
  session: SessionLike,
  owners?: Map<string, string>,
  partners?: Affiliate[],
): Promise<void> {
  const meta = session.metadata ?? {};
  if (typeof session.id !== "string") return;
  if (session.mode !== undefined && session.mode !== "payment") return;
  if (!isSettled(session)) return;
  const handles = saleHandles(store);
  if (!handles.has(meta.store ?? "")) return;

  const total = typeof session.amount_total === "number" ? session.amount_total : 0;
  const tax = typeof session.total_details?.amount_tax === "number" ? session.total_details.amount_tax : 0;
  const pi =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent && typeof session.payment_intent === "object" && typeof (session.payment_intent as { id?: unknown }).id === "string"
        ? ((session.payment_intent as { id: string }).id)
        : "";
  const buyer = typeof session.customer_details?.email === "string" ? session.customer_details.email : "";
  const base = Math.max(0, total - tax);
  const at = typeof session.created === "number" ? session.created : Math.floor(Date.now() / 1000);
  const currency = readCurrencyCode(session.currency);

  // Partners first, and whatever happens next. A partner shares in the
  // product, so how the buyer arrived is beside the point — and this is the
  // one part that has to run for a sale no affiliate brought at all, which is
  // most of them (lib/partner-share.ts).
  await notePartners(
    store,
    { ref: session.id, pi, at, product: meta.product ?? "", title: meta.title ?? "", base, total, currency, buyer },
    partners,
  ).catch((error) => console.error("noting a partner's share failed", error));

  // Then the affiliate. The click first: a buyer who followed a link and then
  // typed a code they saw elsewhere still belongs to the affiliate whose link
  // they followed.
  let aff = meta.via ?? "";
  let own: number | null = null;
  // How the sale found its affiliate, which the creator's book and the
  // affiliate's own page both say out loud.
  let how: Credit = "click";
  if (!AFFILIATE_ID_PATTERN.test(aff)) {
    // Then the code the buyer typed, which is the only trace a sale made on a
    // podcast or from a stage leaves at all (lib/affiliate-codes.ts).
    const given = owners ?? (await codeOwners(store));
    let found = affiliateForCodes(session, given);
    how = "code";
    // And last, the buyer themselves: somebody who was credited to an
    // affiliate once and whose creator asked for them to stay credited
    // (lib/affiliate-bond.ts). No cookie, no window, any device.
    if (!found && buyer) {
      found = await bondFor(store, buyer);
      how = "buyer";
    }
    if (!found) return;
    // A code or a bond only ever credits somebody the creator approves today.
    // An affiliate they declined or removed keeps their record — it is
    // history — and earns nothing more through either.
    const who = await readAffiliate(store, found);
    if (who?.status !== "approved") return;
    aff = found;
    own = who.rate;
  }
  // Through a link, the shares were worked out and written onto the order when
  // the buyer started paying, and those are the ones that stand — the creator
  // changing a share afterwards does not reach back into a sale already made.
  // Through a code there was no such moment, because nothing knew an affiliate
  // was involved until the code was typed, so the shares are the ones the
  // programme holds now. The affiliate's page says which of the two it was.
  let rate = how === "click" ? Number(meta.via_rate) || 0 : commissionRate(store.affiliates, meta.product ?? "", own);
  // Each product ticked at checkout earns its own product's share, none when
  // the creator left that product out: the one rate kept for the sale is the
  // shares together, each weighed by its part of the whole.
  const subtotal = typeof session.amount_subtotal === "number" ? session.amount_subtotal : 0;
  if (subtotal > 0 && base > 0) {
    let blended = 0;
    let taken = 0;
    for (const { key, id } of bumpsFromMeta(meta)) {
      const cents = Number(meta[`${key}_cents`]);
      const share = how === "click" ? Number(meta[`${key}_rate`]) : commissionRate(store.affiliates, id, own);
      if (!Number.isFinite(cents) || cents <= 0 || !Number.isFinite(share)) continue;
      const part = Math.min(1 - taken, cents / subtotal);
      blended += share * part;
      taken += part;
    }
    if (taken > 0) rate = Math.round((rate * (1 - taken) + blended) * 100) / 100;
  }
  await writeReferral(store, {
    ref: session.id,
    pi,
    aff,
    at,
    product: meta.product ?? "",
    title: (meta.title ?? "").slice(0, 200),
    base,
    total,
    currency,
    rate,
    self: await isSelf(store, aff, buyer),
    how,
  });

  // And the buyer stays with them, where the creator asked for that. Written
  // after the sale, so a bond that fails costs a future commission rather than
  // one already earned (lib/affiliate-bond.ts).
  if (buyer) {
    await rememberBuyer(store, buyer, aff, store.affiliates.rule).catch((error) =>
      console.error("remembering an affiliate's buyer failed", error),
    );
  }
}

/** Writes down a paid offer after paying that follows an affiliate's sale. */
export async function noteCharge(store: Store, pi: Record<string, unknown>): Promise<void> {
  const meta = (pi.metadata ?? {}) as Record<string, string>;
  if (pi.status !== "succeeded" || typeof pi.id !== "string") return;
  const amount = typeof pi.amount === "number" ? pi.amount : 0;
  const buyer = typeof pi.receipt_email === "string" ? pi.receipt_email : "";
  const at = typeof pi.created === "number" ? pi.created : Math.floor(Date.now() / 1000);

  // A partner shares in the product whether or not an affiliate's link was
  // involved, and an offer taken after paying is a sale of a product.
  await notePartners(store, {
    ref: pi.id,
    pi: pi.id,
    at,
    product: meta.product ?? "",
    title: `${(meta.title ?? "").slice(0, 180)} (added after paying)`,
    // A one-click charge never carries tax: the whole amount is the base.
    base: amount,
    total: amount,
    currency: readCurrencyCode(pi.currency),
    buyer,
  }).catch((error) => console.error("noting a partner's share failed", error));

  const aff = meta.via ?? "";
  if (!AFFILIATE_ID_PATTERN.test(aff)) return;
  await writeReferral(store, {
    ref: pi.id,
    pi: pi.id,
    aff,
    at,
    product: meta.product ?? "",
    title: `${(meta.title ?? "").slice(0, 180)} (added after paying)`,
    // A one-click charge never carries tax: the whole amount is the base.
    base: amount,
    total: amount,
    currency: readCurrencyCode(pi.currency),
    rate: Number(meta.via_rate) || 0,
    self: await isSelf(store, aff, buyer),
    // An offer taken after paying follows the order it rides on, and that
    // order is only ever reached through a link.
    how: "click",
  });
}

// ---- The book ------------------------------------------------------------

export type LineStatus = "earned" | "partly refunded" | "refunded" | "own purchase";

export type Line = Referral & {
  /** Given back to the buyer, in cents, as Stripe says today. */
  refunded: number;
  /** What it earns now, in cents. */
  commission: number;
  status: LineStatus;
};

export type Row = {
  affiliate: Affiliate;
  clicks: number;
  /** Sales that still earn something. */
  sales: number;
  earned: number;
  paid: number;
  /** earned - paid; below zero when refunds came after a payout. */
  owed: number;
  /**
   * Of what is owed, the part still inside the creator's wait, and so not in
   * a batch yet. Never below zero. It is 0 for every store that set no wait,
   * which is what every store did before there was one.
   */
  waiting: number;
  /**
   * What can be paid today: owed less what is still waiting, floored at what
   * is owed so a payout made ahead of time is not counted twice. Below zero
   * when refunds landed after a payout, exactly as `owed` is.
   */
  payable: number;
  /**
   * Of what is owed, the part held for the creator to look at (`flags` says
   * why): left out of `payable`, and so of every payment, until they release
   * it. 0 for anybody not held.
   */
  held: number;
  /** Why it is held: a click from a paid search ad, or an address another affiliate shares. */
  flags: HoldFlag[];
  /** Clicks that came from a paid search ad. */
  paidClicks: number;
};

export type HoldFlag = "paid-search" | "same-address";

export type Book = {
  rows: Row[];
  lines: Line[];
  payouts: Payout[];
  /**
   * What the rows' totals are in: the store's currency. Sales and payouts in
   * another one — from before the store changed its currency — are listed
   * with their own currency and left out of the totals, because adding euros
   * to dollars gives a number that means nothing.
   */
  currency: string;
  /** How many sales and payouts are in another currency, and so not in the totals. */
  elsewhere: number;
  /** False when Stripe could not be asked about refunds, or not all of them. */
  refundsChecked: boolean;
  /** False when the invoices of memberships and plans could not all be read. */
  invoicesChecked: boolean;
};

/**
 * What has been refunded, by payment, on the creator's account, from the
 * oldest sale on the book on. Pending refunds count: the creator already
 * gave the money back.
 */
async function refundsSince(store: Store, since: number): Promise<{ byIntent: Map<string, number>; complete: boolean }> {
  const byIntent = new Map<string, number>();
  if (!store.stripeAccountId) return { byIntent, complete: false };
  let after = "";
  for (let page = 0; page < REFUND_PAGES; page += 1) {
    const listed = await onAccount(
      "GET",
      store.stripeAccountId,
      `/refunds?limit=100&created[gte]=${since}${after ? `&starting_after=${encodeURIComponent(after)}` : ""}`,
    );
    const rows = Array.isArray(listed.data) ? (listed.data as Record<string, unknown>[]) : [];
    for (const refund of rows) {
      if (refund.status !== "succeeded" && refund.status !== "pending") continue;
      const pi = typeof refund.payment_intent === "string" ? refund.payment_intent : "";
      const amount = typeof refund.amount === "number" ? refund.amount : 0;
      if (pi) byIntent.set(pi, (byIntent.get(pi) ?? 0) + amount);
    }
    const last = rows[rows.length - 1];
    if (listed.has_more !== true || !last || typeof last.id !== "string") return { byIntent, complete: true };
    after = last.id;
  }
  return { byIntent, complete: false };
}

/** A sale as it stands today, after any refund. */
export function settleLine(referral: Referral, refunded: number): Line {
  const back = Math.min(Math.max(0, refunded), referral.total);
  const kept = referral.total > 0 ? Math.round((referral.base * (referral.total - back)) / referral.total) : 0;
  const status: LineStatus = referral.self
    ? "own purchase"
    : back >= referral.total && referral.total > 0
      ? "refunded"
      : back > 0
        ? "partly refunded"
        : "earned";
  return { ...referral, refunded: back, commission: referral.self ? 0 : commissionOn(kept, referral.rate), status };
}

/**
 * Everything the studio shows about the programme — and, filtered to one
 * person, what an affiliate sees: their clicks, the sales through their link
 * with what each earns after refunds, and what the creator says they paid.
 */
export async function readBook(store: Store, only?: string): Promise<Book> {
  if (!store.statsId || !isRedisConfigured()) return { rows: [], lines: [], payouts: [], refundsChecked: true, invoicesChecked: true, currency: store.currency, elsewhere: 0 };
  const statsId = store.statsId;
  const [people, clicks, sales, payouts, shares, paidClicks] = await redisPipeline([
    ["HGETALL", peopleKey(statsId)],
    ["HGETALL", clicksKey(statsId)],
    ["HGETALL", salesKey(statsId)],
    ["HGETALL", payoutsKey(statsId)],
    ["HGETALL", sharesKey(statsId)],
    ["HGETALL", paidClicksKey(statsId)],
  ]);
  // Everybody, for the checks that compare one affiliate with the others.
  const everyone = pairs(people)
    .map(([, raw]) => parseAffiliate(raw))
    .filter((a): a is Affiliate => a !== null);
  const affiliates = everyone.filter((a) => !only || a.id === only);
  const clickCount = new Map(pairs(clicks).map(([id, n]) => [id, Number(n) || 0]));
  const paidCount = new Map(pairs(paidClicks).map(([id, n]) => [id, Number(n) || 0]));
  const referrals = pairs(sales)
    .map(([, raw]) => parseReferral(raw))
    .filter((r): r is Referral => r !== null && (!only || r.aff === only));
  // A partner's standing share of a sale reads as one more Referral, credited
  // "partner" (lib/partner-share.ts). Keeping the shape means the payouts, the
  // batches, the spreadsheet and the partner's own page all work unchanged,
  // and one sale can produce several of these alongside a commission.
  const partnerLines: Referral[] = pairs(shares)
    .map(([, raw]) => parsePartnerEarning(raw))
    .filter((e): e is PartnerEarning => e !== null && (!only || e.aff === only))
    .map((e) => ({
      ref: `${e.ref}:${e.aff}`,
      pi: e.pi,
      aff: e.aff,
      at: e.at,
      product: e.product,
      title: e.title,
      base: e.base,
      total: e.total,
      currency: e.currency,
      rate: e.percent,
      self: e.self,
      how: "partner" as const,
    }));
  const paid = pairs(payouts)
    .map(([, raw]) => parsePayout(raw))
    .filter((p): p is Payout => p !== null && (!only || p.aff === only))
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.at - a.at);

  // Each payment of a membership or plan sold through a link, read from its invoice.
  let invoicesChecked = true;
  let recurringLines: Referral[] = [];
  if (store.stripeAccountId && everyone.length) {
    try {
      const read = await recurringReferrals(store, everyone, Math.min(...everyone.map((a) => Math.floor(a.appliedAt / 1000))) - 86_400);
      recurringLines = read.lines.filter((r) => !only || r.aff === only);
      invoicesChecked = read.complete;
    } catch (error) {
      console.error("reading invoices for the affiliate book failed", error);
      invoicesChecked = false;
    }
  }
  const everything = [...referrals, ...partnerLines, ...recurringLines];
  let refunds = new Map<string, number>();
  let refundsChecked = true;
  if (everything.length) {
    const since = Math.min(...everything.map((r) => r.at));
    try {
      const read = await refundsSince(store, since);
      refunds = read.byIntent;
      refundsChecked = read.complete;
    } catch (error) {
      console.error("reading refunds for the affiliate book failed", error);
      refundsChecked = false;
    }
  }
  const settled = everything.map((r) => settleLine(r, r.pi ? refunds.get(r.pi) ?? 0 : 0));
  // A goal reached in a month adds its bonus, worked out from the sales as they stand after refunds.
  const lines = [...settled, ...bonusLines(store, settled)].sort((a, b) => b.at - a.at);
  const flagsOf = holdFlags(store, everyone, paidCount);

  // A sale made less than the creator's wait ago is not payable yet, so their
  // refund window can pass before the money leaves them. `hold` is 0 for a
  // store that set none, and then `until` is now and nothing is ever waiting.
  const until = Math.floor(Date.now() / 1000) - store.affiliates.hold * 86_400;
  const rows = affiliates
    .map((affiliate): Row => {
      const own = lines.filter((l) => l.aff === affiliate.id && l.currency === store.currency);
      const earned = own.reduce((sum, l) => sum + l.commission, 0);
      const out = paid.filter((p) => p.aff === affiliate.id && p.currency === store.currency).reduce((sum, p) => sum + p.cents, 0);
      const waiting = own.filter((l) => l.at > until).reduce((sum, l) => sum + l.commission, 0);
      const owed = earned - out;
      const flags = flagsOf.get(affiliate.id) ?? [];
      const payable = owed <= 0 ? owed : Math.max(0, Math.min(owed, earned - waiting - out));
      return {
        affiliate,
        clicks: clickCount.get(affiliate.id) ?? 0,
        sales: own.filter((l) => l.commission > 0 && l.how !== "bonus").length,
        earned,
        paid: out,
        owed,
        waiting,
        // What has cleared, less what has been paid — never more than is owed
        // in all, and never a negative number of its own making: a creator who
        // has already paid past what cleared simply has nothing to pay today.
        // Owing nothing, or being owed money back after a refund, is `owed`'s
        // to say, and is carried through unchanged.
        // Held for the creator to look at: nothing of it goes into a payment until they release it.
        payable: flags.length && payable > 0 ? 0 : payable,
        held: flags.length ? Math.max(0, owed) : 0,
        flags,
        paidClicks: paidCount.get(affiliate.id) ?? 0,
      };
    })
    .sort((a, b) => b.owed - a.owed || b.affiliate.appliedAt - a.affiliate.appliedAt);
  const elsewhere =
    lines.filter((l) => l.currency !== store.currency).length + paid.filter((p) => p.currency !== store.currency).length;
  return { rows, lines, payouts: paid, refundsChecked, invoicesChecked, currency: store.currency, elsewhere };
}

/** How many invoice pages of a hundred are read when the book is opened. */
const INVOICE_PAGES = 10;
const AFF_SUB_STRIPE_VERSION = "2026-08-26.dahlia";

type InvoiceLike = {
  id?: unknown;
  status?: unknown;
  amount_paid?: unknown;
  currency?: unknown;
  customer_email?: unknown;
  created?: unknown;
  status_transitions?: { paid_at?: unknown } | null;
  total_taxes?: { amount?: unknown }[] | null;
  parent?: { subscription_details?: { metadata?: Record<string, string> | null } | null } | null;
  payments?: { data?: { payment?: { payment_intent?: unknown } | null }[] } | null;
};

/** Whether a payment made at `paidAt` falls within `months` of `from`, both in seconds. */
export function withinMonths(from: number, paidAt: number, months: number): boolean {
  if (months >= RECURRING_ALWAYS) return true;
  const start = new Date(from * 1000);
  const end = Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months, start.getUTCDate(), start.getUTCHours(), start.getUTCMinutes(), start.getUTCSeconds()) / 1000;
  return paidAt < end;
}

/**
 * The paid invoices of this store's memberships and payment plans that were
 * sold through an affiliate's link, as Referrals: read from the creator's
 * Stripe account, pinned to one API version so their shape is known, and
 * never written down. A membership's payment counts while it falls within
 * the months agreed when it was sold; a plan's every payment counts.
 */
async function recurringReferrals(store: Store, everyone: Affiliate[], since: number): Promise<{ lines: Referral[]; complete: boolean }> {
  const handles = saleHandles(store);
  const byId = new Map(everyone.map((a) => [a.id, a]));
  const found: { invoice: InvoiceLike; meta: Record<string, string> }[] = [];
  let after = "";
  let complete = false;
  for (let page = 0; page < INVOICE_PAGES; page += 1) {
    const query = new URLSearchParams({ limit: "100", status: "paid", "created[gte]": String(Math.max(0, since)) });
    query.append("expand[]", "data.payments");
    if (after) query.set("starting_after", after);
    const listed = (await onAccount("GET", store.stripeAccountId as string, `/invoices?${query}`, undefined, AFF_SUB_STRIPE_VERSION)) as { data?: unknown; has_more?: unknown };
    const rows = (Array.isArray(listed.data) ? listed.data : []) as InvoiceLike[];
    for (const invoice of rows) {
      const meta = invoice.parent?.subscription_details?.metadata ?? {};
      if (!meta.via || !AFFILIATE_ID_PATTERN.test(meta.via) || !handles.has(meta.store ?? "")) continue;
      found.push({ invoice, meta });
    }
    const last = rows[rows.length - 1];
    if (listed.has_more !== true || !last || typeof last.id !== "string") {
      complete = true;
      break;
    }
    after = last.id;
  }
  const ids = [...new Set(found.map((f) => f.meta.product).filter((id): id is string => Boolean(id)))];
  const titles = new Map((ids.length ? await readListings(store, ids).catch(() => []) : []).map((p) => [p.id, p.title]));
  const lines: Referral[] = [];
  for (const { invoice, meta } of found) {
    const total = typeof invoice.amount_paid === "number" ? invoice.amount_paid : 0;
    if (typeof invoice.id !== "string" || invoice.status !== "paid" || total <= 0) continue;
    const paidAt = Number(invoice.status_transitions?.paid_at) || Number(invoice.created) || 0;
    const plan = meta.kind === "plan";
    const months = Number(meta.via_months) || 0;
    const soldAt = Number(meta.via_at) || 0;
    if (!plan && (months < 1 || !soldAt || !withinMonths(soldAt, paidAt, months))) continue;
    const tax = (invoice.total_taxes ?? []).reduce((sum, t) => sum + (typeof t?.amount === "number" ? t.amount : 0), 0);
    const pi = invoice.payments?.data?.map((p) => p.payment?.payment_intent).find((x): x is string => typeof x === "string") ?? "";
    const affiliate = byId.get(meta.via);
    const buyer = typeof invoice.customer_email === "string" ? invoice.customer_email : "";
    lines.push({
      ref: invoice.id,
      pi,
      aff: meta.via,
      at: paidAt,
      product: meta.product ?? "",
      title: (titles.get(meta.product ?? "") ?? "").slice(0, 200),
      base: Math.max(0, total - tax),
      total,
      currency: readCurrencyCode(invoice.currency),
      rate: Number(meta.via_rate) || 0,
      self: Boolean(affiliate && buyer) && canonicalEmail(affiliate!.email) === canonicalEmail(buyer),
      how: "recurring",
    });
  }
  return { lines, complete };
}

/**
 * Each goal an affiliate reaches in a calendar month (UTC): its bonus once,
 * dated at the sale that reached it. Counted from the sales that earn after
 * refunds, in the store's currency, not partner shares; a refund that takes
 * the month back under the goal takes the bonus away with it.
 */
export function bonusLines(store: Pick<Store, "affiliates" | "currency">, lines: Line[]): Line[] {
  // A store record made before bonuses existed has none.
  const goals = store.affiliates.bonuses ?? [];
  if (!goals.length) return [];
  const months = new Map<string, Line[]>();
  for (const line of lines) {
    if (line.commission <= 0 || line.how === "partner" || line.how === "bonus" || line.currency !== store.currency) continue;
    const key = `${line.aff}|${new Date(line.at * 1000).toISOString().slice(0, 7)}`;
    months.set(key, [...(months.get(key) ?? []), line]);
  }
  const out: Line[] = [];
  for (const [key, sold] of months) {
    const [aff, month] = key.split("|");
    const inOrder = [...sold].sort((a, b) => a.at - b.at);
    for (const goal of goals) {
      if (inOrder.length < goal.sales) continue;
      out.push({
        ref: `bonus:${aff}:${month}:${goal.sales}`,
        pi: "",
        aff,
        at: inOrder[goal.sales - 1].at,
        product: "",
        title: `Bonus: ${goal.sales} ${goal.sales === 1 ? "sale" : "sales"} in ${new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", year: "numeric" })}`,
        base: 0,
        total: 0,
        currency: store.currency,
        rate: 0,
        self: false,
        how: "bonus",
        refunded: 0,
        commission: goal.cents,
        status: "earned",
      });
    }
  }
  return out;
}

/**
 * Why each affiliate's commission is held, if it is: a click from a paid
 * search ad the creator does not allow, since they last released it; or a
 * payout address, or an inbox written another way, that another affiliate
 * also has, unless the creator cleared it.
 */
export function holdFlags(store: Pick<Store, "affiliates">, everyone: Affiliate[], paidCount: Map<string, number>): Map<string, HoldFlag[]> {
  const out = new Map<string, HoldFlag[]>();
  for (const a of everyone) {
    const flags: HoldFlag[] = [];
    if (!store.affiliates.paidSearch && (paidCount.get(a.id) ?? 0) > (a.cleared?.paid ?? 0)) flags.push("paid-search");
    if (sharersOf(a, everyone).some((id) => !(a.cleared?.with ?? []).includes(id))) flags.push("same-address");
    if (flags.length) out.set(a.id, flags);
  }
  return out;
}

/** The other affiliates, approved or waiting, with this one's inbox or payout address, written any way. */
function sharersOf(a: Affiliate, everyone: Affiliate[]): string[] {
  const mine = new Set([canonicalEmail(a.email), canonicalEmail(payAddress(a))]);
  return everyone
    .filter((b) => b.id !== a.id && (b.status === "approved" || b.status === "pending"))
    .filter((b) => mine.has(canonicalEmail(b.email)) || mine.has(canonicalEmail(payAddress(b))))
    .map((b) => b.id);
}

/** The creator looked and lets what is held through: the paid-search clicks so far, and a shared address. */
export async function releaseHold(store: Store, id: string): Promise<Affiliate | null> {
  if (!store.statsId || !AFFILIATE_ID_PATTERN.test(id)) return null;
  const affiliate = await readAffiliate(store, id);
  if (!affiliate) return null;
  const [paid] = await redisPipeline([["HGET", paidClicksKey(store.statsId), id]]);
  const next: Affiliate = { ...affiliate, cleared: { paid: Number(paid) || 0, with: sharersOf(affiliate, await listAffiliates(store)) } };
  await writeAffiliate(store, next);
  return next;
}

const csvCell = (value: string | number) => {
  const text = String(value);
  // A cell a spreadsheet would read as a formula is written as text.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** The whole book as a spreadsheet: every sale and every payout, one per line. */
export function bookCsv(book: Book, all: Affiliate[]): string {
  const who = new Map(all.map((a) => [a.id, a]));
  const day = (seconds: number) => new Date(seconds * 1000).toISOString().slice(0, 10);
  const header = [
    "type",
    "date",
    "affiliate_email",
    "affiliate_code",
    "reference",
    "product",
    "paid_before_tax",
    "refunded",
    "commission_rate_percent",
    "commission",
    "status",
    "payout",
    "payout_reference",
    "currency",
  ];
  const rows: (string | number)[][] = [
    ...book.lines.map((l) => [
      "sale",
      day(l.at),
      who.get(l.aff)?.email ?? "",
      who.get(l.aff)?.code ?? "",
      l.ref,
      l.title,
      plainAmount(l.base, l.currency),
      plainAmount(l.refunded, l.currency),
      l.rate,
      plainAmount(l.commission, l.currency),
      l.status,
      "",
      "",
      l.currency.toUpperCase(),
    ]),
    ...book.payouts.map((p) => [
      "payout",
      p.date,
      who.get(p.aff)?.email ?? "",
      who.get(p.aff)?.code ?? "",
      p.id,
      "",
      "",
      "",
      "",
      "",
      "paid by you",
      plainAmount(p.cents, p.currency),
      p.reference,
      p.currency.toUpperCase(),
    ]),
  ];
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

/**
 * A program's own numbers, for the affiliate directory when its creator
 * allowed them (lib/affiliate-setting.ts, AffiliateSetting.numbers): what an
 * affiliate deciding whether to apply most wants to know, and the thing no
 * program elsewhere shows before they join.
 *
 * Read from the same records the creator's book is (readBook), counted the
 * same way: clicks once per visitor a day; sales credited to an affiliate,
 * never their own purchases; what those sales earned at the share each was
 * made at, before any refund, because refunds are read from the creator's
 * Stripe account only when the book is opened; and what the creator wrote
 * down as paid. Only amounts in the store's own currency are added up.
 */
export type ProgramNumbers = {
  /** Affiliates approved today. */
  affiliates: number;
  /** Clicks counted, and the sales credited to a click. */
  clicks: number;
  clickSales: number;
  /** What the sales credited to a click earned, before refunds. */
  clickEarnedCents: number;
  /** Every sale credited to an affiliate (a click, a code or a buyer kept), and what they earned before refunds. */
  sales: number;
  earnedCents: number;
  /** What the creator wrote down as paid to affiliates. */
  paidCents: number;
  /** When the first affiliate was approved, in ms; 0 when none is. */
  since: number;
};

export async function programNumbers(store: Store): Promise<ProgramNumbers | null> {
  if (!store.statsId || !isRedisConfigured()) return null;
  const statsId = store.statsId;
  const [people, clicks, sales, payouts] = await redisPipeline([
    ["HGETALL", peopleKey(statsId)],
    ["HGETALL", clicksKey(statsId)],
    ["HGETALL", salesKey(statsId)],
    ["HGETALL", payoutsKey(statsId)],
  ]);
  const approved = pairs(people)
    .map(([, raw]) => parseAffiliate(raw))
    .filter((a): a is Affiliate => a !== null && a.status === "approved");
  const currency = store.currency.toLowerCase();
  const referrals = pairs(sales)
    .map(([, raw]) => parseReferral(raw))
    .filter((r): r is Referral => r !== null && !r.self && (r.currency || "usd").toLowerCase() === currency);
  const earned = (r: Referral) => commissionOn(r.base, r.rate);
  const byClick = referrals.filter((r) => r.how === "click");
  return {
    affiliates: approved.length,
    clicks: pairs(clicks).reduce((sum, [, n]) => sum + (Number(n) || 0), 0),
    clickSales: byClick.length,
    clickEarnedCents: byClick.reduce((sum, r) => sum + earned(r), 0),
    sales: referrals.length,
    earnedCents: referrals.reduce((sum, r) => sum + earned(r), 0),
    paidCents: pairs(payouts)
      .map(([, raw]) => parsePayout(raw))
      .filter((p): p is Payout => p !== null && (p.currency || "usd").toLowerCase() === currency)
      .reduce((sum, p) => sum + p.cents, 0),
    since: approved.reduce((first, a) => (first === 0 || (a.decidedAt > 0 && a.decidedAt < first) ? a.decidedAt : first), 0),
  };
}
