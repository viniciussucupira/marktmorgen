/**
 * LE448 record transitions only. No Redis, email, account or provider I/O.
 * Plans must later be applied with funded admission + compare-and-set/outbox;
 * a validated record or token never authorizes those operations by itself.
 */
import { createHash, randomBytes } from "node:crypto";
import { EMAIL_PATTERN, MAX_EMAIL_LENGTH, normaliseEmail } from "@/lib/auth";
import { WAIT_SECONDS } from "@/lib/waitlist-rules";
import { parsePlatformWaitlistGrant, type PlatformWaitlistGrant } from "@/lib/waitlist-tokens";

export type IntendedPlan = "store" | "studio" | "scale" | "not_sure" | null;
export type PlatformWaitlistEntry = {
  version: 1; entryId: string; generation: string;
  state: "pending" | "confirmed" | "left";
  email: string | null; plan: IntendedPlan; country: string | null;
  requestedAt: number; confirmedAt: number | null; leftAt: number | null;
  updatedAt: number; retainedUntil: number;
  consent: { version: string; text: string; newsVersion: string; newsText: string; newsRequested: boolean };
  consentDigest: string;
};
export type WaitlistTransition = {
  expected: string | null; next: PlatformWaitlistEntry; changed: boolean;
};
const clock = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
const version = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9._-]{1,64}$/.test(v);
const text = (v: unknown): v is string => typeof v === "string" && !!v.trim() && Buffer.byteLength(v,"utf8") <= 2048;
const plan = (v: unknown): v is IntendedPlan => v === null || ["store","studio","scale","not_sure"].includes(v as string);
const country = (v: unknown): v is string | null => v === null ||
  (typeof v === "string" && !!v && v.trim() === v && Buffer.byteLength(v,"utf8") <= 160 && !/[\x00-\x1f\x7f]/.test(v));
const identity = (email: string) => createHash("sha256").update("marktmorgen:platform-waitlist:v1:" + email).digest("hex");
function digest(entry: Pick<PlatformWaitlistEntry,"requestedAt" | "consent">): string {
  const c = entry.consent;
  return createHash("sha256").update(JSON.stringify([
    c.version,c.text,c.newsVersion,c.newsText,c.newsRequested,entry.requestedAt,
  ])).digest("hex");
}
/** An absent read must be exactly null; undefined/corrupt data is not absence. */
export function parsePlatformWaitlistEntry(raw: unknown): PlatformWaitlistEntry | null {
  if (typeof raw !== "string" || Buffer.byteLength(raw,"utf8") > 16384) return null;
  try {
    const e = JSON.parse(raw);
    if (!e || typeof e !== "object" || Array.isArray(e) || e.version !== 1 ||
        typeof e.entryId !== "string" || !/^[0-9a-f]{64}$/.test(e.entryId) ||
        typeof e.generation !== "string" || !/^[0-9a-f]{32}$/.test(e.generation) ||
        !["pending","confirmed","left"].includes(e.state) || !plan(e.plan) || !country(e.country) ||
        !clock(e.requestedAt) || !clock(e.updatedAt) || !clock(e.retainedUntil) ||
        e.updatedAt < e.requestedAt || e.retainedUntil <= e.updatedAt ||
        e.retainedUntil - e.requestedAt > WAIT_SECONDS ||
        (e.confirmedAt !== null && (!clock(e.confirmedAt) || e.confirmedAt < e.requestedAt || e.confirmedAt > e.updatedAt)) ||
        (e.leftAt !== null && (!clock(e.leftAt) || e.leftAt < e.requestedAt || e.leftAt > e.updatedAt))) return null;
    if (e.state === "left") {
      if (e.email !== null || e.plan !== null || e.country !== null || e.leftAt === null) return null;
    } else {
      if (typeof e.email !== "string" || e.email.length > MAX_EMAIL_LENGTH ||
          !EMAIL_PATTERN.test(e.email) || normaliseEmail(e.email) !== e.email ||
          identity(e.email) !== e.entryId || e.leftAt !== null) return null;
    }
    if ((e.state === "pending" && e.confirmedAt !== null) || (e.state === "confirmed" && e.confirmedAt === null)) return null;
    const c = e.consent;
    if (!c || typeof c !== "object" || Array.isArray(c) || !version(c.version) || !text(c.text) ||
        !version(c.newsVersion) || !text(c.newsText) || typeof c.newsRequested !== "boolean" ||
        typeof e.consentDigest !== "string" || digest(e) !== e.consentDigest) return null;
    return {
      version:1,entryId:e.entryId,generation:e.generation,state:e.state,email:e.email,
      plan:e.plan,country:e.country,requestedAt:e.requestedAt,confirmedAt:e.confirmedAt,
      leftAt:e.leftAt,updatedAt:e.updatedAt,retainedUntil:e.retainedUntil,
      consent:{version:c.version,text:c.text,newsVersion:c.newsVersion,newsText:c.newsText,newsRequested:c.newsRequested},
      consentDigest:e.consentDigest,
    };
  } catch { return null; }
}
export type WaitlistRequest = {
  email: string; plan: IntendedPlan; country: string | null;
  consent: PlatformWaitlistEntry["consent"];
  explicitRequest: boolean; now: number; retainedUntil: number;
};
/** Only an explicit fresh request can create/re-enter pending state.
 * This does not approve the supplied retention cost or generate/send a link.
 */
