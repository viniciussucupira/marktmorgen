import type { NextRequest } from "next/server";
import { jsonAccess } from "@/lib/studio-route";
import { readAllTimeSales, readsSales } from "@/lib/stats";

/**
 * All-time sales, read from the creator's own Stripe account when they ask
 * for them in the studio — the one reading too long to make on every visit
 * to it — and kept ten minutes.
 */
export async function GET(request: NextRequest) {
  const access = await jsonAccess(request, "stats");
  if (access instanceof Response) return access;
  const store = access.store;
  if (!readsSales(store)) return Response.json({ ok: false, error: "stripe" }, { status: 400 });
  try {
    const sales = await readAllTimeSales(store);
    return Response.json({ ok: true, sales }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("reading all-time sales failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 502 });
  }
}
