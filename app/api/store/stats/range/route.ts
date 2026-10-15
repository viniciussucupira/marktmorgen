import type { NextRequest } from "next/server";
import { jsonAccess } from "@/lib/studio-route";
import { rangeProblem, readRange } from "@/lib/stats";
import { readTitles } from "@/lib/catalog";
import { readMarks } from "@/lib/auto-marks";

/**
 * Any stretch of days the creator picks (lib/stats.ts, readRange):
 * `?from=YYYY-MM-DD&to=YYYY-MM-DD`, as far back as the days are kept. For
 * whoever may see the numbers.
 */
export async function GET(request: NextRequest) {
  const access = await jsonAccess(request, "stats");
  if (access instanceof Response) return access;
  const store = access.store;
  const from = request.nextUrl.searchParams.get("from") ?? "";
  const to = request.nextUrl.searchParams.get("to") ?? "";
  const problem = rangeProblem(from, to);
  if (problem) return Response.json({ ok: false, error: problem }, { status: 400 });
  try {
    const [range, titles, marks] = await Promise.all([
      readRange(store, from, to, Date.now(), { fullDetails: request.nextUrl.searchParams.get("details") === "all" }),
      readTitles(store).catch(() => new Map<string, string>()),
      readMarks(store, from, to).catch(() => []),
    ]);
    if (!range) return Response.json({ ok: false, error: "server_error" }, { status: 503 });
    return Response.json(
      { ok: true, range: { ...range, products: range.products.map((p) => ({ ...p, title: titles.get(p.id) ?? "A product no longer in your store" })) }, marks },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("reading a stretch of days failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 502 });
  }
}
