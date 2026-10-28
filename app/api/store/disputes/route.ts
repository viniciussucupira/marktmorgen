import type { NextRequest } from "next/server";
import { guardStoreWrite } from "@/lib/store-request";
import { readDisputePurchaseReview } from "@/lib/dispute-purchase-review";

export const maxDuration = 15;
function privateResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("Vary", "Cookie, x-nimbus-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
/** Read only. Export permission retains the existing role and two-step checks. */
export async function POST(request: NextRequest) {
  try {
    const guarded = await guardStoreWrite(request, "export", 1_000);
    if (!guarded.ok) return privateResponse(guarded.response);
    const id = typeof guarded.body.dispute === "string" ? guarded.body.dispute.trim() : "";
    if (guarded.body.action !== "review" || !/^du_[A-Za-z0-9]{1,128}$/.test(id)) {
      return privateResponse(Response.json({ ok: false, reason: "invalid" }, { status: 400 }));
    }
    // Account and store come only from authenticated access, never the body.
    const result = await readDisputePurchaseReview(guarded.store, id);
    return privateResponse(Response.json(result, { status: result.ok ? 200 : result.reason === "invalid" ? 400 : result.reason === "unavailable" ? 503 : 409 }));
  } catch {
    return privateResponse(Response.json({ ok: false, reason: "unavailable" }, { status: 503 }));
  }
}
