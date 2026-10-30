/**
 * The words of the box a buyer checks before digital content is handed over
 * at once (lib/digital-consent.ts), in each language a store can speak: the
 * box, the note under it, what is said when it was not checked, and the line
 * the confirmation email carries.
 *
 * `box` is the sentence the buyer checks. It holds both things the law asks
 * for (Directive 2011/83/EU, art. 16(m)): the consent to start now, and the
 * acknowledgement that the right to cancel is lost once access starts. It is
 * quoted back in the email, so a change to it in any language is a new
 * EU_WITHDRAWAL_CONSENT_VERSION and a new CONSENT_WORDS_FINGERPRINT.
 *
 * Each language uses its own law's word for the right (Widerrufsrecht,
 * droit de rétractation, derecho de desistimiento, diritto di recesso,
 * herroepingsrecht, direito de livre resolução).
 *
 * Browser-safe: plain data and small functions, nothing from the server.
 */
import { type LanguageCode, parseLanguage } from "@/lib/store-language";

export type DigitalConsentWords = {
  /** The sentence the buyer checks: consent and acknowledgement, in so many words. */
  box: string;
  /** Under it: who it is for, and that paying needs it. */
  note: string;
  /** The same, where only a product added at checkout is opened at once: the box is needed only if that is checked. */
  noteAdded: string;
  /** Said beside the box when the payment was refused for want of it. */
  needed: string;
  /** The notice a page shows when a payment was refused for want of it. */
  notice: { title: string; body: string };
  /** The confirmation email's line: the sentence checked, its version, the day, and what followed. */
  emailLine: (sentence: string, version: string, day: string) => string;
};

const en: DigitalConsentWords = {
  box: "I want access as soon as it is available. I understand that once access starts, I lose my 14-day right to cancel.",
  note: "This is for buyers who have that right where they live, such as in the EU and the UK. You need to check this box to pay.",
  noteAdded: "This is for buyers who have that right where they live, such as in the EU and the UK. You need to check this box to pay for an added product you can open right away.",
  needed: "To pay, check this box first. Nothing was charged.",
  notice: {
    title: "Check the box about access, then pay",
    body: "Nothing was charged. Before you pay for something you can open right away, check the box that says you want access as soon as it is available.",
  },
  emailLine: (sentence, version, day) =>
    `Before paying on ${day}, you checked: “${sentence}” (wording ${version}). Your access started when you paid, so a 14-day right to cancel, where you had one, ended then.`,
};

const es: DigitalConsentWords = {
  box: "Quiero acceder en cuanto esté disponible. Entiendo que, una vez empiece el acceso, pierdo mi derecho de desistimiento de 14 días.",
  note: "Es para quienes tienen ese derecho donde viven, como en la UE y el Reino Unido. Tienes que marcar esta casilla para pagar.",
  noteAdded: "Es para quienes tienen ese derecho donde viven, como en la UE y el Reino Unido. Tienes que marcar esta casilla para pagar un producto añadido que puedes abrir enseguida.",
  needed: "Para pagar, marca antes esta casilla. No se ha cobrado nada.",
  notice: {
    title: "Marca la casilla del acceso y paga",
    body: "No se ha cobrado nada. Antes de pagar algo que puedes abrir enseguida, marca la casilla que dice que quieres acceder en cuanto esté disponible.",
  },
  emailLine: (sentence, version, day) =>
    `Antes de pagar, el ${day}, marcaste: «${sentence}» (texto ${version}). Tu acceso empezó al pagar, así que el derecho de desistimiento de 14 días, si lo tenías, terminó entonces.`,
};

const fr: DigitalConsentWords = {
  box: "Je veux accéder au contenu dès qu’il est disponible. Je comprends qu’une fois l’accès commencé, je perds mon droit de rétractation de 14 jours.",
  note: "C’est pour les acheteurs qui ont ce droit là où ils vivent, comme dans l’UE et au Royaume-Uni. Vous devez cocher cette case pour payer.",
  noteAdded: "C’est pour les acheteurs qui ont ce droit là où ils vivent, comme dans l’UE et au Royaume-Uni. Vous devez cocher cette case pour payer un produit ajouté que vous pouvez ouvrir tout de suite.",
  needed: "Pour payer, cochez d’abord cette case. Rien n’a été débité.",
  notice: {
    title: "Cochez la case sur l’accès, puis payez",
    body: "Rien n’a été débité. Avant de payer quelque chose que vous pouvez ouvrir tout de suite, cochez la case qui dit que vous voulez y accéder dès qu’il est disponible.",
  },
  emailLine: (sentence, version, day) =>
    `Avant de payer, le ${day}, vous avez coché : « ${sentence} » (texte ${version}). Votre accès a commencé au paiement : le droit de rétractation de 14 jours, si vous l’aviez, a pris fin à ce moment-là.`,
};

