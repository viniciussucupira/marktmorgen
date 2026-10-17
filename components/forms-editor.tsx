"use client";

import { FormAnswers } from "@/components/form-answers";
import { FormResponseDeal } from "@/components/form-response-deal";
import { mergeFormOpportunities, type FormDealMatch } from "@/lib/form-deal";
import type { Stage } from "@/lib/crm-rules";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { toast } from "@/components/toast";
import { useLeaveGuard } from "@/components/leave-guard";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";
import {
  FIELD_TYPES,
  MAX_BUTTON,
  MAX_DONE_BODY,
  MAX_DONE_HEADING,
  MAX_FIELDS,
  MAX_FORM_NAME,
  MAX_FORMS,
  MAX_LABEL,
  MAX_OPTION,
  MAX_OPTIONS,
  MAX_OUTCOME_BODY,
  MAX_OUTCOME_TITLE,
  MAX_OUTCOMES,
  KEPT_RESPONSES,
  type FieldType,
  type FormDef,
  type FormField,
  type FormOutcome,
  type FormResponse,
  END,
  newFormId,
} from "@/lib/forms";

/** One saved form, with how many answers it has kept and the newest of them. */
export type SavedForm = { form: FormDef; total: number; latest: (FormResponse & { opportunityRef?: string })[] };

const MESSAGES: Record<string, string> = {
  name: "Give the form a name. Only you see it.",
  fields: "A form needs at least one question with words, and each choice needs at least two options.",
  full: `A store can have ${MAX_FORMS} forms. Remove one to add another.`,
  unknown: "That form is already gone. Reload the page.",
  invalid: "Something in the form could not be read. Reload the page and try again.",
  server_error: "Saving could not be confirmed. Review the saved forms before trying again.",
  ...STUDIO_MESSAGES,
};

const piece = () => newFormId(6);
const hasOptions = (type: FieldType) => type === "choice" || type === "choices";

const blank = (): FormDef => ({
  id: "",
  name: "",
  fields: [{ id: piece(), type: "email", label: "Your email", required: true, options: [] }],
  button: "",
  doneHeading: "",
  doneBody: "",
  outcomes: [],
  offerList: false,
  updatedAt: 0,
});

/**
 * The studio's forms, surveys and quizzes (lib/forms.ts): each with how many
 * answers it has kept and the newest of them, a file of all of them, and an
 * editor for its questions, its results and what a person reads after.
 */
