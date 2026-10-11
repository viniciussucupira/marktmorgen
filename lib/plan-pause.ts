/**
 * A break from the plan instead of leaving it (added 11 October 2026).
 *
 * Why. Stan, the store this one is first compared with, loses about 13% of
 * its creators a month (Contrary, August 2026). Some of them are not leaving
 * at all: a teacher whose term is over, a coach taking the summer off, a
 * course being rebuilt. Offered only "cancel", they cancel, and a creator who
 * has cancelled rarely comes back to start again. Offered a break, they take
 * the break, and the plan starts again by itself.
 *
 * What a break is, precisely, and why it is built out of parts that exist:
 *
 *   - The subscription is set to stop at the end of the period already paid
 *     for, exactly as cancelling does (lib/billing.ts, setCancelAtPeriodEnd).
 *     Until that day nothing changes; on it, the store stands as any store
 *     whose plan ended (lib/plan-standing.ts): the checkout stops, the page
 *     stays up, a buyer's download is never refused, lesson video plays for
 *     the hours a store with no plan has.
 *   - What the store keeps is kept, all of it, for the whole break. The
 *     closing that takes away what a store with no plan may not keep
 *     (lib/plan-closing.ts) waits while a break runs, and goes on as it would
 *     have after, if the plan does not start again.
 *   - On the day the break ends the plan is started again on the card it was
 *     last paid with, at the plan and price it had, monthly, charged at once
 *     or not at all (lib/billing.ts, restartPlan). The creator is told the
 *     date and the price RESTART_NOTICE_DAYS before, as before a trial ends,
 *     and told again whichever way it goes.
 *   - The creator can take the break back before it starts, in one click,
 *     and the plan goes on as if nothing happened; or once it has started,
 *     start the plan again from the studio's ordinary button, any day; or
 *     tell us not to start it at all.
 *
 * Why not Stripe's own "pause payment collection". It voids every invoice
 * made while it is set, which would also void a usage charge for the month
 * before the break, and it leaves the subscription "active", which every part
 * of this code reads as a store that may sell. Stopping and starting again
 * costs a new subscription id, and nothing else.
 *
 * Who may take one: a monthly plan, paid up and past its trial, with
 * PAID_MONTHS_BEFORE_PAUSE payments through, not set to stop, with no change
 * of plan waiting, once in PAUSE_EVERY_DAYS. What that costs us at the most is
 * added up in tests/plan-margin.test.ts.
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import {
  BillingError,
  isBillingConfigured,
  periodEnd,
  planOf,
  restartPlan,
  setCancelAtPeriodEnd,
  stateOf,
  subscriptionRecord,
} from "@/lib/billing";
import { addPeriods } from "@/lib/plans";
import { NIMBUS_FROM, isSenderConfigured, sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site-url";
import { SUPPORT_EMAIL } from "@/lib/creator-research";
import { PLAN_NAMES, PLAN_PRICES, type Tier, parseTier } from "@/lib/plan";
import { setSubscription, storeForEmail, storeRef, type Store } from "@/lib/store";
import {
  PAID_MONTHS_BEFORE_PAUSE,
  PAUSE_EVERY_DAYS,
  RESTART_NOTICE_DAYS,
  type PauseMonths,
} from "@/lib/plan-pause-rules";

const DAY = 86_400;
/** Days a restart that failed for a reason other than the card is tried again. */
const RETRY_DAYS = 3;

/** Whether Stripe refused because of the card or the bank, which trying again will not change. */
function declined(error: unknown): boolean {
  if (!(error instanceof BillingError)) return false;
  return error.status === 402 || /card_declined|authentication_required|expired_card|insufficient_funds|payment_method|incorrect_cvc/.test(error.code);
}
const recordKey = (ref: string) => `nl:pause:${ref}`;
const lastKey = (ref: string) => `nl:pause:last:${ref}`;
const DUE = "nl:pause:due";
const SUBSCRIPTION_ID = /^sub_[A-Za-z0-9]{6,64}$/;
const CUSTOMER_ID = /^cus_[A-Za-z0-9]{6,64}$/;

/** A break, as it is kept. Times in seconds. */
export type PauseRecord = {
  /** The subscription that stops for it. */
  subscription: string;
  customer: string;
  /** The card the plan was paid with, and is started again on. */
  paymentMethod: string;
  tier: Tier;
  /** When the paid period ends and the break begins. */
  from: number;
  /** When the plan starts again. */
  until: number;
  /** When the creator was told the plan is about to start again; 0 until then. */
  told: number;
};

