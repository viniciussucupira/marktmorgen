import type { NextRequest } from "next/server";
import { guardStoreWrite } from "@/lib/store-request";
import { ensureStatsId } from "@/lib/store";
import { DEAL_ID, newCrmId, readFollowUp, parseDeal, parseFields, parseStages } from "@/lib/crm-rules";
import { readTeam } from "@/lib/team";
import { can } from "@/lib/team-roles";
import { CrmSchemaReadUnavailable, CrmSchemaWriteUnconfirmed, CrmDealReadUnavailable, CrmDealWriteUnconfirmed, dropDeal, readDeal, readFields, readStages, setValue, writeDeal, writeFields, writeStages } from "@/lib/crm";

/** Ten fields of ten choices, or a deal with its note, as JSON. */
const MAX_BODY_BYTES = 20_000;

/**
 * A store's own fields about each person and its deals (lib/crm-rules.ts),
 * for whoever may read orders with buyers' addresses ("orders"):
 *
 *   { action: "fields", fields }               saves the fields; a field taken away takes its answers
 *   { action: "value", person, field, value }   one person's answer to one field; "" clears it
 *   { action: "stages", stages }               saves the deals' stages
 *   { action: "deal", deal }                    saves a deal, new without an id
 *   { action: "undeal", id }                    removes one
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "orders", MAX_BODY_BYTES);
  if (!guarded.ok) return guarded.response;
  const { body } = guarded;
  const refuse = (error: string, status = 400) => Response.json({ ok: false, error }, { status });
  try {
    const store = guarded.store.statsId ? guarded.store : await ensureStatsId(guarded.ref);
    if (!store?.statsId) return refuse("unavailable", 503);
    const statsId = store.statsId;

    if (body.action === "fields") {
      const sent = Array.isArray(body.fields) ? body.fields : [];
      const fields = parseFields(sent);
      if (fields.length !== Math.min(sent.length, 10) || sent.length > 10) return refuse("fields");
      return Response.json({ ok: true, fields: await writeFields(statsId, fields) });
    }
    if (body.action === "value") {
      const field = (await readFields(statsId)).find((f) => f.id === body.field);
      if (!field) return refuse("unknown", 404);
      const ok = await setValue(statsId, typeof body.person === "string" ? body.person : "", field, body.value);
      return ok ? Response.json({ ok: true }) : refuse("value");
    }
    if (body.action === "stages") {
      const stages = parseStages(body.stages);
      if (!stages) return refuse("stages");
      return Response.json({ ok: true, stages: await writeStages(statsId, stages) });
    }
    const stages = await readStages(statsId);
    if (body.action === "deal") {
      const raw = body.deal && typeof body.deal === "object" ? (body.deal as Record<string, unknown>) : {};
      const asked = typeof raw.id === "string" && DEAL_ID.test(raw.id) ? raw.id : "";
      const existing = asked ? await readDeal(statsId, asked, stages) : null;
      if (asked && !existing) return refuse("unknown", 404);
      const follow = readFollowUp({ ...existing, ...raw });
      if (!follow.ok) return refuse(follow.error);
      if (follow.value.assignee && follow.value.assignee !== existing?.assignee) {
        const team = await readTeam(store.sid);
        const eligible = follow.value.assignee === store.email || team.members.some(m => m.email === follow.value.assignee && can(m.role, "orders"));
        if (!eligible) return refuse("assignee");
      }
      const now = Math.floor(Date.now() / 1000);
      const deal = parseDeal({ ...existing, ...raw, ...follow.value, id: existing?.id ?? newCrmId(10), createdAt: existing?.createdAt ?? now, updatedAt: now }, stages);
      if (!deal) return refuse(typeof raw.title === "string" && raw.title.trim() ? "stage" : "title");
      if (!(await writeDeal(statsId, deal))) return refuse("full");
      return Response.json({ ok: true, deal });
    }
    if (body.action === "undeal") {
      const id = typeof body.id === "string" ? body.id : "";
      return (await dropDeal(statsId, id)) ? Response.json({ ok: true }) : refuse("unknown", 404);
    }
    return refuse("invalid");
  } catch (error) {
    if (error instanceof CrmSchemaReadUnavailable) return refuse("crm_schema_read_unavailable", 503);
    if (error instanceof CrmSchemaWriteUnconfirmed) return refuse("crm_write_unconfirmed", 502);
    if (error instanceof CrmDealReadUnavailable) return refuse("crm_deal_read_unavailable", 503);
    if (error instanceof CrmDealWriteUnconfirmed) return refuse("crm_write_unconfirmed", 502);
    console.error("saving a store's fields or deals failed", error);
    return refuse("server_error", 500);
  }
}