export function FormsEditor({ saved, products, exportBase, dealStages = [], sid = "", currency = "USD", dealAssignees = [], existingDeals = [], existingDealsAvailable = false }: { existingDealsAvailable?: boolean; existingDeals?: FormDealMatch[]; currency?: string; dealAssignees?: string[]; dealStages?: Stage[]; sid?: string; saved: SavedForm[]; products: { id: string; title: string }[]; /** The download's address, the form's id added at its end. */ exportBase: string }) {
  const router = useRouter();
  const [recorded, setRecorded] = useState<{ sid: string; deals: FormDealMatch[] }>({ sid, deals: [] });
  const knownDeals = mergeFormOpportunities(existingDeals, recorded.sid === sid ? recorded.deals : []);
  const rememberOpportunity = (deal: FormDealMatch) => setRecorded(current => ({ sid, deals: [...(current.sid === sid ? current.deals.filter(item => item.id !== deal.id) : []), deal] }));
  const [dealDraft, setDealDraft] = useState<{ form: FormDef; response: FormResponse; responseRef: string } | null>(null);
  const [draft, setDraft] = useState<FormDef | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  useLeaveGuard(draft !== null && !busy);

  const patch = (change: Partial<FormDef>) => setDraft((d) => (d ? { ...d, ...change } : d));
  const setField = (i: number, change: Partial<FormField>) =>
    setDraft((d) => (d ? { ...d, fields: d.fields.map((f, j) => (j === i ? { ...f, ...change } : f)) } : d));
  const setOutcome = (i: number, change: Partial<FormOutcome>) =>
    setDraft((d) => (d ? { ...d, outcomes: d.outcomes.map((o, j) => (j === i ? { ...o, ...change } : o)) } : d));

  function moveField(i: number, by: -1 | 1) {
    setDraft((d) => {
      if (!d) return d;
      const to = i + by;
      if (to < 0 || to >= d.fields.length) return d;
      const swapped = d.fields.slice();
      [swapped[i], swapped[to]] = [swapped[to], swapped[i]];
      // An answer leads only forward: one that now points back goes on to the next question instead.
      const fields = swapped.map((f, at) => ({
        ...f,
        options: f.options.map((o) => (o.next && o.next !== END && swapped.findIndex((x) => x.id === o.next) <= at + 1 ? { ...o, next: "" } : o)),
      }));
      return { ...d, fields };
    });
  }

  async function send(body: unknown, done: string) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/store/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) {
        toast(done);
        setDraft(null);
        setRemoving(null);
        router.refresh();
        return;
      }
      setError(MESSAGES[data.error ?? ""] ?? MESSAGES.server_error);
    } catch {
      setError(MESSAGES.server_error);
    } finally {
      setBusy(false);
    }
  }

  const hasEmail = draft?.fields.some((f) => f.type === "email") ?? false;

  return (
    <section aria-labelledby="forms-title" className="card min-w-0 p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
          <h2 id="forms-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
            Forms, surveys and quizzes
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {`Questions you ask on one of your own pages, with a Form block: an application before a call, a survey, a quiz with results. Up to ${MAX_FIELDS} questions, and the newest ${KEPT_RESPONSES.toLocaleString("en-US")} answers of each kept for you, as a file too.`}
          </p>
        </div>
        {draft === null && saved.length < MAX_FORMS ? (
          <button type="button" className="btn btn-primary" disabled={dealDraft !== null} onClick={() => { setError(null); setDraft(blank()); }}>
            <Icon name="plus" size={18} />
            New form
          </button>
        ) : null}
      </div>

      {saved.length === 0 && draft === null ? (
        <p className="mt-6 rounded-2xl bg-paper p-4 text-sm text-ink-soft ring-1 ring-line">
          No forms yet. Make one, then add a Form block to one of your pages under Pages and choose it there.
        </p>
      ) : null}

      <ul className="mt-6 space-y-4">
        {saved.map(({ form, total, latest }) => (
          <li key={form.id} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                  {form.name}
                  {form.outcomes.length ? <span className="tag">Quiz</span> : null}
                </p>
                <p className="mt-1 text-sm text-ink-soft">{`${form.fields.length} ${form.fields.length === 1 ? "question" : "questions"} · ${total.toLocaleString("en-US")} ${total === 1 ? "answer" : "answers"} kept`}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {total > 0 ? (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(open === form.id ? null : form.id)}>
                    {open === form.id ? "Hide answers" : "See answers"}
                  </button>
                ) : null}
                {total > 0 ? (
                  <a className="btn btn-secondary btn-sm" href={`${exportBase}${form.id}`}>
                    <Icon name="download" size={16} />
                    Download all answers
                  </a>
                ) : null}
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setError(null); setDraft(structuredClone(form)); }} disabled={draft !== null || dealDraft !== null}>
                  Edit
                </button>
                {removing === form.id ? (
                  <>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => void send({ action: "remove", id: form.id }, "Form removed.")} disabled={busy}>
                      Remove it and its answers
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRemoving(null)}>
                      Keep it
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRemoving(form.id)} disabled={draft !== null}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            {open === form.id ? (
              <FormAnswers form={form} latest={latest} total={total} canReview={dealStages.some(stage => stage.kind === "open")} blocked={draft !== null || dealDraft !== null} existingDeals={knownDeals} existingDealsAvailable={existingDealsAvailable} onReview={response => response.opportunityRef && setDealDraft({ form, response, responseRef: response.opportunityRef })} />
            ) : null}
          </li>
        ))}
      </ul>

      {dealDraft ? <FormResponseDeal form={dealDraft.form} response={dealDraft.response} responseRef={dealDraft.responseRef} stages={dealStages} sid={sid} currency={currency} assignees={dealAssignees} existingDeals={knownDeals} existingDealsAvailable={existingDealsAvailable} onRecorded={rememberOpportunity} onClose={() => setDealDraft(null)} /> : null}

      {error && !draft ? (
        <p className="notice notice-error mt-4" role="alert">
          {error}
        </p>
      ) : null}

      {draft ? (
        <div className="mt-6 rounded-2xl border border-line bg-white p-4 sm:p-6">
          <label className="block">
            <span className="field-label">Name, for you</span>
            <input className="field mt-2" value={draft.name} maxLength={MAX_FORM_NAME} placeholder="Application for coaching" onChange={(e) => patch({ name: e.target.value })} />
          </label>

          <p className="field-label mt-6">Questions, in order</p>
          <p className="mt-1 text-xs text-ink-soft">
            On a one-choice question, each answer can lead on to a later question or end the form there. The questions an
            answer skips are hidden from that person, not asked and not kept.
          </p>
          <ol className="mt-2 space-y-4">
            {draft.fields.map((field, i) => (
              <li key={field.id} className="rounded-2xl bg-paper p-4 ring-1 ring-line">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
                  <label className="block min-w-0">
                    <span className="field-label">{`Question ${i + 1}`}</span>
                    <input className="field mt-2" value={field.label} maxLength={MAX_LABEL} placeholder="What would you like help with?" onChange={(e) => setField(i, { label: e.target.value })} />
                  </label>
                  <label className="block">
                    <span className="field-label">Kind</span>
                    <select
                      className="field mt-2"
                      value={field.type}
                      onChange={(e) => {
                        const type = e.target.value as FieldType;
                        setField(i, { type, options: hasOptions(type) ? (field.options.length >= 2 ? field.options : [{ id: piece(), label: "", outcome: "" }, { id: piece(), label: "", outcome: "" }]) : [] });
                      }}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="mt-2 text-xs text-ink-soft">{FIELD_TYPES.find((t) => t.type === field.type)?.hint}</p>
                {hasOptions(field.type) ? (
                  <div className="mt-3 space-y-2">
                    {field.options.map((option, k) => (
                      <div key={option.id} className="flex flex-wrap items-center gap-2">
                        <input
                          className="field min-w-0 flex-1"
                          aria-label={`Option ${k + 1}`}
                          value={option.label}
                          maxLength={MAX_OPTION}
                          placeholder={`Option ${k + 1}`}
                          onChange={(e) => setField(i, { options: field.options.map((o, m) => (m === k ? { ...o, label: e.target.value } : o)) })}
                        />
                        {draft.outcomes.length ? (
                          <select
                            className="field w-auto"
                            aria-label={`Result option ${k + 1} points at`}
                            value={option.outcome}
                            onChange={(e) => setField(i, { options: field.options.map((o, m) => (m === k ? { ...o, outcome: e.target.value } : o)) })}
                          >
                            <option value="">Points at no result</option>
                            {draft.outcomes.map((o, n) => (
                              <option key={o.id} value={o.id}>
                                {o.title || `Result ${n + 1}`}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        {field.type === "choice" ? (
                          <select
                            className="field w-auto"
                            aria-label={`After option ${k + 1}`}
                            value={option.next ?? ""}
                            onChange={(e) => setField(i, { options: field.options.map((o, m) => (m === k ? { ...o, next: e.target.value } : o)) })}
                          >
                            <option value="">Then the next question</option>
                            {draft.fields.slice(i + 2).map((f, n) => (
                              <option key={f.id} value={f.id}>
                                {`Then skip to question ${i + 3 + n}${f.label ? `: ${f.label.slice(0, 40)}` : ""}`}
                              </option>
                            ))}
                            <option value={END}>{draft.outcomes.length ? "Then end, with its result" : "Then end the form"}</option>
                          </select>
                        ) : null}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          aria-label={`Remove option ${k + 1}`}
                          disabled={field.options.length <= 2}
                          onClick={() => setField(i, { options: field.options.filter((_, m) => m !== k) })}
                        >
                          <Icon name="minus" size={16} />
                        </button>
                      </div>
                    ))}
                    {field.options.length < MAX_OPTIONS ? (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setField(i, { options: [...field.options, { id: piece(), label: "", outcome: "" }] })}>
                        <Icon name="plus" size={16} />
                        Add an option
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-ink">
                    <input type="checkbox" checked={field.required} onChange={(e) => setField(i, { required: e.target.checked })} />
                    Required
                  </label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => moveField(i, -1)} disabled={i === 0} aria-label={`Move question ${i + 1} up`}>
                    Up
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => moveField(i, 1)} disabled={i === draft.fields.length - 1} aria-label={`Move question ${i + 1} down`}>
                    Down
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => patch({ fields: draft.fields.filter((_, j) => j !== i) })} disabled={draft.fields.length <= 1}>
                    Remove question
                  </button>
                </div>
              </li>
            ))}
          </ol>
          {draft.fields.length < MAX_FIELDS ? (
            <button type="button" className="btn btn-secondary mt-3" onClick={() => patch({ fields: [...draft.fields, { id: piece(), type: "short", label: "", required: false, options: [] }] })}>
              <Icon name="plus" size={18} />
              Add a question
            </button>
          ) : null}

          <p className="field-label mt-8">Results, for a quiz (optional)</p>
          <p className="mt-1 text-sm text-ink-soft">
            Each option of a choice can point at a result. A person sees the result the most of their answers point at, the first in this list on a tie. Leave this empty for a form or a survey.
          </p>
          <ol className="mt-3 space-y-3">
            {draft.outcomes.map((outcome, i) => (
              <li key={outcome.id} className="rounded-2xl bg-paper p-4 ring-1 ring-line">
                <label className="block">
                  <span className="field-label">{`Result ${i + 1}`}</span>
                  <input className="field mt-2" value={outcome.title} maxLength={MAX_OUTCOME_TITLE} placeholder="You are just starting out" onChange={(e) => setOutcome(i, { title: e.target.value })} />
                </label>
                <label className="mt-3 block">
                  <span className="field-label">What it says (optional)</span>
                  <textarea className="field mt-2" rows={3} value={outcome.body} maxLength={MAX_OUTCOME_BODY} onChange={(e) => setOutcome(i, { body: e.target.value })} />
                </label>
                <label className="mt-3 block">
                  <span className="field-label">A product of yours to suggest (optional)</span>
                  <select className="field mt-2" value={outcome.product} onChange={(e) => setOutcome(i, { product: e.target.value })}>
                    <option value="">None</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm mt-3"
                  onClick={() =>
                    patch({
                      outcomes: draft.outcomes.filter((_, j) => j !== i),
                      fields: draft.fields.map((f) => ({ ...f, options: f.options.map((o) => (o.outcome === outcome.id ? { ...o, outcome: "" } : o)) })),
                    })
                  }
                >
                  Remove result
                </button>
              </li>
            ))}
          </ol>
          {draft.outcomes.length < MAX_OUTCOMES ? (
            <button type="button" className="btn btn-secondary mt-3" onClick={() => patch({ outcomes: [...draft.outcomes, { id: piece(), title: "", body: "", product: "" }] })}>
              <Icon name="plus" size={18} />
              Add a result
            </button>
          ) : null}

          <p className="field-label mt-8">After sending</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">Button (optional)</span>
              <input className="field mt-2" value={draft.button} maxLength={MAX_BUTTON} placeholder="Send" onChange={(e) => patch({ button: e.target.value })} />
            </label>
            <label className="block">
              <span className="field-label">Heading after sending (optional)</span>
              <input className="field mt-2" value={draft.doneHeading} maxLength={MAX_DONE_HEADING} placeholder="Thank you" onChange={(e) => patch({ doneHeading: e.target.value })} />
            </label>
          </div>
          <label className="mt-3 block">
            <span className="field-label">What they read after sending (optional)</span>
            <textarea className="field mt-2" rows={3} value={draft.doneBody} maxLength={MAX_DONE_BODY} placeholder="I read every application myself and answer within two days." onChange={(e) => patch({ doneBody: e.target.value })} />
          </label>
          <p className="mt-2 text-xs text-ink-soft">On a page that is a step of a funnel, a form with no results leads straight on to the next step instead.</p>

          <label className={`mt-6 flex min-h-11 items-start gap-3 text-sm font-semibold text-ink ${hasEmail ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
            <input type="checkbox" className="mt-1" checked={draft.offerList && hasEmail} disabled={!hasEmail} onChange={(e) => patch({ offerList: e.target.checked })} />
            <span>
              Offer to join your email list
              <span className="mt-1 block font-normal text-ink-soft">
                {hasEmail
                  ? "A box under the questions, empty until they check it. Checking it sends them an email with a button, and they join your list only once they press it."
                  : "Needs an email question."}
              </span>
            </span>
          </label>

          {error ? (
            <p className="notice notice-error mt-4" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void send({ form: { ...draft, id: draft.id || undefined } }, draft.id ? "Form saved." : "Form made.")}>
              {busy ? "Saving…" : "Save form"}
            </button>
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => { setDraft(null); setError(null); }}>
              Cancel
            </button>
          </div>
          <p className="mt-4 text-xs text-ink-soft">Never ask for a card number, a password or anything a stranger could use. Answers are kept for you and nobody else.</p>
        </div>
      ) : null}
    </section>
  );
}
