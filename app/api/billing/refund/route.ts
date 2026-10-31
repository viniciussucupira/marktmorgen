import type { NextRequest } from "next/server";
import { away, creatorFrom, studioPath } from "@/lib/studio-route";
import { limited, withinLimit } from "@/lib/request-guard";
import { refundAndEndPlan, takeReview } from "@/lib/plan-refund-flow";

/** Up to the refund's reading, its write and the plan's ending; a request cut short is finished by the daily job. */
export const maxDuration = 120;

/** Refund requests a store may send in a day: each one reads Stripe a bounded number of times. */
const PER_DAY = 10;

/**
 * The plan refund, confirmed on its review page (app/studio/refund): 305
 * [SY1]. Only the store's owner, only with the one-time pass that page
 * issued when it showed the amount (so no refund is made without the review
 * screen), and the store and subscription come from the session, never from
 * the form. The whole of it is lib/plan-refund-flow.ts: the plan set to stop,
 * the refund made once, the plan ended, the creator emailed.
 */
export async function POST(request: NextRequest) {
  const creator = await creatorFrom(request, "billing");
  if (creator instanceof Response) return creator;
  const { store, origin, role } = creator;
  // Every answer is told on the review page, which says what happened and what to do next.
  const told = (done: string) => away(origin, studioPath(store, `done=${done}`, "refund"));
  if (role !== "owner") return told("owner");

  let token = "";
  try {
    const value = (await (await limited(request, 4_000)).formData()).get("review");
    token = typeof value === "string" ? value : "";
  } catch {
    token = "";
  }
  if (!(await withinLimit("plan-refund", store.sid || store.handle, PER_DAY, 86_400))) return told("later");
  // The pass is taken before anything else: a second click or an old tab has none.
  const shown = await takeReview(store.sid, token);
  if (shown === null) return told("review");

  const done = await refundAndEndPlan(store, undefined, shown);
  if (done.ok) return told(done.ended ? "refunded" : "ending");
  if (done.reason === "busy") return told("busy");
  if (done.reason === "changed") return told("changed");
  if (done.reason === "failed" || done.reason === "stop_failed" || done.reason === "no_lock") {
    return told(done.stopLeft ? "error-stop" : "error");
  }
  // Not owed or not decidable now: the review page says why, with the way to support.
  return told("none");
}
