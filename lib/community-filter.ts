/**
 * The community's word filter and spam check (113 [E2-COMMUNITY-MODERATION],
 * unit 1; added 1 November 2026): what decides that a post or a comment is
 * held for the creator to look at before anyone else sees it.
 *
 * Held, never deleted or changed: the member's words stay exactly as written,
 * and the creator decides in the moderation list that already exists
 * (lib/community.ts, the reported list). A false alarm costs a member a wait,
 * not their words. Nothing is guessed by a model, nothing leaves the store,
 * and the member is told plainly that what they wrote waits for a look.
 *
 * Two reasons, each said in words to the creator:
 *
 *   word   a word or phrase on the creator's own list, matched whole, without
 *          caring about capitals or accents ("cafe" holds "Café", "spam"
 *          does not hold "spammer" unless the creator lists that too);
 *   links  more web addresses in one text than FILTER_MAX_LINKS, the usual
 *          shape of a spam post, from a member, never from the creator.
 *
 * The list is the creator's: up to FILTER_MAX_WORDS entries of up to
 * FILTER_MAX_WORD_LENGTH characters. Keeping it with the community and
 * holding a post on it are the next unit.
 *
 * Browser-safe: plain data and pure functions, so the studio shows the same
 * rule the server applies.
 */
import { segments } from "@/lib/community-text";

export const FILTER_MAX_WORDS = 50;
export const FILTER_MAX_WORD_LENGTH = 40;
/** A member's text with more web addresses than this is held: two are a conversation, three are usually an advertisement. */
export const FILTER_MAX_LINKS = 2;

/** Lower case, accents taken off, every run of spaces one space: how a list entry and a text are compared. */
export function foldText(text: string): string {
  return text.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** The creator's list as kept: folded, each once, empty and too long ones left out, at most FILTER_MAX_WORDS. */
export function readFilterWords(raw: unknown): string[] {
  const entries = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(/[\n,]/) : [];
  const out: string[] = [];
  for (const entry of entries) {
    if (typeof entry !== "string") continue;
    const word = foldText(entry);
    if (!word || word.length > FILTER_MAX_WORD_LENGTH || out.includes(word)) continue;
    out.push(word);
    if (out.length === FILTER_MAX_WORDS) break;
  }
  return out;
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export type HoldReason = { kind: "word"; word: string } | { kind: "links"; count: number };

/**
 * Why a text is held, or null when it goes up as it does today. `byCreator`
 * is true for the community's own creator and team, who are never held.
 */
export function holdReason(text: string, words: readonly string[], byCreator = false): HoldReason | null {
  if (byCreator) return null;
  const folded = foldText(text);
  for (const word of words) {
    // Whole words and phrases only: letters or digits on either side mean another word.
    if (new RegExp(`(?<![\\p{L}\\p{N}])${escape(word)}(?![\\p{L}\\p{N}])`, "u").test(folded)) return { kind: "word", word };
  }
  const links = segments(text).filter((piece) => piece.kind === "link").length;
  if (links > FILTER_MAX_LINKS) return { kind: "links", count: links };
  return null;
}

/** What the creator reads beside a held post or comment. */
export function holdWords(reason: HoldReason): string {
  return reason.kind === "word"
    ? `Held for you to look at: it uses "${reason.word}", which is on your list of words to check.`
    : `Held for you to look at: it has ${reason.count} links, and posts with more than ${FILTER_MAX_LINKS} are usually advertising.`;
}

/** What the member is told, without saying which word or rule, so the filter is not taught how to be dodged. */
export const HELD_FOR_MEMBER = "Thanks. Your words wait for a quick look from the community's host before others see them. Nothing you wrote was changed.";
