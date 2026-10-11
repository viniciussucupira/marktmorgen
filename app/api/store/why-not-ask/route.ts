import type { NextRequest } from "next/server";
import { guardStoreWrite } from "@/lib/store-request";
import { setAskWhyNot } from "@/lib/store";

/**
 * Whether sales pages ask a visitor about to go without buying what is
 * stopping them (components/page-depth.tsx): `{ ask: true | false }`. A
 * setting, because it is something the store's visitors see.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings", 500);
  if (!guarded.ok) return guarded.response;
  if (typeof guarded.body.ask !== "boolean") return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  try {
    const store = await setAskWhyNot(guarded.ref, guarded.body.ask);
    return Response.json({ ok: true, ask: store?.askWhyNot ?? guarded.body.ask }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("changing the question on sales pages failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
