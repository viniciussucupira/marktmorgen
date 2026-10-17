/**
 * The words of the Store assistant's chat (lib/store-assistant.ts) in each
 * language a store can speak. The label every reply is shown under says it
 * is an AI, in the buyer's language, and the server sends the same label, so
 * nothing the model writes can take it off.
 *
 * Browser-safe: plain data and small functions, nothing from the server.
 */
import { type LanguageCode, parseLanguage } from "@/lib/store-language";

export type AssistantWords = {
  launcher: string;
  title: (store: string) => string;
  label: string;
  intro: (store: string) => string;
  placeholder: string;
  send: string;
  close: string;
  you: string;
  unknown: (store: string) => string;
  handoff: (store: string) => string;
  askCreator: (store: string) => string;
  spent: (store: string) => string;
  email: string;
  name: string;
  handoffSend: (store: string) => string;
  handoffDone: (store: string) => string;
  handoffConsent: (store: string) => string;
  privacy: string;
  deleteChat: string;
  deleted: string;
  notices: Record<"short" | "slow" | "error" | "closed" | "email", string>;
};

const en: AssistantWords = {
  launcher: "Questions?",
  title: (store) => `Questions about ${store}`,
  label: "AI assistant",
  intro: (store) => `An AI assistant answers here, at any hour, using only what ${store} has published. It can be wrong, and it says when it does not know. ${store} can answer you directly too.`,
  placeholder: "Type your question",
  send: "Ask",
  close: "Close",
  you: "You",
  unknown: (store) => `I don't know that from what ${store} has published. I can pass your question to ${store}, who answers by email.`,
  handoff: (store) => `That is one for ${store} to answer. Leave your email below and your question goes to them.`,
  askCreator: (store) => `Ask ${store} instead`,
  spent: (store) => `The assistant has answered all it can this month. Leave your question and your email, and ${store} answers you by email.`,
  email: "Your email",
  name: "Your name (optional)",
  handoffSend: (store) => `Send to ${store}`,
  handoffDone: (store) => `Sent. ${store} answers you by email.`,
  handoffConsent: (store) => `Your email and this conversation go to ${store}'s inbox, kept for 180 days, only to answer you.`,
  privacy: "This chat is kept for 24 hours, then deleted, with no name or email. Messages are sent to Anthropic's AI model to write the answers.",
  deleteChat: "Delete this chat",
  deleted: "Deleted.",
  notices: {
    short: "Write a little more, so there is something to answer.",
    slow: "That was a lot of questions. Wait a few minutes, then ask again.",
    error: "No answer just now. Try again in a moment, or ask the creator below.",
    closed: "This store is not taking questions here right now.",
    email: "That does not look like an email address. It is where the answer goes.",
  },
};

const es: AssistantWords = {
  launcher: "¿Preguntas?",
  title: (store) => `Preguntas sobre ${store}`,
  label: "Asistente de IA",
  intro: (store) => `Un asistente de IA responde aquí, a cualquier hora, solo con lo que ${store} ha publicado. Puede equivocarse, y dice cuándo no lo sabe. ${store} también puede responderte directamente.`,
  placeholder: "Escribe tu pregunta",
  send: "Preguntar",
  close: "Cerrar",
  you: "Tú",
  unknown: (store) => `No lo sé con lo que ${store} ha publicado. Puedo pasar tu pregunta a ${store}, que responde por correo.`,
  handoff: (store) => `Eso debe responderlo ${store}. Deja tu correo abajo y tu pregunta le llega.`,
  askCreator: (store) => `Preguntar a ${store}`,
  spent: (store) => `El asistente ya respondió todo lo que puede este mes. Deja tu pregunta y tu correo, y ${store} te responde por correo.`,
  email: "Tu correo",
  name: "Tu nombre (opcional)",
  handoffSend: (store) => `Enviar a ${store}`,
  handoffDone: (store) => `Enviado. ${store} te responde por correo.`,
  handoffConsent: (store) => `Tu correo y esta conversación van a la bandeja de ${store}, se guardan 180 días y solo para responderte.`,
  privacy: "Este chat se guarda 24 horas y luego se borra, sin nombre ni correo. Los mensajes se envían al modelo de IA de Anthropic para escribir las respuestas.",
  deleteChat: "Borrar este chat",
  deleted: "Borrado.",
  notices: {
    short: "Escribe un poco más, para que haya algo que responder.",
    slow: "Fueron muchas preguntas. Espera unos minutos y vuelve a preguntar.",
    error: "Ahora no hay respuesta. Prueba en un momento, o pregunta al creador abajo.",
    closed: "Esta tienda no está recibiendo preguntas aquí ahora.",
    email: "Eso no parece un correo. Es adonde va la respuesta.",
  },
};

