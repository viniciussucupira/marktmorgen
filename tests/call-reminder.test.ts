/**
 * A reminder of a call left at its checkout (added 10 October 2026,
 * lib/calls.ts and lib/checkout-recovery.ts). What is checked:
 *
 *   - a store with reminders on opens a call's checkout asking Stripe for the
 *     buyer's consent, and keeps the call's own closing time, which the hold
 *     is counted from; a store without asks nothing; an account Stripe will
 *     not ask for still sells the call;
 *   - a call left with Stripe's yes gets one email that names the time the
 *     buyer picked, in their own time zone, says it was not kept, and leads
 *     to the times still open, at today's price;
 *   - never for a session from a package, never twice in a week, never after
 *     the buyer has booked it since, and never when no time is left to book.
 */
import { addProduct, claimHandle, ensureStatsId, setProductCall, setRecovery, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { readListing } from "@/lib/catalog";
import { type CallListing, PAST_CALL_DAYS, busyTimes, holdAndCheckout, slotsForProduct } from "@/lib/calls";
import { fieldReleaseBytes, orderWrite } from "@/lib/order-data";
import { dataUsed } from "@/lib/store-data";
import type { CallSetup } from "@/lib/call-setup";
import { bookLink, remindAbandoned } from "@/lib/checkout-recovery";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

const OWNER = "owner@example.com";
const checkouts: URLSearchParams[] = [];
const emails: { to: string; subject: string; text: string }[] = [];
let paidSessions: Record<string, unknown>[] = [];
let refuseConsent = false;
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const method = init?.method ?? "GET";
  const answer = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (url.hostname === "api.resend.com") {
    const body = JSON.parse(String(init?.body)) as { to: string | string[]; subject: string; text: string };
    emails.push({ to: [body.to].flat()[0], subject: body.subject, text: body.text });
    return answer({ id: `email_${emails.length}` });
  }
  const path = url.pathname.replace(/^\/v1/, "");
  if (path === "/checkout/sessions" && method === "POST") {
    const body = new URLSearchParams(String(init?.body));
    checkouts.push(body);
    if (refuseConsent && body.has("consent_collection[promotions]")) {
      return answer({ error: { type: "invalid_request_error", message: "consent_collection[promotions] is not available for this account." } }, 400);
    }
    return answer({ id: `cs_test_${String(checkouts.length).padStart(24, "c")}`, url: "https://checkout.stripe.com/c/pay/test" });
  }
  if (path === "/checkout/sessions" && method === "GET") {
    // A call's times read paid calls; the reminder asks whether this address paid since.
    return answer({ object: "list", data: url.searchParams.get("customer_details[email]") ? paidSessions : [], has_more: false });
  }
  if (method === "GET") return answer({ object: "list", data: [], has_more: false });
  return answer({ error: { message: `no stand-in for ${method} ${path}` } }, 404);
}) as typeof fetch;

