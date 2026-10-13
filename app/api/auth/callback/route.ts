import type { NextRequest } from "next/server";
import { originFrom } from "@/lib/request-origin";
import {
  DEVICE_COOKIE,
  SESSION_COOKIE,
  emailForSession,
  endSession,
  noteSignIn,
  openSession,
  sessionCookie,
  takeSignInLink,
} from "@/lib/auth";
import { HOLD_SECONDS, TWO_STEP_COOKIE, endRecoveryAccess, holdSignIn, resetIfDue, twoStepOn } from "@/lib/two-step";
import { fromAnotherSite, limited } from "@/lib/request-guard";

/**
 * Finishing the emailed link.
 *
 * A GET spends nothing. Mail filters fetch every link in a message to inspect
 * it, and a one-time link that a GET could spend would be used up before the
 * creator ever tapped it. So a GET only carries the token to the page that
 * asks for a tap, and the POST that tap makes is what opens the session.
 */

function redirectTo(origin: string, path: string) {
  return new Response(null, {
    status: 303,
    headers: { Location: `${origin}${path}` },
  });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const origin = originFrom(request);
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return redirectTo(origin, "/signin?status=expired");
  }
  return redirectTo(origin, `/signin/confirm?token=${token}`);
}

export async function POST(request: NextRequest) {
  const origin = originFrom(request);

  // A form on another site must not be able to sign this browser into an
  // account of the attacker's choosing.
  // Refused before anything else is read: another site, by Origin or by
  // Sec-Fetch-Site (lib/request-guard.ts).
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });

  let token = "";
  try {
    const form = await (await limited(request, 8_000)).formData();
    const value = form.get("token");
    token = typeof value === "string" ? value : "";
  } catch {
    return redirectTo(origin, "/signin?status=expired");
  }

  let sessionId: string | null = null;
  try {
    const owner = await takeSignInLink(token);
    // Two-step login (lib/two-step.ts): the link is spent, and the session
    // waits for the app's code, behind a cookie of this browser alone.
    // A request to turn it off that has waited its days turns it off here, and the link logs in alone.
    if (owner && (await twoStepOn(owner)) && !(await resetIfDue(owner))) {
      const held = await holdSignIn(owner);
      const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
      const response = redirectTo(origin, "/signin/code");
      response.headers.append("Set-Cookie", `${TWO_STEP_COOKIE}=${held}; Path=/; Max-Age=${HOLD_SECONDS}; HttpOnly; SameSite=Lax${secure}`);
      return response;
    }
    sessionId = owner ? await openSession(owner) : null;
    // The sign-in inbox itself: what the recovery address opened is closed (lib/recovery-address.ts).
    if (owner) await endRecoveryAccess(owner).catch((error) => console.error("closing a recovery login failed", error));
  } catch (error) {
    console.error("sign-in callback failed", error);
  }

  if (!sessionId) {
    return redirectTo(origin, "/signin?status=expired");
  }

  // A session this browser already held is closed, not kept alongside: the
  // new one is always freshly made here, and nothing set before signing in —
  // by another tab, another person on this computer, or a planted cookie —
  // outlives the sign-in.
  const previous = request.cookies.get(SESSION_COOKIE)?.value;
  if (previous && previous !== sessionId) await endSession(previous);

  const response = redirectTo(origin, "/studio");
  response.headers.append("Set-Cookie", sessionCookie(sessionId));
  // A browser this account has never signed in from is worth an email
  // (lib/auth.ts, noteSignIn); the cookie that names the browser goes back.
  const email = await emailForSession(sessionId);
  if (email) {
    response.headers.append(
      "Set-Cookie",
      await noteSignIn(email, request.cookies.get(DEVICE_COOKIE)?.value, "link", request.headers.get("user-agent") ?? ""),
    );
  }
  return response;
}
