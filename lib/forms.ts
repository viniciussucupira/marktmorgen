/**
 * Forms, surveys and quizzes (added 13 October 2026): questions a creator
 * asks on one of their own pages, and the answers kept for them.
 *
 * ClickFunnels sells a form or a survey as a step of a funnel, and an
 * application before a call is one of its funnel types. Here a form is made
 * once in the studio (/studio/forms) and placed on any of the store's own
 * pages with a "Form" block, so a page that is a step of a funnel asks its
 * questions there and, once they are answered, leads on to the next step.
 *
 * A quiz is a form with results: each answer to a choice may point at one of
 * the results, and the result the most answers point at is shown, with a
 * product of the creator's when they chose one for it. That is a sum anyone
 * could check by hand, written down here; nothing scores a person in secret.
 *
 * What it never does:
 *
 *   - Put anybody on the creator's list for answering. A form may offer a box
 *     to hear from the creator, empty until it is checked, and checking it
 *     sends the same email the store's sign-up box sends (lib/store-join.ts):
 *     the address joins only once its owner presses the button in it.
 *   - Ask for a card number, a password or anything of the kind: there is no
 *     field for it, and the help says not to ask.
 *   - Keep more than it has to: the answers, when, and which page they came
 *     from. Not the connection they came from.
 *
 * Pure and browser-safe: the studio's editor, the block that draws a form and
 * the route that takes the answers all read these rules.
 */

export const MAX_FORMS = 20;
export const MAX_FIELDS = 12;
export const MAX_OPTIONS = 8;
export const MAX_OUTCOMES = 6;
export const MAX_FORM_NAME = 60;
export const MAX_LABEL = 160;
export const MAX_OPTION = 80;
export const MAX_BUTTON = 40;
export const MAX_DONE_HEADING = 90;
export const MAX_DONE_BODY = 600;
export const MAX_OUTCOME_TITLE = 90;
export const MAX_OUTCOME_BODY = 600;
/** The most a person may type into one answer. */
export const MAX_SHORT_ANSWER = 200;
export const MAX_LONG_ANSWER = 2_000;
/** The answers kept for each form: the newest, as many as fill a spreadsheet a person reads. */
export const KEPT_RESPONSES = 2_000;

export const FORM_ID = /^[a-z0-9]{10}$/;
const PIECE_ID = /^[a-z0-9]{6}$/;
const PRODUCT_ID = /^[a-z0-9]{6,40}$/;

export type FieldType = "short" | "long" | "email" | "choice" | "choices" | "scale";

export const FIELD_TYPES: { type: FieldType; label: string; hint: string }[] = [
  { type: "short", label: "Short answer", hint: "One line: a name, a website, a number." },
  { type: "long", label: "Long answer", hint: "A few paragraphs: what they want, where they are stuck." },
  { type: "email", label: "Email address", hint: "Checked as an address. Needed to offer them your list." },
  { type: "choice", label: "One choice", hint: `Up to ${MAX_OPTIONS} options; they pick one. In a quiz, each option can point at a result.` },
  { type: "choices", label: "Several choices", hint: `Up to ${MAX_OPTIONS} options; they pick any.` },
  { type: "scale", label: "Scale of 1 to 10", hint: "A number from 1 to 10." },
];

export type FormOption = { id: string; label: string; /** In a quiz: the result this answer points at, or "". */ outcome: string };

export type FormField = { id: string; type: FieldType; label: string; required: boolean; options: FormOption[] };

export type FormOutcome = { id: string; title: string; body: string; /** A product of the store's to suggest, or "". */ product: string };

export type FormDef = {
  id: string;
  /** What the creator calls it in the studio. Never shown to a visitor. */
  name: string;
  fields: FormField[];
  /** The button's words; empty for the store's language's own. */
  button: string;
  /** What a person reads once they have sent it, when there is no result to show and no next step. */
  doneHeading: string;
  doneBody: string;
  /** Results, for a quiz. Empty for a form or a survey. */
  outcomes: FormOutcome[];
  /** Whether it offers a box to hear from the creator by email: needs an email field. */
  offerList: boolean;
  /** When it was last changed, in seconds. */
  updatedAt: number;
};

const oneLine = (value: unknown, max: number) =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";

