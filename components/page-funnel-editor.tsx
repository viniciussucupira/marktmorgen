"use client";

import type { FunnelRepairAction } from "@/lib/funnel-review-actions";
import { funnelRate, reviewFunnel } from "@/lib/funnel-review";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { toast } from "@/components/toast";
import { useLeaveGuard } from "@/components/leave-guard";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";
import {
  MAX_FUNNEL_NAME,
  MAX_FUNNEL_PAGES,
  MAX_FUNNEL_SLUG,
  MAX_PAGE_FUNNELS,
  type PageFunnel,
  type PageFunnelStep,
  funnelSlugFrom,
} from "@/lib/page-funnel";

/** A page or product that can be a step, as the studio lists it. */
export type StepChoice = { kind: PageFunnelStep["kind"]; id: string; title: string; note: string };

/** One saved funnel, with its steps as the store stands and how many people each reached. */
export type SavedFunnel = {
  funnel: PageFunnel;
  /** False distinguishes unknown reads from confirmed zero activity. */
  countsAvailable?: boolean;
  /** Null means the saved payment configuration could not be checked. */
  paymentIssues?: string[] | null;
  steps: { title: string; open: boolean; why: string; free: boolean; product: boolean; seen: number; done: number }[];
};

type Draft = { id: string; name: string; slug: string; slugTouched: boolean; on: boolean; steps: PageFunnelStep[] };

const MESSAGES: Record<string, string> = {
  name: "Give the funnel a name. Only you see it.",
  slug: "The address can have only lowercase letters, numbers and dashes.",
  taken: "Another funnel of this store already has that address.",
  steps: "A funnel needs at least one step, each page or product once.",
  full: `A store can have ${MAX_PAGE_FUNNELS} funnels. Remove one to add another.`,
  page: "One of the pages was deleted. Choose another.",
  gone: "One of the products was deleted. Choose another.",
  call: "A call is booked on a page of its own, so it cannot be a step.",
  unknown: "That funnel is already gone. Reload the page.",
  server_error: "Something went wrong. Nothing was changed. Try again.",
  ...STUDIO_MESSAGES,
};

const key = (step: Pick<PageFunnelStep, "kind" | "id">) => `${step.kind}:${step.id}`;

/** "120 people", "1 person". */
const people = (n: number) => `${n.toLocaleString("en-US")} ${n === 1 ? "person" : "people"}`;
const share = (part: number, whole: number) => {
  const rate = funnelRate(part, whole);
  return rate === null ? "rate unavailable" : `${rate}% of estimated opens`;
};

/**
 * The studio's funnels of pages (lib/page-funnel.ts): each with its address,
 * its steps in order with how many people reached each, and an editor that
 * picks the store's own pages and products' pages, in the order visitors
 * walk them.
 */
