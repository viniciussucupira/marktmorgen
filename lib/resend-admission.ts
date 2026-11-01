/**
 * Atomic admission to the paid Resend fallback.
 * This module is deliberately not wired to a sender yet. No bootstrap API
 * exists: a reviewed fence of every sender, receiving exposure and retained
 * claim storage must establish the ledger before any grant is possible.
 * Calendar months and old post-send counters are not such evidence.
 */
import { createHash, randomBytes } from "node:crypto";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";

export const RESEND_INCLUDED_EMAILS = 50_000;
export const RESEND_ADMISSION_KEY = "nl:resend:admission:v1";
export type ResendBillingWindow = { from: number; until: number; proof: string };
export type ResendPermit = {
  id: string; digest: string; recipients: number; owner: string;
  window: ResendBillingWindow;
};
export type ResendAdmission =
  | { ok: true; permit: ResendPermit }
  | { ok: false; reason: "invalid" | "uninitialized" | "quota" | "claimed" | "storage" | "unknown" };

/**
 * One hash makes counter+claim changes a single HSET, including refund.
 * Missing or malformed evidence never bootstraps a zero counter.
 * Billed worst path: EVAL + TYPE + HMGET + HGET + HSET = 5 commands.
 * The fixed 50,000 retained-claim pool is also a hard storage-work bound.
 * No claim expires automatically; a reviewed lifecycle remains a prerequisite.
 */
export const RESEND_ADMIT = `-- marktmorgen:resend-admission:v1
local kind=redis.call('TYPE',KEYS[1])
if type(kind)=='table' then kind=kind.ok end
if kind=='none' then return {-3} end
if kind~='hash' then return {-4} end
local v=redis.call('HMGET',KEYS[1],'version','from','until','proof','coverage','storage','used','claims')
local function number(s,max)
 if type(s)~='string' or not string.match(s,'^%d+$') or (#s>1 and string.sub(s,1,1)=='0') then return nil end
 local n=tonumber(s)
 if not n or n<0 or n>max or n~=math.floor(n) then return nil end
 return n
end
local used=number(v[7],50000)
local count=number(v[8],50000)
if v[1]~='1' or v[2]~=ARGV[1] or v[3]~=ARGV[2] or v[4]~=ARGV[3] or v[5]~='fenced-all-usage' or v[6]~='funded-50000-retained-claims' or not used or not count then return {-3} end
local now=number(ARGV[4],8640000000000000)
local start=number(ARGV[1],8640000000000000)
local finish=number(ARGV[2],8640000000000000)
local n=number(ARGV[5],100)
if not now or not start or not finish or not n or n<1 or finish<=start or now<start or now>=finish then return {-4} end
local field='claim:'..ARGV[6]
local raw=redis.call('HGET',KEYS[1],field)
if raw then
 if type(raw)~='string' or #raw>300 then return {-4} end
 local parts={}
 for item in string.gmatch(raw..'|','([^|]*)|') do table.insert(parts,item) end
 if #parts~=7 or parts[1]~='1' or parts[3]~=ARGV[5] or parts[4]~=ARGV[7] then return {-4} end
 if parts[2]~='refused' then return {-2} end
 if parts[7]==ARGV[8] then return {-2} end
else
 if count>=50000 then return {-5} end
 count=count+1
end
if n>50000-used then return {0} end
local claim='1|held|'..ARGV[5]..'|'..ARGV[7]..'|'..ARGV[1]..'|'..ARGV[2]..'|'..ARGV[8]
redis.call('HSET',KEYS[1],'used',tostring(used+n),'claims',tostring(count),field,claim)
return {1,ARGV[8]}
`;

export const RESEND_SETTLE = `-- marktmorgen:resend-settle:v1
local kind=redis.call('TYPE',KEYS[1])
if type(kind)=='table' then kind=kind.ok end
if kind~='hash' then return {0} end
local field='claim:'..ARGV[1]
local raw=redis.call('HGET',KEYS[1],field)
if type(raw)~='string' or #raw>300 then return {0} end
local p={}
for item in string.gmatch(raw..'|','([^|]*)|') do table.insert(p,item) end
if #p~=7 or p[1]~='1' or p[3]~=ARGV[2] or p[4]~=ARGV[3] or p[5]~=ARGV[4] or p[6]~=ARGV[5] or p[7]~=ARGV[6] then return {0} end
local outcome=ARGV[7]
if outcome~='sent' and outcome~='uncertain' and outcome~='refused' then return {0} end
if p[2]==outcome then return {1} end
if p[2]~='held' then return {0} end
if outcome=='refused' then
 local v=redis.call('HMGET',KEYS[1],'version','from','until','proof','coverage','storage','used')
 if v[1]~='1' or v[2]~=ARGV[4] or v[3]~=ARGV[5] or v[4]~=ARGV[8] or v[5]~='fenced-all-usage' or v[6]~='funded-50000-retained-claims' then return {0} end
 local s=v[7]
 if type(s)~='string' or not string.match(s,'^%d+$') or (#s>1 and string.sub(s,1,1)=='0') then return {0} end
 local used=tonumber(s)
 local n=tonumber(ARGV[2])
 if not used or used>50000 or not n or n<1 or n>100 or used<n then return {0} end
 local claim='1|refused|'..p[3]..'|'..p[4]..'|'..p[5]..'|'..p[6]..'|'..p[7]
 redis.call('HSET',KEYS[1],'used',tostring(used-n),field,claim)
else
 local claim='1|'..outcome..'|'..p[3]..'|'..p[4]..'|'..p[5]..'|'..p[6]..'|'..p[7]
 redis.call('HSET',KEYS[1],field,claim)
end
return {1}
`;

