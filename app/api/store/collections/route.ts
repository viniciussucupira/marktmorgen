import type { NextRequest } from "next/server";
import { StoreFullError, setCollections } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";
import { MAX_COLLECTIONS, MAX_COLLECTION_PRODUCTS } from "@/lib/store-collections";

/**
 * Saves the store's collections (lib/store-collections.ts): all of them at
 * once, `{ collections: [{ id?, title, blurb, products: [id, …] }] }`, an
 * empty list for none. Part of how the store is laid out, so it needs the
 * "page" permission. A collection sent without an id, or with one this store
 * does not have, is a new one and is given its own.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "page", 24_000);
  if (!guarded.ok) return guarded.response;
  try {
    const result = await setCollections(guarded.ref, guarded.body.collections);
    if (!result.ok) {
      const status = result.reason === "none" ? 404 : 400;
      return Response.json({ ok: false, error: result.reason, max: MAX_COLLECTIONS, maxProducts: MAX_COLLECTION_PRODUCTS }, { status });
    }
    return Response.json({ ok: true, collections: result.store.collections ?? [] });
  } catch (error) {
    if (error instanceof StoreFullError) return Response.json({ ok: false, error: "store_full" }, { status: 409 });
    console.error("saving a store's collections failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
