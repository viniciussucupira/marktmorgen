import type { NextRequest } from "next/server";
import { finishConnect } from "@/lib/meet-routes";
import { SESSION_COOKIE, emailForSession } from "@/lib/auth";
import { finishSearchConsole, isSearchConsoleState } from "@/lib/search-console";
import { originFrom } from "@/lib/request-origin";

/**
 * Where Google sends the person back after its consent page: the redirect
 * address registered with it, https://marktmorgen.com/api/integrations/google/callback.
 * A creator connecting Google Calendar (lib/meet-routes.ts checks the state,
 * the session and the store), or the person who runs the site connecting
 * Search Console (lib/search-console.ts), told apart by the state.
 */
export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state") ?? "";
  if (isSearchConsoleState(state)) {
    const email = await emailForSession(request.cookies.get(SESSION_COOKIE)?.value ?? "").catch(() => null);
    const error = request.nextUrl.searchParams.get("error");
    const result = await finishSearchConsole(state, error ? "" : request.nextUrl.searchParams.get("code") ?? "", email);
    return new Response(null, { status: 303, headers: { Location: `${originFrom(request)}/studio?gsc=${result}#numbers`, "Cache-Control": "no-store" } });
  }
  return finishConnect(request, "google");
}
