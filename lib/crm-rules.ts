/**
 * Fields of a store's own about each person, and its deals (added 13 October
 * 2026): the two parts of a CRM a creator who sells calls, coaching or
 * services asks for, and the two ClickFunnels sells as contact attributes and
 * opportunities.
 *
 *   - A field is a question the creator keeps the answer to for each person:
 *     their company, their time zone, the date of a first call, which offer
 *     interests them. Up to MAX_CRM_FIELDS, each text, a number, a date or one
 *     of a few choices. Filled in on the person's page in the studio, and
 *     written into the file of the list as columns of their own.
 *   - A deal is somebody the creator is talking to about a sale that does not
 *     happen at a checkout (a coaching package, a custom project), with what
 *     it is worth and the stage it has reached. The stages are the creator's,
 *     each open, won or lost, and the board adds up each.
 *
 * Nothing here is read by anybody but the store's own team, and nothing here
 * sends anything to anybody: a deal is a note that adds up, never a message.
 *
 * Pure and browser-safe: the studio and the routes read these rules.
 */

export const MAX_CRM_FIELDS = 10;
export const MAX_FIELD_NAME = 40;
export const MAX_FIELD_OPTIONS = 10;
export const MAX_FIELD_OPTION = 40;
export const MAX_FIELD_VALUE = 200;

export const MAX_STAGES = 8;
export const MAX_STAGE_NAME = 30;
export const MAX_DEALS = 1_000;
export const MAX_DEAL_TITLE = 90;
export const MAX_DEAL_NOTE = 500;
/** A deal's worth, in cents: up to a hundred million in the store's currency. */
export const MAX_DEAL_CENTS = 10_000_000_000;

export const CRM_ID = /^[a-z0-9]{6}$/;
export const DEAL_ID = /^[a-z0-9]{10}$/;

export type FieldType = "text" | "number" | "date" | "choice";
export const FIELD_TYPES: { type: FieldType; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "number", label: "Number" },
  { type: "date", label: "Date" },
  { type: "choice", label: "One of a few choices" },
];

export type CrmField = { id: string; name: string; type: FieldType; options: string[] };

export type StageKind = "open" | "won" | "lost";
export type Stage = { id: string; name: string; kind: StageKind };

export type Deal = {
  /** Server-owned identity for a conversion from a retained form response. */
  formResponseRef?: string;
  id: string;
  title: string;
  /** Who it is with, when the creator says; "" for nobody named yet. */
  email: string;
  /** What it is worth, in cents of the store's currency. */
  cents: number;
  stage: string;
  note: string;
  /** Next action, date and responsible teammate; optional for older records. */
  nextAction?: string;
  dueDate?: string;
  assignee?: string;
  createdAt: number;
  updatedAt: number;
};

/** The stages a store starts with: the usual road from a first word to a yes or a no. */
export const DEFAULT_STAGES: Stage[] = [
  { id: "lead00", name: "New", kind: "open" },
  { id: "talk00", name: "Talking", kind: "open" },
  { id: "offr00", name: "Offer sent", kind: "open" },
  { id: "won000", name: "Won", kind: "won" },
  { id: "lost00", name: "Lost", kind: "lost" },
];

const oneLine = (value: unknown, max: number) =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";

/** A new id: six letters and digits for a field or a stage, ten for a deal. */
export function newCrmId(length = 6, random: (n: number) => number = (n) => Math.floor(Math.random() * n)): string {
  const letters = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => letters[random(letters.length)]).join("");
}

/** A store's fields as stored or sent, made safe: each with a name, once, a choice with two options at least. */
export function parseFields(raw: unknown): CrmField[] {
  const out: CrmField[] = [];
  for (const entry of Array.isArray(raw) ? raw : []) {
    if (out.length >= MAX_CRM_FIELDS || !entry || typeof entry !== "object") continue;
    const value = entry as Record<string, unknown>;
    const id = typeof value.id === "string" && CRM_ID.test(value.id) ? value.id : "";
    const name = oneLine(value.name, MAX_FIELD_NAME);
    const type = FIELD_TYPES.find((t) => t.type === value.type)?.type;
    if (!id || !name || !type || out.some((f) => f.id === id || f.name.toLowerCase() === name.toLowerCase())) continue;
    const options =
      type === "choice"
        ? [...new Set((Array.isArray(value.options) ? value.options : []).map((o) => oneLine(o, MAX_FIELD_OPTION)).filter(Boolean))].slice(0, MAX_FIELD_OPTIONS)
        : [];
    if (type === "choice" && options.length < 2) continue;
    out.push({ id, name, type, options });
  }
  return out;
}

/** A value for a field as typed, made what the field keeps; "" clears it, null when it cannot be one. */
export function fieldValue(field: CrmField, raw: unknown): string | null {
  const text = oneLine(raw, MAX_FIELD_VALUE);
  if (!text) return "";
  switch (field.type) {
    case "text":
      return text;
    case "number": {
      const n = Number(text.replace(/,/g, ""));
      return Number.isFinite(n) && Math.abs(n) < 1e15 ? String(n) : null;
    }
    case "date":
      return validCrmDate(text) ? text : null;
    case "choice":
      return field.options.includes(text) ? text : null;
  }
}

