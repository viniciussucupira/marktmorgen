import type { NextRequest } from "next/server";
import { guardStoreWrite } from "@/lib/store-request";
import { setRecentSales } from "@/lib/store";

/**
 * Whether the store's front page and product pages show its latest real
 * purchases (lib/recent-sales.ts): `{ on: true | false }`. A setting, because
 * it is something the store's visitors see.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings", 500);
  if (!guarded.ok) return guarded.response;
  if (typeof guarded.body.on !== "boolean") return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  try {
    const store = await setRecentSales(guarded.ref, guarded.body.on);
    return Response.json({ ok: true, on: store?.recentSales ?? guarded.body.on }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("changing the recent purchases on a store failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
