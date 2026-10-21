import { test } from "node:test";
import assert from "node:assert/strict";
import { acpFeedBatch, ACP_FEED_BATCH_MAX, ACP_FEED_BATCH_BYTES } from "@/lib/agentic-feed";
import type { AgentCatalogEntry } from "@/lib/agentic-catalog";
const entry: AgentCatalogEntry = { id: "product_1", name: "日本語 guide", description: "Creator words", priceMinor: 1234, currency: "usd", availability: "in_stock", url: "https://example.invalid/@fixture/p/product_1", terms: "PRIVATE_INTERNAL_TERMS", refunds: "PRIVATE_INTERNAL_REFUNDS" };
const seller = { storeId: "a".repeat(32), name: "Creator store", termsUrl: "https://example.invalid/@fixture/terms", refundsUrl: "https://example.invalid/@fixture/refunds" };
test("ACP adapter scopes feed IDs, preserves content and emits only feed fields", () => {
  const result = acpFeedBatch([{ ...entry, secret: "PRIVATE_SECRET" } as AgentCatalogEntry], seller);
  assert.ok(result);
  const product = result.products[0], variant = product.variants[0];
  assert.equal(product.id, seller.storeId + ":" + entry.id);
  assert.equal(variant.id, product.id);
  assert.equal(product.title, entry.name);
  assert.deepEqual(variant.price, { amount: 1234, currency: "USD" });
  assert.deepEqual(variant.availability, { available: true, status: "in_stock" });
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_/);
  assert.deepEqual(Object.keys(product).sort(), ["id","title","description","url","variants"].sort());
  assert.deepEqual(Object.keys(variant).sort(), ["id","title","description","url","price","availability","seller"].sort());
  assert.notEqual(acpFeedBatch([entry], { ...seller, storeId: "b".repeat(32) })?.products[0].id, product.id);
  assert.equal(entry.id, "product_1");
});
test("out of stock is retained to update stale offers; invalid batches refuse entirely", () => {
  assert.deepEqual(acpFeedBatch([{ ...entry, availability: "out_of_stock" }], seller)?.products[0].variants[0].availability, { available: false, status: "out_of_stock" });
  assert.equal(acpFeedBatch([], seller), null);
  assert.equal(acpFeedBatch([entry, entry], seller), null);
  assert.equal(acpFeedBatch(Array.from({ length: ACP_FEED_BATCH_MAX + 1 }, (_, i) => ({ ...entry, id: "p" + i })), seller), null);
  assert.equal(acpFeedBatch([{ ...entry, priceMinor: NaN }], seller), null);
  assert.equal(acpFeedBatch([{ ...entry, availability: "unknown" } as unknown as AgentCatalogEntry], seller), null);
  for (const url of ["http://example.invalid/p/x", "https://user:secret@example.invalid/p/x", "https://other.invalid/p/x"]) {
    assert.equal(acpFeedBatch([{ ...entry, url }], seller), null);
  }
  assert.equal(acpFeedBatch([entry], { ...seller, refundsUrl: "https://other.invalid/refunds" }), null);
});
test("UTF8 payload bytes have a hard cap without truncating or publishing partial batches", () => {
  const huge = { ...seller, termsUrl: "https://example.invalid/" + "x".repeat(ACP_FEED_BATCH_BYTES) };
  assert.equal(acpFeedBatch([entry], huge), null);
  const entries = Array.from({ length: ACP_FEED_BATCH_MAX }, (_, i) => ({ ...entry, id: "p" + i }));
  const result = acpFeedBatch(entries, seller);
  assert.equal(result?.products.length, ACP_FEED_BATCH_MAX);
  assert.ok(Buffer.byteLength(JSON.stringify(result), "utf8") <= ACP_FEED_BATCH_BYTES);
});
