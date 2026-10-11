/**
 * Booking a paid call, on the creator's own Stripe account.
 *
 * A buyer picks a time, the time is held while they pay, and it becomes
 * theirs once Stripe says the payment went through. Three sources decide
 * whether a time is free, and all three are consulted every time:
 *
 *   - holds: a time somebody is paying for right now, kept for as long as a
 *     Stripe checkout stays open, then released by itself;
 *   - bookings we wrote down when a buyer came back from paying;
 *   - the creator's own Stripe account, which is the ledger. A buyer who paid
 *     and closed the tab before coming back still blocks the time, because
 *     the paid checkout is read from Stripe.
 *
 * Every hold and booking is one seat: a one-to-one call has one per time, a
 * group call up to fifty, a dated live session up to five hundred (the rules
 * are in lib/call-setup.ts). The same booking can be seen twice — written
 * down here and read from Stripe — so seats are counted by checkout session,
 * once each.
 *
 * Emails go out once per booking — to the buyer and to the creator — each
 * with a calendar file, so the call is in both calendars without anybody
 * connecting anything. The buyer's has a link to move the booking to another
 * time themselves (moveBooking), within the creator's notice and at most
 * MAX_MOVES times; the reminders a day and an hour before are sent by the
 * mail job (lib/call-reminders.ts).
 *
 * Where the call happens is the creator's own link, a private video room
 * (lib/call-rooms.ts), or a Google Meet or Zoom meeting made on the
 * creator's connected account for each booking (lib/meet-links.ts), made
 * here when the booking is confirmed and moved here when the booking moves.
 *
 * A fourth source applies to weekly hours only: the creator's own calendars,
 * when they have pasted their private calendar addresses in the studio
 * (lib/calendar-sync.ts). A time they are busy there is not offered, and a
 * calendar that cannot be read takes nothing away — the bookings go on
 * without it. Dated sessions are never hidden by it: the creator put them on
 * that date themselves, so the studio shows the clash instead.
 */
import { saleHandles } from "@/lib/store";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { NIMBUS_FROM, isSenderConfigured, sendEmail } from "@/lib/email";
import { isHouseStore } from "@/lib/house-store";
import { HOLD_SECONDS, checkoutClosesAt, onAccount } from "@/lib/stripe-account";
import { applyTax, applyTaxDocuments, openKeepingTheSale } from "@/lib/tax";
import { askForCallReminder, recoveryOn, refusedRecovery, withoutCallReminder } from "@/lib/recovery-setting";
import { inTheCurrencyShown, isSettled, onlyInstantMethods } from "@/lib/instant-pay";
import { refundedInFull } from "@/lib/refunds";
import { type Answer, applyCheckoutFields, readAnswers } from "@/lib/checkout-fields";
import type { Listing, Product, Store } from "@/lib/store";
import { idsOfKind, listingFinder, readListing, readListings, sellsAny } from "@/lib/catalog";

/** A product that is a call, as listed: all a booking needs but its checkout questions. */
export type CallListing = Listing & { call: CallSetup };
import { formatMoney } from "@/lib/money";
import {
  type Busy,
  type CallSetup,
  KEEP_PAST_SESSION_DAYS,
  MAX_MOVES,
  isBookable,
  isTimeZone,
  lengthAt,
  movableUntil,
  openSessions,
  openSlots,
  readableTime,
  seatsTaken,
  zoneName,
} from "@/lib/call-setup";
import { planCheck, planReminders, readMoves, unplanReminders, writeMove } from "@/lib/call-records";
import { calendarBusy } from "@/lib/calendar-sync";
import { fold, icsText, icsTime } from "@/lib/ics-write";
import { emitEvent } from "@/lib/webhooks";
import { VIDEO_ROOM_NOTE, isVideoRoom, roomOf } from "@/lib/call-rooms";
import { alertCreator } from "@/lib/phone-alerts";
import { callMeeting, callMoved, linkUpdates } from "@/lib/meet-links";
import type { MeetRecord } from "@/lib/meet-records";
import { LANGUAGES, parseLanguage } from "@/lib/store-language";
import { type BookingWords, bookingWords } from "@/lib/buyer-words/booking";

/** How far back Stripe is read for paid bookings. Longer than any horizon. */
const LOOKBACK_DAYS = 120;
const MAX_PAGES = 5;

/**
 * One seat, as written down here: its start and end, until when a hold lasts
 * (0 for a booking), the checkout session, and the product. Entries written
 * before group calls are filed under their start and carry no `s` or `p`.
 */
type Entry = { s?: number; e: number; until: number; session?: string; p?: string };

const busyKey = (callsId: string) => `nl:call:busy:${callsId}`;
// One lock for the whole diary, not one per start time: two call products,
// or two overlapping stretches of hours, can offer different starts that
// overlap, and both buyers must not pass the check at once. The same lock
// stops two buyers taking the last seat of a group call, and a buyer moving
// into a time while another books it.
const lockKey = (callsId: string) => `nl:call:lock:${callsId}`;
const confirmedKey = (session: string) => `nl:call:confirmed:${session}`;

function readEntries(flat: string[]): { field: string; entry: Entry }[] {
  const out: { field: string; entry: Entry }[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    try {
      out.push({ field: flat[i], entry: JSON.parse(flat[i + 1]) as Entry });
    } catch {
      out.push({ field: flat[i], entry: { e: NaN, until: -1 } });
    }
  }
  return out;
}

async function heldAndBooked(callsId: string, now: number): Promise<(Busy & { field: string })[]> {
  const [raw] = await redisPipeline([["HGETALL", busyKey(callsId)]]);
  const flat = Array.isArray(raw) ? (raw as string[]) : [];
  const busy: (Busy & { field: string })[] = [];
  const stale: string[] = [];
  for (const { field, entry } of readEntries(flat)) {
    if (entry.until === -1 || (entry.until !== 0 && entry.until < now)) {
      stale.push(field);
      continue;
    }
    const start = typeof entry.s === "number" ? entry.s : Number(field);
    if (!Number.isFinite(start) || !Number.isFinite(entry.e)) continue;
    busy.push({ start, end: entry.e, product: entry.p, session: entry.session, field });
  }
  // Holds that ran out are tidied as they are noticed.
  if (stale.length) await redisPipeline([["HDEL", busyKey(callsId), ...stale]]).catch(() => {});
  return busy;
}

type SessionRow = {
  id?: unknown;
  status?: unknown;
  payment_status?: unknown;
  metadata?: Record<string, string> | null;
  customer_details?: { email?: unknown; name?: unknown } | null;
  created?: unknown;
  custom_fields?: unknown;
  amount_total?: unknown;
  payment_intent?: unknown;
};

/**
 * Paid calls, read from the creator's own Stripe account, each at the time
 * it is booked for now: a booking its buyer moved is at its new time.
 */
