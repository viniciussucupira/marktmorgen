/**
 * A paid, account-wide Resend fallback budget. This module sends no email.
 * GET /usage counts sent AND received in the actual billing period; it does
 * not itself disable paid overages or exclude other keys/SMTP/inbound traffic.
 * Sources checked November 1, 2026:
 * https://resend.com/changelog/account-usage-api
 * https://github.com/resend/resend-openapi/blob/main/resend.yaml
 * https://resend.com/pricing
 *
 * The real review is deliberately absent. A send caller must bind accountId
 * to the authenticated provider read, reserve, then obtain the one-time
 * dispatch receipt before POST. Neither a repeated reservation nor an
 * unknown Redis response authorizes POST. Do not translate sendEmail(false)
 * into confirmed_not_accepted: false can conceal uncertain acceptance.
 */
import { createHash, randomBytes } from "node:crypto";

export const RESEND_FALLBACK_MAX_EMAILS = 50_000;
export const RESEND_FALLBACK_USAGE_MAX_AGE_MS = 60_000;
export const RESEND_FALLBACK_DISPATCH_MS = 1_000;
export const CURRENT_RESEND_FALLBACK_REVIEW: ResendFallbackReview | null = null;

export type ResendFallbackReview = {
  schema: 1;
  reviewId: string;
  accountId: string;
  paidPlan: "Pro";
  paidForPeriod: true;
  includedEmails: number;
  periodStartMs: number;
  resetsAtMs: number;
  checkedAtMs: number;
  validUntilMs: number;
  evidence: string;
  protection:
    | { kind: "inclusive_provider_hard_cap"; sentAndReceived: true; overagesDisabled: true; capEmails: number; evidence: string }
    | { kind: "isolated_account"; allSendersUseThisLedger: true; smtpDisabled: true; receivingDisabled: true; otherSendingPathsDisabled: true; evidence: string };
  /** Initialization is a separately reviewed action, never a missing-key default. */
  bootstrap?: { noUnresolvedPriorAttempts: true; allPriorUsageIncluded: true; evidence: string };
  /** A new resets_at alone cannot erase the preceding ledger. */
  previousPeriod?: { startMs: number; resetsAtMs: number; used: number; sent: number; received: number; providerPeriodClosed: true; noUnaccountedScheduledActivity: true; confirmedAtMs: number; evidence: string };
};
export type ResendFallbackUsage = {
  source: "resend_usage_api";
  accountId: string;
  observedAtMs: number;
  monthly: { used: number; sent: number; received: number; limit: number; resetsAt: string };
};
export type ResendFallbackSdk = { pipeline(commands: (string | number)[][]): Promise<unknown> };
export type ResendFallbackClaim = {
  accountId: string;
  attemptId: string;
  token: string;
  recipients: number;
  periodStartMs: number;
  resetsAtMs: number;
  validUntilMs: number;
};
type Stopped = { status: "denied"; reason: string } | { status: "unknown" };
export type ResendFallbackReservation = Stopped | { status: "reserved" | "already_reserved"; claim: ResendFallbackClaim };
export type ResendFallbackDispatch = Stopped | { status: "dispatch"; claim: ResendFallbackClaim; sendBeforeMs: number };
export type ResendFallbackOutcome = "accepted" | "confirmed_not_accepted" | "unknown";
export type ResendFallbackSettlement = Stopped | { status: "settled" | "already_settled"; outcome: ResendFallbackOutcome };

/**
 * Two keys share an account hash tag, including on Redis Cluster. The ledger
 * has no TTL; pending/uncertain claims have none either. Final claims expire
 * after 35 days and are never refreshed on replay. At most 50,000 new claims
 * per reviewed billing period are admitted, even after known refusals, so
 * repeated refusals cannot grow stored tombstones without a bound.
 *
 * seenUsed, local accepted spend and pending reservations are intentionally
 * added conservatively: an observation may already include local accepts.
 * This may defer fallback sooner; it never releases estimated savings.
 */
