/**
 * Buyers in groups by how recently and how often they bought, with what they
 * spent beside it (270 [GR1], unit 1; added 1 November 2026): the classic
 * recency, frequency and value, read only from the store's own sales (the
 * buyers' ledger, lib/segments.ts) and never from anyone else's data.
 *
 * Each group says its own rule in plain words, so the creator sees exactly
 * who is in it and why. The groups do not overlap and do not guess: nothing
 * here predicts what anybody will spend. A buyer brought over from another
 * platform has no purchase here, so is in none of them.
 *
 * Browser-safe: plain data and pure functions.
 */

export type RfmGroup = "best" | "loyal" | "new" | "once" | "at-risk" | "lapsed";

const DAY = 86_400_000;
/** "Recently": the last 90 days. */
const RECENT_DAYS = 90;
/** "Still around": the last 180 days. */
const AROUND_DAYS = 180;
/** "Just now": the last 30 days. */
const NEW_DAYS = 30;
/** "Often": three times or more. */
const OFTEN = 3;

/** The groups, in the order they are tested and shown, each with its rule in words. */
export const RFM_GROUPS: readonly { id: RfmGroup; name: string; rule: string }[] = [
  { id: "best", name: "Best customers", rule: `Bought ${OFTEN} or more times, the last time in the last ${RECENT_DAYS} days.` },
  { id: "loyal", name: "Loyal customers", rule: `Bought 2 or more times, the last time in the last ${AROUND_DAYS} days.` },
  { id: "new", name: "New customers", rule: `Bought once, in the last ${NEW_DAYS} days.` },
  { id: "once", name: "Bought once", rule: `Bought once, between ${NEW_DAYS} and ${AROUND_DAYS} days ago.` },
  { id: "at-risk", name: "At risk of not coming back", rule: `Bought 2 or more times, but not in the last ${AROUND_DAYS} days.` },
  { id: "lapsed", name: "Have not bought in a long time", rule: `Bought once, more than ${AROUND_DAYS} days ago.` },
];

/** One buyer as the ledger has them: what they spent, when they last bought, how many times. */
export type RfmBuyer = { cents: number; last: number; orders: number };

/** The one group a buyer is in, or null when they have no purchase here. */
export function rfmGroup(buyer: RfmBuyer, now = Date.now()): RfmGroup | null {
  if (buyer.orders <= 0 || buyer.last <= 0) return null;
  const days = (now - buyer.last) / DAY;
  if (buyer.orders >= OFTEN && days <= RECENT_DAYS) return "best";
  if (buyer.orders >= 2 && days <= AROUND_DAYS) return "loyal";
  if (buyer.orders === 1 && days <= NEW_DAYS) return "new";
  if (buyer.orders === 1 && days <= AROUND_DAYS) return "once";
  if (buyer.orders >= 2) return "at-risk";
  return "lapsed";
}

/** Each group's size and what its buyers spent in all, from the store's own figures. */
export type RfmSummary = { id: RfmGroup; name: string; rule: string; buyers: number; cents: number };

export function rfmSummary(buyers: Iterable<RfmBuyer>, now = Date.now()): RfmSummary[] {
  const sums = new Map<RfmGroup, { buyers: number; cents: number }>(RFM_GROUPS.map((g) => [g.id, { buyers: 0, cents: 0 }]));
  for (const buyer of buyers) {
    const group = rfmGroup(buyer, now);
    if (!group) continue;
    const sum = sums.get(group)!;
    sum.buyers += 1;
    sum.cents += Math.max(0, Math.round(buyer.cents));
  }
  return RFM_GROUPS.map((g) => ({ ...g, ...sums.get(g.id)! }));
}