const weekly = {
  kind: "weekly",
  minutes: 60,
  tz: "America/New_York",
  weekly: [[[540, 1020]], [[540, 1020]], [[540, 1020]], [[540, 1020]], [[540, 1020]], [[540, 1020]], [[540, 1020]]],
  noticeHours: 12,
  horizonDays: 30,
  bufferMinutes: 0,
  room: "https://example.com/room",
  video: false,
  meet: null,
  seats: 1,
  sessions: [],
} as unknown as CallSetup;

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_call_reminder_stand_in";
  process.env.RESEND_API_KEY = "re_test_call_reminder_only";

  await claimHandle(OWNER, "harbor", "Harbor Kitchen", "");
  await ensureStatsId(OWNER);
  await setStripeAccount(OWNER, "acct_1TestHarbor0001", true);
  await setSubscription(OWNER, { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, period: paidPeriod() });
  const made = await addProduct(OWNER, "Coaching Call", "", "120", null);
  if (!made.ok) throw new Error("no product");
  const id = made.product.id;
  await setProductCall(OWNER, id, weekly);
  const load = async () => {
    const store = (await storeForEmail(OWNER))!;
    return { store, product: (await readListing(store, id)) as CallListing };
  };
  let { store, product } = await load();
  const offer = await slotsForProduct(store, product);
  // Each checkout holds its time, so each one here picks another.
  const starts = offer?.days.flatMap((day) => day.starts) ?? [];
  if (starts.length < 4) throw new Error("no open times");
  const start = starts[0];
  let next = 0;
  const hold = async () => {
    checkouts.length = 0;
    ({ store, product } = await load());
    next += 1;
    return holdAndCheckout({ store, product: product as never, start: starts[next], buyerTz: "Europe/Lisbon", origin: "https://marktmorgen.com" });
  };

  part("The checkout of a call");
  is("without reminders: Stripe is asked nothing", [(await hold()).ok, checkouts[0].get("consent_collection[promotions]")], [true, null]);
  await setRecovery(OWNER, { enabled: true, address: "1 Main St, Austin, TX 78701", asks: true });
  const asked = await hold();
  is("with them: Stripe asks for consent, and keeps the address if the buyer leaves", [asked.ok, checkouts.at(-1)?.get("consent_collection[promotions]"), checkouts.at(-1)?.get("after_expiration[recovery][enabled]")], [true, "auto", "true"]);
  is("and the call keeps its own closing time", Number(checkouts.at(-1)?.get("expires_at")) > 0, true);
  refuseConsent = true;
  const refused = await hold();
  refuseConsent = false;
  is("an account Stripe will not ask for still sells the call, without asking", [refused.ok, checkouts.length, checkouts.at(-1)?.get("consent_collection[promotions]"), Number(checkouts.at(-1)?.get("expires_at")) > 0], [true, 2, null, true]);

  part("A call left with Stripe's yes");
  const now = Math.floor(Date.now() / 1000);
  const left = (session: string, over: Record<string, unknown> = {}) => ({
    id: session,
    object: "checkout.session",
    status: "expired",
    payment_status: "unpaid",
    created: now - 2000,
    expires_at: now - 100,
    consent: { promotions: "opt_in" },
    customer_details: { email: "ana@example.com" },
    metadata: { store: "harbor", product: id, kind: "call", start: String(start), end: String(start + 3_600_000), tz: "Europe/Lisbon" },
    ...over,
  });
  ({ store } = await load());
  is("not without the yes", await remindAbandoned(store, left("cs_test_callnoyes00001", { consent: { promotions: "opt_out" } }) as never), "skip");
  is("not for a session from a package", await remindAbandoned(store, left("cs_test_callpkg000001", { metadata: { ...left("x").metadata, package: "pk_1" } }) as never), "skip");
  is("with it: one email", await remindAbandoned(store, left("cs_test_callleft00001") as never), "sent");
  const mail = emails.at(-1)!;
  const when = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Lisbon", hour: "numeric", minute: "2-digit" }).format(new Date(start));
  is("to the buyer, about the time they picked", [mail.to, mail.subject], ["ana@example.com", "Your time for Coaching Call is not booked yet"]);
  is("naming the time in their own zone, and that it was not kept", [mail.text.includes(when), mail.text.includes("did not finish paying, so nothing was charged and the time was not kept for you")], [true, true]);
  is("leading to the times still open, at today's price", [mail.text.includes(bookLink(store, id)), mail.text.includes("The price: $120.")], [true, true]);
  is("with why it came, the stop link and the creator's address", [mail.text.includes("you agreed, on the checkout page"), mail.text.includes("Stop these reminders"), mail.text.includes("1 Main St, Austin, TX 78701")], [true, true, true]);
  is("never twice in a week", await remindAbandoned(store, left("cs_test_callleft00002") as never), "skip");
  paidSessions = [{ id: "cs_test_callpaid00001", status: "complete", payment_status: "paid", metadata: { store: "harbor", product: id, kind: "call" } }];
  is("nor to somebody who has booked it since", await remindAbandoned(store, left("cs_test_callleft00003", { customer_details: { email: "ben@example.com" } }) as never), "skip");
  paidSessions = [];
  await setProductCall(OWNER, id, { ...weekly, weekly: [[], [], [], [], [], [], []] } as unknown as CallSetup);
  ({ store } = await load());
  is("nor when no time is left to book", await remindAbandoned(store, left("cs_test_callleft00004", { customer_details: { email: "cy@example.com" } }) as never), "skip");

  part("A call long over leaves the diary, and gives its room back");
  ({ store } = await load());
  const diary = `nl:call:busy:${store.callsId}`;
  const ended = (days: number) => Date.now() - days * 86_400_000;
  const oldLine = JSON.stringify({ s: ended(PAST_CALL_DAYS + 10) - 3_600_000, e: ended(PAST_CALL_DAYS + 10), until: 0, session: "cs_test_longago000001", p: id });
  const recentLine = JSON.stringify({ s: ended(10) - 3_600_000, e: ended(10), until: 0, session: "cs_test_recent0000001", p: id });
  await orderWrite(store, [["HSET", diary, "cs_test_longago000001", oldLine], ["HSET", diary, "cs_test_recent0000001", recentLine]]);
  const before = (await dataUsed(store))!.orders;
  await busyTimes(store);
  is("the call that ended more than PAST_CALL_DAYS ago is let go; the recent one stays", [redis.run(["HEXISTS", diary, "cs_test_longago000001"]), redis.run(["HEXISTS", diary, "cs_test_recent0000001"])], [0, 1]);
  is("and what its line took is given back, never more", (await dataUsed(store))!.orders, before - fieldReleaseBytes("cs_test_longago000001", oldLine));
  await busyTimes(store);
  is("given back once", (await dataUsed(store))!.orders, before - fieldReleaseBytes("cs_test_longago000001", oldLine));

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
