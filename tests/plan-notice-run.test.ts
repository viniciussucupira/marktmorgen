/**
 * The run that sends a creator's own plan notices (queue 414 [KX1],
 * lib/billing-reminders.ts, sendReminders), against a stand-in Stripe and
 * mail provider, with synthetic subscriptions only. What is checked:
 *
 *   - a yearly notice due on its 30th day is sent once; a second run sends
 *     nothing;
 *   - a notice that was sent is never counted as missed later;
 *   - a notice never sent, found a day or less before the charge, is counted
 *     as missed once, and not sent;
 *   - a failed send is counted as failed, and if the charge then comes too
 *     close, it is counted as missed.
 */
import { sendReminders } from "@/lib/billing-reminders";
import { done, is, part } from "./check";

process.env.STRIPE_SECRET_KEY = "sk_test_notice_run_only";
process.env.RESEND_API_KEY = "re_test_notice_run_only";

const NOW = 1_791_700_000;
const DAY = 86_400;
const TODAY = Math.floor(NOW / DAY) * DAY;
const emails: string[] = [];
let emailWorks = true;
let subscriptions: Record<string, unknown>[] = [];

function yearly(id: string, at: number): Record<string, unknown> {
  return {
    id,
    status: "active",
    created: at - 400 * DAY,
    customer: { email: `${id}@example.com` },
    items: {
      data: [
        {
          current_period_start: at - 365 * DAY,
          current_period_end: at,
          price: { lookup_key: "nimbus_labs_creator_year", unit_amount: 29000, recurring: { interval: "year" } },
        },
      ],
    },
  };
}

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const method = init?.method ?? "GET";
  if (url.hostname === "api.stripe.com" && method === "GET" && url.pathname === "/v1/subscriptions") {
    const status = url.searchParams.get("status");
    return new Response(JSON.stringify({ data: subscriptions.filter((s) => s.status === status), has_more: false }), { status: 200 });
  }
  if (url.hostname === "api.resend.com") {
    if (!emailWorks) return new Response(JSON.stringify({ message: "down" }), { status: 500 });
    const body = JSON.parse(String(init?.body ?? "{}"));
    emails.push(Array.isArray(body.to) ? body.to[0] : body.to);
    return new Response(JSON.stringify({ id: "re_1" }), { status: 200 });
  }
  return new Response("{}", { status: 404 });
}) as typeof fetch;

async function main() {
  const charge = TODAY + 30 * DAY + 5 * 3600;

  part("sent once on the 30th day, never counted as missed");
  {
    subscriptions = [yearly("sub_noticerun01", charge)];
    const first = await sendReminders(NOW);
    is("the first run sends one notice, on time", [first.sent, first.late, first.missed], [1, 0, 0]);
    const again = await sendReminders(NOW + 3600);
    is("a second run sends nothing", [again.sent, again.missed], [0, 0]);
    const close = await sendReminders(charge - 12 * 3600);
    is("half a day before the charge it is not counted as missed", [close.sent, close.missed], [0, 0]);
    is("one email in all", emails.filter((to) => to.startsWith("sub_noticerun01")).length, 1);
  }

  part("never sent, found half a day before the charge");
  {
    const at = TODAY + 40 * DAY;
    subscriptions = [yearly("sub_noticerun02", at)];
    const missed = await sendReminders(at - 12 * 3600);
    is("counted as missed, not sent", [missed.sent, missed.missed], [0, 1]);
    const again = await sendReminders(at - 6 * 3600);
    is("counted once", again.missed, 0);
    is("no email", emails.some((to) => to.startsWith("sub_noticerun02")), false);
  }

  part("a failed send, then too close");
  {
    const at = TODAY + 50 * DAY + 5 * 3600;
    subscriptions = [yearly("sub_noticerun03", at)];
    emailWorks = false;
    const failed = await sendReminders(at - 30 * DAY);
    is("the send failed and is counted as failed", [failed.sent, failed.failed], [0, 1]);
    emailWorks = true;
    const missed = await sendReminders(at - 12 * 3600);
    is("half a day before the charge it is counted as missed", [missed.sent, missed.missed], [0, 1]);
  }
  done();
}

main();
