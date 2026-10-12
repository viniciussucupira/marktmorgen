import { channelOfRequest } from "@/lib/visit-channel";
import { adsCheckout } from "@/lib/ad-events";
import { type NextRequest, after } from "next/server";
import { linkOrigin, originFrom } from "@/lib/request-origin";
import { normaliseHandle, storeForHandle } from "@/lib/store";
import { canSellProduct } from "@/lib/store-checkout";
import { isCallProduct } from "@/lib/calls";
import { countHit } from "@/lib/visit";
import { fromAnotherSite, limited } from "@/lib/request-guard";
import { readListing } from "@/lib/catalog";
import { isSoon } from "@/lib/waitlist";
import { packageCheckout } from "@/lib/call-packages";

/** "Buy 5 sessions": opens the checkout for a call's package, at the creator's price for it. */
export async function POST(request: NextRequest) {
  const origin = originFrom(request);
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });
  let handle = "";
  let productId = "";
  try {
    const form = await (await limited(request, 1_000)).formData();
    handle = normaliseHandle(String(form.get("handle") ?? ""));
    productId = String(form.get("product") ?? "").slice(0, 40);
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const store = handle ? await storeForHandle(handle) : null;
  if (!store) return new Response("No such store.", { status: 404 });
  const product = productId ? await readListing(store, productId) : null;
  const away = (path: string) => new Response(null, { status: 303, headers: { Location: `${origin}${path}`, "Cache-Control": "no-store" } });
  if (!product || !isCallProduct(product) || product.call.kind !== "weekly" || !product.callPackage) return away(`/@${store.handle}`);
  if (!canSellProduct(store, product) || (await isSoon(store, product.id).catch(() => false))) return away(`/@${store.handle}/book/${product.id}?status=unavailable`);
  try {
    const made = await packageCheckout(
      store,
      product,
      product.callPackage,
      linkOrigin(request, store),
      { ...channelOfRequest(request, store.handle, new URL(origin).hostname, Date.now() / 1000, store.attributionDays), ...(await adsCheckout(request, store)) },
    );
    after(() => countHit(request, store, { kind: "checkout", id: product.id }));
    return new Response(null, { status: 303, headers: { Location: made.url, "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("opening a package checkout failed", error);
    return away(`/@${store.handle}/book/${product.id}?status=error`);
  }
}
