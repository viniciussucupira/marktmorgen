/**
 * Discount codes, kept on the creator's own Stripe account.
 *
 * A code here is two Stripe objects on the creator's connected account: a
 * Coupon, which is the discount itself, and a Promotion Code, which is the
 * word a buyer types. Both belong to the creator. That is not an incidental
 * choice — it means the redemption count is Stripe's count, the expiry is
 * Stripe's expiry, and a creator who leaves takes their codes with them. We
 * are not holding a second ledger of who got what off.
 *
 * It also means we never compute a discounted price ourselves. The buyer types
 * the code inside Stripe Checkout, Stripe decides whether it is live and what
 * it takes off, and the amount charged is Stripe's arithmetic on a coupon the
 * creator made. A platform that worked out the discount itself would be a
 * platform that can get somebody's money wrong.
 *
 * On Stan this is behind their $99 plan, checked on their own pricing page on
 * 20 September 2026. Here it is in the one price.
 *
 * ---
 *
 * A note on the API version, because it is the sharp edge in this file.
 *
 * Stripe moved the Promotion Code's `coupon` parameter into a `promotion` hash
 * in version 2025-09-30.clover. Which of the two shapes is accepted depends on
 * the version the request runs at, and left unset that is whatever our platform
 * account happens to default to — which somebody could change in a dashboard
 * next year and break every code created here. So every call below pins the
 * version explicitly. The request and the version can then never disagree.
 */
import { StripeError, onAccount } from "@/lib/stripe-account";
import { type Currency, formatMoney, rangeWords } from "@/lib/money";
import type { MayComeOff } from "@/lib/platform-share";

/** Pinned, so the shape we send is the shape this version expects. */
const API_VERSION = "2025-09-30.clover";

/**
 * What a code may look like.
 *
 * Stripe accepts letters, digits and dashes, and treats the code as
 * case-insensitive. Codes are held upper case here so that what the creator
 * sees in the studio is what a buyer would type on a poster.
 */
export const CODE_PATTERN = /^[A-Z0-9-]{3,24}$/;
export const MAX_CODES = 20;

/**
 * The two ways a code can take money off. An amount is in one currency,
 * Stripe's rule for a coupon: it only comes off a checkout in that currency.
 */
export type Off =
  | { kind: "percent"; percent: number }
  | { kind: "amount"; cents: number; currency: string };

export type CodeProblem =
  /** Nothing was typed. */
  | "empty"
  /** Characters Stripe will not take, or a length it will not take. */
  | "shape"
  /** Not a percentage between 1 and 100. */
  | "percent"
  /** Not an amount of money we can charge. */
  | "amount"
  /** A cap on redemptions that is not a whole positive number. */
  | "uses";

export const CODE_PROBLEMS: Record<CodeProblem, string> = {
  empty: "Type the code a buyer will enter, like LAUNCH20.",
  shape:
    "A code is 3 to 24 characters, and only letters, numbers and dashes.",
  percent: "Type a percentage between 1 and 100.",
  amount: "Type an amount between 1 and 5000, like 10 or 7.50.",
  uses: "Leave the limit empty, or type a whole number of uses above zero.",
};

/** The amount sentence for a store in another currency than the dollar. */
export function amountProblem(currency: Currency): string {
  return currency === "usd"
    ? CODE_PROBLEMS.amount
    : `Type an amount ${rangeWords(currency)}, in ${currency.toUpperCase()}${currency === "jpy" ? ", with no decimals" : ""}.`;
}

/** The code as it will be stored and shown: trimmed and upper case. */
export function readCode(raw: string): string {
  return (raw ?? "").trim().toUpperCase();
}

export function codeProblem(code: string): CodeProblem | null {
  if (!code) return "empty";
  if (!CODE_PATTERN.test(code)) return "shape";
  return null;
}

/** "20% off" / "$10 off" / "€10 off" — how a code reads to a person. */
export function offLabel(off: Off): string {
  if (off.kind === "percent") return `${off.percent}% off`;
  return `${formatMoney(off.cents, off.currency)} off`;
}

/** One code as the studio shows it, read back from Stripe every time. */
export type DiscountCode = {
  /** Stripe's own id for the promotion code, used to switch it off. */
  id: string;
  code: string;
  off: Off | null;
  /** How many times Stripe says it has been used. */
  timesRedeemed: number;
  /** The cap the creator set, if any. */
  maxRedemptions: number | null;
  /** Seconds since the epoch, as Stripe counts them. */
  expiresAt: number | null;
  /** Whether Stripe will still take it. Stripe decides, not us. */
  active: boolean;
};

