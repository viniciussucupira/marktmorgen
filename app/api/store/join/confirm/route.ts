import { type NextRequest, after } from "next/server";
import { originFrom } from "@/lib/request-origin";
import { storeForHandle } from "@/lib/store";
import { fromAnotherSite, limited } from "@/lib/request-guard";
import { JOIN_TOKEN, confirmJoin, readJoinToken } from "@/lib/store-join";
import { enroll } from "@/lib/flows";
import { queuePerson } from "@/lib/email-sync";
import { allowedBy, newLeadId, sendServerLead, sendsFromServer } from "@/lib/ad-events";

/** The button on the page an emailed sign-up link opens: the address joins the creator's list. */
export async function POST(request: NextRequest) {
  const origin = originFrom(request);
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });
  let token = "";
  try {
    const form = await (await limited(request, 1_000)).formData();
    token = String(form.get("token") ?? "").slice(0, 60);
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const grant = JOIN_TOKEN.test(token) ? await readJoinToken(token) : null;
  const store = grant ? await storeForHandle(grant.h) : null;
  if (!grant || !store) return new Response(null, { status: 303, headers: { Location: grant ? `${origin}/@${grant.h}/join?status=expired` : `${origin}/`, "Cache-Control": "no-store" } });
  let status = "error";
  let lead = "";
  try {
    const result = await confirmJoin(token, store);
    status = result.ok ? "joined" : result.reason;
    if (result.ok) {
      // The creator's welcome sequence, when they have one for people who join,
      // and their own email platform, when they connected one (lib/email-sync.ts).
      await enroll(store, result.grant.e, { joined: result.added.joined });
      // Asked from one of the store's forms: a sequence that starts with that form starts now, on confirming.
      if (result.grant.f) await enroll(store, result.grant.e, { joined: false, form: result.grant.f });
      // Joining the list, as a lead to the creator's ad platforms, with the visitor's yes (lib/ad-events.ts).
      if (sendsFromServer(store) && allowedBy(request, store)) {
        const id = newLeadId();
        lead = id;
        after(() => sendServerLead(store, request, { id, email: result.grant.e, product: "email-list" }).catch((error) => console.error("sending a lead failed", error)));
      }
      const at = Date.now();
      after(() =>
        queuePerson(store, { source: "free", email: result.grant.e, products: [], consent: true, seed: `join|${result.grant.e}|${result.grant.at}`, at }).catch((error) =>
          console.error("sending a sign-up to an email platform failed", error),
        ),
      );
    }
  } catch (error) {
    console.error("confirming a sign-up failed", error);
  }
  return new Response(null, { status: 303, headers: { Location: `${origin}/@${store.handle}/join?status=${status}${lead ? `&e=${lead}` : ""}`, "Cache-Control": "no-store" } });
}
