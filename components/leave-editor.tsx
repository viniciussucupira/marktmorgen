"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toast";
import { LEAVE_NAMES, LEAVE_REASONS, type LeaveReason, type LeaveSetting, MAX_OWN_REASONS, MAX_OWN_REASON_LENGTH } from "@/lib/leave-rules";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  leaving: `Each reason of your own needs words, up to ${MAX_OWN_REASON_LENGTH} characters, and there can be ${MAX_OWN_REASONS} at most.`,
  none: "This account has no store yet.",
  signed_out: "Your session ended. Log in again.",
  server_error: "Something went wrong on our side. Nothing was changed; try again in a moment.",
};

/** What each listed reason is answered with, said to the creator. */
const ANSWERS: Record<LeaveReason, string> = {
  too_expensive: "a cheaper plan, and a pause",
  unused: "a pause",
  missing_features: "a way to write to you",
  switched_service: "the way out",
  too_complex: "a way to write to you",
  low_quality: "a way to write to you",
  customer_service: "a way to write to you",
  other: "the way out",
};

/** Whether the store asks why before a member cancels, and with which reasons (lib/leave-rules.ts). */
export function LeaveEditor({ leaving, pause, tiers }: { leaving: LeaveSetting; pause: number; tiers: number }) {
  const router = useRouter();
  const [on, setOn] = useState(leaving.on);
  const [reasons, setReasons] = useState<LeaveReason[]>(leaving.reasons);
  const [own, setOwn] = useState(leaving.own.map((o) => ({ id: o.id, text: o.text })));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/store/leaving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on, reasons, own: own.filter((o) => o.text.trim()).map((o) => (o.id ? o : { text: o.text })) }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) {
        toast(on ? "Members are asked why before they cancel." : "Cancel goes straight to Stripe's page.");
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
    "When a member presses Cancel, a page of your store asks why, before Stripe's page. Answering is up to them: “Cancel my membership” is on that page from the start, one press away.",
    `Each answer is met with what fits it. “It costs too much”: a cheaper plan you sell${tiers ? "" : " (once you have membership tiers)"}, and a pause${pause ? "" : " (once you let members pause)"}. “I don't use it enough”: a pause. Something missing, too hard, or not good enough, and your own reasons: a way to write to you.`,
    "Your discount for leaving, if you set one, is still offered on Stripe's page: it comes last. Stripe's page does not ask why again.",
    "The answers add up under “Why members leave” on your Membership numbers page, with how many paused or switched plan instead.",
  ];

  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="leave-title" data-leave-editor>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="leave-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
          Ask why before members cancel
        </h2>
        <span className={`tag ${leaving.on ? "tag-live" : ""}`}>{leaving.on ? "On" : "Off"}</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-ink-soft">
        {bullets.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-brand" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <form
        className="mt-5 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-ink" htmlFor="leave-on">
          <input id="leave-on" type="checkbox" className="h-5 w-5" checked={on} onChange={(event) => setOn(event.target.checked)} />
          <span>Ask why before members cancel</span>
        </label>
        <fieldset disabled={!on}>
          <legend className="field-label">The reasons offered, and what each is answered with</legend>
          <div className="mt-2 space-y-1">
            {LEAVE_REASONS.map((r) => (
              <label key={r} className="flex min-h-11 items-center gap-3 text-sm text-ink" htmlFor={`leave-reason-${r}`}>
                <input
                  id={`leave-reason-${r}`}
                  type="checkbox"
                  className="h-5 w-5"
                  checked={reasons.includes(r) || r === "other"}
                  disabled={r === "other"}
                  onChange={(event) => setReasons(event.target.checked ? [...reasons, r] : reasons.filter((x) => x !== r))}
                />
                <span>
                  {LEAVE_NAMES[r]}
                  <span className="text-ink-soft">{` → ${ANSWERS[r]}`}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-ink-soft">&ldquo;Another reason&rdquo; is always offered, so every member has an answer that fits.</p>
        </fieldset>
        <fieldset disabled={!on}>
          <legend className="field-label">{`Reasons of your own, up to ${MAX_OWN_REASONS}, in your store's language`}</legend>
          <div className="mt-2 space-y-2">
            {Array.from({ length: MAX_OWN_REASONS }, (_, i) => (
              <input
                key={i}
                aria-label={`Reason of your own ${i + 1}`}
                className="field"
                maxLength={MAX_OWN_REASON_LENGTH}
                placeholder={i === 0 ? "The live calls don't fit my time zone" : ""}
                value={own[i]?.text ?? ""}
                onChange={(event) => {
                  const next = [...own];
                  // New words are a new reason: its answers are counted apart from the old one's.
                  next[i] = { id: own[i]?.text === event.target.value ? own[i].id : "", text: event.target.value };
                  setOwn(next);
                }}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-ink-soft">Each is answered with a way to write to you.</p>
        </fieldset>
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