export function PageFunnelEditor({
  saved,
  choices,
  base,
  repairActions = [],
  readFailed = false,
}: {
  saved: SavedFunnel[];
  choices: StepChoice[];
  /** The funnels' addresses start with this: https://marktmorgen.com/@chef/go/ */
  base: string;
  repairActions?: FunnelRepairAction[];
  readFailed?: boolean;
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const refreshChecks = () => startRefresh(() => router.refresh());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const original = draft?.id ? saved.find(item => item.funnel.id === draft.id)?.funnel : null;
  const dirty = draft !== null && (!original || draft.name !== original.name || draft.slug !== original.slug || draft.on !== original.on || JSON.stringify(draft.steps) !== JSON.stringify(original.steps));
  useLeaveGuard(dirty);

  const pages = choices.filter((c) => c.kind === "page");
  const products = choices.filter((c) => c.kind === "product");
  const titleOf = (step: PageFunnelStep) => choices.find((c) => key(c) === key(step))?.title ?? "No longer available";

  function start(funnel: PageFunnel | null) {
    setError(null);
    setDraft(
      funnel
        ? { id: funnel.id, name: funnel.name, slug: funnel.slug, slugTouched: true, on: funnel.on, steps: funnel.steps }
        : { id: "", name: "", slug: "", slugTouched: false, on: true, steps: choices.length ? [{ kind: choices[0].kind, id: choices[0].id }] : [] },
    );
  }

  function patch(change: Partial<Draft>) {
    setDraft((d) => (d ? { ...d, ...change } : d));
  }

  function setStep(index: number, value: string) {
    const [kind, ...rest] = value.split(":");
    if (kind !== "page" && kind !== "product") return;
    setDraft((d) => (d ? { ...d, steps: d.steps.map((s, i) => (i === index ? { kind, id: rest.join(":") } : s)) } : d));
  }

  function move(index: number, by: -1 | 1) {
    setDraft((d) => {
      if (!d) return d;
      const to = index + by;
      if (to < 0 || to >= d.steps.length) return d;
      const steps = d.steps.slice();
      [steps[index], steps[to]] = [steps[to], steps[index]];
      return { ...d, steps };
    });
  }

  function addStep() {
    setDraft((d) => {
      if (!d || d.steps.length >= MAX_FUNNEL_PAGES) return d;
      const used = new Set(d.steps.map(key));
      const pick = choices.find((c) => !used.has(key(c)));
      return pick ? { ...d, steps: [...d.steps, { kind: pick.kind, id: pick.id }] } : d;
    });
  }

  async function send(body: unknown, done: string) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/store/page-funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
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

  function save() {
    if (!draft) return;
    const repeated = new Set(draft.steps.map(key)).size !== draft.steps.length;
    if (repeated) {
      setError("Each page or product can be one step of a funnel, once.");
      return;
    }
    send(
      { funnel: { id: draft.id || undefined, name: draft.name, slug: draft.slug, on: draft.on, steps: draft.steps } },
      draft.id ? "Funnel saved." : "Funnel made.",
    );
  }

  if (readFailed) return (
    <section aria-labelledby="page-funnels-title" className="card min-w-0 p-5 sm:p-8">
      <h2 id="page-funnels-title" className="text-lg font-semibold">Pages in order</h2>
      <p className="notice notice-warn mt-4 text-sm" role="alert">Your saved funnels could not be loaded. Their availability and the remaining creation limit are unknown. Reload before creating or editing a page funnel.</p>
      <button type="button" className="btn btn-secondary mt-4" onClick={refreshChecks} disabled={refreshing || busy} aria-busy={refreshing}>{refreshing ? "Reloading…" : "Reload funnels"}</button>
    </section>
  );

  return (
    <section aria-labelledby="page-funnels-title" className="card min-w-0 p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
          <h2 id="page-funnels-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
            Pages in order
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {`Your own pages and your products' pages, one after another, from one address. Each step leads to the next: a page's buttons, the page after a free sign-up, and the thank-you page after paying, once its offers are answered. Up to ${MAX_FUNNEL_PAGES} steps in a funnel and ${MAX_PAGE_FUNNELS} funnels in a store.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-secondary" onClick={refreshChecks} disabled={refreshing || busy || draft !== null || removing !== null} aria-busy={refreshing}>{refreshing ? "Refreshing…" : "Refresh checks"}</button>
        {draft === null && saved.length < MAX_PAGE_FUNNELS ? (
          <button type="button" className="btn btn-primary" onClick={() => start(null)} disabled={refreshing || busy || removing !== null || choices.length === 0}>
            <Icon name="plus" size={18} />
            New funnel
          </button>
        ) : null}
        </div>
      </div>

      {choices.length === 0 ? (
        <p className="notice notice-warn mt-6 text-sm">
          A step is one of your pages or a product&apos;s page. Publish a product, or make a page under Pages, and it appears here.
        </p>
      ) : null}

      {saved.length === 0 && draft === null && choices.length > 0 ? (
        <p className="mt-6 rounded-2xl bg-paper p-4 text-sm text-ink-soft ring-1 ring-line">
          No funnels yet. A common one: a page that gives a guide for an email, a page with a video, then the sales page of what
          you sell.
        </p>
      ) : null}

      <ul className="mt-6 space-y-4">
        {saved.map(({ funnel, steps, paymentIssues, countsAvailable }) => {
          const review = reviewFunnel(countsAvailable === false ? steps.map(step => ({ ...step, seen: Number.NaN, done: Number.NaN })) : steps);


          return (
            <li key={funnel.id} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    {funnel.name}
                    <span className={`tag ${funnel.on ? "tag-live" : ""}`}>{funnel.on ? "On" : "Off"}</span>
                  </p>
                  <p className="mt-1 break-all text-sm text-ink-soft">{`${base}${funnel.slug}`}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${base}${funnel.slug}`);
                        toast("Address copied.");
                      } catch {
                        toast("Copy the address from above.");
                      }
                    }}
                  >
                    <Icon name="copy" size={16} />
                    Copy address
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => start(funnel)} disabled={refreshing || busy || draft !== null || removing !== null}>
                    Edit
                  </button>
                  {removing === funnel.id ? (
                    <span className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                      Remove it?
                      <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => send({ action: "remove", id: funnel.id }, "Funnel removed.")}>
                        Yes, remove
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRemoving(null)} disabled={busy}>
                        Keep it
                      </button>
                    </span>
                  ) : (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRemoving(funnel.id)} disabled={refreshing || busy || draft !== null || removing !== null}>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <details className="mt-4 rounded-xl bg-paper p-4 ring-1 ring-line">
                <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-ink"><Icon name="chevron-down" size={16} className="shrink-0" />{!review.ready || review.issues.length > 0 || paymentIssues == null || paymentIssues.length > 0 ? "Review: needs attention" : "Review: saved checks passed"}</summary>
                <div id={`funnel-review-${funnel.id}`} tabIndex={-1} className="scroll-mt-24">
                {review.issues.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">{review.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul> : <p className="mt-2 text-sm text-ink-soft">Every configured step is currently available. This does not verify payment-provider health, delivery or page copy.</p>}
                <h3 className="mt-3 text-sm font-semibold text-ink">Payments, free sign-up and delivery</h3>
                {paymentIssues == null ? <p className="mt-2 text-sm text-ink-soft">This configuration could not be checked. Review pages, forms, payment and delivery before sharing the funnel.</p> : paymentIssues.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">{paymentIssues.map((issue, i) => <li key={i}>{issue}</li>)}</ul> : <p className="mt-2 text-sm text-ink-soft">No blocker found in the saved default-page and offer configuration.</p>}
                <p className="mt-2 text-xs text-ink-mute">This does not contact Stripe, open a checkout, test file storage or external links, or verify that a sign-up email arrives. Test those paths as a buyer.</p>
                {review.observation ? <p className="mt-3 text-sm text-ink-soft">{review.observation}</p> : null}
                {repairActions.length > 0 && (review.issues.length > 0 || paymentIssues == null || paymentIssues.length > 0) ? <nav aria-label={"Corrections for " + funnel.name} className="mt-3 flex flex-wrap gap-2">{repairActions.map(action => <a key={action.href} className="btn btn-secondary btn-sm" href={action.href}>{action.label}</a>)}</nav> : null}
                <a className="btn btn-secondary btn-sm mt-3" href={base + funnel.slug} target="_blank" rel="noopener noreferrer">Open as a visitor</a>
                </div>
              </details>
              <ol className="mt-4 space-y-2">
                {steps.map((step, index) => (
                  <li key={`${funnel.id}-${index}`} className="flex items-start gap-3 rounded-[12px] bg-paper px-3 py-2.5 text-sm ring-1 ring-line">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-brand text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">
                        {step.title}
                        <span className="ml-2 font-normal text-ink-mute">{step.product ? (step.free ? "free product" : "product") : "page"}</span>
                      </p>
                      {step.open ? (
                        <p className="mt-0.5 text-ink-soft">
                          {countsAvailable === false ? "Counts unavailable. Reload before comparing results." : <>{`${people(step.seen)} opened it`}
                          {step.product ? ` · ${step.done.toLocaleString("en-US")} ${step.free ? "signed up" : "paid"} (${share(step.done, step.seen)})` : ""}</>}
                        </p>
                      ) : (
                        <p className="mt-0.5 font-semibold text-ink">{step.why}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-ink-mute">
                Counts are independent estimates for each step. They do not identify the same people moving between steps. {" "}
                {`Counted since ${new Date(funnel.since * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}, when its steps were last changed: each person once a step, never you or your team.`}
              </p>
            </li>
          );
        })}
      </ul>

      {draft ? (
        <fieldset disabled={busy} className="mt-6 min-w-0 rounded-2xl border-2 border-violet-brand/40 bg-white p-4 sm:p-6">
          <legend className="sr-only">Funnel settings</legend>
          <p className="font-semibold text-ink">{draft.id ? "Edit the funnel" : "A new funnel"}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block" htmlFor="pf-name">
              <span className="field-label">Name, for you</span>
              <input
                id="pf-name"
                type="text"
                maxLength={MAX_FUNNEL_NAME}
                value={draft.name}
                placeholder="Launch of the course"
                onChange={(e) => patch({ name: e.target.value, ...(draft.slugTouched ? {} : { slug: funnelSlugFrom(e.target.value) }) })}
                className="field"
                required
              />
            </label>
            <label className="block" htmlFor="pf-slug">
              <span className="field-label">Address</span>
              <span className="flex items-center gap-1 text-sm text-ink-soft">
                <span className="shrink-0">…/go/</span>
                <input
                  id="pf-slug"
                  type="text"
                  maxLength={MAX_FUNNEL_SLUG}
                  value={draft.slug}
                  placeholder="launch"
                  onChange={(e) => patch({ slug: e.target.value.toLowerCase(), slugTouched: true })}
                  className="field"
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  aria-describedby="pf-slug-hint"
                  required
                />
              </span>
              <span id="pf-slug-hint" className="mt-1 block text-xs text-ink-mute">
                Lowercase letters, numbers and dashes.
              </span>
            </label>
          </div>

          <p className="field-label mt-5">Steps, in the order visitors walk them</p>
          <ol className="mt-2 space-y-2">
            {draft.steps.map((step, index) => (
              <li key={`${index}-${key(step)}`} className="flex items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-brand text-[0.8125rem] font-bold text-white">
                  {index + 1}
                </span>
                <label className="sr-only" htmlFor={`pf-step-${index}`}>{`Step ${index + 1}`}</label>
                <select id={`pf-step-${index}`} value={key(step)} onChange={(e) => setStep(index, e.target.value)} className="field min-w-0 flex-1">
                  {choices.some((c) => key(c) === key(step)) ? null : <option value={key(step)}>{titleOf(step)}</option>}
                  {pages.length ? (
                    <optgroup label="Your pages">
                      {pages.map((c) => (
                        <option key={key(c)} value={key(c)}>{`${c.title}${c.note ? ` (${c.note})` : ""}`}</option>
                      ))}
                    </optgroup>
                  ) : null}
                  {products.length ? (
                    <optgroup label="Products' pages">
                      {products.map((c) => (
                        <option key={key(c)} value={key(c)}>{`${c.title}${c.note ? ` (${c.note})` : ""}`}</option>
                      ))}
                    </optgroup>
                  ) : null}
                </select>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper disabled:opacity-40"
                  aria-label={`Move step ${index + 1} up`}
                >
                  <Icon name="chevron-down" size={18} className="rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === draft.steps.length - 1}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper disabled:opacity-40"
                  aria-label={`Move step ${index + 1} down`}
                >
                  <Icon name="chevron-down" size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => patch({ steps: draft.steps.filter((_, i) => i !== index) })}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-danger-soft hover:text-danger"
                  aria-label={`Remove step ${index + 1}`}
                >
                  <Icon name="trash" size={18} />
                </button>
              </li>
            ))}
          </ol>
          {draft.steps.length < MAX_FUNNEL_PAGES && draft.steps.length < choices.length ? (
            <button
              type="button"
              onClick={addStep}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong text-sm font-bold text-ink-soft transition-colors hover:border-violet-brand hover:text-violet-deep"
            >
              <Icon name="plus" size={18} />
              {`Add a step (${draft.steps.length} of ${MAX_FUNNEL_PAGES})`}
            </button>
          ) : null}

          <label className="mt-5 flex min-h-11 items-center gap-3 text-sm font-semibold text-ink" htmlFor="pf-on">
            <input id="pf-on" type="checkbox" checked={draft.on} onChange={(e) => patch({ on: e.target.checked })} className="h-5 w-5" />
            On: its address leads through the steps
          </label>
          <p className="mt-1 text-xs text-ink-soft">
            Off, the address opens the first step as an ordinary page, and nothing leads on.
          </p>

          <p className="mt-5 text-xs leading-relaxed text-ink-soft">
            A product step is its own page, with its price and checkout, and a paid one says “No thanks, continue” under the buy
            box. After paying, buyers get what they bought on the thank-you page and answer its offers first; then a button
            leads on. A step that cannot be shown right now, such as a page kept back or a product taken off, is passed over.
          </p>

          {error ? <p className="notice notice-error mt-4" role="alert">{error}</p> : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={save} aria-busy={busy} disabled={busy || !draft.name.trim() || draft.steps.length === 0} className="btn btn-primary">
              {busy ? "Saving…" : draft.id ? "Save the funnel" : "Make the funnel"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => { setDraft(null); setError(null); }} disabled={busy}>
              Cancel
            </button>
          </div>
        </fieldset>
      ) : null}

      {error && !draft ? <p className="notice notice-error mt-4" role="alert">{error}</p> : null}
    </section>
  );
}