const fr: AssistantWords = {
  launcher: "Des questions ?",
  title: (store) => `Questions sur ${store}`,
  label: "Assistant IA",
  intro: (store) => `Un assistant IA répond ici, à toute heure, uniquement avec ce que ${store} a publié. Il peut se tromper, et il dit quand il ne sait pas. ${store} peut aussi vous répondre directement.`,
  placeholder: "Écrivez votre question",
  send: "Demander",
  close: "Fermer",
  you: "Vous",
  unknown: (store) => `Je ne le sais pas d'après ce que ${store} a publié. Je peux transmettre votre question à ${store}, qui répond par e-mail.`,
  handoff: (store) => `C'est à ${store} d'y répondre. Laissez votre e-mail ci-dessous et votre question lui est transmise.`,
  askCreator: (store) => `Demander à ${store}`,
  spent: (store) => `L'assistant a répondu à tout ce qu'il peut ce mois-ci. Laissez votre question et votre e-mail, et ${store} vous répond par e-mail.`,
  email: "Votre e-mail",
  name: "Votre nom (facultatif)",
  handoffSend: (store) => `Envoyer à ${store}`,
  handoffDone: (store) => `Envoyé. ${store} vous répond par e-mail.`,
  handoffConsent: (store) => `Votre e-mail et cette conversation vont dans la boîte de ${store}, gardés 180 jours, uniquement pour vous répondre.`,
  privacy: "Ce chat est gardé 24 heures puis supprimé, sans nom ni e-mail. Les messages sont envoyés au modèle d'IA d'Anthropic pour écrire les réponses.",
  deleteChat: "Supprimer ce chat",
  deleted: "Supprimé.",
  notices: {
    short: "Écrivez un peu plus, pour qu'il y ait quelque chose à répondre.",
    slow: "Cela fait beaucoup de questions. Attendez quelques minutes, puis réessayez.",
    error: "Pas de réponse pour l'instant. Réessayez dans un moment, ou demandez au créateur ci-dessous.",
    closed: "Cette boutique ne prend pas de questions ici pour le moment.",
    email: "Cela ne ressemble pas à une adresse e-mail. C'est là que va la réponse.",
  },
};

