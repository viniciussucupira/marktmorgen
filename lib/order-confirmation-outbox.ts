/** A physical confirmation's origin is reserved before its payment URL.
 * Confirmation and shipment are separate intentions with separate sources.
 * This module shares the existing bounded pool/Lua, never a provider quota.
 */
import { createHash, randomBytes } from "node:crypto";
import { performance } from "node:perf_hooks";
import { onAccount } from "@/lib/stripe-account";
import { bindOrderConfirmationPreintent, commitOrderConfirmationSettlement } from "@/lib/orders";
import { fromStore, originalPhysicalConfirmation, type SessionRecord } from "@/lib/purchase-email";
import { refundedInFull } from "@/lib/refunds";
import { DEMO_CONNECTED_ACCOUNT } from "@/lib/demo-account";
import type { Listing, Store } from "@/lib/store";
import { redisPipeline } from "@/lib/redis";
import { canSeal, seal, unseal } from "@/lib/secret-box";
import {
  CURRENT_SHIPMENT_MAIL_LIFECYCLE, CURRENT_SHIPMENT_MAIL_POLICY,
  SHIPMENT_MAIL_SCRIPT, SHIPMENT_MAIL_MAX_ROW_BYTES, SHIPMENT_MAIL_MAX_INDEX_ITEMS,
  SHIPMENT_MAIL_ERASURE_FENCE_MS, shipmentMailPolicy, type ShipmentMailDispatch,
  type ShipmentMailPipeline, type ShipmentMailPolicy, type ShipmentMailRuntime,
} from "@/lib/shipment-mail-outbox";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const HASH = /^[a-f0-9]{64}$/;
const STORE = /^[A-Za-z0-9_-]{1,128}$/;
const ACCOUNT = /^acct_[A-Za-z0-9]{6,128}$/;
const SESSION = /^cs_(?:test|live)_[A-Za-z0-9]{10,200}$/;
export const CONFIRMATION_ORIGIN_DUE = "nl:order-confirmation:due";
export const CONFIRMATION_CREATE_REPLAY_MS = 23 * 3_600_000;
export const CONFIRMATION_CREATE_LEASE_MS = 120_000;
export type ConfirmationPhase = "awaiting_creation" | "creating" | "creation_unknown" | "awaiting_payment" | "queued" | "dispatching" | "refused" | "accepted";
export type ConfirmationOriginPayload = {
  body: string; preintentToken: string; intentFingerprint: string;
  /** Only the explicitly selected original product/store fields, never a
   * current catalog read or the whole account's settings/other buyers. */
  snapshot: Record<string, unknown>;
  settlementToken?: string;
  message?: { from: string; to: string; subject: string; text: string; replyTo: string };
  paidCents?: number;
};
export type ConfirmationOrigin = {
  kind: "confirmation"; id: string; statsId: string; nonce: string; accountId: string;
  bodyDigest: string; intentFingerprint: string; bindingFingerprint: string; session: string; person: string;
  sourceValue: string; sealed: string; fingerprint: string; bytes: number;
  created: number; authorizedAt: number; next: number; expiresAt: number;
  state: "queued" | "preparing" | "dispatching" | "refused";
  phase: ConfirmationPhase; owner: string; leaseUntil: number; checks: number;
  createAttempts: number; reviewId: string; recoveryCursor: string; recoveryUpper: number;
};
export const confirmationOriginId = (statsId: string, nonce: string) => hash(`confirmation\n${statsId}\n${nonce}`);
export function confirmationBodyDigest(body: string): string {
  const canonical = new URLSearchParams(body);
  canonical.delete("metadata[mm_order_hash]");
  return hash(canonical.toString());
}
export const confirmationOriginRowKey = (id: string) => `nl:order-confirmation:row:${id}`;
const sourceKey = (id: string) => `nl:order-confirmation:source:${id}`;
const context = (id: string) => `order-confirmation-origin|${id}`;
function data(value: unknown): Record<string, unknown> | null {
  try {
    if (!value || typeof value !== "object" || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return null;
    const result: Record<string, unknown> = Object.create(null);
    for (const key of Reflect.ownKeys(value)) {
      const d = Object.getOwnPropertyDescriptor(value, key);
      if (typeof key !== "string" || !d || !Object.hasOwn(d, "value")) return null;
      result[key] = d.value;
    }
    return result;
  } catch { return null; }
}
function array(value: unknown, max = 3): unknown[] | null {
  try {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) return null;
    const length = Object.getOwnPropertyDescriptor(value, "length")?.value;
    if (!Number.isSafeInteger(length) || length < 0 || length > max || Reflect.ownKeys(value).length !== length + 1) return null;
    const result: unknown[] = [];
    for (let i = 0; i < length; i++) {
      const d = Object.getOwnPropertyDescriptor(value, String(i));
      if (!d || !Object.hasOwn(d, "value")) return null;
      result.push(d.value);
    }
    return result;
  } catch { return null; }
}
function snapshotData(value: unknown, depth = 0, budget = { remaining: 2_000 }): unknown {
  if (--budget.remaining < 0 || depth > 8) throw Error("Confirmation snapshot is too large");
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) {
    const list = array(value, 1_000);
    if (!list) throw Error("Confirmation list is unknown");
    return list.map(item => snapshotData(item, depth + 1, budget));
  }
  const own = data(value);
  if (!own || Object.keys(own).length > 128) throw Error("Confirmation snapshot is not plain data");
  const result: Record<string, unknown> = Object.create(null);
  for (const [key, item] of Object.entries(own)) result[key] = snapshotData(item, depth + 1, budget);
  return result;
}
async function serverNow(pipeline: ShipmentMailPipeline): Promise<number | null> {
  try {
    const reply = array(await pipeline([["TIME"]]));
    const clock = reply?.length === 1 ? array(reply[0], 2) : null;
    if (clock?.length !== 2 || !clock.every(value => typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value))) return null;
    const seconds = Number(clock[0]), microseconds = Number(clock[1]);
    const now = seconds * 1_000 + Math.floor(microseconds / 1_000);
    return Number.isSafeInteger(now) && microseconds >= 0 && microseconds < 1_000_000 ? now : null;
  } catch { return null; }
}
function parse(raw: unknown): ConfirmationOrigin | null {
  try {
    if (typeof raw !== "string" || Buffer.byteLength(raw) > SHIPMENT_MAIL_MAX_ROW_BYTES) return null;
    const row = data(JSON.parse(raw));
    const fields = ["kind", "id", "statsId", "nonce", "accountId", "bodyDigest", "intentFingerprint", "bindingFingerprint", "session", "person", "sourceValue", "sealed", "fingerprint", "bytes", "created", "authorizedAt", "next", "expiresAt", "state", "phase", "owner", "leaseUntil", "checks", "createAttempts", "reviewId", "recoveryCursor", "recoveryUpper"];
    if (!row || Object.keys(row).length !== fields.length || !fields.every(key => Object.hasOwn(row, key)) || row.kind !== "confirmation" || typeof row.id !== "string" || !HASH.test(row.id) ||
        typeof row.statsId !== "string" || !STORE.test(row.statsId) || typeof row.nonce !== "string" || !HASH.test(row.nonce) ||
        row.id !== confirmationOriginId(row.statsId, row.nonce) || typeof row.accountId !== "string" || !ACCOUNT.test(row.accountId) ||
        ![row.bodyDigest, row.intentFingerprint, row.person, row.fingerprint].every(v => typeof v === "string" && HASH.test(v)) ||
        typeof row.session !== "string" || row.session !== "" && !SESSION.test(row.session) ||
        typeof row.bindingFingerprint !== "string" || (row.session === "" ? row.bindingFingerprint !== "" : !HASH.test(row.bindingFingerprint)) ||
        typeof row.sourceValue !== "string" || Buffer.byteLength(row.sourceValue) > 8_192 || typeof row.sealed !== "string" || !row.sealed.startsWith("s1.") ||
        !["queued", "preparing", "dispatching", "refused"].includes(String(row.state)) ||
        !["awaiting_creation", "creating", "creation_unknown", "awaiting_payment", "queued", "dispatching", "refused", "accepted"].includes(String(row.phase)) ||
        typeof row.recoveryCursor !== "string" || row.recoveryCursor !== "" && !SESSION.test(row.recoveryCursor) ||
        typeof row.owner !== "string" || !/^[a-f0-9]{0,48}$/.test(row.owner) || typeof row.reviewId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(row.reviewId) ||
        ![row.bytes, row.created, row.authorizedAt, row.next, row.expiresAt, row.leaseUntil, row.checks, row.createAttempts, row.recoveryUpper].every(v => typeof v === "number" && Number.isSafeInteger(v) && v >= 0) ||
        Number(row.bytes) < Buffer.byteLength(raw)) return null;
    const source = data(JSON.parse(row.sourceValue));
    if (!source || Object.keys(source).length !== (row.session ? 6 : 5) || source.kind !== "confirmation" || source.nonce !== row.nonce ||
        source.accountId !== row.accountId || source.bodyDigest !== row.bodyDigest || source.session !== row.session ||
        (row.session && source.bindingFingerprint !== row.bindingFingerprint)) return null;
    return row as unknown as ConfirmationOrigin;
  } catch { return null; }
}
function keys(row: ConfirmationOrigin): string[] {
  return [confirmationOriginRowKey(row.id), sourceKey(row.id), CONFIRMATION_ORIGIN_DUE,
    `nl:order-confirmation:store:${row.statsId}`, `nl:order-confirmation:person:${row.statsId}:${row.person}`,
    "nl:ship:mail:pool", `nl:ship:mail:pool:${row.statsId}`, "nl:ship:mail:all",
    `nl:ship:mail:closed:${row.statsId}`, `nl:ship:mail:erased:${row.statsId}:${row.person}`];
}
export function confirmationOutboxPolicy(runtime: ShipmentMailRuntime = {}, admission = true): ShipmentMailPolicy | null {
  const lifecycle = runtime.lifecycle ?? CURRENT_SHIPMENT_MAIL_LIFECYCLE;
  if (lifecycle !== "active") return null;
  return shipmentMailPolicy(runtime.policy === undefined ? CURRENT_SHIPMENT_MAIL_POLICY : runtime.policy, (runtime.now ?? Date.now)(), admission);
}
export async function readConfirmationOrigin(id: string, runtime: ShipmentMailRuntime = {}): Promise<{ row: ConfirmationOrigin; raw: string; payload: ConfirmationOriginPayload } | null> {
  if ((runtime.lifecycle ?? CURRENT_SHIPMENT_MAIL_LIFECYCLE) === "never_activated" || !HASH.test(id)) return null;
  const pipeline = runtime.pipeline ?? redisPipeline;
  try {
    const reply = array(await pipeline([["TYPE", confirmationOriginRowKey(id)], ["GETRANGE", confirmationOriginRowKey(id), 0, SHIPMENT_MAIL_MAX_ROW_BYTES], ["GET", sourceKey(id)]]));
    if (reply?.length !== 3 || reply[0] !== "string") return null;
    const row = parse(reply[1]);
    if (!row || row.id !== id || reply[2] !== row.sourceValue) return null;
    const opened = unseal(row.sealed, context(id));
    if (!opened.ok || hash(opened.value) !== row.fingerprint) return null;
    const payload = data(JSON.parse(opened.value));
    if (!payload || typeof payload.body !== "string" || confirmationBodyDigest(payload.body) !== row.bodyDigest ||
        typeof payload.preintentToken !== "string" || hash(payload.preintentToken) !== row.intentFingerprint ||
        payload.intentFingerprint !== row.intentFingerprint || !data(payload.snapshot)) return null;
    return { row, raw: String(reply[1]), payload: payload as unknown as ConfirmationOriginPayload };
  } catch { return null; }
}

