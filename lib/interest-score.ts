/**
 * How much a contact has shown interest in a store, scored only from what
 * they did with it (268 [KT2], unit 1; added 1 November 2026).
 *
 * Every point comes from something the contact did with this store and the
 * store already keeps: buying (the buyers' ledger, lib/segments.ts), signing
 * up for something free (lib/contacts.ts), a link they used in an email of
 * a sequence they allowed to note it (lib/mail-clicks.ts), being seen in the
 * store's community (lib/community.ts, lastSeenIn). Never an email being
 * opened: opens are not counted here at all, on purpose, and Apple Mail
 * opens every email by itself anyway. Never anything bought or looked up
 * elsewhere about anybody.
 *
 * The creator sees the score beside its reasons, each with the points it
 * gave, so a number is never a judgment without its why. It is a count of
 * what happened, not a prediction.
 *
 * Browser-safe: plain data and pure functions. Unit 2 reads the signals into
 * the contacts list, inside the plan's existing reads.
 */

const DAY = 86_400_000;

/** What the store knows a contact did, each from its own record. */
export type InterestSignals = {
  /** Checkouts paid, from the buyers' ledger. */
  orders: number;
  /** When they last bought, in milliseconds; 0 when never. */
  lastBought: number;
  /** They signed up for something free. */
  signedUpFree: boolean;
  /** Links they used in sequence emails that note it, in the last 90 days. */
  clicks90: number;
  /** When they were last seen in the community, in milliseconds; 0 when never. */
  lastSeenInCommunity: number;
};

export type InterestReason = { points: number; words: string };

/** The rules, each with its points and its cap, said as the creator reads them. */
export const INTEREST_RULES = {
  perOrder: { points: 3, most: 5, words: "3 points for each purchase, up to 5 purchases" },
  recentOrder: { points: 2, days: 90, words: "2 points for a purchase in the last 90 days" },
  free: { points: 2, words: "2 points for signing up for something free" },
  perClick: { points: 1, most: 5, days: 90, words: "1 point for each link used in your sequence emails in the last 90 days, up to 5" },
  community: { points: 2, days: 30, words: "2 points for being in your community in the last 30 days" },
} as const;

/** The score and the reasons it is made of, from the contact's own signals. */
export function interestScore(signals: InterestSignals, now = Date.now()): { score: number; reasons: InterestReason[] } {
  const r = INTEREST_RULES;
  const reasons: InterestReason[] = [];
  const orders = Math.min(Math.max(0, Math.floor(signals.orders)), r.perOrder.most);
  if (orders > 0) reasons.push({ points: orders * r.perOrder.points, words: `Bought ${orders === 1 ? "once" : `${orders} times`}${signals.orders > r.perOrder.most ? " or more" : ""}` });
  if (signals.lastBought > 0 && now - signals.lastBought <= r.recentOrder.days * DAY) reasons.push({ points: r.recentOrder.points, words: `Bought in the last ${r.recentOrder.days} days` });
  if (signals.signedUpFree) reasons.push({ points: r.free.points, words: "Signed up for something free" });
  const clicks = Math.min(Math.max(0, Math.floor(signals.clicks90)), r.perClick.most);
  if (clicks > 0) reasons.push({ points: clicks * r.perClick.points, words: `Used ${clicks === 1 ? "a link" : `${clicks} links`} in your emails in the last ${r.perClick.days} days` });
  if (signals.lastSeenInCommunity > 0 && now - signals.lastSeenInCommunity <= r.community.days * DAY) reasons.push({ points: r.community.points, words: `In your community in the last ${r.community.days} days` });
  return { score: reasons.reduce((sum, reason) => sum + reason.points, 0), reasons };
}

/** The highest score anybody can have, said beside a score so it reads as "of". */
export const INTEREST_MOST =
  INTEREST_RULES.perOrder.points * INTEREST_RULES.perOrder.most +
  INTEREST_RULES.recentOrder.points +
  INTEREST_RULES.free.points +
  INTEREST_RULES.perClick.points * INTEREST_RULES.perClick.most +
  INTEREST_RULES.community.points;
