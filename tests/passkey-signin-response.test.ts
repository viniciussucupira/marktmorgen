import { passkeyAnswer } from "@/lib/passkey-signin-response";
import { done, is, part } from "./check";
part("Passkey success requires an HTTP success and explicit boolean");
for (const action of ["options", "verify"] as const) {
  for (const raw of [null, [], "ok", true, {}, {ok: "true", options: {}}, {ok: 1, options: {}}, {ok: true, error: null, options: {}}, {ok: true, error: "server_error", options: {}}]) {
    is("malformed or contradictory answer is refused", passkeyAnswer(true, raw, action).ok, false);
  }
  is("failed HTTP cannot approve a prompt or redirect", passkeyAnswer(false, {ok: true, options: {}, next: "/studio"}, action).ok, false);
  for (const error of ["not_recognised", "rate_limited", "unavailable", "server_error"]) {
    const answer = passkeyAnswer(false, {ok: false, error}, action);
    is("known refusal preserved", !answer.ok && answer.error, error);
  }
  for (const error of ["toString", "__proto__", "unknown"]) {
    const answer = passkeyAnswer(false, {ok: false, error}, action);
    is("unknown error stays readable", !answer.ok && answer.error, "server_error");
  }
}
part("Options and destination belong to the expected stage");
const options = { challenge: "synthetic", rpId: "example.test" };
const ready = passkeyAnswer(true, {ok: true, options}, "options");
is("successful options remain available to WebAuthn validation", ready.ok && ready.options, options);
for (const options of [undefined, null, [], true, "options"]) {
  is("missing or malformed options never opens prompt", passkeyAnswer(true, {ok: true, options}, "options").ok, false);
}
for (const next of ["https://example.test", "//example.test", "/studio/other", "javascript:alert(1)", null, 1]) {
  is("unrecognized destination cannot navigate", passkeyAnswer(true, {ok: true, next}, "verify").ok, false);
}
for (const raw of [{ok: true}, {ok: true, next: "/studio"}]) {
  const answer = passkeyAnswer(true, raw, "verify");
  is("route success opens the studio", answer.ok && answer.next, "/studio");
}
done();
