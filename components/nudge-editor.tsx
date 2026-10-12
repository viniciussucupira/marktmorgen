"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toast";
import type { Nudge } from "@/lib/member-health-rules";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  address: "Type the postal address where you can be reached. The law in the United States asks every email like this to carry one.",
  none: "This account has no store yet.",
  signed_out: "Your session ended. Log in again.",
  server_error: "Something went wrong on our side. Nothing was changed; try again in a moment.",
};

/** The come-back email to members who stopped coming (lib/member-health-rules.ts, lib/member-nudge.ts). */
export function NudgeEditor({ nudge, suggestedAddress, sent }: { nudge: Nudge; suggestedAddress: string; sent: number }) {
  const router = useRouter();
  const [on, setOn] = useState(nudge.on);
  const [address, setAddress] = useState(nudge.address || suggestedAddress);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/store/nudge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on, address }) });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) {
        toast(on ? "Members who stopped coming get one email back in." : "The come-back email is off.");
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

  const bullets = [
    "Every running member has a score on your Membership numbers page. A member at risk only for being away, who never opened the course or community their membership includes, or has not for 30 days and more, gets one email from your store with the way back in.",
    "Once for each period they pay for, and only if they agreed to hear from you and have not left your list. Never to somebody whose payment failed, who canceled or who paused.",
    "In your store's language, from your store; their reply reaches you. It carries the reason they get it, a one-click way off your list and your postal address.",
  ];

  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="nudge-title" data-nudge-editor>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="nudge-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
          Email members who stopped coming
        </h2>
        <span className={`tag ${nudge.on ? "tag-live" : ""}`}>{nudge.on ? "On" : "Off"}</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-ink-soft">
        {bullets.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-brand" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {nudge.on ? <p className="mt-3 text-sm text-ink">{`Sent this month: ${sent}`}</p> : null}
      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-ink" htmlFor="nudge-on">
          <input id="nudge-on" type="checkbox" className="h-5 w-5" checked={on} onChange={(event) => setOn(event.target.checked)} />
          <span>Email members who stopped coming</span>
        </label>
        <label className="block" htmlFor="nudge-address">
          <span className="field-label">Your postal address, printed at the bottom</span>
          <input id="nudge-address" className="field mt-2" maxLength={300} value={address} onChange={(event) => setAddress(event.target.value)} />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
      </form>
      {error ? (
        <p className="notice notice-error mt-3" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
