import type { NextRequest } from "next/server";
import { setSections } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";

/**
 * Saves the store page's sections (lib/store-sections.ts): all of them at
 * once, `{ sections: [{ title, at }] }`, an empty list for none. Part of how
 * the page is laid out, so it needs the "page" permission.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "page", 8_000);
  if (!guarded.ok) return guarded.response;
  try {
    const result = await setSections(guarded.ref, guarded.body.sections);
    if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: result.reason === "unknown" ? 404 : 400 });
    return Response.json({ ok: true, sections: result.store.sections.length, savedSections: result.store.sections });
  } catch (error) {
    console.error("saving a store's sections failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
