"use client";

import { useState } from "react";
import { toast } from "@/components/toast";
import type { Product } from "@/lib/store";
import { MAX_UPDATE_NOTE, canTellBuyers } from "@/lib/product-updates-rules";

const MESSAGES: Record<string, string> = {
  plan: "Emails to your buyers are on Pro, with your store's email set up under Email.",
  kind: "This works on products bought once: not memberships or calls.",
  none: "Nobody has bought this yet, so there is nobody to tell.",
  stripe: "Your Stripe account did not answer just now. Nothing was sent. Try again in a moment.",
  role: "Your role on this store does not include sending email.",
  signed_out: "Your session ended. Log in again.",
};

const when = (seconds: number) => new Date(seconds * 1000).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

/**
 * One email to everyone who bought a product, saying it was updated and
 * where to get the new version (lib/product-updates.ts). Once a week at most.
 */
export function ProductUpdateBox({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<number | null>(null);
  if (!canTellBuyers(product)) return null;
  const link = "text-sm font-bold text-ink-soft underline underline-offset-4 transition hover:text-violet-deep";
  const id = `upd-${product.id}`;

  if (!open) {
    return (
      <div className="mt-2 text-sm text-ink-soft">
        {sent !== null ? <p className="mb-1 font-semibold text-ink" role="status">{`Going out to ${sent.toLocaleString("en-US")} ${sent === 1 ? "buyer" : "buyers"} now.`}</p> : null}
        <button type="button" className={`block ${link}`} onClick={() => setOpen(true)}>
          Tell buyers about an update
        </button>
      </div>
    );
  }

  return (
    <form
      className="mt-2 rounded-[var(--r-sm)] border border-line bg-white p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const response = await fetch("/api/store/product-update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: product.id, note }),
          });
          const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; total?: number; until?: number | null };
          if (data.ok) {
            setSent(data.total ?? 0);
            setOpen(false);
            setNote("");
            toast("The update is going out to your buyers.");
            return;
          }
          setError(
            data.error === "soon" && data.until
              ? `This product's buyers were told of an update in the last 7 days. The next one can go on ${when(data.until)}.`
              : (MESSAGES[data.error ?? ""] ?? "Something went wrong on our side. Nothing was sent. Try again in a moment."),
          );
        } catch {
          setError("Something went wrong on our side. Nothing was sent. Try again in a moment.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="block" htmlFor={id}>
        <span className="field-label">What changed (optional)</span>
        <textarea
          id={id}
          rows={4}
          maxLength={MAX_UPDATE_NOTE}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ten new recipes, and the shopping lists now fit on one page."
          className="field mt-1"
        />
      </label>
      <p className="mt-2 text-xs text-ink-soft">
        One email to everyone who bought it, in your store&apos;s language, from your name: that there is a new version, your words, and
        the link to your store&apos;s orders page, where they get it with the address they paid with. Once a week at most for each
        product. It counts in your month&apos;s emails, and each one has a link to stop these emails from your store.
      </p>
      {error ? <p className="notice notice-error mt-3" role="alert">{error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="submit" aria-busy={busy} disabled={busy} className="btn btn-primary btn-sm">
          {busy ? "Sending…" : "Email every buyer"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); setError(null); }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
