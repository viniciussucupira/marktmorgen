import type { NextRequest } from "next/server";
import { jsonAccess } from "@/lib/studio-route";
import { readLive, readToday } from "@/lib/stats";

/**
 * Who opened the store in the last few minutes (lib/stats.ts readLive), and
 * today so far (readToday), for the studio's numbers, which ask every half
 * minute while they are open.
 */
export async function GET(request: NextRequest) {
  const access = await jsonAccess(request, "stats");
  if (access instanceof Response) return access;
  try {
    const [live, today] = await Promise.all([readLive(access.store), readToday(access.store).catch(() => null)]);
    return Response.json({ ok: true, ...live, today }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("reading who is on a store failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 502 });
  }
}
