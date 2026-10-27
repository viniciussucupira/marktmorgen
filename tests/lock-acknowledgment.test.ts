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

test("strict fenced CAS never downgrades an ambiguous EVAL to separate reads or writes", async () => {
  const { strictFencedCompareAndSet } = await import("@/lib/redis-lock");
  const original: typeof store.pipeline = store.pipeline.bind(store);
  const held = { key: "synthetic:lock", token: "owned-token", ttlSeconds: 15 };
  let getters = 0;
  const accessorReply: unknown[] = [];
  Object.defineProperty(accessorReply, 0, { get() { getters++; return 1; } });
  try {
    for (const reply of [null, undefined, false, 1, "OK", {}, [], Array(1), [1, 0], ["1"], [true], accessorReply]) {
      const commands: unknown[][] = [];
      store.pipeline = async batch => { commands.push(...batch); return reply as unknown[]; };
      assert.equal(await strictFencedCompareAndSet(held, "synthetic:record", "before", "after", 8), "unknown");
      assert.deepEqual(commands.map(command => command[0]), ["EVAL"]);
    }
    for (const [reply, result] of [[[1], "written"], [[2], "already-current"], [[0], "refused"]] as const) {
      store.pipeline = async () => [...reply];
      assert.equal(await strictFencedCompareAndSet(held, "synthetic:record", "before", "after", 8), result);
    }
    const commands: unknown[][] = [];
    store.pipeline = async batch => { commands.push(...batch); throw new Error("lost acknowledgement"); };
    assert.equal(await strictFencedCompareAndSet(held, "synthetic:record", "before", "after", 8), "unknown");
    assert.deepEqual(commands.map(command => command[0]), ["EVAL"]);
  } finally { store.pipeline = original; }
  assert.equal(getters, 0);
});

test("strict fenced CAS refuses unsafe or over-budget inputs before any IO", async () => {
  const { strictFencedCompareAndSet, STRICT_FENCED_CAS_MAX_BYTES } = await import("@/lib/redis-lock");
  const original: typeof store.pipeline = store.pipeline.bind(store);
  const held = { key: "synthetic:lock", token: "owned-token", ttlSeconds: 15 };
  let calls = 0, getters = 0;
  try {
    store.pipeline = async () => { calls++; return [1]; };
    for (const limit of [0, -1, 1.5, NaN, Infinity, STRICT_FENCED_CAS_MAX_BYTES + 1]) {
      assert.equal(await strictFencedCompareAndSet(held, "synthetic:record", "a", "b", limit), "refused");
    }
    assert.equal(await strictFencedCompareAndSet(held, held.key, "a", "b", 8), "refused");
    assert.equal(await strictFencedCompareAndSet(held, "synthetic:record", "éé", "a", 3), "refused");
    assert.equal(await strictFencedCompareAndSet(held, "synthetic:record", "a", "éé", 3), "refused");
    assert.equal(await strictFencedCompareAndSet({ ...held, ttlSeconds: 0 }, "synthetic:record", "a", "b", 8), "refused");
    const dangerous = { ...held };
    Object.defineProperty(dangerous, "token", { get() { getters++; return "owned-token"; } });
    assert.equal(await strictFencedCompareAndSet(dangerous, "synthetic:record", "a", "b", 8), "refused");
    assert.equal(await strictFencedCompareAndSet(Object.create(held), "synthetic:record", "a", "b", 8), "refused");
    assert.equal(calls, 0); assert.equal(getters, 0);
  } finally { store.pipeline = original; }
});

test("strict release cannot turn an ambiguous EVAL into a GET/DEL race", async () => {
  const { releaseLockStrict } = await import("@/lib/redis-lock");
  const original: typeof store.pipeline = store.pipeline.bind(store);
  const held = { key: "synthetic:lock", token: "owned-token", ttlSeconds: 15 };
  let getters = 0;
  const accessor: unknown[] = [];
  Object.defineProperty(accessor, 0, { get() { getters++; return 1; } });
  try {
    for (const reply of [null, undefined, false, "OK", {}, [], Array(1), [1, 0], ["1"], [true], accessor]) {
      const commands: unknown[][] = [];
      store.pipeline = async batch => { commands.push(...batch); return reply as unknown[]; };
      assert.equal(await releaseLockStrict(held), "unknown");
      assert.deepEqual(commands.map(command => command[0]), ["EVAL"]);
    }
    for (const [reply, expected] of [[[1], "released"], [[0], "not-owned"]] as const) {
      store.pipeline = async () => [...reply];
      assert.equal(await releaseLockStrict(held), expected);
    }
    const commands: unknown[][] = [];
    store.pipeline = async batch => { commands.push(...batch); throw new Error("DEL may already have committed"); };
    assert.equal(await releaseLockStrict(held), "unknown");
    assert.deepEqual(commands.map(command => command[0]), ["EVAL"]);
  } finally { store.pipeline = original; }
  assert.equal(getters, 0);
});

test("strict release rejects unknown ownership without reading executable fields", async () => {
  const { releaseLockStrict } = await import("@/lib/redis-lock");
  const original: typeof store.pipeline = store.pipeline.bind(store);
  const held = { key: "synthetic:lock", token: "owned-token", ttlSeconds: 15 };
  let calls = 0, getters = 0;
  const accessor = { ...held };
  Object.defineProperty(accessor, "token", { get() { getters++; return "owned-token"; } });
  try {
    store.pipeline = async () => { calls++; return [1]; };
    for (const value of [{ ...held, key: "" }, { ...held, token: "" }, { ...held, ttlSeconds: 0 },
      { ...held, ttlSeconds: Infinity }, { ...held, key: "é".repeat(257) }, { ...held, token: "é".repeat(65) },
      { ...held, extra: true }, Object.create(held), accessor]) {
      assert.equal(await releaseLockStrict(value), "refused");
    }
    assert.equal(calls, 0); assert.equal(getters, 0);
  } finally { store.pipeline = original; }
});
