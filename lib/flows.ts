/**
 * Automatic sequences: emails that go out by themselves, a set time after
 * somebody joins the list or gets one of the creator's products.
 *
 * Each person goes through a sequence once. Every step is checked again just
 * before it is sent — the person must still be on the list, the sequence
 * still switched on, the step still there — so an unsubscribe, a pause or an
 * edit takes effect on the next email, not the one after. A sequence can end
 * early for somebody once they buy, and an email can go only to some of the
 * people in it (lib/flow-rules.ts); both are read at that same moment.
 *
 *   nl:mail:flows:<listId>              the store's sequences (JSON)
 *   nl:mail:flowq                       steps due, scored by when
 *   nl:mail:enr:<flowId>:<address key>  who has started a sequence
 */
import { createHash, randomBytes } from "node:crypto";
import { normaliseEmail } from "@/lib/auth";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { isMailable, leadsKey, mailable, parseContact } from "@/lib/contacts";
import { MAX_MAIL_BODY, MAX_SUBJECT, monthlyAllowance, sendTo } from "@/lib/mail";
import type { Store } from "@/lib/store";
import { hasProduct, idsOfKind } from "@/lib/catalog";
import { stepCampaign } from "@/lib/mail-links";
import { type FlowGoal, type Otherwise, type StepCondition, goalClash, holds, readCondition, readGoal, readsEmailBefore, reached } from "@/lib/flow-rules";
import { usedLinkIn } from "@/lib/mail-clicks";

export const MAX_FLOWS = 10;
export const MAX_STEPS = 10;
export const MAX_DELAY_HOURS = 365 * 24;
export const MAX_FLOW_NAME = 80;

export type FlowStep = {
  id: string;
  delayHours: number;
  subject: string;
  body: string;
  /** Sent only to those this holds for (lib/flow-rules.ts); absent for everyone. */
  when?: StepCondition;
  /** For those it does not hold for: skip to the next email, or leave the sequence. */
  otherwise?: Otherwise;
};
export type Flow = {
  id: string;
  name: string;
  /**
   * "joined": agreed to hear from the creator; "product": got or bought one
   * product; "bought": paid for anything at all, the first time they do.
   */
  trigger: "joined" | "product" | "bought";
  productId: string | null;
  steps: FlowStep[];
  active: boolean;
  createdAt: number;
  /**
   * Made from emails that had already gone out (lib/mail-reuse.ts, "Keep
   * sending it"), which is how the next one kept finds the sequence to join.
   * It changes nothing about how the sequence is sent, and it stays through
   * an edit in the studio.
   */
  kept?: boolean;
  /**
   * One of the two sequences written for the creator and left switched off
   * (lib/mail-starters.ts). Says where it came from; changes nothing about
   * how it is sent, and stays through an edit.
   */
  starter?: "welcome" | "bought";
  /** Ends for anyone who gets this product, or has bought anything (lib/flow-rules.ts). */
  goal?: FlowGoal;
};

const QUEUE = "nl:mail:flowq";
/**
 * Steps taken off the queue by a run, until it has sent or put them back. A
 * run stopped mid-way (a timeout, an error) leaves them here, and the next run
 * returns those whose time is up to the queue, so no contact is dropped.
 */
const LEASE = "nl:mail:flowq:lease";
const LEASE_SECONDS = 15 * 60;
const flowsKey = (listId: string) => `nl:mail:flows:${listId}`;
const enrolledKey = (flowId: string, email: string) =>
  `nl:mail:enr:${flowId}:${createHash("sha256").update(`nimbus-flow:${normaliseEmail(email)}`).digest("hex").slice(0, 32)}`;
const statsKey = (flowId: string) => `nl:mail:flowstats:${flowId}`;
export const FLOW_ID = /^[0-9a-f]{16}$/;

const newId = () => randomBytes(8).toString("hex");

function cleanStep(raw: unknown, known: (productId: string) => boolean): FlowStep | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const delay = Number(value.delayHours);
  const subject = typeof value.subject === "string" ? value.subject.replace(/\s+/g, " ").trim().slice(0, MAX_SUBJECT) : "";
  const body = typeof value.body === "string" ? value.body.replace(/\r\n?/g, "\n").trim().slice(0, MAX_MAIL_BODY) : "";
  if (!Number.isInteger(delay) || delay < 0 || delay > MAX_DELAY_HOURS || !subject || !body) return null;
  const when = readCondition(value.when, known);
  if (when === "bad") return null;
  const step: FlowStep = { id: typeof value.id === "string" && FLOW_ID.test(value.id) ? value.id : newId(), delayHours: delay, subject, body };
  if (when) {
    step.when = when;
    step.otherwise = value.otherwise === "end" ? "end" : "skip";
  }
  return step;
}

