/**
 * The door every /api/v1 request goes through.
 *
 * A key from the Authorization header, its store by the store's permanent id,
 * and a limit per key. Nothing else is read from the request to decide whose
 * data is returned: there is no store name, id or address in any URL here,
 * so there is nothing to change to reach another store's data. The key alone
 * says whose it is.
 *
 * No CORS headers, on purpose. These are keys for a creator's own server,
 * Zapier or Make — a key in a web page's script is a key anybody who opens the
 * page can copy, and a browser refusing the request is the kinder way to learn
 * that.
 */
import { keyFromHeader, resolveKey } from "@/lib/api-keys";
import { storeForId, type Store } from "@/lib/store";
import { BodyTooLarge, limited, withinLimit } from "@/lib/request-guard";
import { takeAllowance } from "@/lib/store-allowance";

/** Requests one key may make in a minute. Generous for a sync, a wall for a runaway loop. */
export const API_RATE = 120;

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export function apiError(status: number, error: string, message: string, extra: Record<string, string> = {}): Response {
  return Response.json({ error, message }, { status, headers: { ...headers, ...extra } });
}

export function apiOk(body: unknown): Response {
  return Response.json(body, { headers });
}

/** The store this request may read, or the response that refuses it. */
export async function apiStore(request: Request): Promise<Store | Response> {
  const found = await apiKeyed(request);
  return found instanceof Response ? found : found.store;
}

/**
 * The store this request may change, and the key it came with, or the
 * response that refuses it: a key made to read only is refused here, with
 * the way to make one that writes.
 */
export async function apiWriter(request: Request): Promise<{ store: Store; keyId: string } | Response> {
  const found = await apiKeyed(request);
  if (found instanceof Response) return found;
  if (!found.write) {
    return apiError(403, "read_only", "This key reads only. Make a key that can also write, in your studio under API keys.");
  }
  return { store: found.store, keyId: found.keyId };
}

async function apiKeyed(request: Request): Promise<{ store: Store; keyId: string; write: boolean } | Response> {
  const presented = keyFromHeader(request.headers.get("authorization"));
  const unauthorized = () =>
    apiError(401, "unauthorized", "Send your API key as: Authorization: Bearer nl_live_…", {
      "WWW-Authenticate": 'Bearer realm="Marktmorgen API"',
    });
  if (!presented) return unauthorized();
  const found = await resolveKey(presented);
  // Missing, malformed, unknown and revoked all get the same answer, so the
  // API cannot be used to learn which keys ever existed.
  if (!found) return unauthorized();
  if (!(await withinLimit("api", found.id, API_RATE, 60))) {
    return apiError(429, "rate_limited", `At most ${API_RATE} requests a minute per key. Try again in a minute.`, { "Retry-After": "60" });
  }
  const store = await storeForId(found.sid);
  if (!store) return unauthorized();
  // Each request is one of the store's window (lib/store-allowance-rules.ts), taken before any work.
  const taken = await takeAllowance(store, "api");
  if (!taken.ok) return apiError(429, taken.reason === "used" ? "monthly_limit" : "unavailable", taken.message);
  return { store, keyId: found.id, write: found.write };
}

/** Most a write request's body may weigh. */
const MAX_BODY_BYTES = 4_000;

/** A write request's JSON body, or the response that refuses it. */
export async function readApiBody(request: Request): Promise<Record<string, unknown> | Response> {
  const bad = () => apiError(400, "invalid", "Send a JSON object as the body, with Content-Type: application/json.");
  if (Number(request.headers.get("content-length") ?? "0") > MAX_BODY_BYTES) return apiError(413, "too_large", `The body may be up to ${MAX_BODY_BYTES} bytes.`);
  try {
    // Read only as far as the ceiling, whether or not a length was declared (docs/security-audit-2026-10-18.md, MM-SA-10).
    const text = await (await limited(request, MAX_BODY_BYTES)).text();
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : bad();
  } catch (error) {
    if (error instanceof BodyTooLarge) return apiError(413, "too_large", `The body may be up to ${MAX_BODY_BYTES} bytes.`);
    return bad();
  }
}
