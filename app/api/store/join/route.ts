import { after } from "next/server";
import { countHit } from "@/lib/visit";
import type { NextRequest } from "next/server";
import { linkOrigin, originFrom } from "@/lib/request-origin";
import { normaliseHandle, storeForHandle } from "@/lib/store";
import { clientAddress, fromAnotherSite, limited } from "@/lib/request-guard";
import { askToJoin } from "@/lib/store-join";
import { listedReturn, listedSite, scriptMode, scriptTags, withTags } from "@/lib/embed-sites";

const MAX_BODY_BYTES = 2_000;

/**
 * The sign-up box on a store page (lib/store-join.ts): a plain form, so it
 * works without JavaScript. The answer is always the store's join page, and
 * the address typed never goes in its URL.
 *
 * The same form opened by the checkout script (app/embed/[handle]/join) says
 * so (`embed`: overlay or page), and is answered on that page instead, with
 * the listed site it is on and the address to send the person back to, each
 * checked against the store's list again (lib/embed-sites.ts). The site is
 * kept with the request to join, for the list.joined webhook.
 */
export async function POST(request: NextRequest) {
  const origin = originFrom(request);
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });
  let handle = "";
  let email = "";
  let honeypot = "";
  let clicks = false;
  let embed: ReturnType<typeof scriptMode> = null;
  let siteAsked = "";
  let returnAsked = "";
  const tagsAsked: Record<string, string> = {};
  try {
    const form = await (await limited(request, MAX_BODY_BYTES)).formData();
    const read = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" ? value : "";
    };
    handle = normaliseHandle(read("handle"));
    email = read("email").slice(0, 300);
    honeypot = read("website");
    // Its own box under the address, empty unless ticked (lib/mail-clicks.ts).
    clicks = read("clicks") === "yes";
    embed = scriptMode(read("embed"));
    siteAsked = read("site").slice(0, 300);
    returnAsked = read("return").slice(0, 700);
    for (const name of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) tagsAsked[name] = read(name).slice(0, 60);
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const store = handle ? await storeForHandle(handle) : null;
  if (!store) return new Response("No such store.", { status: 404 });
  const site = embed ? listedSite(store.embedSites, siteAsked) : null;
  const back = embed ? listedReturn(store.embedSites, returnAsked) : null;
  const answerPage = (status: string) =>
    embed
      ? withTags(`/embed/${encodeURIComponent(store.handle)}/join?mm=${embed}`, scriptTags(tagsAsked), { status, site, return: back })
      : `/@${store.handle}/join?status=${status}`;
  const away = (status: string) =>
    new Response(null, { status: 303, headers: { Location: `${origin}${answerPage(status)}`, "Cache-Control": "no-store" } });
  // A field no person can see: whatever filled it in is told it worked, and nothing is sent.
  if (honeypot.trim()) return away("sent");
  try {
    const result = await askToJoin({ store, email, clicks, ip: clientAddress(request), origin: linkOrigin(request, store), site: site ?? undefined });
    // Counted under the channel the visitor came from (lib/visit-channel.ts).
    if (result === "sent") after(() => countHit(request, store, { kind: "signup" }));
    return away(result);
  } catch (error) {
    console.error("joining a store's list failed", error);
    return away("error");
  }
}
