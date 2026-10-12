"use client";

import { useState } from "react";
import { toast } from "@/components/toast";

/** Whether the weekly email opens with a few sentences written by AI from the week's numbers (lib/numbers-ask.ts). */
export function WeeklyAiToggle({ on: initial }: { on: boolean }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function change(next: boolean) {
    setBusy(true);
    setError(false);
    try {
      const response = await fetch("/api/store/weekly-ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on: next }) });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean };
      if (data.ok) {
        setOn(next);
        toast(next ? "The weekly email opens with a short summary now." : "The weekly email goes without the summary.");
      } else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4" data-weekly-ai>
      <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-ink" htmlFor="weekly-ai">
        <input id="weekly-ai" type="checkbox" className="h-5 w-5" checked={on} disabled={busy} onChange={(event) => void change(event.target.checked)} />
        <span>Open the weekly email with a short summary written by AI</span>
      </label>
      <p className="text-xs text-ink-soft">
        Two to four sentences on Monday, from the same numbers as the email: what changed most, where the money came from, and
        one thing worth a look. One of your month&apos;s AI jobs each week; with none left, the email goes without it.
      </p>
      {error ? (
        <p className="notice notice-error mt-2" role="alert">
          Nothing was changed. Try again in a moment.
        </p>
      ) : null}
    </div>
  );
}
