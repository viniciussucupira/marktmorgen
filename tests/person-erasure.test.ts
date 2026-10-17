/**
 * Deleting one person from a store (lib/person-erasure.ts; ClickFunnels
 * audit F64 and F28, added 17 October 2026), in the in-memory Redis: the
 * journey of tests/erasure-journey.ts, which scripts/test_contact_erasure_redis.py
 * runs against a real Redis too, and the arithmetic of what it costs.
 *
 *   - the person, put in every part of a store, is deleted by their own
 *     emailed link, and the store holds everything it held before them,
 *     except a one-way fingerprint and the counts that paid for it;
 *   - they are never emailed again, no import brings them back, and only
 *     their own yes, given again, does;
 *   - the studio's door keeps their reviews and what an import gave them;
 *   - what an erasure sends is no more than it counts, and what it takes
 *     from the studio figure covers that at the prices the plans are held to.
 */
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { type Sent, runJourney } from "./erasure-journey";
import { ERASE_BASE_UNITS, ERASE_STUDIO_UNITS, erasureUnits, erasureWork } from "@/lib/erasure-rules";
import { ERASE_ROLE_CALLS } from "@/lib/discord-access";
import { MAX_PRODUCTS } from "@/lib/catalog-rules";
import { UNIT_COST, request } from "./plan-cost-registry";

const sent: Sent[] = [];
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input instanceof Request ? input.url : input));
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (url.hostname === "api.resend.com") {
    type One = { to: string | string[]; subject: string; text?: string };
    const body = JSON.parse(String(init?.body)) as One | One[];
    for (const m of Array.isArray(body) ? body : [body]) sent.push({ to: [m.to].flat()[0], subject: m.subject, text: m.text ?? "" });
    return json(Array.isArray(body) ? { data: (body as One[]).map((_, i) => ({ id: `email_${i}` })) } : { id: `email_${sent.length}` });
  }
  if (url.hostname.endsWith("stripe.com")) return json({ object: "list", data: [], has_more: false });
  return realFetch(input as string, init);
}) as typeof fetch;

const counted = { commands: 0, bytes: 0, on: false };
const pipeline = redis.pipeline.bind(redis);
redis.pipeline = (async (commands: (string | number)[][]) => {
  const reply = await pipeline(commands);
  if (counted.on) {
    counted.commands += commands.length;
    counted.bytes += JSON.stringify(commands).length + JSON.stringify(reply).length;
  }
  return reply;
}) as typeof redis.pipeline;

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_person_erasure_only_a_stand_in";
  process.env.RESEND_API_KEY = "re_test_person_erasure_only_a_stand_in";

  part("A person in every part of a store, deleted");
  await runJourney(is, sent, counted);

  part("What it takes covers what it costs");
  // One studio unit, as the plans are priced (tests/plan-cost-registry.ts).
  const unit = UNIT_COST.studio;
  // The erasure's own request, at the shape of one that writes many records, and each role taken back in Discord, waited on.
  const fixed = request("write", 0, 0) + ERASE_ROLE_CALLS * request("wait", 0, 0);
  is("the base units cover the request itself and Discord", ERASE_BASE_UNITS * unit >= fixed, true);
  for (const size of [{}, { products: 30, courses: 3, lessons: 60, deals: 200, conversations: 80, dmConversations: 40, roomMessages: 500, events: 20, certificates: 300 }, { products: MAX_PRODUCTS, courses: 20, lessons: 4_000, deals: 1_000, conversations: 500, dmConversations: 600, roomMessages: 500, events: 500, certificates: 10_000 }]) {
    const work = erasureWork(size);
    const cost = request("write", work.commands, work.bytes) + ERASE_ROLE_CALLS * request("wait", 0, 0);
    is(`units cover ${work.commands} commands and ${work.bytes} bytes`, erasureUnits(size) * unit >= cost, true);
  }
  is("the least a deletion takes is what the help says", ERASE_STUDIO_UNITS, erasureUnits({}));

  done();
}

void main();
