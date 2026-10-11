import type { NextRequest } from "next/server";
import { normaliseHandle, storeForHandle } from "@/lib/store";
import { affiliateCookieName, affiliateForSession } from "@/lib/affiliates";
import { draftKit } from "@/lib/affiliate-kit";
import { MAX_KIT_NOTE } from "@/lib/affiliate-kit-rules";
import { fromAnotherSite, limited, withinLimit } from "@/lib/request-guard";

/**
 * A signed-in, approved affiliate asking for three posts about one of the
 * store's products (lib/affiliate-kit.ts): `{ handle, product, note }`.
 * Answers `{ ok, posts: { x, instagram, linkedin }, left }`, each post with
 * the affiliate's own link and the line saying they earn from it already in
 * it, or `{ ok: false, error }`.
 */
export async function POST(request: NextRequest) {
  if (fromAnotherSite(request)) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    body = (await (await limited(request, 4_000)).json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const read = (key: string, max: number) => (typeof body[key] === "string" ? (body[key] as string).slice(0, max) : "");
  const handle = normaliseHandle(read("handle", 60));
  const store = handle ? await storeForHandle(handle) : null;
  if (!store) return Response.json({ ok: false, error: "unknown" }, { status: 404 });
  const affiliate = await affiliateForSession(store, request.cookies.get(affiliateCookieName(store.handle))?.value);
  if (!affiliate) return Response.json({ ok: false, error: "signedout" }, { status: 401 });
  if (!(await withinLimit("aff-kit", `${store.handle}|${affiliate.id}`, 3, 60))) return Response.json({ ok: false, error: "slow" }, { status: 429 });
  const result = await draftKit(store, affiliate, read("product", 40), read("note", MAX_KIT_NOTE * 2));
  if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: result.reason === "failed" ? 502 : 400 });
  return Response.json({ ok: true, posts: result.posts, left: result.left }, { headers: { "Cache-Control": "no-store" } });
}
