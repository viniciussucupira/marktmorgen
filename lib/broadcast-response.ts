import type { MailAnswer } from "@/lib/mail-response";
import { readNarrow } from "@/lib/segments-rules";
const REFUSALS = new Set(["subject", "body", "when", "product", "empty", "allowance", "setup", "plan", "test_subject", "test_small", "test_links", "placeholder", "role", "locked", "store_gone", "none", "signed_out", "origin", "bad_request"]);
const positive = (n: unknown): n is number => typeof n === "number" && Number.isSafeInteger(n) && n > 0;
const association = (value: unknown) => typeof value === "string" && value ? value : null;
/** Confirm creation, not delivery. Unknown write outcomes must not invite an immediate retry. */
export function broadcastAnswer(responseOk: boolean, raw: unknown, input: Record<string, unknown>): MailAnswer {
  const unknown: MailAnswer = { ok: false, error: "broadcast_write_unconfirmed" };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return unknown;
  const answer = raw as MailAnswer;
  if (answer.ok === false && typeof answer.error === "string" && REFUSALS.has(answer.error) && !Object.hasOwn(answer, "broadcast")) return answer;
  if (!responseOk || answer.ok !== true || Object.hasOwn(answer, "error") || !answer.broadcast || typeof answer.broadcast !== "object" || Array.isArray(answer.broadcast)) return unknown;
  const b = answer.broadcast as Record<string, unknown>;
  if (typeof b.id !== "string" || !/^[0-9a-f]{24}$/.test(b.id) || b.status !== "scheduled" || !positive(b.createdAt) || !positive(b.sendAt) || b.sendAt < b.createdAt || !positive(b.total) || b.sent !== 0) return unknown;
  // Match the normalization performed by createBroadcast (MAX_SUBJECT / MAX_MAIL_BODY).
  const subject = typeof input.subject === "string" ? input.subject.replace(/\s+/g, " ").trim().slice(0, 150) : "";
  const body = typeof input.body === "string" ? input.body.replace(/\r\n?/g, "\n").trim().slice(0, 20_000) : "";
  if (!subject || !body || b.subject !== subject || b.body !== body || b.productId !== association(input.productId) || b.notProductId !== association(input.notProductId) || b.who !== input.who) return unknown;
  if (input.sendAt !== undefined && (typeof input.sendAt !== "number" || !Number.isFinite(input.sendAt) || b.sendAt !== Math.floor(input.sendAt / 1000))) return unknown;
  const narrow = readNarrow(input.narrow);
  if (narrow.minSpent || narrow.channel || narrow.quietDays) {
    if (!b.narrow || typeof b.narrow !== "object" || Array.isArray(b.narrow)) return unknown;
    const actual = b.narrow as Record<string, unknown>;
    if (actual.minSpent !== narrow.minSpent || actual.channel !== narrow.channel || actual.quietDays !== narrow.quietDays) return unknown;
  } else if (b.narrow !== null) return unknown;
  return answer;
}
