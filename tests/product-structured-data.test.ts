/**
 * What a product page tells search engines (248 [ST1]): an Offer, with its
 * price and "InStock", only while the product can be bought here. With paid
 * selling closed by the opening gates (lib/opening.ts) or the product not for
 * sale, the page says it cannot be bought, so the structured data must not
 * say otherwise (VR item 2).
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { PLANS_ON_SALE } from "@/lib/opening";

const page = readFileSync("app/[handle]/p/[product]/page.tsx", "utf8");

test("the offer is gated on the product being sellable now", () => {
  assert.match(page, /const selling = canSell\(store\);/);
  assert.match(page, /productData\(store, product, .*, selling && canSellProduct\(store, product\)\)\} \/>/);
  assert.match(page, /const offers = !sellable \|\| product\.recurring\s*\?\s*null/);
  // The default is no offer: a caller that forgets the flag tells nothing it cannot keep.
  assert.match(page, /preorder = false, sellable = false\)/);
});

test("today, with paid selling closed, no product page offers anything to a search engine", () => {
  assert.equal(PLANS_ON_SALE, false);
});