/** The full future row envelope is charged before reserving a new payment
 * origin. The reviewed cap must fund its complete uncertain/pending lifetime.
 */
export async function reserveConfirmationOrigin(input: {
  statsId: string | null; nonce: string; accountId: string; body: string;
  preintent: { token: string; expiresAtMs: number; intentFingerprint: string };
  snapshot: Record<string, unknown>;
}, runtime: ShipmentMailRuntime = {}): Promise<{ ok: true; id: string } | { ok: false }> {
  const p = confirmationOutboxPolicy(runtime);
  if (!p || !canSeal()) return { ok: false };
  try {
    const own = data(input), preintent = data(own?.preintent);
    if (!own || !preintent || typeof own.statsId !== "string" || !STORE.test(own.statsId) || typeof own.nonce !== "string" || !HASH.test(own.nonce) ||
        typeof own.accountId !== "string" || !ACCOUNT.test(own.accountId) || own.accountId === DEMO_CONNECTED_ACCOUNT || typeof own.body !== "string" ||
        typeof preintent.token !== "string" || !preintent.token.startsWith("s1.") || typeof preintent.expiresAtMs !== "number" || !Number.isSafeInteger(preintent.expiresAtMs) ||
        hash(preintent.token) !== preintent.intentFingerprint || !data(own.snapshot)) return { ok: false };
    const statsId = own.statsId;
    input = { ...own, preintent } as typeof input;
    const form = new URLSearchParams(input.body), bodyDigest = confirmationBodyDigest(input.body);
    if (form.get("metadata[mm_order_intent]") !== input.nonce || form.get("metadata[mm_order_hash]") !== bodyDigest) return { ok: false };
    // Authentic admission proof must precede even creation of a hosted page.
    // A matching caller-supplied hash of an arbitrary token is not evidence.
    const opened = unseal(input.preintent.token, `order-confirmation-preintent|${input.nonce}`);
    if (!opened.ok || opened.value.length > 2_500) return { ok: false };
    const proof = data(JSON.parse(opened.value)), original = data(proof?.original);
    const snapshot = snapshotData(input.snapshot) as Record<string, unknown>, snapshotStore = data(snapshot.store);
    const owner = snapshotStore?.extra === true ? `#${snapshotStore.sid}` : snapshotStore?.email;
    if (!proof || !original || proof.version !== 1 || proof.nonce !== input.nonce || proof.accountId !== input.accountId || proof.bodyDigest !== bodyDigest ||
        original.until !== input.preintent.expiresAtMs || original.owner !== owner || snapshotStore?.statsId !== statsId || snapshotStore?.stripeAccountId !== input.accountId) return { ok: false };
    const pipeline = runtime.pipeline ?? redisPipeline;
    const now = await serverNow(pipeline), id = confirmationOriginId(statsId, input.nonce);
    if (now === null || Math.abs(now - (runtime.now ?? Date.now)()) > 60_000 || input.preintent.expiresAtMs <= now) return { ok: false };
    const payload: ConfirmationOriginPayload = { body: input.body, preintentToken: input.preintent.token, intentFingerprint: input.preintent.intentFingerprint, snapshot };
    const plain = JSON.stringify(payload);
    if (Buffer.byteLength(plain) > p.maxPayloadBytes) return { ok: false };
    const row: ConfirmationOrigin = { kind: "confirmation", id, statsId, nonce: input.nonce,
      accountId: input.accountId, bodyDigest, intentFingerprint: input.preintent.intentFingerprint, bindingFingerprint: "",
      session: "", person: hash(`unbound:${input.nonce}`),
      sourceValue: JSON.stringify({ kind: "confirmation", nonce: input.nonce, accountId: input.accountId, bodyDigest, session: "" }),
      sealed: seal(plain, context(id)), fingerprint: hash(plain), bytes: 0,
      created: now, authorizedAt: now, next: now, expiresAt: input.preintent.expiresAtMs,
      state: "queued", phase: "awaiting_creation", owner: "", leaseUntil: 0, checks: 0, createAttempts: 0, reviewId: p.reviewId, recoveryCursor: "", recoveryUpper: 0 };
    row.bytes = SHIPMENT_MAIL_MAX_ROW_BYTES + keys(row).reduce((n, key) => n + Buffer.byteLength(key), 0) * 2 + 16_384;
    const raw = JSON.stringify(row);
    if (!parse(raw)) return { ok: false };
    const reply = array(await pipeline([["EVAL", SHIPMENT_MAIL_SCRIPT, 10, ...keys(row), "enqueue", "", raw, now, SHIPMENT_MAIL_MAX_ROW_BYTES, JSON.stringify(p), ""]]));
    const receipt = reply?.length === 1 ? array(reply[0]) : null;
    const saved = receipt && (receipt[0] === "queued" && receipt.length === 2 || receipt[0] === "existing" && receipt.length === 3) ? parse(receipt[1]) : null;
    if (receipt?.[0] === "existing" && receipt[2] !== saved?.sourceValue) return { ok: false };
    if (!saved || saved.id !== id || saved.intentFingerprint !== row.intentFingerprint || saved.bodyDigest !== row.bodyDigest) return { ok: false };
    return { ok: true, id };
  } catch { return { ok: false }; }
}

