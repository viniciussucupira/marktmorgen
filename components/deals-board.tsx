"use client";

import { useLeaveGuard } from "@/components/leave-guard";
import { filterDeals } from "@/lib/crm-deal-filter";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { toast } from "@/components/toast";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";
import { formatMoney, moneyField, readMoney, type Currency } from "@/lib/money";
import {
  type CrmField,
  type Deal,
  FIELD_TYPES,
  type FieldType,
  MAX_CRM_FIELDS,
  MAX_DEAL_NOTE,
  MAX_DEAL_TITLE,
  MAX_FIELD_NAME,
  MAX_STAGE_NAME,
  MAX_STAGES,
  type Stage,
  type StageKind,
  boardTotals,
  dealFollowUps,
  newCrmId,
} from "@/lib/crm-rules";

const MESSAGES: Record<string, string> = {
  title: "Give the deal a name.",
  followup: "Write a next action before setting its date. Keep it within 200 characters.",
  date: "Choose a real calendar date.",
  assignee: "Choose someone on this store’s team who can read deals.",
  stage: "That stage is gone. Reload the page.",
  full: "This store has as many deals as it can keep. Remove some that are won or lost.",
  unknown: "That is already gone. Reload the page.",
  fields: "Each field needs a name of its own, and a choice needs at least two options.",
  stages: "Keep at least one open stage, one won and one lost, each with a name.",
  server_error: "Something went wrong. Nothing was changed. Try again.",
  ...STUDIO_MESSAGES,
};

