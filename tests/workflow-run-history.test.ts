/**
 * A workflow run's history: its effects counted four ways, kept apart, and
 * how much it can keep (lib/run-effects.ts, lib/flow-runs.ts; added 18
 * October 2026, ClickFunnels audit row F24). Checked against the in-memory
 * Redis and a stand-in for the email provider:
 *
 *   - an attempt with no outcome, and an uncertain step the creator marked as
 *     gone through, are counted uncertain, never confirmed;
 *   - a step that waits (the month's emails ran out) and is tried again many
 *     times writes nothing new to the run's history, so a month of waiting
 *     cannot grow it past what the store's data room was charged for;
 *   - the creator's "try it again", over and over, keeps a run's history at
 *     MAX_RUN_EVENTS at the most, and the history says its earliest events
 *     were let go;
 *   - the bound on a workflow's runs follows from the plan's runs a day.
 */
import { DAILY_RUNS_BY_TIER, MAX_RUNS_KEPT_PER_FLOW, MAX_RUN_EVENTS, MAX_STEPS, RUN_KEEP_SECONDS, TRIAL_DAILY_RUNS } from "@/lib/flow-limits";
import { KEPT_AFTER_CHOICE, personOf, readRun, type RunEvent } from "@/lib/flow-runs";
import { enroll, resolveHeldRun, saveFlow, sendDueSteps, setFlowActive } from "@/lib/flows";
import { runEffects } from "@/lib/run-effects";
import { upsertContact } from "@/lib/contacts";
import { claimHandle, ensureListId, ensureStatsId, setMailSettings, setStripeAccount, setSubscription, storeForEmail, storeForHandle } from "@/lib/store";
import { windowId } from "@/lib/allowance-window";
import { redisPipeline } from "@/lib/redis";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";
import { ROOM } from "./data-room";

const HOUR = 3_600_000;
const realNow = Date.now;
let shift = 0;
Date.now = () => realNow() + shift;

const sent: string[] = [];
let resendDown = false;
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (url.hostname === "api.resend.com") {
    const body = JSON.parse(String(init?.body)) as { subject: string } | { subject: string }[];
    const all = Array.isArray(body) ? body : [body];
    for (const m of all) sent.push(m.subject);
    // The provider took it, and its answer was lost on the way back.
    if (resendDown) return json({ error: "unavailable" }, 503);
    return json(Array.isArray(body) ? { data: all.map((_, i) => ({ id: `email_${sent.length}_${i}` })) } : { id: `email_${sent.length}` });
  }
  return json({ object: "list", data: [], has_more: false });
}) as typeof fetch;

