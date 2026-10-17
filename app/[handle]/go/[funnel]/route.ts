import type { NextRequest } from "next/server";
import { normaliseHandle, storeForPage } from "@/lib/store";
import { originFrom } from "@/lib/request-origin";
import { nextOpen, withMark } from "@/lib/page-funnel";
import { readPageFunnels, stepStates } from "@/lib/page-funnel-store";

/**
 * A funnel of pages' own address, /@chef/go/launch (and chef.com/go/launch on
 * the store's own domain): sends the visitor to its first step that can be
 * shown, with the funnel's mark (lib/page-funnel.ts). Whatever the link
 * carried — utm tags, an affiliate's code — goes along, so the step is
 * credited exactly as a link straight to it would be.
 *
 * An inactive funnel is unavailable, without redirecting to any public step.
 * An address no funnel has leads to the store.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ handle: string; funnel: string }> }) {
  const { handle: raw, funnel: slug } = await params;
  const origin = originFrom(request);
  const away = (path: string) =>
    new Response(null, { status: 307, headers: { Location: `${origin}${path}`, "Cache-Control": "no-store" } });

  const decoded = decodeURIComponent(raw);
  if (!decoded.startsWith("@")) return new Response("Not found", { status: 404 });
  const store = await storeForPage(normaliseHandle(decoded));
  if (!store) return new Response("Not found", { status: 404 });
  if (store.suspended) return away(`/@${store.handle}`);

  const funnel = (await readPageFunnels(store.statsId).catch(() => [])).find((f) => f.slug === slug.toLowerCase()) ?? null;
  if (!funnel) return away(`/@${store.handle}`);
  if (!funnel.on) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  const states = await stepStates(store, funnel);
  const first = nextOpen(funnel, -1, (step) => states.find((s) => s.step === step)?.open ?? false);
  const path = first >= 0 ? states[first].path : null;
  if (!path) return away(`/@${store.handle}`);

  // What the link carried, kept; a mark of another funnel, dropped.
  const carried = new URLSearchParams(request.nextUrl.searchParams);
  carried.delete("f");
  const query = carried.toString();
  const target = withMark(path, funnel.id);
  return away(query ? `${target}${target.includes("?") ? "&" : "?"}${query}` : target);
}
