"use client";

import { createContext, useContext, useState } from "react";
import { Icon } from "@/components/icons";
import { MAX_AI_NOTES } from "@/lib/ai-rules";

/**
 * Whether the writing help (lib/ai.ts) is there for this person on this page,
 * and how many jobs are left this month. Off outside a provider, so a page
 * that never says it is on never shows a button that cannot work.
 */
export const AiOn = createContext<{ on: boolean; left: number }>({ on: false, left: 0 });

const MESSAGES: Record<string, string> = {
  notes: "Write a few words about it first: what it is, who it is for, what is inside.",
  used: "This month's writing help is used up. It starts again on the 1st.",
  slow: "A few at a time: wait a minute, then try again.",
  failed: "The writing help did not answer just now. Nothing was changed, and it was not counted. Try again in a moment.",
  off: "The writing help is not available right now.",
  forbidden: "Your role on this store cannot do this.",
  file: "The product's PDF could not be read. Draft the page without it, or upload the PDF again.",
};

/**
 * A box that asks for a few words and fills the studio's own fields with a
 * draft. It never saves: the creator reads it, changes it, and presses the
 * page's own Save — or doesn't.
 */
export function AiAssist<T>({
  title,
  hint,
  placeholder,
  payload,
  onResult,
  done,
  extra,
  allowEmpty = false,
  emptyMessage,
}: {
  /** The line that opens it, like "Write the description for me". */
  title: string;
  hint: string;
  placeholder: string;
  /** What is sent besides the notes: the kind of job and what it needs. */
  payload: () => Record<string, unknown>;
  onResult: (value: T) => void;
  /** Said once the fields are filled. */
  done: string;
  /** Any choice the job needs, drawn above the box. */
  extra?: React.ReactNode;
  /**
   * The job has enough to go on without the box: a sales page is drafted
   * from what the product already says, so the box only adds to it.
   */
  allowEmpty?: boolean;
  /** What is said when the job had nothing to go on, where the usual words do not fit it. */
  emptyMessage?: string;
}) {
  const { on, left: startLeft } = useContext(AiOn);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filled, setFilled] = useState(false);
  const [left, setLeft] = useState(startLeft);
  if (!on) return null;

  async function run() {
    // Said here, before a round trip that would only come back with the same.
    if (!allowEmpty && !notes.trim()) {
      setError(MESSAGES.notes);
      return;
    }
    setBusy(true);
    setError(null);
    setFilled(false);
    try {
      const response = await fetch("/api/store/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload(), notes }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; value?: T; left?: number; error?: string };
      if (data.ok && data.value !== undefined) {
        onResult(data.value);
        setFilled(true);
        if (typeof data.left === "number") setLeft(data.left);
        return;
      }
      setError(data.error === "notes" && emptyMessage ? emptyMessage : (MESSAGES[data.error ?? ""] ?? MESSAGES.failed));
    } catch {
      setError(MESSAGES.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="rounded-2xl border border-violet-brand/25 bg-lilac/40 px-4 py-3">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-violet-deep">
        <Icon name="sparkle" size={16} />
        {title}
      </summary>
      <div className="mt-2 space-y-3 pb-1">
        <p className="text-sm text-ink-soft">{hint}</p>
        {extra}
        <label className="block">
          <span className="sr-only">What it should say</span>
          <textarea
            className="field"
            rows={4}
            maxLength={MAX_AI_NOTES}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={placeholder}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void run()} disabled={busy || left <= 0} aria-busy={busy}>
            {busy ? "Writing…" : "Write a draft"}
          </button>
          <span className="text-xs text-ink-soft">{`${left} left this month`}</span>
        </div>
        {error ? (
          <p className="notice notice-error text-sm" role="alert">
            {error}
          </p>
        ) : filled ? (
          <p className="text-sm font-semibold text-ink" role="status">
            {done}
          </p>
        ) : null}
        <p className="text-xs text-ink-soft">
          It uses only your own words, here and in your store, never invents reviews, numbers, results or deadlines, and saves nothing until you
          do. Read it before you publish: it is yours.
        </p>
      </div>
    </details>
  );
}
