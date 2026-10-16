export type CrmAnswer = { ok: true } | { ok: false; error: string };
const REFUSALS = new Set(["title", "followup", "date", "assignee", "stage", "full", "unknown", "fields", "stages", "value", "invalid", "role", "origin", "signed_out", "locked", "store_gone", "none", "unavailable", "bad_request", "forbidden", "crm_deal_read_unavailable"]);
/** Transport or ambiguous replies cannot prove that a CRM write did not happen. */
export function crmAnswer(responseOk: boolean, raw: unknown): CrmAnswer {
  const uncertain: CrmAnswer = { ok: false, error: "crm_write_unconfirmed" };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return uncertain;
  const answer = raw as Record<string, unknown>;
  if (!Object.hasOwn(answer, "ok")) return uncertain;
  if (responseOk && answer.ok === true && !Object.hasOwn(answer, "error")) return { ok: true };
  if (answer.ok === false && typeof answer.error === "string" && REFUSALS.has(answer.error) && !["deal", "stages", "fields"].some(key => Object.hasOwn(answer, key))) return { ok: false, error: answer.error };
  return uncertain;
}
