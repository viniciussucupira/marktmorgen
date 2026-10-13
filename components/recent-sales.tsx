"use client";

import { useEffect, useState } from "react";
import { recentWords } from "@/lib/buyer-words/recent";
import type { RecentSale } from "@/lib/recent-sales-rules";

/** When the first card appears, how long each stays, and the pause between two. */
const FIRST_MS = 5_000;
const SHOWN_MS = 7_000;
const GAP_MS = 9_000;

/** "2 hours ago", in the store's language, from the real time of the purchase. */
function ago(at: number, locale: string, now: number): string {
  const seconds = Math.max(0, Math.round(now / 1000 - at));
  const words = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (seconds < 3_600) return words.format(-Math.max(1, Math.round(seconds / 60)), "minute");
  if (seconds < 86_400) return words.format(-Math.round(seconds / 3_600), "hour");
  return words.format(-Math.round(seconds / 86_400), "day");
}

function countryName(code: string, locale: string): string {
  if (!code) return "";
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? "";
  } catch {
    return "";
  }
}

/**
 * The store's latest real purchases (lib/recent-sales.ts), one card at a
 * time, each once a visit and never again in a loop: what was bought, when,
 * and the country the card was billed in, never who. Closing it ends it for
 * the rest of the visit.
 */
export function RecentSales({ sales, handle, language, locale }: { sales: RecentSale[]; handle: string; language: string; locale: string }) {
  const words = recentWords(language);
  const [shown, setShown] = useState<{ i: number; now: number } | null>(null);
  const [closed, setClosed] = useState(false);
  const key = `nl:recent-closed:${handle}`;

  useEffect(() => {
    if (!sales.length) return;
    try {
      if (window.sessionStorage.getItem(key) === "1") return;
    } catch {
      // Storage refused: the cards still show, and closing still ends them on this page.
    }
    const timers: number[] = [];
    sales.forEach((_, i) => {
      const start = FIRST_MS + i * (SHOWN_MS + GAP_MS);
      timers.push(window.setTimeout(() => setShown({ i, now: Date.now() }), start));
      timers.push(window.setTimeout(() => setShown((now) => (now?.i === i ? null : now)), start + SHOWN_MS));
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [sales, key]);

  const sale = shown && !closed ? sales[shown.i] : null;
  if (!sale || !shown) return null;
  const place = countryName(sale.country, locale);

  return (
    <aside className="st-recent st-card" aria-label={words.region}>
      <a href={`/@${handle}/p/${sale.product}`} className="st-recent-link">
        <span className="block font-semibold [overflow-wrap:anywhere]">{sale.title}</span>
        <span className="st-muted block text-sm">{`${words.bought(ago(sale.at, locale, shown.now))}${place ? ` · ${place}` : ""}`}</span>
      </a>
      <button
        type="button"
        className="st-recent-close"
        aria-label={words.close}
        onClick={() => {
          setClosed(true);
          try {
            window.sessionStorage.setItem(key, "1");
          } catch {
            // Closed for this page all the same.
          }
        }}
      >
        <span aria-hidden="true">×</span>
      </button>
    </aside>
  );
}
