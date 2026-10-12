import type { NextRequest } from "next/server";
import { guardStoreWrite, text } from "@/lib/store-request";
import { readListings } from "@/lib/catalog";
import { FUNNEL_ID, MAX_FUNNEL_PAGES, productStepProblem, readFunnelInput } from "@/lib/page-funnel";
import { dropPageFunnel, readPageFunnels, writePageFunnel } from "@/lib/page-funnel-store";

/**
 * Saves or removes one funnel of pages (lib/page-funnel.ts).
 *
 * `{ funnel: { id?, name, slug?, on, steps: [{ kind: "page" | "product", id }] } }`
 * saves it; `{ action: "remove", id }` removes it. Every step has to be a page
 * the store has, or a product of the store that has a page of its own and is
 * bought from it; a draft may be a step, and is passed over until it is out.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "products", 12_000);
  if (!guarded.ok) return guarded.response;
  const { store, body } = guarded;
  if (!store.statsId) return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  const statsId = store.statsId;

  try {
    const existing = await readPageFunnels(statsId);

    if (body.action === "remove") {
      const id = text(body.id, 10);
      if (!FUNNEL_ID.test(id)) return Response.json({ ok: false, error: "unknown" }, { status: 400 });
      const removed = await dropPageFunnel(statsId, id);
      return removed ? Response.json({ ok: true }) : Response.json({ ok: false, error: "unknown" }, { status: 404 });
    }

    const read = readFunnelInput(body.funnel, existing, Math.floor(Date.now() / 1000));
    if (!read.ok) return Response.json({ ok: false, error: read.error }, { status: 400 });
    const { funnel } = read;

    // Each step is a page or a product this store has, as it stands now.
    const productIds = funnel.steps.filter((s) => s.kind === "product").map((s) => s.id);
    const products = productIds.length ? await readListings(store, productIds) : [];
    for (const step of funnel.steps.slice(0, MAX_FUNNEL_PAGES)) {
      if (step.kind === "page" && !store.sitePages.some((p) => p.id === step.id)) {
        return Response.json({ ok: false, error: "page" }, { status: 400 });
      }
      if (step.kind === "product") {
        const problem = productStepProblem(products.find((p) => p.id === step.id) ?? null);
        if (problem === "gone" || problem === "call") return Response.json({ ok: false, error: problem }, { status: 400 });
      }
    }

    const kept = await writePageFunnel(statsId, funnel, existing);
    return Response.json({ ok: true, funnel: kept });
  } catch (error) {
    console.error("saving a funnel of pages failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
