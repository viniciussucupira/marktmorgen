import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("home supplies four paired native self-service choices without paid operations", () => {
  const source = readFileSync("app/page.tsx", "utf8");
  for (const place of ["proof", "situations", "modules", "plans"]) {
    assert.ok(source.includes('<HomeActions place="' + place + '"'));
  }
  const helper = source.slice(source.indexOf("function HomeActions"), source.indexOf("export default"));
  for (const word of ["Start your store", "See the live demo", 'href="/signin"', 'href="/demo"']) {
    assert.ok(helper.includes(word));
  }
  // Native anchors have no client Link prefetch/hydration boundary.
  assert.equal((helper.match(/<a\b/g) ?? []).length, 2);
  assert.match(helper, /<a href="\/signin"/);
  assert.match(helper, /<a href="\/demo"/);
  assert.doesNotMatch(helper, /<Link\b|Talk to an expert|Book a demo|free|fetch\(|useEffect|useState/);
});
