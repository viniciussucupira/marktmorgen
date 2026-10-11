/**
 * The answers to "where did you hear about us?" (lib/heard.ts), in the order
 * they are offered. Browser-safe.
 */
export const HEARD_ANSWERS = ["instagram", "tiktok", "youtube", "friend", "podcast", "newsletter", "search", "ai", "x", "facebook", "other"] as const;

export type HeardAnswer = (typeof HEARD_ANSWERS)[number];

export function isHeardAnswer(raw: unknown): raw is HeardAnswer {
  return typeof raw === "string" && (HEARD_ANSWERS as readonly string[]).includes(raw);
}

/** What each answer is called in the studio, which speaks English. */
export const HEARD_NAMES: Record<HeardAnswer, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  friend: "A friend, or a message",
  podcast: "A podcast",
  newsletter: "A newsletter or an email",
  search: "A search engine",
  ai: "An AI assistant",
  x: "X",
  facebook: "Facebook",
  other: "Somewhere else",
};
