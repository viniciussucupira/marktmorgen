/**
 * The words a funnel of pages adds to a store's pages (lib/page-funnel.ts):
 * the way on to the next step, in every language a store sells in.
 * Browser-safe.
 */
import { type LanguageCode, parseLanguage } from "@/lib/store-language";

const en = {
  /** Above the button that leads on, after signing up or paying. */
  nextLabel: "Next step",
  /** The button that leads on. */
  next: "Continue",
  /** Under a paid step's buy box: going on without buying. */
  skip: "No thanks, continue",
  /** On the thank-you page, beside the button: what stays where it is. */
  keptAbove: "What you bought stays above on this page.",
};

export type FunnelWords = typeof en;

const es: FunnelWords = {
  nextLabel: "Siguiente paso",
  next: "Continuar",
  skip: "No, gracias, continuar",
  keptAbove: "Lo que compraste sigue arriba, en esta página.",
};

const fr: FunnelWords = {
  nextLabel: "Étape suivante",
  next: "Continuer",
  skip: "Non merci, continuer",
  keptAbove: "Ce que vous avez acheté reste plus haut sur cette page.",
};

const de: FunnelWords = {
  nextLabel: "Nächster Schritt",
  next: "Weiter",
  skip: "Nein danke, weiter",
  keptAbove: "Was Sie gekauft haben, bleibt oben auf dieser Seite.",
};

const it: FunnelWords = {
  nextLabel: "Passo successivo",
  next: "Continua",
  skip: "No grazie, continua",
  keptAbove: "Ciò che hai acquistato resta qui sopra, in questa pagina.",
};

const nl: FunnelWords = {
  nextLabel: "Volgende stap",
  next: "Doorgaan",
  skip: "Nee, bedankt, doorgaan",
  keptAbove: "Wat je hebt gekocht, blijft hierboven op deze pagina staan.",
};

const pt: FunnelWords = {
  nextLabel: "Próximo passo",
  next: "Continuar",
  skip: "Não, obrigado, continuar",
  keptAbove: "O que comprou continua acima, nesta página.",
};

export const FUNNEL_WORDS: Record<LanguageCode, FunnelWords> = { en, es, fr, de, it, nl, pt };

export function funnelWords(language: unknown): FunnelWords {
  return FUNNEL_WORDS[parseLanguage(language)];
}
