import type { NextRequest } from "next/server";
import { setAttributionDays } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";

/**
 * How many days after a visit a sale is still credited to where it came from
 * (lib/attribution-rules.ts): `{ days }`, one of 7, 30, 60 or 90. A setting.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings");
  if (!guarded.ok) return guarded.response;
  try {
    const result = await setAttributionDays(guarded.ref, guarded.body.days);
    if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: 400 });
    return Response.json({ ok: true, days: result.store.attributionDays });
  } catch (error) {
    console.error("saving the attribution window failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
