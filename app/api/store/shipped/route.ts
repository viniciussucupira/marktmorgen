import type { NextRequest } from "next/server";
import { guardStoreWrite, text } from "@/lib/store-request";
import { markShipped } from "@/lib/shipments";

/**
 * Marks a shipped order as sent and emails its buyer once (lib/shipments.ts):
 * `{ session, tracking }`, the tracking link optional. Who may is who may see
 * and handle the store's orders.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "orders", 2_000);
  if (!guarded.ok) return guarded.response;
  const { body, store } = guarded;
  const done = await markShipped(store, text(body.session, 220), body.tracking);
  if (!done.ok) return Response.json({ ok: false, error: done.reason }, { status: done.reason === "stripe" ? 502 : 400 });
  return Response.json({ ok: true, shipped: done.shipped, emailed: done.emailed });
}
