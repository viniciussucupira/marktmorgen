import type { NextRequest } from "next/server";
import { cronAllowed } from "@/lib/request-guard";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { isSenderConfigured } from "@/lib/email";
import { visitedFolders } from "@/lib/traffic";
import { monthKey } from "@/lib/delivery";
import { storeOf } from "@/lib/usage-billing";
import { checkQuiet } from "@/lib/quiet-sales";
import { checkAlerts } from "@/lib/store-alerts";

/**
 * Once a day for each store with visits this month or last, whether its
 * sales have stopped (lib/quiet-sales.ts), and whether its numbers went off
 * course in another way (lib/store-alerts.ts). Runs every hour and goes on from
 * where the day's last run stopped, so each store is reached once a day
 * however many there are, and a run after the last store reads nothing; each
 * store is also marked looked-at for the day before anything is read, so a
 * store reached twice is read once.
 */
export const maxDuration = 60;
const TIME_BUDGET_MS = 45_000;

export async function GET(request: NextRequest) {
  if (!(await cronAllowed(request))) {
    return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (!isRedisConfigured() || !isSenderConfigured()) return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  const [got] = await redisPipeline([["SET", "nl:quiet:lock", "1", "NX", "EX", 120]]);
  if (got === null) return Response.json({ ok: true, busy: true });
  const started = Date.now();
  const out = { sent: 0, fine: 0, skipped: 0, seen: 0, failed: 0, alerts: 0 };
  try {
    const now = new Date();
    const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15));
    const folders = [...new Set([...(await visitedFolders(monthKey(now))), ...(await visitedFolders(monthKey(lastMonth)))])].sort();
    const atKey = `nl:quiet:at:${now.toISOString().slice(0, 10)}`;
    const [atRaw] = await redisPipeline([["GET", atKey]]);
    let at = Math.max(0, Number(atRaw) || 0);
    while (at < folders.length && Date.now() - started <= TIME_BUDGET_MS) {
      const store = await storeOf(folders[at]).catch(() => null);
      at += 1;
      if (!store) continue;
      const result = await checkQuiet(store).catch((error) => {
        console.error("checking a store's sales failed", error);
        return "failed" as const;
      });
      out[result] += 1;
      // And the alerts on its numbers, in the same daily pass (lib/store-alerts.ts).
      const alerted = await checkAlerts(store).catch((error) => {
        console.error("checking a store's alerts failed", error);
        return { said: 0, skipped: true };
      });
      out.alerts += alerted.said;
    }
    await redisPipeline([["SET", atKey, at, "EX", 2 * 86400]]);
    console.log(`quiet: ${JSON.stringify(out)}`);
    return Response.json({ ok: true, ...out }, { headers: { "Cache-Control": "no-store" } });
  } finally {
    await redisPipeline([["DEL", "nl:quiet:lock"]]).catch(() => undefined);
  }
}
