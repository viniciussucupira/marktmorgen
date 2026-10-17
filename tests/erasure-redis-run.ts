/**
 * The deletion journey (tests/erasure-journey.ts) against a real Redis,
 * built with the real "@/lib/redis" by scripts/test_contact_erasure_redis.py,
 * which serves Upstash's REST pipeline in front of a dedicated, empty Redis
 * database and tears it down after. Not a *.test.ts: npm test does not run
 * it, the product checks' Redis job does.
 */
import { type Sent, runJourney } from "./erasure-journey";

const sent: Sent[] = [];
const counted = { commands: 0, bytes: 0, on: false };
const realFetch = globalThis.fetch;
const proxy = String(process.env.UPSTASH_REDIS_REST_URL ?? "");
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input instanceof Request ? input.url : input));
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (url.hostname === "api.resend.com") {
    type One = { to: string | string[]; subject: string; text?: string };
    const body = JSON.parse(String(init?.body)) as One | One[];
    for (const m of Array.isArray(body) ? body : [body]) sent.push({ to: [m.to].flat()[0], subject: m.subject, text: m.text ?? "" });
    return json(Array.isArray(body) ? { data: (body as One[]).map((_, i) => ({ id: `email_${i}` })) } : { id: `email_${sent.length}` });
  }
  if (url.hostname.endsWith("stripe.com") || url.hostname.endsWith("vercel-storage.com") || url.hostname.endsWith("vercel.com")) return json({ object: "list", data: [], has_more: false });
  if (!proxy || !String(url).startsWith(proxy)) throw new Error(`no network in this check: ${url.hostname}`);
  const reply = await realFetch(input as string, init);
  if (counted.on) {
    const text = await reply.clone().text();
    const commands = JSON.parse(String(init?.body)) as unknown[];
    counted.commands += commands.length;
    counted.bytes += String(init?.body).length + text.length;
  }
  return reply;
}) as typeof fetch;

let checks = 0;
let failures = 0;
const is = (what: string, got: unknown, want: unknown) => {
  checks += 1;
  if (JSON.stringify(got) === JSON.stringify(want)) {
    console.log(`PASS: ${what}`);
    return;
  }
  failures += 1;
  console.log(`FAIL: ${what}\n      expected ${JSON.stringify(want)}\n      got      ${JSON.stringify(got)}`);
};

async function main(): Promise<void> {
  process.env.STRIPE_SECRET_KEY = "sk_test_person_erasure_only_a_stand_in";
  process.env.RESEND_API_KEY = "re_test_person_erasure_only_a_stand_in";
  await runJourney(is, sent, counted);
  console.log(failures ? `${checks} checks, ${failures} failing.` : `${checks} checks, all passing.`);
  process.exit(failures ? 1 : 0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
