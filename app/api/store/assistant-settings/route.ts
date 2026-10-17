import type { NextRequest } from "next/server";
import { setAssistant, setNextOffer } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";
import { clearAssistantMissed } from "@/lib/store-assistant";

/**
 * The Store assistant's setting (lib/store-assistant-rules.ts), from the
 * studio: `{ on, notes }` switches its chat on or off and keeps the
 * creator's notes for it; `{ clear: true }` forgets the questions it could
 * not answer, once read; `{ next: { on, email } }` switches the next
 * product after a purchase on or off, and its line in the confirmation
 * email (lib/next-offer-rules.ts). What a store's pages say to buyers is the "page"
 * permission. Switching it on is allowed before the add-on is paid for: the
 * chat shows only while it is.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "page", 6_000);
  if (!guarded.ok) return guarded.response;
  try {
    if (guarded.body.clear === true) {
      await clearAssistantMissed(guarded.store);
      return Response.json({ ok: true });
    }
    if (guarded.body.next && typeof guarded.body.next === "object") {
      const changed = await setNextOffer(guarded.ref, guarded.body.next);
      if (!changed) return Response.json({ ok: false, error: "none" }, { status: 400 });
      return Response.json({ ok: true, next: changed.nextOffer });
    }
    const store = await setAssistant(guarded.ref, { on: guarded.body.on === true, notes: guarded.body.notes });
    if (!store) return Response.json({ ok: false, error: "none" }, { status: 400 });
    return Response.json({ ok: true, on: store.assistant.on });
  } catch (error) {
    console.error("saving the assistant setting failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
