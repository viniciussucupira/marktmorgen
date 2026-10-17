import { withinService } from "@/lib/metered-limits";
import type { NextRequest } from "next/server";
import { guardStoreWrite } from "@/lib/store-request";
import { ensureStatsId } from "@/lib/store";
import { studioPath } from "@/lib/studio-route";
import { addPersonNote, findToken, readAddress, removePersonNote } from "@/lib/buyer-profile";

/** How many addresses one store may look up in an hour: each look reads Stripe. */
const FINDS_PER_HOUR = 200;

/**
 * A buyer's page in the studio (lib/buyer-profile.ts), for whoever may read
 * orders with the buyer's address (lib/team-roles.ts, "orders"):
 *
 *   { action: "find", email }            → the address of its page, which carries a token, never the address
 *   { action: "note", person, text }     → adds a note about that person; answers the notes
 *   { action: "unnote", person, id }     → takes one away; answers the notes
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "orders", 2_000);
  if (!guarded.ok) return guarded.response;
  const { body } = guarded;
  const noStore = { headers: { "Cache-Control": "no-store" } };
  try {
    if (body.action === "find") {
      const email = readAddress(body.email);
      if (!email) return Response.json({ ok: false, error: "email" }, { status: 400 });
      if (!(await withinService("person-find", guarded.store.sid || guarded.store.handle, FINDS_PER_HOUR, 60 * 60, guarded.store))) {
        return Response.json({ ok: false, error: "limited" }, { status: 429 });
      }
      const token = await findToken(guarded.store, email);
      if (!token) return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
      return Response.json({ ok: true, href: studioPath(guarded.store, `p=${token}`, "people") }, noStore);
    }

    const store = guarded.store.statsId ? guarded.store : await ensureStatsId(guarded.store.email);
    if (!store?.statsId) return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
    const person = typeof body.person === "string" ? body.person : "";
    if (body.action === "note") {
      const notes = await addPersonNote(store.statsId, person, guarded.email, body.text);
      if (!notes) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
      return Response.json({ ok: true, notes }, noStore);
    }
    if (body.action === "unnote") {
      return Response.json({ ok: true, notes: await removePersonNote(store.statsId, person, body.id) }, noStore);
    }
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  } catch (error) {
    console.error("a buyer's page could not do that", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