export async function paidCalls(store: Store): Promise<
  {
    session: string;
    start: number;
    end: number;
    product: string;
    title: string;
    email: string | null;
    /** The name the buyer gave Stripe, when they gave one. */
    name: string | null;
    buyerTz: string;
    /** How many times its buyer has moved it. */
    moves: number;
    /** What the buyer answered to the creator's questions at checkout. */
    answers: Answer[];
    /** What was paid, in cents. */
    amount: number;
  }[]
> {
  return (await readCallSessions(store)).paid;
}

type CallRow = Awaited<ReturnType<typeof paidCalls>>[number];

/**
 * A paid booking of this store from one checkout session, or null. A booking
 * refunded in full is `refunded`: it no longer holds its time or gets reminders.
 */
function callFromRow(row: SessionRow, handles: Set<string>): CallRow | "refunded" | null {
  const meta = row.metadata ?? {};
  if (meta.kind !== "call" || !handles.has(meta.store ?? "")) return null;
  if (!isSettled(row)) return null;
  const start = Number(meta.start);
  const end = Number(meta.end);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (refundedInFull(row.payment_intent)) return "refunded";
  const email = row.customer_details?.email;
  const name = row.customer_details?.name;
  return {
    session: typeof row.id === "string" ? row.id : "",
    start,
    end,
    product: meta.product ?? "",
    title: meta.title ?? "",
    email: typeof email === "string" && email ? email : null,
    name: typeof name === "string" && name.trim() ? name.trim().slice(0, 120) : null,
    buyerTz: isTimeZone(meta.tz) ? meta.tz : "UTC",
    moves: 0,
    answers: readAnswers(row),
    amount: typeof row.amount_total === "number" ? row.amount_total : 0,
  };
}

async function withMoves(found: CallRow[]): Promise<CallRow[]> {
  const moves = await readMoves(found.map((call) => call.session));
  return found.map((call) => {
    const move = moves.get(call.session);
    return move ? { ...call, start: move.s, end: move.e, moves: move.n } : call;
  });
}

/**
 * The paid bookings Stripe lists for this store, and the sessions of those
 * refunded in full. Only completed checkouts are read, so holds that ran out
 * never use up the pages.
 */
async function readCallSessions(store: Store): Promise<{ paid: CallRow[]; refunded: Set<string> }> {
  const refunded = new Set<string>();
  if (!store.stripeAccountId) return { paid: [], refunded };
  const handles = saleHandles(store);
  const since = Math.floor(Date.now() / 1000) - LOOKBACK_DAYS * 86400;
  const found: CallRow[] = [];
  let after = "";
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const list = (await onAccount(
      "GET",
      store.stripeAccountId,
      `/checkout/sessions?limit=100&status=complete&created[gte]=${since}&expand[]=data.payment_intent.latest_charge${after ? `&starting_after=${encodeURIComponent(after)}` : ""}`,
    )) as { data?: unknown; has_more?: unknown };
    const rows = Array.isArray(list.data) ? (list.data as SessionRow[]) : [];
    for (const row of rows) {
      const call = callFromRow(row, handles);
      if (call === "refunded") {
        if (typeof row.id === "string") refunded.add(row.id);
      } else if (call) found.push(call);
    }
    if (list.has_more !== true || rows.length === 0) break;
    const last = rows[rows.length - 1];
    after = typeof last.id === "string" ? last.id : "";
    if (!after) break;
  }
  return { paid: await withMoves(found), refunded };
}

/**
 * One booking read straight from its checkout session, for a booking too far
 * back in a busy account to be among the sessions paidCalls reads. Null when
 * it is not a paid, unrefunded booking of this store.
 */
export async function paidCall(store: Store, session: string): Promise<CallRow | null> {
  if (!store.stripeAccountId || !/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(session)) return null;
  const row = (await onAccount(
    "GET",
    store.stripeAccountId,
    `/checkout/sessions/${encodeURIComponent(session)}?expand[]=payment_intent.latest_charge`,
  )) as SessionRow;
  const call = callFromRow(row, saleHandles(store));
  if (!call || call === "refunded") return null;
  return (await withMoves([call]))[0] ?? null;
}

export type PaidCall = Awaited<ReturnType<typeof paidCalls>>[number];

/**
 * Everything that makes a seat or a time unavailable, the paid calls behind
 * it, and the times the creator's own calendars say they are busy.
 */
async function readBusy(
  store: Store,
  now: number,
): Promise<{ busy: Busy[]; paid: PaidCall[]; blocked: Busy[]; sessions: Busy[] }> {
  const local = store.callsId && isRedisConfigured() ? await heldAndBooked(store.callsId, now) : [];
  let paid: PaidCall[] = [];
  // Read alongside Stripe, and never a reason to fail: a calendar that does
  // not answer blocks nothing.
  const weekly = sellsAny(store, "weekly");
  const calendar = weekly
    ? calendarBusy(store, now).catch(() => ({ busy: [] as Busy[] }))
    : Promise.resolve({ busy: [] as Busy[] });
  // The creator's dated sessions count against weekly hours only.
  const sessions = weekly ? readListings(store, idsOfKind(store, "call")).then((calls) => sessionTimes(calls, now)) : Promise.resolve([]);
  // Awaited below; marked here so a failure while Stripe is being read is not left unheard.
  sessions.catch(() => {});
  let refunded = new Set<string>();
  try {
    ({ paid, refunded } = await readCallSessions(store));
  } catch (error) {
    // Without Stripe's answer a paid time could be offered twice. Refusing to
    // show any time is the safe failure; the caller treats the throw as that.
    console.error("reading paid calls failed", error);
    throw error;
  }
  // Stripe's copy wins over ours: it is the ledger, and it is read with any
  // move applied. Each checkout session is one seat, however often it is seen.
  const fromStripe = new Set(paid.map((c) => c.session).filter(Boolean));
  // A booking refunded in full gives its time back.
  const gone = local.filter((b) => b.session && refunded.has(b.session));
  if (gone.length && store.callsId) {
    await redisPipeline([["HDEL", busyKey(store.callsId), ...gone.map((b) => b.field)]]).catch(() => {});
  }
  const busy: Busy[] = [
    ...local.filter((b) => (!b.session || !fromStripe.has(b.session)) && !(b.session && refunded.has(b.session))),
    ...paid.map((c) => ({ start: c.start, end: c.end, product: c.product, session: c.session })),
  ];
  return { busy, paid, blocked: (await calendar).busy, sessions: await sessions };
}

/** Every seat taken or held in this store, right now. */
export async function busyTimes(store: Store, now = Date.now()): Promise<Busy[]> {
  return (await readBusy(store, now)).busy;
}

/**
 * The creator's dated sessions still to come, as time they are not free for
 * a weekly call. A session keeps its time whether or not anybody booked it:
 * the creator put it in their diary.
 */
function sessionTimes(calls: Listing[], now: number): Busy[] {
  const out: Busy[] = [];
  for (const product of calls) {
    if (!product.call || product.call.kind !== "live") continue;
    for (const session of product.call.sessions) {
      const end = session.start + session.minutes * 60_000;
      if (end > now) out.push({ start: session.start, end, product: product.id });
    }
  }
  return out;
}

