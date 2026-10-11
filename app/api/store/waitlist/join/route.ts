import { after } from "next/server";
import { countHit } from "@/lib/visit";
import type { NextRequest } from "next/server";
import { linkOrigin, originFrom } from "@/lib/request-origin";
import { normaliseHandle, storeForHandle } from "@/lib/store";
import { clientAddress, fromAnotherSite, limited } from "@/lib/request-guard";
import { readListing } from "@/lib/catalog";
import { joinWaitlist } from "@/lib/waitlist";

const MAX_BODY_BYTES = 2_000;

/**
 * Joins a product's waitlist: a plain form, like the buy button. The answer
 * is always the waitlist page, and the address typed never goes in its URL.
 */
export async function POST(request: NextRequest) {
  const origin = originFrom(request);
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });
  let handle = "";
  let productId = "";
  let email = "";
  let consent = false;
  let honeypot = "";
  try {
    const form = await (await limited(request, MAX_BODY_BYTES)).formData();
    const read = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" ? value : "";
    };
    handle = normaliseHandle(read("handle"));
    productId = read("product").slice(0, 40);
    email = read("email").slice(0, 300);
    consent = read("consent") === "yes";
    honeypot = read("website");
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const store = handle ? await storeForHandle(handle) : null;
  if (!store) return new Response("No such store.", { status: 404 });
  const product = productId ? await readListing(store, productId) : null;
  const away = (status: string) =>
    new Response(null, {
      status: 303,
      headers: { Location: `${origin}/@${store.handle}/waitlist?product=${encodeURIComponent(productId)}&status=${status}`, "Cache-Control": "no-store" },
    });
  if (!product || product.hidden) return new Response(null, { status: 303, headers: { Location: `${origin}/@${store.handle}` } });
  if (honeypot.trim()) return away("sent");
  try {
    const result = await joinWaitlist({ store, product, email, consent, ip: clientAddress(request), origin: linkOrigin(request, store) });
    // Counted under the channel the visitor came from (lib/visit-channel.ts).
    if (result === "sent") after(() => countHit(request, store, { kind: "signup" }));
    return away(result);
  } catch (error) {
    console.error("joining a waitlist failed", error);
    return away("error");
  }
}