const de: DigitalConsentWords = {
  box: "Ich möchte Zugang, sobald er verfügbar ist. Mir ist bewusst, dass ich mit Beginn des Zugangs mein 14-tägiges Widerrufsrecht verliere.",
  note: "Das gilt für Käufer, die dieses Recht dort haben, wo sie leben, etwa in der EU und im Vereinigten Königreich. Zum Bezahlen musst du dieses Kästchen ankreuzen.",
  noteAdded: "Das gilt für Käufer, die dieses Recht dort haben, wo sie leben, etwa in der EU und im Vereinigten Königreich. Für ein hinzugefügtes Produkt, das du sofort öffnen kannst, musst du dieses Kästchen ankreuzen.",
  needed: "Kreuze zum Bezahlen zuerst dieses Kästchen an. Es wurde nichts berechnet.",
  notice: {
    title: "Kreuze das Kästchen zum Zugang an und bezahle dann",
    body: "Es wurde nichts berechnet. Bevor du etwas bezahlst, das du sofort öffnen kannst, kreuze das Kästchen an, dass du Zugang möchtest, sobald er verfügbar ist.",
  },
  emailLine: (sentence, version, day) =>
    `Vor dem Bezahlen am ${day} hast du angekreuzt: „${sentence}“ (Fassung ${version}). Dein Zugang begann mit der Zahlung, daher endete ein 14-tägiges Widerrufsrecht, sofern du eines hattest, zu diesem Zeitpunkt.`,
};

const it: DigitalConsentWords = {
  box: "Voglio accedere appena è disponibile. Capisco che, una volta iniziato l’accesso, perdo il mio diritto di recesso di 14 giorni.",
  note: "Vale per chi ha questo diritto dove vive, come nell’UE e nel Regno Unito. Per pagare devi selezionare questa casella.",
  noteAdded: "Vale per chi ha questo diritto dove vive, come nell’UE e nel Regno Unito. Per pagare un prodotto aggiunto che puoi aprire subito devi selezionare questa casella.",
  needed: "Per pagare, seleziona prima questa casella. Non è stato addebitato nulla.",
  notice: {
    title: "Seleziona la casella sull’accesso, poi paga",
    body: "Non è stato addebitato nulla. Prima di pagare qualcosa che puoi aprire subito, seleziona la casella che dice che vuoi accedere appena è disponibile.",
  },
  emailLine: (sentence, version, day) =>
    `Prima di pagare, il ${day}, hai selezionato: «${sentence}» (testo ${version}). Il tuo accesso è iniziato al pagamento, quindi il diritto di recesso di 14 giorni, se ce l’avevi, è terminato allora.`,
};

const nl: DigitalConsentWords = {
  box: "Ik wil toegang zodra het beschikbaar is. Ik begrijp dat ik mijn herroepingsrecht van 14 dagen verlies zodra de toegang begint.",
  note: "Dit is voor kopers die dat recht hebben waar ze wonen, zoals in de EU en het Verenigd Koninkrijk. Je moet dit vakje aanvinken om te betalen.",
  noteAdded: "Dit is voor kopers die dat recht hebben waar ze wonen, zoals in de EU en het Verenigd Koninkrijk. Je moet dit vakje aanvinken om te betalen voor een toegevoegd product dat je meteen kunt openen.",
  needed: "Vink eerst dit vakje aan om te betalen. Er is niets afgeschreven.",
  notice: {
    title: "Vink het vakje over toegang aan en betaal dan",
    body: "Er is niets afgeschreven. Voordat je betaalt voor iets dat je meteen kunt openen, vink je het vakje aan dat zegt dat je toegang wilt zodra het beschikbaar is.",
  },
  emailLine: (sentence, version, day) =>
    `Voor het betalen op ${day} vinkte je aan: „${sentence}” (tekst ${version}). Je toegang begon toen je betaalde, dus een herroepingsrecht van 14 dagen, als je dat had, eindigde toen.`,
};

const pt: DigitalConsentWords = {
  box: "Quero acesso assim que estiver disponível. Compreendo que, quando o acesso começar, perco o meu direito de livre resolução de 14 dias.",
  note: "É para quem tem esse direito onde vive, como na UE e no Reino Unido. Tem de assinalar esta caixa para pagar.",
  noteAdded: "É para quem tem esse direito onde vive, como na UE e no Reino Unido. Tem de assinalar esta caixa para pagar um produto adicionado que pode abrir logo.",
  needed: "Para pagar, assinale primeiro esta caixa. Nada foi cobrado.",
  notice: {
    title: "Assinale a caixa sobre o acesso e pague",
    body: "Nada foi cobrado. Antes de pagar algo que pode abrir logo, assinale a caixa que diz que quer acesso assim que estiver disponível.",
  },
  emailLine: (sentence, version, day) =>
    `Antes de pagar, a ${day}, assinalou: «${sentence}» (texto ${version}). O seu acesso começou quando pagou, por isso o direito de livre resolução de 14 dias, se o tinha, terminou nesse momento.`,
};

/** Every language's words, in the order the fingerprint is taken in. */
export const DIGITAL_CONSENT_WORDS: Record<LanguageCode, DigitalConsentWords> = { en, es, fr, de, it, nl, pt };

export function digitalConsentWords(language: unknown): DigitalConsentWords {
  return DIGITAL_CONSENT_WORDS[parseLanguage(language)] ?? en;
}