const de: AssistantWords = {
  launcher: "Fragen?",
  title: (store) => `Fragen zu ${store}`,
  label: "KI-Assistent",
  intro: (store) => `Ein KI-Assistent antwortet hier rund um die Uhr, nur mit dem, was ${store} veröffentlicht hat. Er kann sich irren und sagt, wenn er etwas nicht weiß. ${store} kann dir auch direkt antworten.`,
  placeholder: "Deine Frage",
  send: "Fragen",
  close: "Schließen",
  you: "Du",
  unknown: (store) => `Das weiß ich aus dem, was ${store} veröffentlicht hat, nicht. Ich kann deine Frage an ${store} weitergeben, die Antwort kommt per E-Mail.`,
  handoff: (store) => `Das muss ${store} beantworten. Gib unten deine E-Mail an, dann geht deine Frage dorthin.`,
  askCreator: (store) => `Stattdessen ${store} fragen`,
  spent: (store) => `Der Assistent hat diesen Monat alles beantwortet, was er kann. Hinterlasse deine Frage und deine E-Mail, und ${store} antwortet dir per E-Mail.`,
  email: "Deine E-Mail",
  name: "Dein Name (optional)",
  handoffSend: (store) => `An ${store} senden`,
  handoffDone: (store) => `Gesendet. ${store} antwortet dir per E-Mail.`,
  handoffConsent: (store) => `Deine E-Mail und dieses Gespräch gehen in das Postfach von ${store}, 180 Tage aufbewahrt, nur um dir zu antworten.`,
  privacy: "Dieser Chat wird 24 Stunden aufbewahrt und dann gelöscht, ohne Name oder E-Mail. Nachrichten gehen an das KI-Modell von Anthropic, das die Antworten schreibt.",
  deleteChat: "Diesen Chat löschen",
  deleted: "Gelöscht.",
  notices: {
    short: "Schreib etwas mehr, damit es etwas zu beantworten gibt.",
    slow: "Das waren viele Fragen. Warte ein paar Minuten und frag dann noch einmal.",
    error: "Gerade keine Antwort. Versuch es gleich noch einmal oder frag unten die Person hinter dem Shop.",
    closed: "Dieser Shop nimmt hier gerade keine Fragen an.",
    email: "Das sieht nicht nach einer E-Mail-Adresse aus. Dorthin geht die Antwort.",
  },
};

const it: AssistantWords = {
  launcher: "Domande?",
  title: (store) => `Domande su ${store}`,
  label: "Assistente IA",
  intro: (store) => `Un assistente IA risponde qui, a qualsiasi ora, solo con ciò che ${store} ha pubblicato. Può sbagliare, e dice quando non lo sa. Anche ${store} può risponderti direttamente.`,
  placeholder: "Scrivi la tua domanda",
  send: "Chiedi",
  close: "Chiudi",
  you: "Tu",
  unknown: (store) => `Non lo so da ciò che ${store} ha pubblicato. Posso passare la tua domanda a ${store}, che risponde per email.`,
  handoff: (store) => `Questa è una domanda per ${store}. Lascia la tua email qui sotto e la domanda arriva a loro.`,
  askCreator: (store) => `Chiedi a ${store}`,
  spent: (store) => `L'assistente ha risposto a tutto ciò che può questo mese. Lascia la tua domanda e la tua email, e ${store} ti risponde per email.`,
  email: "La tua email",
  name: "Il tuo nome (facoltativo)",
  handoffSend: (store) => `Invia a ${store}`,
  handoffDone: (store) => `Inviato. ${store} ti risponde per email.`,
  handoffConsent: (store) => `La tua email e questa conversazione vanno nella casella di ${store}, conservate 180 giorni, solo per risponderti.`,
  privacy: "Questa chat è conservata 24 ore, poi cancellata, senza nome né email. I messaggi sono inviati al modello di IA di Anthropic per scrivere le risposte.",
  deleteChat: "Cancella questa chat",
  deleted: "Cancellata.",
  notices: {
    short: "Scrivi un po' di più, così c'è qualcosa a cui rispondere.",
    slow: "Sono state molte domande. Aspetta qualche minuto, poi chiedi di nuovo.",
    error: "Nessuna risposta ora. Riprova tra un momento, o chiedi al creatore qui sotto.",
    closed: "Questo negozio non riceve domande qui al momento.",
    email: "Non sembra un indirizzo email. È dove arriva la risposta.",
  },
};

