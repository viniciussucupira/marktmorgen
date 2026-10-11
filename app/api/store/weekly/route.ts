import type { NextRequest } from "next/server";
import { normaliseHandle } from "@/lib/store";
import { setWeeklyOff, weeklyTokenOk } from "@/lib/stats-report";

/**
 * Stops — or starts again — a store's weekly email, from the link at the foot
 * of the email itself (lib/stats-report.ts). The link carries the store and a
 * token signed for it, so nobody can stop somebody else's. A GET only shows
 * the button: mail apps open links to check them, and a stop must be a press.
 */
function page(title: string, body: string, status = 200): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;color:#1d1b29}button{font:inherit;padding:.6rem 1.1rem;border-radius:.6rem;border:0;background:#5b3fd6;color:#fff;cursor:pointer}</style></head><body>${body}</body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function read(request: NextRequest): { handle: string; token: string } | null {
  const params = request.nextUrl.searchParams;
  const handle = normaliseHandle((params.get("h") ?? "").slice(0, 40));
  const token = (params.get("t") ?? "").slice(0, 64);
  return handle && weeklyTokenOk(handle, token) ? { handle, token } : null;
}

export async function GET(request: NextRequest) {
  const asked = read(request);
  if (!asked) return page("Link not recognized", "<p>This link is not one we recognize. Your weekly email can also be stopped by replying to it.</p>", 400);
  const action = `/api/store/weekly?h=${encodeURIComponent(asked.handle)}&t=${encodeURIComponent(asked.token)}`;
  return page(
    "Weekly email",
    `<h1>Your weekly numbers</h1><p>Every Monday we email the week of your store, @${esc(asked.handle)}, while it has visitors.</p><form method="post" action="${esc(action)}"><input type="hidden" name="do" value="off"><button>Stop the weekly email</button></form>`,
  );
}

export async function POST(request: NextRequest) {
  const asked = read(request);
  if (!asked) return page("Link not recognized", "<p>This link is not one we recognize.</p>", 400);
  const form = await request.formData().catch(() => null);
  const off = form?.get("do") !== "on";
  await setWeeklyOff(asked.handle, off);
  const action = `/api/store/weekly?h=${encodeURIComponent(asked.handle)}&t=${encodeURIComponent(asked.token)}`;
  return off
    ? page(
        "Weekly email stopped",
        `<h1>Stopped</h1><p>You will not get the weekly email for @${esc(asked.handle)} anymore. Your numbers are always in your studio.</p><form method="post" action="${esc(action)}"><input type="hidden" name="do" value="on"><button>Start it again</button></form>`,
      )
    : page("Weekly email on", `<h1>On again</h1><p>The weekly email for @${esc(asked.handle)} will come every Monday while your store has visitors.</p>`);
}
