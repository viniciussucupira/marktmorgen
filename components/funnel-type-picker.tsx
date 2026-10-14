"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { toast } from "@/components/toast";
import { useLeaveGuard } from "@/components/leave-guard";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";
import { FUNNEL_TYPES, type FunnelType, choicesOf, pagesOf, slotProblem } from "@/lib/funnel-types";
import { FUNNEL_ID, MAX_FUNNEL_NAME } from "@/lib/page-funnel";

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
  server_error: "Something went wrong. Nothing was changed. Try again.",
  ...STUDIO_MESSAGES,
};

/**
 * Funnels to start from (lib/funnel-types.ts): pick a kind, choose the
 * store's own products for its steps, and the funnel is made with the pages
 * it needs, empty and kept from visitors until they are written.
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [made, setMade] = useState<{ pages: { title: string; id: string }[]; funnelId: string | null } | null>(null);
  useLeaveGuard(type !== null);
  const slots = type ? choicesOf(type) : [];
  const selected = slots.map(slot => picked[slot.key] || "").filter(Boolean);
  const repeated = new Set(selected).size !== selected.length;
  const selectionIssues = slots.flatMap(slot => {
    const problem = slotProblem(slot, products.find(product => product.id === picked[slot.key]) ?? null);
    return problem ? [slot.label + ": " + MESSAGES["slot_" + problem]] : [];
  });
  const capacityIssue = type && (funnelsLeft <= 0 ? MESSAGES.full : pagesOf(type).length > pagesLeft ? MESSAGES.pages_full : pagesOf(type).length > 0 && !canMakePages ? MESSAGES.forbidden : null);

  function choose(next: FunnelType) {
    setMade(null);
    setType(next);
    setName(next.label);
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
    if (!type || busy || !name.trim() || selectionIssues.length > 0 || repeated || capacityIssue) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/store/page-funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "from-type", type: type.id, name, products: picked }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; funnel?: { id?: unknown }; pages?: { id: string; title: string }[] };
      if (data.ok) {
        toast("Funnel made.");
        const id = data.funnel?.id;
        setMade({ pages: data.pages ?? [], funnelId: typeof id === "string" && FUNNEL_ID.test(id) ? id : null });
        setType(null);
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

  const reviewHref = `/studio/funnels${sid ? `?store=${encodeURIComponent(sid)}` : ""}${made?.funnelId ? `#funnel-review-${made.funnelId}` : ""}`;
  const pagesHref = (id: string) => `/studio/site?${sid ? `store=${sid}&` : ""}page=${id}`;

  return (
    <section aria-labelledby="funnel-types-title" className="card min-w-0 p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
          <h2 id="funnel-types-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
            Start from a kind of funnel
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Pick one, choose your products for its steps, and the funnel is made with the pages it needs. Those pages start empty and
            stay hidden from visitors until you write them and let them out; until then the funnel goes past them.
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
          <p className="font-semibold text-ink">Funnel created. Review it before sharing.</p>
          {made.pages.length ? (
            <>
              <p className="mt-1 text-sm text-ink-soft">Write these pages and let them out, and visitors walk through them:</p>
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
          <a className="btn btn-secondary mt-4" href={reviewHref}>{made.funnelId ? "Review the new funnel" : "Review funnels"}</a>
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
          <p className="font-semibold text-ink">{type.label}</p>
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
                  </span>
                )}
              </label>
            );
          })}
          {pagesOf(type).length ? (
            <p className="mt-4 text-sm text-ink-soft">
              {`It makes ${pagesOf(type).length} ${pagesOf(type).length === 1 ? "page" : "pages"} of your own (${pagesOf(type)
                .map((p) => p.title)
                .join(", ")}), empty and hidden from visitors until you write them. A draft product is passed over until you publish it.`}
            </p>
          ) : null}
          {selectionIssues.length > 0 || repeated || capacityIssue ? <div className="notice notice-warn mt-4 text-sm" role="status"><p className="font-semibold">Complete the setup before creating the funnel.</p><ul className="mt-2 list-disc space-y-1 pl-5">{selectionIssues.map(issue => <li key={issue}>{issue}</li>)}{repeated ? <li>{MESSAGES.slot_twice}</li> : null}{capacityIssue ? <li>{capacityIssue}</li> : null}</ul></div> : null}
          {error ? (
            <p className="notice notice-error mt-4" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={() => void build()} disabled={busy || !name.trim() || selectionIssues.length > 0 || repeated || Boolean(capacityIssue)} aria-busy={busy}>
              {busy ? "Making it…" : "Make the funnel"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setType(null)} disabled={busy}>
              Cancel setup
            </button>
          </div>
        </fieldset>
      ) : null}
    </section>
  );
}
