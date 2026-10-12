import type { NextRequest } from "next/server";
import { setWeeklyAi } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";

/** Whether the weekly email opens with a summary written by AI (lib/numbers-ask.ts): `{ on }`. */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings");
  if (!guarded.ok) return guarded.response;
  try {
    const result = await setWeeklyAi(guarded.ref, guarded.body.on);
    if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: 400 });
    return Response.json({ ok: true, on: result.store.weeklyAi });
  } catch (error) {
    console.error("saving the weekly summary setting failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
