/**
 * Conditions in a sequence (added 11 October 2026): an email sent only to
 * some of the people in it, and a sequence that ends for somebody once it has
 * done its job.
 *
 * Until now a sequence sent every email to everyone in it. So the emails that
 * sell — "the course opens Friday", "last day of the launch price" — went on
 * to the people who had already bought the course, which costs a creator
 * trust and money, and a creator who wanted one email for buyers and another
 * for everybody else had to keep two sequences and hope.
 *
 * Two things now:
 *
 *   - An end ("goal"): the sequence stops for anyone who gets one product,
 *     or buys anything at all. Checked before each of its emails.
 *   - A condition on an email: send it only to those who got a product, or
 *     have not; who have bought something, or have not yet; who carry a
 *     label, or do not. Anyone it does not hold for skips that email and
 *     goes on to the next one, or leaves the sequence there, as the creator
 *     chooses.
 *
 * Read from what the list has always kept about each person: what they
 * asked for or bought, how they first agreed, and the labels an import
 * brought (lib/contacts.ts). And one more, only for somebody who allowed it
 * with a box of its own: whether they used a link to the store in the email
 * before this one (lib/mail-clicks.ts). Somebody who did not allow it counts
 * as not having used one. Never from opens: there is no tracking pixel.
 *
 * And, from 12 October 2026, what somebody did in a course: whether they
 * opened it at all, and whether they finished it (every lesson done),
 * read from the course's own record of its students (lib/learn.ts). With a
 * wait before it, "has not opened the course" is the reminder three days
 * after buying; a sequence that starts when somebody finishes a course
 * (lib/flows.ts, trigger "finished") is the offer of the next one.
 *
 * Browser-safe.
 */

export type StepIf = "has" | "lacks" | "buyer" | "lead" | "tag" | "untagged" | "clicked" | "unclicked" | "started" | "unstarted" | "finished" | "unfinished";
export const STEP_IFS: readonly StepIf[] = ["has", "lacks", "buyer", "lead", "tag", "untagged", "clicked", "unclicked", "started", "unstarted", "finished", "unfinished"];

/** The conditions read from a course's record of its students: opened it or not, finished it or not. */
export const COURSE_IFS: readonly StepIf[] = ["started", "unstarted", "finished", "unfinished"];
export const isCourseIf = (kind: StepIf | "" | undefined): kind is "started" | "unstarted" | "finished" | "unfinished" => (COURSE_IFS as readonly string[]).includes(kind ?? "");

export type StepCondition =
  | { if: "has" | "lacks"; productId: string }
  | { if: "buyer" | "lead" }
  | { if: "tag" | "untagged"; tag: string }
  /** Used a link to the store in the email before this one, or did not (lib/mail-clicks.ts). */
  | { if: "clicked" | "unclicked" }
  /** Opened the course this product is, or not; did every lesson of it, or not (lib/learn.ts). */
  | { if: "started" | "unstarted" | "finished" | "unfinished"; productId: string };

/** Whether a condition reads the email before, so cannot be on the first. */
export const readsEmailBefore = (condition: StepCondition | null | undefined): boolean => condition?.if === "clicked" || condition?.if === "unclicked";

/** What happens to somebody a condition does not hold for. */
export type Otherwise = "skip" | "end";

/** When a sequence ends early: once they get one product, or buy anything. */
export type FlowGoal = { productId: string } | { any: true };

/** The longest label a condition can name; the same as an imported label's (lib/contacts.ts). */
export const MAX_CONDITION_TAG = 40;

/**
 * What a condition is read against: one person, as the list keeps them, and
 * whether they used a link in the email before (only ever true for somebody
 * who allowed it to be seen).
 */
export type Person = {
  ids: readonly string[];
  source: string;
  tags: readonly string[];
  used?: boolean;
  /** For a condition on a course: whether they opened it and whether they did every lesson. */
  course?: { started: boolean; finished: boolean };
};

const sameTag = (a: string, b: string) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();

/** Whether somebody has paid for something: a product sold for money, or they first agreed at a checkout (lib/contacts.ts, isBuyer). */
export function paidSomething(person: Person, paid: ReadonlySet<string>): boolean {
  return person.source === "buyer" || person.ids.some((id) => paid.has(id));
}

/** Whether this condition holds for this person. */
export function holds(condition: StepCondition, person: Person, paid: ReadonlySet<string>): boolean {
  switch (condition.if) {
    case "has":
      return person.ids.includes(condition.productId);
    case "lacks":
      return !person.ids.includes(condition.productId);
    case "buyer":
      return paidSomething(person, paid);
    case "lead":
      return !paidSomething(person, paid);
    case "tag":
      return person.tags.some((t) => sameTag(t, condition.tag));
    case "untagged":
      return !person.tags.some((t) => sameTag(t, condition.tag));
    case "clicked":
      return person.used === true;
    case "unclicked":
      return person.used !== true;
    case "started":
      return person.course?.started === true;
    case "unstarted":
      return person.course?.started !== true;
    case "finished":
      return person.course?.finished === true;
    case "unfinished":
      return person.course?.finished !== true;
  }
}

