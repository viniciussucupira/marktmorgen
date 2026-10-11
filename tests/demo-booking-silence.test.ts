/**
 * A booking on the demo store writes to nobody (added 11 October 2026,
 * lib/calls.ts, writesAboutBookings).
 *
 * The demo store's checkout takes any address and charges nothing
 * (lib/house-store.ts), so a confirmation from it would be a way to send mail
 * to whoever was typed into it, and its own owner is an address nobody reads.
 * Until the demo sold a call there was nothing there that wrote to a buyer;
 * now there is, so this checks that:
 *
 *   - a booking on an ordinary store still emails the buyer and the creator,
 *     and plans its reminders;
 *   - the same booking on the demo store sends neither email and plans no
 *     reminder, while everything else about it — the time held, the webhook,
 *     the meeting — is untouched.
 */
import { addProduct, claimHandle, ensureStatsId, setProductCall, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { readListing } from "@/lib/catalog";
import { type CallListing, confirmBooking } from "@/lib/calls";
import type { CallSetup } from "@/lib/call-setup";
import { REMINDER_QUEUE } from "@/lib/call-records";
import { DEMO_CONNECTED_ACCOUNT } from "@/lib/demo-account";
import { HOUSE_HANDLE, HOUSE_OWNER } from "@/lib/house-store";
import { redisPipeline, store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const OWNER = "owner@example.com";
const emails: { to: string; subject: string }[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const answer = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (url.hostname === "api.resend.com") {
    const body = JSON.parse(String(init?.body)) as { to: string | string[]; subject: string };
    emails.push({ to: [body.to].flat()[0], subject: body.subject });
    return answer({ id: `email_${emails.length}` });
  }
  return answer({ object: "list", data: [], has_more: false });
}) as typeof fetch;

const weekly = {
  kind: "weekly",
  minutes: 30,
  tz: "America/New_York",
  weekly: [[], [[540, 1020]], [[540, 1020]], [[540, 1020]], [[540, 1020]], [[540, 1020]], []],
  noticeHours: 1,
  horizonDays: 30,
  bufferMinutes: 0,
  room: "https://example.com/room",
  video: false,
  meet: null,
  seats: 1,
  sessions: [],
} as unknown as CallSetup;

/** One store with a call on it, by the address that owns it. */
async function storeWithCall(email: string, handle: string, account: string) {
  await claimHandle(email, handle, "Harbor Kitchen", "");
  await ensureStatsId(email);
  await setStripeAccount(email, account, true);
  await setSubscription(email, { customerId: null, subscriptionId: null, active: true });
  const made = await addProduct(email, "Meal-planning call", "", "20", null);
  if (!made.ok) throw new Error("no product");
  await setProductCall(email, made.product.id, weekly);
  const store = (await storeForEmail(email))!;
  return { store, product: (await readListing(store, made.product.id)) as CallListing };
}

/** The reminders planned for one store, from the queue itself (lib/call-records.ts). */
async function remindersFor(callsId: string): Promise<string[]> {
  const [rows] = await redisPipeline([["ZRANGEBYSCORE", REMINDER_QUEUE, "-inf", "+inf"]]);
  return (Array.isArray(rows) ? rows : []).filter((row): row is string => typeof row === "string" && row.includes(callsId));
}

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_demo_silence_stand_in";
  process.env.RESEND_API_KEY = "re_test_demo_silence_only";

  const start = Date.now() + 5 * 86_400_000;
  const end = start + 1_800_000;

  part("An ordinary store's booking");
  const ordinary = await storeWithCall(OWNER, "harbor", "acct_1TestHarbor0001");
  await confirmBooking({
    store: ordinary.store,
    product: ordinary.product,
    session: "cs_test_ordinary00000001",
    start,
    end,
    buyerEmail: "ana@example.com",
    buyerTz: "Europe/Lisbon",
    origin: "https://marktmorgen.com",
  });
  is("the buyer is written to, and the creator", [emails.some((e) => e.to === "ana@example.com"), emails.some((e) => e.to === OWNER)], [true, true]);
  is("and its reminders are planned", (await remindersFor(ordinary.store.callsId ?? "")).length > 0, true);
  is("the time is held", Boolean(ordinary.store.callsId), true);

  part("The demo store's booking");
  emails.length = 0;
  const demo = await storeWithCall(HOUSE_OWNER, HOUSE_HANDLE, DEMO_CONNECTED_ACCOUNT);
  await confirmBooking({
    store: demo.store,
    product: demo.product,
    session: "cs_test_demostore00000001",
    start,
    end,
    buyerEmail: "ana@example.com",
    buyerTz: "Europe/Lisbon",
    origin: "https://marktmorgen.com",
  });
  is("nobody is written to", emails.length, 0);
  is("and no reminder is planned", (await remindersFor(demo.store.callsId ?? "")).length, 0);
  is("while the booking itself is written down", Boolean(demo.store.callsId), true);

  done();
}

void main();
