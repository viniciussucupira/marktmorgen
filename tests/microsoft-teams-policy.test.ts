import assert from "node:assert/strict";
import { TEAMS_APPROVED, teamsEligibility, teamsOffered, ownedTeamsEventPath, teamsEventPayload } from "../lib/microsoft-teams-policy";
const calendar = { allowedOnlineMeetingProviders: ["teamsForBusiness"] };
assert.equal(TEAMS_APPROVED, false);
assert.equal(teamsOffered("organizational", calendar), false);
for (const account of ["personal", "", null, undefined]) assert.deepEqual(teamsEligibility(account, calendar), { ok: false, reason: "account" });
for (const value of [null, [], {}, { allowedOnlineMeetingProviders: "teamsForBusiness" }, { allowedOnlineMeetingProviders: ["skypeForBusiness"] }]) {
  assert.deepEqual(teamsEligibility("organizational", value), { ok: false, reason: "calendar" });
}
assert.deepEqual(teamsEligibility("organizational", calendar), { ok: true });
const storeId = "a".repeat(32), connectionId = "b".repeat(64);
const record = { provider: "teams", storeId, connectionId, eventId: "AAMk+/=?opaque" };
assert.equal(ownedTeamsEventPath(record, storeId, connectionId), "/me/events/AAMk%2B%2F%3D%3Fopaque");
assert.equal(ownedTeamsEventPath(record, "c".repeat(32), connectionId), null);
assert.equal(ownedTeamsEventPath(record, storeId, "c".repeat(64)), null);
assert.equal(ownedTeamsEventPath({ ...record, provider: "google" }, storeId, connectionId), null);
for (const eventId of ["", ".", "..", "bad\nheader", "a".repeat(2049)]) assert.equal(ownedTeamsEventPath({ ...record, eventId }, storeId, connectionId), null);
const input = { subject: " Paid lesson ", start: Date.UTC(2026, 10, 1, 5, 30), end: Date.UTC(2026, 10, 1, 6, 30), transactionId: "d".repeat(64) };
const event = teamsEventPayload(input);
assert.deepEqual(event, {
  subject: "Paid lesson",
  start: { dateTime: "2026-11-01T05:30:00.000", timeZone: "UTC" },
  end: { dateTime: "2026-11-01T06:30:00.000", timeZone: "UTC" },
  isOnlineMeeting: true, onlineMeetingProvider: "teamsForBusiness",
  transactionId: input.transactionId, attendees: [],
});
assert.deepEqual(teamsEventPayload(input), event);
for (const changed of [{ end: input.start }, { end: input.start - 1 }, { end: input.start + 86400001 }, { start: NaN }, { transactionId: "x" }, { subject: " " }]) assert.equal(teamsEventPayload({ ...input, ...changed }), null);
console.log("Teams disabled policy, account capability, owned event isolation and UTC/idempotent payload checks passed.");
