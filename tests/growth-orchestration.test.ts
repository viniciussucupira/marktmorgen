import { NextRequest } from "next/server";
import { validCrmDate, readFollowUp, dealFollowUps, DEFAULT_STAGES, parseDeal } from "@/lib/crm-rules";
import { reviewFunnel } from "@/lib/funnel-review";
import { growthActions, growthGoal } from "@/lib/growth-plan";
import { claimHandle, createStore, ensureStoreId, ensureStatsId, storeForEmail, storeForId } from "@/lib/store";
import { SESSION_COOKIE, openSession } from "@/lib/auth";
import { POST } from "@/app/api/store/crm/route";
import { putMember, removeMember } from "@/lib/team";
import { readDeals } from "@/lib/crm";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

async function main() {
  part("Calendar dates and action queues");
  is("leap date allowed", validCrmDate("2028-02-29"), true);
  is("overflow date refused", validCrmDate("2026-02-30"), false);
  is("non-leap date refused", validCrmDate("2026-02-29"), false);
  is("date requires action", readFollowUp({ dueDate: "2026-10-14" }).ok, false);
  is("too long action refused", readFollowUp({ nextAction: "x".repeat(201) }).ok, false);
  const sample = parseDeal({ id: "abcdefghij", title: "Proposal", stage: "lead00", nextAction: "Call", dueDate: "2026-10-12", updatedAt: 10 }, DEFAULT_STAGES)!;
  const queue = dealFollowUps(DEFAULT_STAGES, [sample, { ...sample, id: "bbbbbbbbbb", dueDate: "2026-10-13" }, { ...sample, id: "cccccccccc", dueDate: "2026-10-14" }, { ...sample, id: "dddddddddd", nextAction: "", dueDate: "" }, { ...sample, id: "eeeeeeeeee", stage: "won000" }], "2026-10-13");
  is("only open deals queued", [queue.overdue.length, queue.today.length, queue.upcoming.length, queue.unplanned.length], [1,1,1,1]);

  part("Funnel review does not invent conversion explanations");
  const step = { title: "Course", open: true, why: "", product: true, free: false, seen: 50, done: 4 };
  is("empty not ready", reviewFunnel([]).ready, false);
  is("hidden step surfaced", reviewFunnel([step, { ...step, open: false, why: "Draft" }]).issues.length, 1);
  is("insufficient traffic explicit", reviewFunnel([{ ...step, seen: 2, done: 1 }]).observation?.includes("More visits"), true);
  is("inconsistent estimates not converted to rate", reviewFunnel([{ ...step, done: 60 }]).observation, null);
  is("unknown counts surfaced", reviewFunnel([{ ...step, seen: Number.NaN }]).issues.length, 1);
  is("observations state uncertainty", reviewFunnel([step]).observation?.includes("do not explain why"), true);

  part("Plans respect the current role");
  is("unrecognized goal defaults safely", growthGoal("constructor"), "sales");
  is("support cannot send or edit funnels", growthActions("leads", "support").length, 0);
  is("support can follow up opportunities", growthActions("services", "support").map(a => a.path), ["deals"]);
  is("editor has no campaign sending action", growthActions("leads", "editor").some(a => a.need === "send"), false);

  part("Actions through the guarded CRM route");
  redis.clear(); process.env.UPSTASH_REDIS_REST_URL ??= "http://stub";
  const owner = "growth@example.com";
  await claimHandle(owner, "growthshop", "Growth Shop", ""); await ensureStatsId(owner); await ensureStoreId(owner);
  const session = await openSession(owner);
  const call = async (body: Record<string, unknown>, store = "", origin = "https://marktmorgen.com") => {
    const response = await POST(new NextRequest("https://marktmorgen.com/api/store/crm", { method: "POST", headers: { host: "marktmorgen.com", "content-type": "application/json", cookie: SESSION_COOKIE + "=" + session, origin, ...(store ? { "x-nimbus-store": store } : {}) }, body: JSON.stringify(body) }));
    return { status: response.status, body: await response.json() };
  };
  const made = await call({ action: "deal", deal: { title: "Proposal", stage: "lead00", nextAction: "Call", dueDate: "2026-10-15", assignee: owner } });
  is("creation request accepted", [made.status, made.body.error ?? null], [200, null]);
  if (!made.body.deal) throw new Error("Creation refused: " + JSON.stringify(made));
  is("action and assignee kept", [made.body.ok, made.body.deal.nextAction, made.body.deal.assignee], [true,"Call",owner]);
  const moved = await call({ action: "deal", deal: { id: made.body.deal.id, title: "Proposal", stage: "talk00" } });
  is("stage move preserves planning", [moved.body.deal.dueDate, moved.body.deal.nextAction], ["2026-10-15", "Call"]);
  is("invalid date refused", (await call({ action: "deal", deal: { ...made.body.deal, dueDate: "2026-02-30" } })).body.error, "date");
  is("outsider assignee refused", (await call({ action: "deal", deal: { ...made.body.deal, assignee: "outsider@example.com" } })).body.error, "assignee");
  is("other store refused", (await call({ action: "deal", deal: made.body.deal }, "f".repeat(32))).status, 409);
  is("cross-site write refused", (await call({ action: "deal", deal: made.body.deal }, "", "https://other.example")).status, 403);
  const cleared = await call({ action: "deal", deal: { ...made.body.deal, nextAction: "", dueDate: "", assignee: "" } });
  is("explicit clearing allowed", cleared.body.deal.dueDate, "");
  const store = (await storeForEmail(owner))!;
  is("still one opportunity", (await readDeals(store.statsId, DEFAULT_STAGES)).length, 1);
  const other = await createStore(owner, "growthsecond", "Second store", "");
  if (!other.ok) throw new Error("Could not create second fixture store");
  const secondary = await call({ action: "deal", deal: { title: "Second proposal", stage: "lead00" } }, other.store.sid);
  is("second store writes accepted", secondary.body.ok, true);
  const secondStore = (await storeForId(other.store.sid))!;
  is("deal kept on second store", (await readDeals(secondStore.statsId, DEFAULT_STAGES)).map(d => d.title), ["Second proposal"]);
  is("first store unaffected", (await readDeals(store.statsId, DEFAULT_STAGES)).map(d => d.title), ["Proposal"]);
  await putMember(store, "helper@example.com", "support");
  await putMember(store, "editor@example.com", "editor");
  const assigned = await call({ action: "deal", deal: { ...cleared.body.deal, assignee: "helper@example.com" } });
  is("eligible teammate assigned", assigned.body.ok, true);
  is("editor cannot be assigned buyer details", (await call({ action: "deal", deal: { ...assigned.body.deal, assignee: "editor@example.com" } })).body.error, "assignee");
  await removeMember(store, "helper@example.com");
  is("old assignment does not block moving a deal", (await call({ action: "deal", deal: { ...assigned.body.deal, stage: "won000" } })).body.ok, true);
  done();
}
void main();