/** A preparation lease may authorize replay of the SAME Stripe creation
 * inside its retention window. It never authorizes replay of email sends.
 * After that conservative 23h window, only verified provider reads can bind.
 */
export const CONFIRMATION_ORIGIN_SCRIPT = `-- marktmorgen:confirmation-origin:v1
local op,expected,supplied=ARGV[1],ARGV[2],ARGV[3]
local now=tonumber(ARGV[4])
if not now or now<0 then return {'unknown'} end
local clock=redis.call('TIME')
local serverNow=tonumber(clock[1])*1000+math.floor(tonumber(clock[2])/1000)
if math.abs(now-serverNow)>60000 then return {'unknown'} end
now=serverNow
local types={'string','string','zset','set','set','hash','hash','set','string','string'}
for i=1,10 do local t=redis.call('TYPE',KEYS[i]).ok; if t~='none' and t~=types[i] then return {'unknown'} end end
local raw=redis.call('GETRANGE',KEYS[1],0,131072)
if raw~=expected or #raw>131072 then return {'changed'} end
local ok,r=pcall(cjson.decode,raw)
if not ok or type(r)~='table' or r.kind~='confirmation' or redis.call('GET',KEYS[2])~=r.sourceValue or type(r.expiresAt)~='number' or now>=r.expiresAt then return {'unknown'} end
if redis.call('EXISTS',KEYS[9],KEYS[10])~=0 then return {'held'} end
local good,p=pcall(cjson.decode,ARGV[6])
if not good or type(p)~='table' then return {'unknown'} end
local supported=r.reviewId==p.reviewId
if type(p.continuedReviewIds)=='table' then for _,id in ipairs(p.continuedReviewIds) do if id==r.reviewId then supported=true end end end
if not supported then return {'unknown'} end
if op=='cursor' then
 local good,n=pcall(cjson.decode,supplied)
 if not good or type(n)~='table' or r.session~='' or type(n.recoveryCursor)~='string' or type(n.recoveryUpper)~='number' then return {'unknown'} end
 r.recoveryCursor=n.recoveryCursor; r.recoveryUpper=n.recoveryUpper; r.next=now+p.retryMilliseconds; r.phase='creation_unknown'
elseif op=='create' then
 if r.session~='' or (r.phase~='awaiting_creation' and r.phase~='creating') or r.leaseUntil>now then return {'held'} end
 if now>=r.created+82800000 or r.createAttempts>=p.maximumChecks then return {'creation_unknown'} end
 r.phase='creating'; r.owner=ARGV[5]; r.leaseUntil=now+120000; r.next=r.leaseUntil; r.createAttempts=r.createAttempts+1
elseif op=='bind' then
 local good,n=pcall(cjson.decode,supplied)
 if not good or type(n)~='table' or n.kind~='confirmation' then return {'unknown'} end
 for _,field in ipairs({'id','statsId','nonce','accountId','bodyDigest','intentFingerprint','created','expiresAt','bytes','person','reviewId'}) do if n[field]~=r[field] then return {'unknown'} end end
 if r.session~='' then return {'bound',raw} end
 if n.session=='' or n.phase~='awaiting_payment' or #supplied>131072 or #supplied>r.bytes then return {'unknown'} end
 redis.call('SET',KEYS[1],supplied); redis.call('SET',KEYS[2],n.sourceValue)
 redis.call('ZADD',KEYS[3],n.next,n.id)
 return {'bound',supplied}
else return {'unknown'} end
local encoded=cjson.encode(r)
if #encoded>131072 or #encoded>r.bytes then return {'unknown'} end
redis.call('SET',KEYS[1],encoded); redis.call('ZADD',KEYS[3],r.next,r.id)
if op=='cursor' then return {'cursor',encoded} end
return {'creating',encoded,tostring(serverNow),tostring(r.created+82800000)}`;

