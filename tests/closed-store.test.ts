/**
 * A store closing, end to end, in the in-memory Redis (added 18 October
 * 2026): the journey of tests/closing-journey.ts, which
 * scripts/test_closed_store_redis.py runs against a real Redis too. The file
 * store is an in-memory stand-in, never the real bucket.
 */
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { type Sent, type StripeWorld, runClosingJourney, standIns } from "./closing-journey";

const sent: Sent[] = [];
const stripe: StripeWorld = { sessions: [], memberships: [], posted: [] };
globalThis.fetch = standIns(stripe, sent, null);

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_closed_store_only_a_stand_in";
  process.env.RESEND_API_KEY = "re_test_closed_store_only_a_stand_in";
  part("A store with every family closes, and another stays");
  await runClosingJourney(is, sent, stripe);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
