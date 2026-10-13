/**
 * The words of the card that shows a store's latest real purchases
 * (lib/recent-sales.ts), in each language a store can speak. The time and the
 * country are written by the browser itself (Intl.RelativeTimeFormat,
 * Intl.DisplayNames), so they come out right in every language without a
 * table of our own.
 *
 * Browser-safe: plain data, nothing from the server.
 */
import { type LanguageCode, parseLanguage } from "@/lib/store-language";

export type RecentWords = {
  /** Before "2 hours ago" as the browser writes it. */
  bought: (when: string) => string;
  /** What the card is, for a screen reader. */
  region: string;
  close: string;
};

const en: RecentWords = { bought: (when) => `Bought ${when}`, region: "A recent purchase", close: "Close" };
const es: RecentWords = { bought: (when) => `Comprado ${when}`, region: "Una compra reciente", close: "Cerrar" };
const fr: RecentWords = { bought: (when) => `Acheté ${when}`, region: "Un achat récent", close: "Fermer" };
const de: RecentWords = { bought: (when) => `Gekauft ${when}`, region: "Ein kürzlicher Kauf", close: "Schließen" };
const it: RecentWords = { bought: (when) => `Acquistato ${when}`, region: "Un acquisto recente", close: "Chiudi" };
const nl: RecentWords = { bought: (when) => `Gekocht ${when}`, region: "Een recente aankoop", close: "Sluiten" };
const pt: RecentWords = { bought: (when) => `Comprado ${when}`, region: "Uma compra recente", close: "Fechar" };

export const RECENT_WORDS: Record<LanguageCode, RecentWords> = { en, es, fr, de, it, nl, pt };

export function recentWords(language: unknown): RecentWords {
  return RECENT_WORDS[parseLanguage(language)];
}
