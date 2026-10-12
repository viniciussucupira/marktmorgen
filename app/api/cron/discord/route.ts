import type { NextRequest } from "next/server";
import { cronAllowed } from "@/lib/request-guard";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { isDiscordConfigured } from "@/lib/discord";
import { sweepDiscord } from "@/lib/discord-access";

/** How long one run may go on checking; the rest wait for the next. */
const BUDGET_MS = 45_000;

/**
 * Run on a schedule by Vercel: checks again everyone a store's Discord
 * server gave roles to, each at most every few hours (lib/discord-access.ts),
 * and takes back what is no longer theirs. One run at a time.
 */
export async function GET(request: NextRequest) {
  if (!(await cronAllowed(request))) {
    return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (!isRedisConfigured() || !isDiscordConfigured()) return Response.json({ ok: true, off: true });
  const [got] = await redisPipeline([["SET", "nl:dc:lock", "1", "NX", "EX", 120]]);
  if (got === null) return Response.json({ ok: true, busy: true });
  try {
    const counts = await sweepDiscord(Date.now() + BUDGET_MS);
    return Response.json({ ok: true, ...counts }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("checking Discord members failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  } finally {
    await redisPipeline([["DEL", "nl:dc:lock"]]).catch(() => {});
  }
}
