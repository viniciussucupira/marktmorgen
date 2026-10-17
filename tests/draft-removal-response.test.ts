import { draftRemovalAnswer } from "@/lib/mail-response";
import { done, is, part } from "./check";
const id = "1111111111111111";
const savedAt = "2026-10-15T00:00:00.000Z";
const removed = { id, savedAt };
const success = { ok: true, removed };
const unknown = "draft_remove_unconfirmed";
part("Removal belongs to the requested draft and version");
is("matching removal is confirmed", draftRemovalAnswer(true, success, id, savedAt).ok, true);
is("HTTP failure cannot confirm removal", draftRemovalAnswer(false, success, id, savedAt).error, unknown);
for (const raw of [null, [], true, "ok", {}, { ok: true }, { ok: "true", removed }, { ok: 1, removed }, { ok: true, removed, error: null }, { ok: false, removed, error: "unknown" }, { ok: false, error: "server_error" }, { ok: false, error: "new_error" }, { ok: false }, { ok: false, error: 1 }]) {
  is("generic or malformed responses stay uncertain", draftRemovalAnswer(true, raw, id, savedAt).error, unknown);
}
for (const value of [null, [], "deleted", {}, { id }, { savedAt }, { ...removed, id: "2222222222222222" }, { ...removed, id: 1 }, { ...removed, savedAt: "2026-10-15T00:00:00.001Z" }, { ...removed, savedAt: null }, { ...removed, savedAt: 1 }, { ...removed, savedAt: "invalid" }]) {
  is("missing or unrelated removal cannot close a draft", draftRemovalAnswer(true, { ok: true, removed: value }, id, savedAt).error, unknown);
}
for (const requested of [null, undefined, "", "short", "a".repeat(15), "a".repeat(17), "A".repeat(16), 1, []]) {
  is("invalid draft identity cannot confirm", draftRemovalAnswer(true, success, requested, savedAt).error, unknown);
}
for (const version of [null, undefined, "", "invalid", 1, [], {}]) {
  is("unknown requested version cannot confirm", draftRemovalAnswer(true, success, id, version).error, unknown);
}
part("Explicit refusals preserve their meaning");
for (const error of ["unknown", "draft_remove_conflict", "role", "locked", "store_gone", "none", "signed_out", "origin", "bad_request"]) {
  is("known refusal survives", draftRemovalAnswer(false, { ok: false, error }, id, savedAt).error, error);
  is("refusal with contradictory removed field stays uncertain", draftRemovalAnswer(false, { ok: false, error, removed: null }, id, savedAt).error, unknown);
}
is("explicit uncertainty stays uncertain", draftRemovalAnswer(false, { ok: false, error: unknown }, id, savedAt).error, unknown);
is("extra response metadata is allowed", draftRemovalAnswer(true, { ...success, requestId: "synthetic" }, id, savedAt).ok, true);
done();
