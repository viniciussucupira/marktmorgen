/**
 * A first product made inside Marktmorgen (490 [PP1], unit 1, added
 * 1 November 2026): the four formats, the questions asked as buttons, and
 * the outline each format starts from.
 *
 * The creator picks a format (a guide, a checklist, a workbook or a
 * template), answers at most five questions by tapping, and types what they
 * know about the subject. This file turns those answers into the outline:
 * the headings, and under each one what the creator is asked to write,
 * never anything written for them. On the Store plan, which has no AI
 * drafts, the outline is the product to fill in; on the other plans a later
 * unit has the AI draft each part from the creator's own words only, inside
 * the same outline.
 *
 * Nothing here is a fact about the creator's subject, a number, a study, a
 * testimonial or a promised result: the outline holds only the structure and
 * the creator's own words. Browser-safe: plain data and pure functions.
 */

export type FirstFormat = "guide" | "checklist" | "workbook" | "template";
export const FIRST_FORMATS: readonly FirstFormat[] = ["guide", "checklist", "workbook", "template"];

export type Choice = { id: string; label: string };
export type Question = { id: string; ask: string; choices: Choice[] };

export type FormatInfo = {
  name: string;
  /** What it is, in a sentence a first-time creator understands. */
  what: string;
  /** The label of the one free field: what the creator knows about the subject. */
  know: string;
  /** An example of an answer, shown inside the field so nobody faces a blank box. */
  example: string;
  questions: Question[];
};

const LENGTH = (unit: string, short: string, medium: string, long: string): Question => ({
  id: "length",
  ask: `How long should it be?`,
  choices: [
    { id: "short", label: `Short: ${short} ${unit}` },
    { id: "medium", label: `Medium: ${medium} ${unit}` },
    { id: "long", label: `Long: ${long} ${unit}` },
  ],
});

const READER: Question = {
  id: "reader",
  ask: "Who is it for?",
  choices: [
    { id: "new", label: "People just starting out" },
    { id: "some", label: "People with some experience" },
    { id: "pro", label: "People who do this for work" },
  ],
};

const TONE: Question = {
  id: "tone",
  ask: "How should it sound?",
  choices: [
    { id: "friendly", label: "Friendly and warm" },
    { id: "direct", label: "Short and direct" },
    { id: "formal", label: "Careful and formal" },
  ],
};

export const FORMAT_INFO: Readonly<Record<FirstFormat, FormatInfo>> = {
  guide: {
    name: "Guide",
    what: "A short book that walks the reader through something you know, step by step.",
    know: "What do you know about this, in your own words?",
    example: "I plan a week of family dinners every Sunday in two hours. I shop once, cook three bases and mix them into five meals.",
    questions: [
      READER,
      LENGTH("steps", "3", "5", "8"),
      TONE,
      {
        id: "ending",
        ask: "How should it end?",
        choices: [
          { id: "summary", label: "A one-page summary" },
          { id: "next", label: "What to do next" },
          { id: "none", label: "No ending page" },
        ],
      },
    ],
  },
  checklist: {
    name: "Checklist",
    what: "A list the reader ticks off, so nothing is forgotten.",
    know: "What has to be done, or checked, in your own words?",
    example: "Before a craft fair: pack the table cloth, price every item, charge the card reader, bring change and a sign.",
    questions: [
      READER,
      LENGTH("items", "10", "20", "40"),
      {
        id: "groups",
        ask: "Should the items be in groups?",
        choices: [
          { id: "one", label: "One list" },
          { id: "stages", label: "Grouped by stage: before, during, after" },
          { id: "topics", label: "Grouped by topic" },
        ],
      },
    ],
  },
  workbook: {
    name: "Workbook",
    what: "Exercises the reader does on the page, with room to write their answers.",
    know: "What should the reader practice or think through, in your own words?",
    example: "Finding your first ten clients: who you help, where they are, what you say in your first message.",
    questions: [
      READER,
      LENGTH("exercises", "3", "6", "10"),
      TONE,
      {
        id: "answers",
        ask: "Room for the reader's answers?",
        choices: [
          { id: "lines", label: "Lines to write on" },
          { id: "boxes", label: "Boxes to fill in" },
          { id: "both", label: "Both" },
        ],
      },
    ],
  },
  template: {
    name: "Template",
    what: "A ready page the reader copies and fills in with their own details.",
    know: "What is the template for, and what goes in it, in your own words?",
    example: "A one-page wedding budget: venue, food, music, flowers, clothes, and a total at the bottom.",
    questions: [
      {
        id: "use",
        ask: "How will people use it?",
        choices: [
          { id: "print", label: "Print it and fill it in by hand" },
          { id: "type", label: "Fill it in on a computer" },
          { id: "both", label: "Either" },
        ],
      },
      LENGTH("sections", "3", "5", "8"),
      READER,
    ],
  },
};

