import type { NextRequest } from "next/server";
import { fromAnotherSite } from "@/lib/studio-route";
import { normaliseHandle, storeForHandle } from "@/lib/store";
import { communityViewer } from "@/lib/community-access";
import { deviceCount, forgetDevice, rememberDevice, renewDevice } from "@/lib/community-push";
import { restingJson, takeBuyerAction } from "@/lib/buyer-actions";

/**
 * A member turning notifications on, or off, on one device.
 *
 * JSON rather than a form, because the browser's own subscription object is
 * what is being handed over and only a script can produce it. Everything else
 * in the community is a form; this one cannot be.
 *
 * `renew` comes from the service worker itself, when the browser swapped a
 * subscription out on its own (public/community-sw.js). It carries the same
 * cookie as any other request from that browser, so the person is known the
 * same way.
 */
export async function POST(request: NextRequest) {
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ ok: false, error: "bad" }, { status: 400 });
  const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

  const handle = normaliseHandle(text(body.handle, 60));
  const store = handle ? await storeForHandle(handle) : null;
  if (!store || !store.community) return Response.json({ ok: false, error: "none" }, { status: 404 });

  const viewer = await communityViewer(store, request.cookies);
  // Only somebody who is actually in. A device belongs to a member of this
  // community, and stops belonging the moment they stop being one.
  if (viewer.state !== "in") return Response.json({ ok: false, error: "out" }, { status: 403 });
  const id = store.community.id;
  const who = viewer.key;
  const action = text(body.action, 20);
  // A device added is one of the store's buyer actions, or the creator's studio requests (lib/buyer-actions.ts); one taken off is not.
  if ((action === "on" || action === "renew") && !(await takeBuyerAction(store, viewer.owner ? "owner" : "buyer"))) return restingJson();

  if (action === "on") {
    const result = await rememberDevice(id, who, body.subscription);
    if (result === "invalid") return Response.json({ ok: false, error: "invalid" }, { status: 400 });
    if (result === "unavailable") return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
    if (result === "full") return Response.json({ ok: false, error: "full" }, { status: 409 });
    return Response.json({ ok: true, devices: await deviceCount(id, who) });
  }

  if (action === "renew") {
    await renewDevice(id, who, text(body.old, 1_000), body.subscription);
    return Response.json({ ok: true });
  }

  if (action === "off") {
    await forgetDevice(id, who, text(body.endpoint, 1_000));
    return Response.json({ ok: true, devices: await deviceCount(id, who) });
  }

  return Response.json({ ok: false, error: "unknown" }, { status: 400 });
}
