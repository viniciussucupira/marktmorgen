import { test } from "node:test";
import assert from "node:assert/strict";
import { stockLeft, withStockHold } from "@/lib/stock";
import { parseProduct } from "@/lib/catalog";
import type { Store } from "@/lib/store";
import { store as redis } from "./redis-stub";

test("limited stock cannot bypass inventory when its store identifier is unavailable", async () => {
  const limited = parseProduct({ id: "limited123", title: "Limited", summary: "", priceCents: 100, stock: 1 });
  const unlimited = parseProduct({ id: "unlimited123", title: "Unlimited", summary: "", priceCents: 100 });
  assert.ok(limited);
  assert.ok(unlimited);
  const creator = {} as Store;
  const original: typeof redis.pipeline = redis.pipeline.bind(redis);
  let commands = 0, opened = 0;
  redis.pipeline = async () => { commands += 1; throw Error("No inventory access expected"); };
  try {
    await assert.rejects(stockLeft(creator, limited), /Stock reading unavailable/);
    const refused = await withStockHold(creator, limited, async () => { opened += 1; return { id: "unexpected" }; });
    assert.deepEqual(refused, { ok: false, reason: "busy" });
    assert.equal(opened, 0);
    assert.equal(commands, 0);
    assert.equal(await stockLeft(creator, unlimited), null);
    const allowed = await withStockHold(creator, unlimited, async held => {
      assert.equal(held, false);
      opened += 1;
      return { id: "synthetic_unlimited" };
    });
    assert.deepEqual(allowed, { ok: true, value: { id: "synthetic_unlimited" } });
    assert.equal(opened, 1);
    assert.equal(commands, 0);
  } finally { redis.pipeline = original; }
});
