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
 * Read only from what the list has always kept about each person: what they
 * asked for or bought, how they first agreed, and the labels an import
 * brought (lib/contacts.ts). Never from what they opened or clicked: the
 * emails carry no tracking pixel and no link that says who used it
 * (lib/mail-links.ts; the privacy page says so), and a condition built on
 * clicks would need both.
 *
 * Browser-safe.
 */

export type StepIf = "has" | "lacks" | "buyer" | "lead" | "tag" | "untagged";
export const STEP_IFS: readonly StepIf[] = ["has", "lacks", "buyer", "lead", "tag", "untagged"];

export type StepCondition =
  | { if: "has" | "lacks"; productId: string }
  | { if: "buyer" | "lead" }
  | { if: "tag" | "untagged"; tag: string };

/** What happens to somebody a condition does not hold for. */
export type Otherwise = "skip" | "end";

/** When a sequence ends early: once they get one product, or buy anything. */
export type FlowGoal = { productId: string } | { any: true };

/** The longest label a condition can name; the same as an imported label's (lib/contacts.ts). */
export const MAX_CONDITION_TAG = 40;

/** What a condition is read against: one person, as the list keeps them. */
export type Person = { ids: readonly string[]; source: string; tags: readonly string[] };

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
export function readCondition(raw: unknown, known: (productId: string) => boolean): StepCondition | null | "bad" {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw !== "object") return "bad";
  const value = raw as Record<string, unknown>;
  const kind = STEP_IFS.find((k) => k === value.if);
  if (!kind) return "bad";
  if (kind === "has" || kind === "lacks") {
    const productId = typeof value.productId === "string" ? value.productId : "";
    return productId && known(productId) ? { if: kind, productId } : "bad";
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
export function goalClash(trigger: "joined" | "product" | "bought", productId: string | null, goal: FlowGoal | null, startsPaid: boolean): boolean {
  if (!goal) return false;
  if ("any" in goal) return trigger === "bought" || (trigger === "product" && startsPaid);
  return trigger === "product" && goal.productId === productId;
}
