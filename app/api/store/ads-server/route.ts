import type { NextRequest } from "next/server";
import { guardStoreWrite } from "@/lib/store-request";
import { ensureStatsId } from "@/lib/store";
import { type ServerPlatform, SERVER_PLATFORMS, serverSetup, setServerToken, setTestCode } from "@/lib/ad-events";

/**
 * Sending purchases from the server (lib/ad-events.ts): `{ platform, token }`
 * keeps a platform's access token, sealed, or forgets it when `token` is
 * empty; `{ testCode }` sets or clears Meta's test event code. A setting.
 * Answers which platforms have a token, never a token.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "settings", 2_000);
  if (!guarded.ok) return guarded.response;
  const { body } = guarded;
  try {
    const store = guarded.store.statsId ? guarded.store : await ensureStatsId(guarded.store.email);
    if (!store?.statsId) return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
    if (typeof body.platform === "string") {
      if (!SERVER_PLATFORMS.includes(body.platform as ServerPlatform)) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
      const result = await setServerToken(store.statsId, body.platform as ServerPlatform, body.token);
      if (result === "invalid") return Response.json({ ok: false, error: "token" }, { status: 400 });
    } else if ("testCode" in body) {
      if (!(await setTestCode(store.statsId, body.testCode))) return Response.json({ ok: false, error: "code" }, { status: 400 });
    } else {
      return Response.json({ ok: false, error: "invalid" }, { status: 400 });
    }
    return Response.json({ ok: true, setup: await serverSetup(store.statsId) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("changing server-sent purchases failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
