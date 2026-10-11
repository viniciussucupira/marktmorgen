import { after } from "next/server";
import { countHit } from "@/lib/visit";
import type { NextRequest } from "next/server";
import { linkOrigin, originFrom } from "@/lib/request-origin";
import { normaliseHandle, storeForHandle } from "@/lib/store";
import { clientAddress, fromAnotherSite, limited } from "@/lib/request-guard";
import { askToJoin } from "@/lib/store-join";

const MAX_BODY_BYTES = 2_000;

/**
 * The sign-up box on a store page (lib/store-join.ts): a plain form, so it
 * works without JavaScript. The answer is always the store's join page, and
 * the address typed never goes in its URL.
 */
export async function POST(request: NextRequest) {
  const origin = originFrom(request);
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });
  let handle = "";
  let email = "";
  let honeypot = "";
  try {
    const form = await (await limited(request, MAX_BODY_BYTES)).formData();
    const read = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" ? value : "";
    };
    handle = normaliseHandle(read("handle"));
    email = read("email").slice(0, 300);
    honeypot = read("website");
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const store = handle ? await storeForHandle(handle) : null;
  if (!store) return new Response("No such store.", { status: 404 });
  const away = (status: string) =>
    new Response(null, { status: 303, headers: { Location: `${origin}/@${store.handle}/join?status=${status}`, "Cache-Control": "no-store" } });
  // A field no person can see: whatever filled it in is told it worked, and nothing is sent.
  if (honeypot.trim()) return away("sent");
  try {
    const result = await askToJoin({ store, email, ip: clientAddress(request), origin: linkOrigin(request, store) });
    // Counted under the channel the visitor came from (lib/visit-channel.ts).
    if (result === "sent") after(() => countHit(request, store, { kind: "signup" }));
    return away(result);
  } catch (error) {
    console.error("joining a store's list failed", error);
    return away("error");
  }
}