function parseRecord(raw: unknown): PauseRecord | null {
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const tier = parseTier(value.tier);
    if (
      typeof value.subscription !== "string" || !SUBSCRIPTION_ID.test(value.subscription) ||
      typeof value.customer !== "string" || !CUSTOMER_ID.test(value.customer) ||
      typeof value.paymentMethod !== "string" || !tier ||
      typeof value.from !== "number" || typeof value.until !== "number" || value.until <= value.from
    ) {
      return null;
    }
    return {
      subscription: value.subscription,
      customer: value.customer,
      paymentMethod: value.paymentMethod,
      tier,
      from: value.from,
      until: value.until,
      told: typeof value.told === "number" ? value.told : 0,
    };
  } catch {
    return null;
  }
}

/** The break a store has set, whether it has begun or not, or null. */
export async function pauseOf(store: Pick<Store, "email" | "sid" | "extra">): Promise<PauseRecord | null> {
  return pauseAt(storeRef(store));
}

async function pauseAt(ref: string): Promise<PauseRecord | null> {
  if (!isRedisConfigured()) return null;
  const [raw] = await redisPipeline([["GET", recordKey(ref)]]);
  return parseRecord(raw);
}

/** Whether a break has not run out yet. */
export function breakRunning(record: Pick<PauseRecord, "until">, nowSeconds = Date.now() / 1000): boolean {
  return record.until > nowSeconds;
}

/** Whether a store's closing must wait: a break that has not run out. Read by lib/plan-closing.ts. */
export async function onBreak(ref: string, nowSeconds = Date.now() / 1000): Promise<boolean> {
  const record = await pauseAt(ref).catch(() => null);
  return record !== null && record.until > nowSeconds;
}

export type PauseRefusal = "standing" | "trial" | "yearly" | "canceling" | "pending" | "early" | "recent";

/**
 * Whether this subscription may take a break, and if not, why. Pure, so the
 * studio can say the reason and a test can hold every case.
 */
export function pauseRefusal(
  subscription: Record<string, unknown>,
  nowSeconds: number,
  pausedBefore: boolean,
): PauseRefusal | null {
  const state = stateOf(subscription);
  if (state.state !== "active" || subscription.status !== "active") {
    return state.state === "active" && state.trialing ? "trial" : "standing";
  }
  if (state.cycle !== "month") return "yearly";
  if (state.cancelsAtEnd) return "canceling";
  if (state.changePending) return "pending";
  // Paid for PAID_MONTHS_BEFORE_PAUSE months: the first charge is at the
  // trial's end, or at the start when there was none, and the n-th a month
  // after the one before. "active" rather than "past_due" means the latest
  // went through.
  const trialEnd = typeof subscription.trial_end === "number" ? subscription.trial_end : 0;
  const started = typeof subscription.start_date === "number" ? subscription.start_date : 0;
  const first = Math.max(trialEnd, started);
  if (!first || addPeriods(first, "month", PAID_MONTHS_BEFORE_PAUSE - 1) > nowSeconds) return "early";
  if (pausedBefore) return "recent";
  return null;
}

/** The card a subscription is charged on: its own, or its customer's default. */
function cardOf(subscription: Record<string, unknown>): string {
  const own = subscription.default_payment_method;
  if (typeof own === "string") return own;
  if (own && typeof own === "object" && typeof (own as { id?: unknown }).id === "string") return (own as { id: string }).id;
  const source = subscription.default_source;
  return typeof source === "string" ? source : "";
}

export type PauseResult = { kind: "paused"; record: PauseRecord } | { kind: "refused"; reason: PauseRefusal | "card" };

