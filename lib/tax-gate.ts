/**
 * Which tax reading decides whether Marktmorgen may sell, and how a tax doubt
 * is closed (owner, 18 October 2026; docs/tax-uncertainty.md and
 * docs/tax-consultations.md).
 *
 * Since 18 October 2026 the owner uses no accountant. A doubt is closed only
 * by an official text, or by an answer to a consultation (Receita Federal
 * under IN RFB 2.058/2021, or the Prefeitura de Fortaleza for ISS) recorded
 * with its date and source in CONSULTATION_ANSWERS below; otherwise it stays
 * at the reading with more tax (rule 19). The confirmation flag of the
 * earlier rule is gone, and tests/tax-gate.test.ts fails if it comes back.
 *
 * The readings themselves are the receiving model's (lib/receiving-costs.ts);
 * this file only says which one is the gate. Nothing here opens a sale: the
 * release gate is lib/opening.ts, which also needs the per-customer margin
 * review (lib/commercial-margin.ts) and the deemed-supplier records
 * (lib/deemed-supplier.ts). This is the same arrangement as Hazelsong's
 * lib/owner-margin.ts (gateReading, EU_HOSTING_CONFIRMED, CONSULTATION_ANSWERS).
 */
import { EU_HOSTING_READING, MOST_TAX_READING, type Reading } from "@/lib/receiving-costs";

/**
 * EU hosting (the owner's decision B, 18 October 2026): every server and
 * store of BOTH products in EU regions, paid by the LLC from its own account,
 * so the LLC has no US place of business and no US-source income
 * (docs/tax-uncertainty.md questions 1, 4 and 22). One LLC runs both
 * products, so this is set to true only when Marktmorgen's and Hazelsong's
 * hosting are both live in EU regions and verified. Until then it stays
 * false, and gateProblems() refuses the after-design reading.
 */
export const EU_HOSTING_CONFIRMED = false;

export type GateReadingId = "most-tax" | "most-tax-after-design";

/**
 * The reading sales are gated on: "most-tax" (every tax stacked,
 * MOST_TAX_READING) while EU hosting is not live; "most-tax-after-design"
 * (EU_HOSTING_READING) only once EU_HOSTING_CONFIRMED is true. Either way
 * MR27Oct requires positive unit net with unchanged spend-floor room under it
 * (tests/tax-gate.test.ts).
 */
export const GATE_READING_ID: GateReadingId = "most-tax";

/** Why a gate setting is not allowed: empty when it is. */
export function gateProblems(id: GateReadingId, euHostingConfirmed: boolean): string[] {
  const out: string[] = [];
  if (id !== "most-tax" && id !== "most-tax-after-design") out.push(`unknown gate reading ${String(id)}`);
  if (id === "most-tax-after-design" && euHostingConfirmed !== true) {
    out.push("the after-design reading needs EU hosting live for both products: EU_HOSTING_CONFIRMED is false");
  }
  return out;
}

/** The reading sales are gated on. */
export function gateReading(): Reading {
  return GATE_READING_ID === "most-tax-after-design" ? EU_HOSTING_READING : MOST_TAX_READING;
}

/** The authorities whose answer can close a doubt (docs/tax-consultations.md). */
export const CONSULTATION_AUTHORITIES = ["Receita Federal", "Prefeitura de Fortaleza"] as const;
/** The highest question number in docs/tax-uncertainty.md. */
export const TAX_QUESTIONS = 27;

/**
 * A doubt closed by an answer to a consultation, recorded with its date and
 * source. Recording one means changing the reading it closes, then
 * recomputing; none is recorded yet. The same answer goes into Hazelsong's
 * CONSULTATION_ANSWERS: the consultations are the LLC's and the owner's.
 */
export type ConsultationAnswer = {
  /** The question of docs/tax-uncertainty.md it closes, 1 to TAX_QUESTIONS. */
  question: number;
  authority: (typeof CONSULTATION_AUTHORITIES)[number];
  /** The day of the answer, YYYY-MM-DD. */
  date: string;
  /** Its number or protocol and where it can be read. */
  source: string;
  /** The reading it closes, in words. */
  reading: string;
};
export const CONSULTATION_ANSWERS: readonly ConsultationAnswer[] = [];

const DAY = /^\d{4}-\d{2}-\d{2}$/;
function calendarDay(value: unknown): boolean {
  if (typeof value !== "string" || !DAY.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** What is wrong with the recorded answers: empty when every one is complete. */
export function consultationProblems(answers: readonly ConsultationAnswer[] = CONSULTATION_ANSWERS): string[] {
  const out: string[] = [];
  answers.forEach((answer, i) => {
    const at = `consultation answer ${i + 1}`;
    if (!Number.isInteger(answer?.question) || answer.question < 1 || answer.question > TAX_QUESTIONS) out.push(`${at}: question`);
    if (!(CONSULTATION_AUTHORITIES as readonly string[]).includes(answer?.authority)) out.push(`${at}: authority`);
    if (!calendarDay(answer?.date)) out.push(`${at}: date`);
    for (const key of ["source", "reading"] as const) if (typeof answer?.[key] !== "string" || !answer[key].trim()) out.push(`${at}: ${key}`);
  });
  return out;
}

/** Whether the gate's own setting is one sales may be judged on. Not permission to sell. */
export function taxGateValid(): boolean {
  return gateProblems(GATE_READING_ID, EU_HOSTING_CONFIRMED).length === 0 && consultationProblems().length === 0;
}
