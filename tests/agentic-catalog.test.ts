import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProduct } from "@/lib/catalog";
import { AGENTIC_COMMERCE_APPROVED, projectAgentCatalogEntry } from "@/lib/agentic-catalog";
const parsed = parseProduct({ id: "abc123", title: "日本語 Guide", summary: "Creator description", priceCents: 2900, hidden: false });
assert.ok(parsed);
const product = parsed!;
const context = { optedIn: true, storePublished: true, checkoutReady: true, currency: "usd", productBase: "https://example.invalid/@fixture/p/", terms: "Creator terms", refunds: "Creator refund policy" };
test("catalog projection keeps an explicit public allowlist, content and persisted id", () => {
  const secret = { ...product, file: { token: "PRIVATE_DOWNLOAD" }, link: "https://private.invalid/delivery", fields: ["PRIVATE_ANSWER"], funnel: { secret: "PRIVATE_FUNNEL" } };
  const entry = projectAgentCatalogEntry(secret as unknown as typeof product, context, { known: true, left: null });
  assert.ok(entry);
  assert.deepEqual(Object.keys(entry).sort(), ["id","name","description","priceMinor","currency","availability","url","terms","refunds"].sort());
  assert.equal(entry.id, product.id); assert.equal(entry.name, product.title);
  assert.equal(entry.url, "https://example.invalid/@fixture/p/guide-abc123");
  assert.doesNotMatch(JSON.stringify(entry), /PRIVATE_|private.invalid/);
  assert.equal(AGENTIC_COMMERCE_APPROVED, false);
});
test("unknown stock, draft, missing consent and unavailable checkout refuse", () => {
  assert.equal(projectAgentCatalogEntry(product, context, { known: false }), null);
  for (const flag of ["optedIn", "storePublished", "checkoutReady"] as const) {
    assert.equal(projectAgentCatalogEntry(product, { ...context, [flag]: false }, { known: true, left: null }), null);
  }
  assert.equal(projectAgentCatalogEntry({ ...product, hidden: true }, context, { known: true, left: null }), null);
  assert.equal(projectAgentCatalogEntry({ ...product, stock: 5 }, context, { known: true, left: null }), null);
  assert.equal(projectAgentCatalogEntry({ ...product, stock: 5 }, context, { known: true, left: 0 })?.availability, "out_of_stock");
  assert.equal(projectAgentCatalogEntry(product, context, { known: true, left: -1 }), null);
});
test("unverified complex prices and unsafe or incomplete public policies refuse", () => {
  assert.equal(projectAgentCatalogEntry({ ...product, options: [{ id: "variant" }] } as typeof product, context, { known: true, left: null }), null);
  for (const productBase of ["http://example.invalid/p/", "https://user:secret@example.invalid/p/", "https://example.invalid/p/?secret=1", "https://example.invalid/private/"]) {
    assert.equal(projectAgentCatalogEntry(product, { ...context, productBase }, { known: true, left: null }), null);
  }
  assert.equal(projectAgentCatalogEntry(product, { ...context, refunds: "" }, { known: true, left: null }), null);
});