/**
 * What a product is checked against: its seats, and for weekly hours the
 * creator's dated sessions and the busy times of their own calendars too.
 */
function against(product: CallListing, busy: Busy[], sessions: Busy[], blocked: Busy[] = []): Busy[] {
  return product.call.kind === "weekly" ? [...busy, ...sessions, ...blocked] : busy;
}

/**
 * Lets a buyer who went back from Stripe's page pick again.
 *
 * Their browser remembers the checkout it opened. When it asks for another
 * time in the same store, that checkout is closed at Stripe first — so it can
 * never be paid as well — and only then is its time let go. A checkout that
 * was paid in the meantime cannot be closed, and its time stays booked.
 */
export async function releaseOwnHold(store: Store, session: string): Promise<void> {
  if (!store.stripeAccountId || !store.callsId || !isRedisConfigured()) return;
  if (!/^cs_(test|live)_[A-Za-z0-9]{8,200}$/.test(session)) return;
  const [raw] = await redisPipeline([["HGETALL", busyKey(store.callsId)]]);
  const flat = Array.isArray(raw) ? (raw as string[]) : [];
  const fields = readEntries(flat)
    .filter(({ entry }) => entry.session === session && entry.until !== 0)
    .map(({ field }) => field);
  if (!fields.length) return;
  try {
    const closed = await onAccount(
      "POST",
      store.stripeAccountId,
      `/checkout/sessions/${encodeURIComponent(session)}/expire`,
      new URLSearchParams(),
    );
    if (closed.status !== "expired") return;
  } catch {
    // Paid, or already closed by Stripe: either way the hold is left alone and
    // runs out by itself if nobody paid.
    return;
  }
  await redisPipeline([["HDEL", busyKey(store.callsId), ...fields]]);
}

/**
 * Sends the booking emails for paid calls whose buyer never came back.
 *
 * A buyer who pays and closes the tab before Stripe sends them back would
 * otherwise leave both inboxes empty. Every time the paid calls are read from
 * Stripe anyway — the booking page and the studio — any that were never
 * confirmed are confirmed now, and the mail job looks at every checkout once
 * it has closed (lib/call-reminders.ts). confirmBooking is guarded, so this
 * never sends the same pair twice.
 */
export async function catchUpBookings(store: Store, paid: PaidCall[], origin: string): Promise<void> {
  if (!isRedisConfigured() || !store.callsId) return;
  const now = Date.now();
  const due = paid.filter((c) => c.session && c.end > now).slice(0, 20);
  if (!due.length) return;
  const seen = await redisPipeline(due.map((c) => ["EXISTS", confirmedKey(c.session)]));
  const find = listingFinder(store);
  for (let i = 0; i < due.length; i += 1) {
    if (Number(seen[i]) === 1) continue;
    const call = due[i];
    const product = await find(call.product);
    if (!product || !isCallProduct(product)) continue;
    await confirmBooking({
      store,
      product,
      session: call.session,
      start: call.start,
      end: call.end,
      buyerEmail: call.email,
      buyerName: call.name,
      buyerTz: call.buyerTz,
      moves: call.moves,
      answers: call.answers,
      amountCents: call.amount,
      origin,
    }).catch((error) => console.error("catching up a booking failed", error));
  }
}

/** Whether a product can be booked right now. */
export function isCallProduct<T extends Listing>(product: T): product is T & { call: CallSetup } {
  return product.call !== null;
}

/** Whether a booking was already confirmed, so the mail job knows to leave it. */
export async function isConfirmed(session: string): Promise<boolean> {
  const [seen] = await redisPipeline([["EXISTS", confirmedKey(session)]]);
  return Number(seen) === 1;
}

// ---- Saving a product's setup --------------------------------------------

export type ChangeProblem = "past" | "upcoming" | "booked" | "booked_seats" | "kind" | "error";

/**
 * Checks a new setup against what buyers already hold, and tidies it.
 *
 * Whatever a buyer paid for stays as it was sold: a dated session somebody
 * booked keeps its date, time and length, and keeps at least as many seats
 * as are taken; a product with bookings still to come keeps its kind. The
 * meeting link and everything else can change. Sessions long over are let
 * go, and a new or changed session has to be in the future. Stripe is only
 * asked when a change could touch a booking.
 */
export async function checkCallChange(
  store: Store,
  productId: string,
  next: CallSetup,
  now = Date.now(),
): Promise<CallSetup | ChangeProblem> {
  const before = (await readListing(store, productId))?.call ?? null;
  const was = before && before.kind === "live" ? before.sessions : [];
  const byId = new Map(was.map((s) => [s.id, s]));

  let setup = next;
  if (next.kind === "live") {
    const keepFrom = now - KEEP_PAST_SESSION_DAYS * 86_400_000;
    const sessions = next.sessions.filter((s) => s.start + s.minutes * 60_000 > keepFrom);
    for (const session of sessions) {
      if (session.start > now) continue;
      const old = byId.get(session.id);
      if (!old || old.start !== session.start || old.minutes !== session.minutes) return "past";
    }
    if (!sessions.some((s) => s.start > now)) return "upcoming";
    setup = { ...next, sessions, minutes: sessions[0].minutes };
  }

  const switching = before !== null && before.kind !== setup.kind;
  const touched = was.filter((old) => {
    if (old.start + old.minutes * 60_000 <= now) return false;
    const kept = setup.kind === "live" ? setup.sessions.find((s) => s.id === old.id) : undefined;
    return !kept || kept.start !== old.start || kept.minutes !== old.minutes || kept.seats < old.seats;
  });
  if (!switching && touched.length === 0) return setup;

  let busy: Busy[];
  try {
    busy = await busyTimes(store, now);
  } catch {
    return "error";
  }
  if (switching && busy.some((b) => b.product === productId && b.end > now)) return "kind";
  for (const old of touched) {
    const taken = seatsTaken(busy, productId, old.start);
    if (taken === 0) continue;
    const kept = setup.kind === "live" ? setup.sessions.find((s) => s.id === old.id) : undefined;
    if (!kept || kept.start !== old.start || kept.minutes !== old.minutes) return "booked";
    if (kept.seats < taken) return "booked_seats";
  }
  return setup;
}

// ---- The lock around a check and a write ---------------------------------

async function takeLock(callsId: string): Promise<boolean> {
  const lock = lockKey(callsId);
  // Another buyer of this store may be picking a time right now. They hold
  // the lock for a second or two, so wait for it rather than turn this one
  // away over a time nobody took.
  let got: unknown = null;
  for (let attempt = 0; attempt < 12 && got === null; attempt += 1) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 250));
    [got] = await redisPipeline([["SET", lock, String(Date.now()), "NX", "EX", 15]]);
  }
  if (got === null) {
    const [held] = await redisPipeline([["GET", lock]]);
    // A lock left behind by a request that died is taken over after 15 seconds.
    if (typeof held === "string" && Date.now() - Number(held) < 15_000) return false;
    await redisPipeline([["SET", lock, String(Date.now()), "EX", 15]]);
  }
  return true;
}

