/**
 * What a link that opens a new tab says about it, to a screen reader, in each
 * language a store can speak (lib/store-language.ts). WCAG technique G201:
 * a new tab is a change of context, so the link warns of it before it is
 * followed. Written by hand, like every other buyer word (lib/buyer-words/).
 *
 * Browser-safe.
 */
import { type LanguageCode, parseLanguage } from "@/lib/store-language";

const WORDS: Record<LanguageCode, string> = {
  en: "(opens in a new tab)",
  es: "(se abre en una pestaña nueva)",
  fr: "(s’ouvre dans un nouvel onglet)",
  de: "(öffnet sich in einem neuen Tab)",
  it: "(si apre in una nuova scheda)",
  nl: "(opent in een nieuw tabblad)",
  pt: "(abre num novo separador)",
};

export function newTabWords(language?: unknown): string {
  return WORDS[parseLanguage(language)];
}
