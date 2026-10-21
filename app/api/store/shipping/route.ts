import type { NextRequest } from "next/server";
import { guardStoreWrite, text } from "@/lib/store-request";
import { StoreFullError, setProductShipping } from "@/lib/store";
import { readMoney } from "@/lib/money";
import { parseShipping, readShippingSku } from "@/lib/shipping";

/**
 * Makes a product a physical one the creator ships, or an ordinary one again
 * (lib/shipping.ts): `{ id, shipping: { price: "5", region: "na", countries:
 * ["US", "CA"], note: "Ships within 3 business days" } }` or `{ id, shipping:
 * null }`. The price is read as text in the store's own currency, as every
 * price the studio sends is (lib/money.ts); empty or 0 is free shipping.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "products", 8_000);
  if (!guarded.ok) return guarded.response;
  const { body, store, ref } = guarded;
  const id = text(body.id, 40);
  if (!id) return Response.json({ ok: false, error: "unknown" }, { status: 400 });
  let shipping = null;
  if (body.shipping !== null) {
    const raw = body.shipping && typeof body.shipping === "object" ? (body.shipping as Record<string, unknown>) : {};
    const typed = text(raw.price, 12).trim();
    const cents = typed === "" ? 0 : readMoney(typed, store.currency);
    if (cents === null) return Response.json({ ok: false, error: "ship_price" }, { status: 400 });
    const sku = readShippingSku(raw.sku);
    if (sku === null) return Response.json({ ok: false, error: "ship_sku" }, { status: 400 });
    shipping = parseShipping({ cents, region: raw.region, countries: raw.countries, note: raw.note, ...(Object.hasOwn(raw, "sku") ? { sku } : {}) });
    if (!shipping) return Response.json({ ok: false, error: "ship_countries" }, { status: 400 });
  }
  try {
    const result = await setProductShipping(ref, id, shipping);
    if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: result.reason === "unknown" ? 404 : 400 });
    return Response.json({ ok: true, product: result.product });
  } catch (error) {
    if (error instanceof StoreFullError) return Response.json({ ok: false, error: "store_full" }, { status: 409 });
    console.error("saving shipping failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
