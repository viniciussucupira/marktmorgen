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
import { type FormDef, type FormResponse, FORM_ID, KEPT_RESPONSES, MAX_FORMS, parseForm } from "@/lib/forms";

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

/** Saves a form. False when the store already has as many as it may and this one is new. */
export async function writeForm(statsId: string, form: FormDef): Promise<boolean> {
  const [exists, count] = await redisPipeline([
    ["HEXISTS", formsKey(statsId), form.id],
    ["HLEN", formsKey(statsId)],
  ]);
  if (Number(exists) !== 1 && Number(count) >= MAX_FORMS) return false;
  await redisPipeline([["HSET", formsKey(statsId), form.id, JSON.stringify(form)]]);
  return true;
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
    return { at: value.at, page: typeof value.page === "string" ? value.page : "", answers: value.answers, outcome: typeof value.outcome === "string" ? value.outcome : "", joined: value.joined === true };
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
