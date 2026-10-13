import type { NextRequest } from "next/server";
import { linkOrigin, originFrom } from "@/lib/request-origin";
import { fromAnotherSite, limited } from "@/lib/request-guard";
import { clientIp } from "@/lib/visit";
import { sendLostEmailLink } from "@/lib/recovery-address";

/**
 * /signin/lost's form (lib/recovery-address.ts): a link to the recovery
 * address of the account that logs in with the address typed. The answer is
 * the same whether or not there is one, so it says nothing about who has an account.
 */
export async function POST(request: NextRequest) {
  const origin = originFrom(request);
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });
  let email = "";
  try {
    const form = await (await limited(request, 2_000)).formData();
    const value = form.get("email");
    email = typeof value === "string" ? value.slice(0, 300) : "";
  } catch {
    email = "";
  }
  try {
    await sendLostEmailLink(email, clientIp(request), linkOrigin(request));
  } catch (error) {
    console.error("sending a recovery-address link failed", error);
  }
  return new Response(null, { status: 303, headers: { Location: `${origin}/signin/lost?status=sent`, "Cache-Control": "no-store" } });
}