async function dropLock(callsId: string): Promise<void> {
  await redisPipeline([["DEL", lockKey(callsId)]]).catch(() => {});
}

/**
 * Whether this store's bookings write to anybody.
 *
 * Every store does, but the demo store (lib/house-store.ts), whose checkout
 * takes any address and charges nothing: a confirmation from it would be a
 * way to send mail to anybody who was typed into it, and its own owner is an
 * address nobody reads. Its buyers are given the time and the meeting link on
 * the page instead, which is where a booking shows them anyway.
 */
function writesAboutBookings(store: Store): boolean {
  return isSenderConfigured() && !isHouseStore(store);
}

export type HoldResult =
  | { ok: true; url: string; session: string }
  | { ok: false; reason: "taken" | "invalid" | "unavailable" | "error" };

/**
 * Holds a seat and opens a checkout for it, on the creator's account.
 *
 * The time is checked again here, against fresh data, because a page that
 * listed it a minute ago may be out of date. A short lock around the check
 * and the hold stops two buyers from winning the same seat at once — the
 * only seat of a one-to-one call, or the last of a group call.
 */
/**
 * The checkout of one booking, as Stripe is sent it: its price, what the
 * store needs to know about it, and — for a session from a package — the
 * coupon that makes it free. Kept apart from the holding of the time so the
 * same request can be checked against Stripe itself (app/api/verify/stripe).
 */
export function callCheckoutBody(input: {
  store: Store;
  product: Product;
  start: number;
  end: number;
  buyerTz: string;
  origin: string;
  via: { aff: string; rate: number } | null;
  fromPackage: { id: string; coupon: string; email: string; back: string } | null;
  /** The channel this sale is credited to, as Stripe metadata (lib/visit-channel.ts). */
  channel?: Record<string, string>;
}): URLSearchParams {
  const { store, product, start, end, buyerTz, origin } = input;
  const pkg = input.fromPackage;
  // Said in the buyer's own time zone: they are the one reading Stripe's page,
  // in the store's language (lib/store-language.ts). The same title is kept
  // on the sale, as what the buyer saw.
  const lang = LANGUAGES[parseLanguage(store.language)];
  const when = `${readableTime(start, buyerTz, lang.locale)} (${zoneName(start, buyerTz, lang.locale)})`;
  const name = `${product.title} \u2014 ${when}`;
  const body = new URLSearchParams({
    mode: "payment",
    locale: lang.stripe,
    "line_items[0][quantity]": "1",
    // In the store's own currency (lib/money.ts), like every price it has.
    "line_items[0][price_data][currency]": store.currency,
    "line_items[0][price_data][unit_amount]": String(product.priceCents),
    "line_items[0][price_data][product_data][name]": name.slice(0, 250),
    "metadata[store]": store.handle,
    "metadata[product]": product.id,
    "metadata[title]": name.slice(0, 480),
    "metadata[kind]": "call",
    ...Object.fromEntries(Object.entries(input.channel ?? {}).map(([key, value]) => [`metadata[${key}]`, value])),
    "metadata[start]": String(start),
    "metadata[end]": String(end),
    "metadata[tz]": buyerTz,
    "payment_intent_data[metadata][store]": store.handle,
    "payment_intent_data[metadata][product]": product.id,
    "payment_intent_data[metadata][kind]": "call",
    "payment_intent_data[metadata][start]": String(start),
    success_url: `${origin}/@${store.handle}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/@${store.handle}/book/${product.id}`,
  });
  if (product.summary) body.set("line_items[0][price_data][product_data][description]", product.summary);
  if (pkg) {
    body.set("discounts[0][coupon]", pkg.coupon);
    body.set("customer_email", pkg.email);
    body.set("metadata[package]", pkg.id);
    body.set("cancel_url", pkg.back);
    // Nothing is paid, so Stripe makes no payment of it to carry these.
    for (const key of [...body.keys()]) if (key.startsWith("payment_intent_data")) body.delete(key);
  } else if (store.hasDiscounts) body.set("allow_promotion_codes", "true");
  // Sent by an affiliate: credited to them, at today's share (lib/affiliates.ts).
  // A booking is one product, with nothing else able to ride along, so a
  // share of nothing is a sale that earns nothing and is not written down.
  if (input.via && input.via.rate > 0 && !pkg) {
    body.set("metadata[via]", input.via.aff);
    body.set("metadata[via_rate]", String(input.via.rate));
    body.set("payment_intent_data[metadata][via]", input.via.aff);
  }
  // What the creator wants to know before the call, asked before paying.
  applyCheckoutFields(body, product.fields);
  applyTax(store, body);
  // Not for a session from a package: nothing is paid, so there is nothing to
  // invoice, and the package's own checkout already asked (lib/call-packages.ts).
  if (!pkg) applyTaxDocuments(store, body, false);
  onlyInstantMethods(body);
  inTheCurrencyShown(body);
  // Stripe will not keep a checkout open for less than half an hour, counted
  // from when it makes it, so the closing time is set at the last moment;
  // the hold is counted from after, and lasts a minute longer, so the time
  // is never released while the page that pays for it is still open.
  body.set("expires_at", String(checkoutClosesAt()));
  return body;
}

/** The API version a checkout with nothing to pay is made at (lib/call-packages.ts). */
export const NO_COST_VERSION = "2026-08-26.dahlia";

