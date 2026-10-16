"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toast";
import { Icon } from "@/components/icons";
import { type FaqItem, MAX_FAQ, MAX_FAQ_A, MAX_FAQ_Q } from "@/lib/store-faq";

type Row = FaqItem & { key: number };

/**
 * The store's own questions and answers (lib/store-faq.ts), shown on its page
 * and given to search engines. Written by hand, or drafted with AI from what
 * the store says about itself; nothing shows until it is saved.
 */
export function FaqEditor({ faq, ai }: { faq: FaqItem[]; ai: { on: boolean; left: number } }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => faq.map((item, key) => ({ ...item, key })));
  const [next, setNext] = useState(faq.length);
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [note, setNote] = useState("");
  const [left, setLeft] = useState(ai.left);
  const changed = JSON.stringify(rows.map(({ q, a }) => ({ q, a }))) !== JSON.stringify(faq);

  const add = (items: FaqItem[], dropEmpty = true) => {
    let key = next;
    const added = items.map((item) => ({ ...item, key: key++ }));
    setNext(key);
    setRows((now) => [...(dropEmpty ? now.filter((r) => r.q.trim() || r.a.trim()) : now), ...added].slice(0, MAX_FAQ));
  };
  const change = (key: number, part: Partial<FaqItem>) => setRows((now) => now.map((r) => (r.key === key ? { ...r, ...part } : r)));
  const move = (index: number, by: -1 | 1) =>
    setRows((now) => {
      const to = index + by;
      if (to < 0 || to >= now.length) return now;
      const copy = [...now];
      [copy[index], copy[to]] = [copy[to], copy[index]];
      return copy;
    });

  async function draft() {
    setDrafting(true);
    setNote("");
    try {
      const response = await fetch("/api/store/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "faq", notes: "" }) });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; value?: FaqItem[]; left?: number; error?: string };
      if (data.ok && Array.isArray(data.value)) {
        add(data.value);
        if (typeof data.left === "number") setLeft(data.left);
        setNote("Drafted below from what your store says. Read each one, change what is not right, and save.");
        return;
      }
      setNote(data.error === "used" ? "This month's writing help is used up. It starts again on the 1st." : "The writing help did not answer just now. Your content was not changed. Started attempts count toward the monthly allowance.");
    } catch {
      setNote("The writing help did not answer just now. Your content was not changed. Started attempts count toward the monthly allowance.");
    } finally {
      setDrafting(false);
    }
  }

  async function save() {
    setSaving(true);
    setNote("");
    try {
      const response = await fetch("/api/store/faq", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: rows.map(({ q, a }) => ({ q, a })) }) });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; faq?: FaqItem[] };
      if (data.ok) {
        toast(data.faq?.length ? "Questions saved. They show on your store page." : "Questions removed from your store page.");
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
    <section id="faq" aria-labelledby="faq-title" className="card mt-8 scroll-mt-32 p-6 sm:p-8">
      <h2 id="faq-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Questions on your store page</h2>
      <p className="mt-2 text-ink-soft">
        What visitors ask before buying anything from you — how files arrive, how to pay, how to reach you — answered once, on your store page, and given to search engines as questions and answers. Each product&apos;s page keeps its own questions.
      </p>
      {ai.on ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={draft} disabled={drafting || rows.length >= MAX_FAQ} aria-busy={drafting} className="btn btn-secondary btn-sm">
            <Icon name="sparkle" size={16} />
            {drafting ? "Drafting…" : "Draft them with AI"}
          </button>
          <span className="text-sm text-ink-soft">{`Only from what your store says. ${left} drafts left this month.`}</span>
        </div>
      ) : null}
      <ol className="mt-5 space-y-3">
        {rows.map((row, index) => (
          <li key={row.key} className="rounded-2xl bg-paper p-4 ring-1 ring-line">
            <label htmlFor={`faq-q-${row.key}`} className="field-label">{`Question ${index + 1}`}</label>
            <input id={`faq-q-${row.key}`} value={row.q} maxLength={MAX_FAQ_Q} onChange={(e) => change(row.key, { q: e.target.value })} className="field mt-1" />
            <label htmlFor={`faq-a-${row.key}`} className="field-label mt-3 block">Its answer</label>
            <textarea id={`faq-a-${row.key}`} value={row.a} maxLength={MAX_FAQ_A} rows={3} onChange={(e) => change(row.key, { a: e.target.value })} className="field mt-1" />
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="text-ink-soft underline underline-offset-4 disabled:opacity-40">Move up</button>
              <button type="button" disabled={index === rows.length - 1} onClick={() => move(index, 1)} className="text-ink-soft underline underline-offset-4 disabled:opacity-40">Move down</button>
              <button type="button" onClick={() => setRows((now) => now.filter((r) => r.key !== row.key))} className="text-ink-soft underline underline-offset-4 hover:text-danger">Remove</button>
            </div>
          </li>
        ))}
      </ol>
      {note ? <p className="mt-4 text-sm text-ink-soft" role="status">{note}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {rows.length < MAX_FAQ ? (
          <button type="button" onClick={() => add([{ q: "", a: "" }], false)} className="btn btn-secondary btn-sm">
            <Icon name="plus" size={16} />
            Add a question
          </button>
        ) : null}
        <button type="button" onClick={save} disabled={saving || !changed} className="btn btn-primary btn-sm">
          {saving ? "Saving…" : "Save questions"}
        </button>
      </div>
    </section>
  );
}
