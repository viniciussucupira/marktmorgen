import type { NextRequest } from "next/server";
import { countLeave } from "@/lib/leave-flow";
import { originFrom } from "@/lib/request-origin";
import { normaliseHandle, storeForHandle } from "@/lib/store";
import { MANAGE_TOKEN_PATTERN } from "@/lib/membership-manage";
import { switchTier } from "@/lib/tier-switch";
import { clientAddress, fromAnotherSite, limited, withinLimit } from "@/lib/request-guard";

const MAX_BODY_BYTES = 1_000;

/**
 * The "Switch now" button on the page that showed what a switch costs
 * (app/[handle]/manage/switch). Only this changes anything, at the second
 * that page's figure was worked out for (lib/tier-switch.ts). Guarded as the
 * other buttons on the member's page are.
 */
export async function POST(request: NextRequest) {
  const origin = originFrom(request);
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });
  if (Number(request.headers.get("content-length") ?? "0") > MAX_BODY_BYTES) {
    return new Response("Too large", { status: 413 });
  }

  let handle = "";
  let token = "";
  let subscription = "";
  let target = "";
  let at = NaN;
  let fromLeave = false;
  try {
    const form = await (await limited(request, MAX_BODY_BYTES)).formData();
    const read = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" ? value : "";
    };
    handle = normaliseHandle(read("handle"));
    token = read("token").slice(0, 80);
    subscription = read("sub").slice(0, 80);
    target = read("to").slice(0, 40);
    fromLeave = read("from") === "leave";
    at = /^\d{9,11}$/.test(read("at")) ? Number(read("at")) : NaN;
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (!handle) return new Response("Bad request", { status: 400 });

  const store = await storeForHandle(handle);
  if (!store) return new Response("No such store.", { status: 404 });

  const back = (status: string) =>
    new Response(null, {
      status: 303,
      headers: {
        Location: `${origin}/@${store.handle}/manage?status=${status}${MANAGE_TOKEN_PATTERN.test(token) ? `&token=${token}` : ""}`,
        "Cache-Control": "no-store",
      },
    });

  if (!MANAGE_TOKEN_PATTERN.test(token)) return back("expired");
  if (!(await withinLimit("tier-switch", `${clientAddress(request)}|${store.handle}`, 10, 600))) return back("limited");

  const result = await switchTier(store, token, subscription, target, at);
  // Switched instead of leaving, from the page that asked why (lib/leave-flow.ts).
  if (result.ok && fromLeave && store.leaving.on) await countLeave(store.statsId, "switched");
  return back(result.ok ? "switched" : result.reason === "gone" || result.reason === "tier" ? "cannot-switch" : result.reason);
}
