import { readFunnelMutationResult, type FunnelMutation } from "@/lib/funnel-mutation-response";
import { done, is, part } from "./check";

const funnel = { id: "abcdefghij", name: "Launch", slug: "launch", on: false, since: 1760000000, steps: [{ kind: "page" as const, id: "landing001" }, { kind: "product" as const, id: "product001" }] };
const save: FunnelMutation = { funnel };
const remove: FunnelMutation = { action: "remove", id: funnel.id };
const uncertain = { state: "uncertain" };
const confirmed = { state: "confirmed" };

part("Only a complete matching successful acknowledgement confirms a save");
is("saved existing funnel", readFunnelMutationResult(200, { ok: true, funnel }, save), confirmed);
is("new funnel with server-assigned identity", readFunnelMutationResult(201, { ok: true, funnel }, { funnel: { ...funnel, id: undefined } }), confirmed);
is("server-normalized name and address", readFunnelMutationResult(200, { ok: true, funnel }, { funnel: { ...funnel, name: " Launch  ", slug: " LAUNCH " } }), confirmed);
for (const status of [199, 300, 400, 401, 403, 409, 500, 503, NaN, Infinity, 200.5]) {
  is("success body cannot override HTTP status " + status, readFunnelMutationResult(status, { ok: true, funnel }, save), uncertain);
}
for (const raw of [null, undefined, [], "", true, {}, { ok: "true", funnel }, { ok: 1, funnel }, { ok: true }, { ok: true, funnel: null }, { ok: true, funnel: [] }, { ok: true, error: "", funnel }, { ok: true, error: undefined, funnel }]) {
  is("malformed or contradictory acknowledgement " + JSON.stringify(raw), readFunnelMutationResult(200, raw, save), uncertain);
}
for (const change of [
  { id: "zzzzzzzzzz" }, { id: "BAD" }, { name: "Another" }, { slug: "another" }, { on: true }, { on: undefined },
  { since: 0 }, { since: -1 }, { since: "1760000000" }, { since: 1.5 },
  { steps: [...funnel.steps].reverse() }, { steps: funnel.steps.slice(0, 1) },
  { steps: [...funnel.steps, funnel.steps[0]] }, { steps: [{ kind: "other", id: "landing001" }, funnel.steps[1]] },
]) {
  is("a different or incomplete saved funnel is uncertain " + JSON.stringify(change), readFunnelMutationResult(200, { ok: true, funnel: { ...funnel, ...change } }, save), uncertain);
}
part("Removal and explicit refusals");
is("removal confirmed", readFunnelMutationResult(200, { ok: true }, remove), confirmed);
is("invalid requested removal identity", readFunnelMutationResult(200, { ok: true }, { action: "remove", id: "bad" }), uncertain);
is("failed removal cannot confirm", readFunnelMutationResult(500, { ok: true }, remove), uncertain);
is("truthy removal ok cannot confirm", readFunnelMutationResult(200, { ok: "yes" }, remove), uncertain);
is("validation refusal permits correction", readFunnelMutationResult(400, { ok: false, error: "slug" }, save), { state: "rejected", error: "slug" });
is("role refusal permits correction", readFunnelMutationResult(403, { ok: false, error: "role" }, save), { state: "rejected", error: "role" });
is("already absent deletion is a known refusal", readFunnelMutationResult(404, { ok: false, error: "unknown" }, remove), { state: "rejected", error: "unknown" });
for (const [status, raw] of [
  [500, { ok: false, error: "slug" }], [503, { ok: false, error: "unavailable" }],
  [400, { ok: false, error: "unexpected" }], [200, { ok: false, error: "slug" }],
  [400, { error: "slug" }], [400, { ok: "false", error: "slug" }],
] as const) is("ambiguous refusal stays uncertain " + status + JSON.stringify(raw), readFunnelMutationResult(status, raw, save), uncertain);
done();
