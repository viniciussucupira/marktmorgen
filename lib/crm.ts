/**
 * Where a store's own fields and deals are kept (lib/crm-rules.ts has the
 * rules).
 *
 *   nl:crm:fields:<statsId>          the fields (JSON)
 *   nl:crm:v:<statsId>:<field id>    hash  person (lib/buyer-profile.ts, personKey) -> value
 *   nl:crm:stages:<statsId>          the deals' stages (JSON); the default ones until changed
 *   nl:crm:deals:<statsId>           hash  deal id -> deal (JSON)
 *
 * A value is kept under the person's key, never the address (as a note
 * about them is), one hash a field, so the list's file reads each field once
 * however long the list is.
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import {
  type CrmField,
  CRM_ID,
  type Deal,
  DEFAULT_STAGES,
  DEAL_ID,
  MAX_DEALS,
  type Stage,
  fieldValue,
  parseDeal,
  parseFields,
  parseStages,
} from "@/lib/crm-rules";

export class CrmDealReadUnavailable extends Error {
  constructor() { super("CRM deal preflight could not be confirmed"); this.name = "CrmDealReadUnavailable"; }
}
export class CrmDealWriteUnconfirmed extends Error {
  constructor() { super("CRM deal change could not be confirmed"); this.name = "CrmDealWriteUnconfirmed"; }
}

export class CrmValueWriteUnconfirmed extends Error {
  constructor() { super("CRM contact value change could not be confirmed"); this.name = "CrmValueWriteUnconfirmed"; }
}

export class CrmSchemaReadUnavailable extends Error {
  constructor() { super("CRM configuration preflight could not be confirmed"); this.name = "CrmSchemaReadUnavailable"; }
}
export class CrmSchemaWriteUnconfirmed extends Error {
  constructor() { super("CRM configuration change could not be confirmed"); this.name = "CrmSchemaWriteUnconfirmed"; }
}

const fieldsKey = (statsId: string) => `nl:crm:fields:${statsId}`;
const valuesKey = (statsId: string, field: string) => `nl:crm:v:${statsId}:${field}`;
const stagesKey = (statsId: string) => `nl:crm:stages:${statsId}`;
const dealsKey = (statsId: string) => `nl:crm:deals:${statsId}`;
const PERSON = /^[0-9a-f]{32}$/;

const json = (raw: unknown): unknown => {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export async function readFields(statsId: string | null): Promise<CrmField[]> {
  if (!statsId || !isRedisConfigured()) return [];
  const [raw] = await redisPipeline([["GET", fieldsKey(statsId)]]);
  return parseFields(json(raw));
}

/** Saves the fields; the answers kept for a field that is gone go with it. */
export async function writeFields(statsId: string, fields: CrmField[]): Promise<CrmField[]> {
  let before: CrmField[];
  try {
    const response = await redisPipeline([["GET", fieldsKey(statsId)]]);
    if (!Array.isArray(response) || response.length !== 1) throw new CrmSchemaReadUnavailable();
    if (response[0] === null) before = [];
    else {
      if (typeof response[0] !== "string") throw new CrmSchemaReadUnavailable();
      const raw: unknown = JSON.parse(response[0]);
      if (!Array.isArray(raw)) throw new CrmSchemaReadUnavailable();
      before = parseFields(raw);
      if (before.length !== raw.length) throw new CrmSchemaReadUnavailable();
    }
  } catch { throw new CrmSchemaReadUnavailable(); }
  const gone = before.filter(f => !fields.some(n => n.id === f.id));
  try {
    const response = await redisPipeline([["SET", fieldsKey(statsId), JSON.stringify(fields)], ...gone.map(f => ["DEL", valuesKey(statsId, f.id)])]);
    if (!Array.isArray(response) || response.length !== 1 + gone.length || response[0] !== "OK" || Array.from(response).slice(1).some(value => value !== 0 && value !== 1)) throw new CrmSchemaWriteUnconfirmed();
  } catch { throw new CrmSchemaWriteUnconfirmed(); }
  return fields;
}

