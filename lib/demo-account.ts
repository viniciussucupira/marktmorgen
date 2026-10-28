/**
 * The demo store's Stripe account, and the one key that may ever act on it.
 *
 * The account is a connected account in Stripe's test mode: the fictional
 * creator's, on which every charge of the demo store is made directly, the
 * way a creator's own account is charged. No real money can reach it or
 * leave it.
 *
 * It has a key of its own — STRIPE_DEMO_SECRET_KEY — and that key is taken
 * only when it is a test key. This is what keeps the demo a demo whatever
 * the rest of the site is doing: the day the platform's own key is a live
 * one, a request on this account is still signed with this one (see keyFor
 * in lib/stripe-account.ts), so the demo store can never be the place where
 * a visitor's real card is charged.
 *
 * Nothing is imported here, on purpose: both the code that calls Stripe as a
 * creator and the code that checks our requests against Stripe read this.
 */

/** The fictional creator's connected account, in Stripe's test mode. */
export const DEMO_CONNECTED_ACCOUNT = (process.env.STRIPE_DEMO_ACCOUNT_ID ?? "").trim();

/** The key for that account, or null: a live key is refused, never used. */
export function demoKey(): string | null {
  const key = process.env.STRIPE_DEMO_SECRET_KEY?.trim();
  if (!key || !/^(sk|rk)_test_/.test(key)) return null;
  return key;
}
