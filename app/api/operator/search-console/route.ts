import type { NextRequest } from "next/server";
import { SESSION_COOKIE, emailForSession } from "@/lib/auth";
import { fromAnotherSite } from "@/lib/request-guard";
import { originFrom } from "@/lib/request-origin";
import { beginSearchConsole, disconnectSearchConsole, isOperator } from "@/lib/search-console";

/**
 * Connects, or disconnects, our own Search Console (lib/search-console.ts):
 * a form in the studio, shown only to the person who runs the site. Anybody
 * else is answered as if this did not exist.
 */
export async function POST(request: NextRequest) {
  const notFound = new Response("Not found.", { status: 404, headers: { "Cache-Control": "no-store" } });
  if (fromAnotherSite(request)) return notFound;
  const email = await emailForSession(request.cookies.get(SESSION_COOKIE)?.value ?? "").catch(() => null);
  if (!isOperator(email)) return notFound;
  const form = await request.formData().catch(() => null);
  const origin = originFrom(request);
  if (form?.get("action") === "disconnect") {
    await disconnectSearchConsole();
    return new Response(null, { status: 303, headers: { Location: `${origin}/studio?gsc=disconnected#numbers`, "Cache-Control": "no-store" } });
  }
  const url = await beginSearchConsole(email as string);
  if (!url) return new Response(null, { status: 303, headers: { Location: `${origin}/studio?gsc=error#numbers`, "Cache-Control": "no-store" } });
  return new Response(null, { status: 303, headers: { Location: url, "Cache-Control": "no-store" } });
}
