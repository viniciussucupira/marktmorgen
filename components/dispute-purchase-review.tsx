"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStudioStore } from "@/components/studio-store-pin";
import { formatMoney } from "@/lib/money";
import type { DisputePurchaseReview } from "@/lib/dispute-purchase-review";

type Success = Extract<DisputePurchaseReview, { ok: true }>;
type State = { kind: "idle" | "loading" } | { kind: "error"; message: string } | { kind: "ready"; result: Success };
function object(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function whole(value: unknown): boolean { return typeof value === "number" && Number.isSafeInteger(value) && value >= 0; }
function resultOf(value: unknown): Success | null {
  const r = object(value), b = object(r?.binding);
  if (!r || !b || r.ok !== true || r.submitted !== false) return null;
  if (["account", "dispute", "purchase", "charge", "paymentIntent", "buyerEmail", "product", "currency"].some(key => typeof b[key] !== "string" || !(b[key] as string).length || (b[key] as string).length > 254)) return null;
  if (b.title !== null && (typeof b.title !== "string" || b.title.length > 480)) return null;
  if (["checkoutCreatedAt", "chargeCreatedAt", "amount", "disputedAmount"].some(key => !whole(b[key]))) return null;
  if (r.responseDeadline !== null && !whole(r.responseDeadline)) return null;
  if (r.submissionCount !== null && !whole(r.submissionCount)) return null;
  if (r.pastDue !== null && typeof r.pastDue !== "boolean") return null;
  if (r.reason !== null && (typeof r.reason !== "string" || !/^[a-z_]{1,64}$/.test(r.reason))) return null;
  return r as unknown as Success;
}
function dateWords(value: number | null): string {
  if (value === null || !Number.isSafeInteger(value) || value < 0 || value > 8_640_000_000_000) return "Unknown";
  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}
function refusal(value: unknown): string {
  const r = object(value), code = r?.reason ?? r?.error;
  if (code === "invalid") return "Enter the dispute reference shown in your Stripe account.";
  if (code === "signed_out" || code === "locked") return "Sign in again to finish your security check, then try again.";
  if (code === "forbidden" || code === "gone") return "You cannot review this store's buyer records. Return to your studio.";
  if (code === "allowance" || code === "used") return "This store cannot cover another lookup right now. Nothing was sent to the bank.";
  if (code === "funding") return "This review is not available for this store yet. Nothing was sent to the bank.";
  return "The dispute and purchase could not be verified. Try again later; an unavailable result does not mean there is no dispute.";
}
export function DisputePurchaseReviewPanel({ connected }: { connected: boolean }) {
  const sid = useStudioStore();
  const [state, setState] = useState<State>({ kind: "idle" });
  const controller = useRef<AbortController | null>(null);
  const feedback = useRef<HTMLDivElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (state.kind === "ready" || state.kind === "error") feedback.current?.focus(); }, [state.kind]);
  async function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!connected || !sid || state.kind === "loading") return;
    const form = new FormData(event.currentTarget);
    const dispute = String(form.get("dispute") ?? "").trim();
    controller.current?.abort();
    const active = new AbortController(); controller.current = active;
    setState({ kind: "loading" }); // Previous buyer data is removed immediately.
    const timer = setTimeout(() => {
      if (controller.current === active) {
        active.abort();
        setState({ kind: "error", message: "The review took too long. Try again when your connection is ready; nothing was sent to the bank." });
      }
    }, 20_000);
    try {
      const response = await fetch("/api/store/disputes", {
        method: "POST", credentials: "same-origin", cache: "no-store", signal: active.signal,
        headers: { "Content-Type": "application/json", "x-nimbus-store": sid },
        body: JSON.stringify({ action: "review", dispute }),
      });
      const payload: unknown = await response.json();
      if (controller.current !== active || active.signal.aborted) return;
      const result = response.ok ? resultOf(payload) : null;
      setState(result ? { kind: "ready", result } : { kind: "error", message: refusal(payload) });
    } catch {
      if (controller.current === active && !active.signal.aborted) setState({ kind: "error", message: refusal(null) });
    } finally { clearTimeout(timer); }
  }
  const loading = state.kind === "loading";
  const result = state.kind === "ready" ? state.result : null;
  return <div className="mt-8 max-w-3xl space-y-6">
    <p id="dispute-lookup-help" className="text-sm text-ink-soft">A lookup uses up to two calls from your existing connected-service allowance. Nothing is submitted to the bank from this page.</p>
    {!connected ? <p className="notice">The store&apos;s owner needs to connect Stripe before a purchase record can be reviewed.</p> : null}
    <form method="post" action={sid ? "/api/store/disputes?store=" + encodeURIComponent(sid) : "/api/store/disputes"} onSubmit={review} aria-busy={loading} aria-describedby="dispute-lookup-help">
      <noscript><p className="notice">JavaScript is needed to review this purchase here. Nothing is sent automatically.</p></noscript>
      <fieldset disabled={loading || !connected || !sid} className="space-y-4">
        <legend className="sr-only">Find one disputed purchase</legend>
        <div><label htmlFor="dispute-reference" className="block font-semibold">Stripe dispute reference</label>
          <input id="dispute-reference" name="dispute" required pattern="du_[A-Za-z0-9]{1,128}" maxLength={132} autoComplete="off" spellCheck={false} placeholder="du_…" className="input mt-2 w-full" aria-describedby="dispute-reference-hint" />
          <p id="dispute-reference-hint" className="mt-2 text-sm text-ink-soft">Copy the reference beginning with du_ from this store&apos;s Stripe account.</p>
        </div>
        <button type="submit" className="btn btn-primary min-h-11">{loading ? "Reviewing purchase…" : "Review purchase record"}</button>
      </fieldset>
    </form>
    {loading ? <p role="status">Reviewing this store&apos;s purchase record…</p> : null}
    {state.kind === "error" ? <div ref={feedback} tabIndex={-1} role="alert" className="notice scroll-mt-24">{state.message}</div> : null}
    {result ? <div ref={feedback} tabIndex={-1} role="region" aria-labelledby="dispute-result-heading" className="card scroll-mt-24 space-y-5 p-6">
      <h2 id="dispute-result-heading" className="text-xl font-semibold">Purchase record</h2>
      <p className="text-sm text-ink-soft">Current Stripe record for this store. It is not proof of historical terms or delivery. The bank decides the outcome; no estimate of the chance of winning is available.</p>
      <dl className="grid gap-4 sm:grid-cols-2">
        {[
          ["Dispute reference", result.binding.dispute], ["Checkout reference", result.binding.purchase],
          ["Charge reference", result.binding.charge], ["Buyer email", result.binding.buyerEmail],
          ["Title recorded by Stripe", result.binding.title ?? "Not recorded"],
          ["Captured amount", formatMoney(result.binding.amount, result.binding.currency)],
          ["Disputed amount", formatMoney(result.binding.disputedAmount, result.binding.currency)],
          ["Checkout created", dateWords(result.binding.checkoutCreatedAt)], ["Charge created", dateWords(result.binding.chargeCreatedAt)],
          ["Reason reported by Stripe", result.reason?.replaceAll("_", " ") ?? "Unknown"],
          ["Response deadline reported by Stripe", dateWords(result.responseDeadline)],
          ["Deadline passed, according to Stripe", result.pastDue === null ? "Unknown" : result.pastDue ? "Yes" : "No"],
          ["Previous submissions reported by Stripe", result.submissionCount === null ? "Unknown" : String(result.submissionCount)],
        ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm font-semibold text-ink-soft">{label}</dt><dd className="mt-1 break-words [overflow-wrap:anywhere]">{value}</dd></div>)}
      </dl>
      <p className="notice">Historical terms, refund-policy acceptance, delivery records and buyer messages have not been loaded. No evidence has been submitted.</p>
    </div> : null}
  </div>;
}
