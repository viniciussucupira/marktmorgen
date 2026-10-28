import { test } from "node:test";
import assert from "node:assert/strict";
import type { NextRequest } from "next/server";
import { POST } from "@/app/api/store/disputes/route";
import { can } from "@/lib/team-roles";
import { state, reset, chosenStore } from "./dispute-review-route-world";
const request = {} as NextRequest;
test("review requires the existing export guard and uses only its selected store", async () => {
  reset(); state.body = { action: "review", dispute: " du_fixture ", account: "acct_other", store: "other" };
  const response = await POST(request);
  assert.deepEqual(state.checks, [{ need: "export", max: 1000 }]);
  assert.deepEqual(state.reads, [{ store: chosenStore, id: "du_fixture" }]);
  assert.equal(response.status, 409);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.match(response.headers.get("vary") ?? "", /Cookie/);
});
test("existing role table permits sensitive record review only to owners and admins", () => {
  assert.equal(can("owner", "export"), true); assert.equal(can("admin", "export"), true);
  assert.equal(can("editor", "export"), false); assert.equal(can("support", "export"), false);
});
test("guard refusal is private and prevents every provider lookup", async () => {
  for (const status of [401, 403, 413, 423, 429, 503]) {
    reset(); state.denial = Response.json({ ok: false, error: "synthetic refusal" }, { status });
    const response = await POST(request);
    assert.equal(response.status, status);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(state.reads.length, 0);
  }
});
test("invalid identifiers and any submission action cannot reach the read service", async () => {
  for (const body of [
    { action: "submit", dispute: "du_fixture" }, { action: "constructor", dispute: "du_fixture" },
    { action: "review", dispute: "../other" }, { action: "review", dispute: "du_" + "x".repeat(129) },
    { action: "review", dispute: null },
  ]) {
    reset(); state.body = body;
    const response = await POST(request);
    assert.equal(response.status, 400); assert.equal(state.reads.length, 0);
  }
});
test("verified response is private and service failures disclose no provider error", async () => {
  reset(); state.result = { ok: true, submitted: false, fixture: "synthetic" };
  const response = await POST(request);
  assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal((await response.json()).submitted, false);
  reset(); state.error = true;
  const failed = await POST(request);
  assert.equal(failed.status, 503);
  assert.deepEqual(await failed.json(), { ok: false, reason: "unavailable" });
});
