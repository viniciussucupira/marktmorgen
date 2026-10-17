"use client";

/**
 * Pay per lead in the studio (added 18 October 2026; lib/affiliate-leads.ts):
 * the terms, inside the program's own form, and the leads waiting for the
 * creator, with what each one is and what the affiliate is shown about it.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toast";
import { fieldPrefix, formatMoney } from "@/lib/money";
import {
  LEAD_REASONS,
  type LeadKind,
  type LeadReason,
  type LeadStatus,
  MAX_LEAD_CAP,
  MAX_LEAD_HOLD_DAYS,
  MIN_LEAD_HOLD_DAYS,
  hourlyLeads,
} from "@/lib/affiliate-lead-rules";

export type LeadTermsState = { kind: LeadKind | "none"; amount: string; hold: string; daily: string; budget: string };

const KIND_LABEL: Record<LeadKind, string> = {
  signup: "A confirmed email sign-up to your list",
  free: "A free product claimed",
  booking: "A booked call that took place",
};

const KIND_NOTE: Record<LeadKind, string> = {
  signup:
    "Counted once the person presses the button in the email that asks them to confirm, and only for an address that was not on your list. Through the sign-up box on your store and any form that offers your list.",
  free: "Counted once the person opens the emailed link to their free product, the first time that address gets it.",
  booking:
    "Counted for a paid booking once its call's time has passed and it was not refunded: you approve it only if the call took place. It earns on top of the share of the sale, if the call earns one.",
};

export const REASON_LABEL: Record<LeadReason, string> = {
  fake: "Not a real person",
  duplicate: "The same person under another address",
  "no-show": "The call did not take place",
  other: "Another reason",
};

export const STATUS_LABEL: Record<LeadStatus, string> = {
  "waiting for the call": "Waiting for the call",
  "in hold": "In hold",
  "needs approval": "Needs your approval",
  approved: "Approved: payable",
  "not genuine": "Reversed: not genuine",
  refunded: "Reversed: refunded",
  "over daily cap": "Over the daily cap: earns nothing",
  "over hourly limit": "Over the hourly limit: earns nothing",
  "over monthly budget": "Over the monthly budget: earns nothing",
};

/** The terms, as fields of the program's form; saved with it. */
export function LeadTerms({ value, onChange, currency }: { value: LeadTermsState; onChange: (next: LeadTermsState) => void; currency: string }) {
  const prefix = fieldPrefix(currency) || currency.toUpperCase();
  const set = (patch: Partial<LeadTermsState>) => onChange({ ...value, ...patch });
  const daily = Number(value.daily);
  return (
    <fieldset className="mt-5 rounded-2xl border border-line bg-paper p-4">
      <legend className="field-label px-1">Pay per lead (optional)</legend>
      <label className="block" htmlFor="lead-kind">
        <span className="text-xs text-ink-soft">A fixed amount for each confirmed</span>
        <select id="lead-kind" value={value.kind} onChange={(e) => set({ kind: e.target.value as LeadTermsState["kind"] })} className="field">
          <option value="none">No pay per lead</option>
          {(Object.keys(KIND_LABEL) as LeadKind[]).map((kind) => (
            <option key={kind} value={kind}>
              {KIND_LABEL[kind]}
            </option>
          ))}
        </select>
      </label>
      {value.kind === "none" ? (
        <p className="mt-2 text-xs text-ink-soft">Affiliates earn on sales only.</p>
      ) : (
        <>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">{KIND_NOTE[value.kind]}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block" htmlFor="lead-amount">
              <span className="text-xs text-ink-soft">{`Per lead (${prefix})`}</span>
              <input id="lead-amount" inputMode="decimal" value={value.amount} onChange={(e) => set({ amount: e.target.value })} className="field" placeholder="5" required />
            </label>
            <label className="block" htmlFor="lead-budget">
              <span className="text-xs text-ink-soft">{`Monthly budget for all leads (${prefix})`}</span>
              <input id="lead-budget" inputMode="decimal" value={value.budget} onChange={(e) => set({ budget: e.target.value })} className="field" placeholder="500" required />
            </label>
            <label className="block" htmlFor="lead-daily">
              <span className="text-xs text-ink-soft">Leads that earn per affiliate a day</span>
              <input id="lead-daily" type="number" inputMode="numeric" min={1} max={MAX_LEAD_CAP} step={1} value={value.daily} onChange={(e) => set({ daily: e.target.value })} className="field" required />
            </label>
            <label className="block" htmlFor="lead-hold">
              <span className="text-xs text-ink-soft">{`Days in hold before you approve (${MIN_LEAD_HOLD_DAYS} to ${MAX_LEAD_HOLD_DAYS})`}</span>
              <input id="lead-hold" type="number" inputMode="numeric" min={MIN_LEAD_HOLD_DAYS} max={MAX_LEAD_HOLD_DAYS} step={1} value={value.hold} onChange={(e) => set({ hold: e.target.value })} className="field" required />
            </label>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            {`One lead per person in your program, written any way (a "+" tag or Gmail's dots count as the same address); never an affiliate's own address or yours. Each affiliate's leads earn up to the daily figure in a UTC day and ${Number.isInteger(daily) && daily > 0 ? hourlyLeads(daily) : "a quarter of it"} in an hour; past either, or past your monthly budget, a lead is listed for both of you and earns nothing. After its hold, a lead waits for your approval before it can be paid, and you can reverse any lead you find is not genuine; your affiliate sees the reason. You pay leads yourself, with your sales commissions. Each lead keeps the terms of the day it came.`}
          </p>
        </>
      )}
    </fieldset>
  );
}