function own(value: unknown, keys: string[]): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (![Object.prototype, null].includes(Object.getPrototypeOf(value))) return null;
  const result: Record<string, unknown> = Object.create(null);
  for (const name of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    if (!descriptor || !("value" in descriptor)) return null;
    result[name] = descriptor.value;
  }
  return result;
}
function windowOf(value: unknown): ResendBillingWindow | null {
  const v = own(value, ["from", "until", "proof"]);
  if (!v || typeof v.from !== "number" || typeof v.until !== "number" ||
      !Number.isSafeInteger(v.from) || !Number.isSafeInteger(v.until) ||
      v.from < 0 || v.until > 8_640_000_000_000_000 || v.until <= v.from ||
      v.until - v.from > 32 * 86_400_000 ||
      typeof v.proof !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(v.proof)) return null;
  return { from: v.from, until: v.until, proof: v.proof };
}
function replyOf(value: unknown): unknown[] | null {
  if (!Array.isArray(value) || value.length !== 1) return null;
  const d = Object.getOwnPropertyDescriptor(value, "0");
  if (!d || !("value" in d) || !Array.isArray(d.value) || d.value.length < 1 || d.value.length > 2) return null;
  const out: unknown[] = [];
  for (let i = 0; i < d.value.length; i++) {
    const item = Object.getOwnPropertyDescriptor(d.value, String(i));
    if (!item || !("value" in item)) return null;
    out.push(item.value);
  }
  return out;
}
/** Exactly one caller can receive a fresh permit for a logical message. */
export async function reserveResend(value: {
  id: string; digest: string; recipients: number; window: ResendBillingWindow;
}, now = Date.now()): Promise<ResendAdmission> {
  try {
    const v = own(value, ["id", "digest", "recipients", "window"]);
    const window = windowOf(v?.window);
    if (!v || !window || typeof v.id !== "string" || !v.id || v.id.length > 512 ||
        typeof v.digest !== "string" || !/^[a-f0-9]{64}$/.test(v.digest) ||
        typeof v.recipients !== "number" || !Number.isSafeInteger(v.recipients) || v.recipients < 1 || v.recipients > 100 ||
        !Number.isSafeInteger(now) || now < window.from || now >= window.until) return { ok: false, reason: "invalid" };
    if (!isRedisConfigured()) return { ok: false, reason: "unknown" };
    const id = createHash("sha256").update(v.id).digest("hex");
    const owner = randomBytes(32).toString("hex");
    const reply = replyOf(await redisPipeline([["EVAL", RESEND_ADMIT, 1, RESEND_ADMISSION_KEY,
      window.from, window.until, window.proof, now, v.recipients, id, v.digest, owner]]));
    if (reply?.length === 2 && reply[0] === 1 && reply[1] === owner) {
      return { ok: true, permit: { id, digest: v.digest, recipients: v.recipients, owner, window } };
    }
    const reason = reply?.length === 1 ?
      reply[0] === 0 ? "quota" : reply[0] === -2 ? "claimed" : reply[0] === -3 ? "uninitialized" : reply[0] === -5 ? "storage" : "unknown"
      : "unknown";
    return { ok: false, reason };
  } catch { return { ok: false, reason: "unknown" }; }
}
/** Only a confirmed refusal releases quota; uncertainty retains it permanently. */
export async function settleResend(value: ResendPermit, outcome: "sent" | "uncertain" | "refused"): Promise<boolean> {
  try {
    const v = own(value, ["id", "digest", "recipients", "owner", "window"]);
    const window = windowOf(v?.window);
    if (!v || !window || !["sent", "uncertain", "refused"].includes(outcome) ||
        typeof v.id !== "string" || !/^[a-f0-9]{64}$/.test(v.id) ||
        typeof v.digest !== "string" || !/^[a-f0-9]{64}$/.test(v.digest) ||
        typeof v.owner !== "string" || !/^[a-f0-9]{64}$/.test(v.owner) ||
        typeof v.recipients !== "number" || !Number.isSafeInteger(v.recipients) || v.recipients < 1 || v.recipients > 100 ||
        !isRedisConfigured()) return false;
    const reply = replyOf(await redisPipeline([["EVAL", RESEND_SETTLE, 1, RESEND_ADMISSION_KEY,
      v.id, v.recipients, v.digest, window.from, window.until, v.owner, outcome, window.proof]]));
    return reply?.length === 1 && reply[0] === 1;
  } catch { return false; }
}
