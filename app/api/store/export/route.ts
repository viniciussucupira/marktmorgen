import type { NextRequest } from "next/server";
import { creatorFrom } from "@/lib/studio-route";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { readStats, salesCsv, sourcesCsv, studioStats, visitsCsv, readsSales } from "@/lib/stats";
import { exportShape, exportUnits, storeExport } from "@/lib/store-export";
import { takeAllowance } from "@/lib/store-allowance";

/** Files one store may take in ten minutes: each sales file is up to a hundred reads of Stripe. */
const EXPORTS_PER_WINDOW = 10;

/**
 * The store's numbers as files: its sales (read from its own Stripe account,
 * for the last 30 or 90 days or all of them), its visits day by day, and
 * where its visitors came from; and, since 18 October 2026, everything the
 * store keeps as one file (what=store, lib/store-export.ts), which a store
 * whose plan has ended needs before it closes (lib/plan-closing.ts). Only someone whose role on the store has the
 * permission reaches it (sales need "export", the rest "stats"), and the
 * store is settled by lib/studio-route.ts, never read from the query alone.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const what = params.get("what") ?? "";
  // Sales and the whole store carry buyers' addresses; visits and sources are only counts.
  const creator = await creatorFrom(request, what === "sales" || what === "store" ? "export" : "stats");
  if (creator instanceof Response) return creator;
  const { store } = creator;
  const range = params.get("range") ?? "";
  const plain = (status: number, body: string) =>
    new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

  if (isRedisConfigured() && store.statsId) {
    const key = `nl:rl:export:${store.statsId}`;
    const [, count] = await redisPipeline([
      ["SET", key, "0", "EX", 600, "NX"],
      ["INCR", key],
    ]);
    if (Number(count) > EXPORTS_PER_WINDOW) return plain(429, "That is a lot of files in ten minutes. Try again in a few minutes.");
  }

  const day = new Date().toISOString().slice(0, 10);
  const file = (csv: string, name: string) =>
    // The byte-order mark makes Excel read the file as UTF-8.
    new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
        "X-Content-Type-Options": "nosniff",
      },
    });

  if (what === "store") {
    // Read out of the store's studio figure, at its size: its plan's while it runs, and once
    // it has ended the figure a store whose plan ended keeps to take its data away, which
    // holds the largest store's (tests/closing-cost.test.ts).
    const took = await takeAllowance(store, "studio", exportUnits(await exportShape(store)));
    if (!took.ok) return plain(429, took.message);
    return new Response(storeExport(store), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${store.handle}-everything-${day}.json"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  try {
    if (what === "sales") {
      if (!readsSales(store)) return plain(400, "Connect Stripe or PayPal first: sales are read from them.");
      const days = range === "30" ? 30 : range === "90" ? 90 : range === "all" ? 0 : -1;
      if (days < 0) return plain(400, "Choose 30 days, 90 days or all time.");
      const since = days ? Math.floor(Date.now() / 1000) - days * 86400 : 0;
      const { csv, partial } = await salesCsv(store, since);
      return file(csv, `${store.handle}-sales-${days ? `${days}-days` : "all"}-${day}${partial ? "-partial" : ""}.csv`);
    }
    if (what === "visits") {
      return file(await visitsCsv(store), `${store.handle}-visits-${day}.csv`);
    }
    if (what === "sources") {
      const stats = await readStats(store);
      if (!stats) return plain(503, "Your numbers could not be read just now. Try again in a moment.");
      return file(sourcesCsv(studioStats(store, stats, null, "none")), `${store.handle}-sources-${day}.csv`);
    }
    return plain(400, "Choose store, sales, visits or sources.");
  } catch (error) {
    console.error("exporting numbers failed", error);
    return plain(502, "Stripe or our records did not answer just now. Nothing is lost; try again in a moment.");
  }
}
