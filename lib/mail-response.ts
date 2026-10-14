export type MailAnswer = Record<string, unknown> & { ok?: boolean; error?: string };
/** A malformed response or failed HTTP request never confirms a mail operation. */
export function mailAnswer(responseOk: boolean, raw: unknown): MailAnswer {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "server_error" };
  const answer = raw as Record<string, unknown>;
  if (responseOk && answer.ok === true) return answer as MailAnswer;
  if (answer.ok === false && typeof answer.error === "string") return answer as MailAnswer;
  return { ok: false, error: "server_error" };
}
