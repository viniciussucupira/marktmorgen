/**
 * MM-SA-05: a stranger could spend a store's access emails, and its buyers
 * then got no link to what they had bought.
 *
 * A store's "transactional" figure (lib/store-allowance-rules.ts) is the
 * emails that hand a buyer what they have: a link to their course, their
 * purchases, a private podcast, the community. The same figure paid for the
 * confirmations sent to whatever address a visitor types on the store's page
 * (the sign-up box, a waitlist, the affiliate form). Those are limited by the
 * hour, per connection and per address, and nothing else: from a handful of
 * machines, or from one with many addresses of the new kind, a script could
 * spend the month's figure on made-up addresses, and every buyer who asked
 * for their link afterward was sent nothing until the month turned.
 *
 * Proved against a real Redis: confirmations from two hundred connections,
 * to two hundred addresses, on a creator store. A buyer's course link must
 * still be sent afterward.
 */
import { claimHandle, ensureListId, ensureStatsId, ensureStoreId, setJoin, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { askToJoin } from "@/lib/store-join";
import { sendCourseLink } from "@/lib/learn";
import { allowanceFor } from "@/lib/store-allowance-rules";
import type { Listing } from "@/lib/catalog";
import { paidPeriod } from "../billing-period-fixture";
import { check, finish } from "./check";

const sent: string[] = [];
const real = globalThis.fetch;
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input instanceof Request ? input.url : input));
  if (String(url).startsWith(String(process.env.UPSTASH_REDIS_REST_URL))) return real(input as string, init);
  if (url.hostname === "api.resend.com") {
    sent.push(String((JSON.parse(String(init?.body)) as { to?: unknown }).to));
    return new Response(JSON.stringify({ id: `email_${sent.length}` }), { status: 200 });
  }
  if (url.hostname === "api.stripe.com") return new Response(JSON.stringify({ object: "list", data: [], has_more: false }), { status: 200 });
  throw new Error(`no network in this check: ${url.hostname}`);
}) as typeof fetch;

async function main(): Promise<void> {
  process.env.NIMBUS_DATA_KEY ??= "tests-only-not-a-real-deployment-secret";
  process.env.RESEND_API_KEY = "re_test_security_journey_only_a_stand_in";
  const owner = "owner@access-email.example";
  await claimHandle(owner, "access-email", "Access Email Courses", "");
  await ensureStatsId(owner);
  await ensureStoreId(owner);
  await ensureListId(owner);
  await setStripeAccount(owner, "acct_1AccessEmailXX", true);
  await setSubscription(owner, { customerId: "cus_accessemail", subscriptionId: "sub_accessemail", active: true, tier: "creator", period: paidPeriod() });
  await setJoin(owner, { on: true });
  const store = (await storeForEmail(owner))!;
  const figure = allowanceFor(store, "transactional");

  // Two hundred connections each ask the sign-up box once, for an address of its own.
  let confirmations = 0;
  for (let i = 0; i < 200; i += 1) {
    const answer = await askToJoin({ store, email: `made.up.${i}@example.com`, ip: `198.18.${Math.floor(i / 250)}.${i % 250}`, origin: "https://marktmorgen.com" });
    if (answer === "sent") confirmations += 1;
  }
  check("the confirmations took some of the store's access emails", confirmations > 0, true);
  check("but not the whole month of them", confirmations < figure, true);

  // A buyer of a course asks for the way in.
  const course = { id: "c0urse0000", title: "Watercolor basics" } as unknown as Listing;
  const buyer = await sendCourseLink(store, course, "buyer@example.com", "https://marktmorgen.com");
  check("a buyer is still sent the link to their course", [buyer, sent.includes("buyer@example.com")], [true, true]);
  finish();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
