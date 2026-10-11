import type { NextRequest } from "next/server";
import { cronAllowed } from "@/lib/request-guard";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { isBillingConfigured } from "@/lib/billing";
import { sendFailedPlanNotices, sendReminders } from "@/lib/billing-reminders";
import { runBreaks } from "@/lib/plan-pause";

/**
 * Run on a schedule by Vercel: warns every creator before a trial turns into
 * a charge, and before a yearly plan renews, and tells one whose payment
 * failed where to pay it. And ends the breaks creators chose: told a week
 * before, and the plan started again on the day (lib/plan-pause.ts).
 *
 * Safe to run more than once: each charge is warned of once, only to the person
 * paying it, and one run at a time.
 */
export async function GET(request: NextRequest) {
  // Vercel sends the secret with every scheduled run, compared here in
  // constant time. Without one set, only a local development server runs the
  // job on request; in production that is a closed door, not an open one.
  if (!(await cronAllowed(request))) {
    return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (!isRedisConfigured() || !isBillingConfigured()) {
    return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  }
  const [got] = await redisPipeline([["SET", "nl:remind:lock", "1", "NX", "EX", 300]]);
  if (got === null) return Response.json({ ok: true, busy: true });
  try {
    const counts = await sendReminders();
    const failed = await sendFailedPlanNotices();
    const breaks = await runBreaks();
    return Response.json({ ok: true, ...counts, failedPayments: failed, breaks }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("sending billing reminders failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  } finally {
    await redisPipeline([["DEL", "nl:remind:lock"]]).catch(() => {});
  }
}
