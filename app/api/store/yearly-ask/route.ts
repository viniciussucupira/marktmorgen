import type { NextRequest } from "next/server";
import { setYearlyAsk } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";

/** The one email offering monthly members the yearly price (lib/yearly-ask.ts): `{ on, address }`. */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings");
  if (!guarded.ok) return guarded.response;
  try {
    const result = await setYearlyAsk(guarded.ref, { on: guarded.body.on, address: guarded.body.address });
    if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: 400 });
    return Response.json({ ok: true, yearlyAsk: result.store.yearlyAsk });
  } catch (error) {
    console.error("saving the yearly offer email failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
