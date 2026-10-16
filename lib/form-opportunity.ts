import { createHash } from "node:crypto";
import type { FormResponse } from "@/lib/forms";
import { MAX_DEALS, parseDeal, type Deal, type Stage } from "@/lib/crm-rules";
import { redisPipeline } from "@/lib/redis";

export const MAX_CONVERTIBLE_FORM_RESPONSES = 50;

/** Legacy responses have no ID: equal content at the same second is one conversion identity. */
export function formOpportunityRef(statsId: string, formId: string, response: FormResponse): string {
  const answers = Object.entries(response.answers).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  return createHash("sha256").update(JSON.stringify([statsId, formId, response.at, response.page, answers, response.outcome, response.joined])).digest("hex");
}

/** One hash, one mutation: capacity and absence are checked in the same Redis operation. */
export const CREATE_FORM_OPPORTUNITY = `-- marktmorgen:form-opportunity:v1
local existing = redis.call("HGET", KEYS[1], ARGV[1])
if existing then return {0, existing} end
if redis.call("HLEN", KEYS[1]) >= tonumber(ARGV[3]) then return {-1, ""} end
redis.call("HSET", KEYS[1], ARGV[1], ARGV[2])
return {1, ARGV[2]}`;

export async function createFormOpportunity(statsId: string, ref: string, draft: Deal, stages: readonly Stage[]): Promise<{ state: "created" | "existing"; deal: Deal } | { state: "full" }> {
  if (!statsId || !/^[a-f0-9]{64}$/.test(ref)) throw new Error("Invalid form opportunity identity");
  const id = ref.slice(0, 10);
  const deal = { ...draft, id, formResponseRef: ref };
  const result = await redisPipeline([["EVAL", CREATE_FORM_OPPORTUNITY, 1, "nl:crm:deals:" + statsId, id, JSON.stringify(deal), MAX_DEALS]]);
  if (!Array.isArray(result) || result.length !== 1 || !Array.isArray(result[0]) || result[0].length !== 2) throw new Error("Form opportunity write unconfirmed");
  const [code, record] = result[0];
  if (code === -1 && record === "") return { state: "full" };
  if ((code !== 0 && code !== 1) || typeof record !== "string") throw new Error("Form opportunity write unconfirmed");
  const saved = parseDeal(JSON.parse(record), stages);
  if (!saved || saved.id !== id || saved.formResponseRef !== ref) throw new Error("Form opportunity identity conflict");
  return { state: code === 1 ? "created" : "existing", deal: saved };
}