export async function claimConfirmationCreation(id: string, runtime: ShipmentMailRuntime = {}): Promise<{ row: ConfirmationOrigin; payload: ConfirmationOriginPayload; sendBeforeMs: number; sendBeforeMonotonicMs: number } | null> {
  if (!confirmationOutboxPolicy(runtime, false)) return null;
  const found = await readConfirmationOrigin(id, runtime);
  if (!found) return null;
  try {
    const pipeline = runtime.pipeline ?? redisPipeline, policy = confirmationOutboxPolicy(runtime, false), owner = randomBytes(24).toString("hex");
    if (!policy) return null;
    const started = performance.now();
    const reply = array(await pipeline([["EVAL", CONFIRMATION_ORIGIN_SCRIPT, 10, ...keys(found.row), "create", found.raw, "", (runtime.now ?? Date.now)(), owner, JSON.stringify(policy)]]));
    const receipt = reply?.length === 1 ? array(reply[0], 4) : null;
    const row = receipt?.length === 4 && receipt[0] === "creating" ? parse(receipt[1]) : null;
    if (!row || row.owner !== owner || typeof receipt?.[2] !== "string" || typeof receipt[3] !== "string" ||
        !/^[1-9][0-9]*$/.test(receipt[2]) || !/^[1-9][0-9]*$/.test(receipt[3])) return null;
    const server = Number(receipt[2]), sendBeforeMs = Number(receipt[3]);
    const sendBeforeMonotonicMs = started + sendBeforeMs - server;
    if (!Number.isSafeInteger(server) || !Number.isSafeInteger(sendBeforeMs) || sendBeforeMs <= server || performance.now() >= sendBeforeMonotonicMs || (runtime.now ?? Date.now)() >= sendBeforeMs) return null;
    return { row, payload: found.payload, sendBeforeMs, sendBeforeMonotonicMs };
  } catch { return null; }
}

type BoundConfirmationOrigin = { sessionId: string; settlementToken: string; bindingFingerprint: string; intentFingerprint: string; expiresAtMs: number };
function winner(found: Awaited<ReturnType<typeof readConfirmationOrigin>>): BoundConfirmationOrigin | null {
  return found && SESSION.test(found.row.session) && HASH.test(found.row.bindingFingerprint) && typeof found.payload.settlementToken === "string" && found.payload.settlementToken.startsWith("s1.")
    ? { sessionId: found.row.session, settlementToken: found.payload.settlementToken, bindingFingerprint: found.row.bindingFingerprint, intentFingerprint: found.row.intentFingerprint, expiresAtMs: found.row.expiresAt }
    : null;
}
/** The caller supplies a candidate derived from an independently read Stripe
 * session on the original account. Only this source CAS decides ownership;
 * a fresh candidate's AES nonce never replaces the stored winning token.
 */
export async function bindConfirmationOrigin(id: string, value: BoundConfirmationOrigin, runtime: ShipmentMailRuntime = {}): Promise<BoundConfirmationOrigin | null> {
  const policy = confirmationOutboxPolicy(runtime, false);
  if (!policy) return null;
  const found = await readConfirmationOrigin(id, runtime), candidate = data(value);
  if (!found || !candidate || typeof candidate.sessionId !== "string" || !SESSION.test(candidate.sessionId) ||
      typeof candidate.settlementToken !== "string" || !candidate.settlementToken.startsWith("s1.") ||
      typeof candidate.bindingFingerprint !== "string" || !HASH.test(candidate.bindingFingerprint) ||
      candidate.intentFingerprint !== found.row.intentFingerprint || candidate.expiresAtMs !== found.row.expiresAt) return null;
  if (found.row.session) return winner(found);
  try {
    const plain = JSON.stringify({ ...found.payload, settlementToken: candidate.settlementToken });
    const row = { ...found.row, session: candidate.sessionId, bindingFingerprint: candidate.bindingFingerprint, phase: "awaiting_payment" as const, owner: "", leaseUntil: 0,
      next: (runtime.now ?? Date.now)() + 60_000, sealed: seal(plain, context(id)), fingerprint: hash(plain),
      sourceValue: JSON.stringify({ kind: "confirmation", nonce: found.row.nonce, accountId: found.row.accountId, bodyDigest: found.row.bodyDigest, session: candidate.sessionId, bindingFingerprint: candidate.bindingFingerprint }) };
    const raw = JSON.stringify(row);
    if (!parse(raw)) return null;
    const pipeline = runtime.pipeline ?? redisPipeline;
    const reply = array(await pipeline([["EVAL", CONFIRMATION_ORIGIN_SCRIPT, 10, ...keys(found.row), "bind", found.raw, raw, (runtime.now ?? Date.now)(), "", JSON.stringify(policy)]]));
    const receipt = reply?.length === 1 ? array(reply[0]) : null;
    // A competing bind or lost ACK is resolved by reading the definitive
    // source, including its winning token and fingerprint, never this input.
    if (!receipt || !["bound", "changed"].includes(String(receipt[0]))) return null;
    return winner(await readConfirmationOrigin(id, runtime));
  } catch { return null; }
}