export async function holdAndCheckout(input: {
  store: Store;
  product: Product & { call: CallSetup };
  start: number;
  buyerTz: string;
  origin: string;
  /** The affiliate whose link the buyer followed, and the share it earns. */
  via?: { aff: string; rate: number } | null;
  /**
   * A session from a package already paid for (lib/call-packages.ts): the
   * checkout carries a coupon for the whole of it, so nothing is charged, and
   * the package's address, so the booking is theirs.
   */
  fromPackage?: { id: string; coupon: string; email: string; back: string } | null;
  /** The channel this sale is credited to, as Stripe metadata (lib/visit-channel.ts channelOfRequest). */
  channel?: Record<string, string>;
}): Promise<HoldResult> {
  const { store, product, start, origin } = input;
  const setup = product.call;
  if (!store.stripeAccountId || !store.callsId || !isRedisConfigured()) return { ok: false, reason: "unavailable" };
  const length = lengthAt(setup, start);
  // A dated session the creator has since taken off.
  if (length === null) return { ok: false, reason: "taken" };
  const end = start + length;
  const buyerTz = isTimeZone(input.buyerTz) ? input.buyerTz : setup.tz;

  if (!(await takeLock(store.callsId))) return { ok: false, reason: "taken" };

  try {
    // Read once the lock is ours, so the check is about this moment.
    const now = Date.now();
    let busy: Busy[];
    try {
      const read = await readBusy(store, now);
      busy = against(product, read.busy, read.sessions, read.blocked);
    } catch {
      return { ok: false, reason: "error" };
    }
    if (!isBookable(setup, now, busy, start, product.id)) return { ok: false, reason: "taken" };

    const pkg = input.fromPackage ?? null;
    const body = callCheckoutBody({ store, product, start, end, buyerTz, origin, via: input.via ?? null, fromPackage: pkg, channel: input.channel });

    // A session from a package is a checkout with nothing to pay, which Stripe
    // takes only at API version 2023-08-16 or later
    // (docs.stripe.com/payments/checkout/no-cost-orders). A creator's own
    // account may default to an older one, so that checkout names its version.
    const account = store.stripeAccountId;
    // A store with reminders on: Stripe asks the buyer whether they want to
    // hear from the creator, and a buyer who said yes and left gets one email
    // leading back to the times still open (lib/checkout-recovery.ts). The
    // checkout keeps its own closing time, which the hold is counted from.
    let asking = !pkg && recoveryOn(store) && store.recovery.asks;
    if (asking) askForCallReminder(body);
    const open = () => onAccount("POST", account, "/checkout/sessions", body, pkg ? NO_COST_VERSION : undefined);
    const session = await openKeepingTheSale(body, async () => {
      try {
        return await open();
      } catch (error) {
        if (!asking || !refusedRecovery(error)) throw error;
        // Stripe decides which accounts it asks for consent for: refused, the call still sells.
        console.error("call checkout refused the reminder fields; opened without them", error);
        withoutCallReminder(body);
        asking = false;
        return open();
      }
    });
    if (typeof session.url !== "string" || !session.url || typeof session.id !== "string") {
      return { ok: false, reason: "error" };
    }
    const until = Date.now() + HOLD_SECONDS * 1000;
    const entry: Entry = { s: start, e: end, until, session: session.id, p: product.id };
    await redisPipeline([["HSET", busyKey(store.callsId), session.id, JSON.stringify(entry)]]);
    // Once the checkout can no longer be open, the mail job looks at it: a
    // buyer who paid and never came back is confirmed then.
    await planCheck(store.callsId, store.handle, session.id, start, until + 60_000).catch((error) =>
      console.error("planning a booking check failed", error),
    );
    return { ok: true, url: session.url, session: session.id };
  } catch (error) {
    console.error("holding a call failed", error);
    return { ok: false, reason: "error" };
  } finally {
    await dropLock(store.callsId);
  }
}

export type Offer = {
  /** Weekly hours: open times, by the creator's day. */
  days: ReturnType<typeof openSlots>;
  /** Group calls: seats left at each open time, by start. */
  left: Record<string, number>;
  /** Dated sessions still on sale. */
  sessions: ReturnType<typeof openSessions>;
};

function offerFrom(product: CallListing, now: number, seats: Busy[], sessions: Busy[], blocked: Busy[]): Offer {
  const setup = product.call;
  if (setup.kind === "live") return { days: [], left: {}, sessions: openSessions(setup, now, seats, product.id) };
  const days = openSlots(setup, now, against(product, seats, sessions, blocked), product.id);
  const left: Record<string, number> = {};
  if (setup.seats > 1) {
    for (const day of days) {
      for (const start of day.starts) left[String(start)] = setup.seats - seatsTaken(seats, product.id, start);
    }
  }
  return { days, left, sessions: [] };
}

/**
 * Every open time or session for a call product, or null when it cannot be
 * read, and the paid calls read on the way, for catchUpBookings.
 */
export async function slotsForProduct(store: Store, product: CallListing) {
  try {
    const now = Date.now();
    const { busy, paid, blocked, sessions } = await readBusy(store, now);
    return { ...offerFrom(product, now, busy, sessions, blocked), paid };
  } catch {
    return null;
  }
}

/**
 * The times a booking may move to: everything open, counted as if its own
 * seat were already free — so a one-hour call can move half an hour later —
 * and never the time it already has.
 */
export async function slotsForMove(
  store: Store,
  product: CallListing,
  session: string,
  current: number,
): Promise<Offer | null> {
  try {
    const now = Date.now();
    const { busy, blocked, sessions } = await readBusy(store, now);
    const offer = offerFrom(product, now, busy.filter((b) => b.session !== session), sessions, blocked);
    return {
      days: offer.days
        .map((day) => ({ ...day, starts: day.starts.filter((start) => start !== current) }))
        .filter((day) => day.starts.length > 0),
      left: offer.left,
      sessions: offer.sessions.filter((s) => s.start !== current),
    };
  } catch {
    return null;
  }
}

// ---- Moving a booking ------------------------------------------------------

/** Where a buyer moves their booking. The checkout session is the key, as on the thanks page. */
export function moveLink(origin: string, store: Store, productId: string, session: string): string {
  return `${origin}/@${store.handle}/book/${productId}?move=${encodeURIComponent(session)}`;
}

/**
 * Whether a booking at `start` may still be moved by its buyer: before the
 * creator's notice runs out, fewer than MAX_MOVES times, and — for a dated
 * session — only when there is another session to go to.
 */
export function canMove(setup: CallSetup, start: number, moves: number, now = Date.now()): boolean {
  return whyNotMove(setup, start, moves, now) === null;
}

/** Why a booking cannot be moved any more, or null when it can. */
export function whyNotMove(
  setup: CallSetup,
  start: number,
  moves: number,
  now = Date.now(),
): "limit" | "late" | "nowhere" | null {
  if (moves >= MAX_MOVES) return "limit";
  if (now > movableUntil(setup, start)) return "late";
  if (setup.kind === "live") {
    const closes = setup.noticeHours * 3600_000;
    if (!setup.sessions.some((s) => s.start !== start && s.start - closes > now)) return "nowhere";
  }
  return null;
}

export type MoveResult =
  | { ok: true; start: number; end: number; moves: number }
  | { ok: false; reason: "late" | "limit" | "same" | "taken" | "unavailable" | "error" };

/**
 * Moves a paid booking to another open time, for its buyer.
 *
 * `booked` is the booking as Stripe has it, read by the caller from the
 * checkout session. The move record is read again inside the lock, so two
 * tabs moving the same booking at once cannot both count as the first move,
 * and the new time is checked the way a new booking is. The old seat is let
 * go in the same step, and both people are told, with a new calendar file.
 */
