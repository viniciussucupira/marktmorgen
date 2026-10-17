import { broadcastAnswer } from "@/lib/broadcast-response";
import { done, is, part } from "./check";
const input = { subject: "Subject", body: "Message", productId: "", notProductId: "", who: "all", narrow: null, draftId: "1111111111111111", draftSavedAt: "2026-10-15T00:00:00.000Z" };
const broadcast = { id: "111111111111111111111111", status: "scheduled", createdAt: 100, sendAt: 100, sent: 0, total: 3, subject: "Subject", body: "Message", productId: null, notProductId: null, who: "all", narrow: null, test: null };
const success = { ok: true, broadcast };
part("Campaign creation and draft cleanup have independent confirmations");
is("explicit cleanup confirmation is accepted", broadcastAnswer(true, { ...success, draftCleanupConfirmed: true }, input).draftCleanupConfirmed, true);
for (const draftCleanupConfirmed of [undefined, null, false, "true", 1, [], {}]) {
  const result = broadcastAnswer(true, { ...success, draftCleanupConfirmed }, input);
  is("unknown cleanup never hides campaign success", result.ok, true);
  is("unknown cleanup requests the existing persistent notice", result.draftCleanupConfirmed, false);
}
for (const changed of [{ draftId: "short" }, { draftId: "A".repeat(16) }, { draftId: null }, { draftId: 1 }, { draftSavedAt: undefined }, { draftSavedAt: null }, { draftSavedAt: "invalid" }, { draftSavedAt: 1 }]) {
  const result = broadcastAnswer(true, { ...success, draftCleanupConfirmed: true }, { ...input, ...changed });
  is("invalid source reference does not undo campaign creation", result.ok, true);
  is("an unknown draft version cannot confirm cleanup", result.draftCleanupConfirmed, false);
}
part("A campaign without a source draft has nothing to clean up");
for (const draftId of [undefined, ""]) for (const draftCleanupConfirmed of [undefined, false, true]) {
  const result = broadcastAnswer(true, { ...success, draftCleanupConfirmed }, { ...input, draftId, draftSavedAt: undefined });
  is("creation without a source draft is confirmed", result.ok, true);
  is("no unrelated cleanup notice is needed", result.draftCleanupConfirmed, true);
}
part("Cleanup cannot make an unconfirmed campaign look successful");
is("failed HTTP is still unconfirmed", broadcastAnswer(false, { ...success, draftCleanupConfirmed: true }, input).error, "broadcast_write_unconfirmed");
is("different content is still unconfirmed", broadcastAnswer(true, { ...success, broadcast: { ...broadcast, body: "Other" }, draftCleanupConfirmed: true }, input).error, "broadcast_write_unconfirmed");
is("missing campaign is still unconfirmed", broadcastAnswer(true, { ok: true, draftCleanupConfirmed: true }, input).error, "broadcast_write_unconfirmed");
done();
