"use client";

import { useState, useSyncExternalStore } from "react";
import { toast } from "@/components/toast";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";
import { MAX_SALE_DAYS, MAX_SALE_NAME, SALE_PERCENTS, type StoreSale } from "@/lib/store-sale";

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  percent: "Pick how much comes off.",
  ends: "The end has to be in the future.",
  short: "A sale runs at least an hour.",
  long: `A sale runs at most ${MAX_SALE_DAYS} days.`,
  products: "Pick at least one product, or let it cover every product it can.",
  stripe: "A sale comes off a charge, so it needs your Stripe account connected.",
  stripe_refused: "Stripe did not make the discount just now. Nothing changed; try again in a moment.",
};

/** A datetime-local value in this browser's time, for a moment in seconds. */
function localValue(seconds: number): string {
  const d = new Date(seconds * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function when(seconds: number): string {
  return new Date(seconds * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/**
 * The store-wide sale: how much, from when to when, and on what. Starts and
 * ends by itself; "Stop it now" ends it at once.
 */
export function SaleEditor({
  initial,
  products,
  connected,
  now,
}: {
  initial: StoreSale;
  /** Products a sale can cover: bought once, at one price the store sets. */
  products: { id: string; title: string }[];
  connected: boolean;
  /** Seconds, from the server. */
  now: number;
}) {
  const [sale, setSale] = useState(initial);
  const [name, setName] = useState(initial.name);
  const [percent, setPercent] = useState(initial.percent || 20);
  // The times are shown in this browser's own time zone, which the server
  // does not know: they are filled in once the page is running here.
  const here = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [startsTyped, setStarts] = useState<string | null>(null);
  const [endsTyped, setEnds] = useState<string | null>(null);
  const starts = startsTyped ?? (here ? localValue(initial.percent ? initial.starts : now) : "");
  const ends = endsTyped ?? (here ? localValue(initial.percent ? initial.ends : now + 3 * 86_400) : "");
  const [all, setAll] = useState(initial.all);
  const [chosen, setChosen] = useState<Set<string>>(new Set(initial.products));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const running = sale.percent > 0 && sale.starts <= now && now < sale.ends;
  const waiting = sale.percent > 0 && sale.starts > now;
  const over = sale.percent > 0 && sale.ends <= now;

  async function save(payload: Record<string, unknown>, done: string) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/store/sale", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; sale?: StoreSale };
      if (data.ok && data.sale) {
        setSale(data.sale);
        toast(done);
      } else setError(MESSAGES[data.error ?? ""] ?? MESSAGES.server_error ?? "Something went wrong. Try again.");
    } catch {
      setError(MESSAGES.server_error ?? "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="sale-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="sale-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">A sale across the store</h2>
        <span className={`tag ${running ? "tag-live" : ""}`}>{running ? "On now" : waiting ? "Starts later" : "Off"}</span>
      </div>
      <p className="mt-2 max-w-2xl text-ink-soft">
        A percentage off, from one moment to another. While it runs, your store and each product&apos;s page show the old price
        crossed out and the new one, with when it ends, and Stripe takes it off with no code to type. At the end it stops by
        itself, and the discount stops working at Stripe too. It covers products bought once at one price; memberships, calls,
        price options, pay what you want and payment plans keep their price.
      </p>

      {sale.percent > 0 && !over ? (
        <p className="mt-4 rounded-2xl bg-sand p-4 text-sm text-ink" suppressHydrationWarning>
          <strong>{`${sale.name ? `${sale.name}: ` : ""}${sale.percent}% off`}</strong>
          {` ${sale.all ? "every product it can cover" : `${sale.products.length} ${sale.products.length === 1 ? "product" : "products"}`}, ${running ? "until" : `from ${when(sale.starts)} to`} ${when(sale.ends)}.`}
        </p>
      ) : null}

      {!connected ? (
        <p className="mt-4 text-sm text-ink-soft">Connect your Stripe account first: the discount is made on it.</p>
      ) : (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void save(
              {
                name,
                percent,
                starts: Math.floor(new Date(starts).getTime() / 1000),
                ends: Math.floor(new Date(ends).getTime() / 1000),
                all,
                products: [...chosen],
              },
              "Sale saved.",
            );
          }}
        >
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className="field-label">Its name (optional)</span>
              <input className="field mt-1 min-w-0 max-w-full" maxLength={MAX_SALE_NAME} value={name} onChange={(e) => setName(e.target.value)} placeholder="Black Friday" />
            </label>
            <label className="block min-w-0">
              <span className="field-label">Off every product it covers</span>
              <select className="field mt-1 min-w-0 max-w-full" value={percent} onChange={(e) => setPercent(Number(e.target.value))}>
                {SALE_PERCENTS.map((p) => (
                  <option key={p} value={p}>{`${p}% off`}</option>
                ))}
              </select>
            </label>
            <label className="block min-w-0">
              <span className="field-label">Starts</span>
              <input className="field mt-1 min-w-0 max-w-full" type="datetime-local" value={starts} onChange={(e) => setStarts(e.target.value)} />
            </label>
            <label className="block min-w-0">
              <span className="field-label">Ends</span>
              <input className="field mt-1 min-w-0 max-w-full" type="datetime-local" value={ends} onChange={(e) => setEnds(e.target.value)} required />
            </label>
          </div>
          <p className="text-xs text-ink-soft">In your computer&apos;s time zone. At most {MAX_SALE_DAYS} days.</p>
          <fieldset>
            <legend className="field-label">What it covers</legend>
            <label className="mt-2 flex min-h-11 items-center gap-3 text-sm text-ink">
              <input type="radio" checked={all} onChange={() => setAll(true)} className="h-4 w-4" />
              Every product it can cover, including ones added while it runs
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm text-ink">
              <input type="radio" checked={!all} onChange={() => setAll(false)} className="h-4 w-4" />
              Only the ones I pick
            </label>
            {!all ? (
              products.length ? (
                <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-2xl border border-line p-3">
                  {products.map((p) => (
                    <li key={p.id}>
                      <label className="flex min-h-11 items-center gap-3 text-sm text-ink">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={chosen.has(p.id)}
                          onChange={(e) =>
                            setChosen((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(p.id);
                              else next.delete(p.id);
                              return next;
                            })
                          }
                        />
                        <span className="min-w-0 break-words">{p.title}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-soft">None of your products can be on sale yet: add one sold once at one price.</p>
              )
            ) : null}
          </fieldset>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? "Saving…" : sale.percent > 0 && !over ? "Save the changes" : "Start the sale"}
            </button>
            {sale.percent > 0 && !over ? (
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => void save({ percent: 0, name }, "Sale stopped.")}>
                Stop it now
              </button>
            ) : null}
          </div>
          {error ? <p className="notice notice-error text-sm" role="alert">{error}</p> : null}
        </form>
      )}
    </section>
  );
}
