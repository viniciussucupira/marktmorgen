/**
 * What each step of one workflow run did, effect by effect, read from the
 * run's history (lib/flow-runs.ts) — added 18 October 2026.
 *
 * A step that does something (an email handed to the sender, a label, a deal,
 * a webhook event, a note) is written down as "attempted" before it happens,
 * then confirmed, failed or uncertain. This folds those events into one line
 * per attempt and counts them four ways, kept apart:
 *
 *   attempted   every attempt written down
 *   confirmed   the sender took the email, or the action's write was acknowledged
 *   failed      it is known not to have happened
 *   uncertain   the outcome was never confirmed: the answer was lost, the job
 *               stopped between the attempt and its outcome, or no outcome
 *               has been written yet
 *
 * Two rules that must survive any change:
 *
 *   - An attempt with no confirmed outcome is uncertain, never done. That
 *     includes an attempt still waiting for its answer, and an uncertain step
 *     the creator later marked as gone through ("It went through: continue"):
 *     the creator's choice is shown beside it, and it stays counted as
 *     uncertain, because nobody but the creator said it happened.
 *   - Only what the history holds is counted. A run keeps its latest
 *     MAX_RUN_EVENTS events (lib/flow-limits.ts); when the earliest were let
 *     go, `trimmed` says so, and the counts are of what is still kept.
 *
 * Pure and browser-safe: the studio reads it from the events the run's
 * history already returned, so it costs nothing to show.
 */
import type { RunEvent } from "@/lib/flow-runs";

export type EffectState = "confirmed" | "failed" | "uncertain";

export type Effect = {
  /** The step's place when it ran, and its id, as the history wrote them. */
  step: number;
  stepId: string;
  /** "email" or the action's name. */
  kind: string;
  /** When it was attempted (or, when the attempt was let go, when its outcome was written). */
  at: number;
  state: EffectState;
  /** True while no outcome at all has been written for it. */
  waiting: boolean;
  /** The outcome's words, as the history kept them. */
  note: string;
  /** What the creator chose for it, when it was held: their words from the history. */
  choice: string;
};

export type RunEffects = {
  effects: Effect[];
  counts: { attempted: number; confirmed: number; failed: number; uncertain: number };
  /** Uncertain effects the creator marked as gone through: still counted as uncertain. */
  markedByYou: number;
  /** True when the run's earliest events are no longer kept. */
  trimmed: boolean;
};

const OUTCOMES = new Set<RunEvent["state"]>(["confirmed", "failed", "uncertain"]);

export function runEffects(events: readonly RunEvent[]): RunEffects {
  const effects: Effect[] = [];
  // The latest attempt of each step still without an outcome, by step id.
  const open = new Map<string, Effect>();
  // The latest uncertain effect of each step, for the creator's choice.
  const lastUncertain = new Map<string, Effect>();
  for (const e of events) {
    if (e.step < 0 && e.state !== "resolved") continue;
    if (e.state === "attempted") {
      const effect: Effect = { step: e.step, stepId: e.stepId, kind: e.kind, at: e.at, state: "uncertain", waiting: true, note: "", choice: "" };
      effects.push(effect);
      open.set(e.stepId, effect);
      continue;
    }
    if (OUTCOMES.has(e.state)) {
      let effect = open.get(e.stepId);
      if (!effect) {
        // Its attempt is no longer in the history (let go with the earliest events): the outcome still counts.
        effect = { step: e.step, stepId: e.stepId, kind: e.kind, at: e.at, state: "uncertain", waiting: true, note: "", choice: "" };
        effects.push(effect);
      }
      effect.state = e.state as EffectState;
      effect.waiting = false;
      effect.note = e.note;
      if (e.state === "uncertain") lastUncertain.set(e.stepId, effect);
      else lastUncertain.delete(e.stepId);
      open.delete(e.stepId);
      continue;
    }
    if (e.state === "resolved") {
      const effect = lastUncertain.get(e.stepId);
      if (effect) {
        effect.choice = e.note;
        lastUncertain.delete(e.stepId);
      }
    }
  }
  const counts = { attempted: effects.length, confirmed: 0, failed: 0, uncertain: 0 };
  for (const effect of effects) counts[effect.state] += 1;
  const markedByYou = effects.filter((effect) => effect.state === "uncertain" && /^Marked as done by you/.test(effect.choice)).length;
  return { effects, counts, markedByYou, trimmed: events.length > 0 && events[0].state !== "started" };
}