const nl: AssistantWords = {
  launcher: "Vragen?",
  title: (store) => `Vragen over ${store}`,
  label: "AI-assistent",
  intro: (store) => `Een AI-assistent antwoordt hier, op elk uur, alleen met wat ${store} heeft gepubliceerd. Hij kan zich vergissen, en zegt het als hij het niet weet. ${store} kan je ook zelf antwoorden.`,
  placeholder: "Typ je vraag",
  send: "Vragen",
  close: "Sluiten",
  you: "Jij",
  unknown: (store) => `Dat weet ik niet uit wat ${store} heeft gepubliceerd. Ik kan je vraag doorgeven aan ${store}, die per e-mail antwoordt.`,
  handoff: (store) => `Die vraag is voor ${store}. Laat hieronder je e-mail achter en je vraag gaat naar hen.`,
  askCreator: (store) => `Vraag het ${store}`,
  spent: (store) => `De assistent heeft deze maand alles beantwoord wat hij kan. Laat je vraag en je e-mail achter, en ${store} antwoordt je per e-mail.`,
  email: "Je e-mail",
  name: "Je naam (optioneel)",
  handoffSend: (store) => `Stuur naar ${store}`,
  handoffDone: (store) => `Verstuurd. ${store} antwoordt je per e-mail.`,
  handoffConsent: (store) => `Je e-mail en dit gesprek gaan naar de inbox van ${store}, 180 dagen bewaard, alleen om je te antwoorden.`,
  privacy: "Deze chat wordt 24 uur bewaard en dan verwijderd, zonder naam of e-mail. Berichten gaan naar het AI-model van Anthropic dat de antwoorden schrijft.",
  deleteChat: "Deze chat verwijderen",
  deleted: "Verwijderd.",
  notices: {
    short: "Schrijf iets meer, zodat er iets te beantwoorden is.",
    slow: "Dat waren veel vragen. Wacht een paar minuten en vraag het dan opnieuw.",
    error: "Nu geen antwoord. Probeer het zo opnieuw, of vraag het de maker hieronder.",
    closed: "Deze winkel neemt hier nu geen vragen aan.",
    email: "Dat lijkt geen e-mailadres. Daar gaat het antwoord naartoe.",
  },
};

const pt: AssistantWords = {
  launcher: "Dúvidas?",
  title: (store) => `Perguntas sobre ${store}`,
  label: "Assistente de IA",
  intro: (store) => `Um assistente de IA responde aqui, a qualquer hora, só com o que ${store} publicou. Pode errar, e diz quando não sabe. ${store} também pode responder diretamente.`,
  placeholder: "Escreva a sua pergunta",
  send: "Perguntar",
  close: "Fechar",
  you: "Você",
  unknown: (store) => `Não sei isso pelo que ${store} publicou. Posso passar a sua pergunta a ${store}, que responde por e-mail.`,
  handoff: (store) => `Essa é para ${store} responder. Deixe o seu e-mail abaixo e a sua pergunta chega até lá.`,
  askCreator: (store) => `Perguntar a ${store}`,
  spent: (store) => `O assistente já respondeu tudo o que pode este mês. Deixe a sua pergunta e o seu e-mail, e ${store} responde por e-mail.`,
  email: "O seu e-mail",
  name: "O seu nome (opcional)",
  handoffSend: (store) => `Enviar a ${store}`,
  handoffDone: (store) => `Enviado. ${store} responde por e-mail.`,
  handoffConsent: (store) => `O seu e-mail e esta conversa vão para a caixa de ${store}, guardados 180 dias, só para lhe responder.`,
  privacy: "Este chat é guardado 24 horas e depois apagado, sem nome nem e-mail. As mensagens vão para o modelo de IA da Anthropic, que escreve as respostas.",
  deleteChat: "Apagar este chat",
  deleted: "Apagado.",
  notices: {
    short: "Escreva um pouco mais, para haver algo a responder.",
    slow: "Foram muitas perguntas. Aguarde alguns minutos e pergunte de novo.",
    error: "Sem resposta agora. Tente de novo em um momento, ou pergunte ao criador abaixo.",
    closed: "Esta loja não está recebendo perguntas aqui agora.",
    email: "Isso não parece um endereço de e-mail. É para lá que vai a resposta.",
  },
};

export const ASSISTANT_WORDS: Record<LanguageCode, AssistantWords> = { en, es, fr, de, it, nl, pt };

export function assistantWords(language: unknown): AssistantWords {
  return ASSISTANT_WORDS[parseLanguage(language)];
}
