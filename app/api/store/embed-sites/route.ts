import type { NextRequest } from "next/server";
import { setEmbedSites } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";

/**
 * The creator's own websites that may open the store's checkout with the
 * checkout script (lib/embed-sites.ts): `{ sites }`, the whole list, as an
 * array or one per line. A list longer than ten, or a line that is not an
 * https site, is refused as a whole and nothing changes. Part of the page, so
 * it needs the "page" permission, like the code it goes with.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "page", 4_000);
  if (!guarded.ok) return guarded.response;
  try {
    const result = await setEmbedSites(guarded.ref, guarded.body.sites);
    if (!result.ok) {
      const status = result.reason === "none" ? 404 : 400;
      return Response.json({ ok: false, error: result.reason, ...(result.line ? { line: result.line } : {}) }, { status });
    }
    return Response.json({ ok: true, sites: result.store.embedSites });
  } catch (error) {
    console.error("saving the checkout script's sites failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
