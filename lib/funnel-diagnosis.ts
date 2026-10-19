/**
 * What a saved funnel's own counts point to (added 18 October 2026,
 * ClickFunnels audit row F54). Deterministic and sample-aware: read only from
 * the counts the studio already shows beside each step (how many people
 * opened it, and for a product how many paid or signed up), never a model,
 * never a guess at why, and nothing is changed for the creator.
 *
 * The rules, in the order they are listed:
 *
 *   - unreached: a step nobody opened while the step before it was opened at
 *     least SAMPLE_VIEWS times. The likeliest fault is a button or link that
 *     does not lead there, so it says to check that.
 *   - none_completed: a product step opened at least SAMPLE_VIEWS times that
 *     nobody paid for (or signed up to, for a free one).
 *   - largest_fall: between two steps whose first was opened at least
 *     SAMPLE_VIEWS times, the one where the second was opened by the smallest
 *     share of the first's, listed only when that share is under half.
 *     Visitors may enter at different steps, so this compares counts, not
 *     the same people, and says so.
 *   - too_few: no step opened SAMPLE_VIEWS times yet (then nothing else is
 *     judged), or some steps below it (named, and left unjudged).
 *   - unavailable: a step whose counts could not be read is named and left
 *     out of every comparison; an unavailable count is never read as zero.
 *
 * A step that visitors cannot open is left to the launch review
 * (lib/funnel-launch-review.ts), which already lists it. Pure and
 * browser-safe: no store read, so it costs nothing per use.
 */
import { SAMPLE_VIEWS } from "@/lib/funnel-ai-rules";

export { SAMPLE_VIEWS };

export type DiagnosisStep = { title: string; open: boolean; product: boolean; free: boolean; seen: number | null; done: number | null };

export type FunnelFindingCode = "unreached" | "none_completed" | "largest_fall" | "too_few" | "unavailable";

export type FunnelFinding = {
  code: FunnelFindingCode;
  /** The step whose editor the finding sends the creator to, when there is one. */
  stepIndex?: number;
  title: string;
  detail: string;
};

/** The share under which the fall between two steps is pointed out. */
export const FALL_SHARE = 0.5;

/** Said under every list of findings. */
export const DIAGNOSIS_NOTE =
  "Read from the counts above, since the steps were last changed. They point to where to look; they do not say why visitors did what they did, and nothing is changed for you.";

const confirmed = (value: number | null): value is number => value !== null && Number.isSafeInteger(value) && value >= 0;
const n = (value: number) => value.toLocaleString("en-US");
const times = (value: number) => `${n(value)} ${value === 1 ? "time" : "times"}`;
const people = (value: number) => `${n(value)} ${value === 1 ? "person" : "people"}`;
const named = (steps: readonly DiagnosisStep[], i: number) => `step ${i + 1} (“${steps[i].title}”)`;
const list = (indexes: number[]) =>
  indexes.length === 1 ? `Step ${indexes[0] + 1}` : `Steps ${indexes.slice(0, -1).map((i) => i + 1).join(", ")} and ${indexes[indexes.length - 1] + 1}`;

function capital(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function funnelFindings(steps: readonly DiagnosisStep[]): FunnelFinding[] {
  const readable = (i: number) => steps[i].open && confirmed(steps[i].seen);
  const out: FunnelFinding[] = [];

  const unavailable = steps.map((step, i) => (step.open && (!confirmed(step.seen) || (step.product && !confirmed(step.done))) ? i : -1)).filter((i) => i >= 0);
  const counted = steps.map((_, i) => i).filter(readable);
  const most = counted.reduce<number | null>((best, i) => (best === null || (steps[i].seen as number) > (steps[best].seen as number) ? i : best), null);

  if (most === null || (steps[most].seen as number) < SAMPLE_VIEWS) {
    if (most !== null) {
      out.push({
        code: "too_few",
        title: "Too few visits to judge this funnel yet",
        detail: `No step has been opened ${n(SAMPLE_VIEWS)} times yet; the most is ${named(steps, most)}, opened ${times(steps[most].seen as number)}. Nothing here is judged until a step reaches ${n(SAMPLE_VIEWS)}.`,
      });
    }
  } else {
    for (let i = 1; i < steps.length; i += 1) {
      if (!readable(i) || !readable(i - 1)) continue;
      const before = steps[i - 1].seen as number;
      if (before >= SAMPLE_VIEWS && steps[i].seen === 0) {
        out.push({
          code: "unreached",
          stepIndex: i - 1,
          title: `Nobody reached step ${i + 1}`,
          detail: `${capital(named(steps, i))} was opened by nobody, while ${named(steps, i - 1)} was opened ${times(before)}. Check that the button or link on step ${i} leads to step ${i + 1}.`,
        });
      }
    }

    for (const i of counted) {
      const step = steps[i];
      const seen = step.seen as number;
      if (!step.product || seen < SAMPLE_VIEWS || step.done !== 0) continue;
      out.push({
        code: "none_completed",
        stepIndex: i,
        title: `Nobody ${step.free ? "signed up" : "paid"} at step ${i + 1}`,
        detail: `${people(seen)} opened ${named(steps, i)} and nobody ${step.free ? "signed up" : "paid"}. Read its price, its page and its ${step.free ? "sign-up form" : "checkout"} as a ${step.free ? "visitor" : "buyer"} would.`,
      });
    }

    let fall: { i: number; share: number } | null = null;
    for (let i = 1; i < steps.length; i += 1) {
      if (!readable(i) || !readable(i - 1)) continue;
      const before = steps[i - 1].seen as number;
      const after = steps[i].seen as number;
      if (before < SAMPLE_VIEWS || after === 0) continue;
      const share = after / before;
      if (share < FALL_SHARE && (fall === null || share < fall.share)) fall = { i, share };
    }
    if (fall) {
      const before = steps[fall.i - 1].seen as number;
      const after = steps[fall.i].seen as number;
      const percent = Math.max(1, Math.round(fall.share * 100));
      out.push({
        code: "largest_fall",
        stepIndex: fall.i - 1,
        title: `The largest fall is after step ${fall.i}`,
        detail: `${capital(named(steps, fall.i))} was opened by ${people(after)}, ${percent}% of the ${n(before)} who opened ${named(steps, fall.i - 1)}: the largest fall between two steps here. Read step ${fall.i} as a visitor would: what it asks of them, and where its button goes. Visitors may enter at different steps, so this compares counts, not the same people.`,
      });
    }

    const thin = counted.filter((i) => {
      const seen = steps[i].seen as number;
      return seen > 0 && seen < SAMPLE_VIEWS;
    });
    if (thin.length) {
      out.push({
        code: "too_few",
        title: thin.length === 1 ? `Step ${thin[0] + 1} has too few visits to judge` : "Some steps have too few visits to judge",
        detail: `${list(thin)} ${thin.length === 1 ? "was" : "were"} opened fewer than ${n(SAMPLE_VIEWS)} times, so nothing is said about ${thin.length === 1 ? "it" : "them"} yet.`,
      });
    }
  }

  if (unavailable.length) {
    out.push({
      code: "unavailable",
      title: "Some counts could not be read",
      detail: `${list(unavailable)}: the counts could not be read just now, so ${unavailable.length === 1 ? "it is" : "they are"} left out. Reload to try again.`,
    });
  }
  return out.slice(0, 8);
}
