export type AiAnswer = { ok: true; value: unknown; left: number } | { ok: false; error: string };
/** Only a complete successful HTTP response confirms a writing result and allowance. */
export function readAiAnswer(responseOk: boolean, raw: unknown): AiAnswer {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "unconfirmed" };
  const data = raw as Record<string, unknown>;
  if (responseOk && data.ok === true && data.value !== undefined && data.value !== null && typeof data.left === "number" && Number.isSafeInteger(data.left) && data.left >= 0) return { ok: true, value: data.value, left: data.left };
  if (data.ok === false && typeof data.error === "string") return { ok: false, error: data.error };
  return { ok: false, error: "unconfirmed" };
}
export function isAiEmailCopy(value: unknown): value is { subject: string; body: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const copy = value as Record<string, unknown>;
  return typeof copy.subject === "string" && copy.subject.trim().length > 0 && typeof copy.body === "string" && copy.body.trim().length > 0;
}