export type LeadRow = {
  id: string;
  aff: string;
  kind: LeadKind;
  email: string;
  title: string;
  at: number;
  status: LeadStatus;
  commission: number;
  currency: string;
  readyAt: number;
  why: LeadReason | "";
};

const day = (seconds: number) => new Date(seconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

async function decide(payload: Record<string, unknown>): Promise<string | null> {
  try {
    const response = await fetch("/api/store/affiliates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "leads", ...payload }) });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (data.ok) return null;
    if (data.error === "lead_not_ready") return "That lead is no longer waiting for this. Reload the page to see where it stands.";
    if (data.error === "lead_reason") return "Pick why the lead is not genuine.";
    return "That could not be saved. Reload the page and try again.";
  } catch {
    return "That could not be saved. Check your connection and try again.";
  }
}

/** The leads affiliates brought, newest first, with the creator's decisions. */
export function LeadReview({ leads, total, who }: { leads: LeadRow[]; total: number; who: Record<string, string> }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState<Record<string, LeadReason>>({});
  const ready = leads.filter((l) => l.status === "needs approval");

  async function run(where: string, payload: Record<string, unknown>, done: string) {
    setBusy(where);
    setError(null);
    const problem = await decide(payload);
    setBusy(null);
    if (problem) {
      setError(problem);
      return;
    }
    toast(done);
    router.refresh();
  }

  return (
    <section aria-labelledby="leads-title" className="card p-6 sm:p-8">
      <h2 id="leads-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">{`Leads (${total})`}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Each confirmed lead an affiliate brought, with where it stands. Your affiliate sees the same status on their page, with
        the address shown as its first letter and its domain only.
      </p>
      {ready.length ? (
        <button
          type="button"
          className="btn btn-primary btn-sm mt-4"
          disabled={busy !== null}
          aria-busy={busy === "all"}
          onClick={() => run("all", { ids: ready.slice(0, 200).map((l) => l.id), decision: "approve" }, `${Math.min(ready.length, 200)} ${ready.length === 1 ? "lead" : "leads"} approved.`)}
        >
          {`Approve all ${Math.min(ready.length, 200)} ready ${ready.length === 1 ? "lead" : "leads"}`}
        </button>
      ) : null}
      {error ? (
        <p className="notice notice-error mt-3" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="mt-4 divide-y divide-line">
        {leads.map((lead) => (
          <li key={lead.id} className="py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="min-w-0">
                <span className="block font-semibold text-ink [overflow-wrap:anywhere]">{lead.email || "A person who asked to be deleted"}</span>
                <span className="block text-xs text-ink-soft [overflow-wrap:anywhere]">
                  {`${day(lead.at)} · ${KIND_LABEL[lead.kind]}${lead.title ? `: ${lead.title}` : ""} · by ${who[lead.aff] ?? "a removed affiliate"}`}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-semibold tabular-nums text-ink">{formatMoney(lead.commission, lead.currency)}</span>
                <span className="block text-xs font-semibold text-ink-soft">
                  {STATUS_LABEL[lead.status]}
                  {lead.status === "in hold" || lead.status === "waiting for the call" ? ` until ${day(lead.readyAt)}` : ""}
                  {lead.status === "not genuine" && lead.why ? ` (${REASON_LABEL[lead.why]})` : ""}
                </span>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {lead.status === "needs approval" ? (
                <button type="button" className="btn btn-secondary btn-sm" disabled={busy !== null} aria-busy={busy === `a-${lead.id}`} onClick={() => run(`a-${lead.id}`, { ids: [lead.id], decision: "approve" }, "Lead approved.")}>
                  {lead.kind === "booking" ? "It took place: approve" : "Approve"}
                </button>
              ) : null}
              {lead.status === "not genuine" ? (
                <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null} onClick={() => run(`o-${lead.id}`, { ids: [lead.id], decision: "reopen" }, "Reversal undone.")}>
                  Undo the reversal
                </button>
              ) : lead.status !== "refunded" ? (
                <>
                  <label className="sr-only" htmlFor={`why-${lead.id}`}>
                    Why it is not genuine
                  </label>
                  <select
                    id={`why-${lead.id}`}
                    className="field max-w-[16rem] py-1 text-sm"
                    value={reason[lead.id] ?? (lead.kind === "booking" ? "no-show" : "fake")}
                    onChange={(e) => setReason((all) => ({ ...all, [lead.id]: e.target.value as LeadReason }))}
                  >
                    {LEAD_REASONS.map((why) => (
                      <option key={why} value={why}>
                        {REASON_LABEL[why]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={busy !== null}
                    onClick={() => run(`r-${lead.id}`, { ids: [lead.id], decision: "reverse", why: reason[lead.id] ?? (lead.kind === "booking" ? "no-show" : "fake") }, "Lead reversed. It earns nothing.")}
                  >
                    Reverse: not genuine
                  </button>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {total > leads.length ? <p className="mt-3 text-xs text-ink-soft">{`The newest ${leads.length} are shown. Download everything (CSV) has every lead.`}</p> : null}
      <p className="mt-3 text-xs text-ink-soft">
        {`A lead approved and paid that you reverse later comes off what you owe that affiliate, as a refund does.`}
      </p>
    </section>
  );
}
