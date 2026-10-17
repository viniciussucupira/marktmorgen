import { confirmedDraftId, type MailAnswer } from "@/lib/mail-response";
import { done, is, part } from "./check";
const id = "1111111111111111";
const audience = { who: "leads", notProductId: "excluded", narrow: { minSpent: 2550, channel: "newsletter", quietDays: 30 } };
const input = { subject: "  Hello   readers ", body: " Body\r\nline ", productId: "included" };
const draft = { id, subject: "Hello readers", body: "Body\r\nline", productId: "included", audience, by: "owner@example.com", savedAt: "2026-10-15T00:00:00.000Z" };
const response = (value: unknown = draft) => ({ ok: true, draft: value });
part("Saved content must match the submitted draft");
is("matching content confirms an existing draft", confirmedDraftId(response(), id, audience, input), id);
is("matching content confirms a new draft", confirmedDraftId(response(), "", audience, input), id);
for (const changed of [{ subject: "Other subject" }, { body: "Other content" }, { productId: "other" }, { productId: null }, { body: "Body\nline" }, { id: "2222222222222222" }]) {
  is("different saved values cannot confirm this operation", confirmedDraftId(response({ ...draft, ...changed }), id, audience, input), null);
}
for (const changed of [{ subject: undefined }, { subject: 1 }, { subject: " " }, { body: undefined }, { body: null }, { body: " " }, { productId: undefined }, { productId: [] }, { productId: 1 }]) {
  is("invalid submitted content cannot confirm saving", confirmedDraftId(response(), id, audience, { ...input, ...changed }), null);
}
for (const error of [undefined, null, "", "server_error", false]) {
  is("contradictory success with an error is refused", confirmedDraftId({ ...response(), error } as unknown as MailAnswer, id, audience, input), null);
}
part("Only server normalization is accepted");
is("empty product selection confirms null", confirmedDraftId(response({ ...draft, productId: null }), id, audience, { ...input, productId: "" }), id);
is("explicit null selection confirms null", confirmedDraftId(response({ ...draft, productId: null }), id, audience, { ...input, productId: null }), id);
is("product identifiers are not silently trimmed", confirmedDraftId(response(), id, audience, { ...input, productId: " included " }), null);
is("subject uses the server length limit", confirmedDraftId(response({ ...draft, subject: "x".repeat(150) }), id, audience, { ...input, subject: "x".repeat(170) }), id);
is("body uses the server length limit", confirmedDraftId(response({ ...draft, body: "x".repeat(20000) }), id, audience, { ...input, body: "x".repeat(20010) }), id);
is("a valid new body still cannot override audience mismatch", confirmedDraftId(response(), id, { ...audience, who: "all" }, input), null);
is("nonempty content alone is not enough", confirmedDraftId(response(), id, audience, { ...input, body: "Another nonempty message" }), null);
is("an older caller can still inspect a complete saved draft", confirmedDraftId(response(), id), id);
done();
