/**
 * The one question on the page a buyer lands on after paying: where they
 * heard of the store (lib/heard.ts), in each language a store can speak.
 *
 * Browser-safe: plain data and small functions, nothing from the server.
 */
import { type LanguageCode, parseLanguage } from "@/lib/store-language";
import type { HeardAnswer } from "@/lib/heard-rules";

export type HeardWords = {
  question: (store: string) => string;
  note: string;
  choices: Record<HeardAnswer, string>;
  thanks: string;
  failed: string;
};

const en: HeardWords = {
  question: (store) => `One question: where did you hear about ${store}?`,
  note: "Optional, and it helps the creator know where to share their work. Nothing about you is kept with your answer.",
  choices: {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    friend: "A friend, or a message",
    podcast: "A podcast",
    newsletter: "A newsletter or an email",
    search: "A search engine",
    ai: "An AI assistant, like ChatGPT",
    x: "X",
    facebook: "Facebook",
    other: "Somewhere else",
  },
  thanks: "Thank you. That helps.",
  failed: "That did not go through. You can try again, or leave it.",
};

const es: HeardWords = {
  question: (store) => `Una pregunta: ¿dónde conociste ${store}?`,
  note: "Es opcional, y ayuda al creador a saber dónde compartir su trabajo. No se guarda nada sobre ti con tu respuesta.",
  choices: {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    friend: "Un amigo o un mensaje",
    podcast: "Un pódcast",
    newsletter: "Una newsletter o un email",
    search: "Un buscador",
    ai: "Un asistente de IA, como ChatGPT",
    x: "X",
    facebook: "Facebook",
    other: "En otro sitio",
  },
  thanks: "Gracias. Nos ayuda.",
  failed: "No se ha enviado. Puedes intentarlo de nuevo o dejarlo.",
};

const fr: HeardWords = {
  question: (store) => `Une question : comment avez-vous connu ${store} ?`,
  note: "C’est facultatif, et cela aide le créateur à savoir où partager son travail. Rien sur vous n’est gardé avec votre réponse.",
  choices: {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    friend: "Un ami ou un message",
    podcast: "Un podcast",
    newsletter: "Une newsletter ou un e-mail",
    search: "Un moteur de recherche",
    ai: "Un assistant IA, comme ChatGPT",
    x: "X",
    facebook: "Facebook",
    other: "Ailleurs",
  },
  thanks: "Merci, cela aide.",
  failed: "L’envoi n’a pas abouti. Vous pouvez réessayer, ou laisser.",
};

const de: HeardWords = {
  question: (store) => `Eine Frage: Wie haben Sie von ${store} erfahren?`,
  note: "Freiwillig – und es hilft zu wissen, wo es sich lohnt, die eigene Arbeit zu zeigen. Mit Ihrer Antwort wird nichts über Sie gespeichert.",
  choices: {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    friend: "Von Freunden oder per Nachricht",
    podcast: "In einem Podcast",
    newsletter: "In einem Newsletter oder einer E-Mail",
    search: "Über eine Suchmaschine",
    ai: "Über einen KI-Assistenten wie ChatGPT",
    x: "X",
    facebook: "Facebook",
    other: "Anderswo",
  },
  thanks: "Danke, das hilft.",
  failed: "Das hat nicht geklappt. Sie können es noch einmal versuchen oder es lassen.",
};

const it: HeardWords = {
  question: (store) => `Una domanda: come hai conosciuto ${store}?`,
  note: "È facoltativo, e aiuta il creatore a sapere dove condividere il suo lavoro. Con la tua risposta non viene conservato nulla su di te.",
  choices: {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    friend: "Un amico o un messaggio",
    podcast: "Un podcast",
    newsletter: "Una newsletter o un'email",
    search: "Un motore di ricerca",
    ai: "Un assistente IA, come ChatGPT",
    x: "X",
    facebook: "Facebook",
    other: "Altrove",
  },
  thanks: "Grazie, ci aiuta.",
  failed: "Non è andata a buon fine. Puoi riprovare, o lasciar perdere.",
};

const nl: HeardWords = {
  question: (store) => `Eén vraag: hoe heb je ${store} leren kennen?`,
  note: "Het is vrijblijvend, en het helpt de maker te weten waar die zijn werk kan delen. Er wordt niets over jou bewaard bij je antwoord.",
  choices: {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    friend: "Via een vriend of een bericht",
    podcast: "Via een podcast",
    newsletter: "Via een nieuwsbrief of e-mail",
    search: "Via een zoekmachine",
    ai: "Via een AI-assistent, zoals ChatGPT",
    x: "X",
    facebook: "Facebook",
    other: "Ergens anders",
  },
  thanks: "Bedankt, dat helpt.",
  failed: "Dat is niet gelukt. Je kunt het opnieuw proberen, of het laten.",
};

const pt: HeardWords = {
  question: (store) => `Uma pergunta: como conheceu ${store}?`,
  note: "É opcional, e ajuda o criador a saber onde partilhar o seu trabalho. Nada sobre si é guardado com a sua resposta.",
  choices: {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    friend: "Um amigo ou uma mensagem",
    podcast: "Um podcast",
    newsletter: "Uma newsletter ou um email",
    search: "Um motor de busca",
    ai: "Um assistente de IA, como o ChatGPT",
    x: "X",
    facebook: "Facebook",
    other: "Noutro sítio",
  },
  thanks: "Obrigado, ajuda bastante.",
  failed: "Não foi possível enviar. Pode tentar de novo, ou deixar.",
};

export const HEARD_WORDS: Record<LanguageCode, HeardWords> = { en, es, fr, de, it, nl, pt };

export function heardWords(language: unknown): HeardWords {
  return HEARD_WORDS[parseLanguage(language)];
}