export async function moveBooking(input: {
  store: Store;
  product: CallListing;
  session: string;
  booked: { start: number; end: number; email: string | null; buyerTz: string };
  start: number;
  origin: string;
}): Promise<MoveResult> {
  const { store, product, session, start, origin } = input;
  const setup = product.call;
  if (!store.callsId || !isRedisConfigured()) return { ok: false, reason: "unavailable" };
  const length = lengthAt(setup, start);
  if (length === null) return { ok: false, reason: "taken" };
  const end = start + length;
  const callsId = store.callsId;

  if (!(await takeLock(callsId))) return { ok: false, reason: "taken" };
  let from: { start: number; end: number; moves: number };
  try {
    const now = Date.now();
    const recorded = (await readMoves([session])).get(session);
    from = recorded
      ? { start: recorded.s, end: recorded.e, moves: recorded.n }
      : { start: input.booked.start, end: input.booked.end, moves: 0 };
    if (from.moves >= MAX_MOVES) return { ok: false, reason: "limit" };
    if (now > movableUntil(setup, from.start)) return { ok: false, reason: "late" };
    if (start === from.start) return { ok: false, reason: "same" };

    let busy: Busy[];
    let blocked: Busy[];
    let sessions: Busy[];
    try {
      ({ busy, blocked, sessions } = await readBusy(store, now));
    } catch {
      return { ok: false, reason: "error" };
    }
    const others = against(product, busy.filter((b) => b.session !== session), sessions, blocked);
    if (!isBookable(setup, now, others, start, product.id)) return { ok: false, reason: "taken" };

    await writeMove(session, { s: start, e: end, n: from.moves + 1 });
    // The seat moves in the diary too: whatever was written under this
    // checkout — a hold, a booking, one filed by its start before group calls
    // — gives way to one entry at the new time.
    const [raw] = await redisPipeline([["HGETALL", busyKey(callsId)]]);
    const old = readEntries(Array.isArray(raw) ? (raw as string[]) : [])
      .filter(({ field, entry }) => entry.session === session && field !== session)
      .map(({ field }) => field);
    const entry: Entry = { s: start, e: end, until: 0, session, p: product.id };
    await redisPipeline([
      ...(old.length ? [["HDEL", busyKey(callsId), ...old]] : []),
      ["HSET", busyKey(callsId), session, JSON.stringify(entry)],
      // Moved before it was ever confirmed: the move email says it all, and
      // no "Booked" email for the old time follows it.
      ["SET", confirmedKey(session), "1", "NX"],
    ]);
  } catch (error) {
    console.error("moving a booking failed", error);
    return { ok: false, reason: "error" };
  } finally {
    await dropLock(callsId);
  }

  const moves = from.moves + 1;
  try {
    await unplanReminders(callsId, store.handle, session, from.start);
    if (writesAboutBookings(store)) await planReminders(callsId, store.handle, session, start);
  } catch (error) {
    console.error("planning reminders after a move failed", error);
  }
  // A Google Meet or Zoom meeting moves with the booking (lib/meet-links.ts),
  // before anybody is told, so the emails carry the link of the new time.
  await callMoved({ store, product, session, from, start, end, email: input.booked.email }).catch((error) =>
    console.error("moving a booking's meeting failed", error),
  );
  await tellMoved({ store, product, session, from, start, end, moves, email: input.booked.email, buyerTz: input.booked.buyerTz, origin }).catch(
    (error) => console.error("sending the move emails failed", error),
  );
  await emitEvent(store, "call.moved", `${session}|${moves}`, {
    checkout_session: session,
    product: { id: product.id, title: product.title },
    from: { start: new Date(from.start).toISOString(), end: new Date(from.end).toISOString() },
    to: { start: new Date(start).toISOString(), end: new Date(end).toISOString() },
    moves,
    buyer: { email: input.booked.email, timezone: input.booked.buyerTz },
  }).catch((error) => console.error("queueing the call.moved webhook failed", error));
  return { ok: true, start, end, moves };
}

async function tellMoved(input: {
  store: Store;
  product: CallListing;
  session: string;
  from: { start: number; end: number };
  start: number;
  end: number;
  moves: number;
  email: string | null;
  buyerTz: string;
  origin: string;
}): Promise<void> {
  if (!writesAboutBookings(input.store)) return;
  const { store, product, session, from, start, end, moves, email, origin } = input;
  const setup = product.call;
  const buyerTz = isTimeZone(input.buyerTz) ? input.buyerTz : setup.tz;
  // A one-to-one booking keeps its video room when it moves; a seat in a
  // group moves into the room of its new time (lib/call-rooms.ts).
  const room = await roomOf(store.callsId, { product: product.id, setup, session, start, end });
  const video = isVideoRoom(room);
  // A link replaced after a failure counts too, so this file replaces every one sent before.
  const sequence = moves + (await linkUpdates(store.callsId, { session, product: product.id, start }));
  const invite = (note: string, words?: BookingWords) =>
    Buffer.from(
      callInvite({ uid: session, start, end, title: product.title, storeName: store.name, room, note, sequence, words }),
    ).toString("base64");
  const at = (ms: number, tz: string) => `${readableTime(ms, tz)} (${zoneName(ms, tz)})`;

  if (email) {
    // The buyer's email speaks the store's language (lib/buyer-words/booking.ts).
    const b = bookingWords(store.language);
    const locale = LANGUAGES[parseLanguage(store.language)].locale;
    const buyerAt = (ms: number) => `${readableTime(ms, buyerTz, locale)} (${zoneName(ms, buyerTz, locale)})`;
    const again = canMove(setup, start, moves);
    await sendEmail({
      from: storeSender(store),
      to: email,
      subject: b.movedSubject(product.title, store.name),
      text: [
        b.movedHead(store.name),
        "",
        b.titleLength(product.title, Math.round((end - start) / 60_000)),
        b.nowAt(buyerAt(start)),
        b.wasAt(buyerAt(from.start)),
        "",
        room ? b.joinAtNewTime(room) : b.willSendLink(store.name),
        ...(video ? [b.videoRoomNote] : []),
        "",
        b.newTimeAttached,
        again ? b.moveAgainLink(moveLink(origin, store, product.id, session), MAX_MOVES) : b.cannotMoveAgain(store.name),
        b.toCancel(store.name),
      ].join("\n"),
      replyTo: store.email,
      attachments: [{ filename: "call.ics", content: invite(buyerNote(b, store, room), b) }],
    });
  }

  await sendEmail({
    from: `"Marktmorgen" <${senderAddress()}>`,
    to: store.email,
    subject: `Moved: ${product.title}, now ${readableTime(start, setup.tz)}`,
    text: [
      `${email ?? "A buyer"} moved their booking of ${product.title}.`,
      "",
      `Now: ${at(start, setup.tz)}, your time zone`,
      `Was: ${at(from.start, setup.tz)}`,
      "",
      "The old time is free again for somebody else. The calendar file attached has the new time; delete the old event from your calendar if it is still there.",
      ...(room ? ["", `${video ? "The video room" : "The meeting link"}: ${room}`, ...(video ? [VIDEO_ROOM_NOTE] : [])] : []),
      "Every booking is also in your studio, under Upcoming calls.",
    ].join("\n"),
    ...(email ? { replyTo: email } : {}),
    attachments: [{ filename: "call.ics", content: invite(`With ${email ?? "your buyer"}.${room ? ` Join: ${room}` : ""}${video ? `\n\n${VIDEO_ROOM_NOTE}` : ""}`) }],
  });
}

// ---- Calendar files ------------------------------------------------------

/**
 * A calendar file for one booked call. A moved booking keeps its event id
 * and counts up `sequence`, which is how a calendar knows the new file is the
 * same event at a new time.
 */
