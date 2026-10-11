import type { NextRequest } from "next/server";
import { away, creatorFrom } from "@/lib/studio-route";
import { isBillingConfigured } from "@/lib/billing";
import { limited } from "@/lib/request-guard";
import { confirmPause, pausePlan, undoPause } from "@/lib/plan-pause";
import { parsePauseMonths } from "@/lib/plan-pause-rules";

/**
 * Takes a break from the plan, or takes the break back (lib/plan-pause.ts).
 *
 * Like cancelling, the studio's button is the whole of it, and the
 * subscription is read from the creator's own store record: nothing in the
 * form names which subscription to touch.
 */
export async function POST(request: NextRequest) {
  const creator = await creatorFrom(request, "billing");
  if (creator instanceof Response) return creator;
  const { store, origin, studio } = creator;
  if (!isBillingConfigured()) return away(origin, studio("billing=unavailable"));

  let intent = "";
  let months: unknown = null;
  try {
    const form = await (await limited(request, 8_000)).formData();
    const value = form.get("intent");
    intent = typeof value === "string" ? value : "";
    months = form.get("months");
  } catch {
    intent = "";
  }

  try {
    if (intent === "undo") {
      const done = await undoPause(store);
      return away(origin, studio(done === "kept" ? "billing=pause-undone" : "billing=pause-dropped"));
    }
    const length = parsePauseMonths(months);
    if (intent !== "pause" || !length || !store.subscriptionId) return away(origin, studio("billing=pause-error"));
    const result = await pausePlan(store, length);
    if (result.kind === "refused") return away(origin, studio(`billing=pause-${result.reason}`));
    await confirmPause(store, result.record);
    return away(origin, studio("billing=paused"));
  } catch (error) {
    console.error("taking a break from the plan failed", error);
    return away(origin, studio("billing=pause-error"));
  }
}
