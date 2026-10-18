/**
 * next/headers for the security journeys (scripts/security-redis.mjs): Next.js
 * hands a route or a page the request it is answering through these two
 * functions, and outside Next there is no request to hand. A journey says
 * which request is being answered with `answering(request)`, and the code
 * under test reads its headers and cookies exactly as it would in Next.
 * Without one, both throw, as Next's own do outside a request.
 */
type Answering = { headers: Headers; cookies: Map<string, string> };

const slot = globalThis as unknown as { __nimbusAnswering?: Answering | null };

/** Says which request the code that runs next is answering; null for none. */
export function answering(request: Request | null): void {
  if (!request) {
    slot.__nimbusAnswering = null;
    return;
  }
  const cookies = new Map<string, string>();
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const at = part.indexOf("=");
    if (at > 0) cookies.set(part.slice(0, at).trim(), decodeURIComponent(part.slice(at + 1).trim()));
  }
  slot.__nimbusAnswering = { headers: request.headers, cookies };
}

function current(): Answering {
  const now = slot.__nimbusAnswering;
  if (!now) throw new Error("headers() was called outside a request scope");
  return now;
}

export async function headers(): Promise<Headers> {
  return current().headers;
}

export async function cookies(): Promise<{ get: (name: string) => { name: string; value: string } | undefined; has: (name: string) => boolean; getAll: () => { name: string; value: string }[] }> {
  const jar = current().cookies;
  return {
    get: (name) => (jar.has(name) ? { name, value: jar.get(name) as string } : undefined),
    has: (name) => jar.has(name),
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
  };
}