/** One person's values, by field id. */
export async function readValues(statsId: string | null, person: string, fields: CrmField[]): Promise<Record<string, string>> {
  if (!statsId || !PERSON.test(person) || !fields.length || !isRedisConfigured()) return {};
  const got = await redisPipeline(fields.map((f) => ["HGET", valuesKey(statsId, f.id), person]));
  return Object.fromEntries(fields.flatMap((f, i) => (typeof got[i] === "string" && got[i] ? [[f.id, got[i] as string]] : [])));
}

/** Sets one value for one person; "" clears it. False when it is not a value the field keeps. */
export async function setValue(statsId: string, person: string, field: CrmField, raw: unknown): Promise<boolean> {
  if (!PERSON.test(person)) return false;
  const value = fieldValue(field, raw);
  if (value === null) return false;
  try {
    const response = await redisPipeline([value ? ["HSET", valuesKey(statsId, field.id), person, value] : ["HDEL", valuesKey(statsId, field.id), person]]);
    if (!Array.isArray(response) || response.length !== 1 || (response[0] !== 0 && response[0] !== 1)) throw new CrmValueWriteUnconfirmed();
  } catch { throw new CrmValueWriteUnconfirmed(); }
  return true;
}

/** Every value of every field, by field id and then by person: for the list's file. */
export async function allValues(statsId: string | null, fields: CrmField[]): Promise<Record<string, Record<string, string>>> {
  if (!statsId || !fields.length || !isRedisConfigured()) return {};
  const got = await redisPipeline(fields.map((f) => ["HGETALL", valuesKey(statsId, f.id)]));
  return Object.fromEntries(
    fields.map((f, i) => {
      const raw = got[i];
      const map: Record<string, string> = {};
      if (Array.isArray(raw)) for (let k = 0; k + 1 < raw.length; k += 2) map[String(raw[k])] = String(raw[k + 1]);
      else if (raw && typeof raw === "object") Object.assign(map, raw as Record<string, string>);
      return [f.id, map];
    }),
  );
}

export async function readStages(statsId: string | null): Promise<Stage[]> {
  if (!statsId || !isRedisConfigured()) return DEFAULT_STAGES;
  const [raw] = await redisPipeline([["GET", stagesKey(statsId)]]);
  return parseStages(json(raw)) ?? DEFAULT_STAGES;
}

/** Move only the exact snapshot reviewed; never resurrect a deleted opportunity. */
export const MOVE_CRM_DEAL = `-- marktmorgen:crm-deal-move:v1
local current = redis.call("HGET", KEYS[1], ARGV[1])
if not current then return 0 end
if current ~= ARGV[2] then return -1 end
redis.call("HSET", KEYS[1], ARGV[1], ARGV[3])
return 1`;

/** Saves the stages; a deal in a stage that is gone moves to the first open one. */
export async function writeStages(statsId: string, stages: Stage[]): Promise<Stage[]> {
  const first = stages.find(s => s.kind === "open");
  if (!first) throw new CrmSchemaReadUnavailable();
  const moved: { id: string; before: string; record: Record<string, unknown> }[] = [];
  try {
    const response = await redisPipeline([["HGETALL", dealsKey(statsId)]]);
    if (!Array.isArray(response) || response.length !== 1 || !Array.isArray(response[0]) || response[0].length % 2 !== 0) throw new CrmSchemaReadUnavailable();
    const flat: unknown[] = response[0];
    const seen = new Set<string>();
    for (let i = 0; i < flat.length; i += 2) {
      const id = flat[i];
      if (typeof id !== "string" || !DEAL_ID.test(id) || seen.has(id) || typeof flat[i + 1] !== "string") throw new CrmSchemaReadUnavailable();
      const raw: unknown = JSON.parse(flat[i + 1] as string);
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new CrmSchemaReadUnavailable();
      const record = raw as Record<string, unknown>;
      if (record.id !== id || typeof record.stage !== "string" || !CRM_ID.test(record.stage)) throw new CrmSchemaReadUnavailable();
      seen.add(id);
      // Preserve every saved field; moving stages must not normalize away unrelated data.
      if (!stages.some(stage => stage.id === record.stage)) moved.push({ id, before: flat[i + 1] as string, record: { ...record, stage: first.id } });
    }
  } catch { throw new CrmSchemaReadUnavailable(); }
  try {
    const saved = await redisPipeline([["SET", stagesKey(statsId), JSON.stringify(stages)]]);
    if (!Array.isArray(saved) || saved.length !== 1 || saved[0] !== "OK") throw new CrmSchemaWriteUnconfirmed();
    if (moved.length) {
      const response = await redisPipeline(moved.map(({ id, before, record }) => ["EVAL", MOVE_CRM_DEAL, 1, dealsKey(statsId), id, before, JSON.stringify(record)]));
      if (!Array.isArray(response) || response.length !== moved.length || Array.from(response).some(value => value !== 0 && value !== 1)) throw new CrmSchemaWriteUnconfirmed();
    }
  } catch { throw new CrmSchemaWriteUnconfirmed(); }
  return stages;
}

