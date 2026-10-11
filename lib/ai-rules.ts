/**
 * The writing help in the studio, as rules the browser can read too: what it
 * writes, how much of it a store gets each month, and what it will never do.
 * The part that talks to the model is lib/ai.ts, which only the server loads.
 *
 * Measured before it was built (30 September 2026): Circle (AI writer,
 * course builder), Mighty Networks (Instant Course Outline, "Make It
 * Better"), Kajabi (Cofounder AI, 500 to 1,000 AI credits on its $199 and
 * $399 plans), Teachable (Course Starter, drafts the sales page), Thinkific
 * (outline, landing page and email copy) and Beacons all write for a
 * creator. Stan's Stanley answers questions about Stan. Here it is on the
 * $29 plan, for the things a creator most often stares at a blank box over:
 * a product's description, its whole sales page (added 7 October 2026), a
 * course's outline, and an email.
 *
 * What it never does, because a page written for somebody else to sell with
 * has to be something they can stand behind:
 *
 *   - invent a testimonial, a review, a number of students, sales or
 *     earnings, a result, a guarantee, a bonus, a discount, a deadline or a
 *     limit on how many are left;
 *   - publish anything. It fills the boxes in the studio, the creator reads
 *     and changes them, and nothing is saved until they press Save.
 */

export type AiKind = "product" | "page" | "outline" | "email" | "review" | "block";

/** Writing jobs a store may ask for in a calendar month, by where it stands with its plan. */
export const AI_MONTHLY = { trial: 20, creator: 100, pro: 400, scale: 1_000 } as const;
/** And in any one minute, so a stuck button cannot spend the month. */
export const AI_PER_MINUTE = 6;

/** The most a creator types into the studio's help box (lib/help-ask.ts). */
export const MAX_HELP_QUESTION = 400;

/** The most a creator types into the box that tells it what to write. */
export const MAX_AI_NOTES = 1_500;

/** What a product is, as the writer is told it, so it never has to guess how it is delivered. */
export type ProductKind = "download" | "link" | "course" | "membership" | "call" | "bundle";

export type EmailGoal = "announce" | "nurture" | "offer" | "update";

export const EMAIL_GOALS: { id: EmailGoal; label: string }[] = [
  { id: "announce", label: "Announce a product" },
  { id: "offer", label: "Remind people about a product" },
  { id: "nurture", label: "Teach something useful" },
  { id: "update", label: "Share news" },
];

/** The course outline the writer proposes: at most this many modules, and lessons in each. */
export const MAX_AI_MODULES = 8;
export const MAX_AI_LESSONS = 8;

/**
 * A sales page drafted from the product's own PDF too (lib/ai.ts,
 * readPdfFacts): its first pages are read, at most this many, and the reading
 * takes this many of the month's jobs on top of the page's own one. Ten pages
 * read by the smaller model cost about what two drafts are costed at
 * (tests/plan-margin.test.ts).
 */
export const READ_PDF_PAGES = 10;
export const READ_PDF_JOBS = 2;
