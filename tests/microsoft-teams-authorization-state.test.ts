import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { prepareTeamsAuthorization, openConsumedTeamsAuthorization, TEAMS_STATE_TTL_SECONDS } from "../lib/microsoft-teams-authorization-state";
const binding = { storeId: "a".repeat(32), session: "synthetic-session-".repeat(4), actor: "owner@example.test" };
const now = 1792566000000;
assert.equal(TEAMS_STATE_TTL_SECONDS, 600);
const first = prepareTeamsAuthorization(binding, now), second = prepareTeamsAuthorization(binding, now);
assert.ok(first && second);
assert.notEqual(first.state, second.state);
assert.notEqual(first.nonce, second.nonce);
assert.notEqual(first.sealed, second.sealed);
assert.equal(first.sealed.includes(binding.actor), false);
assert.equal(first.sealed.includes(binding.session), false);
assert.equal(first.sealed.includes(binding.storeId), false);
const opened = openConsumedTeamsAuthorization(first.state, first.sealed, binding, now + 1);
assert.ok(opened);
assert.equal(createHash("sha256").update(opened.verifier).digest("base64url"), first.challenge);
assert.equal(opened.nonce, first.nonce);
for (const changed of [{ storeId: "b".repeat(32) }, { session: "different-session-".repeat(4) }, { actor: "other@example.test" }]) {
  assert.equal(openConsumedTeamsAuthorization(first.state, first.sealed, { ...binding, ...changed }, now + 1), null);
}
assert.equal(openConsumedTeamsAuthorization(second.state, first.sealed, binding, now + 1), null);
assert.equal(openConsumedTeamsAuthorization(first.state, first.sealed.slice(0, -2) + "xx", binding, now + 1), null);
assert.equal(openConsumedTeamsAuthorization(first.state, first.sealed, binding, first.expires), null);
assert.equal(openConsumedTeamsAuthorization(first.state, first.sealed, binding, now - 1), null);
assert.equal(prepareTeamsAuthorization({ ...binding, session: "" }, now), null);
assert.equal(prepareTeamsAuthorization(binding, NaN), null);
// Pure cryptography does not implement storage consumption or permission checks.
// Those remain mandatory integration tests before an OAuth callback can exist.
console.log("Teams sealed state session/actor/store binding, random PKCE/nonce, tamper and expiry checks passed.");
