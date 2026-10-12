/**
 * A score of 0 to 100 for each member, from rules anybody can read (added 12
 * October 2026; lib/member-health.ts reads what it needs).
 *
 * Read before it was built: Baremetrics and ProfitWell give each customer a
 * health or churn-risk score; GA4 and Segment predict it, but only above a
 * thousand (GA4) or a hundred (Segment) people who did and did not leave,
 * which a creator's membership rarely has. So this is a rule, not a
 * prediction, and every score shows the reasons that made it:
 *
 *   start at 100, and take off
 *     40  a payment failed and Stripe is retrying it
 *     40  the member already canceled; it ends at the end of what they paid for
 *     15  paused
 *   and, for being away, up to 70 shared between the places the membership
 *   opens (its course, its community; 70 for one, 35 each for both):
 *     all of a place's share   never opened it (after their first week)
 *     90% of it                not there for 30 days or more
 *     40% of it                not there for 14 to 29 days
 *
 *   70 to 100 is doing well, 40 to 69 is slipping, under 40 is at risk. So a
 *   member who never opened the one course they pay for is at risk, and one
 *   away from it for two weeks is still doing well.
 *
 * A membership with neither a course nor a community has nothing here that
 * says how much it is used, and its score says only how it is being paid.
 *
 * Browser-safe.
 */

export const DAY = 86_400;

export type HealthInput = {
  /** Stripe's state: "active", "trialing", "past_due". */
  status: string;
  /** Canceled by the member, running out what they paid for. */
  setToEnd: boolean;
  paused: boolean;
  /** Null when the membership has no course; 0 when the member never opened it; otherwise when they last did (seconds). */
  courseSeen: number | null;
  /** The same for the community. */
  communitySeen: number | null;
  /** When the membership began (seconds): a member of a few days is not "away" for not having come back yet. */
  since: number;
};

export type HealthReason =
  | "payment"
  | "ending"
  | "paused"
  | "course-never"
  | "course-30"
  | "course-14"
  | "community-never"
  | "community-30"
  | "community-14";

/** What paying-side reasons take off. */
const PAYING_POINTS = { payment: 40, ending: 40, paused: 15 } as const;
/** What being away can take off in all, shared between the places a membership opens. */
export const AWAY_POINTS = 70;
const AWAY_SHARE = { never: 1, "30": 0.9, "14": 0.4 } as const;

/** Each reason as the creator reads it. */
export const HEALTH_WORDS: Record<HealthReason, string> = {
  payment: "Latest payment failed",
  ending: "Canceled, running out what they paid for",
  paused: "Paused",
  "course-never": "Never opened the course",
  "course-30": "Not in the course for 30+ days",
  "course-14": "Not in the course for 14+ days",
  "community-never": "Never came into the community",
  "community-30": "Not in the community for 30+ days",
  "community-14": "Not in the community for 14+ days",
};

export type Band = "well" | "slipping" | "risk";
export const BAND_NAMES: Record<Band, string> = { well: "Doing well", slipping: "Slipping", risk: "At risk" };
export const bandOf = (score: number): Band => (score >= 70 ? "well" : score >= 40 ? "slipping" : "risk");

/** Reasons that are about being away, not about paying: the ones a come-back email can answer. */
export const AWAY: ReadonlySet<HealthReason> = new Set(["course-never", "course-30", "community-never", "community-30"]);

/** A member is given a week before "never opened" counts against them. */
const SETTLING_DAYS = 7;

function away(seen: number | null, since: number, now: number): keyof typeof AWAY_SHARE | null {
  if (seen === null) return null;
  if (seen === 0) return now - since >= SETTLING_DAYS * DAY ? "never" : null;
  const days = (now - seen) / DAY;
  if (days >= 30) return "30";
  if (days >= 14) return "14";
  return null;
}

export type HealthFactor = { reason: HealthReason; points: number };

/** The score and the reasons that made it, each with what it took off. Pure. */
export function scoreOf(input: HealthInput, now: number): { score: number; factors: HealthFactor[] } {
  const factors: HealthFactor[] = [];
  if (input.status === "past_due") factors.push({ reason: "payment", points: PAYING_POINTS.payment });
  if (input.setToEnd) factors.push({ reason: "ending", points: PAYING_POINTS.ending });
  if (input.paused) factors.push({ reason: "paused", points: PAYING_POINTS.paused });
  // While paused, nothing is open to come back to: being away is not held against them.
  if (!input.paused) {
    const places = (input.courseSeen === null ? 0 : 1) + (input.communitySeen === null ? 0 : 1);
    const share = places ? AWAY_POINTS / places : 0;
    const course = away(input.courseSeen, input.since, now);
    if (course) factors.push({ reason: `course-${course}` as HealthReason, points: Math.round(share * AWAY_SHARE[course]) });
    const community = away(input.communitySeen, input.since, now);
    if (community) factors.push({ reason: `community-${community}` as HealthReason, points: Math.round(share * AWAY_SHARE[community]) });
  }
  const score = Math.max(0, 100 - factors.reduce((sum, f) => sum + f.points, 0));
  return { score, factors };
}

// ---- The come-back email to members who stopped coming ----------------------

/**
 * Off for every store until its creator turns it on, and only with a postal
 * address to print, as every email to a list must carry. Sent once per period
 * a member pays for, only to somebody who agreed to hear from the creator, at
 * risk only for being away (never opened, or 30 days and more): a payment that failed has its own emails
 * (lib/payment-recovery.ts), and somebody who canceled is not chased.
 */
export type Nudge = { on: boolean; address: string };
export const NO_NUDGE: Nudge = { on: false, address: "" };

export function parseNudge(raw: unknown): Nudge {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const address = typeof value.address === "string" ? value.address.replace(/\s+/g, " ").trim().slice(0, 300) : "";
  return { on: value.on === true && address.length > 0, address };
}

/** Whether a member's score is one the come-back email answers: at risk, and only for being away. */
export function nudgeFits(score: number, factors: HealthFactor[]): boolean {
  return bandOf(score) === "risk" && factors.length > 0 && factors.every((f) => AWAY.has(f.reason));
}
