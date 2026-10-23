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


test("unreadable saved stock cannot silently become unlimited", () => {
  const record = { id: "limited123", title: "Limited", summary: "", priceCents: 100 };
  for (const stock of [0, -1, 1.5, 100_001, NaN, Infinity, false, true, {}, [], "", " ", "unknown", "0", "-1", "100001"]) {
    const saved = { ...record, stock };
    assert.equal(parseProduct(saved), null);
    assert.equal(saved.stock, stock);
  }
  for (const stock of [undefined, null]) {
    assert.equal(parseProduct({ ...record, stock })?.stock, null);
  }
  assert.equal(parseProduct(record)?.stock, null);
  for (const [stock, expected] of [[1, 1], [100_000, 100_000], ["1", 1], [" 12 ", 12]] as const) {
    const parsed = parseProduct({ ...record, stock });
    assert.ok(parsed);
    assert.equal(parsed.stock, expected);
    assert.equal(parsed.id, record.id);
    assert.equal(parsed.title, record.title);
  }
});
