import { mailAnswer } from "@/lib/mail-response";
import { done, is, part } from "./check";
part("Unconfirmed draft saves require review");
for (const raw of [null, [], "bad", {}, { ok: "true" }, { ok: true }]) {
  is("failed HTTP " + JSON.stringify(raw), mailAnswer(false, raw, false, true).error, "draft_write_unconfirmed");
}
for (const raw of [null, [], {}, { ok: 1 }]) {
  is("unreadable draft reply " + JSON.stringify(raw), mailAnswer(true, raw, false, true).error, "draft_write_unconfirmed");
}
is("explicit refusal retained", mailAnswer(false, { ok: false, error: "full" }, false, true).error, "full");
is("confirmed reply retained", mailAnswer(true, { ok: true, draft: {} }, false, true).ok, true);
is("unrelated failure unchanged", mailAnswer(false, null).error, "server_error");
is("sequence uncertainty unchanged", mailAnswer(false, null, true).error, "flow_write_unconfirmed");
done();
