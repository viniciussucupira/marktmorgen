/**
 * The one email somebody gets when a creator's own tools give them a product
 * through the API (lib/api-write.ts) and ask for them to be told, in the
 * store's language (lib/store-language.ts).
 *
 * Every language says all English says, nothing added and nothing softened.
 */
import { type LanguageCode, parseLanguage } from "@/lib/store-language";

const en = {
  subject: (title: string, store: string) => `${title}, from ${store}`,
  given: (store: string, title: string) => `${store} has given you ${title}. Nothing was charged.`,
  startCourse: (url: string) => `Start it here: ${url}`,
  openOrders: (url: string, email: string, store: string) =>
    `To open it on any device, go to ${url} and type ${email}. A link to everything you have from ${store} arrives within a minute. There is no password to make.`,
  why: (store: string) => `You are getting this one email because ${store} gave you this. Nothing more is sent because of it.`,
  sentBy: (store: string) => `Sent by Marktmorgen on behalf of ${store}.`,
};

export type AccessWords = typeof en;

const es: AccessWords = {
  subject: (title, store) => `${title}, de ${store}`,
  given: (store, title) => `${store} te ha dado ${title}. No se cobró nada.`,
  startCourse: (url) => `Empieza aquí: ${url}`,
  openOrders: (url, email, store) =>
    `Para abrirlo en cualquier dispositivo, ve a ${url} y escribe ${email}. En un minuto llega un enlace a todo lo que tienes de ${store}. No hay contraseña que crear.`,
  why: (store) => `Recibes este único email porque ${store} te dio esto. No se envía nada más por este motivo.`,
  sentBy: (store) => `Enviado por Marktmorgen en nombre de ${store}.`,
};

const fr: AccessWords = {
  subject: (title, store) => `${title}, de la part de ${store}`,
  given: (store, title) => `${store} vous a offert ${title}. Rien n'a été débité.`,
  startCourse: (url) => `Commencez ici${" "}: ${url}`,
  openOrders: (url, email, store) =>
    `Pour l'ouvrir sur n'importe quel appareil, rendez-vous sur ${url} et saisissez ${email}. Un lien vers tout ce que vous avez chez ${store} arrive en une minute. Aucun mot de passe à créer.`,
  why: (store) => `Vous recevez ce seul e-mail parce que ${store} vous a offert ceci. Rien d'autre n'est envoyé pour cette raison.`,
  sentBy: (store) => `Envoyé par Marktmorgen pour le compte de ${store}.`,
};

const de: AccessWords = {
  subject: (title, store) => `${title}, von ${store}`,
  given: (store, title) => `${store} hat Ihnen ${title} gegeben. Es wurde nichts berechnet.`,
  startCourse: (url) => `Hier beginnen: ${url}`,
  openOrders: (url, email, store) =>
    `Um es auf einem beliebigen Gerät zu öffnen, gehen Sie zu ${url} und geben Sie ${email} ein. Innerhalb einer Minute kommt ein Link zu allem, was Sie von ${store} haben. Sie müssen kein Passwort anlegen.`,
  why: (store) => `Sie erhalten diese eine E-Mail, weil ${store} Ihnen das gegeben hat. Deswegen wird sonst nichts gesendet.`,
  sentBy: (store) => `Gesendet von Marktmorgen im Auftrag von ${store}.`,
};

const it: AccessWords = {
  subject: (title, store) => `${title}, da ${store}`,
  given: (store, title) => `${store} ti ha dato ${title}. Non è stato addebitato nulla.`,
  startCourse: (url) => `Inizia qui: ${url}`,
  openOrders: (url, email, store) =>
    `Per aprirlo su qualsiasi dispositivo, vai su ${url} e scrivi ${email}. Entro un minuto arriva un link a tutto ciò che hai da ${store}. Non c'è nessuna password da creare.`,
  why: (store) => `Ricevi questa sola email perché ${store} ti ha dato questo. Non viene inviato nient'altro per questo motivo.`,
  sentBy: (store) => `Inviato da Marktmorgen per conto di ${store}.`,
};

const nl: AccessWords = {
  subject: (title, store) => `${title}, van ${store}`,
  given: (store, title) => `${store} heeft je ${title} gegeven. Er is niets afgeschreven.`,
  startCourse: (url) => `Begin hier: ${url}`,
  openOrders: (url, email, store) =>
    `Om het op elk apparaat te openen, ga je naar ${url} en typ je ${email}. Binnen een minuut komt er een link naar alles wat je van ${store} hebt. Je hoeft geen wachtwoord te maken.`,
  why: (store) => `Je krijgt deze ene e-mail omdat ${store} je dit heeft gegeven. Daarom wordt er verder niets gestuurd.`,
  sentBy: (store) => `Verstuurd door Marktmorgen namens ${store}.`,
};

const pt: AccessWords = {
  subject: (title, store) => `${title}, de ${store}`,
  given: (store, title) => `${store} ofereceu-lhe ${title}. Não foi cobrado nada.`,
  startCourse: (url) => `Comece aqui: ${url}`,
  openOrders: (url, email, store) =>
    `Para o abrir em qualquer dispositivo, aceda a ${url} e escreva ${email}. Dentro de um minuto chega uma ligação para tudo o que tem de ${store}. Não há palavra-passe para criar.`,
  why: (store) => `Recebe este único email porque ${store} lhe ofereceu isto. Não é enviado mais nada por esse motivo.`,
  sentBy: (store) => `Enviado pela Marktmorgen em nome de ${store}.`,
};

export const ACCESS_WORDS: Record<LanguageCode, AccessWords> = { en, es, fr, de, it, nl, pt };

export function accessWords(language: unknown): AccessWords {
  return ACCESS_WORDS[parseLanguage(language)];
}