const run = () => sendDueSteps((handle) => storeForHandle(handle), Date.now() + 20_000);
const ev = (step: number, state: RunEvent["state"], note = "", stepId = `s${step}`): RunEvent => ({ at: 1, step, stepId, kind: "email", state, note });

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_workflows_only_a_stand_in";
  process.env.RESEND_API_KEY = "re_test_workflows_only_a_stand_in";

  part("Effects are counted four ways, and nothing unconfirmed counts as done");
  const mixed = runEffects([
    ev(-1, "started"),
    ev(0, "attempted"),
    ev(0, "confirmed", "Handed to the sender."),
    ev(1, "attempted"),
    ev(1, "failed", "The sender refused this email as it is."),
    ev(2, "attempted"),
    ev(2, "uncertain", "The sender's answer was lost."),
    { ...ev(2, "resolved", "Marked as done by you; going on to step 4."), kind: "run" },
    ev(3, "attempted"),
  ]);
  is("four attempts: one confirmed, one failed, two uncertain", mixed.counts, { attempted: 4, confirmed: 1, failed: 1, uncertain: 2 });
  is("the one marked as gone through by the creator stays uncertain, with their choice beside it", [mixed.markedByYou, mixed.effects[2].state, mixed.effects[2].choice], [1, "uncertain", "Marked as done by you; going on to step 4."]);
  is("an attempt with no outcome yet is uncertain and waiting, never done", [mixed.effects[3].state, mixed.effects[3].waiting], ["uncertain", true]);
  is("a full history is not trimmed", mixed.trimmed, false);
  const skipped = runEffects([ev(-1, "started"), ev(0, "skipped", "The condition did not hold."), ev(1, "attempted"), ev(1, "confirmed")]);
  is("a skipped step is not an effect", skipped.counts, { attempted: 1, confirmed: 1, failed: 0, uncertain: 0 });
  const retried = runEffects([ev(-1, "started"), ev(0, "attempted"), ev(0, "uncertain"), { ...ev(0, "resolved", "Tried again at your request."), kind: "run" }, ev(0, "attempted"), ev(0, "confirmed")]);
  is("a step tried again is two attempts: the first stays uncertain, the second is confirmed", [retried.counts, retried.markedByYou], [{ attempted: 2, confirmed: 1, failed: 0, uncertain: 1 }, 0]);
  const late = runEffects([ev(4, "confirmed"), ev(5, "attempted"), ev(5, "uncertain")]);
  is("a history whose earliest events were let go says so, and still counts the outcome it kept", [late.trimmed, late.counts], [true, { attempted: 2, confirmed: 1, failed: 0, uncertain: 1 }]);

  part("Bounds by construction");
  is("a workflow keeps at most the plan's runs a day for as long as a start is remembered", MAX_RUNS_KEPT_PER_FLOW, Math.max(...Object.values(DAILY_RUNS_BY_TIER), TRIAL_DAILY_RUNS) * (RUN_KEEP_SECONDS / 86_400));
  is("after a choice, there is room for everything a run can still write", KEPT_AFTER_CHOICE + 2 + 2 * MAX_STEPS, MAX_RUN_EVENTS);

  const OWNER = "rowan@example.com";
  await claimHandle(OWNER, "rowan", "Rowan Studio", "");
  await ensureStatsId(OWNER);
  await ensureListId(OWNER);
  await setStripeAccount(OWNER, "acct_1TestRowan00001", true);
  await setSubscription(OWNER, { customerId: "cus_Rowan0001", subscriptionId: "sub_Rowan0001", active: true, tier: "pro", period: paidPeriod() });
  await setMailSettings(OWNER, { fromName: "Rowan Studio", address: "1 Main St, Portland, OR 97201" });
  let store = (await storeForEmail(OWNER))!;
  const list = store.listId as string;
  const made = await saveFlow(store, { name: "Wait", trigger: "tagged", tag: "wait", steps: [{ id: "a000000000000001", delayHours: 0, subject: "Waited for", body: "Hello." }] });
  const flowId = made.ok ? made.flows.find((f) => f.name === "Wait")!.id : "";
  await setFlowActive(store, flowId, true);
  store = (await storeForEmail(OWNER))!;

  part("A step that waits a long time writes nothing new");
  await upsertContact(list, "ivy@example.com", { agreed: true, explicit: true, source: "free" }, ROOM);
  await enroll(store, "ivy@example.com", { joined: false, tag: "wait" });
  const ivy = personOf("ivy@example.com");
  // The month's emails are used up, every time the step comes round.
  const spend = async () => {
    const window = windowId(store);
    if (window) await redisPipeline([["SET", `nl:mail:used:${list}:${window}`, 1_000_000_000]]);
  };
  for (let i = 0; i < 12; i += 1) {
    await spend();
    await run();
    shift += 6 * HOUR;
  }
  const waiting = await readRun(flowId, ivy);
  is("tried twelve times and still waiting: nothing was sent", [waiting?.run.status, sent.includes("Waited for")], ["waiting", false]);
  is("and its history is still just its start", waiting?.events.map((e) => e.state), ["started"]);
  await redisPipeline([["DEL", `nl:mail:used:${list}:${windowId(store)}`]]);
  await run();
  const through = await readRun(flowId, ivy);
  is("once there is room it goes out, written down once: attempted, then confirmed", [sent.filter((s) => s === "Waited for").length, through?.events.map((e) => e.state)], [1, ["started", "attempted", "confirmed"]]);
  is("counted as one attempt, confirmed", runEffects(through?.events ?? []).counts, { attempted: 1, confirmed: 1, failed: 0, uncertain: 0 });

  part("Trying a held step again, over and over, keeps the history bounded");
  await upsertContact(list, "jo@example.com", { agreed: true, explicit: true, source: "free" }, ROOM);
  await enroll(store, "jo@example.com", { joined: false, tag: "wait" });
  const jo = personOf("jo@example.com");
  resendDown = true;
  await run();
  is("a lost answer holds the run", (await readRun(flowId, jo))?.run.status, "held");
  const choices: string[] = [];
  for (let i = 0; i < 30; i += 1) {
    choices.push(await resolveHeldRun(store, flowId, jo, "retry"));
    await run();
  }
  resendDown = false;
  const longest = await readRun(flowId, jo);
  is("thirty retries were each taken once, and each was held again", [choices.every((c) => c === "ok"), longest?.run.status], [true, "held"]);
  is(`its history never passes ${MAX_RUN_EVENTS} events`, (longest?.events.length ?? 0) <= MAX_RUN_EVENTS, true);
  const counted = runEffects(longest?.events ?? []);
  is("its earliest events were let go, and it says so", counted.trimmed, true);
  is("every attempt it kept is uncertain: none was confirmed", [counted.counts.confirmed, counted.counts.uncertain === counted.counts.attempted, counted.counts.attempted > 0], [0, true, true]);
  is("going on past it is the creator's word, and it stays counted as uncertain", await resolveHeldRun(store, flowId, jo, "continue"), "ok");
  const after = runEffects((await readRun(flowId, jo))?.events ?? []);
  is("shown as marked by you, and not confirmed", [after.markedByYou, after.counts.confirmed], [1, 0]);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
