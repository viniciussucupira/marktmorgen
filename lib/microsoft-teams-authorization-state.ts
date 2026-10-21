import { createHash, randomBytes } from "node:crypto";
import { canSeal, seal, unseal } from "./secret-box";

/** Pure authorization-state preparation; no provider request or public route. */
export type TeamsBinding = { storeId: string; session: string; actor: string };
type Pending = { storeId: string; sessionHash: string; actorHash: string; nonce: string; verifier: string; expires: number };
const digest = (text: string) => createHash("sha256").update(text).digest("hex");
const context = (state: string) => "teams|authorization-state|" + digest(state);
const valid = (binding: TeamsBinding) => /^[0-9a-f]{32}$/.test(binding.storeId) && binding.session.length >= 32 && binding.session.length <= 4096 && binding.actor.trim().length > 0 && binding.actor.length <= 254;
const sessionHash = (session: string) => digest("teams-session:" + session);
const actorHash = (actor: string) => digest("teams-actor:" + actor.trim().toLowerCase());
export const TEAMS_STATE_TTL_SECONDS = 600;

/**
 * Store sealed under the state key with NX/EX600 in the eventual connection flow.
 * A callback must GETDEL once before opening, then recheck current settings permission.
 */
export function prepareTeamsAuthorization(binding: TeamsBinding, now = Date.now()): { state: string; sealed: string; challenge: string; nonce: string; expires: number } | null {
  if (!valid(binding) || !canSeal() || !Number.isSafeInteger(now) || now <= 0 || now > Number.MAX_SAFE_INTEGER - 600000) return null;
  const state = randomBytes(32).toString("hex"), verifier = randomBytes(48).toString("base64url"), nonce = randomBytes(32).toString("hex");
  const pending: Pending = { storeId: binding.storeId, sessionHash: sessionHash(binding.session), actorHash: actorHash(binding.actor), nonce, verifier, expires: now + 600000 };
  return { state, sealed: seal(JSON.stringify(pending), context(state)), challenge: createHash("sha256").update(verifier).digest("base64url"), nonce, expires: pending.expires };
}

/** The input must be the value atomically taken by GETDEL, never a reusable browser blob. */
export function openConsumedTeamsAuthorization(state: string, sealed: string, binding: TeamsBinding, now = Date.now()): { verifier: string; nonce: string } | null {
  if (!/^[0-9a-f]{64}$/.test(state) || !valid(binding) || !Number.isSafeInteger(now) || now <= 0 || sealed.length > 16000) return null;
  const opened = unseal(sealed, context(state));
  if (!opened.ok) return null;
  try {
    const pending: unknown = JSON.parse(opened.value);
    if (!pending || typeof pending !== "object" || Array.isArray(pending)) return null;
    const value = pending as Partial<Pending>;
    if (value.storeId !== binding.storeId || value.sessionHash !== sessionHash(binding.session) || value.actorHash !== actorHash(binding.actor)) return null;
    if (!Number.isSafeInteger(value.expires) || (value.expires as number) <= now || (value.expires as number) > now + 600000) return null;
    if (typeof value.verifier !== "string" || !/^[A-Za-z0-9_-]{64}$/.test(value.verifier) || typeof value.nonce !== "string" || !/^[0-9a-f]{64}$/.test(value.nonce)) return null;
    return { verifier: value.verifier, nonce: value.nonce };
  } catch { return null; }
}
