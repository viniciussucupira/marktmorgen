/**
 * Where a workflow goes next, and the preview of one person's path through
 * it (added 17 October 2026). Browser-safe: the studio's preview and the
 * scheduled job read the same functions, so what the preview shows is what
 * the job does with the same facts.
 *
 * A workflow is still a list of steps. Two things route between them:
 *
 *   - `otherwise` on a step with a condition: "skip" (on to the next step),
 *     "end" (the run ends there) or "jump" (to the later step named `jump`);
 *   - `next` on any step: after it is done, go on to the later step it names,
 *     or "end". Without it, the next step in the list.
 *
 * Both only ever point forward, which saveFlow checks (checkRoutes). So no
 * run can loop, every run visits each step at most once, and a run's length
 * and history have the fixed ceiling MAX_STEPS (lib/flow-limits.ts).
 *
 * An IF/ELSE is one step with a condition, `next` past the ELSE part, and
 * "skip" or "jump" to it for everyone the condition does not hold for.
 */
import { type FlowAction, type FlowGoal, type Otherwise, type Person, type StepCondition, halfOf, holds, isCourseIf, reached, sameLabel } from "@/lib/flow-rules";

export type RoutedStep = {
  id: string;
  action?: FlowAction;
  when?: StepCondition;
  otherwise?: Otherwise;
  /** The later step those the condition does not hold for go to, when `otherwise` is "jump". */
  jump?: string;
  /** Where to go after this step: a later step, or "end". Absent for the next step in the list. */
  next?: string;
  delayHours?: number;
};

export const END = "end";

/** Index of the step after step `i` is done; -1 when the run ends there. */
export function afterIndex(steps: readonly RoutedStep[], i: number): number {
  const next = steps[i]?.next;
  if (next === END) return -1;
  if (next) {
    const j = steps.findIndex((s) => s.id === next);
    // A target that is gone or behind ends the run: never a loop, never a guess.
    return j > i ? j : -1;
  }
  return i + 1 < steps.length ? i + 1 : -1;
}

/** Index of the step for those step `i`'s condition does not hold for; -1 when the run ends. */
export function elseIndex(steps: readonly RoutedStep[], i: number): number {
  const step = steps[i];
  if (!step || step.otherwise === "end") return -1;
  if (step.otherwise === "jump") {
    const j = steps.findIndex((s) => s.id === step.jump);
    return j > i ? j : -1;
  }
  return i + 1 < steps.length ? i + 1 : -1;
}

/**
 * The first step whose routing is wrong: a jump with no target, or a target
 * that is not a later step of the same workflow. Null when every route is good.
 */
export function checkRoutes(steps: readonly RoutedStep[]): number | null {
  const at = new Map(steps.map((s, i) => [s.id, i]));
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    if (step.otherwise === "jump") {
      const j = step.jump ? at.get(step.jump) : undefined;
      if (!step.when || j === undefined || j <= i) return i;
    } else if (step.jump !== undefined) return i;
    if (step.next !== undefined && step.next !== END) {
      const j = at.get(step.next);
      if (j === undefined || j <= i) return i;
    }
  }
  return null;
}

/** A person to preview with: what they have, their labels, and what they would do. */
export type SampleContact = {
  /** Their address, when one is given: only to work out their A/B half, the same way the job does. */
  email?: string;
  /** Products they have, by id. */
  ids: string[];
  /** Whether they have paid for something (or first agreed at a checkout). */
  buyer: boolean;
  tags: string[];
  /** Whether they would use a link in each email they get: the click conditions read this. */
  clicks: boolean;
  /** For course conditions: what they did in each course, by product id. */
  courses: Record<string, { started: boolean; finished: boolean }>;
  /** Their half when no address is given. */
  half?: "a" | "b";
};

export type PreviewStep = {
  index: number;
  stepId: string;
  /** "runs": the step is done for them; "skipped": its condition did not hold. */
  outcome: "runs" | "skipped";
  /** Where they go next: a step index, or -1 for the end. */
  to: number;
};

export type Preview = {
  path: PreviewStep[];
  /** How the run ends: every step it reaches is done, the goal is reached before a step, or a condition ends it. */
  end: "completed" | "goal" | "condition";
  /** The step before which the goal ends it, when it does. */
  goalBefore?: number;
  /** Labels they would carry at the end, after the workflow's own label steps. */
  tags: string[];
};

/**
 * One person's path, decided only by the workflow and the sample: the same
 * sample always gives the same path. The goal is checked before every step,
 * as the job checks it; label steps change the labels later steps and the
 * goal read, as they do for real. What the sample does not say (a purchase in
 * the middle of the run, a click on a link) is held as it is given.
 */
export function previewRun(flow: { id: string; steps: readonly RoutedStep[]; goal?: FlowGoal | null }, sample: SampleContact, paid: ReadonlySet<string>): Preview {
  const steps = flow.steps;
  let tags = [...sample.tags];
  const path: PreviewStep[] = [];
  const sent = new Set<number>();
  const half = sample.email ? halfOf(flow.id, sample.email) : (sample.half ?? "a");
  let i = steps.length ? 0 : -1;
  // Forward-only routes make this terminate; the counter is a second guard.
  for (let guard = 0; i >= 0 && guard <= steps.length; guard += 1) {
    const step = steps[i];
    const person: Person = {
      ids: sample.ids,
      source: sample.buyer ? "buyer" : "free",
      tags,
      used: sample.clicks && sent.has(i - 1),
      course: step.when && isCourseIf(step.when.if) && "productId" in step.when ? sample.courses[step.when.productId] ?? { started: false, finished: false } : undefined,
      half,
    };
    if (flow.goal && reached(flow.goal, person, paid)) return { path, end: "goal", goalBefore: i, tags };
    if (step.when && !holds(step.when, person, paid)) {
      const to = elseIndex(steps, i);
      path.push({ index: i, stepId: step.id, outcome: "skipped", to });
      if (to < 0) return { path, end: step.otherwise === "end" || step.otherwise === "jump" ? "condition" : "completed", tags };
      i = to;
      continue;
    }
    const action = step.action;
    if (!action) sent.add(i);
    else if (action.do === "tag" && !tags.some((t) => sameLabel(t, action.tag)) && tags.length < 10) tags = [...tags, action.tag];
    else if (action.do === "untag") tags = tags.filter((t) => !sameLabel(t, action.tag));
    const to = afterIndex(steps, i);
    path.push({ index: i, stepId: step.id, outcome: "runs", to });
    i = to;
  }
  return { path, end: "completed", tags };
}