export const confirmationOriginIndexLimit = SHIPMENT_MAIL_MAX_INDEX_ITEMS;
export type ConfirmationOriginPipeline = ShipmentMailPipeline;

export type ConfirmationOriginRuntime = ShipmentMailRuntime & { provider?: typeof onAccount };
type ProviderSession = Record<string, unknown> & { id: string; metadata: Record<string, unknown> };
function verifiedSession(found: NonNullable<Awaited<ReturnType<typeof readConfirmationOrigin>>>, value: unknown): ProviderSession | null {
  try {
    const session = snapshotData(value) as Record<string, unknown>, metadata = data(session.metadata);
    if (!data(session) || typeof session.id !== "string" || !SESSION.test(session.id) || !metadata ||
        metadata.mm_order_intent !== found.row.nonce || metadata.mm_order_hash !== found.row.bodyDigest ||
        session.object !== "checkout.session" || session.mode !== "payment" ||
        typeof session.created !== "number" || !Number.isSafeInteger(session.created) || session.created < Math.floor(found.row.created / 1000) - 60) return null;
    const form = new URLSearchParams(found.payload.body);
    // Compare the full metadata of the original request, not only a request
    // parameter echo. The identity and original order contents travel together.
    const originalMetadata: string[] = [];
    for (const [key, value] of form) {
      const match = /^metadata\[([^\]]+)\]$/.exec(key);
      if (match) {
        originalMetadata.push(match[1]);
        if (metadata[match[1]] !== value) return null;
      }
    }
    // Extra mutable fields can manufacture digital-consent or marketing
    // statements despite a matching product/nonce. Only the exact original
    // request may describe this physical purchase or its rights.
    if (Object.keys(metadata).length !== originalMetadata.length) return null;
    const lineItems = data(session.line_items), lines = array(lineItems?.data, 1);
    if (!lineItems || lineItems.has_more !== false || !lines || lines.length !== 1) return null;
    const line = data(lines[0]), price = data(line?.price);
    const quantity = form.get("line_items[0][quantity]"), cents = form.get("line_items[0][price_data][unit_amount]"), currency = form.get("line_items[0][price_data][currency]");
    if (!line || !price || !quantity || !/^[1-9][0-9]*$/.test(quantity) || !cents || !/^(0|[1-9][0-9]*)$/.test(cents) ||
        !currency || line.quantity !== Number(quantity) || price.unit_amount !== Number(cents) || price.currency !== currency || session.currency !== currency) return null;
    return { ...session, id: session.id, metadata };
  } catch { return null; }
}
async function readProviderSession(found: NonNullable<Awaited<ReturnType<typeof readConfirmationOrigin>>>, id: string, runtime: ConfirmationOriginRuntime, payment = false): Promise<ProviderSession | null> {
  if (!SESSION.test(id)) return null;
  try {
    return verifiedSession(found, await (runtime.provider ?? onAccount)("GET", found.row.accountId, `/checkout/sessions/${encodeURIComponent(id)}?expand[]=line_items${payment ? "&expand[]=payment_intent.latest_charge" : ""}`));
  } catch { return null; }
}
async function bindVerifiedSession(found: NonNullable<Awaited<ReturnType<typeof readConfirmationOrigin>>>, session: ProviderSession, runtime: ConfirmationOriginRuntime): Promise<BoundConfirmationOrigin | null> {
  const originalStore = data(found.payload.snapshot.store);
  if (!originalStore) return null;
  const candidate = await bindOrderConfirmationPreintent(originalStore as unknown as Store, found.payload.preintentToken,
    { sessionId: session.id, nonce: String(session.metadata.mm_order_intent), accountId: found.row.accountId, bodyDigest: String(session.metadata.mm_order_hash) }, { now: runtime.now });
  return candidate ? bindConfirmationOrigin(found.row.id, candidate, runtime) : null;
}

/** Read one page from the original account. No absence of results is proof
 * that an uncertain creation failed. Pagination and the bounded time snapshot
 * are persisted; a complete empty walk starts another read cycle, never POST.
 */
async function recoverCreation(found: NonNullable<Awaited<ReturnType<typeof readConfirmationOrigin>>>, runtime: ConfirmationOriginRuntime): Promise<BoundConfirmationOrigin | null> {
  const policy = confirmationOutboxPolicy(runtime, false);
  if (!policy) return null;
  try {
    const pipeline = runtime.pipeline ?? redisPipeline;
    const clock = await serverNow(pipeline);
    if (clock === null) return null;
    const upper = found.row.recoveryUpper || Math.floor(clock / 1000);
    const search = new URLSearchParams({ limit: "100", "created[gte]": String(Math.max(0, Math.floor(found.row.created / 1000) - 60)), "created[lte]": String(upper) });
    if (found.row.recoveryCursor) search.set("starting_after", found.row.recoveryCursor);
    const page = data(await (runtime.provider ?? onAccount)("GET", found.row.accountId, `/checkout/sessions?${search}`));
    const list = array(page?.data, 100);
    if (!page || page.object !== "list" || !list || typeof page.has_more !== "boolean" || page.has_more && list.length === 0) return null;
    let last = "";
    for (const item of list) {
      const row = data(item), meta = data(row?.metadata);
      if (!row || typeof row.id !== "string" || !SESSION.test(row.id) || typeof row.created !== "number" || !Number.isSafeInteger(row.created) || row.created > upper || row.created < Math.floor(found.row.created / 1000) - 60) return null;
      last = row.id;
      if (meta?.mm_order_intent !== found.row.nonce) continue;
      const session = await readProviderSession(found, row.id, runtime);
      if (!session) return null;
      const bound = await bindVerifiedSession(found, session, runtime);
      if (bound) return bound;
      return null;
    }
    // Save progress only after every row in this page was processed. A crash
    // before this acknowledgement repeats read-only work, not a payment POST.
    await pipeline([["EVAL", CONFIRMATION_ORIGIN_SCRIPT, 10, ...keys(found.row), "cursor", found.raw,
      JSON.stringify({ recoveryCursor: page.has_more ? last : "", recoveryUpper: page.has_more ? upper : 0 }), clock, "", JSON.stringify(policy)]]);
    return null;
  } catch { return null; }
}

/** A real checkout caller uses this only after the complete origin is durably
 * reserved. Creation is replayable solely with its original body/key and an
 * acknowledged Redis-relative deadline. There is no POST after23h; verified
 * original-account reads remain possible after24h and process restarts.
 */
