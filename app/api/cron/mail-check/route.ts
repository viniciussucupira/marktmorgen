import type { NextRequest } from "next/server";
import { cronAllowed } from "@/lib/request-guard";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { NIMBUS_FROM, isSenderConfigured, sendEmail } from "@/lib/email";
import { type Check, verifyAmazonAccount, verifyHostToken, verifyMailLoop } from "@/lib/verify-mail";
import { SUPPORT_EMAIL } from "@/lib/creator-research";

// The senders announce a bounce within seconds and a spam report within a
// minute or so; the run waits up to a hundred seconds for both.
export const maxDuration = 180;

const LAST = "nl:mail-check:last";
const WAIT_MS = 100_000;

/**
 * Run every day by Vercel: a list email's bounce and spam report, all the way
 * out through each sender and back (lib/verify-mail.ts), and the token and
 * key Amazon is reached with. The last answer is kept; the site's own inbox
 * hears when a check fails, and again when all pass after a failure. Nobody
 * else can start it: only Vercel's scheduled call carries the secret.
 */
export async function GET(request: NextRequest) {
  if (!(await cronAllowed(request))) {
    return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (!isRedisConfigured() || !isSenderConfigured()) {
    return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  }
  const [got] = await redisPipeline([["SET", "nl:mail-check:lock", "1", "NX", "EX", 170]]);
  if (got === null) return Response.json({ ok: true, busy: true });
  try {
    let checks: Check[];
    try {
      checks = [...verifyHostToken(), ...(await verifyAmazonAccount()), ...(await verifyMailLoop(Date.now() + WAIT_MS))];
    } catch (error) {
      checks = [{ check: "the run itself", ok: false, detail: error instanceof Error ? error.message : "failed" }];
    }
    const ok = checks.length > 0 && checks.every((c) => c.ok);
    // In Vercel's logs for every run, passing or not.
    console.log(`mail-check ${ok ? "pass" : "FAIL"}: ${checks.map((c) => `${c.ok ? "PASS" : "FAIL"} ${c.check} (${c.detail})`).join(" | ")}`);
    const [previous] = await redisPipeline([["GET", LAST]]);
    const failedBefore = typeof previous === "string" && previous.includes('"ok":false');
    await redisPipeline([["SET", LAST, JSON.stringify({ at: Date.now(), ok, checks }), "EX", 30 * 86_400]]);
    if (!ok || failedBefore) {
      await sendEmail({ meter: { by: "company" },
        from: NIMBUS_FROM,
        to: SUPPORT_EMAIL,
        subject: ok ? "Mail check: all passing again" : "Mail check failed: a bounce or a spam report is not finding its way back",
        text: [
          ok
            ? "Every check of the way a bounce and a spam report travel back from the senders passes again."
            : "A check of the way a bounce or a spam report travels back from a sender failed. Until it passes, a store with a bad list may not be stopped by itself.",
          "",
          ...checks.map((c) => `${c.ok ? "PASS" : "FAIL"}  ${c.check}\n      ${c.detail}`),
        ].join("\n"),
      }).catch((error) => console.error("sending the mail check result failed", error));
    }
    return Response.json({ ok, checks }, { headers: { "Cache-Control": "no-store" } });
  } finally {
    await redisPipeline([["DEL", "nl:mail-check:lock"]]).catch(() => {});
  }
}
