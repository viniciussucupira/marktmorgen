import { test } from "node:test";
import assert from "node:assert/strict";
import { takeLock, releaseLock, LockBusyError } from "@/lib/redis-lock";
import { store } from "./redis-stub";
test("lock admission requires explicit OK and never grants ownership on unknown storage response", async () => {
  store.clear();
  const original: typeof store.pipeline = store.pipeline.bind(store);
  try {
    for (const acknowledgement of [undefined, false, 0, 1, "true", {}, []]) {
      store.pipeline = async () => [acknowledgement];
      await assert.rejects(takeLock("synthetic:lock", 15, 0), LockBusyError);
    }
    store.pipeline = async () => [null];
    await assert.rejects(takeLock("synthetic:lock", 15, 0), LockBusyError);
  } finally { store.pipeline = original; }
  const held = await takeLock("synthetic:lock", 15, 0);
  assert.equal((await store.pipeline([["GET", held.key]]))[0], held.token);
  await releaseLock(held);
  assert.equal((await store.pipeline([["GET", held.key]]))[0], null);
});

test("unknown stock lock acknowledgment cannot open checkout", async () => {
  const { withStockHold } = await import("@/lib/stock");
  const { parseProduct } = await import("@/lib/catalog");
  const product = parseProduct({ id: "limited123", title: "Limited", summary: "", priceCents: 100, stock: 1 });
  assert.ok(product);
  const fakeStore = { statsId: "a".repeat(32) } as import("@/lib/store").Store;
  const original: typeof store.pipeline = store.pipeline.bind(store);
  let opened = 0;
  try {
    for (const acknowledgement of [undefined, false, 0, 1, "true", {}, []]) {
      store.pipeline = async () => [acknowledgement];
      const result: { ok: boolean; reason?: string } = await withStockHold(fakeStore, product, async () => { opened += 1; return { id: "cs_test_synthetic" }; });
      assert.deepEqual(result, { ok: false, reason: "busy" });
    }
  } finally { store.pipeline = original; }
  assert.equal(opened, 0);
});

test("malformed lock receipt never grants ownership or retries an uncertain acquisition", async () => {
  const { withStockHold } = await import("@/lib/stock");
  const { parseProduct } = await import("@/lib/catalog");
  const product = parseProduct({ id: "limited123", title: "Limited", summary: "", priceCents: 100, stock: 1 });
  assert.ok(product);
  const fakeStore = { statsId: "a".repeat(32) } as import("@/lib/store").Store;
  const original: typeof store.pipeline = store.pipeline.bind(store);
  let opened = 0;
  const replies: unknown[] = [null, undefined, false, 0, "OK", {}, [], Array(1), ["OK", null], [null, "OK"], { 0: "OK", length: 1 }];
  try {
    for (const reply of replies) {
      const commands: unknown[][] = [];
      store.pipeline = async (batch) => { commands.push(...batch); return reply as unknown[]; };
      await assert.rejects(takeLock("synthetic:lock", 15, 1000), LockBusyError);
      assert.deepEqual(commands.map((command) => command[0]), ["SET"]);
      commands.length = 0;
      const result: { ok: boolean; reason?: string } = await withStockHold(fakeStore, product, async () => { opened += 1; return { id: "cs_test_synthetic" }; });
      assert.deepEqual(result, { ok: false, reason: "busy" });
      assert.deepEqual(commands.map((command) => command[0]), ["SET"]);
    }
  } finally { store.pipeline = original; }
  assert.equal(opened, 0);
});
