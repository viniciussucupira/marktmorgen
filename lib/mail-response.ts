import { MAX_FLOW_WAIT_HOURS } from "@/lib/flow-rules";
export type MailAnswer = Record<string, unknown> & { ok?: boolean; error?: string };
/** A malformed response or failed HTTP request never confirms a mail operation. */
export function mailAnswer(responseOk: boolean, raw: unknown, sequenceWrite = false): MailAnswer {
  const unconfirmed: MailAnswer = { ok: false, error: sequenceWrite ? "flow_write_unconfirmed" : "server_error" };
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

export type MailCopy = { subject: string; body: string; productId: string | null; who: "all" | "buyers" | "leads" };
/** A copy must retain its content and audience before replacing the composer. */
export function confirmedMailCopy(answer: MailAnswer): MailCopy | null {
  if (answer.ok !== true || !answer.copy || typeof answer.copy !== "object" || Array.isArray(answer.copy)) return null;
  const copy = answer.copy as Record<string, unknown>;
  if (typeof copy.subject !== "string" || typeof copy.body !== "string" || !(copy.productId === null || typeof copy.productId === "string") || (copy.who !== "all" && copy.who !== "buyers" && copy.who !== "leads")) return null;
  return { subject: copy.subject, body: copy.body, productId: copy.productId, who: copy.who as MailCopy["who"] };
}
