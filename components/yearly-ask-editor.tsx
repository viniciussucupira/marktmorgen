"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toast";
import type { YearlyAsk } from "@/lib/yearly-switch-rules";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  address: "Type the postal address where you can be reached. The law in the United States asks every email like this to carry one.",
  none: "This account has no store yet.",
  signed_out: "Your session ended. Log in again.",
  server_error: "Something went wrong on our side. Nothing was changed; try again in a moment.",
};

/** The one email offering monthly members the yearly price (lib/yearly-ask.ts, lib/yearly-switch-rules.ts). */
export function YearlyAskEditor({ ask, suggestedAddress, sent, offersYearly }: { ask: YearlyAsk; suggestedAddress: string; sent: number; offersYearly: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(ask.on);
  const [address, setAddress] = useState(ask.address || suggestedAddress);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/store/yearly-ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on, address }) });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) {
        toast(on ? "Monthly members get one email offering your yearly price." : "The yearly offer email is off.");
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
    "Every member paying monthly for a membership with a yearly price sees “Pay yearly” on their membership page, with what it saves. Before anything is charged, Stripe works out the exact amount: the year, less what is left of the month they already paid.",
    "Turn on the email and each of them also gets one email from your store, from their third monthly payment on: what they pay now, what a year costs and what it saves. Once per membership, ever, and only if they agreed to hear from you and have not left your list.",
    "Never offered where it would cost you: not on a membership with a discount, nor while an affiliate's share for a set number of months still runs on it, and only where a year costs the member less than twelve of their own monthly payments.",
  ];

  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="yearly-ask-title" data-yearly-ask-editor>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="yearly-ask-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
          Monthly members switching to yearly
        </h2>
        <span className={`tag ${ask.on ? "tag-live" : ""}`}>{ask.on ? "Email on" : "Email off"}</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-ink-soft">
        {bullets.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-brand" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {offersYearly ? null : (
        <p className="notice mt-4 text-sm" data-yearly-none>
          None of your memberships has a yearly price yet. Give a monthly membership one in its product settings, under “Or pay yearly”, and its members can switch.
        </p>
      )}
      {ask.on ? <p className="mt-3 text-sm text-ink">{`Sent this month: ${sent}`}</p> : null}
      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-ink" htmlFor="yearly-ask-on">
          <input id="yearly-ask-on" type="checkbox" className="h-5 w-5" checked={on} onChange={(event) => setOn(event.target.checked)} />
          <span>Email monthly members the yearly price, once</span>
        </label>
        <label className="block" htmlFor="yearly-ask-address">
          <span className="field-label">Your postal address, printed at the bottom</span>
          <input id="yearly-ask-address" className="field mt-2" maxLength={300} value={address} onChange={(event) => setAddress(event.target.value)} />
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