export function callInvite(input: {
  uid: string;
  start: number;
  end: number;
  title: string;
  storeName: string;
  room: string | null;
  note: string;
  sequence?: number;
  /** The buyer's file speaks the store's language (lib/buyer-words/booking.ts); the creator's, English. */
  words?: BookingWords;
}): string {
  const words = input.words ?? bookingWords("en");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Marktmorgen//Paid calls//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.uid}@marktmorgen.com`,
    `DTSTAMP:${icsTime(Date.now())}`,
    `SEQUENCE:${input.sequence ?? 0}`,
    `DTSTART:${icsTime(input.start)}`,
    `DTEND:${icsTime(input.end)}`,
    `SUMMARY:${icsText(words.icsSummary(input.title, input.storeName))}`,
    `DESCRIPTION:${icsText(input.note)}`,
    ...(input.room ? [`LOCATION:${icsText(input.room)}`, `URL:${input.room}`] : []),
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(words.icsAlarm(input.title))}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

/**
 * What a buyer's calendar file says about joining, in the store's language:
 * the link, and the note on a video room made here, or that the link will come.
 */
export function buyerNote(words: BookingWords, store: Store, room: string | null): string {
  return room ? `${words.icsJoin(room)}${isVideoRoom(room) ? `\n\n${words.videoRoomNote}` : ""}` : words.icsWillSend(store.name);
}

/** Where a calendar file for a booking can be fetched again, from an email. */
export function icsLink(origin: string, store: Store, session: string): string {
  return `${origin}/api/store/ics?handle=${encodeURIComponent(store.handle)}&session_id=${encodeURIComponent(session)}`;
}

// ---- Confirming a booking ------------------------------------------------