export type CodeList =
  | { state: "ok"; codes: DiscountCode[] }
  | { state: "unavailable" }
  | { state: "error" };

/**
 * Reads what a coupon takes off, whichever shape it arrived in.
 *
 * The version above is pinned, so `promotion.coupon` is what we expect. The
 * older top-level `coupon` is still read because a record made before this
 * file existed, or by the creator in their own Stripe dashboard, is just as
 * real and should still be listed rather than shown as a code that does
 * nothing.
 */
function readOff(row: Record<string, unknown>): Off | null {
  const promotion = row.promotion as { coupon?: unknown } | undefined;
  const raw = (promotion?.coupon ?? row.coupon) as
    | { percent_off?: unknown; amount_off?: unknown; currency?: unknown }
    | string
    | undefined;
  if (!raw || typeof raw === "string") return null;

  if (typeof raw.percent_off === "number" && raw.percent_off > 0) {
    return { kind: "percent", percent: raw.percent_off };
  }
  if (typeof raw.amount_off === "number" && raw.amount_off > 0) {
    return { kind: "amount", cents: raw.amount_off, currency: typeof raw.currency === "string" && raw.currency ? raw.currency : "usd" };
  }
  return null;
}

function readRow(row: Record<string, unknown>): DiscountCode | null {
  if (typeof row.id !== "string" || !row.id) return null;
  if (typeof row.code !== "string" || !row.code) return null;
  return {
    id: row.id,
    code: row.code,
    off: readOff(row),
    timesRedeemed:
      typeof row.times_redeemed === "number" ? row.times_redeemed : 0,
    maxRedemptions:
      typeof row.max_redemptions === "number" ? row.max_redemptions : null,
    expiresAt: typeof row.expires_at === "number" ? row.expires_at : null,
    active: row.active === true,
  };
}

/**
 * The codes on this creator's account.
 *
 * Read from Stripe on every look rather than copied into our own record, for
 * the same reason the sales list is: there is then no second copy to drift
 * from the real one, and the redemption counts are the ones that actually
 * decide whether a code still works.
 */
export async function listCodes(account: string): Promise<CodeList> {
  try {
    const page = await onAccount(
      "GET",
      account,
      // Expanded, so what each code takes off comes from the coupon itself
      // rather than from anything we wrote down beside it.
      `/promotion_codes?limit=${MAX_CODES}&expand[]=data.promotion.coupon`,
      undefined,
      API_VERSION,
    );
    const rows = Array.isArray(page.data)
      ? (page.data as Record<string, unknown>[])
      : [];
    const codes = rows
      .map(readRow)
      .filter((entry): entry is DiscountCode => entry !== null);
    return { state: "ok", codes };
  } catch (error) {
    console.error("listing discount codes failed", error);
    return { state: "error" };
  }
}

export type MadeCode =
  | { ok: true; code: DiscountCode }
  | { ok: false; reason: "taken" | "stripe" };

/**
 * Makes a code: one coupon, and one promotion code pointing at it.
 *
 * The coupon is created first because the promotion code needs it. If the
 * second call fails, a coupon is left behind with nothing pointing at it — it
 * charges nobody anything and the creator never sees it, which is a better
 * failure than a live code whose discount we could not finish writing.
 */
