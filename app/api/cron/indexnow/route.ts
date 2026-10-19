import type { NextRequest } from "next/server";
import { cronAllowed } from "@/lib/request-guard";
import { announceNewPages } from "@/lib/indexnow";

export const maxDuration = 60;

/**
 * Run every day by Vercel: tells Bing and the other IndexNow engines about
 * pages of the sitemap they have not been told about (lib/indexnow.ts). Only
 * the production deployment announces, because only it serves the key at
 * marktmorgen.com. Nobody else can start it: only Vercel's scheduled call
 * carries the secret.
 */
export async function GET(request: NextRequest) {
  if (!(await cronAllowed(request))) {
    return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (process.env.VERCEL_ENV !== "production") {
    return Response.json({ ok: true, skipped: "not production" }, { headers: { "Cache-Control": "no-store" } });
  }
  const result = await announceNewPages();
  console.log(`indexnow: ${JSON.stringify(result)}`);
  return Response.json(result, { status: result.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
