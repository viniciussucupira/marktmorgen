"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { toast } from "@/components/toast";
import { useLeaveGuard } from "@/components/leave-guard";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";
import { FUNNEL_TYPES, type FunnelType, choicesOf, pagesOf, slotProblem } from "@/lib/funnel-types";
import { FunnelFormSetup } from "@/components/funnel-form-setup";
import { readFunnelFormDrafts, type FunnelFormDraft } from "@/lib/funnel-form-draft";
import { MAX_FUNNEL_INTRO, type FunnelPageCopy } from "@/lib/funnel-page-copy";
import { MAX_HEADLINE } from "@/lib/sales-page";
import { readFunnelSetupResult } from "@/lib/funnel-setup-response";
import { MAX_FUNNEL_NAME } from "@/lib/page-funnel";

/** A product a type can be built with, as the studio knows it. */
export type TypeProduct = { id: string; title: string; free: boolean; call: boolean; draft: boolean };

const MESSAGES: Record<string, string> = {
  type: "That kind of funnel is not offered any more. Reload the page.",
  forbidden: "Your role cannot make the store's pages, which this funnel needs. Ask the store's owner or an admin.",
  full: "This store already has as many funnels as it can. Remove one to add another.",
  pages_full: "This funnel makes pages of its own, and the store has no room for them. Remove a page under Pages first.",
  slot_missing: "Choose a product for every step.",
  slot_free: "That step needs a free product: the one they sign up for.",
  slot_paid: "That step needs a paid product.",
  slot_call: "Choose one of your calls for the booking, and no call for the other steps.",
  slot_twice: "Each product can fill one step.",
  form_draft: "Complete each form question and check its email subscription setting before creating the funnel.",
  page_copy: "Check the page titles and introductions, then try again.",
  forms_full: "This store has no room for the required forms. Review Forms before trying again.",
  setup_incomplete: "We could not confirm completion. Some pages, forms or a funnel may already exist. Review them before creating another funnel.",
  server_error: "Something went wrong before setup started. Try again.",
  ...STUDIO_MESSAGES,
};

/**
 * Funnels to start from (lib/funnel-types.ts): pick a kind, choose the
 * store's own products for its steps, and the funnel is made with the pages
 * it needs, with optional starting copy and kept from visitors until ready.
 */
