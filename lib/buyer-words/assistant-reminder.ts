/**
 * The words of the Store assistant's checkout reminder
 * (lib/assistant-reminder-rules.ts), in each language a store can speak: the
 * box at checkout, and what the email says of the box and of its AI line.
 *
 * `box` is the sentence the buyer checks. It is kept, word for word, with
 * each consent and quoted back in the email, so a change to it in any
 * language is a new ASSIST_REMIND_VERSION. The label that says a line was
 * written by AI is drawn from here, never written by the model.
 *
 * Browser-safe: plain data and small functions, nothing from the server.
 */
import { type LanguageCode, parseLanguage } from "@/lib/store-language";

export type AssistReminderWords = {
  /** The box at checkout: what the buyer agrees to, in so many words. */
  box: string;
  /** Under it: what exactly they get, and what they do not. */
  boxNote: (store: string) => string;
  /** The address box, shown once the box is checked. */
  emailLabel: string;
  /** Above the AI's line in the email. */
  aiLabel: (store: string) => string;
  /** Why the email came, with the sentence checked and the day. */
  why: (sentence: string, day: string) => string;
};

const en: AssistReminderWords = {
  box: "Email me a reminder if I don't finish this order",
  boxNote: (store) => `One email from ${store}, about an hour after this checkout closes unpaid, with a link back to it and a link to stop. It does not add you to any list.`,
  emailLabel: "Your email for the reminder",
  aiLabel: (store) => `Written by AI from ${store}'s own product descriptions:`,
  why: (sentence, day) => `It reached you because you checked “${sentence}” at checkout on ${day}.`,
};

const es: AssistReminderWords = {
  box: "Envíame un recordatorio por email si no termino este pedido",
  boxNote: (store) => `Un solo email de ${store}, más o menos una hora después de que este pago se cierre sin pagar, con un enlace para volver y otro para no recibir más. No te añade a ninguna lista.`,
  emailLabel: "Tu email para el recordatorio",
  aiLabel: (store) => `Escrito por una IA a partir de las descripciones de los productos de ${store}:`,
  why: (sentence, day) => `Te ha llegado porque marcaste «${sentence}» al pagar, el ${day}.`,
};

const fr: AssistReminderWords = {
  box: "M’envoyer un rappel par e-mail si je ne termine pas cette commande",
  boxNote: (store) => `Un seul e-mail de ${store}, environ une heure après la fermeture de ce paiement non réglé, avec un lien pour y revenir et un lien pour ne plus en recevoir. Il ne vous inscrit à aucune liste.`,
  emailLabel: "Votre e-mail pour le rappel",
  aiLabel: (store) => `Écrit par une IA à partir des descriptions des produits de ${store} :`,
  why: (sentence, day) => `Il vous parvient parce que vous avez coché « ${sentence} » au moment du paiement, le ${day}.`,
};

const de: AssistReminderWords = {
  box: "Schick mir eine Erinnerung per E-Mail, wenn ich diese Bestellung nicht abschließe",
  boxNote: (store) => `Eine einzige E-Mail von ${store}, etwa eine Stunde nachdem diese Kasse unbezahlt geschlossen wurde, mit einem Link zurück und einem Link zum Abbestellen. Du wirst in keine Liste eingetragen.`,
  emailLabel: "Deine E-Mail für die Erinnerung",
  aiLabel: (store) => `Von einer KI aus den Produktbeschreibungen von ${store} geschrieben:`,
  why: (sentence, day) => `Du bekommst sie, weil du an der Kasse am ${day} „${sentence}“ angekreuzt hast.`,
};

const it: AssistReminderWords = {
  box: "Inviami un promemoria via email se non completo questo ordine",
  boxNote: (store) => `Una sola email da ${store}, circa un’ora dopo che questo pagamento si chiude senza essere pagato, con un link per tornarci e uno per non riceverne più. Non ti iscrive a nessuna lista.`,
  emailLabel: "La tua email per il promemoria",
  aiLabel: (store) => `Scritto da un’IA a partire dalle descrizioni dei prodotti di ${store}:`,
  why: (sentence, day) => `Ti è arrivata perché hai selezionato «${sentence}» al pagamento, il ${day}.`,
};

const nl: AssistReminderWords = {
  box: "Stuur me een herinnering per e-mail als ik deze bestelling niet afrond",
  boxNote: (store) => `Eén e-mail van ${store}, ongeveer een uur nadat deze betaling onbetaald sluit, met een link terug en een link om te stoppen. Je komt op geen enkele lijst.`,
  emailLabel: "Je e-mail voor de herinnering",
  aiLabel: (store) => `Geschreven door een AI op basis van de productbeschrijvingen van ${store}:`,
  why: (sentence, day) => `Je krijgt dit omdat je bij het afrekenen op ${day} „${sentence}” hebt aangevinkt.`,
};

const pt: AssistReminderWords = {
  box: "Enviem-me um lembrete por email se eu não terminar esta encomenda",
  boxNote: (store) => `Um único email de ${store}, cerca de uma hora depois de este pagamento fechar sem ser pago, com um link para voltar e outro para deixar de receber. Não o inscreve em nenhuma lista.`,
  emailLabel: "O seu email para o lembrete",
  aiLabel: (store) => `Escrito por uma IA a partir das descrições dos produtos de ${store}:`,
  why: (sentence, day) => `Chegou-lhe porque marcou «${sentence}» no pagamento, em ${day}.`,
};

export const ASSIST_REMINDER_WORDS: Record<LanguageCode, AssistReminderWords> = { en, es, fr, de, it, nl, pt };

export function assistReminderWords(language: unknown): AssistReminderWords {
  return ASSIST_REMINDER_WORDS[parseLanguage(language)];
}
