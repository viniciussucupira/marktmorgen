import { test } from "node:test";
import assert from "node:assert/strict";
import { withStockHold } from "@/lib/stock";
import { parseProduct } from "@/lib/catalog";
import type { Store } from "@/lib/store";
import { store as redis } from "./redis-stub";

test("checkout is not returned without a confirmed stock hold write", async () => {
  const product = parseProduct({ id: "limited123", title: "Limited", summary: "", priceCents: 100, stock: 1 });
  assert.ok(product);
  const creator = { statsId: "a".repeat(32) } as Store;
  const original: typeof redis.pipeline = redis.pipeline.bind(redis);
  let acknowledgment: unknown;
  let opened = 0, writes = 0;
  redis.pipeline = async commands => commands.map(command => {
    if (command[0] === "SET") return "OK";
    if (command[0] === "HGETALL") return [];
    if (command[0] === "HSET") { writes += 1; return acknowledgment; }
    if (command[0] === "DEL") return 1;
    throw Error("Unexpected synthetic command");
  });
  try {
    for (const unknown of [undefined, null, false, true, "0", "1", "OK", 2, {}, []]) {
      acknowledgment = unknown;
      const result: { ok: boolean; reason?: string } = await withStockHold(creator, product, async held => {
        assert.equal(held, true);
        opened += 1;
        return { id: "cs_test_synthetic" };
      });
      assert.deepEqual(result, { ok: false, reason: "busy" });
    }
    for (const known of [0, 1]) {
      acknowledgment = known;
      const result: { ok: boolean; value?: { id: string }; reason?: string } = await withStockHold(creator, product, async () => {
        opened += 1;
        return { id: "cs_test_synthetic" };
      });
      assert.deepEqual(result, { ok: true, value: { id: "cs_test_synthetic" } });
    }
    assert.equal(opened, 12);
    assert.equal(writes, 12);
  } finally { redis.pipeline = original; }
});

test("inconsistent hold-write envelopes never return the opened checkout as confirmed", async () => {
  const product = parseProduct({ id: "limited123", title: "Limited", summary: "", priceCents: 100, stock: 1 });
  assert.ok(product);
  const creator = { statsId: "a".repeat(32) } as Store;
  const original: typeof redis.pipeline = redis.pipeline.bind(redis);
  let opened = 0;
  const replies: unknown[] = [null, undefined, false, 0, 1, "OK", {}, [], Array(1), [1, null], [0, 1], { 0: 1, length: 1 }];
  try {
    for (const reply of replies) {
      const commands: unknown[][] = [];
      redis.pipeline = async batch => {
        commands.push(...batch);
        if (batch.length === 1 && batch[0][0] === "HSET") return reply as unknown[];
        return batch.map(command => command[0] === "SET" ? "OK" : command[0] === "HGETALL" ? [] : 1);
      };
      const result: { ok: boolean; reason?: string } = await withStockHold(creator, product, async held => {
        assert.equal(held, true);
        opened += 1;
        return { id: "cs_test_synthetic" };
      });
      assert.deepEqual(result, { ok: false, reason: "busy" });
      assert.deepEqual(commands.map(command => command[0]), ["SET", "HGETALL", "HSET", "DEL"]);
    }
  } finally { redis.pipeline = original; }
  assert.equal(opened, replies.length);
});
