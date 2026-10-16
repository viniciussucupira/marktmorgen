"use client";

import { useState } from "react";
import { useLeaveGuard } from "@/components/leave-guard";
import { formDealDraft } from "@/lib/form-deal";
import { crmAnswer } from "@/lib/crm-response";
import { MAX_DEAL_NOTE, MAX_DEAL_TITLE, type Stage } from "@/lib/crm-rules";
import type { FormDef, FormResponse } from "@/lib/forms";

export function FormResponseDeal({ form, response, stages, sid, onClose }: { form: FormDef; response: FormResponse; stages: Stage[]; sid: string; onClose: () => void }) {
  const [draft, setDraft] = useState(() => ({ ...formDealDraft(form, response), stage: stages.find(stage => stage.kind === "open")?.id ?? "", nextAction: "Review form response" }));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState("");
  const dealsHref = "/studio/deals" + (sid ? "?store=" + encodeURIComponent(sid) : "");
  useLeaveGuard(!saved);
  async function save() {
    if (busy || saved || uncertain || !draft.title.trim() || !draft.stage) return;
    if (draft.email.trim() && !/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(draft.email.trim())) { setError("Enter a valid contact email or leave it empty."); return; }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/store/crm", { method: "POST", headers: { "Content-Type": "application/json", ...(sid ? { "x-nimbus-store": sid } : {}) }, body: JSON.stringify({ action: "deal", deal: { title: draft.title, email: draft.email, note: draft.note, stage: draft.stage, nextAction: draft.nextAction, cents: 0 } }) });
      const answer = crmAnswer(response.ok, await response.json().catch(() => null));
      if (answer.ok) { setSaved(true); return; }
      if (answer.error === "crm_write_unconfirmed") { setUncertain(true); setError("Creation could not be confirmed and may already have happened. Check Deals before creating another opportunity."); }
      else setError(answer.error === "full" ? "The store has reached its deal limit. Review Deals before adding more." : "The opportunity could not be created. Check your access, the selected stage and the saved CRM data before trying again.");
    } catch { setUncertain(true); setError("Creation could not be confirmed and may already have happened. Check Deals before creating another opportunity."); }
    finally { setBusy(false); }
  }
  return <section aria-label="Create opportunity from form response" className="card mt-6 p-5 sm:p-8">
    <h3 className="text-lg font-semibold">Review this response as an opportunity</h3>
    {saved ? <p className="notice notice-success mt-4" role="status">Opportunity created. Continue tracking it in Deals.</p> : <fieldset disabled={busy || uncertain} className="mt-4 space-y-4">
      <legend className="sr-only">Opportunity details</legend>
      <p className="text-sm text-ink-soft">Review the submitted information before saving. This creates a deal with no estimated value; it does not send email or subscribe anyone to marketing.</p>
      <label className="block"><span className="field-label">Opportunity name</span><input className="field mt-2" maxLength={MAX_DEAL_TITLE} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
      <label className="block"><span className="field-label">Contact email (optional)</span><input className="field mt-2" type="email" maxLength={254} value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} /></label>
      <label className="block"><span className="field-label">Stage</span><select className="field mt-2" value={draft.stage} onChange={event => setDraft({ ...draft, stage: event.target.value })}>{stages.filter(stage => stage.kind === "open").map(stage => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></label>
      <label className="block"><span className="field-label">Response summary</span><textarea className="field mt-2" rows={6} maxLength={MAX_DEAL_NOTE} value={draft.note} onChange={event => setDraft({ ...draft, note: event.target.value })} /></label>
      {draft.truncated ? <p className="text-xs text-ink-soft">The response exceeds the {MAX_DEAL_NOTE}-character deal note limit. Only its beginning is included here. Keep the relevant details; the original response remains in Forms.</p> : null}
      <label className="block"><span className="field-label">Next action</span><input className="field mt-2" maxLength={200} value={draft.nextAction} onChange={event => setDraft({ ...draft, nextAction: event.target.value })} /></label>
    </fieldset>}
    {error ? <p className="notice notice-error mt-4" role="alert">{error}</p> : null}
    <div className="mt-5 flex flex-wrap gap-3">
      {!saved ? <button type="button" className="btn btn-primary" disabled={busy || uncertain || !draft.title.trim() || !draft.stage} onClick={() => void save()} aria-busy={busy}>{busy ? "Creating opportunity…" : "Create opportunity"}</button> : null}
      <a className="btn btn-secondary" href={dealsHref}>Open Deals</a>
      <button type="button" className="btn btn-secondary" disabled={busy || uncertain} onClick={onClose}>{saved ? "Close" : "Cancel"}</button>
    </div>
  </section>;
}
