"use client";

import { useState } from "react";
import { toast } from "@/components/toast";
import { NewTab } from "@/components/new-tab";
import { readShipmentConfirmation, readShippedRecord } from "@/lib/shipment-record";

const MESSAGES: Record<string, string> = {
  tracking: "Paste a tracking link that starts with https://, or leave it empty.",
  unknown: "That order could not be found as a shipped one. Reload the page.",
  stripe: "Your Stripe account did not answer just now. Nothing was sent. Try again in a moment.",
  role: "Your role on this store does not include orders.",
  signed_out: "Your session ended. Log in again.",
};

const day = (seconds: number) => new Date(seconds * 1000).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

/**
 * Where a physical order is going, and the one press that tells its buyer it
 * is on its way (lib/shipments.ts), with a tracking link if there is one.
 */
export function MarkShipped({
  session,
  to,
  shipped,
}: {
  session: string;
  to: { name: string; lines: string[] } | null;
  shipped: { at: number; tracking: string } | null;
}) {
  const [done, setDone] = useState(() => readShippedRecord(shipped));
  const [tracking, setTracking] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = `ship-${session.slice(-10)}`;
  return (
    <div className="mt-3 rounded-xl bg-white px-4 py-3 text-sm">
      <p className="text-xs font-semibold text-ink-soft">Ship to</p>
      {to && to.lines.length ? (
        <address className="mt-0.5 not-italic font-semibold leading-relaxed text-ink">
          {[to.name, ...to.lines].filter(Boolean).map((line, i) => (
            <span key={i} className="block break-words">{line}</span>
          ))}
        </address>
      ) : (
        <p className="mt-0.5 text-ink-soft">The address is on this payment in your Stripe dashboard.</p>
      )}
      {done ? (
        <p className="mt-2 font-semibold text-ink" role="status">
          {`Marked as shipped on ${day(done.at)}.`}
          {done.tracking ? (
            <>
              {" "}
              <a href={done.tracking} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Tracking<NewTab /></a>
            </>
          ) : null}
        </p>
      ) : (
        <form
          className="mt-2 flex flex-wrap items-end gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(null);
            try {
              const response = await fetch("/api/store/shipped", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session, tracking }),
              });
              const data: unknown = await response.json().catch(() => null);
              const confirmed = readShipmentConfirmation(data, response.ok);
              if (confirmed) {
                setDone(confirmed.shipped);
                toast(confirmed.emailed ? "Marked as shipped. The buyer was emailed." : "Marked as shipped. No new email was confirmed.");
                return;
              }
              const reason = data && typeof data === "object" && Object.hasOwn(data, "error") ? (data as { error?: unknown }).error : null;
              setError(typeof reason === "string" && Object.hasOwn(MESSAGES, reason) ? MESSAGES[reason] : "The shipment was not confirmed. Reload to check its status before trying again.");
            } catch {
              setError("Something went wrong on our side. Try again in a moment.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="min-w-[12rem] flex-1" htmlFor={id}>
            <span className="text-xs font-semibold text-ink-soft">Tracking link (optional)</span>
            <input id={id} type="url" inputMode="url" className="field mt-1" placeholder="https://" value={tracking} onChange={(e) => setTracking(e.target.value)} />
          </label>
          <button type="submit" aria-busy={busy} disabled={busy} className="btn btn-secondary btn-sm">
            {busy ? "Marking…" : "Mark as shipped"}
          </button>
          {error ? <p className="notice notice-error w-full" role="alert">{error}</p> : null}
        </form>
      )}
    </div>
  );
}
