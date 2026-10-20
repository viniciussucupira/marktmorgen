"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toast";
import { Icon } from "@/components/icons";

type Kind = "download" | "course" | "call" | "membership";
type Setup = { bios: string[]; products: { title: string; summary: string; kind: Kind; price: string }[]; faq: { q: string; a: string }[] };
type Row = Setup["products"][number] & { keep: boolean };

const KIND_WORDS: Record<Kind, string> = {
  download: "A file to download",
  course: "A course (turn it into one from its editor)",
  call: "A call (set your hours from its editor)",
  membership: "A monthly membership",
};

/**
 * The store drafted with AI from a few sentences (lib/ai.ts,
 * writeStoreSetup): the line under the name, up to three products and the
 * questions and answers, shown before anything is kept. The creator picks a
 * line, changes or drops each product, and keeps what they want; products
 * are put up as drafts, never on sale until they add what each hands over.
 */
export function StoreSetupAi({ currency, left: startLeft, hasFaq, storeName }: { currency: string; left: number; hasFaq: boolean; storeName?: string }) {
  const router = useRouter();
  const [about, setAbout] = useState("");
  const [selling, setSelling] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [left, setLeft] = useState(startLeft);
  const [note, setNote] = useState("");
  const [setup, setSetup] = useState<Setup | null>(null);
  const [bio, setBio] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [keepFaq, setKeepFaq] = useState(!hasFaq);

  async function draft() {
    if (drafting) return;
    setDrafting(true);
    setNote("");
    try {
      const response = await fetch("/api/store/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "setup", about, notes: selling }) });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; value?: Setup; left?: number; error?: string };
      if (data.ok && data.value) {
        setSetup(data.value);
        setBio(data.value.bios[0] ?? "");
        setRows(data.value.products.map((p) => ({ ...p, keep: true })));
        if (typeof data.left === "number") setLeft(data.left);
        return;
      }
      setNote(
        data.error === "used"
          ? "This month's writing help is used up. It starts again with your next billing month."
          : data.error === "notes"
            ? "Say in a sentence or two what you make and for whom."
            : "The writing help did not answer just now. Your content was not changed. Started attempts count toward the monthly allowance.",
      );
    } catch {
      setNote("The writing help did not answer just now. Your content was not changed. Started attempts count toward the monthly allowance.");
    } finally {
      setDrafting(false);
    }
  }

  async function keep() {
    if (!setup || saving) return;
    setSaving(true);
    setNote("");
    try {
      const response = await fetch("/api/store/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, products: rows.filter((r) => r.keep).map(({ title, summary, kind, price }) => ({ title, summary, kind, price })), faq: keepFaq ? setup.faq : [] }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; done?: { bio: boolean; products: number; faq: boolean; refused: string[] } };
      if (data.ok && data.done) {
        const parts = [data.done.bio ? "the line under your name" : "", data.done.products ? `${data.done.products} draft product${data.done.products === 1 ? "" : "s"}` : "", data.done.faq ? "your questions and answers" : ""].filter(Boolean);
        toast(parts.length ? `Kept: ${parts.join(", ")}.` : "Nothing was kept.");
        if (data.done.refused.length) setNote(`Not kept, because its price is not one this store can charge: ${data.done.refused.join(", ")}. Add it from Products.`);
        else setSetup(null);
        router.refresh();
        return;
      }
      setNote("Something went wrong on our side. Nothing was changed. Try again in a moment.");
    } catch {
      setNote("Something went wrong on our side. Nothing was changed. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="setup-ai" aria-labelledby="setup-ai-title" className="card mt-8 scroll-mt-32 p-6 sm:p-8">
      <h2 id="setup-ai-title" className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-ink">
        <Icon name="sparkle" size={20} />
        Draft your store with AI
      </h2>
      {storeName ? <p className="mt-2 font-semibold text-ink">Your store: {storeName}. Keep your name, or edit it in Store details.</p> : null}
      <p className="mt-2 text-ink-soft">
        Say what you make and for whom. AI drafts the line under your name, up to three products with a summary and a suggested
        price, and the questions visitors ask, from your words only. You see it all first, change what you like, and keep only what
        you want: products stay hidden until you add what each one hands over and choose Publish yourself. Paid selling still follows the sales gates.
      </p>
      <p className="mt-3 text-sm text-ink-soft">One sentence is enough to start. This uses the existing writing allowance; no draft runs automatically. You can also add your first offer manually in Products.</p>
      <div className="mt-5 grid gap-4">
        <div>
          <label htmlFor="setup-about" className="field-label">What you do, and for whom</label>
          <textarea id="setup-about" rows={3} value={about} onChange={(e) => setAbout(e.target.value)} className="field mt-2" placeholder="I teach busy parents to cook a week of dinners in two hours on Sunday." />
        </div>
        <div>
          <label htmlFor="setup-selling" className="field-label">What you sell, or want to sell (optional)</label>
          <textarea id="setup-selling" rows={2} value={selling} onChange={(e) => setSelling(e.target.value)} className="field mt-2" placeholder="A meal planner PDF, a video course, maybe one-to-one calls." />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={draft} disabled={drafting || !about.trim()} aria-busy={drafting} className="btn btn-primary">
          <Icon name="sparkle" size={16} />
          {drafting ? "Drafting your store…" : setup ? "Draft it again" : "Draft my store"}
        </button>
        <span className="text-sm text-ink-soft">{`One draft counts once. ${left} left this month.`}</span>
      </div>

      {setup ? (
        <div className="mt-6 space-y-6">
          {setup.bios.length ? (
            <fieldset>
              <legend className="field-label">The line under your name</legend>
              <div className="mt-2 space-y-2">
                {setup.bios.map((line) => (
                  <label key={line} className="flex items-start gap-3 rounded-2xl bg-paper p-3 text-ink ring-1 ring-line">
                    <input type="radio" name="setup-bio" checked={bio === line} onChange={() => setBio(line)} className="mt-1 size-5 shrink-0 accent-violet-brand" />
                    <span>{line}</span>
                  </label>
                ))}
                <label className="flex items-start gap-3 rounded-2xl bg-paper p-3 text-ink ring-1 ring-line">
                  <input type="radio" name="setup-bio" checked={bio === ""} onChange={() => setBio("")} className="mt-1 size-5 shrink-0 accent-violet-brand" />
                  <span>Keep my own</span>
                </label>
              </div>
            </fieldset>
          ) : null}

          {rows.length ? (
            <fieldset>
              <legend className="field-label">Products, as drafts</legend>
              <ul className="mt-2 space-y-3">
                {rows.map((row, i) => (
                  <li key={i} className="rounded-2xl bg-paper p-4 ring-1 ring-line">
                    <label className="flex items-center gap-3 text-sm font-semibold text-ink">
                      <input type="checkbox" checked={row.keep} onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, keep: e.target.checked } : r)))} className="size-5 accent-violet-brand" />
                      {`Keep it — ${KIND_WORDS[row.kind]}`}
                    </label>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_8rem]">
                      <div>
                        <label htmlFor={`setup-title-${i}`} className="text-xs font-semibold text-ink-soft">Name</label>
                        <input id={`setup-title-${i}`} value={row.title} maxLength={120} onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, title: e.target.value } : r)))} className="field mt-1" />
                      </div>
                      <div>
                        <label htmlFor={`setup-price-${i}`} className="text-xs font-semibold text-ink-soft">{`Price, ${currency.toUpperCase()}`}</label>
                        <input id={`setup-price-${i}`} inputMode="decimal" value={row.price} onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, price: e.target.value } : r)))} className="field mt-1" />
                      </div>
                    </div>
                    <label htmlFor={`setup-summary-${i}`} className="mt-3 block text-xs font-semibold text-ink-soft">What the buyer gets</label>
                    <input id={`setup-summary-${i}`} value={row.summary} maxLength={160} onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, summary: e.target.value } : r)))} className="field mt-1" />
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-ink-soft">The prices are suggestions. You know your work and your audience; change them before you keep them.</p>
            </fieldset>
          ) : null}

          {setup.faq.length ? (
            <fieldset>
              <legend className="field-label">Questions and answers</legend>
              {hasFaq ? (
                <p className="mt-2 text-sm text-ink-soft">Your store already has its questions, so these are not kept. Use them in Questions on your store page if you like.</p>
              ) : (
                <label className="mt-2 flex items-center gap-3 text-sm font-semibold text-ink">
                  <input type="checkbox" checked={keepFaq} onChange={(e) => setKeepFaq(e.target.checked)} className="size-5 accent-violet-brand" />
                  Keep them on my store page
                </label>
              )}
              <dl className="mt-3 space-y-2">
                {setup.faq.map((item) => (
                  <div key={item.q} className="rounded-2xl bg-paper p-3 ring-1 ring-line">
                    <dt className="font-semibold text-ink">{item.q}</dt>
                    <dd className="mt-1 text-sm text-ink-soft">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </fieldset>
          ) : null}

          <button type="button" onClick={keep} disabled={saving} aria-busy={saving} className="btn btn-primary">
            {saving ? "Keeping…" : "Keep what I chose"}
          </button>
        </div>
      ) : null}
      {note ? <p role="status" className="mt-4 text-sm font-semibold text-ink">{note}</p> : null}
    </section>
  );
}