export const RESEND_FALLBACK_BUDGET_LUA = `-- marktmorgen:resend-fallback-budget:v1
local op, account, token = ARGV[1], ARGV[2], ARGV[3]
local function integer(v)
 if type(v)~='string' or not string.match(v,'^%d+$') then return nil end
 local n=tonumber(v)
 if not n or n<0 or n>9007199254740991 or n~=math.floor(n) then return nil end
 return n
end
local function text(n) return string.format('%.0f',n) end
local function no(reason) return {'denied',reason} end
local now=integer(ARGV[7])
if not now or not string.match(account,'^[a-f0-9]+$') or #account~=64 then return no('arguments') end
local kind=redis.call('TYPE',KEYS[1]).ok
local ledger=nil
if kind~='none' then
 if kind~='hash' or redis.call('TTL',KEYS[1])~=-1 then return no('ledger_shape') end
 ledger=redis.call('HMGET',KEYS[1],'schema','account','start','reset','seenAt','seenUsed','spent','held','attempts','cap')
 if ledger[1]~='1' or ledger[2]~=account then return no('ledger_identity') end
 for i=3,10 do ledger[i]=integer(ledger[i]); if not ledger[i] then return no('ledger_shape') end end
 if ledger[3]>=ledger[4] or ledger[7]>50000 or ledger[8]>50000 or ledger[9]>50000 or ledger[10]<1 or ledger[10]>50000 then return no('ledger_shape') end
end
if op=='initialize' or op=='reserve' then
 local start,reset,untilAt,cap,seenAt,seenUsed=integer(ARGV[5]),integer(ARGV[6]),integer(ARGV[8]),integer(ARGV[9]),integer(ARGV[10]),integer(ARGV[11])
 local sent,received=integer(ARGV[12]),integer(ARGV[13])
 if not start or not reset or not untilAt or not cap or not seenAt or not seenUsed or not sent or not received or cap<1 or cap>50000 or start>=reset or now<start or now>=reset or untilAt<=now or seenAt>now or now-seenAt>60000 or seenAt<start or sent>seenUsed or received~=seenUsed-sent then return no('arguments') end
 if op=='initialize' then
  if ledger then return {'already_initialized'} end
  if ARGV[20]~='bootstrap_reviewed' then return no('unreviewed_bootstrap') end
  if seenUsed>cap then return no('exhausted') end
  redis.call('HSET',KEYS[1],'schema','1','account',account,'start',ARGV[5],'reset',ARGV[6],'seenAt',ARGV[10],'seenUsed',ARGV[11],'spent','0','held','0','attempts','0','cap',ARGV[9])
  return {'initialized'}
 end
 if not ledger then return no('uninitialized') end
 local units=integer(ARGV[4])
 if not units or units<1 or units>100 or not string.match(token,'^[a-f0-9]+$') or #token~=32 then return no('arguments') end
 if start~=ledger[3] or reset~=ledger[4] then
  local priorStart,priorReset,finalUsed,finalAt=integer(ARGV[15]),integer(ARGV[16]),integer(ARGV[17]),integer(ARGV[18])
  if ARGV[20]~='period_closed' or not priorStart or not priorReset or not finalUsed or not finalAt or priorStart~=ledger[3] or priorReset~=ledger[4] or start~=priorReset or now<priorReset or finalAt<priorReset or finalAt>seenAt or finalUsed<ledger[6] or finalUsed<ledger[7] or finalUsed>ledger[10] then return no('unreviewed_reset') end
  -- Unresolved attempts may be billed after the reset; carry their whole hold.
  redis.call('HSET',KEYS[1],'start',ARGV[5],'reset',ARGV[6],'seenAt',ARGV[10],'seenUsed',ARGV[11],'spent','0','attempts','0','cap',ARGV[9])
  ledger[3],ledger[4],ledger[5],ledger[6],ledger[7],ledger[9],ledger[10]=start,reset,seenAt,seenUsed,0,0,cap
 else
  if seenAt<ledger[5] or seenUsed<ledger[6] then return no('usage_regressed') end
  cap=math.min(cap,ledger[10])
  redis.call('HSET',KEYS[1],'seenAt',ARGV[10],'seenUsed',ARGV[11],'cap',text(cap))
  ledger[5],ledger[6],ledger[10]=seenAt,seenUsed,cap
 end
 local claimKind=redis.call('TYPE',KEYS[2]).ok
 local rearm=false
 if claimKind~='none' then
  if claimKind~='hash' then return no('claim_shape') end
  local old=redis.call('HMGET',KEYS[2],'account','token','units','start','reset','until','state')
  if old[1]~=account or integer(old[3])~=units then return no('claim_conflict') end
  if old[7]=='reserved' then
   if redis.call('TTL',KEYS[2])~=-1 then return no('claim_shape') end
   return {'already_reserved',old[2],old[3],old[4],old[5],old[6]}
  end
  if old[7]=='released' then rearm=true
  else return no(old[7]=='accepted' and 'completed' or 'already_dispatched') end
 end
 if ledger[9]>=50000 then return no('attempt_capacity') end
 if ledger[6]>cap or ledger[7]+ledger[8]+units>cap-ledger[6] then return no('exhausted') end
 redis.call('HINCRBY',KEYS[1],'held',units)
 redis.call('HINCRBY',KEYS[1],'attempts',1)
 redis.call('HSET',KEYS[2],'account',account,'token',token,'units',ARGV[4],'start',ARGV[5],'reset',ARGV[6],'until',ARGV[8],'state','reserved')
 if rearm then redis.call('PERSIST',KEYS[2]) end
 return {'reserved',token,ARGV[4],ARGV[5],ARGV[6],ARGV[8]}
end
if not ledger then return no('uninitialized') end
if redis.call('TYPE',KEYS[2]).ok~='hash' then return no('claim_missing') end
local claim=redis.call('HMGET',KEYS[2],'account','token','units','start','reset','until','state')
local units,start,reset,untilAt=integer(claim[3]),integer(claim[4]),integer(claim[5]),integer(claim[6])
if claim[1]~=account or claim[2]~=token or not units or units~=integer(ARGV[4]) or not start or start~=integer(ARGV[5]) or not reset or reset~=integer(ARGV[6]) or not untilAt or untilAt~=integer(ARGV[8]) then return no('claim_conflict') end
if claim[7]=='accepted' then return {'already_settled','accepted'} end
if claim[7]=='released' then return {'already_settled','confirmed_not_accepted'} end
if claim[7]~='reserved' and claim[7]~='dispatched' and claim[7]~='unknown' or redis.call('TTL',KEYS[2])~=-1 then return no('claim_shape') end
if op=='dispatch' then
 if claim[7]~='reserved' then return no('already_dispatched') end
 if now>=untilAt or now>=reset or start~=ledger[3] or reset~=ledger[4] then return no('expired') end
 if ledger[6]>ledger[10] or ledger[7]+ledger[8]>ledger[10]-ledger[6] then return no('exhausted') end
 local deadline=math.min(now+1000,untilAt,reset)
 redis.call('HSET',KEYS[2],'state','dispatched')
 return {'dispatch',token,claim[3],text(deadline)}
end
if op~='settle' then return no('operation') end
local outcome=ARGV[19]
if outcome=='unknown' then
 if claim[7]=='reserved' then return no('not_dispatched') end
 redis.call('HSET',KEYS[2],'state','unknown')
 return {'settled','unknown'}
end
if outcome~='accepted' and outcome~='confirmed_not_accepted' then return no('outcome') end
if outcome=='accepted' and (claim[7]=='reserved' or now>=ledger[4]) then return no('unreviewed_acceptance_period') end
if ledger[8]<units then return no('ledger_shape') end
-- Redis scripts do not roll back preceding writes after a runtime error.
-- Mark the terminal state first, then add spend before releasing the hold.
-- An interrupted settlement may over-reserve, never release twice or lose spend.
redis.call('HSET',KEYS[2],'state',outcome=='accepted' and 'accepted' or 'released')
redis.call('EXPIRE',KEYS[2],35*86400)
if outcome=='accepted' then redis.call('HINCRBY',KEYS[1],'spent',units) end
redis.call('HINCRBY',KEYS[1],'held',-units)
return {'settled',outcome}`;

