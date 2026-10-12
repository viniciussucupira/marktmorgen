import type { NextRequest } from "next/server";
import { setDunning } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";

/** What members are told when a payment fails (lib/dunning-rules.ts): `{ reminders: 1 | 2 | 3, cardNotice: boolean }`. */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings");
  if (!guarded.ok) return guarded.response;
  try {
    const result = await setDunning(guarded.ref, { reminders: guarded.body.reminders, cardNotice: guarded.body.cardNotice });
    if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: 400 });
    return Response.json({ ok: true, dunning: result.store.dunning });
  } catch (error) {
    console.error("saving the failed-payment setting failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