export function FunnelTypePicker({ products, pagesLeft, canMakePages, funnelsLeft, sid }: {
  products: TypeProduct[];
  /** How many more pages the store can have. */
  pagesLeft: number;
  /** Whether this person may make the store's pages. */
  canMakePages: boolean;
  funnelsLeft: number;
  sid: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FunnelType | null>(null);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [formDrafts, setFormDrafts] = useState<Record<string, FunnelFormDraft>>({});
  const [pageCopy, setPageCopy] = useState<Record<string, FunnelPageCopy>>({});
  const [reviewing, setReviewing] = useState(false);
  const requestActive = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<"setup" | "forms" | null>(null);
  const [made, setMade] = useState<{ pages: { title: string; id: string }[]; funnelId: string | null; drafts: string[] } | null>(null);
  useLeaveGuard(type !== null);
  const formDraftsValid = !type || readFunnelFormDrafts(formDrafts, type) !== null;
  const slots = type ? choicesOf(type) : [];
  const selected = slots.map(slot => picked[slot.key] || "").filter(Boolean);
  const repeated = new Set(selected).size !== selected.length;
  const draftSelections = slots.flatMap(slot => {
    const product = products.find(product => product.id === picked[slot.key]);
    return product?.draft ? [slot.label + ": " + product.title] : [];
  });
  const selectionIssues = slots.flatMap(slot => {
    const problem = slotProblem(slot, products.find(product => product.id === picked[slot.key]) ?? null);
    return problem ? [slot.label + ": " + MESSAGES["slot_" + problem]] : [];
  });
  const capacityIssue = type && (funnelsLeft <= 0 ? MESSAGES.full : pagesOf(type).length > pagesLeft ? MESSAGES.pages_full : pagesOf(type).length > 0 && !canMakePages ? MESSAGES.forbidden : null);

  function choose(next: FunnelType) {
    setMade(null);
    setReviewing(false);
    setRecovery(null);
    setType(next);
    setName(next.label);
    setFormDrafts(Object.fromEntries(pagesOf(next).filter(page => page.form && page.blocks.includes("form")).map(page => [page.key, { fields: page.form!.fields.map(field => ({ ...field })), offerList: false }])));
    setPageCopy(Object.fromEntries(pagesOf(next).map(page => [page.key, { headline: page.title, intro: "" }])));
    setError(null);
    // The first product that fits each step, each product once.
    const used = new Set<string>();
    const start: Record<string, string> = {};
    const publishedFirst = products.slice().sort((a, b) => Number(a.draft) - Number(b.draft));
    for (const slot of choicesOf(next)) {
      const first = publishedFirst.find((p) => slotProblem(slot, p) === null && !used.has(p.id));
      if (first) {
        start[slot.key] = first.id;
        used.add(first.id);
      }
    }
    setPicked(start);
  }

  async function build() {
    if (!type || !reviewing || !formDraftsValid || requestActive.current || busy || recovery === "setup" || !name.trim() || selectionIssues.length > 0 || repeated || capacityIssue) return;
    requestActive.current = true;
    setBusy(true);
    setRecovery(null);
    setError(null);
    try {
      const response = await fetch("/api/store/page-funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-nimbus-store": sid },
        body: JSON.stringify({ action: "from-type", type: type.id, name, products: picked, pageCopy, formDrafts }),
      });
      const data: unknown = await response.json().catch(() => null);
      const result = response.ok ? readFunnelSetupResult(data, pagesOf(type).length) : null;
      if (result) {
        toast("Funnel draft created.");
        setMade({ ...result, drafts: draftSelections });
        setType(null);
        router.refresh();
        return;
      }
      const rawError = data && typeof data === "object" && "error" in data ? data.error : null;
      const errorCode = data && typeof data === "object" && "ok" in data && data.ok === false && typeof rawError === "string" && Object.hasOwn(MESSAGES, rawError) ? rawError : null;
      const uncertain = errorCode === "setup_incomplete" || !errorCode;
      setRecovery(uncertain ? "setup" : errorCode === "forms_full" ? "forms" : null);
      setError(uncertain ? MESSAGES.setup_incomplete : MESSAGES[errorCode!]);
    } catch {
      setRecovery("setup");
      setError(MESSAGES.setup_incomplete);
    } finally {
      requestActive.current = false;
      setBusy(false);
    }
  }

  const reviewHref = `/studio/funnels${sid ? `?store=${encodeURIComponent(sid)}` : ""}`;
  const productsHref = `/studio${sid ? `?store=${encodeURIComponent(sid)}` : ""}#products`;
  const pagesHref = (id: string) => `/studio/site?${sid ? `store=${encodeURIComponent(sid)}&` : ""}page=${encodeURIComponent(id)}`;

  return (
    <section aria-labelledby="funnel-types-title" className="card min-w-0 p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
          <h2 id="funnel-types-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
            Start from a kind of funnel
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Pick one, choose your products for its steps, and the funnel is made with the pages it needs. Add starting copy during review. New pages stay hidden and the funnel stays disabled until you prepare and enable them.
          </p>
        </div>
        {!open ? (
          <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)} disabled={funnelsLeft <= 0}>
            <Icon name="plus" size={18} />
            Choose a kind
          </button>
        ) : null}
      </div>

      {made ? (
        <div className="notice notice-success mt-6" role="status">
          <p className="font-semibold text-ink">Funnel draft created. Its address is disabled.</p>
          {made.pages.length ? (
            <>
              <p className="mt-1 text-sm text-ink-soft">Finish these page drafts, then make them visible when ready:</p>
              <ul className="mt-2 space-y-1 text-sm">
                {made.pages.map((page) => (
                  <li key={page.id}>
                    <a className="underline underline-offset-4" href={pagesHref(page.id)}>
                      {page.title}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {made.drafts.length ? <div className="mt-4 text-sm"><p className="font-semibold">Products that were drafts at setup:</p><ul className="mt-2 list-disc space-y-1 pl-5">{made.drafts.map(draft => <li key={draft}>{draft}</li>)}</ul><p className="mt-2">Review their current status and publish them before sharing the funnel.</p><a className="mt-2 inline-flex min-h-11 items-center font-semibold underline underline-offset-4" href={productsHref}>Review products</a></div> : null}
          <p className="mt-4 text-sm text-ink-soft">Prepare the pages and products, review its settings, and test the customer journey. Enable the funnel in its settings only when it is ready.</p>
          <a className="btn btn-secondary mt-4" href={reviewHref}>{made.funnelId ? "Review funnel settings" : "Review funnels"}</a>
        </div>
      ) : null}

      {open && !type ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FUNNEL_TYPES.map((kind) => {
            const pages = pagesOf(kind).length;
            const tooMany = pages > pagesLeft;
            const blocked = pages > 0 && !canMakePages;
            return (
              <li key={kind.id} className="flex flex-col rounded-2xl border border-line bg-white p-4">
                <p className="font-semibold text-ink">{kind.label}</p>
                <p className="mt-1 flex-1 text-sm text-ink-soft">{kind.hint}</p>
                <ol className="mt-3 space-y-1 text-xs text-ink-soft">
                  {kind.slots
                    .filter((slot) => slot.kind !== "target")
                    .map((slot, i) => (
                      <li key={slot.key}>{`${i + 1}. ${slot.kind === "page" ? `Page: ${slot.title}` : slot.label}`}</li>
                    ))}
                </ol>
                {tooMany ? <p className="mt-3 text-xs text-ink-soft">{`Needs room for ${pages} more ${pages === 1 ? "page" : "pages"} under Pages.`}</p> : null}
                {blocked ? <p className="mt-3 text-xs text-ink-soft">Needs a role that can make the store&apos;s pages.</p> : null}
                <button type="button" className="btn btn-primary btn-sm mt-4 self-start" onClick={() => choose(kind)} disabled={tooMany || blocked}>
                  Use this
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {type ? (
        <fieldset disabled={busy} className="mt-6 min-w-0 rounded-2xl border border-line bg-white p-4 sm:p-6">
          <legend className="sr-only">Funnel setup</legend>
          <p className="text-xs font-semibold text-ink-soft">{reviewing ? "Step 3 of 3 · Review" : "Step 2 of 3 · Products"}</p>
          <p className="mt-1 font-semibold text-ink">{type.label}</p>
          <div hidden={reviewing}>
          <label className="mt-4 block">
            <span className="field-label">Name, for you</span>
            <input className="field mt-2" value={name} maxLength={MAX_FUNNEL_NAME} onChange={(e) => setName(e.target.value)} />
          </label>
          {choicesOf(type).map((slot) => {
            const fitting = products.filter((p) => slotProblem(slot, p) === null);
            return (
              <label key={slot.key} className="mt-4 block">
                <span className="field-label">{slot.label}</span>
                {fitting.length ? (
                  <select
                    className="field mt-2"
                    value={picked[slot.key] ?? ""}
                    onChange={(e) => setPicked((p) => ({ ...p, [slot.key]: e.target.value }))}
                  >
                    <option value="">Choose…</option>
                    {fitting.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.draft ? `${p.title} (draft)` : p.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="mt-2 block text-sm text-ink-soft">
                    {slot.wants === "free"
                      ? "You have no free product yet. Add one under Products, then come back."
                      : slot.wants === "call"
                        ? "You have no call yet. Add one under Products, then come back."
                        : "You have no paid product yet. Add one under Products, then come back."}
                    <a className="mt-2 inline-flex min-h-11 items-center font-semibold text-violet-deep underline underline-offset-4" href={productsHref}>Review products</a>
                  </span>
                )}
              </label>
            );
          })}
          {pagesOf(type).length ? (
            <p className="mt-4 text-sm text-ink-soft">
              {`It makes ${pagesOf(type).length} ${pagesOf(type).length === 1 ? "page" : "pages"} of your own (${pagesOf(type)
                .map((p) => p.title)
                .join(", ")}), hidden from visitors while you prepare them. Add starting copy in the next step. A draft product is passed over until you publish it.`}
            </p>
          ) : null}
          {draftSelections.length > 0 ? <div className="notice notice-warn mt-4 text-sm" role="status"><p className="font-semibold">Some selected products are still drafts.</p><ul className="mt-2 list-disc space-y-1 pl-5">{draftSelections.map(selection => <li key={selection}>{selection}</li>)}</ul><p className="mt-2">You can create this setup, but publish these products and review the funnel before sharing it.</p><a className="mt-2 inline-flex min-h-11 items-center font-semibold underline underline-offset-4" href={productsHref}>Review products</a></div> : null}
          {selectionIssues.length > 0 || repeated || capacityIssue ? <div className="notice notice-warn mt-4 text-sm" role="status"><p className="font-semibold">Complete the setup before creating the funnel.</p><ul className="mt-2 list-disc space-y-1 pl-5">{selectionIssues.map(issue => <li key={issue}>{issue}</li>)}{repeated ? <li>{MESSAGES.slot_twice}</li> : null}{capacityIssue ? <li>{capacityIssue}</li> : null}</ul></div> : null}
          </div>
          {reviewing ? (
            <section aria-label="Review your funnel" className="mt-4">
              <h3 className="font-semibold text-ink">{name.trim()}</h3>
              <p className="mt-2 text-sm text-ink-soft">Your customer journey, in order:</p>
              <ol className="mt-3 space-y-3">
                {type.slots.filter(slot => slot.kind !== "target").map((slot, index) => {
                  const product = products.find(item => item.id === picked[slot.key]);
                  return <li key={slot.key} className="rounded-xl border border-line p-3">
                    <p className="text-sm font-semibold">{index + 1}. {slot.kind === "page" ? slot.title : product?.title}</p>
                    <p className="mt-1 text-xs text-ink-soft">{slot.kind === "page"
                      ? `New hidden page · ${slot.blocks.join(", ")}${slot.form ? " · includes a new form" : ""}`
                      : product?.draft ? "Existing product · draft; publish it before sharing" : "Existing product · keep its current settings"}</p>
                    {slot.kind === "page" ? <div className="mt-4 space-y-3">
                      <label className="block">
                        <span className="field-label">Page headline</span>
                        <input className="field mt-2" maxLength={MAX_HEADLINE} value={pageCopy[slot.key]?.headline ?? slot.title} onChange={event => setPageCopy(current => ({ ...current, [slot.key]: { headline: event.target.value, intro: current[slot.key]?.intro ?? "" } }))} />
                      </label>
                      <label className="block">
                        <span className="field-label">Introduction (optional)</span>
                        <textarea className="field mt-2" rows={3} maxLength={MAX_FUNNEL_INTRO} value={pageCopy[slot.key]?.intro ?? ""} onChange={event => setPageCopy(current => ({ ...current, [slot.key]: { headline: current[slot.key]?.headline ?? slot.title, intro: event.target.value } }))} placeholder="Describe what visitors will find on this page. Use facts you can support." />
                      </label>
                      <p className="text-xs text-ink-soft">{pageCopy[slot.key]?.intro.length ?? 0}/{MAX_FUNNEL_INTRO} characters. Saved as editable page text. Add videos, answers and other details in the page editor.</p>
                      {slot.form && formDrafts[slot.key] ? <FunnelFormSetup value={formDrafts[slot.key]} onChange={next => setFormDrafts(current => ({ ...current, [slot.key]: next }))} /> : null}
                    </div> : null}
                  </li>;
                })}
              </ol>
              <p className="notice notice-warn mt-4 text-sm">This creates a disabled funnel and hidden, unfinished pages. Existing products keep their current visibility. Review page copy, forms, delivery and checkout before enabling the funnel. No email campaign or post-purchase offer is created by this setup.</p>
              <p className="mt-3 text-sm text-ink-soft">{pagesOf(type).length} new pages · {pagesOf(type).filter(page => page.form && page.blocks.includes("form")).length} new forms · 1 new funnel</p>
            </section>
          ) : null}
          {reviewing && !formDraftsValid ? <p className="notice notice-warn mt-4 text-sm" role="status">{MESSAGES.form_draft}</p> : null}
          {error ? (
            <p className="notice notice-error mt-4" role="alert">
              {error}
            </p>
          ) : null}
          {recovery ? <nav aria-label="Review setup records" className="mt-4 flex flex-wrap gap-3">
            {recovery === "setup" ? <a className="underline" href={`/studio/site${sid ? `?store=${encodeURIComponent(sid)}` : ""}`}>Review pages</a> : null}
            <a className="underline" href={`/studio/forms${sid ? `?store=${encodeURIComponent(sid)}` : ""}`}>Review forms</a>
            {recovery === "setup" ? <a className="underline" href={`/studio/funnels${sid ? `?store=${encodeURIComponent(sid)}` : ""}`}>Review funnels</a> : null}
          </nav> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={() => reviewing ? void build() : setReviewing(true)} disabled={busy || (reviewing && !formDraftsValid) || recovery === "setup" || !name.trim() || selectionIssues.length > 0 || repeated || Boolean(capacityIssue)} aria-busy={busy}>
              {busy ? "Creating draft…" : reviewing ? "Create disabled funnel" : "Review funnel"}
            </button>
            {reviewing && !recovery ? <button type="button" className="btn btn-secondary" onClick={() => setReviewing(false)} disabled={busy}>Back to products</button> : null}
            <button type="button" className="btn btn-secondary" onClick={() => setType(null)} disabled={busy}>
              {recovery === "setup" ? "Close setup" : "Cancel setup"}
            </button>
          </div>
        </fieldset>
      ) : null}
    </section>
  );
}