export function planPlatformWaitlistRequest(input: WaitlistRequest, previous: unknown): WaitlistTransition | null {
  if (!input || input.explicitRequest !== true || typeof input.email !== "string" ||
      !clock(input.now) || !clock(input.retainedUntil) || input.retainedUntil <= input.now ||
      input.retainedUntil - input.now > WAIT_SECONDS || !plan(input.plan) || !country(input.country)) return null;
  const email = normaliseEmail(input.email);
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) return null;
  const id = identity(email);
  let before: PlatformWaitlistEntry | null = null;
  if (previous !== null) {
    before = parsePlatformWaitlistEntry(previous);
    if (!before || before.entryId !== id || before.updatedAt > input.now ||
        before.state === "confirmed" || before.retainedUntil <= input.now) return null;
  }
  const c = input.consent;
  if (!c || !version(c.version) || !text(c.text) || !version(c.newsVersion) ||
      !text(c.newsText) || typeof c.newsRequested !== "boolean") return null;
  const next: PlatformWaitlistEntry = {
    version:1,entryId:id,generation:randomBytes(16).toString("hex"),state:"pending",email,
    plan:input.plan,country:input.country,requestedAt:input.now,confirmedAt:null,leftAt:null,
    updatedAt:input.now,retainedUntil:input.retainedUntil,
    consent:{version:c.version,text:c.text,newsVersion:c.newsVersion,newsText:c.newsText,newsRequested:c.newsRequested},
    consentDigest:"",
  };
  next.consentDigest = digest(next);
  return {expected:previous as string | null,next,changed:true};
}
function bound(raw: unknown, grant: PlatformWaitlistGrant, purpose: "confirm" | "leave", at: number) {
  const entry = parsePlatformWaitlistEntry(raw);
  if (!entry || !clock(at) || at < entry.updatedAt || at >= entry.retainedUntil) return null;
  let checked: PlatformWaitlistGrant | null = null;
  try { checked = parsePlatformWaitlistGrant(JSON.stringify(grant),purpose,at); } catch { return null; }
  if (!checked || checked.entryId !== entry.entryId || checked.generation !== entry.generation ||
      checked.issuedAt !== entry.requestedAt || checked.expiresAt > entry.retainedUntil) return null;
  return entry;
}
export function planPlatformWaitlistConfirmation(raw: unknown, grant: PlatformWaitlistGrant, at: number): WaitlistTransition | null {
  const e = bound(raw,grant,"confirm",at);
  if (!e || e.state === "left") return null;
  if (e.state === "confirmed") return {expected:raw as string,next:e,changed:false};
  return {expected:raw as string,next:{...e,state:"confirmed",confirmedAt:at,updatedAt:at},changed:true};
}
export function planPlatformWaitlistLeave(raw: unknown, grant: PlatformWaitlistGrant, at: number): WaitlistTransition | null {
  const e = bound(raw,grant,"leave",at);
  if (!e) return null;
  if (e.state === "left") return {expected:raw as string,next:e,changed:false};
  // Keep generation + minimal consent/revocation evidence until reviewed
  // retention ends. This is a tombstone, never permission to email again.
  return {expected:raw as string,next:{...e,state:"left",email:null,plan:null,country:null,leftAt:at,updatedAt:at},changed:true};
}

/** Owner reporting can reuse this projection after its own access/cost gates.
 * Self-reported plan/country are not subscriptions or verified residency.
 */
export function confirmedPlatformWaitlistContact(raw: unknown, at: number): {
  email: string; confirmedAt: number; plan: IntendedPlan; country: string | null; newsOptIn: boolean;
} | null {
  const e = parsePlatformWaitlistEntry(raw);
  if (!e || !clock(at) || at < e.updatedAt || at >= e.retainedUntil ||
      e.state !== "confirmed" || e.email === null || e.confirmedAt === null) return null;
  return {email:e.email,confirmedAt:e.confirmedAt,plan:e.plan,country:e.country,newsOptIn:e.consent.newsRequested};
}
