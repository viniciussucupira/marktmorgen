import type { NextRequest } from "next/server";
import { cronAllowed } from "@/lib/request-guard";
import { withCutoff } from "@/lib/fetch-timeout";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { advanceImports, sendMoveReminders } from "@/lib/imports";

export const maxDuration = 60;

/**
 * Run every five minutes by Vercel, two minutes after the email job so the
 * two do not start together (vercel.json lists the minutes, 2, 7, … 57,
 * rather than a stepped range, the plainest form a scheduler reads): works through the imports a creator started
 * and then left (lib/imports.ts), a chunk at a time, for fifty of its sixty
 * seconds. The studio's page does the same while it is open, and each
 * import's own lock keeps the two from working on one import at once.
 * What time is left goes to the one reminder each moved member is owed
 * (lib/move-members.ts).
 */
export async function GET(request: NextRequest) {
  // Every request to Redis, Stripe and the rest is given up by 57 s
  // (lib/fetch-timeout.ts), inside the sixty Vercel gives the job.
  return withCutoff(Date.now() + 57_000, () => run(request));
}

async function run(request: NextRequest): Promise<Response> {
  // Vercel sends the secret with every scheduled run, compared here in
  // constant time. Without one set, only a local development server runs the
  // job on request; in production that is a closed door, not an open one.
  if (!(await cronAllowed(request))) {
    return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (!isRedisConfigured()) {
    return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  }
  const [got] = await redisPipeline([["SET", "nl:imports:lock", "1", "NX", "EX", 90]]);
  if (got === null) return Response.json({ ok: true, busy: true });
  const started = Date.now();
  try {
    const counts = await advanceImports(started + 40_000);
    // Then the one reminder to members moved from another platform who have not kept theirs yet.
    const reminded = await sendMoveReminders(started + 50_000);
    return Response.json({ ok: true, ...counts, reminded }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("the import job failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  } finally {
    await redisPipeline([["DEL", "nl:imports:lock"]]).catch(() => {});
  }
}
