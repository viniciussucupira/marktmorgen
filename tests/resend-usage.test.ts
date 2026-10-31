import { done, is, part } from "./check";

process.env.RESEND_API_KEY = "re_test_provider_usage_only";
const oldFetch = globalThis.fetch;
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const at = (seconds: number) => new Date(seconds * 1_000).toISOString();

async function main(): Promise<void> {
  const { resendUsageSince } = await import("@/lib/resend-usage");

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
    { object: "list", data: [{ id: uuid(6), created_at: at(201), to: ["one@example.test"] }], has_more: false },
    { object: "list", data: [{ id: uuid(7), created_at: at(150), to: [] }], has_more: false },
  ]) {
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => page }) as Response;
    is("malformed provider evidence is unknown", await resendUsageSince(100_000, 200_000), { ok: false, reason: "unknown" });
  }
  is("provider getters were not executed", getterCalls, 0);

  part("Authorization and provider failures stay distinct");
  let requests = 0;
  globalThis.fetch = async () => { requests += 1; return new Response("", { status: 403 }); };
  is("a send-only key names the owner-only read-key step", await resendUsageSince(100_000, 200_000), { ok: false, reason: "unauthorized" });
  is("authorization is not retried", requests, 1);
  globalThis.fetch = async () => new Response("", { status: 429 });
  is("rate limiting is not absence", await resendUsageSince(100_000, 200_000), { ok: false, reason: "provider" });

  globalThis.fetch = oldFetch;
  done();
}
main().catch((error) => {
  globalThis.fetch = oldFetch;
  console.error(error);
  process.exit(1);
});