function displayName(name: string): string {
  return name.replace(/["\\<>\r\n]/g, "").trim().slice(0, 60) || "A store";
}

export function senderAddress(): string {
  const match = NIMBUS_FROM.match(/<([^>]+)>/);
  return (match ? match[1] : NIMBUS_FROM).trim();
}

/** The From line of an email a buyer gets about a creator's call. */
export function storeSender(store: Store): string {
  return `"${displayName(store.name)} via Marktmorgen" <${senderAddress()}>`;
}

/**
 * Writes the booking down and sends the two emails, once.
 *
 * Called when the buyer comes back from paying. The session id is checked
 * against Stripe before this is reached, and the write is guarded so a page
 * refreshed ten times sends one pair of emails. The reminders a day and an
 * hour before are planned here too.
 */
export async function confirmBooking(input: {
  store: Store;
  product: CallListing;
  session: string;
  start: number;
  end: number;
  buyerEmail: string | null;
  /** The name the buyer gave Stripe, for the creator's webhooks. */
  buyerName?: string | null;
  buyerTz: string;
  /** How many times it was moved before this, when that is known. */
  moves?: number;
  /** The buyer's answers to the creator's questions, told to the creator. */
  answers?: Answer[];
  /** What was paid, in cents, for the creator's phone; left out when not known. */
  amountCents?: number | null;
  origin: string;
}): Promise<void> {
  const { store, product, session, start, end, buyerEmail, origin } = input;
  if (!isRedisConfigured() || !store.callsId) return;
  const [fresh] = await redisPipeline([["SET", confirmedKey(session), "1", "NX"]]);
  if (fresh === null) return;

  const entry: Entry = { s: start, e: end, until: 0, session, p: product.id };
  await redisPipeline([["HSET", busyKey(store.callsId), session, JSON.stringify(entry)]]);
  // Reminders are emails too, so the demo plans none (writesAboutBookings).
  if (writesAboutBookings(store)) {
    await planReminders(store.callsId, store.handle, session, start).catch((error) =>
      console.error("planning call reminders failed", error),
    );
  }
  await emitEvent(store, "call.booked", session, {
    checkout_session: session,
    product: { id: product.id, title: product.title },
    start: new Date(start).toISOString(),
    end: new Date(end).toISOString(),
    kind: product.call.kind === "live" ? "live_session" : product.call.seats > 1 ? "group_call" : "call",
    buyer: { email: buyerEmail, name: input.buyerName ?? null, timezone: input.buyerTz },
    answers: (input.answers ?? []).map((answer) => ({ question: answer.label, answer: answer.value })),
  }).catch((error) => console.error("queueing the call.booked webhook failed", error));
  // The creator's phone, when a device of theirs asked for bookings
  // (lib/phone-alerts.ts): what, when in their own time zone, and what was paid.
  // In the store's currency (lib/money.ts), which is what its calls are charged in.
  const paid = typeof input.amountCents === "number" && input.amountCents > 0 ? formatMoney(input.amountCents, store.currency) : "";
  await alertCreator(
    store,
    "booking",
    {
      title: paid ? `New booking: ${paid}` : "New booking",
      body: `${product.title} · ${readableTime(start, product.call.tz)}`,
      url: store.sid ? `/studio?store=${store.sid}` : "/studio",
    },
    { seed: session },
  ).catch((error) => console.error("a booking notification failed", error));
  // A Google Meet or Zoom meeting, when the product makes them: made now, on
  // the creator's account, so both emails carry its link, and made even
  // where email is off, since the pages show it too (lib/meet-links.ts). It
  // never holds the booking up: a failure gives the fallback link.
  const meeting = await callMeeting({ store, product, session, start, end, buyerEmail, buyerName: input.buyerName }).catch((error) => {
    console.error("making a booking's meeting failed", error);
    return null;
  });
  if (!writesAboutBookings(store)) return;

  const setup = product.call;
  const buyerTz = isTimeZone(input.buyerTz) ? input.buyerTz : setup.tz;
  // Made here, the first time it is needed, when the product makes rooms.
  const room = await roomOf(store.callsId, { product: product.id, setup, session, start, end });
  const video = isVideoRoom(room);
  const invite = (note: string, words?: BookingWords) =>
    Buffer.from(
      callInvite({ uid: session, start, end, title: product.title, storeName: store.name, room, note, sequence: (input.moves ?? 0) + (meeting?.updates ?? 0), words }),
    ).toString("base64");
  const minutes = Math.round((end - start) / 60_000);

  if (buyerEmail) {
    // The buyer's email speaks the store's language (lib/buyer-words/booking.ts).
    const b = bookingWords(store.language);
    const locale = LANGUAGES[parseLanguage(store.language)].locale;
    const hours = Math.max(setup.noticeHours, 1);
    await sendEmail({
      from: storeSender(store),
      to: buyerEmail,
      subject: b.bookedSubject(product.title, store.name),
      text: [
        setup.kind === "live" ? b.seatBooked(store.name) : setup.seats > 1 ? b.groupBooked(store.name) : b.callBooked(store.name),
        "",
        b.titleLength(product.title, minutes),
        `${readableTime(start, buyerTz, locale)} (${zoneName(start, buyerTz, locale)})`,
        "",
        room ? b.joinAtThatTime(room) : b.willSendLink(store.name),
        ...(video ? [b.videoRoomNote] : []),
        "",
        // The reminders planned above: each only while it is at least an hour away (lib/call-records.ts).
        `${b.calendarAttached}${
          start - Date.now() >= 25 * 3600_000 ? b.remindDayHour : start - Date.now() >= 2 * 3600_000 ? b.remindHour : ""
        }`,
        ...(canMove(setup, start, input.moves ?? 0) ? [b.moveYourself(hours, moveLink(origin, store, product.id, session))] : []),
        b.toCancel(store.name),
        "",
        `${store.name}${b.colon}${origin}/@${store.handle}`,
      ].join("\n"),
      // Replies reach the creator, which the studio tells them before they
      // offer a single call.
      replyTo: store.email,
      attachments: [{ filename: "call.ics", content: invite(buyerNote(b, store, room), b) }],
    });
  }

  await sendEmail({
    from: `"Marktmorgen" <${senderAddress()}>`,
    to: store.email,
    subject: `New booking: ${product.title}, ${readableTime(start, setup.tz)}`,
    text: [
      `${buyerEmail ?? "A buyer"} booked ${product.title} (${minutes} minutes) ${input.amountCents === 0 ? "as one session of a package they bought from you, so nothing more was charged" : "and paid on your Stripe account"}.`,
      "",
      ...(input.answers?.length
        ? ["What they answered before paying:", ...input.answers.map((answer) => `${answer.label}: ${answer.value}`), ""]
        : []),
      `${readableTime(start, setup.tz)} (${zoneName(start, setup.tz)}, your time zone)`,
      "",
      meeting ? meetingLine(meeting, setup.kind === "live" || setup.seats > 1) : room
        ? video
          ? `A private video room was made for ${setup.kind === "live" || setup.seats > 1 ? "this time" : "this booking"}, and they were given it: ${room}\n${VIDEO_ROOM_NOTE} Open it a few minutes early and sign in, so they are not left waiting.`
          : `They were given your meeting link: ${room}`
        : `You have not set a meeting link, so send them one before the call${buyerEmail ? ` at ${buyerEmail}` : ""}.`,
      ...(meeting && !meeting.made && video ? [VIDEO_ROOM_NOTE] : []),
      "",
      `${
        inGoogle(meeting)
          ? "It is already in your Google Calendar, so no calendar file is attached."
          : "The calendar file attached adds it to your calendar."
      } Every booking is also in your studio, under Upcoming calls${
        // The same reminders the buyer is told about: each only while it is still ahead.
        start - Date.now() >= 25 * 3600_000
          ? ", and you get a reminder with everyone booked a day and an hour before."
          : start - Date.now() >= 2 * 3600_000
            ? ", and you get a reminder with everyone booked an hour before."
            : "."
      }`,
    ].join("\n"),
    ...(buyerEmail ? { replyTo: buyerEmail } : {}),
    // A booking already in the creator's Google Calendar is not sent to it twice.
    ...(inGoogle(meeting)
      ? {}
      : { attachments: [{ filename: "call.ics", content: invite(`With ${buyerEmail ?? "your buyer"}.${room ? ` Join: ${room}` : ""}${video ? `\n\n${VIDEO_ROOM_NOTE}` : ""}`) }] }),
  });
}

/** Whether a booking's meeting is an event already in the creator's Google Calendar. */
function inGoogle(meeting: MeetRecord | null): boolean {
  return Boolean(meeting && meeting.made && meeting.provider === "google");
}

/** What the creator is told about the meeting made, or not made, for a booking. */
function meetingLine(meeting: MeetRecord, group: boolean): string {
  const what = group ? "this time" : "this booking";
  if (meeting.made) {
    return meeting.provider === "google"
      ? `A Google Meet link was made for ${what} on your Google Calendar, with them on the guest list, and they were given it: ${meeting.link}`
      : `A Zoom meeting was made for ${what} on your Zoom account, and they were given its join link: ${meeting.link}\nStart it as the host from Zoom, or with Start in Zoom next to the booking in your studio.`;
  }
  const name = meeting.provider === "google" ? "Google Meet" : "Zoom";
  return [
    `The ${name} link could not be made (${meeting.error || "no answer"}), so they were given ${meeting.link ? `this link instead: ${meeting.link}` : "no link: send them one before the call"}.`,
    meeting.todo === "create"
      ? `We try again over the next several hours; if it works while there are more than two hours to go, you and they are emailed the ${name} link.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Tells the people booked into a call that its Google Meet or Zoom link was
 * made after all, replacing the link they were given when it could not be
 * (lib/call-meetings.ts, after a later try worked). The calendar file counts
 * up its sequence, so it replaces the one sent before.
 */
export async function tellNewLink(input: {
  store: Store;
  product: CallListing;
  meeting: MeetRecord;
  previous: string;
  people: PaidCall[];
  origin: string;
}): Promise<number> {
  if (!writesAboutBookings(input.store)) return 0;
  const { store, product, meeting, previous, people, origin } = input;
  const setup = product.call;
  const name = meeting.provider === "google" ? "Google Meet" : "Zoom";
  let told = 0;
  // The buyers' emails speak the store's language (lib/buyer-words/booking.ts).
  const b = bookingWords(store.language);
  const locale = LANGUAGES[parseLanguage(store.language)].locale;
  for (const call of people) {
    if (!call.email) continue;
    const tz = isTimeZone(call.buyerTz) ? call.buyerTz : setup.tz;
    const note = b.icsJoin(meeting.link);
    const invite = Buffer.from(
      callInvite({ uid: call.session, start: call.start, end: call.end, title: product.title, storeName: store.name, room: meeting.link, note, sequence: call.moves + meeting.updates, words: b }),
    ).toString("base64");
    const sent = await sendEmail({
      from: storeSender(store),
      to: call.email,
      subject: b.newLinkSubject(product.title, store.name),
      text: [
        b.newLinkHead(product.title, store.name),
        "",
        `${readableTime(call.start, tz, locale)} (${zoneName(call.start, tz, locale)})`,
        "",
        b.joinOn(name, meeting.link),
        ...(previous ? [b.oldLink(previous)] : []),
        "",
        b.replacesFile,
        `${store.name}${b.colon}${origin}/@${store.handle}`,
        b.toCancel(store.name),
      ].join("\n"),
      replyTo: store.email,
      attachments: [{ filename: "call.ics", content: invite }],
      idempotencyKey: `meet-link:${meeting.scope}:${meeting.updates}:${call.session}`.slice(0, 256),
    }).catch(() => false);
    if (sent) told += 1;
  }
  await sendEmail({
    from: `"Marktmorgen" <${senderAddress()}>`,
    to: store.email,
    subject: `${name} link made: ${product.title}, ${readableTime(meeting.start, setup.tz)}`,
    text: [
      `The ${name} link for ${product.title} could not be made when ${people.length === 1 ? "it was booked" : "it was first booked"}, and it has been made now.`,
      "",
      `${readableTime(meeting.start, setup.tz)} (${zoneName(meeting.start, setup.tz)}, your time zone)`,
      `The ${name} link: ${meeting.link}`,
      ...(previous ? [`It replaces the link they were given before: ${previous}`] : []),
      "",
      `${told} ${told === 1 ? "person was" : "people were"} emailed the new link.`,
    ].join("\n"),
    idempotencyKey: `meet-link:${meeting.scope}:${meeting.updates}:creator`.slice(0, 256),
  }).catch(() => false);
  return told;
}
