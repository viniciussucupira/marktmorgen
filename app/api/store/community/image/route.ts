import type { NextRequest } from "next/server";
import { get } from "@/lib/blob";
import { normaliseHandle, storeForHandle } from "@/lib/store";
import { communityViewer } from "@/lib/community-access";
import { COMMUNITY_FILE_PATTERN, communityFolder, communityImageType } from "@/lib/community-image";
import { PICTURE_REQUEST_UNITS, takeBuyerRead } from "@/lib/buyer-actions";
import { speech } from "@/lib/buyer-words";

/**
 * Serves a post's picture to somebody who may read the community, and to
 * nobody else: who is asking is checked on every request, as for the pages.
 *
 * The browser may keep it for an hour, privately — never a shared cache, and
 * never the service worker, which leaves everything under /api/ alone. It is
 * served as the type its name says, which its first bytes were held to when
 * the post was written, and it may not run, frame or fetch anything.
 */
export async function GET(request: NextRequest) {
  const missing = (status = 404) =>
    new Response(status === 403 ? "Not for this browser." : "Not found.", {
      status,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  const handle = normaliseHandle(request.nextUrl.searchParams.get("h") ?? "");
  const file = request.nextUrl.searchParams.get("f") ?? "";
  if (!handle || !COMMUNITY_FILE_PATTERN.test(file)) return missing();

  try {
    const store = handle ? await storeForHandle(handle) : null;
    if (!store?.community) return missing();
    const viewer = await communityViewer(store, request.cookies);
    if (viewer.state !== "in") return missing(403);
    // PICTURE_REQUEST_UNITS of the store's public requests on the buyers' side: its bytes pass through us (lib/buyer-actions.ts).
    if (!(await takeBuyerRead(store, PICTURE_REQUEST_UNITS))) {
      return new Response(speech(store).w.restingTitle, { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
    }
    const found = await get(`community/${communityFolder(store.community.id)}/${file}`, { access: "private" });
    if (!found || found.statusCode !== 200 || !found.stream) return missing();
    return new Response(found.stream, {
      headers: {
        "Content-Type": communityImageType(file),
        ...(found.blob.size ? { "Content-Length": String(found.blob.size) } : {}),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  } catch (error) {
    console.error("serving a community picture failed", error);
    return new Response("Try again in a moment.", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