/** Every deal, newest change first. `stages` reads a deal in a stage the store still has. */
export async function readDeals(statsId: string | null, stages: readonly Stage[]): Promise<Deal[]> {
  if (!statsId || !isRedisConfigured()) return [];
  const [raw] = await redisPipeline([["HVALS", dealsKey(statsId)]]);
  return (Array.isArray(raw) ? raw : [])
    .map((value) => parseDeal(json(value), stages))
    .filter((d): d is Deal => d !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Capacity and save share one Redis operation, including alongside form conversions. */
export const SAVE_CRM_DEAL = `-- marktmorgen:crm-deal-save:v1
if redis.call("HEXISTS", KEYS[1], ARGV[1]) == 0 and redis.call("HLEN", KEYS[1]) >= tonumber(ARGV[3]) then return 0 end
redis.call("HSET", KEYS[1], ARGV[1], ARGV[2])
return 1`;

/** Saves a deal. False when the store already has as many as it may and this one is new. */
export async function writeDeal(statsId: string, deal: Deal): Promise<boolean> {
  let preflight: unknown;
  try {
    preflight = await redisPipeline([["HEXISTS", dealsKey(statsId), deal.id], ["HLEN", dealsKey(statsId)]]);
  } catch { throw new CrmDealReadUnavailable(); }
  if (!Array.isArray(preflight) || preflight.length !== 2 || (preflight[0] !== 0 && preflight[0] !== 1) || typeof preflight[1] !== "number" || !Number.isSafeInteger(preflight[1]) || preflight[1] < preflight[0]) throw new CrmDealReadUnavailable();
  if (preflight[0] === 0 && preflight[1] >= MAX_DEALS) return false;
  try {
    const saved = await redisPipeline([["EVAL", SAVE_CRM_DEAL, 1, dealsKey(statsId), deal.id, JSON.stringify(deal), MAX_DEALS]]);
    if (!Array.isArray(saved) || saved.length !== 1 || (saved[0] !== 0 && saved[0] !== 1)) throw new CrmDealWriteUnconfirmed();
    return saved[0] === 1;
  } catch { throw new CrmDealWriteUnconfirmed(); }
}

export async function readDeal(statsId: string, id: string, stages: readonly Stage[]): Promise<Deal | null> {
  if (!DEAL_ID.test(id)) return null;
  const [raw] = await redisPipeline([["HGET", dealsKey(statsId), id]]);
  return parseDeal(json(raw), stages);
}

export async function dropDeal(statsId: string, id: string): Promise<boolean> {
  if (!DEAL_ID.test(id)) return false;
  try {
    const removed = await redisPipeline([["HDEL", dealsKey(statsId), id]]);
    if (!Array.isArray(removed) || removed.length !== 1 || (removed[0] !== 0 && removed[0] !== 1)) throw new CrmDealWriteUnconfirmed();
    return removed[0] === 1;
  } catch { throw new CrmDealWriteUnconfirmed(); }
}

/** Everything kept here for a store that is being deleted. */
export async function forgetCrm(statsId: string | null): Promise<void> {
  if (!statsId || !isRedisConfigured()) return;
  const fields = await readFields(statsId);
  await redisPipeline([["DEL", fieldsKey(statsId), stagesKey(statsId), dealsKey(statsId), ...fields.map((f) => valuesKey(statsId, f.id))]]);
}
