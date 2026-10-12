/**
 * Asking a member why before they cancel, and answering with what fits
 * (added 12 October 2026; the page is app/[handle]/manage/leave, the server
 * side lib/leave-flow.ts).
 *
 * Read before it was built: Paddle Retain's Cancellation Flows ask the reason
 * first and answer it, keeping the discount for last; Baremetrics sums the
 * answers as Cancellation Insights. Until now a member who pressed Cancel here
 * went straight to Stripe's page, which asks from Stripe's fixed list and can
 * offer only a coupon. With this on, the store's own page asks first, from
 * the reasons the creator chose and up to three of their own, and answers:
 *
 *   - "It costs too much": a cheaper plan of the store, and a pause;
 *   - "I don't use it enough": a pause;
 *   - something missing, too hard, not good enough, not helped, or one of the
 *     creator's own reasons: a way to write to the creator;
 *   - then, as before, Stripe's page, with the creator's discount if they set
 *     one: the discount comes last.
 *
 * Answering is never required. "Cancel my membership" is on the page from
 * the first moment, one press away, and the question is asked once: Stripe's
 * page does not ask it again. Off for every store until its creator turns it on.
 *
 * Browser-safe.
 */

export const LEAVE_REASONS = ["too_expensive", "unused", "missing_features", "switched_service", "too_complex", "low_quality", "customer_service", "other"] as const;
export type LeaveReason = (typeof LEAVE_REASONS)[number];
export const LEAVE_NAMES: Record<LeaveReason, string> = {
  too_expensive: "It costs too much",
  unused: "I don't use it enough",
  missing_features: "Something I need is missing",
  switched_service: "I moved to something else",
  too_complex: "It's too hard to use",
  low_quality: "The quality isn't good enough",
  customer_service: "I wasn't helped when I asked",
  other: "Another reason",
};
export const isLeaveReason = (value: string): value is LeaveReason => (LEAVE_REASONS as readonly string[]).includes(value);

/** A reason the creator wrote, with an id that never changes so answers keep adding up. */
export type OwnReason = { id: string; text: string };
export const MAX_OWN_REASONS = 3;
export const MAX_OWN_REASON_LENGTH = 80;
const OWN_ID = /^own_[0-9a-f]{6}$/;
export const isOwnReasonId = (value: string) => OWN_ID.test(value);

export type LeaveSetting = { on: boolean; reasons: LeaveReason[]; own: OwnReason[] };
export const NO_LEAVE: LeaveSetting = { on: false, reasons: [...LEAVE_REASONS], own: [] };

export function parseLeave(raw: unknown): LeaveSetting {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const picked = Array.isArray(value.reasons) ? value.reasons.filter((r): r is LeaveReason => typeof r === "string" && isLeaveReason(r)) : [...LEAVE_REASONS];
  // In the list's own order, each once; "Another reason" is always offered, so nobody is left without an answer that fits.
  const reasons = LEAVE_REASONS.filter((r) => picked.includes(r) || r === "other");
  const own: OwnReason[] = [];
  for (const item of Array.isArray(value.own) ? value.own : []) {
    if (!item || typeof item !== "object") continue;
    const { id, text } = item as { id?: unknown; text?: unknown };
    const clean = typeof text === "string" ? text.replace(/\s+/g, " ").trim().slice(0, MAX_OWN_REASON_LENGTH) : "";
    if (typeof id === "string" && OWN_ID.test(id) && clean && !own.some((o) => o.id === id) && own.length < MAX_OWN_REASONS) own.push({ id, text: clean });
  }
  return { on: value.on === true, reasons, own };
}

/** What a reason is answered with, before the way out. */
export type LeaveAnswer = { cheaper: boolean; pause: boolean; contact: boolean };

export function answerFor(reason: string): LeaveAnswer {
  if (reason === "too_expensive") return { cheaper: true, pause: true, contact: false };
  if (reason === "unused") return { cheaper: false, pause: true, contact: false };
  if (reason === "missing_features" || reason === "too_complex" || reason === "low_quality" || reason === "customer_service" || isOwnReasonId(reason)) {
    return { cheaper: false, pause: false, contact: true };
  }
  return { cheaper: false, pause: false, contact: false };
}

/** Whether a reason is one this store offers. */
export function offers(setting: LeaveSetting, reason: string): boolean {
  return (isLeaveReason(reason) && setting.reasons.includes(reason)) || setting.own.some((o) => o.id === reason);
}
