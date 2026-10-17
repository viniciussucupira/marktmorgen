import { cancellationAnswer } from "@/lib/broadcast-response";
import { done, is, part } from "./check";
const id = "111111111111111111111111";
const cancelled = { id, status: "cancelled" };
const success = { ok: true, cancelled };
const uncertain = "broadcast_cancel_unconfirmed";
part("Cancellation belongs to the requested campaign");
is("matching confirmed cancellation survives", cancellationAnswer(true, success, id).ok, true);
is("HTTP failure never confirms cancellation", cancellationAnswer(false, success, id).error, uncertain);
for (const raw of [null, [], "ok", true, {}, { ok: true }, { ok: "true", cancelled }, { ok: 1, cancelled }, { ok: true, error: null, cancelled }, { ok: true, error: "unknown", cancelled }, { ok: false, error: "unknown", cancelled }, { ok: false, error: "server_error" }, { ok: false, error: "new_error" }, { ok: false }, { ok: false, error: 1 }]) {
  is("malformed or contradictory response stays uncertain", cancellationAnswer(true, raw, id).error, uncertain);
}
for (const value of [null, [], "cancelled", {}, { id }, { status: "cancelled" }, { ...cancelled, id: "222222222222222222222222" }, { ...cancelled, id: id.toUpperCase().replace("1", "A") }, { ...cancelled, status: "scheduled" }, { ...cancelled, status: "sending" }, { ...cancelled, status: "sent" }, { ...cancelled, status: true }, { ...cancelled, id: 1 }]) {
  is("missing, foreign or noncancelled record is refused", cancellationAnswer(true, { ok: true, cancelled: value }, id).error, uncertain);
}
for (const requested of [null, undefined, "", "short", "a".repeat(23), "a".repeat(25), "A".repeat(24), 1, [], {}]) {
  is("invalid requested identity cannot confirm", cancellationAnswer(true, success, requested).error, uncertain);
}
part("Known prewrite refusals remain understandable");
for (const error of ["unknown", "role", "locked", "store_gone", "none", "signed_out", "origin", "bad_request"]) {
  is("explicit refusal is preserved", cancellationAnswer(false, { ok: false, error }, id).error, error);
  is("refusal with contradictory cancellation is uncertain", cancellationAnswer(false, { ok: false, error, cancelled: null }, id).error, uncertain);
}
is("explicit uncertainty stays uncertain", cancellationAnswer(false, { ok: false, error: uncertain }, id).error, uncertain);
is("extra response metadata does not break a valid confirmation", cancellationAnswer(true, { ...success, requestId: "test" }, id).ok, true);
done();
