import { done, is, part } from "./check";

process.env.RESEND_API_KEY = "re_test_provider_usage_only";
const oldFetch = globalThis.fetch;
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const at = (seconds: number) => new Date(seconds * 1_000).toISOString();

async function main(): Promise<void> {
  const { resendAccountUsage, resendUsageSince } = await import("@/lib/resend-usage");

  part("A complete same-window count");
  const calls: string[] = [];
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    calls.push(url.search);
    if (!url.searchParams.has("after")) return Response.json({
      object: "list", has_more: true, data: [
        { id: uuid(1), created_at: at(190), to: ["one@example.test", "two@example.test"] },
        { id: uuid(2), created_at: at(180), to: ["three@example.test"] },
      ],
    });
    is("the next page starts after the last own id", url.searchParams.get("after"), uuid(2));
    return Response.json({
      object: "list", has_more: true, data: [
        { id: uuid(3), created_at: at(99), to: ["older@example.test"] },
      ],
    });
  };
  is("recipients, records and pages share one exact window",
    await resendUsageSince(100_000, 200_000),
    { ok: true, recipients: 3, records: 2, pages: 2, from: at(100), through: at(200) });
  is("every provider page uses the documented maximum", calls, ["?limit=100", `?limit=100&after=${uuid(2)}`]);

  part("Unknown never becomes zero");
  let getterCalls = 0;
  const idGetter = Object.defineProperty({ created_at: at(150), to: ["one@example.test"] }, "id", {
    get() { getterCalls += 1; return uuid(4); },
  });
  for (const page of [
    {},
    { object: "list", data: [], has_more: true },
    { object: "list", data: [idGetter], has_more: false },
    { object: "list", data: [{ id: uuid(5), created_at: "not-a-date", to: ["one@example.test"] }], has_more: false },
    { object: "list", data: [{ id: uuid(6), created_at: at(150), to: ["one@example.test"] }, { id: uuid(7), created_at: at(151), to: ["two@example.test"] }], has_more: false },
    { object: "list", data: [{ id: uuid(8), created_at: at(150), to: [] }], has_more: false },
  ]) {
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => page }) as Response;
    is("malformed provider evidence is unknown", await resendUsageSince(100_000, 200_000), { ok: false, reason: "unknown" });
  }
  is("provider getters were not executed", getterCalls, 0);

  globalThis.fetch = async () => Response.json({
    object: "list", has_more: false, data: [
      { id: uuid(9), created_at: at(201), to: ["newer@example.test"] },
      { id: uuid(10), created_at: at(150), to: ["inside@example.test"] },
    ],
  });
  is("records after the snapshot are skipped while the exact window remains complete",
    await resendUsageSince(100_000, 200_000),
    { ok: true, recipients: 1, records: 1, pages: 1, from: at(100), through: at(200) });

  part("Authorization and provider failures stay distinct");
  let requests = 0;
  globalThis.fetch = async () => { requests += 1; return new Response("", { status: 403 }); };
  is("a send-only key names the owner-only read-key step", await resendUsageSince(100_000, 200_000), { ok: false, reason: "unauthorized" });
  is("authorization is not retried", requests, 1);
  globalThis.fetch = async () => new Response("", { status: 429 });
  is("rate limiting is not absence", await resendUsageSince(100_000, 200_000), { ok: false, reason: "provider" });

  part("The account usage endpoint is authoritative but never admission");
  let accountRequest: { url: string; authorization: string; cache: RequestCache | undefined } | null = null;
  process.env.RESEND_READ_API_KEY = "re_test_full_read_only";
  globalThis.fetch = async (input, init) => {
    accountRequest = {
      url: String(input),
      authorization: String(new Headers(init?.headers).get("authorization")),
      cache: init?.cache,
    };
    return Response.json({
      object: "usage",
      emails: {
        daily: { used: 11, limit: 100, sent: 8, received: 3, resets_at: "2026-11-01T00:00:00.000Z" },
        monthly: { used: 104, limit: 50_000, sent: 80, received: 24, resets_at: "2026-12-01T00:00:00.000Z" },
      },
    });
  };
  is("official daily and monthly counters retain sent, received, limits and reset boundaries",
    await resendAccountUsage(),
    {
      ok: true,
      daily: { used: 11, limit: 100, sent: 8, received: 3, resetsAt: "2026-11-01T00:00:00.000Z" },
      monthly: { used: 104, limit: 50_000, sent: 80, received: 24, resetsAt: "2026-12-01T00:00:00.000Z" },
    });
  is("usage uses the separate full-access read key without cache",
    accountRequest,
    { url: "https://api.resend.com/usage", authorization: "Bearer re_test_full_read_only", cache: "no-store" });

  let usageGetterCalls = 0;
  const usageGetter = Object.defineProperty({}, "daily", {
    get() { usageGetterCalls += 1; return {}; },
  });
  for (const account of [
    {},
    { object: "usage", emails: usageGetter },
    { object: "usage", emails: {
      daily: { used: 12, limit: 100, sent: 8, received: 3, resets_at: "2026-11-01T00:00:00.000Z" },
      monthly: { used: 104, limit: 50_000, sent: 80, received: 24, resets_at: "2026-12-01T00:00:00.000Z" },
    } },
    { object: "usage", emails: {
      daily: { used: 11, limit: 100, sent: 8, received: 3, resets_at: "tomorrow" },
      monthly: { used: 104, limit: 50_000, sent: 80, received: 24, resets_at: "2026-12-01T00:00:00.000Z" },
    } },
  ]) {
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => account }) as Response;
    is("malformed authoritative usage is unknown", await resendAccountUsage(), { ok: false, reason: "unknown" });
  }
  is("usage evidence getters were not executed", usageGetterCalls, 0);
  globalThis.fetch = async () => new Response("", { status: 401 });
  is("a send-only key cannot fabricate usage", await resendAccountUsage(), { ok: false, reason: "unauthorized" });
  delete process.env.RESEND_READ_API_KEY;

  globalThis.fetch = oldFetch;
  done();
}
main().catch((error) => {
  globalThis.fetch = oldFetch;
  console.error(error);
  process.exit(1);
});
