import type { NextRequest } from "next/server";
import { cronAllowed } from "@/lib/request-guard";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { isSenderConfigured } from "@/lib/email";
import { storeForHandle } from "@/lib/store";
import { readCourse } from "@/lib/course";
import { sendDripEmails } from "@/lib/learn";
import { SITE_URL } from "@/lib/site-url";
import { staleTaskUploads } from "@/lib/assignment";
import { deleteFile } from "@/lib/file-store";

/**
 * Run on a schedule by Vercel: tells each student when a module of their
 * course opens for them. Once per student and module, one run at a time.
 * And deletes files students uploaded for an assignment and never handed
 * in (lib/assignment.ts), a day on.
 */
export async function GET(request: NextRequest) {
  // Vercel sends the secret with every scheduled run, compared here in
  // constant time. Without one set, only a local development server runs the
  // job on request; in production that is a closed door, not an open one.
  if (!(await cronAllowed(request))) {
    return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (!isRedisConfigured() || !isSenderConfigured()) {
    return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  }
  const [got] = await redisPipeline([["SET", "nl:courses:lock", "1", "NX", "EX", 300]]);
  if (got === null) return Response.json({ ok: true, busy: true });
  try {
    const counts = await sendDripEmails(storeForHandle, readCourse, SITE_URL);
    const stale = await staleTaskUploads().catch(() => [] as string[]);
    if (stale.length) await deleteFile(stale).catch((error: unknown) => console.error("could not delete unused assignment uploads", error));
    return Response.json({ ok: true, ...counts, unusedUploads: stale.length }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("sending course emails failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  } finally {
    await redisPipeline([["DEL", "nl:courses:lock"]]).catch(() => {});
  }
}
