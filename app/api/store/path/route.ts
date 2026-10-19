import { sendPathReminder } from "@/lib/path-reminder";
import type { NextRequest } from "next/server";
import { guardStoreWrite } from "@/lib/store-request";
import { ensureStoreId, storeRef } from "@/lib/store";
import { readAnswers } from "@/lib/path-rules";
import { forgetPath, startPath } from "@/lib/path";

/**
 * Marktmorgen Path's answers (lib/path-rules.ts, lib/path.ts): the four
 * questions and the time zone, from the studio's path page. The owner's
 * alone: the path is about the person who runs the store, and what they
 * answer is theirs. One studio request (lib/studio-route.ts), and the
 * record's room taken in the store's data room before it is written.
 *
 *   POST { action: "start", answers: { goalCents, skills, subject, minutes, audience, timeZone } }
 *   POST { action: "forget" }   deletes the path: the answers, the days and the level kept
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings", 2_000);
  if (!guarded.ok) return guarded.response;
  if (guarded.role !== "owner") return Response.json({ ok: false, error: "role" }, { status: 403 });
  const { body } = guarded;
  try {
    const store = guarded.store.sid ? guarded.store : await ensureStoreId(storeRef(guarded.store));
    if (!store?.sid) return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
    if (body.action === "remind") {
      const result = await sendPathReminder(store);
      return Response.json(result, {status: result.ok ? 200 : result.reason === "allowance" ? 429 : 409, headers: {"Cache-Control":"no-store"}});
    }
    if (body.action === "forget") {
      await forgetPath(store);
      return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    }
    if (body.action !== "start") return Response.json({ ok: false, error: "invalid" }, { status: 400 });
    const read = readAnswers(body.answers, store.currency);
    if (!read.ok) return Response.json({ ok: false, error: "invalid", message: read.message }, { status: 400 });
    const started = await startPath(store, read.answers);
    if (!started.ok) {
      return Response.json(
        { ok: false, error: started.reason, message: started.reason === "full" ? "Your store has no room to keep this right now. Nothing was changed." : started.reason === "conflict" ? "Your Path changed while saving. Reload and try again." : "This can't be saved right now. Try again in a minute." },
        { status: started.reason === "full" || started.reason === "conflict" ? 409 : 503 },
      );
    }
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("saving a store's path failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
