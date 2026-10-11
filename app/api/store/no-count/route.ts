import type { NextRequest } from "next/server";
import { guardStoreWrite } from "@/lib/store-request";
import { MAX_MARKED, NO_COUNT_COOKIE, NO_COUNT_SECONDS, isMarkedDevice, withMark } from "@/lib/no-count";

/**
 * Marks this browser as not to be counted on the store (lib/no-count.ts):
 * `{ on: true }` or `{ on: false }`. For whoever may see the numbers. The
 * answer sets the cookie on this browser only.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "stats", 200);
  if (!guarded.ok) return guarded.response;
  const { store, body } = guarded;
  if (typeof body.on !== "boolean") return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  const value = withMark(request.cookies.get(NO_COUNT_COOKIE)?.value, store.sid, body.on);
  const secure = request.nextUrl.protocol === "https:" ? "; Secure" : "";
  const cookie = value
    ? `${NO_COUNT_COOKIE}=${value}; Path=/; Max-Age=${NO_COUNT_SECONDS}; HttpOnly; SameSite=Lax${secure}`
    : `${NO_COUNT_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
  return Response.json(
    { ok: true, on: isMarkedDevice(value, store.sid), max: MAX_MARKED },
    { headers: { "Set-Cookie": cookie, "Cache-Control": "no-store" } },
  );
}
