import { is, part, done } from "./check";
import { paymentRequestReply } from "../lib/payment-request-reply";
part("Payment request action receipts");
const id = "a".repeat(32);
for (const action of ["create", "remind", "cancel", "delete"] as const) {
  for (const value of [null, [], "yes", {}, { ok: "true" }, Object.create({ ok: true })]) {
    is(action + " rejects absent or invalid confirmation", paymentRequestReply(true, value, action).ok, false);
  }
  is(action + " rejects HTTP failure with success body", paymentRequestReply(false, { ok: true, id, sent: true }, action).ok, false);
  is(action + " keeps a readable refusal", paymentRequestReply(false, { ok: false, message: " Try later. " }, action), { ok: false, message: "Try later." });
  is(action + " ignores nontext message", paymentRequestReply(false, { message: {} }, action), { ok: false });
}
for (const action of ["create", "remind"] as const) {
  for (const sent of [undefined, null, 0, 1, "true", "false"]) is(action + " needs explicit send result", paymentRequestReply(true, { ok: true, id, sent }, action).ok, false);
  for (const sent of [true, false]) is(action + " accepts explicit send result", paymentRequestReply(true, { ok: true, id, sent }, action), { ok: true, sent });
}
for (const wrongId of [undefined, null, "", "other"]) is("create needs its new request id", paymentRequestReply(true, { ok: true, id: wrongId, sent: true }, "create").ok, false);
for (const action of ["cancel", "delete"] as const) is(action + " accepts complete acknowledgement", paymentRequestReply(true, { ok: true }, action), { ok: true });
is("inherited send result is not a receipt", paymentRequestReply(true, Object.assign(Object.create({ sent: true }), { ok: true, id }), "create").ok, false);
done();
