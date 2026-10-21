/**
 * Teams preparation only. No route imports this file and no provider is offered.
 * Keep persisted google/zoom identifiers unchanged until the adapter is complete.
 * Graph v1.0 default-calendar events, never arbitrary tenant calendars.
 */
export const TEAMS_APPROVED: boolean = false;

export type TeamsEligibility =
  | { ok: true }
  | { ok: false; reason: "account" | "calendar" | "disabled" };

/** Never infer a Teams entitlement from an email domain or a subscription label. */
export function teamsEligibility(accountType: unknown, calendar: unknown): TeamsEligibility {
  if (accountType !== "organizational") return { ok: false, reason: "account" };
  if (!calendar || typeof calendar !== "object" || Array.isArray(calendar)) return { ok: false, reason: "calendar" };
  const allowed = (calendar as { allowedOnlineMeetingProviders?: unknown }).allowedOnlineMeetingProviders;
  if (!Array.isArray(allowed) || !allowed.includes("teamsForBusiness")) return { ok: false, reason: "calendar" };
  return { ok: true };
}

/** No environment override or review link can open an unapproved integration. */
export function teamsOffered(accountType: unknown, calendar: unknown): boolean {
  return TEAMS_APPROVED && teamsEligibility(accountType, calendar).ok;
}

type OwnedTeamsEvent = {
  provider: "teams";
  connectionId: string;
  storeId: string;
  eventId: string;
};
const STORE = /^[0-9a-f]{32}$/;
const CONNECTION = /^[0-9a-f]{64}$/;

/**
 * Only a previously persisted event owned by this connection and store.
 * Never accept a browser-supplied event id as ownership proof.
 */
export function ownedTeamsEventPath(record: unknown, storeId: string, connectionId: string): string | null {
  if (!STORE.test(storeId) || !CONNECTION.test(connectionId)) return null;
  if (!record || typeof record !== "object" || Array.isArray(record)) return null;
  const value = record as Partial<OwnedTeamsEvent>;
  if (value.provider !== "teams" || value.storeId !== storeId || value.connectionId !== connectionId) return null;
  if (typeof value.eventId !== "string" || value.eventId.length < 1 || value.eventId.length > 2048 || value.eventId === "." || value.eventId === "..") return null;
  // Graph ids are opaque; encode them as a single path segment. Refuse controls.
  if (/[\u0000-\u0020\u007f]/.test(value.eventId)) return null;
  return "/me/events/" + encodeURIComponent(value.eventId);
}

export type TeamsEventInput = {
  subject: string;
  start: number;
  end: number;
  transactionId: string;
};

/** A deterministic retry key must be persisted before sending this payload. */
export function teamsEventPayload(input: TeamsEventInput): Record<string, unknown> | null {
  if (typeof input.subject !== "string" || !input.subject.trim() || input.subject.length > 200) return null;
  if (!Number.isSafeInteger(input.start) || !Number.isSafeInteger(input.end)) return null;
  if (input.start <= 0 || input.end <= input.start || input.end - input.start > 24 * 60 * 60 * 1000) return null;
  if (!/^[0-9a-f]{64}$/.test(input.transactionId)) return null;
  // UTC instants use the existing booking arithmetic; never re-interpret wall time.
  const start = new Date(input.start), end = new Date(input.end);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return null;
  return {
    subject: input.subject.trim(),
    start: { dateTime: start.toISOString().replace("Z", ""), timeZone: "UTC" },
    end: { dateTime: end.toISOString().replace("Z", ""), timeZone: "UTC" },
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness",
    transactionId: input.transactionId,
    // Buyer delivery stays in the existing opted-in booking flow. No attendee invite.
    attendees: [],
  };
}
