import { NextRequest } from "next/server";
import { formOpportunityRef, createFormOpportunity } from "@/lib/form-opportunity";
import { parseForm, type FormResponse } from "@/lib/forms";
import { addResponse, writeForm } from "@/lib/form-store";
import { claimHandle, ensureStatsId, ensureStoreId, storeForEmail } from "@/lib/store";
import { SESSION_COOKIE, openSession } from "@/lib/auth";
import { DEFAULT_STAGES, MAX_DEALS, type Deal } from "@/lib/crm-rules";
import { readDeals } from "@/lib/crm";
import { putMember } from "@/lib/team";
import { POST } from "@/app/api/store/form-opportunity/route";
import { POST as editCrm } from "@/app/api/store/crm/route";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

async function main() {
  redis.clear(); process.env.UPSTASH_REDIS_REST_URL ??= "http://stub";
  const owner = "uniqueforms@example.com";
  await claimHandle(owner, "uniqueformshop", "Unique Forms", ""); await ensureStatsId(owner); await ensureStoreId(owner);
  const store = (await storeForEmail(owner))!; const statsId = store.statsId!;
  const session = await openSession(owner);
  const form = parseForm({ id: "uniqueform", name: "Application", fields: [{ id: "email1", type: "email", label: "Email", required: true }], offerList: false })!;
  await writeForm(statsId, form);
  const response: FormResponse = { at: 1800000000, page: "", answers: { email1: "lead@example.com" }, outcome: "", joined: false };
  await addResponse(statsId, form.id, response);
  const ref = formOpportunityRef(statsId, form.id, response);
  const draft = { title: "Reviewed application", email: "lead@example.com", note: "Initial review", cents: 0, stage: "lead00", nextAction: "Review", dueDate: "2026-10-16", assignee: owner };
  const send = (responseRef = ref, change = {}, token = session) => POST(new NextRequest("https://marktmorgen.com/api/store/form-opportunity", { method: "POST", headers: { "content-type": "application/json", "x-nimbus-store": store.sid, cookie: SESSION_COOKIE + "=" + token }, body: JSON.stringify({ form: form.id, responseRef, deal: { ...draft, ...change } }) }));
  part("Stable identities and concurrent conversions");
  is("identity is scoped to the store and form", [ref === formOpportunityRef("other", form.id, response), ref === formOpportunityRef(statsId, "otherform0", response)], [false, false]);
  is("answer key order does not change response identity", formOpportunityRef(statsId, form.id, { ...response, answers: { first: "a", second: "b" } }), formOpportunityRef(statsId, form.id, { ...response, answers: { second: "b", first: "a" } }));
  const replies = await Promise.all([send(), send(ref, { note: "Competing review" })]);
  const records = await Promise.all(replies.map(reply => reply.json()));
  is("simultaneous requests create one deal and return the same ID", [records.map(record => record.state).sort(), new Set(records.map(record => record.deal?.id)).size, (await readDeals(statsId, DEFAULT_STAGES)).length], [["created", "existing"], 1, 1]);
  const kept = (await readDeals(statsId, DEFAULT_STAGES))[0];
  const edited = await editCrm(new NextRequest("https://marktmorgen.com/api/store/crm", { method: "POST", headers: { "content-type": "application/json", "x-nimbus-store": store.sid, cookie: SESSION_COOKIE + "=" + session }, body: JSON.stringify({ action: "deal", deal: { ...kept, note: "Later work", stage: "won000", formResponseRef: "f".repeat(64) } }) }));
  is("ordinary edits preserve the server-owned origin", [(await edited.json()).ok, (await readDeals(statsId, DEFAULT_STAGES))[0]?.formResponseRef], [true, ref]);
  const again = await (await send()).json();
  is("retry returns existing opportunity without undoing later edits", [again.state, again.deal.note, again.deal.stage, (await readDeals(statsId, DEFAULT_STAGES)).length], ["existing", "Later work", "won000", 1]);
  is("a made-up response cannot create an opportunity", [(await (await send("a".repeat(64))).json()).error, (await readDeals(statsId, DEFAULT_STAGES)).length], ["response_gone", 1]);

  part("Unknown replies are recoverable without duplication");
  const second = { ...response, at: response.at + 1 }; await addResponse(statsId, form.id, second);
  const secondRef = formOpportunityRef(statsId, form.id, second);
  const original = redis.pipeline; let lose = true;
  try {
    redis.pipeline = async commands => { const result = await original.call(redis, commands); if (lose && commands.some(command => command[0] === "EVAL" && String(command[1]).startsWith("-- marktmorgen:form-opportunity:v1"))) { lose = false; throw new Error("Injected lost commit reply"); } return result; };
    is("lost confirmation does not claim failure before write", (await (await send(secondRef)).json()).error, "conversion_unconfirmed");
  } finally { redis.pipeline = original; }
  const recovered = await (await send(secondRef)).json();
  is("retry after a lost reply finds the saved deal", [recovered.state, (await readDeals(statsId, DEFAULT_STAGES)).length], ["existing", 2]);
  const unavailableResponse = { ...response, at: response.at + 20 }; await addResponse(statsId, form.id, unavailableResponse);
  const unavailableRef = formOpportunityRef(statsId, form.id, unavailableResponse);
  for (const mode of ["unsupported", "malformed"]) {
    try {
      redis.pipeline = async commands => { if (commands.some(command => command[0] === "EVAL" && String(command[1]).startsWith("-- marktmorgen:form-opportunity:v1"))) { if (mode === "unsupported") throw new Error("Script unavailable"); return [null]; } return original.call(redis, commands); };
      is("unsupported script or unknown result never falls back to an ordinary write", [(await (await send(unavailableRef)).json()).error, (await readDeals(statsId, DEFAULT_STAGES)).length], ["conversion_unconfirmed", 2]);
    } finally { redis.pipeline = original; }
  }
  await putMember(store, "supportunique@example.com", "support");
  const supportSession = await openSession("supportunique@example.com");
  is("support cannot convert form answers without export permission", (await send(ref, {}, supportSession)).status, 403);
  is("signed-out conversion is refused", (await send(ref, {}, "")).status, 401);

  part("Capacity and collisions fail closed");
  const key = "nl:crm:deals:" + statsId;
  for (let i = 0; i < MAX_DEALS - 2; i++) await redis.pipeline([["HSET", key, "fill" + i, "invalid"]]);
  const third = { ...response, at: response.at + 2 }; await addResponse(statsId, form.id, third);
  is("new conversions respect the whole CRM hash capacity", (await (await send(formOpportunityRef(statsId, form.id, third))).json()).error, "full");
  is("existing conversions can still be retrieved at capacity", (await (await send()).json()).state, "existing");
  const collidingRef = "1234567890" + "a".repeat(54);
  const fixture: Deal = { ...kept, id: collidingRef.slice(0,10), formResponseRef: "b".repeat(64) };
  await redis.pipeline([["HSET", "nl:crm:deals:collision", fixture.id, JSON.stringify(fixture)]]);
  let collisionRefused = false; try { await createFormOpportunity("collision", collidingRef, fixture, DEFAULT_STAGES); } catch { collisionRefused = true; }
  is("identifier collisions never return or overwrite an unrelated deal", [collisionRefused, (await readDeals("collision", DEFAULT_STAGES))[0].formResponseRef], [true, "b".repeat(64)]);
  for (let i = 0; i < 50; i++) await addResponse(statsId, form.id, { ...response, at: response.at + 100 + i });
  is("conversion verification is bounded to the current visible response window", [(await (await send()).json()).error, (await readDeals(statsId, DEFAULT_STAGES)).length], ["response_gone", 2]);
  done();
}
main().catch(error => { console.error(error); process.exit(1); });
