/**
 * Where the money came from, three ways side by side (added 12 October 2026),
 * and how long after a visit a sale is still credited to it.
 *
 * Read before it was built: Triple Whale ("Total Impact" beside its
 * post-purchase survey), Rockerbox, Northbeam, Wicked Reports, Cometly,
 * Usermaven and Google Analytics all put more than one reading of the same
 * money in one table, because each answers a different question:
 *
 *   - the last visit before buying: what made them decide;
 *   - the first visit, in the 90 days before: where they found the store;
 *   - what the buyer said when asked on the thanks page: what no link can
 *     carry — a podcast, a friend, a video watched on a television.
 *
 * Until now the three were three tables in three places. Here each channel is
 * one row with the three side by side, for the same days, and the answers
 * that name a channel sit on that channel's row: "Instagram" beside the
 * Instagram visits, "A search engine" beside Google, Bing and DuckDuckGo. An
 * answer no link can carry (a podcast, a friend, somewhere else) is a row of
 * its own, and the money of sales with no channel is split by what those
 * buyers said, which is the part of "direct" a creator can finally read.
 *
 * Every number is a sum the store already keeps; the one new count is, per
 * answer, the money of sales that had no channel (lib/stats.ts countHeard).
 * Linear or time-decay models would need every visit of every visitor kept,
 * which this does not do.
 *
 * Pure, so the studio's table and the tests read one rule.
 */
import { type HeardAnswer, HEARD_ANSWERS, HEARD_NAMES } from "@/lib/heard-rules";
import { channelName } from "@/lib/channel-names";

/** How many days after a visit a sale is still credited to where that visit came from. */
export const ATTRIBUTION_DAYS = [7, 30, 60, 90] as const;
export type AttributionDays = (typeof ATTRIBUTION_DAYS)[number];
export const DEFAULT_ATTRIBUTION_DAYS: AttributionDays = 30;

export function parseAttributionDays(raw: unknown): AttributionDays {
  const n = typeof raw === "string" ? Number(raw) : raw;
  return (ATTRIBUTION_DAYS as readonly unknown[]).includes(n) ? (n as AttributionDays) : DEFAULT_ATTRIBUTION_DAYS;
}

/**
 * The channels each answer names (lib/source-rules.ts). An answer with none
 * is something no link carries.
 */
export const ANSWER_CHANNELS: Record<HeardAnswer, string[]> = {
  instagram: ["instagram"],
  tiktok: ["tiktok"],
  youtube: ["youtube"],
  x: ["x"],
  facebook: ["facebook"],
  search: ["google", "bing", "duckduckgo"],
  ai: ["chatgpt", "perplexity", "claude", "gemini", "copilot", "deepseek", "grok"],
  newsletter: ["email", "newsletter"],
  friend: ["whatsapp", "device"],
  podcast: ["podcast"],
  other: [],
};

/** What a row is called: the channel's own name, or for several, the answer's. */
const GROUP_NAMES: Partial<Record<HeardAnswer, string>> = {
  search: "Search engines",
  ai: "AI assistants",
  newsletter: "Email and newsletters",
  friend: "A friend, or a message",
  podcast: "Podcasts",
  other: "Somewhere else",
};

export type Money = { sales: number; cents: number };

export type AttributionRow = {
  /** The channel, or for a group of channels, the answer that names them ("search"). */
  key: string;
  name: string;
  last: Money;
  first: Money;
  /** What buyers said: how many answered this, and the money of the sales they answered for. */
  said: { buyers: number; cents: number };
};

export type AttributionTable = {
  rows: AttributionRow[];
  /** Sales credited to no channel at all, by the last visit. */
  unknown: Money;
  /** Of those, what their buyers said, the most money first. */
  unknownSaid: { answer: string; name: string; buyers: number; cents: number }[];
  /** Everything credited, by the last visit: the total each column adds up to. */
  total: Money;
};

type BySource = { source: string; sales: number; cents: number }[];
type Heard = { answer: string; buyers: number; cents: number; unknownBuyers?: number; unknownCents?: number }[];

/** Which row a channel goes on: the answer that names it, or itself. */
function rowOf(source: string): string {
  for (const answer of HEARD_ANSWERS) if (ANSWER_CHANNELS[answer].includes(source)) return ANSWER_CHANNELS[answer].length > 1 || GROUP_NAMES[answer] ? answer : source;
  return source;
}

function nameOf(key: string): string {
  if ((HEARD_ANSWERS as readonly string[]).includes(key)) {
    const answer = key as HeardAnswer;
    return GROUP_NAMES[answer] ?? channelName(ANSWER_CHANNELS[answer][0] ?? key);
  }
  return channelName(key);
}

/**
 * The table: one row per channel, or per answer that names several, with
 * the money by the last visit, by the first, and by what buyers said. The
 * row with no channel is not a row: it is `unknown`, split by what its
 * buyers said. Sorted by the most money in any of the three columns.
 */
export function attributionTable(last: BySource, first: BySource, heard: Heard): AttributionTable {
  const rows = new Map<string, AttributionRow>();
  const row = (key: string) => {
    let found = rows.get(key);
    if (!found) {
      found = { key, name: nameOf(key), last: { sales: 0, cents: 0 }, first: { sales: 0, cents: 0 }, said: { buyers: 0, cents: 0 } };
      rows.set(key, found);
    }
    return found;
  };
  const unknown: Money = { sales: 0, cents: 0 };
  const total: Money = { sales: 0, cents: 0 };
  for (const r of last) {
    total.sales += r.sales;
    total.cents += r.cents;
    if (!r.source || r.source === "direct") {
      unknown.sales += r.sales;
      unknown.cents += r.cents;
      continue;
    }
    const target = row(rowOf(r.source)).last;
    target.sales += r.sales;
    target.cents += r.cents;
  }
  for (const r of first) {
    if (!r.source || r.source === "direct") continue;
    const target = row(rowOf(r.source)).first;
    target.sales += r.sales;
    target.cents += r.cents;
  }
  for (const h of heard) {
    if (!(HEARD_ANSWERS as readonly string[]).includes(h.answer)) continue;
    const answer = h.answer as HeardAnswer;
    const key = ANSWER_CHANNELS[answer].length === 1 && !GROUP_NAMES[answer] ? ANSWER_CHANNELS[answer][0] : answer;
    const target = row(key).said;
    target.buyers += h.buyers;
    target.cents += h.cents;
  }
  const unknownSaid = heard
    .filter((h) => (h.unknownBuyers ?? 0) > 0 && (HEARD_ANSWERS as readonly string[]).includes(h.answer))
    .map((h) => ({ answer: h.answer, name: HEARD_NAMES[h.answer as HeardAnswer], buyers: h.unknownBuyers ?? 0, cents: h.unknownCents ?? 0 }))
    .sort((a, b) => b.cents - a.cents || b.buyers - a.buyers || a.answer.localeCompare(b.answer));
  const most = (r: AttributionRow) => Math.max(r.last.cents, r.first.cents, r.said.cents);
  return {
    rows: [...rows.values()].sort((a, b) => most(b) - most(a) || b.last.sales + b.said.buyers - (a.last.sales + a.said.buyers) || a.name.localeCompare(b.name)),
    unknown,
    unknownSaid,
    total,
  };
}
