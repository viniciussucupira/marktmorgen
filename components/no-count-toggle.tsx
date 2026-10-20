"use client";

import { useState } from "react";
import { toast } from "@/components/toast";

/**
 * "Don't count this device" (lib/no-count.ts): for the phone or browser a
 * creator opens their store on without signing in, to see it as buyers do.
 */
export function NoCountToggle({ marked: given }: { marked: boolean }) {
  const [marked, setMarked] = useState(given);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function set(on: boolean) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/store/no-count", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on }) });
      const raw: unknown = await response.json().catch(() => null);
      const answer = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : null;
      if (response.ok && answer?.ok === true && !answer.error && answer.on === on) {
        setMarked(answer.on);
        toast(answer.on ? "This device is no longer counted on your store" : "This device is counted again");
      } else {
        setError("We could not confirm this setting. Reload this page to check before trying again.");
      }
    } catch {
      setError("We could not confirm this setting. Reload this page to check before trying again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-no-count-editor aria-busy={busy} className="mt-6 rounded-[12px] bg-paper px-4 py-4 ring-1 ring-line">
      <p className="text-sm font-bold text-ink">{marked ? "This device is not counted" : "Don't count this device"}</p>
      <p className="mt-1 text-xs text-ink-soft">
        {marked
          ? "Your visits from this browser are left out of your numbers, signed in or not. Press below on any other phone or browser you check your store from."
          : "Open this page on the phone or browser you check your store from and press below: its visits are left out of your numbers even when you are not signed in. Your team's visits while signed in are already left out."}{" "}
        It works on your store&apos;s address here, not on a domain of your own.
      </p>
      {error ? <p className="notice notice-error mt-3" role="alert">{error}</p> : null}
      <button type="button" aria-busy={busy} className="btn btn-secondary btn-sm mt-3" disabled={busy} onClick={() => set(!marked)}>
        {marked ? "Count this device again" : "Don't count this device"}
      </button>
    </div>
  );
}
