import type { NextRequest } from "next/server";
import { ensureStatsId, storeForEmail } from "@/lib/store";
import { guardStoreWrite, text } from "@/lib/store-request";
import { MAX_FEED_URL, addFeed, newFeedToken, removeFeed } from "@/lib/calendar-sync";

/**
 * The creator's calendars: adds one (after reading it once), removes one, or
 * replaces the private subscription address. The answer never carries a
 * calendar's address back — only which service it is and how it went.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings");
  if (!guarded.ok) return guarded.response;

  try {
    const loaded = await storeForEmail(guarded.ref);
    const store = loaded && !loaded.statsId ? await ensureStatsId(guarded.ref) : loaded;
    if (!store || !store.statsId) return Response.json({ ok: false, error: "none" }, { status: 400 });

    const action = text(guarded.body.action, 20);
    if (action === "add") {
      const result = await addFeed(store, text(guarded.body.url, MAX_FEED_URL + 1));
      if (!result.ok) return Response.json({ ok: false, error: result.reason, message: result.message }, { status: result.reason === "unavailable" ? 503 : 400 });
      return Response.json({ ok: true, view: result.view, busyTimes: result.busyTimes });
    }
    if (action === "remove") {
      return Response.json({ ok: true, view: await removeFeed(store, text(guarded.body.id, 40)) });
    }
    if (action === "rotate") {
      return Response.json({ ok: true, view: await newFeedToken(store) });
    }
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  } catch (error) {
    console.error("changing calendars failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