export async function openConfirmationOrigin(id: string, runtime: ConfirmationOriginRuntime = {}): Promise<{ url: string; id: string } | null> {
  if (!confirmationOutboxPolicy(runtime, false)) return null;
  let found = await readConfirmationOrigin(id, runtime);
  if (!found) return null;
  let bound = winner(found);
  if (!bound) {
    const claim = await claimConfirmationCreation(id, runtime);
    if (claim) {
      let created: Record<string, unknown> | null = null;
      try {
        if ((runtime.now ?? Date.now)() >= claim.sendBeforeMs || performance.now() >= claim.sendBeforeMonotonicMs) return null;
        created = await (runtime.provider ?? onAccount)("POST", claim.row.accountId, "/checkout/sessions", new URLSearchParams(claim.payload.body), undefined, `confirmation-origin:${claim.row.id}`);
      } catch { /* Unknown stays charged; the next attempt reads/replays only the original source. */ }
      if (typeof created?.id === "string") {
        const session = await readProviderSession(found, created.id, runtime);
        if (session) bound = await bindVerifiedSession(found, session, runtime);
      }
    }
    if (!bound) {
      found = await readConfirmationOrigin(id, runtime);
      if (!found) return null;
      bound = winner(found) ?? await recoverCreation(found, runtime);
    }
  }
  if (!bound) return null;
  found = await readConfirmationOrigin(id, runtime);
  if (!found || found.row.session !== bound.sessionId || found.row.bindingFingerprint !== bound.bindingFingerprint) return null;
  const session = await readProviderSession(found, bound.sessionId, runtime);
  if (!session || session.status !== "open" || typeof session.url !== "string") return null;
  try {
    const url = new URL(session.url);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com" && !url.username && !url.password
      ? { url: url.href, id: bound.sessionId } : null;
  } catch { return null; }
}

/** Recipient binding and an accepted-but-unsettled receipt remain inside the
 * envelope reserved before payment. No new slot is manufactured after paying.
 * The new person index and its erasure fence are checked in the same CAS.
 */
export const CONFIRMATION_PAID_SCRIPT = `-- marktmorgen:confirmation-paid:v1
local op,expected,supplied=ARGV[1],ARGV[2],ARGV[3]
local clientNow=tonumber(ARGV[4])
local clock=redis.call('TIME')
local now=tonumber(clock[1])*1000+math.floor(tonumber(clock[2])/1000)
if not clientNow or clientNow<0 or math.abs(clientNow-now)>60000 then return {'unknown'} end
local types={'string','string','zset','set','set','hash','hash','set','string','string','set','string'}
for i=1,12 do local t=redis.call('TYPE',KEYS[i]).ok; if t~='none' and t~=types[i] then return {'unknown'} end end
local raw=redis.call('GETRANGE',KEYS[1],0,131072)
if raw~=expected or #raw>131072 then return {'changed'} end
local ok,r=pcall(cjson.decode,raw)
local good,p=pcall(cjson.decode,ARGV[6])
if not ok or not good or type(r)~='table' or type(p)~='table' or r.kind~='confirmation' or redis.call('GET',KEYS[2])~=r.sourceValue then return {'unknown'} end
local supported=r.reviewId==p.reviewId
if type(p.continuedReviewIds)=='table' then for _,id in ipairs(p.continuedReviewIds) do if id==r.reviewId then supported=true end end end
if not supported or redis.call('EXISTS',KEYS[9],KEYS[10],KEYS[12])~=0 then return {'held'} end
if op=='paid' then
 local good,n=pcall(cjson.decode,supplied)
 if not good or type(n)~='table' or r.session=='' or r.phase~='awaiting_payment' or r.state~='preparing' or r.owner~=ARGV[5] or r.leaseUntil<now then return {'held'} end
 for _,field in ipairs({'kind','id','statsId','nonce','accountId','bodyDigest','intentFingerprint','bindingFingerprint','session','sourceValue','bytes','created','authorizedAt','expiresAt','owner','leaseUntil','checks','createAttempts','reviewId','recoveryCursor','recoveryUpper'}) do if n[field]~=r[field] then return {'unknown'} end end
 if n.state~='preparing' or n.phase~='queued' or type(n.person)~='string' or #n.person~=64 or type(n.sealed)~='string' or type(n.fingerprint)~='string' or #supplied>131072 or #supplied>r.bytes then return {'unknown'} end
 redis.call('SET',KEYS[1],supplied)
 redis.call('SREM',KEYS[5],r.id); redis.call('SADD',KEYS[11],r.id)
 return {'paid',supplied}
elseif op=='accepted' then
 if r.state~='dispatching' or r.owner~=ARGV[5] then return {'held'} end
 r.phase='accepted'; r.state='refused'; r.next=now+p.retryMilliseconds
 local encoded=cjson.encode(r)
 if #encoded>131072 or #encoded>r.bytes then return {'unknown'} end
 redis.call('SET',KEYS[1],encoded)
 if r.checks<p.maximumChecks then redis.call('ZADD',KEYS[3],r.next,r.id) else redis.call('ZREM',KEYS[3],r.id) end
 return {'accepted',encoded}
elseif op=='settlement' then
 if r.phase~='accepted' or r.state~='refused' or r.next>now then return {'held'} end
 if r.checks>=p.maximumChecks then redis.call('ZREM',KEYS[3],r.id); return {'held'} end
 r.checks=r.checks+1; r.next=now+p.retryMilliseconds
 local encoded=cjson.encode(r)
 if #encoded>131072 or #encoded>r.bytes then return {'unknown'} end
 redis.call('SET',KEYS[1],encoded)
 if r.checks<p.maximumChecks then redis.call('ZADD',KEYS[3],r.next,r.id) else redis.call('ZREM',KEYS[3],r.id) end
 return {'settlement',encoded}
else return {'unknown'} end`;

