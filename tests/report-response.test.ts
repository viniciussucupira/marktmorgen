import { reportAnswer } from "@/lib/report-response";
import { REPORT_PROBLEMS } from "@/lib/takedown-rules";
import { done, is, part } from "./check";

part("A false receipt never hides the notice");
is("explicit successful receipt is accepted", reportAnswer(true, {ok: true}).ok, true);
is("HTTP failure cannot confirm receipt", reportAnswer(false, {ok: true}).ok, false);
for (const raw of [null, [], true, "sent", {}, {ok: "true"}, {ok: 1}, {ok: true, error: null}, {ok: true, error: "limited"}, {ok: true, problem: "email"}, {ok: false}]) {
  const answer = reportAnswer(true, raw);
  is("malformed or contradictory receipt refused", answer.ok, false);
  is("refusal has readable recovery text", !answer.ok && answer.message.includes("Try again"), true);
}
part("Only recognized validation problems become messages");
for (const [problem, message] of Object.entries(REPORT_PROBLEMS)) {
  const answer = reportAnswer(false, {ok: false, error: "problem", problem});
  is("server field problem remains understandable", !answer.ok && answer.message, message);
}
for (const problem of ["__proto__", "toString", "unknown", null, 1, {}]) {
  const answer = reportAnswer(false, {ok: false, error: "problem", problem});
  is("unrecognized problem uses readable fallback", !answer.ok && typeof answer.message === "string" && answer.message.includes("Try again"), true);
}
const limited = reportAnswer(false, {ok: false, error: "limited"});
is("rate limit preserves its next step", !limited.ok && limited.message.includes("last hour"), true);
is("success metadata is allowed", reportAnswer(true, {ok: true, requestId: "synthetic"}).ok, true);
done();
