import type { NextRequest } from "next/server";
import { normaliseHandle, storeForHandle } from "@/lib/store";
import { classifySource, cleanTag } from "@/lib/stats";
import { countAffiliateClick, countHit, countVisit } from "@/lib/visit";
import { clientAddress, fromAnotherSite, limited, withinLimit } from "@/lib/request-guard";
import { productIdFor } from "@/lib/catalog";

const MAX_BODY_BYTES = 1_500;

const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

/**
 * A store page saying it was opened, or that one of its links was.
 *
 * Sent by the page itself with sendBeacon, so a visit is counted only when a
 * real browser ran the page — not when a crawler or a link preview fetched
 * it. The answer is always empty: nothing here is worth telling the caller,
 * and a caller probing for stores learns nothing either.
 */
export async function POST(request: NextRequest) {
  // Refused before anything else is read: another site, by Origin or by
  // Sec-Fetch-Site (lib/request-guard.ts).
  if (fromAnotherSite(request)) return done();
  const host = request.headers.get("host");
  if (Number(request.headers.get("content-length") ?? "0") > MAX_BODY_BYTES) return done();

  let body: Record<string, unknown> = {};
  try {
    const raw = await (await limited(request, MAX_BODY_BYTES)).text();
    if (raw.length > MAX_BODY_BYTES) return done();
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {
    return done();
  }
  const read = (key: string, max: number) => (typeof body[key] === "string" ? (body[key] as string).slice(0, max) : "");

  const handle = normaliseHandle(read("h", 40));
  if (!handle) return done();
  const store = await storeForHandle(handle).catch(() => null);
  if (!store) return done();
  // A page sends one of these per visit and per click; a script sending
  // thousands would only inflate the creator's numbers, so it stops counting.
  if (!(await withinLimit("hit", `${clientAddress(request)}|${store.handle}`, 120, 600))) return done();

  const kind = read("k", 2);
  if (kind === "v") {
    const source = classifySource({
      referrer: read("r", 500),
      utm: read("u", 60),
      userAgent: request.headers.get("user-agent") ?? "",
      ownHost: (host ?? "").split(":")[0].toLowerCase(),
    });
    await countHit(request, store, { kind: "view", source, medium: cleanTag(read("m", 60)), campaign: cleanTag(read("g", 60)) });
    // And toward the visits the store's plan covers (lib/traffic.ts).
    await countVisit(request, store);
  } else if (kind === "p") {
    // Another page of the store was opened: a visit all the same. On a
    // product's own page, a person counted for that product too, once a day
    // (lib/stats.ts): what its checkouts and sales are measured against.
    await countVisit(request, store);
    const product = read("p", 40);
    if (product && productIdFor(store, product) === product) await countHit(request, store, { kind: "product", id: product });
  } else if (kind === "l") {
    const id = read("id", 40);
    if (store.links.some((link) => link.id === id)) await countHit(request, store, { kind: "link", id });
  } else if (kind === "a") {
    // A visit through an affiliate's link: counted for them, once a day.
    await countAffiliateClick(request, store, read("c", 20).toLowerCase());
  }
  return done();
}