type FoundOrigin = NonNullable<Awaited<ReturnType<typeof readConfirmationOrigin>>>;
function knownPhysicalPayment(session: ProviderSession): boolean {
  if (session.status !== "complete" || !Number.isSafeInteger(session.amount_total) || Number(session.amount_total) < 0) return false;
  if (session.amount_total === 0) return session.payment_status === "no_payment_required";
  const payment = data(session.payment_intent), charge = data(payment?.latest_charge);
  // Missing or unexpanded refund evidence does not prove an unrefunded order.
  return session.payment_status === "paid" && payment?.object === "payment_intent" && payment.status === "succeeded" &&
    payment.amount_received === session.amount_total && payment.currency === session.currency && charge?.object === "charge" &&
    charge.paid === true && charge.amount === session.amount_total && charge.currency === session.currency && charge.refunded === false &&
    Number.isSafeInteger(charge.amount_refunded) && Number(charge.amount_refunded) >= 0 && Number(charge.amount_refunded) < Number(charge.amount) &&
    !refundedInFull(payment);
}
function preparedMessage(found: FoundOrigin): ConfirmationOriginPayload["message"] | null {
  const message = data(found.payload.message);
  if (!message || Object.keys(message).length !== 5 || !["from", "to", "subject", "text", "replyTo"].every(key => typeof message[key] === "string") ||
      hash(String(message.to).trim().toLowerCase()) !== found.row.person || !Number.isSafeInteger(found.payload.paidCents) || Number(found.payload.paidCents) < 0 ||
      !found.row.session || !found.payload.settlementToken) return null;
  return message as ConfirmationOriginPayload["message"];
}
async function confirmationMutation(op: string, found: FoundOrigin, p: ShipmentMailPolicy | null, runtime: ShipmentMailRuntime, owner = ""): Promise<unknown[] | null> {
  try {
    const reply = array(await (runtime.pipeline ?? redisPipeline)([["EVAL", SHIPMENT_MAIL_SCRIPT, 10, ...keys(found.row), op, found.raw, "",
      (runtime.now ?? Date.now)(), SHIPMENT_MAIL_MAX_ROW_BYTES, JSON.stringify(p), owner]]));
    return reply?.length === 1 ? array(reply[0]) : null;
  } catch { return null; }
}
async function preparePaid(found: FoundOrigin, p: ShipmentMailPolicy, runtime: ConfirmationOriginRuntime, owner: string): Promise<FoundOrigin | null> {
  const session = await readProviderSession(found, found.row.session, runtime, true);
  if (!session || session.id !== found.row.session || !knownPhysicalPayment(session)) return null;
  const store = data(found.payload.snapshot.store), product = data(found.payload.snapshot.product);
  if (!store || !product || store.statsId !== found.row.statsId || store.stripeAccountId !== found.row.accountId) return null;
  const letter = originalPhysicalConfirmation(store as unknown as Store, session as SessionRecord, product as unknown as Listing);
  if (!letter || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(letter.to) || letter.to.length > 320 || typeof store.email !== "string") return null;
  const payload = { ...found.payload, paidCents: Number(session.amount_total), message: { ...letter, from: fromStore(store as unknown as Store), replyTo: store.email } };
  const plain = JSON.stringify(payload);
  if (Buffer.byteLength(plain) > p.maxPayloadBytes) return null;
  const row = { ...found.row, phase: "queued" as const, person: hash(letter.to.trim().toLowerCase()), sealed: seal(plain, context(found.row.id)), fingerprint: hash(plain) };
  const raw = JSON.stringify(row);
  if (!parse(raw)) return null;
  try {
    const reply = array(await (runtime.pipeline ?? redisPipeline)([["EVAL", CONFIRMATION_PAID_SCRIPT, 12, ...keys(found.row),
      `nl:order-confirmation:person:${row.statsId}:${row.person}`, `nl:ship:mail:erased:${row.statsId}:${row.person}`,
      "paid", found.raw, raw, (runtime.now ?? Date.now)(), owner, JSON.stringify(p)]]));
    const receipt = reply?.length === 1 ? array(reply[0]) : null;
    if (receipt?.[0] !== "paid") return null;
    const saved = await readConfirmationOrigin(row.id, runtime);
    return saved && saved.row.owner === owner && preparedMessage(saved) ? saved : null;
  } catch { return null; }
}

/** This slice handles only original simple physical checkouts. It never
 * creates a checkout in a cron pass, reads a current catalog, or treats a
 * provider's missing answer as failure. All other producers remain legacy.
 */