/** Sets a break of `months`, starting when the period already paid for ends. */
export async function pausePlan(store: Store, months: PauseMonths, nowSeconds = Math.floor(Date.now() / 1000)): Promise<PauseResult> {
  const id = store.subscriptionId;
  if (!id || !isBillingConfigured() || !isRedisConfigured()) return { kind: "refused", reason: "standing" };
  const subscription = await subscriptionRecord(id);
  if (!subscription) return { kind: "refused", reason: "standing" };
  const ref = storeRef(store);
  const [last] = await redisPipeline([["EXISTS", lastKey(ref)]]);
  const refusal = pauseRefusal(subscription, nowSeconds, Number(last) === 1);
  if (refusal) return { kind: "refused", reason: refusal };
  const customer = typeof subscription.customer === "string" ? subscription.customer : store.stripeCustomerId ?? "";
  const paymentMethod = cardOf(subscription);
  // Without a card on the subscription there is nothing to start it again on,
  // and a break that cannot end by itself is a cancellation with a nicer name.
  if (!CUSTOMER_ID.test(customer) || !paymentMethod) return { kind: "refused", reason: "card" };

  const from = periodEnd(subscription, false);
  if (!from || from <= nowSeconds) return { kind: "refused", reason: "standing" };
  const record: PauseRecord = {
    subscription: id,
    customer,
    paymentMethod,
    tier: planOf(subscription).tier,
    from,
    until: addPeriods(from, "month", months),
    told: 0,
  };
  // Written down before Stripe is told, so a store whose plan is set to stop
  // is never left without the record that starts it again. If Stripe then
  // refuses, the record is taken back.
  await redisPipeline([
    ["SET", recordKey(ref), JSON.stringify(record)],
    ["ZADD", DUE, record.until, ref],
    ["SET", lastKey(ref), String(nowSeconds), "EX", PAUSE_EVERY_DAYS * DAY],
  ]);
  try {
    const state = await setCancelAtPeriodEnd(id, true);
    if (state.state !== "active") throw new Error(`the subscription is ${state.state}`);
  } catch (error) {
    await forget(ref, true);
    throw error;
  }
  return { kind: "paused", record };
}

/** Drops a store's break. `andTheYear` gives the once-a-year break back too: for one that never began. */
async function forget(ref: string, andTheYear: boolean): Promise<void> {
  await redisPipeline([
    ["DEL", recordKey(ref)],
    ["ZREM", DUE, ref],
    ...(andTheYear ? [["DEL", lastKey(ref)]] : []),
  ]);
}

/**
 * Takes a break back. Before it begins the plan simply goes on, and the
 * break is not counted. Once it has begun the plan has already stopped, and
 * this only means it will not start again by itself.
 */
export async function undoPause(store: Store, nowSeconds = Math.floor(Date.now() / 1000)): Promise<"kept" | "stopped" | "none"> {
  const ref = storeRef(store);
  const record = await pauseAt(ref);
  if (!record) return "none";
  if (nowSeconds < record.from && record.subscription === store.subscriptionId) {
    const state = await setCancelAtPeriodEnd(record.subscription, false);
    await forget(ref, true);
    return state.state === "active" ? "kept" : "stopped";
  }
  await forget(ref, false);
  return "stopped";
}

/** Called when the creator cancels outright, or starts a plan again by hand: there is no break left to run. */
export async function dropPause(store: Pick<Store, "email" | "sid" | "extra">): Promise<void> {
  if (!isRedisConfigured()) return;
  await forget(storeRef(store), false);
}

function day(seconds: number): string {
  return new Date(seconds * 1000).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
}

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

