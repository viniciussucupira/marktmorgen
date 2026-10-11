import type { NextRequest } from "next/server";
import { setPauseMonths } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";

/** How many months members may pause for, 0 to switch it off (lib/membership-pause-rules.ts): `{ months }`. */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings");
  if (!guarded.ok) return guarded.response;
  try {
    const result = await setPauseMonths(guarded.ref, Number(guarded.body.months));
    if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: 400 });
    return Response.json({ ok: true, pause: result.store.pause });
  } catch (error) {
    console.error("saving the pause setting failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
