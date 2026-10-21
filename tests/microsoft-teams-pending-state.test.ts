import assert from "node:assert/strict";
import { keepTeamsAuthorization, takeTeamsAuthorization } from "../lib/microsoft-teams-pending-state";
import { advance } from "./redis-stub";
async function main() {
  const binding = { storeId: "a".repeat(32), session: "synthetic-session-".repeat(4), actor: "owner@example.test" };
  let reserves = 0, allowed = true, funded = true, permissions = 0;
  const permit = async (storeId: string, actor: string) => { permissions++; assert.equal(storeId, binding.storeId); assert.equal(actor, binding.actor); return allowed; };
  const reserve = async () => { reserves++; return funded; };
  const now = Date.now();
  allowed = false;
  assert.equal(await keepTeamsAuthorization(binding, permit, reserve, now), null);
  assert.equal(reserves, 0);
  allowed = true; funded = false;
  assert.equal(await keepTeamsAuthorization(binding, permit, reserve, now), null);
  funded = true;
  const pending = await keepTeamsAuthorization(binding, permit, reserve, now);
  assert.ok(pending);
  const [one, two] = await Promise.all([
    takeTeamsAuthorization(pending.state, binding, permit, now + 1),
    takeTeamsAuthorization(pending.state, binding, permit, now + 1),
  ]);
  assert.equal(Number(Boolean(one)) + Number(Boolean(two)), 1);
  assert.equal((one ?? two)?.nonce, pending.nonce);
  assert.equal(await takeTeamsAuthorization(pending.state, binding, permit, now + 2), null);
  const wrong = await keepTeamsAuthorization(binding, permit, reserve, now);
  assert.ok(wrong);
  const checked = permissions;
  assert.equal(await takeTeamsAuthorization(wrong.state, { ...binding, session: "other-session-".repeat(4) }, permit, now + 1), null);
  assert.equal(permissions, checked);
  assert.equal(await takeTeamsAuthorization(wrong.state, binding, permit, now + 2), null);
  const revoked = await keepTeamsAuthorization(binding, permit, reserve, now);
  assert.ok(revoked); allowed = false;
  assert.equal(await takeTeamsAuthorization(revoked.state, binding, permit, now + 1), null);
  allowed = true;
  assert.equal(await takeTeamsAuthorization(revoked.state, binding, permit, now + 2), null);
  for (const acknowledgement of [undefined, null, 0, 1, "true", { ok: true }, []] as unknown[]) {
    const malformed = async () => acknowledgement as boolean;
    const beforeFunding = reserves;
    assert.equal(await keepTeamsAuthorization(binding, malformed, reserve, now), null);
    assert.equal(reserves, beforeFunding, "unknown permission must not spend");
    assert.equal(await keepTeamsAuthorization(binding, permit, malformed, now), null);
    const consumed = await keepTeamsAuthorization(binding, permit, reserve, now);
    assert.ok(consumed);
    assert.equal(await takeTeamsAuthorization(consumed.state, binding, malformed, now + 1), null);
    assert.equal(await takeTeamsAuthorization(consumed.state, binding, permit, now + 2), null, "unknown permission consumes state once");
  }
  const expired = await keepTeamsAuthorization(binding, permit, reserve, now);
  assert.ok(expired); advance(601000);
  assert.equal(await takeTeamsAuthorization(expired.state, binding, permit, now + 601000), null);
  console.log("Teams atomic one-use state, concurrent replay, session mismatch, revoked permission, funding refusal and Redis TTL checks passed.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
