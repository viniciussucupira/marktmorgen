/**
 * Where a store's forms and their answers are kept (lib/forms.ts has the
 * rules).
 *
 *   nl:forms:<statsId>             hash  form id -> the form
 *   nl:form:r:<statsId>:<form id>  list  its responses, newest first, KEPT_RESPONSES at most
 *
 * Under the store's own stats id, so they move with the store, as its
 * affiliates and its pages do.
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { type FormDef, type FormResponse, FORM_RESPONSE_ID, FORM_ID, KEPT_RESPONSES, MAX_FORMS, parseForm } from "@/lib/forms";

const formsKey = (statsId: string) => `nl:forms:${statsId}`;
const responsesKey = (statsId: string, formId: string) => `nl:form:r:${statsId}:${formId}`;

/** Every form of a store, newest change first. */
export async function readForms(statsId: string | null): Promise<FormDef[]> {
  if (!statsId || !isRedisConfigured()) return [];
  const [raw] = await redisPipeline([["HVALS", formsKey(statsId)]]);
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((value) => {
      try {
        return parseForm(JSON.parse(String(value)));
      } catch {
        return null;
      }
    })
    .filter((f): f is FormDef => f !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** One form, or null. */
export async function readForm(statsId: string | null, id: string): Promise<FormDef | null> {
  if (!statsId || !FORM_ID.test(id) || !isRedisConfigured()) return null;
  const [raw] = await redisPipeline([["HGET", formsKey(statsId), id]]);
  if (typeof raw !== "string") return null;
  try {
    return parseForm(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Checks capacity before a multi-step setup; writeForm still checks concurrent changes. */
export async function canAddForms(statsId: string, amount: number): Promise<boolean> {
  if (!statsId || !isRedisConfigured() || !Number.isSafeInteger(amount) || amount < 0) throw new Error("Form capacity unavailable");
  const results = await redisPipeline([["HLEN", formsKey(statsId)]]);
  if (results.length !== 1) throw new Error("Form capacity unavailable");
  const raw = results[0];
  const count = typeof raw === "number" ? raw : typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isSafeInteger(count) || count < 0) throw new Error("Form capacity unavailable");
  return count + amount <= MAX_FORMS;
}

/** Capacity is shared by manual editing and guided setup in one Redis operation. */
export const SAVE_FORM = `-- marktmorgen:form-save:v1
if redis.call("HEXISTS", KEYS[1], ARGV[1]) == 0 and redis.call("HLEN", KEYS[1]) >= tonumber(ARGV[3]) then return 0 end
redis.call("HSET", KEYS[1], ARGV[1], ARGV[2])
return 1`;

/** Saves a form; existing forms remain editable at capacity. Unknown writes require review. */
export async function writeForm(statsId: string, form: FormDef): Promise<boolean> {
  const results = await redisPipeline([["EVAL", SAVE_FORM, 1, formsKey(statsId), form.id, JSON.stringify(form), MAX_FORMS]]);
  if (results.length !== 1 || (results[0] !== 0 && results[0] !== 1)) throw new Error("Form save could not be confirmed");
  return results[0] === 1;
}

/** Removes a form and every answer kept for it. */
export async function dropForm(statsId: string, id: string): Promise<boolean> {
  const [removed] = await redisPipeline([
    ["HDEL", formsKey(statsId), id],
    ["DEL", responsesKey(statsId, id)],
  ]);
  return Number(removed) === 1;
}

/** Keeps one response, the newest first, and lets the oldest go past KEPT_RESPONSES. */
export async function addResponse(statsId: string, formId: string, response: FormResponse): Promise<void> {
  await redisPipeline([
    ["LPUSH", responsesKey(statsId, formId), JSON.stringify(response)],
    ["LTRIM", responsesKey(statsId, formId), 0, KEPT_RESPONSES - 1],
  ]);
}

function parseResponse(raw: unknown): FormResponse | null {
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as Partial<FormResponse>;
    if (typeof value.at !== "number" || !value.answers || typeof value.answers !== "object") return null;
    return { ...(typeof value.id === "string" && FORM_RESPONSE_ID.test(value.id) ? { id: value.id } : {}), at: value.at, page: typeof value.page === "string" ? value.page : "", answers: value.answers, outcome: typeof value.outcome === "string" ? value.outcome : "", joined: value.joined === true };
  } catch {
    return null;
  }
}

/** A form's responses, newest first, and how many are kept in all. */
export async function readResponses(statsId: string | null, formId: string, limit = KEPT_RESPONSES): Promise<{ responses: FormResponse[]; total: number }> {
  if (!statsId || !FORM_ID.test(formId) || !isRedisConfigured()) return { responses: [], total: 0 };
  const [list, total] = await redisPipeline([
    ["LRANGE", responsesKey(statsId, formId), 0, Math.max(0, Math.min(limit, KEPT_RESPONSES) - 1)],
    ["LLEN", responsesKey(statsId, formId)],
  ]);
  return {
    responses: (Array.isArray(list) ? list : []).map(parseResponse).filter((r): r is FormResponse => r !== null),
    total: Number(total) || 0,
  };
}

/** How many responses each of these forms has kept. */
export async function responseCounts(statsId: string | null, ids: string[]): Promise<Record<string, number>> {
  if (!statsId || !ids.length || !isRedisConfigured()) return {};
  const counts = await redisPipeline(ids.map((id) => ["LLEN", responsesKey(statsId, id)]));
  return Object.fromEntries(ids.map((id, i) => [id, Number(counts[i]) || 0]));
}