/** Paragraphs: line breaks kept, nothing else that is not text. */
const paragraphs = (value: unknown, max: number) =>
  typeof value === "string"
    ? value
        .replace(/\r\n?/g, "\n")
        .replace(/[\u0000-\u0009\u000b-\u001f\u007f\u2028\u2029]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, max)
    : "";

/** A new id for a form (ten letters and digits) or one of its pieces (six). */
export function newFormId(length = 10, random: (n: number) => number = (n) => Math.floor(Math.random() * n)): string {
  const letters = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => letters[random(letters.length)]).join("");
}

const isType = (value: unknown): value is FieldType => FIELD_TYPES.some((t) => t.type === value);
const hasOptions = (type: FieldType) => type === "choice" || type === "choices";

/**
 * A form as stored or as the studio sends it, made safe: known field types,
 * each piece with an id of its own, options only where they mean something,
 * results pointed at only when they exist, a product only by its id (the
 * route checks it is the store's). Null when nothing usable is left.
 */
export function parseForm(raw: unknown): FormDef | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const id = typeof value.id === "string" && FORM_ID.test(value.id) ? value.id : "";
  const name = oneLine(value.name, MAX_FORM_NAME);
  if (!id || !name) return null;

  const outcomes: FormOutcome[] = [];
  for (const entry of Array.isArray(value.outcomes) ? value.outcomes : []) {
    if (outcomes.length >= MAX_OUTCOMES || !entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const oid = typeof row.id === "string" && PIECE_ID.test(row.id) ? row.id : "";
    const title = oneLine(row.title, MAX_OUTCOME_TITLE);
    if (!oid || !title || outcomes.some((o) => o.id === oid)) continue;
    outcomes.push({ id: oid, title, body: paragraphs(row.body, MAX_OUTCOME_BODY), product: typeof row.product === "string" && PRODUCT_ID.test(row.product) ? row.product : "" });
  }
  const results = new Set(outcomes.map((o) => o.id));

  const fields: FormField[] = [];
  const ids = new Set<string>();
  for (const entry of Array.isArray(value.fields) ? value.fields : []) {
    if (fields.length >= MAX_FIELDS || !entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const fid = typeof row.id === "string" && PIECE_ID.test(row.id) ? row.id : "";
    const label = oneLine(row.label, MAX_LABEL);
    if (!fid || !label || !isType(row.type) || ids.has(fid)) continue;
    const options: FormOption[] = [];
    if (hasOptions(row.type)) {
      for (const item of Array.isArray(row.options) ? row.options : []) {
        if (options.length >= MAX_OPTIONS || !item || typeof item !== "object") continue;
        const opt = item as Record<string, unknown>;
        const pid = typeof opt.id === "string" && PIECE_ID.test(opt.id) ? opt.id : "";
        const text = oneLine(opt.label, MAX_OPTION);
        if (!pid || !text || options.some((o) => o.id === pid) || ids.has(pid)) continue;
        options.push({ id: pid, label: text, outcome: typeof opt.outcome === "string" && results.has(opt.outcome) ? opt.outcome : "" });
      }
      // A choice with fewer than two options is not a choice.
      if (options.length < 2) continue;
    }
    ids.add(fid);
    for (const o of options) ids.add(o.id);
    fields.push({ id: fid, type: row.type, label, required: row.required === true, options });
  }
  if (!fields.length) return null;

  const offerList = value.offerList === true && fields.some((f) => f.type === "email");
  const updatedAt = typeof value.updatedAt === "number" && Number.isInteger(value.updatedAt) && value.updatedAt > 0 ? value.updatedAt : 0;
  return {
    id,
    name,
    fields,
    button: oneLine(value.button, MAX_BUTTON),
    doneHeading: oneLine(value.doneHeading, MAX_DONE_HEADING),
    doneBody: paragraphs(value.doneBody, MAX_DONE_BODY),
    outcomes,
    offerList,
    updatedAt,
  };
}

/** One person's answers: by field id, a line of text, the chosen options' ids, or a number. */
export type Answers = Record<string, string | string[] | number>;

export type ReadAnswers =
  | { ok: true; answers: Answers; email: string }
  | { ok: false; error: "required" | "email" | "invalid"; field: string };

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

/**
 * What a person sent, read against the form as it is now: an answer for a
 * field the form does not have is left out, an option it does not offer is
 * refused, and every required field has to have something in it. `get`
 * returns every value sent under a name (a form's own way of sending several
 * choices).
 */
export function readAnswers(form: FormDef, get: (name: string) => string[]): ReadAnswers {
  const answers: Answers = {};
  let email = "";
  for (const field of form.fields) {
    const sent = get(`q_${field.id}`).map((v) => v.trim()).filter(Boolean);
    if (!sent.length) {
      if (field.required) return { ok: false, error: "required", field: field.id };
      continue;
    }
    switch (field.type) {
      case "short":
      case "long": {
        const text = field.type === "short" ? oneLine(sent[0], MAX_SHORT_ANSWER) : paragraphs(sent[0], MAX_LONG_ANSWER);
        if (text) answers[field.id] = text;
        else if (field.required) return { ok: false, error: "required", field: field.id };
        break;
      }
      case "email": {
        const text = sent[0].toLowerCase().slice(0, 254);
        if (!EMAIL.test(text)) return { ok: false, error: "email", field: field.id };
        answers[field.id] = text;
        if (!email) email = text;
        break;
      }
      case "choice": {
        if (!field.options.some((o) => o.id === sent[0])) return { ok: false, error: "invalid", field: field.id };
        answers[field.id] = sent[0];
        break;
      }
      case "choices": {
        const picked = [...new Set(sent)];
        if (picked.some((id) => !field.options.some((o) => o.id === id))) return { ok: false, error: "invalid", field: field.id };
        answers[field.id] = field.options.filter((o) => picked.includes(o.id)).map((o) => o.id);
        break;
      }
      case "scale": {
        const n = Number(sent[0]);
        if (!Number.isInteger(n) || n < 1 || n > 10) return { ok: false, error: "invalid", field: field.id };
        answers[field.id] = n;
        break;
      }
    }
  }
  return { ok: true, answers, email };
}

/**
 * A quiz's result: the one the most chosen answers point at, the first of
 * them in the creator's order on a tie. Null for a form with no results, or
 * when no answer pointed anywhere.
 */
export function outcomeOf(form: FormDef, answers: Answers): FormOutcome | null {
  if (!form.outcomes.length) return null;
  const votes = new Map<string, number>();
  for (const field of form.fields) {
    const given = answers[field.id];
    const picked = typeof given === "string" ? [given] : Array.isArray(given) ? given : [];
    for (const id of picked) {
      const outcome = field.options.find((o) => o.id === id)?.outcome;
      if (outcome) votes.set(outcome, (votes.get(outcome) ?? 0) + 1);
    }
  }
  let best: FormOutcome | null = null;
  let most = 0;
  for (const outcome of form.outcomes) {
    const n = votes.get(outcome.id) ?? 0;
    if (n > most) {
      best = outcome;
      most = n;
    }
  }
  return best;
}

/** An answer as a person reads it in the studio or a spreadsheet: the options' words, not their ids. */
export function answerText(field: FormField, given: Answers[string] | undefined): string {
  if (given === undefined) return "";
  if (typeof given === "number") return String(given);
  if (Array.isArray(given)) return given.map((id) => field.options.find((o) => o.id === id)?.label ?? "").filter(Boolean).join("; ");
  if (hasOptions(field.type)) return field.options.find((o) => o.id === given)?.label ?? "";
  return given;
}

/** A spreadsheet cell that cannot be read as a formula. */
export function safeCell(text: string): string {
  const cell = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

/** One kept response. */
export type FormResponse = { at: number; page: string; answers: Answers; outcome: string; joined: boolean };

/** The responses as a spreadsheet: when, each question, the result, and whether they asked to hear from the creator. */
export function responsesCsv(form: FormDef, responses: FormResponse[]): string {
  const head = ["Sent", ...form.fields.map((f) => f.label), ...(form.outcomes.length ? ["Result"] : []), ...(form.offerList ? ["Asked to hear from you"] : [])];
  const rows = responses.map((r) => [
    new Date(r.at * 1000).toISOString(),
    ...form.fields.map((f) => answerText(f, r.answers[f.id])),
    ...(form.outcomes.length ? [form.outcomes.find((o) => o.id === r.outcome)?.title ?? ""] : []),
    ...(form.offerList ? [r.joined ? "Yes, once they confirm by email" : "No"] : []),
  ]);
  return [head, ...rows].map((row) => row.map(safeCell).join(",")).join("\r\n") + "\r\n";
}
