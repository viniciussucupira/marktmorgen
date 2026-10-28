/**
 * Private, read-only DE1 lookup. The caller must first authenticate and authorize
 * the creator for this store. This module is not a public route or a submission.
 * Genuine paid-window funding and a service allowance are required before reads.
 */
import { type Store, saleHandles } from "@/lib/store";
import { reservePaidResourceWindow } from "@/lib/contract-resource-window";
import { takeAllowance } from "@/lib/store-allowance";
import { onAccount } from "@/lib/stripe-account";
import { bindStripeDisputePurchase, type StripePurchaseBinding } from "@/lib/dispute-purchase-binding";

type Row = Record<string, unknown>;
function row(value: unknown): Row | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Row : null;
}
function objectId(value: unknown, prefix: string): string | null {
  const candidate = typeof value === "string" ? value : row(value)?.id;
  return typeof candidate === "string" && new RegExp("^" + prefix + "_[A-Za-z0-9]{1,128}$").test(candidate) ? candidate : null;
}
function count(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}
export type DisputePurchaseReview =
  | { ok: false; reason: "invalid" | "funding" | "allowance" | "unsupported" | "unavailable" }
  | {
      ok: true; binding: StripePurchaseBinding; reason: string | null;
      responseDeadline: number | null; pastDue: boolean | null; submissionCount: number | null;
      submitted: false;
      /** Stripe metadata is a current provider record, not immutable historical policy acceptance. */
      history: "Historical terms, policy acceptance and delivery evidence have not been loaded.";
    };

export async function readDisputePurchaseReview(store: Store, disputeId: string): Promise<DisputePurchaseReview> {
  const account = store.stripeAccountId;
  if (!account || !objectId(account, "acct") || !objectId(disputeId, "du")) return { ok: false, reason: "invalid" };
  try {
    if (!(await reservePaidResourceWindow({ ...store, statsId: store.statsId ?? null, tier: store.tier ?? "creator" }))) {
      return { ok: false, reason: "funding" };
    }
    // Each attempted provider call takes one existing integration unit before
    // that call. A first-call failure never consumes a second unused unit.
    if (!(await takeAllowance(store, "integration")).ok) return { ok: false, reason: "allowance" };
    const dispute = await onAccount("GET", account, "/disputes/" + encodeURIComponent(disputeId), undefined, undefined, undefined, 5_000);
    if (dispute.object !== "dispute" || dispute.id !== disputeId || typeof dispute.livemode !== "boolean") {
      return { ok: false, reason: "unavailable" };
    }
    const intentId = objectId(dispute.payment_intent, "pi");
    if (!intentId) return { ok: false, reason: "unsupported" };
    if (!(await takeAllowance(store, "integration")).ok) return { ok: false, reason: "allowance" };
    const query = new URLSearchParams({ payment_intent: intentId, limit: "2" });
    query.set("expand[]", "data.payment_intent.latest_charge");
    const listed = await onAccount("GET", account, "/checkout/sessions?" + query.toString(), undefined, undefined, undefined, 5_000);
    if (listed.object !== "list" || listed.has_more !== false || !Array.isArray(listed.data) || listed.data.length !== 1) {
      return { ok: false, reason: "unavailable" };
    }
    const session = row(listed.data[0]);
    const intent = row(session?.payment_intent);
    const charge = row(intent?.latest_charge);
    if (!session || !intent || !charge || [session, intent, charge].some(item => item.livemode !== dispute.livemode)) {
      return { ok: false, reason: "unavailable" };
    }
    const binding = bindStripeDisputePurchase({ account, saleHandles: saleHandles(store), dispute, session });
    if (!binding) return { ok: false, reason: "unavailable" };
    const details = row(dispute.evidence_details);
    const deadline = count(details?.due_by);
    return {
      ok: true, binding,
      reason: typeof dispute.reason === "string" && /^[a-z_]{1,64}$/.test(dispute.reason) ? dispute.reason : null,
      responseDeadline: deadline && deadline > 0 ? deadline : null,
      pastDue: typeof details?.past_due === "boolean" ? details.past_due : null,
      submissionCount: count(details?.submission_count),
      submitted: false,
      history: "Historical terms, policy acceptance and delivery evidence have not been loaded.",
    };
  } catch {
    // Provider errors can contain buyer data: never log or echo their content.
    return { ok: false, reason: "unavailable" };
  }
}