/** A store's stages as stored or sent: each named, once, at least one open, one won and one lost. */
export function parseStages(raw: unknown): Stage[] | null {
  const out: Stage[] = [];
  for (const entry of Array.isArray(raw) ? raw : []) {
    if (out.length >= MAX_STAGES || !entry || typeof entry !== "object") continue;
    const value = entry as Record<string, unknown>;
    const id = typeof value.id === "string" && CRM_ID.test(value.id) ? value.id : "";
    const name = oneLine(value.name, MAX_STAGE_NAME);
    const kind: StageKind | null = value.kind === "open" || value.kind === "won" || value.kind === "lost" ? value.kind : null;
    if (!id || !name || !kind || out.some((s) => s.id === id)) continue;
    out.push({ id, name, kind });
  }
  const kinds = new Set(out.map((s) => s.kind));
  return kinds.has("open") && kinds.has("won") && kinds.has("lost") ? out : null;
}

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

/** A deal as sent or stored, made safe; null without a title or a stage the store has. */
export function parseDeal(raw: unknown, stages: readonly Stage[]): Deal | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const id = typeof value.id === "string" && DEAL_ID.test(value.id) ? value.id : "";
  const title = oneLine(value.title, MAX_DEAL_TITLE);
  const stage = typeof value.stage === "string" && stages.some((s) => s.id === value.stage) ? value.stage : "";
  if (!id || !title || !stage) return null;
  const email = oneLine(value.email, 254).toLowerCase();
  const cents = typeof value.cents === "number" && Number.isFinite(value.cents) ? Math.max(0, Math.min(MAX_DEAL_CENTS, Math.round(value.cents))) : 0;
  const note =
    typeof value.note === "string"
      ? value.note
          .replace(/\r\n?/g, "\n")
          .replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, " ")
          .trim()
          .slice(0, MAX_DEAL_NOTE)
      : "";
  const at = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v > 0 ? v : 0);
  const follow = readFollowUp(value);
  return { ...(typeof value.formResponseRef === "string" && /^[a-f0-9]{64}$/.test(value.formResponseRef) ? { formResponseRef: value.formResponseRef } : {}), id, title, email: EMAIL.test(email) ? email : "", cents, stage, note, ...(follow.ok ? follow.value : {}), createdAt: at(value.createdAt), updatedAt: at(value.updatedAt) };
}

/** Each stage's deals, how many and what they are worth, in the stages' order. */
export function boardTotals(stages: readonly Stage[], deals: readonly Deal[]): { stage: Stage; count: number; cents: number }[] {
  return stages.map((stage) => {
    const here = deals.filter((d) => d.stage === stage.id);
    return { stage, count: here.length, cents: here.reduce((sum, d) => sum + d.cents, 0) };
  });
}

/** Calendar dates are kept as dates, never shifted through a browser time zone. */
export function validCrmDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const at = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(at) && new Date(at).toISOString().slice(0, 10) === value;
}

export type FollowUp = { nextAction?: string; dueDate?: string; assignee?: string };

/** Missing fields preserve older data; explicit empty strings clear a field. */
export function readFollowUp(raw: Record<string, unknown>): { ok: true; value: FollowUp } | { ok: false; error: "followup" | "date" | "assignee" } {
  const out: FollowUp = {};
  if (raw.nextAction !== undefined) {
    if (typeof raw.nextAction !== "string" || raw.nextAction.length > 200) return { ok: false, error: "followup" };
    out.nextAction = oneLine(raw.nextAction, 200);
  }
  if (raw.dueDate !== undefined) {
    if (raw.dueDate !== "" && !validCrmDate(raw.dueDate)) return { ok: false, error: "date" };
    out.dueDate = raw.dueDate as string;
  }
  if (raw.assignee !== undefined) {
    if (typeof raw.assignee !== "string") return { ok: false, error: "assignee" };
    const email = raw.assignee.trim().toLowerCase();
    if (email && (email.length > 254 || !EMAIL.test(email))) return { ok: false, error: "assignee" };
    out.assignee = email;
  }
  if (out.dueDate && !out.nextAction) return { ok: false, error: "followup" };
  return { ok: true, value: out };
}

/** Open deals to act on, ordered by date then longest without a change. */
export function dealFollowUps(stages: readonly Stage[], deals: readonly Deal[], today: string): { overdue: Deal[]; today: Deal[]; upcoming: Deal[]; unplanned: Deal[] } {
  const open = new Set(stages.filter(s => s.kind === "open").map(s => s.id));
  const rows = deals.filter(d => open.has(d.stage)).slice().sort((a,b) => (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31") || a.updatedAt - b.updatedAt || a.id.localeCompare(b.id));
  return {
    overdue: rows.filter(d => d.nextAction && validCrmDate(d.dueDate) && d.dueDate < today),
    today: rows.filter(d => d.nextAction && d.dueDate === today),
    upcoming: rows.filter(d => d.nextAction && validCrmDate(d.dueDate) && d.dueDate > today),
    unplanned: rows.filter(d => !d.nextAction || !validCrmDate(d.dueDate)),
  };
}
