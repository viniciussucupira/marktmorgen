/**
 * The part of abandoned-checkout reminders a checkout needs: whether a store
 * has them on, the postal address they carry, and the fields that make Stripe
 * ask the buyer for consent.
 *
 * Kept apart from lib/checkout-recovery.ts, which reads the closed checkouts
 * and sends the email, so the store record and the checkout can use these
 * without importing the sender side, and the sender side can use the checkout
 * without the two importing each other.
 */
import { isRedisConfigured } from "@/lib/redis";
import { isSenderConfigured } from "@/lib/email";
import { StripeError } from "@/lib/stripe-account";
import type { Store } from "@/lib/store";

export type RecoverySetting = {
  /** Switched on by the creator in the studio. Off until they do. */
  enabled: boolean;
  /**
   * Where the creator can be reached by post. A reminder is an email about
   * buying something, and the law in the United States asks every such email
   * to carry the sender's postal address, so it cannot be switched on
   * without one.
   */
  address: string;
  /**
   * Whether Stripe is asked to put its own consent box on the checkout.
   * Stripe offers that only to businesses in the United States, so it is
   * true for a US account and false for every other — which still has the
   * reminder a buyer asks for themselves (lib/checkout-ask.ts). A record from
   * before this was kept reads as true: only US accounts could switch it on.
   */
  asks: boolean;
};

/** The most a postal address may run to, the same as on list email. */
export const MAX_RECOVERY_ADDRESS = 200;

export const NO_RECOVERY: RecoverySetting = { enabled: false, address: "", asks: true };

/** Whatever came back from storage, made safe to use. */
export function parseRecovery(raw: unknown): RecoverySetting {
  if (!raw || typeof raw !== "object") return { ...NO_RECOVERY };
  const value = raw as Record<string, unknown>;
  const address =
    typeof value.address === "string" ? value.address.replace(/\s+/g, " ").trim().slice(0, MAX_RECOVERY_ADDRESS) : "";
  // On only with an address to print; a record that lost it reads as off.
  return { enabled: value.enabled === true && address !== "", address, asks: value.asks !== false };
}

/**
 * How long a checkout stays open on a store with reminders on, in seconds.
 * Stripe's own default is a day; a reminder a day later arrives after the
 * moment has gone, so the checkout closes after an hour and the reminder
 * follows within minutes of that. Stripe will not close one sooner than
 * thirty minutes, and a checkout that holds a limited unit keeps its own,
 * shorter time (lib/stripe-account.ts).
 */
export const RECOVERY_OPEN_SECONDS = 60 * 60;

/** Whether this store's checkouts ask for consent and its reminders go out. */
export function recoveryOn(store: Store): boolean {
  return (
    store.recovery.enabled &&
    store.recovery.address !== "" &&
    Boolean(store.statsId) &&
    isRedisConfigured() &&
    isSenderConfigured()
  );
}

/** The fields a checkout needs so Stripe asks for consent and keeps the email. */
export function applyRecovery(body: URLSearchParams): void {
  body.set("consent_collection[promotions]", "auto");
  body.set("after_expiration[recovery][enabled]", "true");
  body.set("expires_at", String(Math.floor(Date.now() / 1000) + RECOVERY_OPEN_SECONDS));
}

/**
 * The same checkout without them, for an account Stripe will not ask on
 * behalf of: the buyer still pays, and simply is not asked.
 */
export function withoutRecovery(body: URLSearchParams): void {
  body.delete("consent_collection[promotions]");
  body.delete("after_expiration[recovery][enabled]");
  body.delete("expires_at");
}

/**
 * The same two fields for a call's checkout, which keeps its own closing
 * time: the time it holds is counted from it (lib/calls.ts, holdAndCheckout).
 */
export function askForCallReminder(body: URLSearchParams): void {
  body.set("consent_collection[promotions]", "auto");
  body.set("after_expiration[recovery][enabled]", "true");
}

/** And without them, leaving that closing time where it is. */
export function withoutCallReminder(body: URLSearchParams): void {
  body.delete("consent_collection[promotions]");
  body.delete("after_expiration[recovery][enabled]");
}

/** Whether Stripe's refusal is about the fields above. */
export function refusedRecovery(error: unknown): boolean {
  return (
    error instanceof StripeError &&
    error.status === 400 &&
    /consent_collection|after_expiration|promotion|recovery|expires_at/i.test(error.message)
  );
}
