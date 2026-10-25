import { type NextRequest, after } from "next/server";
import { noticeCreator } from "@/lib/account-notice";
import { ensureStatsId, storeForEmail } from "@/lib/store";
import { guardStoreWrite, text } from "@/lib/store-request";
import { MAX_ENDPOINT_URL, addEndpoint, removeEndpoint, sendTest, setEndpointEvents, webhooksView } from "@/lib/webhooks";

/**
 * The creator's webhook endpoints: add one (its signing secret comes back in
 * this answer and never again), change which events it hears, remove it, or
 * send it a test message now.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings");
  if (!guarded.ok) return guarded.response;

  try {
    const loaded = await storeForEmail(guarded.ref);
    const store = loaded && !loaded.statsId ? await ensureStatsId(guarded.ref) : loaded;
    if (!store || !store.statsId) return Response.json({ ok: false, error: "none" }, { status: 400 });

    const action = text(guarded.body.action, 20);
    const id = text(guarded.body.id, 40);
    if (action === "add") {
      const result = await addEndpoint(store, text(guarded.body.url, MAX_ENDPOINT_URL + 1), guarded.body.events);
      if (!result.ok) return Response.json({ ok: false, error: result.reason, message: result.message }, { status: result.reason === "unavailable" ? 503 : 400 });
      // Buyers' details can leave through a webhook, so every new one is
      // reported to the creator's inbox (lib/account-notice.ts).
      const added = result.view.endpoints[result.view.endpoints.length - 1];
      after(() => noticeCreator(store, { kind: "webhook-added", where: added?.where ?? "a new address" }));
      return Response.json({ ok: true, secret: result.secret, view: result.view });
    }
    if (action === "events") {
      const result = await setEndpointEvents(store, id, guarded.body.events);
      if (result === "events") return Response.json({ ok: false, error: "events" }, { status: 400 });
      if (result === "missing") return Response.json({ ok: false, error: "missing" }, { status: 404 });
      return Response.json({ ok: true, view: result });
    }
    if (action === "remove") {
      const before = (await webhooksView(store)).endpoints.find((e) => e.id === id);
      const view = await removeEndpoint(store, id);
      if (before) after(() => noticeCreator(store, { kind: "webhook-removed", where: before.where }));
      return Response.json({ ok: true, view });
    }
    if (action === "test") {
      const result = await sendTest(store, id);
      if (!result.ok) {
        if (result.reason === "unavailable") return Response.json({ ok: false, error: "unavailable", message: "The test could not be sent just now. Try again in a moment." }, { status: 503 });
        if (result.reason === "used") return Response.json({ ok: false, error: "used", message: result.message }, { status: 429 });
        return Response.json({ ok: false, error: result.reason }, { status: result.reason === "limited" ? 429 : 404 });
      }
      return Response.json({
        ok: true,
        delivered: result.delivery.state === "delivered",
        status: result.delivery.lastStatus,
        message: result.delivery.lastError,
        view: result.view,
      });
    }
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  } catch (error) {
    console.error("changing webhooks failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
