import { test } from "node:test";
import assert from "node:assert/strict";
import { onAccount } from "@/lib/stripe-account";

const account = "acct_timeout";
test("existing account signing and default calls remain unchanged with an optional shorter ceiling", async () => {
  const originalFetch = globalThis.fetch; const originalKey = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = "sk_test_fixture";
  const calls: RequestInit[] = [];
  globalThis.fetch = async (_input, init) => { calls.push(init ?? {}); return Response.json({ id: "du_fixture" }); };
  try {
    assert.equal((await onAccount("GET", account, "/disputes/du_fixture")).id, "du_fixture");
    assert.equal((await onAccount("GET", account, "/disputes/du_fixture", undefined, "2026-01-01", undefined, 5000)).id, "du_fixture");
    assert.equal(calls.length, 2);
    for (const call of calls) {
      assert.equal(call.method, "GET"); assert.equal(call.body, undefined);
      assert.equal(new Headers(call.headers).get("Stripe-Account"), account);
      assert.equal(new Headers(call.headers).get("Authorization"), "Bearer sk_test_fixture");
      assert.ok(call.signal);
    }
    assert.equal(new Headers(calls[0].headers).get("Stripe-Version"), null);
    assert.equal(new Headers(calls[1].headers).get("Stripe-Version"), "2026-01-01");
  } finally { globalThis.fetch = originalFetch; if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY = originalKey; }
});
test("invalid or longer ceilings cannot send a request or weaken the existing ceiling", async () => {
  const originalFetch = globalThis.fetch; let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({}); };
  try {
    for (const ceiling of [-1, 0, 49, 20_001, NaN, Infinity, 50.5]) {
      await assert.rejects(onAccount("GET", account, "/disputes/du_fixture", undefined, undefined, undefined, ceiling), /Invalid Stripe request ceiling/);
    }
    assert.equal(calls, 0);
  } finally { globalThis.fetch = originalFetch; }
});
test("the shorter ceiling aborts the actual fetch and remains a network failure", async () => {
  const originalFetch = globalThis.fetch; const originalKey = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = "sk_test_fixture"; let signal: AbortSignal | null = null;
  globalThis.fetch = async (_input, init) => new Promise<Response>((_resolve, reject) => {
    signal = init?.signal as AbortSignal;
    signal.addEventListener("abort", () => reject(signal?.reason), { once: true });
  });
  try {
    await assert.rejects(onAccount("GET", account, "/disputes/du_fixture", undefined, undefined, undefined, 50), { name: "TypeError", message: "fetch failed" });
    assert.equal((signal as AbortSignal | null)?.aborted, true);
  } finally { globalThis.fetch = originalFetch; if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY = originalKey; }
});
