"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toast";
import { MAX_PAIRS } from "@/lib/store-collections";

const MESSAGES: Record<string, string> = {
  target: "One of those products is no longer in your store. Reload the page and try again.",
  too_many: `A product can name up to ${MAX_PAIRS} others.`,
  unknown: "This product is no longer in your store. Reload the page.",
  store_full: "Your store record is full. Remove something from it and try again.",
};
const FAILED = "It could not be saved just now. Try again in a moment.";

/**
 * "Goes well with" for one product (lib/store-collections.ts): up to
 * MAX_PAIRS of the creator's other products, shown on this product's page
 * under the heading "Goes well with <this product>" and "Picked by <store>",
 * and offered in the cart while this one is in it. The creator's pick, said
 * as theirs; nothing about it is counted or claimed.
 */
export function PairsEditor({
  productId,
  initial,
  choices,
}: {
  productId: string;
  initial: string[];
  /** The store's published products, by name. */
  choices: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [slots, setSlots] = useState<string[]>(() => Array.from({ length: MAX_PAIRS }, (_, i) => initial[i] ?? ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const others = choices.filter((p) => p.id !== productId);
  const titles = new Map(choices.map((p) => [p.id, p.title]));
  const picked = slots.filter(Boolean);
  const changed = picked.join(",") !== initial.join(",");

  if (others.length === 0) return null;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/store/pairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, pairs: [...new Set(picked)] }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setError(MESSAGES[data.error ?? ""] ?? FAILED);
        return;
      }
      toast(picked.length ? "Saved. They are on this product's page now." : "Taken off this product's page.");
      router.refresh();
    } catch {
      setError(FAILED);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl bg-paper p-4 ring-1 ring-line">
      <p className="font-semibold text-ink">Goes well with</p>
      <p className="mt-1 text-sm text-ink-soft">
        {`Pick up to ${MAX_PAIRS} of your other products that go with this one. Its page shows them as your pick, with Add to cart where they can go in one, and the cart offers them while this one is in it. Nothing is said about other buyers: that only comes from your real sales.`}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {slots.map((value, index) => (
          <label key={index} className="block min-w-0">
            <span className="field-label">{`Pick ${index + 1}`}</span>
            <select
              className="field mt-1"
              value={value}
              onChange={(event) => setSlots((all) => all.map((v, i) => (i === index ? event.target.value : v)))}
            >
              <option value="">None</option>
              {value && !titles.has(value) ? <option value={value}>A product that is no longer published</option> : null}
              {others
                .filter((p) => p.id === value || !slots.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
            </select>
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => void save()} disabled={busy || !changed} aria-busy={busy}>
          {busy ? "Saving…" : "Save picks"}
        </button>
      </div>
      {error ? (
        <p className="notice notice-error mt-3" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