export async function readFlows(listId: string | null): Promise<Flow[]> {
  if (!listId || !isRedisConfigured()) return [];
  const [raw] = await redisPipeline([["GET", flowsKey(listId)]]);
  if (typeof raw !== "string") return [];
  try {
    const list = JSON.parse(raw) as Flow[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function writeFlows(listId: string, flows: Flow[]): Promise<void> {
  await redisPipeline([["SET", flowsKey(listId), JSON.stringify(flows)]]);
}

const starterOf = (raw: unknown): Flow["starter"] => (raw === "welcome" || raw === "bought" ? raw : undefined);

export type FlowResult =
  | { ok: true; flows: Flow[] }
  | { ok: false; reason: "name" | "trigger" | "product" | "steps" | "step" | "goal" | "too_many" | "unknown" | "setup" | "plan" };

/** Adds a sequence, or replaces one with the same id. Checked whole every time. */
export async function saveFlow(store: Store, raw: Record<string, unknown>): Promise<FlowResult> {
  if (monthlyAllowance(store) === 0) return { ok: false, reason: "plan" };
  if (!store.listId || !store.mail) return { ok: false, reason: "setup" };
  const name = typeof raw.name === "string" ? raw.name.replace(/\s+/g, " ").trim().slice(0, MAX_FLOW_NAME) : "";
  if (!name) return { ok: false, reason: "name" };
  const trigger = raw.trigger === "joined" || raw.trigger === "product" || raw.trigger === "bought" ? raw.trigger : null;
  if (!trigger) return { ok: false, reason: "trigger" };
  const productId = trigger === "product" && typeof raw.productId === "string" ? raw.productId : null;
  if (trigger === "product" && !(productId && hasProduct(store, productId))) return { ok: false, reason: "product" };
  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];
  if (rawSteps.length === 0 || rawSteps.length > MAX_STEPS) return { ok: false, reason: "steps" };
  const known = (id: string) => hasProduct(store, id);
  const steps: FlowStep[] = [];
  for (const s of rawSteps) {
    const step = cleanStep(s, known);
    // A condition on the email before cannot be on the first email.
    if (!step || (steps.length === 0 && readsEmailBefore(step.when))) return { ok: false, reason: "step" };
    steps.push(step);
  }
  const goal = readGoal(raw.goal, known);
  if (goal === "bad") return { ok: false, reason: "goal" };
  const startsPaid = Boolean(productId) && idsOfKind(store, "paid").includes(productId as string);
  if (goalClash(trigger, productId, goal, startsPaid)) return { ok: false, reason: "goal" };
  const flows = await readFlows(store.listId);
  const id = typeof raw.id === "string" && FLOW_ID.test(raw.id) ? raw.id : null;
  const at = id ? flows.findIndex((f) => f.id === id) : -1;
  if (id && at < 0) return { ok: false, reason: "unknown" };
  if (!id && flows.length >= MAX_FLOWS) return { ok: false, reason: "too_many" };
  // Where a written-for-you sequence came from stays with it through an edit.
  const starter = starterOf(raw.starter) ?? (at >= 0 ? flows[at].starter : undefined);
  const flow: Flow = {
    id: id ?? newId(),
    name,
    trigger,
    productId,
    steps,
    active: raw.active === true,
    createdAt: at >= 0 ? flows[at].createdAt : Math.floor(Date.now() / 1000),
    ...(raw.kept === true || (at >= 0 && flows[at].kept === true) ? { kept: true } : {}),
    ...(starter ? { starter } : {}),
    ...(goal ? { goal } : {}),
  };
  const next = [...flows];
  if (at >= 0) next[at] = flow;
  else next.push(flow);
  await writeFlows(store.listId, next);
  return { ok: true, flows: next };
}

export async function removeFlow(store: Store, id: string): Promise<FlowResult> {
  if (!store.listId) return { ok: false, reason: "unknown" };
  const flows = await readFlows(store.listId);
  if (!flows.some((f) => f.id === id)) return { ok: false, reason: "unknown" };
  const next = flows.filter((f) => f.id !== id);
  await writeFlows(store.listId, next);
  return { ok: true, flows: next };
}

export type FlowCounts = {
  started: number;
  sent: number;
  /** Left it at its end: bought, or got the product it ends on. */
  reached: number;
  /** Emails not sent to somebody because a condition did not hold for them. */
  skipped: number;
};

/** How many have started each sequence, how many of its emails went out, and how many ended it or skipped one. */
export async function flowStats(flows: Flow[]): Promise<Map<string, FlowCounts>> {
  const out = new Map<string, FlowCounts>();
  if (!flows.length || !isRedisConfigured()) return out;
  const rows = await redisPipeline(flows.map((f) => ["HGETALL", statsKey(f.id)]));
  flows.forEach((f, i) => {
    const raw = rows[i];
    const map = new Map<string, number>();
    if (Array.isArray(raw)) for (let j = 0; j + 1 < raw.length; j += 2) map.set(String(raw[j]), Number(raw[j + 1]) || 0);
    out.set(f.id, { started: map.get("started") ?? 0, sent: map.get("sent") ?? 0, reached: map.get("reached") ?? 0, skipped: map.get("skipped") ?? 0 });
  });
  return out;
}

/**
 * The sequences this address was started on, by their ids, of those the
 * store has now: one EXISTS each, at most MAX_FLOWS. For the buyer's page in
 * the studio (lib/buyer-profile.ts). A start is remembered for 400 days.
 */
export async function flowsStartedFor(flows: Flow[], email: string): Promise<string[]> {
  if (!flows.length) return [];
  const address = normaliseEmail(email);
  const found = await redisPipeline(flows.map((f) => ["EXISTS", enrolledKey(f.id, address)]));
  return flows.filter((_, i) => Number(found[i]) === 1).map((f) => f.id);
}

/**
 * Starts whichever sequences this event begins, for this person. Never
 * throws: the list must never cost anyone what they asked for.
 */
export async function enroll(store: Store, email: string, event: { joined: boolean; productId?: string }): Promise<void> {
  try {
    if (!store.listId || monthlyAllowance(store) === 0) return;
    // Whether what they just got is sold for money: the store's own index
    // knows, so "bought" costs no read.
    const paid = Boolean(event.productId) && idsOfKind(store, "paid").includes(event.productId as string);
    const flows = (await readFlows(store.listId)).filter(
      (f) =>
        f.active &&
        f.steps.length > 0 &&
        ((f.trigger === "joined" && event.joined) ||
          (f.trigger === "product" && event.productId && f.productId === event.productId) ||
          (f.trigger === "bought" && paid)),
    );
    if (!flows.length) return;
    const address = normaliseEmail(email);
    // Only someone who may be written to starts one; their one start is not
    // spent on a moment they could not have received it.
    if (!(await isMailable(store.listId, address))) return;
    const now = Math.floor(Date.now() / 1000);
    for (const flow of flows) {
      const [claimed] = await redisPipeline([["SET", enrolledKey(flow.id, address), "1", "NX", "EX", 400 * 86_400]]);
      if (claimed === null) continue;
      await redisPipeline([
        ["ZADD", QUEUE, now + flow.steps[0].delayHours * 3600, `${store.listId}|${store.handle}|${flow.id}|0|${address}`],
        ["HINCRBY", statsKey(flow.id), "started", 1],
      ]);
    }
  } catch (error) {
    console.error("starting a sequence failed", error);
  }
}

/**
 * Sends every step that is due, and lines up the next one. For the scheduled
 * job. Everyone due for the same email of the same sequence goes in one batch.
 */
export async function sendDueSteps(
  load: (handle: string) => Promise<Store | null>,
  deadline: number,
): Promise<{ sent: number; dropped: number; later: number }> {
  const counts = { sent: 0, dropped: 0, later: 0 };
  if (!isRedisConfigured()) return counts;
  const stores = new Map<string, Store | null>();
  const flowsFor = new Map<string, Flow[]>();
  // What an earlier run took and never finished goes back in the queue first.
  const [stuck] = await redisPipeline([["ZRANGEBYSCORE", LEASE, 0, Math.floor(Date.now() / 1000), "LIMIT", 0, 1000]]);
  const orphans = Array.isArray(stuck) ? (stuck as string[]) : [];
  if (orphans.length) {
    const back = await redisPipeline(orphans.map((m) => ["ZREM", LEASE, m]));
    const mine = orphans.filter((_, i) => Number(back[i]) === 1);
    if (mine.length) await redisPipeline(mine.map((m) => ["ZADD", QUEUE, Math.floor(Date.now() / 1000), m]));
  }
  while (Date.now() < deadline) {
    const now = Math.floor(Date.now() / 1000);
    const [due] = await redisPipeline([["ZRANGEBYSCORE", QUEUE, 0, now, "LIMIT", 0, 300]]);
    const members = Array.isArray(due) ? (due as string[]) : [];
    if (!members.length) break;
    // Whoever removes a member from the queue is the one who sends it.
    const taken = await redisPipeline(members.map((m) => ["ZREM", QUEUE, m]));
    const owned = members.filter((_, i) => Number(taken[i]) === 1);
    if (owned.length) await redisPipeline(owned.map((m) => ["ZADD", LEASE, now + LEASE_SECONDS, m]));
    const groups = new Map<string, string[]>();
    members.forEach((member, i) => {
      if (Number(taken[i]) !== 1) return;
      // listId|handle|flowId|step|address — an address may itself hold a "|".
      const parts = member.split("|");
      const group = parts.slice(0, 4).join("|");
      groups.set(group, [...(groups.get(group) ?? []), parts.slice(4).join("|")]);
    });

    for (const [group, emails] of groups) {
      const release = [["ZREM", LEASE, ...emails.map((email) => `${group}|${email}`)]];
      if (Date.now() > deadline) {
        // Out of time: back in the queue for the next run, untouched.
        await redisPipeline([...emails.map((email) => ["ZADD", QUEUE, now, `${group}|${email}`]), ...release]);
        continue;
      }
      try {
        await sendGroup(group, emails);
        await redisPipeline(release);
      } catch (error) {
        // Put back for a later run rather than lost; the send's own key keeps
        // anybody it already reached from getting it twice.
        console.error("sending a sequence step failed", error);
        await redisPipeline([...emails.map((email) => ["ZADD", QUEUE, now + 600, `${group}|${email}`]), ...release]).catch(() => {});
      }
    }
  }
  return counts;

  async function sendGroup(group: string, emails: string[]): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const [listId, handle, flowId, stepRaw] = group.split("|");
    const index = Number(stepRaw);
    if (!stores.has(handle)) stores.set(handle, await load(handle));
    const store = stores.get(handle);
    if (!store || store.listId !== listId) {
      counts.dropped += emails.length;
      return;
    }
    if (!flowsFor.has(listId)) flowsFor.set(listId, await readFlows(listId));
    const flow = flowsFor.get(listId)!.find((f) => f.id === flowId);
    const step = flow?.steps[index];
    if (!flow || !flow.active || !step || monthlyAllowance(store) === 0) {
      counts.dropped += emails.length;
      return;
    }
    const [rows] = await redisPipeline([["HMGET", leadsKey(listId), ...emails]]);
    const found = Array.isArray(rows) ? rows : [];
    const following = flow.steps[index + 1];
    // Who is still on the list, and of them, who has reached the sequence's
    // end and who this email is not for (lib/flow-rules.ts) — read from the
    // same rows, so a condition costs no read of its own.
    const paid = flow.goal || step.when ? new Set(idsOfKind(store, "paid")) : new Set<string>();
    // Who used a link in the email before, for a condition on it: only ever
    // somebody who allowed it to be seen (lib/mail-clicks.ts).
    const before = flow.steps[index - 1];
    const used = readsEmailBefore(step.when) && before ? await usedLinkIn(listId, stepCampaign(flow.id, before.id), emails) : new Set<string>();
    const still: string[] = [];
    const onward: string[] = [];
    let done = 0;
    let left = 0;
    emails.forEach((email, i) => {
      const contact = parseContact(found[i]);
      if (!contact || !mailable(contact)) {
        counts.dropped += 1;
        return;
      }
      if (flow.goal && reached(flow.goal, contact, paid)) {
        done += 1;
        return;
      }
      if (step.when && !holds(step.when, { ...contact, used: used.has(email) }, paid)) {
        if (step.otherwise === "end" || !following) left += 1;
        else onward.push(email);
        return;
      }
      still.push(email);
    });
    // Skipped: on to the next email, its wait counted from now, as if this
    // one had gone.
    const moved: (string | number)[][] = onward.map((email) => ["ZADD", QUEUE, now + (following?.delayHours ?? 0) * 3600, `${listId}|${handle}|${flowId}|${index + 1}|${email}`]);
    if (done) moved.push(["HINCRBY", statsKey(flow.id), "reached", done]);
    if (left + onward.length) moved.push(["HINCRBY", statsKey(flow.id), "skipped", left + onward.length]);
    if (moved.length) await redisPipeline(moved);
    if (!still.length) return;

    const key = `fl:${flow.id}:${step.id}:${createHash("sha256").update([...still].sort().join(",")).digest("hex").slice(0, 32)}`;
    const result = await sendTo(store, still, step.subject, step.body, key, { medium: "sequence", campaign: stepCampaign(flow.id, step.id) });
    if (result.rest.length) {
      if (result.stopped === "refused") counts.dropped += result.rest.length;
      else {
        // Tried again later rather than lost: next month, or once the sender takes it.
        const later = result.stopped === "allowance" || result.stopped === "day" || result.stopped === "sender" || result.stopped === "paused" ? 6 * 3600 : result.stopped === "portion" ? 900 : 600;
        await redisPipeline(result.rest.map((email) => ["ZADD", QUEUE, now + later, `${group}|${email}`]));
        counts.later += result.rest.length;
      }
    }
    if (!result.done.length) return;
    counts.sent += result.done.length;
    const commands: (string | number)[][] = [["HINCRBY", statsKey(flow.id), "sent", result.done.length]];
    if (following) {
      const at = now + following.delayHours * 3600;
      for (const email of result.done) commands.push(["ZADD", QUEUE, at, `${listId}|${handle}|${flowId}|${index + 1}|${email}`]);
    }
    await redisPipeline(commands);
  }
}
