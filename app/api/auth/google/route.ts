import type { NextRequest } from "next/server";
import { originFrom } from "@/lib/request-origin";
import { clientAddress, fromAnotherSite, limited, withinLimit } from "@/lib/request-guard";
import { beginGoogleSignIn, googleSignInOffered } from "@/lib/google-signin";

/** Logins with Google one browser may start in ten minutes. */
const TRIES = 20;

/**
 * "Continue with Google" (lib/google-signin.ts): a form on /signin posts
 * here, and the answer sends the browser to Google's page with the cookie
 * that ties the answer back to it. Not there while it is switched off.
 */
export async function POST(request: NextRequest) {
  if (!googleSignInOffered()) return new Response("not found", { status: 404 });
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });
  const origin = originFrom(request);
  const back = (status: string) => new Response(null, { status: 303, headers: { Location: `${origin}/signin?status=${status}`, "Cache-Control": "no-store" } });
  if (!(await withinLimit("google-signin", clientAddress(request), TRIES, 10 * 60))) return back("google-slow");

  let handle: unknown = null;
  try {
    handle = (await (await limited(request, 4_000)).formData()).get("handle");
  } catch {
    handle = null;
  }
  try {
    const begun = await beginGoogleSignIn(handle);
    if (!begun) return back("google-error");
    const response = new Response(null, { status: 303, headers: { Location: begun.url, "Cache-Control": "no-store" } });
    response.headers.append("Set-Cookie", begun.cookie);
    return response;
  } catch (error) {
    console.error("starting a login with Google failed", error);
    return back("google-error");
  }
}
