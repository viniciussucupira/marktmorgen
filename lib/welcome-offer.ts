/**
 * A welcome offer with a deadline of each person's own (added 13 October
 * 2026): whoever asks for one of the store's free products is offered a
 * discount on one paid product, for a set number of hours counted from the
 * moment they asked. It is ClickFunnels' "Countdown Funnels" (an evergreen
 * deadline per lead), made so that the deadline is true:
 *
 *   - it starts when the person asks for the free product, and is kept for
 *     them: asking again, from another product, another device or a month
 *     later, never starts it again, so the time shown is the time there is;
 *   - when it ends, it has ended: the button opens no discounted checkout
 *     any more, the page says the day and hour it ended, and the product is
 *     at its usual price like for everybody else;
 *   - the discount is a coupon on the creator's own Stripe account, applied
 *     by Stripe to that person's address only, on the first payment;
 *   - one reminder email before it ends, only to somebody who agreed to hear
 *     from the creator and confirmed their address, with the list's own
 *     unsubscribe and the creator's postal address.
 *
 * Pure, so the studio's form, the free page and the server read the same
 * rules. Kept by lib/welcome-offer-send.ts.
 */
import type { Store } from "@/lib/store";

export type WelcomeOffer = {
  /** The paid product offered; empty when off. */
  product: string;
  percent: number;
  hours: number;
  /** The coupon on the creator's own Stripe account; empty when off. */
  coupon: string;
  /** One reminder before the end, to those who agreed to hear from the creator. */
  remind: boolean;
  /** The creator's postal address, at the bottom of the reminder, as US law asks. */
  address: string;
};

export const WELCOME_PERCENTS = [10, 15, 20, 25, 30, 40, 50] as const;
export const WELCOME_HOURS = [24, 48, 72, 168] as const;
export const MAX_WELCOME_ADDRESS = 200;
export const NO_WELCOME_OFFER: WelcomeOffer = { product: "", percent: 0, hours: 48, coupon: "", remind: false, address: "" };

export function parseWelcomeOffer(raw: unknown): WelcomeOffer {
  if (!raw || typeof raw !== "object") return { ...NO_WELCOME_OFFER };
  const v = raw as Record<string, unknown>;
  const percent = Number(v.percent);
  const hours = Number(v.hours);
  const product = typeof v.product === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(v.product) ? v.product : "";
  const coupon = typeof v.coupon === "string" && /^[A-Za-z0-9_-]{3,64}$/.test(v.coupon) ? v.coupon : "";
  const on = product && coupon && (WELCOME_PERCENTS as readonly number[]).includes(percent);
  return {
    product: on ? product : "",
    percent: on ? percent : 0,
    hours: (WELCOME_HOURS as readonly number[]).includes(hours) ? hours : 48,
    coupon: on ? coupon : "",
    remind: v.remind === true,
    address: typeof v.address === "string" ? v.address.replace(/\s+/g, " ").trim().slice(0, MAX_WELCOME_ADDRESS) : "",
  };
}

export function welcomeOn(store: Pick<Store, "welcomeOffer">): boolean {
  const o = store.welcomeOffer;
  return Boolean(o && o.product && o.coupon && o.percent > 0);
}

/** When a person's offer ends, in seconds, from when they asked. */
export function endsAt(startSeconds: number, hours: number): number {
  return startSeconds + hours * 3600;
}

/** When the one reminder goes: a quarter of the time before the end, and never more than twelve hours before it. */
export function remindAt(startSeconds: number, hours: number): number {
  return endsAt(startSeconds, hours) - Math.min(12 * 3600, Math.floor((hours * 3600) / 4));
}

/** Hours, minutes and seconds left, "47:59:12", or null once it has ended. Pure. */
export function leftWords(untilSeconds: number, nowSeconds: number): string | null {
  const left = untilSeconds - nowSeconds;
  if (left <= 0) return null;
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