/** At most five questions, all by buttons (the item's own limit). */
export const MAX_QUESTIONS = 5;

export type Answers = Partial<Record<string, string>>;

/** The answer to each question, or its first choice where none was tapped: never an answer the creator did not see. */
export function answered(format: FirstFormat, answers: Answers): Record<string, string> {
  const out: Record<string, string> = {};
  for (const question of FORMAT_INFO[format].questions) {
    const given = answers[question.id];
    out[question.id] = question.choices.some((choice) => choice.id === given) ? (given as string) : question.choices[0].id;
  }
  return out;
}

/** How many parts each length makes: the numbers in the length buttons' own labels. */
const PARTS: Record<FirstFormat, Record<string, number>> = {
  guide: { short: 3, medium: 5, long: 8 },
  checklist: { short: 10, medium: 20, long: 40 },
  workbook: { short: 3, medium: 6, long: 10 },
  template: { short: 3, medium: 5, long: 8 },
};

/** One part of the outline: a heading, and what the creator writes under it. */
export type Part = { heading: string; ask: string; kind: "text" | "item" | "exercise" | "field" };
export type Outline = { format: FirstFormat; title: string; parts: Part[] };

const GROUPS: Record<string, string[]> = { stages: ["Before", "During", "After"], topics: ["First topic", "Second topic", "Third topic"] };

/**
 * The outline for a format and its answers. `title` is the creator's own,
 * or a plain placeholder they are asked to replace; it is never made up from
 * their subject.
 */
export function outlineFor(format: FirstFormat, answers: Answers, title = ""): Outline {
  const a = answered(format, answers);
  const count = PARTS[format][a.length] ?? PARTS[format].short;
  const named = title.trim().slice(0, 120) || `Your ${FORMAT_INFO[format].name.toLowerCase()}'s title`;
  const parts: Part[] = [];
  if (format === "guide") {
    parts.push({ heading: "Who this is for", ask: "Say who this guide helps and what they will be able to do after reading it.", kind: "text" });
    for (let i = 1; i <= count; i += 1) parts.push({ heading: `Step ${i}`, ask: "Name the step, then say what to do and why, in your own words.", kind: "text" });
    if (a.ending === "summary") parts.push({ heading: "Summary", ask: "The steps again, one line each.", kind: "text" });
    if (a.ending === "next") parts.push({ heading: "What to do next", ask: "One thing the reader can do today.", kind: "text" });
  } else if (format === "checklist") {
    const groups = GROUPS[a.groups] ?? [""];
    const per = Math.ceil(count / groups.length);
    let made = 0;
    for (const group of groups) {
      for (let i = 1; i <= per && made < count; i += 1, made += 1) {
        parts.push({ heading: group ? `${group}: item ${i}` : `Item ${made + 1}`, ask: "One thing to do or check, starting with a verb.", kind: "item" });
      }
    }
  } else if (format === "workbook") {
    parts.push({ heading: "How to use this workbook", ask: "Say how long each exercise takes and what the reader needs.", kind: "text" });
    for (let i = 1; i <= count; i += 1) parts.push({ heading: `Exercise ${i}`, ask: "The question or task, then room for the reader's answer.", kind: "exercise" });
  } else {
    parts.push({ heading: "How to fill this in", ask: "One or two sentences on how to use the template.", kind: "text" });
    for (let i = 1; i <= count; i += 1) parts.push({ heading: `Section ${i}`, ask: "Name the section and the lines that go in it.", kind: "field" });
  }
  return { format, title: named, parts };
}

/** The range the price is suggested in; the creator decides and may set any price their plan allows. */
const SUGGESTED_FROM_CENTS = 400;
const SUGGESTED_TO_CENTS = 3500;
const STARTING_POINT_CENTS: Record<string, number> = { short: 900, medium: 1900, long: 2900 };

/**
 * A starting price inside the suggested range, by length only. It is a
 * starting point the creator is asked to change, not a market price: no
 * figure about other sellers stands behind it.
 */
export function startingPrice(format: FirstFormat, answers: Answers): { cents: number; from: number; to: number } {
  const cents = STARTING_POINT_CENTS[answered(format, answers).length] ?? STARTING_POINT_CENTS.short;
  return { cents: Math.min(SUGGESTED_TO_CENTS, Math.max(SUGGESTED_FROM_CENTS, cents)), from: SUGGESTED_FROM_CENTS, to: SUGGESTED_TO_CENTS };
}