export async function runOrderConfirmationMail(deadline: number, dispatch: ShipmentMailDispatch, runtime: ConfirmationOriginRuntime = {}, onlyId?: string): Promise<{ accepted: number; waiting: number; unknown: number }> {
  const counts = { accepted: 0, waiting: 0, unknown: 0 }, now = runtime.now ?? Date.now;
  const started = performance.now(), currentTime = now();
  if (!Number.isSafeInteger(deadline) || !Number.isSafeInteger(currentTime) || deadline <= currentTime) return counts;
  const monotonicDeadline = started + deadline - currentTime;
  const expired = () => now() >= deadline || performance.now() >= monotonicDeadline;
  const p = confirmationOutboxPolicy(runtime, false);
  if (!p) return { ...counts, unknown: 1 };
  const pipeline = runtime.pipeline ?? redisPipeline;
  let ids: unknown[] | null;
  try {
    if (onlyId !== undefined) { if (!HASH.test(onlyId)) throw Error("Unknown confirmation"); ids = [onlyId]; }
    else {
      const got = array(await pipeline([["TYPE", CONFIRMATION_ORIGIN_DUE], ["ZRANGEBYSCORE", CONFIRMATION_ORIGIN_DUE, "-inf", now(), "LIMIT", 0, 25]]));
      ids = got?.length === 2 && ["none", "zset"].includes(String(got[0])) ? array(got[1], 25) : null;
    }
    if (!ids || ids.some(id => typeof id !== "string" || !HASH.test(id)) || new Set(ids).size !== ids.length) throw Error("Unknown confirmation index");
  } catch { return { ...counts, unknown: 1 }; }
  for (const id of ids) {
    if (expired()) break;
    let found = await readConfirmationOrigin(String(id), runtime);
    if (!found || found.row.accountId === DEMO_CONNECTED_ACCOUNT) { counts.unknown++; continue; }
    // A previous accepted outcome is never dispatched again. Its complete
    // protected source survives until original accounting is acknowledged.
    if (found.row.phase === "accepted") {
      let receipt: unknown[] | null = null;
      try {
        const reply = array(await pipeline([["EVAL", CONFIRMATION_PAID_SCRIPT, 12, ...keys(found.row), keys(found.row)[4], keys(found.row)[9],
          "settlement", found.raw, "", now(), "", JSON.stringify(p)]]));
        receipt = reply?.length === 1 ? array(reply[0]) : null;
      } catch { /* No acknowledged retry, no financial mutation. */ }
      if (receipt?.[0] !== "settlement") { counts.unknown++; continue; }
      found = await readConfirmationOrigin(String(id), runtime);
      if (!found || found.row.phase !== "accepted") { counts.unknown++; continue; }
      const settled = preparedMessage(found) && await commitOrderConfirmationSettlement(found.payload.snapshot.store as Store,
        `checkout:${found.row.session}`, found.payload.settlementToken!, found.payload.paidCents!, { now, pipeline });
      if (settled === "committed" || settled === "already") await confirmationMutation("cancel", found, null, runtime);
      counts.unknown++; continue;
    }
    const owner = randomBytes(24).toString("hex");
    const claimed = await confirmationMutation("claim", found, p, runtime, owner);
    if (claimed?.[0] !== "preparing") { counts.unknown++; continue; }
    found = await readConfirmationOrigin(String(id), runtime);
    if (expired() || !found || found.row.owner !== owner || found.row.state !== "preparing") { counts.unknown++; continue; }
    if (!found.row.session) {
      await recoverCreation(found, runtime); // Read-only even after a lost creation ACK.
      const current = await readConfirmationOrigin(String(id), runtime);
      if (current?.row.owner === owner) await confirmationMutation("defer", current, p, runtime, owner);
      counts.waiting++; continue;
    }
    if (found.row.phase === "awaiting_payment") found = await preparePaid(found, p, runtime, owner);
    if (!found || !preparedMessage(found)) {
      const current = await readConfirmationOrigin(String(id), runtime);
      if (current?.row.owner === owner) await confirmationMutation("defer", current, p, runtime, owner);
      counts.waiting++; continue;
    }
    const message = preparedMessage(found)!;
    const settled = await commitOrderConfirmationSettlement(found.payload.snapshot.store as Store,
      `checkout:${found.row.session}`, found.payload.settlementToken!, found.payload.paidCents!, { now, pipeline });
    let barrier = false;
    const beforePost = async () => {
      if (barrier || expired() || !confirmationOutboxPolicy(runtime, false)) return false;
      // A queued email may have waited through a refund. Recheck the original
      // account immediately before its permanent dispatch barrier; never use
      // the old paid checkout status alone as present refund evidence.
      const current = await readProviderSession(found!, found!.row.session, runtime, true);
      if (!current || current.id !== found!.row.session || !knownPhysicalPayment(current) || current.amount_total !== found!.payload.paidCents || expired()) return false;
      const changed = await confirmationMutation("dispatch", found!, p, runtime, owner);
      if (changed?.[0] !== "dispatching") return false;
      const row = parse(changed[1]);
      if (!row || row.owner !== owner) return false;
      found = { ...found!, row, raw: String(changed[1]) }; barrier = true; return true;
    };
    let outcome: Awaited<ReturnType<ShipmentMailDispatch>> = "unknown";
    try { outcome = await dispatch(message, beforePost, { id: found.row.id }); } catch { /* Keep the permanent barrier. */ }
    if (!barrier) {
      await confirmationMutation("defer", found, p, runtime, owner);
      counts.waiting++; continue;
    }
    if (outcome === "accepted" && settled !== "committed" && settled !== "already") {
      try {
        await pipeline([["EVAL", CONFIRMATION_PAID_SCRIPT, 12, ...keys(found.row), keys(found.row)[4], keys(found.row)[9],
          "accepted", found.raw, "", now(), owner, JSON.stringify(p)]]);
      } catch { /* Dispatch barrier and accounting evidence are still retained. */ }
      counts.unknown++; continue;
    }
    if (outcome === "unknown" || outcome === "waiting") { counts.unknown++; continue; }
    const changed = await confirmationMutation(outcome === "accepted" ? "accepted" : outcome === "not_accepted" ? "not-accepted" : "refused", found, p, runtime, owner);
    if (outcome === "accepted" && changed?.[0] === "accepted") counts.accepted++;
    else if (outcome === "not_accepted" && changed?.[0] === "queued") counts.waiting++;
    else counts.unknown++;
  }
  return counts;
}

/** The origin's own indexes are erased; shipment indexes cannot stand in for
 * them. A recipient fence also defeats a concurrent prepayment→paid bind.
 * Never-activated deployments perform no new IO, including during erasure.
 */
export async function forgetOrderConfirmationMail(statsId: string | null | undefined, email?: string, runtime: ShipmentMailRuntime = {}): Promise<number> {
  const lifecycle = runtime.lifecycle ?? CURRENT_SHIPMENT_MAIL_LIFECYCLE;
  if (lifecycle === "never_activated") return 0;
  if (!["active", "retired"].includes(lifecycle)) throw Error("Confirmation cleanup lifecycle is unknown");
  if (!statsId) return 0;
  if (!STORE.test(statsId)) throw Error("Confirmation cleanup owner is unknown");
  const person = email === undefined ? null : hash(email.trim().toLowerCase());
  const index = person === null ? `nl:order-confirmation:store:${statsId}` : `nl:order-confirmation:person:${statsId}:${person}`;
  const fence = person === null ? `nl:ship:mail:closed:${statsId}` : `nl:ship:mail:erased:${statsId}:${person}`;
  const pipeline = runtime.pipeline ?? redisPipeline;
  const guarded = array(await pipeline([["SET", fence, randomBytes(24).toString("hex")]]));
  if (guarded?.length !== 1 || guarded[0] !== "OK") throw Error("Confirmation erasure fence is unknown");
  const got = array(await pipeline([["TYPE", index], ["SCARD", index]]));
  if (!got || !["none", "set"].includes(String(got[0])) || typeof got[1] !== "number" || !Number.isSafeInteger(got[1]) || got[1] < 0 || got[1] > confirmationOriginIndexLimit) throw Error("Confirmation erasure index is unknown");
  const members = got[1] === 0 ? [] : array((await pipeline([["SMEMBERS", index]]))[0], confirmationOriginIndexLimit);
  if (!members || members.some(id => typeof id !== "string" || !HASH.test(id)) || new Set(members).size !== members.length) throw Error("Confirmation erasure index is incomplete");
  let deleted = 0;
  for (const id of members) {
    const found = await readConfirmationOrigin(String(id), runtime);
    if (!found || found.row.statsId !== statsId || person !== null && found.row.person !== person ||
        (await confirmationMutation("cancel", found, null, runtime))?.[0] !== "canceled") throw Error("Confirmation erasure is unknown");
    deleted++;
  }
  const finished = array(await pipeline([["PEXPIRE", fence, SHIPMENT_MAIL_ERASURE_FENCE_MS]]));
  if (finished?.length !== 1 || finished[0] !== 1) throw Error("Confirmation erasure completion is unknown");
  return deleted;
}
