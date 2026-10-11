/**
 * Counting from inside a request: who is asking, and whether it is the
 * creator looking at their own store, which is never counted.
 */
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, emailForSession } from "@/lib/auth";
import { type HitKind, isBot, recordHit } from "@/lib/stats";
import type { Store } from "@/lib/store";
import { affiliateCookieName, recordClick } from "@/lib/affiliates";
import { recordVisit } from "@/lib/traffic";
import { countryOf, deviceOf } from "@/lib/source-rules";
import { channelOfRequest } from "@/lib/visit-channel";
import { requestHost } from "@/lib/request-origin";

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function isOwner(request: NextRequest, store: Store): Promise<boolean> {
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) return false;
  const email = await emailForSession(session).catch(() => null);
  return Boolean(email) && email!.toLowerCase() === store.email.toLowerCase();
}

/**
 * Counts one visit, checkout or link, unless it is the owner's own. Never
 * throws: a count that fails must not stop a sale or a page.
 */
export async function countHit(
  request: NextRequest,
  store: Store,
  hit: { kind: HitKind; id?: string; source?: string; medium?: string; campaign?: string; free?: boolean },
): Promise<void> {
  try {
    if (await isOwner(request, store)) return;
    const userAgent = request.headers.get("user-agent") ?? "";
    await recordHit(store, {
      ...hit,
      ip: clientIp(request),
      userAgent,
      // A view says where and on what (lib/stats.ts); a checkout says which
      // channel it came from, read the way the sale itself is credited.
      ...(hit.kind === "view" ? { country: countryOf(request.headers.get("x-vercel-ip-country")), device: deviceOf(userAgent) } : {}),
      ...(hit.kind === "checkout" ? { channel: channelOfRequest(request, store.handle, requestHost(request)).channel } : {}),
    });
  } catch (error) {
    console.error("counting a visit failed", error);
  }
}

/**
 * Counts a visit to the store toward the visits its plan covers
 * (lib/traffic.ts): one for each person each day, whichever of its pages
 * they open. Never the owner's own, and never a robot's that says it is
 * one. Never throws, like countHit.
 */
export async function countVisit(request: NextRequest, store: Store): Promise<void> {
  try {
    if (isBot(request.headers.get("user-agent") ?? "") || (await isOwner(request, store))) return;
    await recordVisit(store, clientIp(request));
  } catch (error) {
    console.error("counting a visit toward the plan failed", error);
  }
}

/**
 * Counts a click on an affiliate's link, unless it is the creator's own or a
 * robot's (lib/affiliates.ts does the rest). Never throws, like countHit.
 */
export async function countAffiliateClick(request: NextRequest, store: Store, code: string): Promise<void> {
  try {
    const userAgent = request.headers.get("user-agent") ?? "";
    if (isBot(userAgent) || (await isOwner(request, store))) return;
    await recordClick(store, code, {
      ip: clientIp(request),
      userAgent,
      session: request.cookies.get(affiliateCookieName(store.handle))?.value,
    });
  } catch (error) {
    console.error("counting an affiliate click failed", error);
  }
}
