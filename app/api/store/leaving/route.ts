import type { NextRequest } from "next/server";
import { setLeaving } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";

/** The question asked before a member cancels (lib/leave-rules.ts): `{ on, reasons: string[], own: { id?, text }[] }`. */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings");
  if (!guarded.ok) return guarded.response;
  try {
    const result = await setLeaving(guarded.ref, { on: guarded.body.on, reasons: guarded.body.reasons, own: guarded.body.own });
    if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: 400 });
    return Response.json({ ok: true, leaving: result.store.leaving });
  } catch (error) {
    console.error("saving the question before canceling failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
