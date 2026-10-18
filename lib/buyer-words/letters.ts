/**
 * The words on a store's published emails (lib/letter-rules.ts): the list and
 * one email's page, in the store's language. Browser-safe.
 */
import { type LanguageCode, parseLanguage } from "@/lib/store-language";

const en = {
  listTitle: (store: string) => `Emails from ${store}`,
  listLead: (store: string) => `Emails ${store} sent to their list and chose to publish here.`,
  empty: "Nothing is published here yet.",
  sentOn: (date: string) => `Sent ${date}`,
  all: "All published emails",
  visit: (store: string) => `Visit ${store}'s store`,
};

export type LetterWords = typeof en;

const es: LetterWords = {
  listTitle: (store) => `Emails de ${store}`,
  listLead: (store) => `Emails que ${store} envió a su lista y decidió publicar aquí.`,
  empty: "Todavía no hay nada publicado aquí.",
  sentOn: (date) => `Enviado el ${date}`,
  all: "Todos los emails publicados",
  visit: (store) => `Visitar la tienda de ${store}`,
};

const fr: LetterWords = {
  listTitle: (store) => `E-mails de ${store}`,
  listLead: (store) => `Des e-mails que ${store} a envoyés à sa liste et a choisi de publier ici.`,
  empty: "Rien n'est encore publié ici.",
  sentOn: (date) => `Envoyé le ${date}`,
  all: "Tous les e-mails publiés",
  visit: (store) => `Voir la boutique de ${store}`,
};

const de: LetterWords = {
  listTitle: (store) => `E-Mails von ${store}`,
  listLead: (store) => `E-Mails, die ${store} an die eigene Liste geschickt und hier veröffentlicht hat.`,
  empty: "Hier ist noch nichts veröffentlicht.",
  sentOn: (date) => `Gesendet am ${date}`,
  all: "Alle veröffentlichten E-Mails",
  visit: (store) => `Den Shop von ${store} besuchen`,
};

const it: LetterWords = {
  listTitle: (store) => `Email di ${store}`,
  listLead: (store) => `Email che ${store} ha inviato alla sua lista e ha scelto di pubblicare qui.`,
  empty: "Qui non è ancora pubblicato nulla.",
  sentOn: (date) => `Inviata il ${date}`,
  all: "Tutte le email pubblicate",
  visit: (store) => `Visita il negozio di ${store}`,
};

const nl: LetterWords = {
  listTitle: (store) => `E-mails van ${store}`,
  listLead: (store) => `E-mails die ${store} naar de eigen lijst stuurde en hier heeft gepubliceerd.`,
  empty: "Hier is nog niets gepubliceerd.",
  sentOn: (date) => `Verstuurd op ${date}`,
  all: "Alle gepubliceerde e-mails",
  visit: (store) => `De winkel van ${store} bekijken`,
};

const pt: LetterWords = {
  listTitle: (store) => `Emails de ${store}`,
  listLead: (store) => `Emails que ${store} enviou à sua lista e escolheu publicar aqui.`,
  empty: "Ainda não há nada publicado aqui.",
  sentOn: (date) => `Enviado a ${date}`,
  all: "Todos os emails publicados",
  visit: (store) => `Visitar a loja de ${store}`,
};

export const LETTER_WORDS: Record<LanguageCode, LetterWords> = { en, es, fr, de, it, nl, pt };

export function letterWords(language: unknown): LetterWords {
  return LETTER_WORDS[parseLanguage(language)];
}