const denied = (reason: string): Stopped => ({ status: "denied", reason });
const unknown = (): Stopped => ({ status: "unknown" });
const own = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor && "value" in descriptor ? descriptor.value : undefined;
};
const integer = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const label = (value: unknown): value is string => typeof value === "string" && /^[A-Za-z0-9:_./-]{1,160}$/.test(value);
const evidence = (value: unknown): value is string => typeof value === "string" && value.trim().length >= 3 && value.length <= 2_000;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export function resendFallbackBudgetKeys(accountId: string, attemptId: string): [string, string] {
  const account = digest(accountId);
  return [`nl:resend-budget:{${account}}:ledger`, `nl:resend-budget:{${account}}:claim:${digest(attemptId)}`];
}
type Parsed = { accountId: string; start: number; reset: number; validUntil: number; cap: number; seenAt: number; used: number; sent: number; received: number; bootstrap: boolean; prior: number[] };
function parse(review: unknown, usage: unknown, now: number): Parsed | null {
  try {
    const accountId = own(review, "accountId");
    if (!integer(now) || own(review, "schema") !== 1 || !label(own(review, "reviewId")) || !label(accountId) || own(review, "paidPlan") !== "Pro" || own(review, "paidForPeriod") !== true || !evidence(own(review, "evidence"))) return null;
    const start = own(review, "periodStartMs"), reset = own(review, "resetsAtMs"), checked = own(review, "checkedAtMs"), validUntil = own(review, "validUntilMs"), included = own(review, "includedEmails");
    if (![start, reset, checked, validUntil, included].every(integer) || !integer(start) || !integer(reset) || !integer(checked) || !integer(validUntil) || !integer(included) || included < 1 || start >= reset || reset - start < 20 * 86_400_000 || reset - start > 40 * 86_400_000 || now < start || now >= reset || checked > now || validUntil <= now || validUntil > reset) return null;
    const protection = own(review, "protection");
    if (!evidence(own(protection, "evidence"))) return null;
    const protectionKind = own(protection, "kind");
    let protectionCap = RESEND_FALLBACK_MAX_EMAILS;
    if (protectionKind === "inclusive_provider_hard_cap") {
      const hard = own(protection, "capEmails");
      if (own(protection, "sentAndReceived") !== true || own(protection, "overagesDisabled") !== true || !integer(hard) || hard < 1) return null;
      protectionCap = hard;
    } else if (protectionKind === "isolated_account") {
      if (["allSendersUseThisLedger", "smtpDisabled", "receivingDisabled", "otherSendingPathsDisabled"].some(key => own(protection, key) !== true)) return null;
    } else return null;
    if (own(usage, "source") !== "resend_usage_api" || own(usage, "accountId") !== accountId) return null;
    const seenAt = own(usage, "observedAtMs"), monthly = own(usage, "monthly");
    const used = own(monthly, "used"), sent = own(monthly, "sent"), received = own(monthly, "received"), limit = own(monthly, "limit"), resetsAt = own(monthly, "resetsAt");
    if (!integer(seenAt) || seenAt < checked || seenAt < start || seenAt > now || now - seenAt > RESEND_FALLBACK_USAGE_MAX_AGE_MS || !integer(used) || !integer(sent) || !integer(received) || !integer(limit) || limit < 1 || sent > used || received !== used - sent || typeof resetsAt !== "string" || resetsAt.length > 30 || Date.parse(resetsAt) !== reset || new Date(reset).toISOString() !== resetsAt) return null;
    const cap = Math.min(RESEND_FALLBACK_MAX_EMAILS, included, limit);
    // A provider hard cap above the included quota is not sufficient protection.
    if (protectionKind === "inclusive_provider_hard_cap" && protectionCap > cap) return null;
    const bootstrap = own(review, "bootstrap");
    const boot = own(bootstrap, "noUnresolvedPriorAttempts") === true && own(bootstrap, "allPriorUsageIncluded") === true && evidence(own(bootstrap, "evidence"));
    const previous = own(review, "previousPeriod");
    let prior = [0, 0, 0, 0];
    if (previous !== undefined) {
      const ps = own(previous, "startMs"), pr = own(previous, "resetsAtMs"), pu = own(previous, "used"), sentBefore = own(previous, "sent"), receivedBefore = own(previous, "received"), confirmed = own(previous, "confirmedAtMs");
      if (!integer(ps) || !integer(pr) || !integer(pu) || !integer(sentBefore) || !integer(receivedBefore) || !integer(confirmed) || ps >= pr || pr !== start || sentBefore > pu || receivedBefore !== pu - sentBefore || confirmed < pr || confirmed > seenAt || own(previous, "providerPeriodClosed") !== true || own(previous, "noUnaccountedScheduledActivity") !== true || !evidence(own(previous, "evidence"))) return null;
      prior = [ps, pr, pu, confirmed];
    }
    return { accountId, start, reset, validUntil, cap: Math.min(cap, protectionCap), seenAt, used, sent, received, bootstrap: !!boot, prior };
  } catch { return null; }
}
function claimData(value: unknown): ResendFallbackClaim | null {
  try {
    const accountId = own(value, "accountId"), attemptId = own(value, "attemptId"), token = own(value, "token"), recipients = own(value, "recipients"), start = own(value, "periodStartMs"), reset = own(value, "resetsAtMs"), until = own(value, "validUntilMs");
    if (!label(accountId) || !label(attemptId) || typeof token !== "string" || !/^[a-f0-9]{32}$/.test(token) || !integer(recipients) || recipients < 1 || recipients > 100 || !integer(start) || !integer(reset) || !integer(until) || start >= reset || until > reset || until <= start) return null;
    return { accountId, attemptId, token, recipients, periodStartMs: start, resetsAtMs: reset, validUntilMs: until };
  } catch { return null; }
}
function arrayData(value: unknown): unknown[] | null {
  if (!Array.isArray(value)) return null;
  const length = Object.getOwnPropertyDescriptor(value, "length");
  if (!length || !("value" in length) || !integer(length.value) || length.value > 6) return null;
  const copy: unknown[] = [];
  for (let index = 0; index < length.value; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !("value" in descriptor)) return null;
    copy.push(descriptor.value);
  }
  return copy;
}
async function execute(sdk: ResendFallbackSdk, accountId: string, attemptId: string, args: (string | number)[]): Promise<unknown[] | null> {
  try {
    const reply = arrayData(await sdk.pipeline([["EVAL", RESEND_FALLBACK_BUDGET_LUA, 2, ...resendFallbackBudgetKeys(accountId, attemptId), ...args]]));
    return reply?.length === 1 ? arrayData(reply[0]) : null;
  } catch { return null; }
}
const stoppedReply = (reply: unknown[] | null): Stopped => reply?.length === 2 && reply[0] === "denied" && typeof reply[1] === "string" && /^[a-z_]{1,80}$/.test(reply[1]) ? denied(reply[1]) : unknown();
const asInteger = (value: unknown): number | null => typeof value === "string" && /^(0|[1-9][0-9]{0,15})$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : null;
function argsFor(op: string, data: Parsed, attemptId: string, token: string, recipients: number, now: number): (string | number)[] {
  return [op, digest(data.accountId), token, recipients, data.start, data.reset, now, data.validUntil, data.cap, data.seenAt, data.used, data.sent, data.received, digest(attemptId), ...data.prior, "", data.prior[1] ? "period_closed" : ""];
}
export async function initializeResendFallbackBudget(input: { review?: unknown; usage: unknown }, sdk: ResendFallbackSdk): Promise<Stopped | { status: "initialized" | "already_initialized" }> {
  let data: Parsed | null;
  const now = Date.now();
  try { data = parse(own(input, "review") ?? CURRENT_RESEND_FALLBACK_REVIEW, own(input, "usage"), now); } catch { data = null; }
  if (!data || !data.bootstrap) return denied("unreviewed_bootstrap");
  const args = argsFor("initialize", data, "bootstrap", "", 0, now); args[19] = "bootstrap_reviewed";
  const reply = await execute(sdk, data.accountId, "bootstrap", args);
  return reply?.length === 1 && (reply[0] === "initialized" || reply[0] === "already_initialized") ? { status: reply[0] } : stoppedReply(reply);
}
export async function reserveResendFallback(input: { review?: unknown; usage: unknown; attemptId: string; recipients: number }, sdk: ResendFallbackSdk): Promise<ResendFallbackReservation> {
  const now = Date.now();
  let data: Parsed | null, attemptId: unknown, recipients: unknown;
  try { data = parse(own(input, "review") ?? CURRENT_RESEND_FALLBACK_REVIEW, own(input, "usage"), now); attemptId = own(input, "attemptId"); recipients = own(input, "recipients"); } catch { return denied("unreviewed_account"); }
  if (!data || !label(attemptId) || !integer(recipients) || recipients < 1 || recipients > 100) return denied("unreviewed_account");
  const token = randomBytes(16).toString("hex");
  const reply = await execute(sdk, data.accountId, attemptId, argsFor("reserve", data, attemptId, token, recipients, now));
  if (reply?.length !== 6 || reply[0] !== "reserved" && reply[0] !== "already_reserved") return stoppedReply(reply);
  const claim = claimData({ accountId: data.accountId, attemptId, token: reply[1], recipients: asInteger(reply[2]), periodStartMs: asInteger(reply[3]), resetsAtMs: asInteger(reply[4]), validUntilMs: asInteger(reply[5]) });
  if (!claim || claim.recipients !== recipients || reply[0] === "reserved" && (claim.token !== token || claim.periodStartMs !== data.start || claim.resetsAtMs !== data.reset || claim.validUntilMs !== data.validUntil)) return unknown();
  return { status: reply[0], claim };
}
const claimArgs = (op: string, claim: ResendFallbackClaim, now: number, outcome = "") => [op, digest(claim.accountId), claim.token, claim.recipients, claim.periodStartMs, claim.resetsAtMs, now, claim.validUntilMs, 0, 0, 0, 0, 0, digest(claim.attemptId), 0, 0, 0, 0, outcome, ""];
export async function markResendFallbackDispatched(value: ResendFallbackClaim, sdk: ResendFallbackSdk): Promise<ResendFallbackDispatch> {
  const claim = claimData(value), now = Date.now();
  if (!claim || !integer(now) || now < claim.periodStartMs || now >= claim.validUntilMs || now >= claim.resetsAtMs) return denied("expired");
  const reply = await execute(sdk, claim.accountId, claim.attemptId, claimArgs("dispatch", claim, now));
  const deadline = reply?.length === 4 ? asInteger(reply[3]) : null;
  if (reply?.[0] !== "dispatch" || reply[1] !== claim.token || asInteger(reply[2]) !== claim.recipients || deadline === null || deadline <= now || deadline > Math.min(now + RESEND_FALLBACK_DISPATCH_MS, claim.validUntilMs, claim.resetsAtMs)) return stoppedReply(reply);
  return { status: "dispatch", claim, sendBeforeMs: deadline };
}
export async function settleResendFallback(value: ResendFallbackClaim, outcome: ResendFallbackOutcome, sdk: ResendFallbackSdk): Promise<ResendFallbackSettlement> {
  const claim = claimData(value), now = Date.now();
  if (!claim || !integer(now) || !["accepted", "confirmed_not_accepted", "unknown"].includes(outcome)) return denied("arguments");
  const reply = await execute(sdk, claim.accountId, claim.attemptId, claimArgs("settle", claim, now, outcome));
  if (reply?.length === 2 && (reply[0] === "settled" && reply[1] === outcome || reply[0] === "already_settled" && (reply[1] === "accepted" || reply[1] === "confirmed_not_accepted"))) return { status: reply[0], outcome: reply[1] as ResendFallbackOutcome };
  return stoppedReply(reply);
}
