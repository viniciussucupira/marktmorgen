/**
 * The numeric limits of workflows (sequences), in one place, browser-safe, so
 * the studio shows exactly what the server enforces (added 17 October 2026).
 *
 *   - MAX_STEPS: steps in one workflow. Branches only ever jump forward
 *     (lib/flow-paths.ts), so one run visits each step at most once and its
 *     history has a fixed ceiling.
 *   - MAX_FLOWS: workflows a store may keep, paused or active.
 *   - Active workflows by plan: how many may be switched on at once.
 *   - Runs a day by plan: new runs a store may start in one UTC day, across
 *     all its workflows. A start past it is refused before anything is
 *     written for that person, and counted so the studio can say so.
 *
 * Every email a workflow sends is still drawn from the store's monthly email
 * allowance (lib/mail.ts, reserve), before it is sent, and since 17 October
 * 2026 so is its notice to the owner (lib/mail.ts, takeFromMonth). The daily run ceiling
 * bounds what is not email: the database commands each step and its history
 * cost and the webhooks a step queues (lib/webhooks.ts keeps its own retry
 * ceiling).
 *
 * Worst case per run, for the margin review: MAX_STEPS steps, each at most
 * HISTORY_COMMANDS_PER_STEP history commands and QUEUE_COMMANDS_PER_STEP queue
 * and contact commands, plus RUN_START_COMMANDS once. These are ceilings for
 * the review's arithmetic, not measured averages.
 */
import type { Tier } from "@/lib/plan";

export const MAX_STEPS = 20;
export const MAX_FLOWS = 20;

/** Active workflows at once. A store in its free trial has the trial's number. */
export const ACTIVE_FLOWS_BY_TIER: Record<Tier, number> = { creator: 0, pro: 10, scale: 20 };
export const TRIAL_ACTIVE_FLOWS = 3;

/**
 * New runs a store may start in one UTC day, all workflows together.
 *
 * 300 on Studio and 600 on Scale until 17 October 2026: at WORST_COMMANDS_PER_RUN
 * that is $5.73 and $11.46 of database commands a month, which neither plan
 * keeps the owner's 60% after tax with when paid by the year
 * (tests/plan-cost-registry.ts). 25 a day is 775 people a month started on
 * Studio and 40 a day 1,240 on Scale, about what each plan's monthly emails
 * reach at six emails a person. The free trial goes from 50 to 10.
 */
export const DAILY_RUNS_BY_TIER: Record<Tier, number> = { creator: 0, pro: 25, scale: 40 };
export const TRIAL_DAILY_RUNS = 10;

/** Events one run keeps in its history: a start, each step's attempt and outcome, and its end. */
export const MAX_RUN_EVENTS = 2 + MAX_STEPS * 3;
/** Runs listed per workflow in the studio, most recent first. */
export const RUNS_LISTED = 50;
/** How long a run and its history are kept: as long as the start itself is remembered. */
export const RUN_KEEP_SECONDS = 400 * 86_400;
/**
 * The most runs one workflow can keep: a person starts it at most once while
 * the start is remembered (RUN_KEEP_SECONDS), and a store starts at most its
 * plan's runs a day across all its workflows. A ceiling by construction, not
 * a trim (lib/flow-runs.ts), so every run in it can still be erased.
 */
export const MAX_RUNS_KEPT_PER_FLOW = Math.max(...Object.values(DAILY_RUNS_BY_TIER), TRIAL_DAILY_RUNS) * Math.ceil(RUN_KEEP_SECONDS / 86_400);

/** Ceilings for the margin review's per-run arithmetic. */
export const RUN_START_COMMANDS = 8;
export const HISTORY_COMMANDS_PER_STEP = 9;
export const QUEUE_COMMANDS_PER_STEP = 6;
export const WORST_COMMANDS_PER_RUN = RUN_START_COMMANDS + MAX_STEPS * (HISTORY_COMMANDS_PER_STEP + QUEUE_COMMANDS_PER_STEP);

type PlanView = { tier: Tier; subscriptionActive: boolean; trialEnds: number };
const inTrial = (store: PlanView, nowSeconds: number) => store.trialEnds > nowSeconds;
const paid = (store: PlanView) => store.subscriptionActive && (store.tier === "pro" || store.tier === "scale");

/** How many workflows this store may have switched on at once. */
export function activeFlowLimit(store: PlanView, nowSeconds = Date.now() / 1000): number {
  if (!paid(store)) return 0;
  return inTrial(store, nowSeconds) ? TRIAL_ACTIVE_FLOWS : ACTIVE_FLOWS_BY_TIER[store.tier];
}

/** How many new runs this store may start in one UTC day. */
export function dailyRunLimit(store: PlanView, nowSeconds = Date.now() / 1000): number {
  if (!paid(store)) return 0;
  return inTrial(store, nowSeconds) ? TRIAL_DAILY_RUNS : DAILY_RUNS_BY_TIER[store.tier];
}

/**
 * The active workflows that may start new runs: the oldest switched on first,
 * up to the plan's number. A store that moved to a smaller plan keeps its
 * workflows; the newest of them simply start nobody new until fewer are on.
 */
export function startableFlows<F extends { active: boolean; createdAt: number; id: string }>(flows: readonly F[], limit: number): F[] {
  const on = flows.filter((f) => f.active).sort((a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1));
  const allowed = new Set(on.slice(0, Math.max(0, limit)).map((f) => f.id));
  return flows.filter((f) => allowed.has(f.id));
}

/** The limits as the commercial review captures them (lib/commercial-margin.ts). */
export const WORKFLOW_LIMITS = {
  maxSteps: MAX_STEPS,
  maxFlows: MAX_FLOWS,
  activeByTier: ACTIVE_FLOWS_BY_TIER,
  trialActive: TRIAL_ACTIVE_FLOWS,
  dailyRunsByTier: DAILY_RUNS_BY_TIER,
  trialDailyRuns: TRIAL_DAILY_RUNS,
  maxRunEvents: MAX_RUN_EVENTS,
  runKeepSeconds: RUN_KEEP_SECONDS,
  worstCommandsPerRun: WORST_COMMANDS_PER_RUN,
  emailsDrawFromMonthlyAllowance: true,
  ownerNoticesDrawFromMonthlyAllowance: true,
  webhooksUseStoreEndpointsAndRetryCeiling: true,
  uncertainOutcomesHoldTheRun: true,
} as const;

/** The limits in one sentence, for the help and feature pages. */
export function workflowLimitWords(): string {
  return `Up to ${MAX_FLOWS} workflows of up to ${MAX_STEPS} steps each, one condition per step. Switched on at once: ${ACTIVE_FLOWS_BY_TIER.pro} on Studio, ${ACTIVE_FLOWS_BY_TIER.scale} on Scale, ${TRIAL_ACTIVE_FLOWS} during the free trial. New runs a day, all workflows together: ${DAILY_RUNS_BY_TIER.pro.toLocaleString("en-US")} on Studio, ${DAILY_RUNS_BY_TIER.scale.toLocaleString("en-US")} on Scale, ${TRIAL_DAILY_RUNS} during the free trial; past that, nobody more is started that day (UTC), and your studio counts them.`;
}
