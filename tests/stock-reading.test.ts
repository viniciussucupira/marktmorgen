import { test } from "node:test";
import assert from "node:assert/strict";
import { stockLeft, withStockHold } from "@/lib/stock";
import { parseProduct } from "@/lib/catalog";
import type { Store } from "@/lib/store";
import { store as redis } from "./redis-stub";

test("unknown or malformed inventory never becomes an empty set of holds", async () => {
  const product = parseProduct({ id: "limited123", title: "Limited", summary: "", priceCents: 100, stock: 1 });
  assert.ok(product);
  const store = { statsId: "a".repeat(32) } as Store;
  const original: typeof redis.pipeline = redis.pipeline.bind(redis);
  let opened = 0;
  const bad: unknown[] = [undefined, null, {}, 0, ["session"], ["session", "{"], ["session", "null"], ["session", "[]"], ["session", "{}"], ["session", '{"until":-1}'], ["session", '{"until":1,"paid":"yes"}'], ["session", '{"until":1}', "session", '{"until":2}']];
  try {
    for (const raw of bad) {
      redis.pipeline = async (commands) => commands.map(command => command[0] === "HGETALL" ? raw : command[0] === "SET" ? "OK" : 1);
      await assert.rejects(stockLeft(store, product), /Stock reading unavailable/);
      await assert.rejects(withStockHold(store, product, async () => { opened += 1; return { id: "cs_test_synthetic" }; }), /Stock reading unavailable/);
    }
    assert.equal(opened, 0);
    redis.pipeline = async () => [[]];
    assert.equal(await stockLeft(store, product), 1);
    redis.pipeline = async () => [["session", '{"until":0,"paid":true}']];
    assert.equal(await stockLeft(store, product), 0);
  } finally { redis.pipeline = original; }
});
