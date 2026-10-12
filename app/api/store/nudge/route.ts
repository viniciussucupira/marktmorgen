import type { NextRequest } from "next/server";
import { setNudge } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";

/** The come-back email to members who stopped coming (lib/member-health-rules.ts): `{ on, address }`. */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings");
  if (!guarded.ok) return guarded.response;
  try {
    const result = await setNudge(guarded.ref, { on: guarded.body.on, address: guarded.body.address });
    if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: 400 });
    return Response.json({ ok: true, nudge: result.store.nudge });
  } catch (error) {
    console.error("saving the come-back email failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
