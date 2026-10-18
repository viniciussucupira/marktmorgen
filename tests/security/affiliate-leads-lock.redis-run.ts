/**
 * MM-SA-09: an affiliate's leads decided by read, change and write, with
 * nothing between.
 *
 * A creator's decision on leads (lib/affiliate-leads.ts, decideLeads) read
 * the program's leads, judged them and wrote the chosen ones back whole; a
 * person asking to be deleted (forgetLeadPerson) read their lead and wrote
 * it back without the address. Nothing held either hand off the other, so:
 *
 *   - an approval that had read a lead before the person's deletion wrote
 *     the lead back with that person's address on it, undoing the deletion;
 *   - a deletion that had read a lead before its approval wrote it back open,
 *     and the affiliate's approved commission was lost;
 *   - an approval that had read a lead before a team member reversed it as
 *     not genuine wrote it back approved, and a lead marked fake was paid.
 *
 * Proved against a real Redis: each slow hand is held at its read while the
 * other writes, and the record must end as the two decisions taken in turn
 * would leave it.
 */
import { claimHandle, ensureStatsId, setAffiliateSetting, setSubscription, storeForEmail } from "@/lib/store";
import { NO_AFFILIATES } from "@/lib/affiliate-setting";
import { type LeadRecord, leadsKey } from "@/lib/affiliate-lead-rules";
import { decideLeads, forgetLeadPerson, leadId, readLeads } from "@/lib/affiliate-leads";
import { redisPipeline } from "@/lib/redis";
import { paidPeriod } from "../billing-period-fixture";
import { check, finish } from "./check";

const slow = { leadsRead: 0, leadRead: 0 };
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const real = globalThis.fetch;
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = String(input instanceof Request ? input.url : input);
  if (url.startsWith(String(process.env.UPSTASH_REDIS_REST_URL))) {
    const body = String(init?.body);
    // The read a slow decision starts from, held while another hand writes.
    if (slow.leadsRead && body.includes('"HGETALL","nl:aff:')) {
      const hold = slow.leadsRead;
      slow.leadsRead = 0;
      const reply = await real(input as string, init);
      await wait(hold);
      return reply;
    }
    // The read a slow deletion starts from.
    if (slow.leadRead && body.includes('"HGET","nl:aff:')) {
      const hold = slow.leadRead;
      slow.leadRead = 0;
      const reply = await real(input as string, init);
      await wait(hold);
      return reply;
    }
    return real(input as string, init);
  }
  throw new Error(`no network in this check: ${new URL(url).hostname}`);
}) as typeof fetch;

const ANA = "aaaaaaaaaaaa";
const NOW = Math.floor(Date.now() / 1000);
const DAY = 86_400;

/** A sign-up lead Ana was credited for 20 days ago, past its 14-day hold: it needs the creator's approval. */
const lead = (statsId: string, email: string, offset: number): LeadRecord => ({
  id: leadId(statsId, email),
  aff: ANA,
  kind: "signup",
  at: NOW - 20 * DAY + offset,
  end: 0,
  ref: "",
  pi: "",
  paid: 0,
  title: "",
  email,
  cents: 300,
  currency: "usd",
  hold: 14,
  daily: 5,
  budget: 10_000,
  state: "open",
  d: 0,
  why: "",
});

async function main(): Promise<void> {
  process.env.NIMBUS_DATA_KEY ??= "tests-only-not-a-real-deployment-secret";
  const owner = "owner@leads-lock.example";
  await claimHandle(owner, "leads-lock", "Leads Lock Kitchen", "");
  await ensureStatsId(owner);
  await setSubscription(owner, { customerId: "cus_leadslock", subscriptionId: "sub_leadslock", active: true, tier: "creator", trialEnds: 0, period: paidPeriod() });
  await setAffiliateSetting(owner, { ...NO_AFFILIATES, enabled: true, lead: { kind: "signup", cents: 300, hold: 14, daily: 5, budget: 10_000 } });
  const store = (await storeForEmail(owner))!;
  const statsId = store.statsId!;
  const dana = lead(statsId, "dana@example.com", 0);
  const eve = lead(statsId, "eve@example.com", 60);
  // Two hours after the others: an hour holds a quarter of the day's five leads (lib/affiliate-lead-rules.ts, hourlyLeads).
  const finn = lead(statsId, "finn@example.com", 2 * 3_600);
  await redisPipeline([dana, eve, finn].map((l) => ["HSET", leadsKey(statsId), l.id, JSON.stringify(l)]));
  const kept = async (id: string) => (await readLeads(store)).find((l) => l.id === id);

  // 1. Dana asks to be deleted while the creator's approval of her lead is in flight.
  slow.leadsRead = 600;
  const approving = decideLeads(store, [dana.id], "approve");
  await wait(150);
  const forgotten = await forgetLeadPerson(store, "Dana@example.com");
  const approved = await approving;
  const afterDana = await kept(dana.id);
  check("the deletion happened, and the approval of the lead was made", [forgotten, approved.ok], [1, true]);
  check("a person's address deleted while their lead was being approved stays deleted", afterDana?.email, "");
  check("and the lead stays approved, as the affiliate's money record", afterDana?.state, "approved");

  // 2. The creator approves Eve's lead while Eve's deletion is in flight.
  slow.leadRead = 600;
  const forgetting = forgetLeadPerson(store, "eve@example.com");
  await wait(150);
  const approvedEve = await decideLeads(store, [eve.id], "approve");
  const forgotEve = await forgetting;
  const afterEve = await kept(eve.id);
  check("an approval made while the person's deletion was in flight is not written back open", [approvedEve.ok, forgotEve, afterEve?.state, afterEve?.email], [true, 1, "approved", ""]);

  // 3. A team member reverses Finn's lead as fake while the creator's approval of it is in flight.
  slow.leadsRead = 600;
  const approvingFinn = decideLeads(store, [finn.id], "approve");
  await wait(150);
  const reversed = await decideLeads(store, [finn.id], "reverse", "fake");
  await approvingFinn;
  const afterFinn = await kept(finn.id);
  check("a lead reversed as not genuine while its approval was in flight is not paid", [reversed.ok, afterFinn?.state, afterFinn?.why], [true, "reversed", "fake"]);

  finish();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
