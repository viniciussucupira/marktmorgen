import type { NextRequest } from "next/server";
import { cronAllowed } from "@/lib/request-guard";
import { withCutoff } from "@/lib/fetch-timeout";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { closeEnded } from "@/lib/plan-closing";
import { expireRecords } from "@/lib/closing-archive";

export const maxDuration = 60;

/**
 * Run once a day by Vercel, after the job that brings every store's plan in
 * line with Stripe (app/api/cron/plans): looks at each store whose plan has
 * ended, and at what it still keeps (lib/plan-closing.ts).
 *
 * Every store whose plan ended since 18 October 2026, and one whose plan
 * ended before that keeps more than a store with no plan may, is written to
 * when its plan ends, two weeks before the day and a week before it; on the
 * day, and never sooner than a week after the last of those, what it keeps
 * is removed, once Stripe itself has said that day that the store has no
 * plan, and a store that closes is put in line for the deletion of its
 * records (app/api/cron/closed-data). Then the tax records of closed stores
 * whose years are over are deleted.
 *
 * A job of its own, with the whole minute to itself, because removing what
 * a large store keeps is many requests, and whatever is not finished is
 * finished the next day. One run at a time.
 */
export async function GET(request: NextRequest) {
  return withCutoff(Date.now() + 57_000, () => run(request));
}

async function run(request: NextRequest): Promise<Response> {
  if (!(await cronAllowed(request))) {
    return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (!isRedisConfigured()) return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  const [got] = await redisPipeline([["SET", "nl:closing:lock", "1", "NX", "EX", 120]]);
  if (got === null) return Response.json({ ok: true, busy: true });
  try {
    const looked = await closeEnded(Date.now() + 40_000);
    // Closed stores' tax records whose time is up (lib/closing-archive.ts): a listing a year, nothing most days.
    const expired = await expireRecords(Date.now(), Date.now() + 5_000).catch((error: unknown) => {
      console.error("deleting closed stores' old tax records failed", error);
      return { deleted: 0, done: false };
    });
    if (expired.deleted) console.log(`plan-closing: ${expired.deleted} closed stores' tax records past their years deleted`);
    const count = (state: string) => looked.filter((row) => row.state === state).length;
    const counts = { looked: looked.length, told: count("told"), waiting: count("waiting"), removed: count("removed"), held: count("held"), running: count("running") };
    if (counts.told || counts.removed || counts.held) {
      console.log(`plan-closing: ${counts.looked} stores with an ended plan; ${counts.told} written to, ${counts.removed} had what they kept removed, ${counts.held} left for tomorrow`);
      for (const row of looked) if (row.state === "held") console.error(`plan-closing: left for tomorrow: ${row.note ?? "no reason given"}`);
    }
    return Response.json({ ok: true, ...counts }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("the job for stores whose plan ended failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  } finally {
    await redisPipeline([["DEL", "nl:closing:lock"]]).catch(() => {});
  }
}
