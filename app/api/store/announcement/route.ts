import type { NextRequest } from "next/server";
import { setAnnouncement } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";

/**
 * Saves the line of news across the top of the store page
 * (lib/store-sections.ts): `{ text, product }`, or an empty text to take it
 * away. Part of what the page says, so it needs the "page" permission.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "page", 2_000);
  if (!guarded.ok) return guarded.response;
  try {
    const result = await setAnnouncement(guarded.ref, { text: guarded.body.text, product: guarded.body.product });
    if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: result.reason === "unknown" ? 404 : 400 });
    return Response.json({ ok: true, on: result.store.announcement !== null, announcement: result.store.announcement });
  } catch (error) {
    console.error("saving a store's announcement failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