async function call(body: Record<string, unknown>): Promise<{ ok?: boolean; error?: string }> {
  try {
    const response = await fetch("/api/store/crm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  } catch {
    return { error: "server_error" };
  }
}

type DealDraft = { id: string; title: string; email: string; value: string; stage: string; note: string; nextAction: string; dueDate: string; assignee: string };

function draftFromDeal(deal: Deal, currency: string): DealDraft {
  return { id: deal.id, title: deal.title, email: deal.email, value: deal.cents ? moneyField(deal.cents, currency) : "", stage: deal.stage, note: deal.note, nextAction: deal.nextAction ?? "", dueDate: deal.dueDate ?? "", assignee: deal.assignee ?? "" };
}

const KIND_WORDS: Record<StageKind, string> = { open: "Open", won: "Won", lost: "Lost" };

/**
 * A store's deals, stage by stage (lib/crm-rules.ts): what each is worth,
 * who it is with, and a way to move it on. The stages are the store's own,
 * and so are the fields kept about each person, made here too.
 */
export function DealsBoard({ deals, stages, fields, currency, assignees, today }: { deals: Deal[]; stages: Stage[]; fields: CrmField[]; currency: string; assignees: string[]; today: string }) {
  const router = useRouter();
  const money = (cents: number) => formatMoney(cents, currency);
  const [draft, setDraft] = useState<DealDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageDraft, setStageDraft] = useState<Stage[] | null>(null);
  const [fieldDraft, setFieldDraft] = useState<(CrmField & { optionsText: string })[] | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [responsible, setResponsible] = useState("all");
  const scopedDeals = filterDeals(deals, search, responsible === "all" ? null : responsible === "unassigned" ? "" : responsible.slice(7));
  const responsibleChoices = [...new Set([...assignees, ...deals.flatMap(d => d.assignee ? [d.assignee] : [])])].sort();
  const followUps = dealFollowUps(stages, scopedDeals, today);
  const visibleIds = filter === "all" ? null : new Set(followUps[filter as keyof typeof followUps].map(d => d.id));
  const totals = boardTotals(stages, deals);
  const columns = boardTotals(stages, scopedDeals.filter(d => !visibleIds || visibleIds.has(d.id)));
  const open = totals.filter((t) => t.stage.kind === "open");
  const won = totals.filter((t) => t.stage.kind === "won");

  async function run(body: Record<string, unknown>, done: string, after?: () => void) {
    setBusy(true);
    setError(null);
    const answer = await call(body);
    setBusy(false);
    if (answer.ok) {
      toast(done);
      after?.();
      router.refresh();
      return;
    }
    setError(MESSAGES[answer.error ?? ""] ?? MESSAGES.server_error);
  }

  function saveDeal() {
    if (!draft) return;
    const cents = draft.value.trim() ? readMoney(draft.value, currency as Currency) : 0;
    if (cents === null) {
      setError("Type what it is worth as a number, like 1500 or 1500.50.");
      return;
    }
    void run(
      { action: "deal", deal: { id: draft.id || undefined, title: draft.title, email: draft.email, cents, stage: draft.stage, note: draft.note, nextAction: draft.nextAction, dueDate: draft.dueDate, assignee: draft.assignee } },
      draft.id ? "Deal saved." : "Deal added.",
      () => setDraft(null),
    );
  }

  const firstOpen = stages.find((s) => s.kind === "open")?.id ?? stages[0]?.id ?? "";
  const original = draft?.id ? deals.find(deal => deal.id === draft.id) : null;
  const initialDeal = original ? draftFromDeal(original, currency) : { id: "", title: "", email: "", value: "", stage: firstOpen, note: "", nextAction: "", dueDate: "", assignee: "" };
  const initialFields = fields.map(field => ({ ...field, optionsText: field.options.join(", ") }));
  const dirty = (draft !== null && JSON.stringify(draft) !== JSON.stringify(initialDeal)) || (stageDraft !== null && JSON.stringify(stageDraft) !== JSON.stringify(stages)) || (fieldDraft !== null && JSON.stringify(fieldDraft) !== JSON.stringify(initialFields));
  useLeaveGuard(dirty);

  return (
    <div className="space-y-8">
      <section aria-labelledby="deals-title" className="card min-w-0 p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 max-w-2xl">
            <h2 id="deals-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
              Deals
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {`People you are talking to about something sold outside a checkout: a coaching package, a custom project. ${open.reduce((n, t) => n + t.count, 0)} open, worth ${money(open.reduce((n, t) => n + t.cents, 0))}; won so far, ${money(won.reduce((n, t) => n + t.cents, 0))}.`}
            </p>
          </div>
          {draft === null ? (
            <button type="button" className="btn btn-primary" onClick={() => { setError(null); setDraft({ id: "", title: "", email: "", value: "", stage: firstOpen, note: "", nextAction: "", dueDate: "", assignee: "" }); }}>
              <Icon name="plus" size={18} />
              New deal
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="block"><span className="field-label">Find a deal</span><input type="search" className="field mt-2" maxLength={80} value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email, next action or note" /></label><label className="block"><span className="field-label">Responsible teammate</span><select className="field mt-2" value={responsible} onChange={e => setResponsible(e.target.value)}><option value="all">Everyone</option><option value="unassigned">Unassigned</option>{responsibleChoices.map(email => <option key={email} value={"person:" + email}>{email}{assignees.includes(email) ? "" : " (no longer eligible)"}</option>)}</select></label></div>
        <p className="mt-2 text-xs text-ink-mute">The summary above includes all deals. Action counts and columns follow your search and teammate selection.</p>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter deals by next action">
          {([{ key: "all", label: "All deals" }, { key: "overdue", label: `Overdue (${followUps.overdue.length})` }, { key: "today", label: `Due today (${followUps.today.length})` }, { key: "upcoming", label: `Upcoming (${followUps.upcoming.length})` }, { key: "unplanned", label: `No dated action (${followUps.unplanned.length})` }]).map(item => <button key={item.key} type="button" aria-pressed={filter === item.key} className={`btn btn-sm ${filter === item.key ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter(item.key)}>{item.label}</button>)}
        </div>
        <p className="mt-2 text-xs text-ink-mute">Dates use the calendar day shown here, {today} (UTC). Won and lost deals are left out of action filters. Nothing is sent automatically.</p>

        {draft ? (
          <div className="mt-6 rounded-2xl border border-line bg-white p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="field-label">What it is</span>
                <input className="field mt-2" maxLength={MAX_DEAL_TITLE} value={draft.title} placeholder="Six coaching sessions for Dana" onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </label>
              <label className="block">
                <span className="field-label">Their email (optional)</span>
                <input className="field mt-2" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              </label>
              <label className="block">
                <span className="field-label">{`What it is worth, in ${currency.toUpperCase()} (optional)`}</span>
                <input className="field mt-2" inputMode="decimal" value={draft.value} placeholder="1500" onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
              </label>
              <label className="block">
                <span className="field-label">Stage</span>
                <select className="field mt-2" value={draft.stage} onChange={(e) => setDraft({ ...draft, stage: e.target.value })}>
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="field-label">Next action (optional)</span>
                <input className="field mt-2" maxLength={200} value={draft.nextAction} placeholder="Follow up on the proposal" onChange={e => setDraft({ ...draft, nextAction: e.target.value })} />
              </label>
              <label className="block">
                <span className="field-label">Action date (optional, UTC calendar date)</span>
                <input className="field mt-2" type="date" value={draft.dueDate} onChange={e => setDraft({ ...draft, dueDate: e.target.value })} />
              </label>
              <label className="block">
                <span className="field-label">Responsible teammate (optional)</span>
                <select className="field mt-2" value={draft.assignee} onChange={e => setDraft({ ...draft, assignee: e.target.value })}>
                  <option value="">Unassigned</option>
                  {draft.assignee && !assignees.includes(draft.assignee) ? <option value={draft.assignee}>{draft.assignee} (no longer eligible)</option> : null}
                  {assignees.map(email => <option key={email} value={email}>{email}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="field-label">A note (optional)</span>
                <textarea className="field mt-2" rows={3} maxLength={MAX_DEAL_NOTE} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
              </label>
            </div>
            {error ? (
              <p className="notice notice-error mt-4" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary" disabled={busy} onClick={saveDeal}>
                {busy ? "Saving…" : "Save deal"}
              </button>
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => { setDraft(null); setError(null); }}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {columns.map(({ stage, count, cents }) => (
            <section key={stage.id} aria-label={stage.name} className="min-w-0 rounded-2xl bg-paper p-4 ring-1 ring-line">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-ink">
                  {stage.name}
                  {stage.kind !== "open" && stage.name.toLowerCase() !== KIND_WORDS[stage.kind].toLowerCase() ? <span className="tag ml-2">{KIND_WORDS[stage.kind]}</span> : null}
                </h3>
                <p className="text-sm tabular-nums text-ink-soft">{`${count} · ${money(cents)}`}</p>
              </div>
              {(visibleIds || search.trim() || responsible !== "all") && !scopedDeals.some(d => d.stage === stage.id && (!visibleIds || visibleIds.has(d.id))) ? <p className="mt-3 text-sm text-ink-mute">No deals match this filter.</p> : null}
              <ul className="mt-3 space-y-3">
                {scopedDeals
                  .filter((d) => d.stage === stage.id && (!visibleIds || visibleIds.has(d.id)))
                  .map((deal) => (
                    <li key={deal.id} className="rounded-xl bg-white p-3 text-sm ring-1 ring-line">
                      <p className="font-semibold text-ink [overflow-wrap:anywhere]">{deal.title}</p>
                      <p className="mt-1 tabular-nums text-ink-soft">{deal.cents ? money(deal.cents) : "No amount yet"}</p>
                      {deal.email ? (
                        <p className="mt-1 text-ink-soft [overflow-wrap:anywhere]">
                          {deal.email}
                        </p>
                      ) : null}
                      {deal.nextAction ? <p className="mt-2 font-semibold text-ink">Next: {deal.nextAction}</p> : null}
                      {deal.dueDate ? <p className={`mt-1 text-xs ${followUps.overdue.some(d => d.id === deal.id) ? "font-semibold text-danger" : "text-ink-soft"}`}>Due {deal.dueDate}</p> : null}
                      {deal.assignee ? <p className="mt-1 text-xs text-ink-soft [overflow-wrap:anywhere]">Responsible: {deal.assignee}</p> : null}
                      {deal.note ? <p className="mt-2 whitespace-pre-line text-ink-soft [overflow-wrap:anywhere]">{deal.note}</p> : null}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <label className="min-w-0 flex-1">
                          <span className="sr-only">{`Move ${deal.title}`}</span>
                          <select
                            className="field"
                            value={deal.stage}
                            disabled={busy}
                            onChange={(e) => void run({ action: "deal", deal: { ...deal, stage: e.target.value } }, "Deal moved.")}
                          >
                            {stages.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={busy}
                          onClick={() => { setError(null); setDraft(draftFromDeal(deal, currency)); }}
                        >
                          Edit
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => void run({ action: "undeal", id: deal.id }, "Deal removed.")} aria-label={`Remove ${deal.title}`}>
                          <Icon name="minus" size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
        {error && !draft ? (
          <p className="notice notice-error mt-4" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6">
          {stageDraft ? (
            <div className="rounded-2xl border border-line bg-white p-4 sm:p-6">
              <p className="font-semibold text-ink">Stages, in order</p>
              <ol className="mt-3 space-y-2">
                {stageDraft.map((stage, i) => (
                  <li key={stage.id} className="flex flex-wrap items-center gap-2">
                    <input className="field min-w-0 flex-1" aria-label={`Stage ${i + 1}`} maxLength={MAX_STAGE_NAME} value={stage.name} onChange={(e) => setStageDraft(stageDraft.map((s, j) => (j === i ? { ...s, name: e.target.value } : s)))} />
                    <select className="field w-auto" aria-label={`What stage ${i + 1} means`} value={stage.kind} onChange={(e) => setStageDraft(stageDraft.map((s, j) => (j === i ? { ...s, kind: e.target.value as StageKind } : s)))}>
                      <option value="open">Open</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStageDraft(stageDraft.filter((_, j) => j !== i))} aria-label={`Remove stage ${i + 1}`}>
                      <Icon name="minus" size={16} />
                    </button>
                  </li>
                ))}
              </ol>
              {stageDraft.length < MAX_STAGES ? (
                <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => setStageDraft([...stageDraft, { id: newCrmId(), name: "", kind: "open" }])}>
                  <Icon name="plus" size={16} />
                  Add a stage
                </button>
              ) : null}
              <p className="mt-3 text-xs text-ink-soft">A deal in a stage you remove moves to the first open stage.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void run({ action: "stages", stages: stageDraft }, "Stages saved.", () => setStageDraft(null))}>
                  Save stages
                </button>
                <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setStageDraft(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStageDraft(structuredClone(stages))}>
              Change the stages
            </button>
          )}
        </div>
      </section>

      <section aria-labelledby="crm-fields-title" id="fields" className="card min-w-0 scroll-mt-32 p-5 sm:p-8">
        <h2 id="crm-fields-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
          Your fields
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {`Up to ${MAX_CRM_FIELDS} things you keep about each person: their company, a date, which offer interests them. Filled in on each person's page under Buyers, and written into your list's file as columns of their own. Removing a field removes every answer to it.`}
        </p>
        {fieldDraft ? (
          <div className="mt-6 rounded-2xl border border-line bg-white p-4 sm:p-6">
            <ol className="space-y-3">
              {fieldDraft.map((field, i) => (
                <li key={field.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
                  <input className="field" aria-label={`Field ${i + 1}`} maxLength={MAX_FIELD_NAME} placeholder="Company" value={field.name} onChange={(e) => setFieldDraft(fieldDraft.map((f, j) => (j === i ? { ...f, name: e.target.value } : f)))} />
                  <select className="field" aria-label={`Kind of field ${i + 1}`} value={field.type} onChange={(e) => setFieldDraft(fieldDraft.map((f, j) => (j === i ? { ...f, type: e.target.value as FieldType } : f)))}>
                    {FIELD_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFieldDraft(fieldDraft.filter((_, j) => j !== i))} aria-label={`Remove field ${i + 1}`}>
                    <Icon name="minus" size={16} />
                  </button>
                  {field.type === "choice" ? (
                    <input
                      className="field sm:col-span-3"
                      aria-label={`Choices for field ${i + 1}, separated by commas`}
                      placeholder="Coaching, Course, Not sure yet"
                      value={field.optionsText}
                      onChange={(e) => setFieldDraft(fieldDraft.map((f, j) => (j === i ? { ...f, optionsText: e.target.value } : f)))}
                    />
                  ) : null}
                </li>
              ))}
            </ol>
            {fieldDraft.length < MAX_CRM_FIELDS ? (
              <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => setFieldDraft([...fieldDraft, { id: newCrmId(), name: "", type: "text", options: [], optionsText: "" }])}>
                <Icon name="plus" size={16} />
                Add a field
              </button>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() =>
                  void run(
                    { action: "fields", fields: fieldDraft.map(({ optionsText, ...f }) => ({ ...f, options: f.type === "choice" ? optionsText.split(",").map((o) => o.trim()).filter(Boolean) : [] })) },
                    "Fields saved.",
                    () => setFieldDraft(null),
                  )
                }
              >
                Save fields
              </button>
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setFieldDraft(null)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {fields.length ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {fields.map((f) => (
                  <li key={f.id} className="tag">{`${f.name} · ${FIELD_TYPES.find((t) => t.type === f.type)?.label ?? ""}`}</li>
                ))}
              </ul>
            ) : null}
            <button type="button" className="btn btn-secondary btn-sm mt-4" onClick={() => setFieldDraft(fields.map((f) => ({ ...f, optionsText: f.options.join(", ") })))}>
              {fields.length ? "Change the fields" : "Add your first field"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