/** What the creator is told, plain text. */
export function pauseEmail(kind: "set" | "soon" | "restarted" | "failed", record: PauseRecord): { subject: string; text: string } {
  const name = PLAN_NAMES[record.tier];
  const price = dollars(PLAN_PRICES[record.tier].month);
  const studio = `${SITE_URL}/studio#billing`;
  const close = ["", `Questions: reply to this email, or write to ${SUPPORT_EMAIL}.`, "", "Marktmorgen"];
  if (kind === "set") {
    return {
      subject: `Your break from ${name}: ${day(record.from)} to ${day(record.until)}`,
      text: [
        "Hello,",
        "",
        `Your store keeps taking payments until ${day(record.from)}. From then until ${day(record.until)} nothing is charged, your checkout is closed, and everything you put up stays exactly where it is.`,
        "",
        `On ${day(record.until)} your plan starts again by itself, at ${price} a month on the card you pay with now. We will write a week before.`,
        "",
        `To take the break back, or to start selling again sooner, open your studio: ${studio}`,
        ...close,
      ].join("\n"),
    };
  }
  if (kind === "soon") {
    return {
      subject: `Your ${name} plan starts again on ${day(record.until)}`,
      text: [
        "Hello,",
        "",
        `Your break ends on ${day(record.until)}. On that day your plan starts again and your card is charged ${price}, and then ${price} every month, until you cancel.`,
        "",
        `If you would rather not start again, say so in your studio before then. It takes one click, with no email to us: ${studio}`,
        ...close,
      ].join("\n"),
    };
  }
  if (kind === "restarted") {
    return {
      subject: `Your ${name} plan has started again`,
      text: [
        "Hello,",
        "",
        `Your break is over. Your plan has started again at ${price} a month, and your checkout is taking payments.`,
        "",
        `Every charge is covered by our 30-day refund. Your plan is in your studio: ${studio}`,
        ...close,
      ].join("\n"),
    };
  }
  return {
    subject: `Your ${name} plan could not start again`,
    text: [
      "Hello,",
      "",
      `Your break ended on ${day(record.until)}, and we could not start your plan again: the card it was paid with did not go through, or your bank asked for a confirmation we cannot give for you. Nothing was charged.`,
      "",
      `Start it again in your studio, with this card or another one: ${studio}`,
      "",
      "Your store and your products stay up. If your store keeps more than a store with no plan may, we will write with the figures and the date before anything is removed.",
      ...close,
    ].join("\n"),
  };
}

async function tell(store: Store, kind: "set" | "soon" | "restarted" | "failed", record: PauseRecord): Promise<boolean> {
  if (!isSenderConfigured() || !store.email) return false;
  const { subject, text } = pauseEmail(kind, record);
  return sendEmail({ from: NIMBUS_FROM, to: store.email, subject, text, replyTo: SUPPORT_EMAIL });
}

/** Tells the creator what they just set. Never fails the request that set it. */
export async function confirmPause(store: Store, record: PauseRecord): Promise<void> {
  await tell(store, "set", record).catch((error) => console.error("confirming a break failed", error));
}

/**
 * The daily pass: tells every creator whose break ends within the notice, and
 * starts again every plan whose break has ended. Safe to run as often as it is
 * called: each notice goes once, and a plan is started under a key Stripe will
 * not carry out twice.
 */
export async function runBreaks(nowSeconds = Math.floor(Date.now() / 1000)): Promise<{ told: number; restarted: number; failed: number; dropped: number }> {
  const counts = { told: 0, restarted: 0, failed: 0, dropped: 0 };
  if (!isRedisConfigured() || !isBillingConfigured()) return counts;
  const [raw] = await redisPipeline([["ZRANGEBYSCORE", DUE, "-inf", String(nowSeconds + RESTART_NOTICE_DAYS * DAY), "LIMIT", "0", "200"]]);
  const refs = Array.isArray(raw) ? (raw as string[]) : [];
  for (const ref of refs) {
    const record = await pauseAt(ref);
    const store = await storeForEmail(ref);
    if (!record || !store) {
      await forget(ref, false);
      counts.dropped += 1;
      continue;
    }
    // Started again by hand, from the studio, on a subscription of its own:
    // there is nothing left to start.
    if (store.subscriptionActive && store.subscriptionId !== record.subscription) {
      await forget(ref, false);
      counts.dropped += 1;
      continue;
    }
    if (record.until > nowSeconds) {
      if (!record.told && (await tell(store, "soon", record).catch(() => false))) {
        await redisPipeline([["SET", recordKey(ref), JSON.stringify({ ...record, told: nowSeconds })]]);
        counts.told += 1;
      }
      continue;
    }
    try {
      const started = await restartPlan({
        store,
        customerId: record.customer,
        paymentMethod: record.paymentMethod,
        tier: record.tier,
        idempotencyKey: `restart:${record.subscription}:${record.until}`,
      });
      await setSubscription(ref, started);
      await forget(ref, false);
      await tell(store, "restarted", record).catch(() => false);
      counts.restarted += 1;
    } catch (error) {
      console.error("starting a plan again after a break failed", store.handle, error);
      // Stripe or the network failing is not the card failing: tried again on
      // the next run, for a few days, before the creator is told it did not work.
      if (!declined(error) && nowSeconds - record.until < RETRY_DAYS * DAY) {
        counts.failed += 1;
        continue;
      }
      await forget(ref, false);
      await tell(store, "failed", record).catch(() => false);
      counts.failed += 1;
    }
  }
  return counts;
}