/** Whether this person has reached the sequence's end. */
export function reached(goal: FlowGoal, person: Person, paid: ReadonlySet<string>): boolean {
  return "any" in goal ? paidSomething(person, paid) : person.ids.includes(goal.productId);
}

/**
 * A condition as sent from the studio, cleaned; null when there is none or it
 * cannot be read. `known` says whether a product is the store's.
 */
export function readCondition(
  raw: unknown,
  known: (productId: string) => boolean,
  /** Whether a product is a course, for a condition on one; any product the store has when not given. */
  isCourse: (productId: string) => boolean = known,
): StepCondition | null | "bad" {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw !== "object") return "bad";
  const value = raw as Record<string, unknown>;
  const kind = STEP_IFS.find((k) => k === value.if);
  if (!kind) return "bad";
  if (kind === "has" || kind === "lacks") {
    const productId = typeof value.productId === "string" ? value.productId : "";
    return productId && known(productId) ? { if: kind, productId } : "bad";
  }
  if (kind === "started" || kind === "unstarted" || kind === "finished" || kind === "unfinished") {
    const productId = typeof value.productId === "string" ? value.productId : "";
    return productId && known(productId) && isCourse(productId) ? { if: kind, productId } : "bad";
  }
  if (kind === "tag" || kind === "untagged") {
    const tag = typeof value.tag === "string" ? value.tag.replace(/\s+/g, " ").trim().slice(0, MAX_CONDITION_TAG) : "";
    return tag ? { if: kind, tag } : "bad";
  }
  return { if: kind };
}

/** A sequence's end as sent from the studio; null for none. */
export function readGoal(raw: unknown, known: (productId: string) => boolean): FlowGoal | null | "bad" {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw !== "object") return "bad";
  const value = raw as Record<string, unknown>;
  if (value.any === true) return { any: true };
  const productId = typeof value.productId === "string" ? value.productId : "";
  return productId && known(productId) ? { productId } : "bad";
}

/**
 * Whether a sequence's end cannot work with what starts it: it would end
 * before its first email. One that starts with a purchase, or with getting a
 * product sold for money (`startsPaid`), cannot end at "has bought anything",
 * nor one about a product at getting that same product.
 */
export function goalClash(trigger: "joined" | "product" | "bought" | "tagged" | "finished", productId: string | null, goal: FlowGoal | null, startsPaid: boolean): boolean {
  if (!goal) return false;
  // Somebody who finishes a course already has it: "finished" ends where "product" would.
  const aboutProduct = trigger === "product" || trigger === "finished";
  if ("any" in goal) return trigger === "bought" || (aboutProduct && startsPaid);
  return aboutProduct && goal.productId === productId;
}

/**
 * A step that does something instead of sending an email (added 12 October
 * 2026): gives somebody a label, takes one off, or starts them on another
 * sequence. With a condition before it, this is how a creator writes "if they
 * used the link, mark them as interested and start the offer sequence" —
 * what ClickFunnels and Kit sell as automations, in the sequences a creator
 * already has.
 *
 * Nothing here can loop: each person goes through a sequence once, so a label
 * that starts a sequence, or a sequence that starts another, runs at most
 * once for them.
 */
export type FlowAction = { do: "tag" | "untag"; tag: string } | { do: "start"; flowId: string };

/** An action as sent from the studio, cleaned; null for an email. `isFlow` says whether a sequence is the store's. */
export function readAction(raw: unknown, isFlow: (flowId: string) => boolean): FlowAction | null | "bad" {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw !== "object") return "bad";
  const value = raw as Record<string, unknown>;
  if (value.do === "tag" || value.do === "untag") {
    const tag = cleanTag(value.tag);
    return tag ? { do: value.do, tag } : "bad";
  }
  if (value.do === "start") {
    const flowId = typeof value.flowId === "string" ? value.flowId : "";
    return flowId && isFlow(flowId) ? { do: "start", flowId } : "bad";
  }
  return "bad";
}

/** A label as a condition, a trigger or an action names it. */
export function cleanTag(raw: unknown): string {
  return typeof raw === "string" ? raw.replace(/\s+/g, " ").trim().slice(0, MAX_CONDITION_TAG) : "";
}

/** Whether two labels are the same label: as a person reads them, not by case or spaces. */
export const sameLabel = (a: string, b: string) => sameTag(a, b);
