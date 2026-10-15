import { sameDraftAudience } from "@/lib/mail-draft-audience";
import { readNarrow, type Narrow } from "@/lib/segments-rules";
import { MAX_FLOW_WAIT_HOURS } from "@/lib/flow-rules";
export type MailAnswer = Record<string, unknown> & { ok?: boolean; error?: string };
/** A malformed response or failed HTTP request never confirms a mail operation. */
export function mailAnswer(responseOk: boolean, raw: unknown, sequenceWrite = false, draftWrite = false): MailAnswer {
  const unconfirmed: MailAnswer = { ok: false, error: sequenceWrite ? "flow_write_unconfirmed" : draftWrite ? "draft_write_unconfirmed" : "server_error" };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return unconfirmed;
  const answer = raw as Record<string, unknown>;
  if (responseOk && answer.ok === true) return answer as MailAnswer;
  if (answer.ok === false && typeof answer.error === "string") return answer as MailAnswer;
  return unconfirmed;
}

/** Only a confirmed numeric wait can be described as a kept-email result. */
export function keptWaitHours(answer: MailAnswer): number | null {
  const wait = answer.waitHours;
  return answer.ok === true && typeof wait === "number" && Number.isInteger(wait) && wait >= 0 && wait <= MAX_FLOW_WAIT_HOURS ? wait : null;
}

export type MailCopy = { subject: string; body: string; productId: string | null; who: "all" | "buyers" | "leads"; notProductId: string | null; narrow: Narrow | null };
/** A copy must retain its content and audience before replacing the composer. */
export function confirmedMailCopy(answer: MailAnswer): MailCopy | null {
  if (answer.ok !== true || !answer.copy || typeof answer.copy !== "object" || Array.isArray(answer.copy)) return null;
  const copy = answer.copy as Record<string, unknown>;
  if (typeof copy.subject !== "string" || typeof copy.body !== "string" || !(copy.productId === null || typeof copy.productId === "string") || (copy.who !== "all" && copy.who !== "buyers" && copy.who !== "leads")) return null;
  if (!(copy.notProductId === null || typeof copy.notProductId === "string" && copy.notProductId.length > 0)) return null;
  let narrow: Narrow | null = null;
  if (copy.narrow !== null) {
    if (!copy.narrow || typeof copy.narrow !== "object" || Array.isArray(copy.narrow)) return null;
    const raw = copy.narrow as Record<string, unknown>;
    narrow = readNarrow(raw);
    if (raw.minSpent !== narrow.minSpent || raw.channel !== narrow.channel || raw.quietDays !== narrow.quietDays) return null;
  }
  return { subject: copy.subject, body: copy.body, productId: copy.productId, who: copy.who as MailCopy["who"], notProductId: copy.notProductId, narrow };
}

/** Accept only a complete draft result belonging to the draft being edited. */
export function confirmedDraftId(answer: MailAnswer, expectedId = "", expectedAudience?: unknown): string | null {
  if (answer.ok !== true || !answer.draft || typeof answer.draft !== "object" || Array.isArray(answer.draft)) return null;
  const draft = answer.draft as Record<string, unknown>;
  if (typeof draft.id !== "string" || !/^[0-9a-f]{16}$/.test(draft.id) || (expectedId !== "" && draft.id !== expectedId)) return null;
  if (typeof draft.subject !== "string" || !draft.subject.trim() || typeof draft.body !== "string" || !draft.body.trim()) return null;
  if (!(draft.productId === null || (typeof draft.productId === "string" && draft.productId !== "")) || typeof draft.by !== "string" || !draft.by.trim() || typeof draft.savedAt !== "string" || !Number.isFinite(Date.parse(draft.savedAt))) return null;
  if (expectedAudience !== undefined && !sameDraftAudience(draft.audience, expectedAudience)) return null;
  return draft.id;
}

/** A recipient preview is known only with an explicit nonnegative whole count. */
export function confirmedRecipientCount(answer: MailAnswer): number | null {
  const count = answer.count;
  return answer.ok === true && typeof count === "number" && Number.isSafeInteger(count) && count >= 0 ? count : null;
}