export async function createCode(
  account: string,
  code: string,
  off: Off,
  maxRedemptions: number | null,
): Promise<MadeCode> {
  const coupon = new URLSearchParams({
    // Once: the discount applies to the payment it is typed into. On a
    // membership that means the first charge, not every renewal for ever,
    // which is what a launch code is meant to do.
    duration: "once",
    name: code,
  });
  if (off.kind === "percent") {
    coupon.set("percent_off", String(off.percent));
  } else {
    coupon.set("amount_off", String(off.cents));
    coupon.set("currency", off.currency);
  }
  if (maxRedemptions !== null) {
    coupon.set("max_redemptions", String(maxRedemptions));
  }

  try {
    const made = await onAccount(
      "POST",
      account,
      "/coupons",
      coupon,
      API_VERSION,
    );
    if (typeof made.id !== "string") throw new Error("no coupon id");

    const promotion = new URLSearchParams({
      "promotion[type]": "coupon",
      "promotion[coupon]": made.id,
      code,
    });
    if (maxRedemptions !== null) {
      promotion.set("max_redemptions", String(maxRedemptions));
    }

    const row = await onAccount(
      "POST",
      account,
      "/promotion_codes",
      promotion,
      API_VERSION,
    );
    const read = readRow(row);
    // The response does not expand the coupon, so what it takes off is filled
    // in from what we just asked for — the same numbers, one call sooner.
    return read
      ? { ok: true, code: { ...read, off: read.off ?? off } }
      : { ok: false, reason: "stripe" };
  } catch (error) {
    // Stripe refuses a second live code with the same word. That is the one
    // failure a creator can act on, so it gets its own answer.
    if (
      error instanceof StripeError &&
      /already|exists|duplicate/i.test(error.message)
    ) {
      return { ok: false, reason: "taken" };
    }
    console.error("creating a discount code failed", error);
    return { ok: false, reason: "stripe" };
  }
}

/**
 * Switches a code off.
 *
 * Stripe has no delete for a promotion code, and that is right: a code that
 * has been redeemed is part of somebody's receipt. Switching it off stops it
 * being taken from now on and leaves the history alone.
 */
export async function stopCode(
  account: string,
  id: string,
): Promise<boolean> {
  try {
    await onAccount(
      "POST",
      account,
      `/promotion_codes/${encodeURIComponent(id)}`,
      new URLSearchParams({ active: "false" }),
      API_VERSION,
    );
    return true;
  } catch (error) {
    console.error("switching a discount code off failed", error);
    return false;
  }
}

/**
 * The id of the creator's live promotion code written this way, or null.
 *
 * Used when a code arrives in a link (lib/code-link.ts): the checkout applies
 * it by id. Only a code that is active on the creator's own account comes
 * back; whether it fits this particular sale (a minimum, a first order, a
 * product it is limited to) is still Stripe's to decide when the checkout
 * opens, and a refusal there falls back to the box (lib/store-checkout.ts).
 * A failure to ask is a null, never an error: a code is a nicety, a checkout
 * is the sale.
 */
export async function livePromotionId(account: string, code: string): Promise<string | null> {
  if (!CODE_PATTERN.test(code)) return null;
  try {
    const page = await onAccount(
      "GET",
      account,
      `/promotion_codes?limit=1&active=true&code=${encodeURIComponent(code)}`,
      undefined,
      API_VERSION,
    );
    const row = Array.isArray(page.data) ? (page.data[0] as Record<string, unknown> | undefined) : undefined;
    return row && typeof row.id === "string" && row.active !== false ? row.id : null;
  } catch (error) {
    console.error("looking up a code from a link failed", error);
    return null;
  }
}

/**
 * What the codes on this creator's account may take off a checkout in this
 * currency, for the share of the sale (lib/platform-share.ts): the fee set on
 * a checkout must never be more than the buyer pays, and the box on Stripe's
 * page takes any live code on the account, including one the creator made in
 * their own Stripe dashboard. Read fresh on every checkout that needs it, so
 * a code made a minute ago is counted. Anything that cannot be read in full
 * reads as unknown, which sets no fee at all.
 */
export async function codesMayTakeOff(account: string | null, currency: string): Promise<MayComeOff[]> {
  if (!account) return [{ kind: "unknown" }];
  try {
    const page = await onAccount("GET", account, "/promotion_codes?limit=100&active=true&expand[]=data.promotion.coupon", undefined, API_VERSION);
    if (page.has_more === true || !Array.isArray(page.data)) return [{ kind: "unknown" }];
    let percent = 0;
    let cents = 0;
    for (const row of page.data as Record<string, unknown>[]) {
      const off = readOff(row);
      if (!off) return [{ kind: "unknown" }];
      if (off.kind === "percent") percent = Math.max(percent, off.percent);
      else if (off.currency.toLowerCase() === currency.toLowerCase()) cents = Math.max(cents, off.cents);
    }
    const out: MayComeOff[] = [];
    if (percent > 0) out.push({ kind: "percent", percent });
    if (cents > 0) out.push({ kind: "cents", cents });
    return out;
  } catch (error) {
    console.error("reading what a store's codes take off failed", error);
    return [{ kind: "unknown" }];
  }
}
