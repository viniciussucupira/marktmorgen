/**
 * Which marketing channel the money came from.
 *
 * The store counted visitors by where they came from, and read the money
 * from the creator's own Stripe account, and never joined the two. A creator
 * could see that four hundred people arrived from a newsletter, and that
 * they made six hundred dollars, and not which of those four hundred were
 * the six hundred.
 *
 * The join costs nothing and records nobody: the tags the creator puts on
 * their own links are on the page the buyer presses the button from, the
 * browser sends that page as the Referer of the checkout, and the tags go
 * into the Stripe session's metadata — so they come back attached to the
 * payment, in the one record of money that deserves the name.
 *
 * These hold the two things that matter: that nothing but a tag is ever read
 * from that header, and that money in different currencies is never silently
 * added together.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DIRECT, cameFrom, hasSource, revenueBySource } from "@/lib/came-from";

const HOST = "marktmorgen.com";

test("the tags on the page the buyer bought from", () => {
  const from = cameFrom(`https://${HOST}/@jenny?utm_source=newsletter&utm_medium=email&utm_campaign=spring`, HOST);
  assert.deepEqual(from, { source: "newsletter", medium: "email", campaign: "spring", content: "" });
  assert.equal(hasSource(from), true);
});

test("an untagged page is direct, and writes nothing", () => {
  const from = cameFrom(`https://${HOST}/@jenny`, HOST);
  assert.deepEqual(from, { source: "", medium: "", campaign: "", content: "" });
  assert.equal(hasSource(from), false, "an untagged sale carries no empty fields to Stripe");
});

test("no header, a broken one, or one from another site is ignored", () => {
  assert.equal(hasSource(cameFrom(null, HOST)), false);
  assert.equal(hasSource(cameFrom("not a url", HOST)), false);
  assert.equal(
    hasSource(cameFrom(`https://somewhere-else.example/?utm_source=theirs`, HOST)),
    false,
    "only this site's own page is read, so another site cannot write into a creator's report",
  );
});

test("a tag is cleaned to the same shape the visit counter uses", () => {
  const from = cameFrom(
    `https://${HOST}/@jenny?utm_source=${encodeURIComponent("News Letter!! <script>")}&utm_campaign=${"x".repeat(80)}`,
    HOST,
  );
  // Everything outside [a-z0-9._-] is removed rather than replaced, so the
  // pieces close up: "News Letter!! <script>" becomes one harmless word. The
  // point is that nothing survives that could mean anything to a browser.
  assert.equal(from.source, "newsletterscript", "spaces and punctuation go, case is folded");
  assert.equal(from.campaign.length, 40, "and a long one is cut rather than stored whole");
  assert.match(from.source, /^[a-z0-9._-]*$/);
});

test("money is added up by channel, biggest first", () => {
  const rows = revenueBySource([
    { cents: 2900, currency: "usd", source: "newsletter" },
    { cents: 4900, currency: "usd", source: "instagram" },
    { cents: 1000, currency: "usd", source: "newsletter" },
    { cents: 500, currency: "usd", source: "" },
  ]);
  assert.deepEqual(rows, [
    { source: "instagram", currency: "usd", cents: 4900, sales: 1 },
    { source: "newsletter", currency: "usd", cents: 3900, sales: 2 },
    { source: DIRECT, currency: "usd", cents: 500, sales: 1 },
  ]);
});

test("an untagged sale is called direct rather than dropped", () => {
  const rows = revenueBySource([{ cents: 100, currency: "usd", source: "" }]);
  assert.equal(rows[0].source, DIRECT);
  assert.equal(rows.length, 1, "it is money, and it belongs in the report");
});

test("two currencies are two rows, never one invented total", () => {
  const rows = revenueBySource([
    { cents: 1000, currency: "usd", source: "newsletter" },
    { cents: 1000, currency: "eur", source: "newsletter" },
  ]);
  assert.equal(rows.length, 2, "adding dollars to euros would be making up an exchange rate");
  assert.deepEqual(rows.map((r) => r.currency).sort(), ["eur", "usd"]);
});

test("nothing here stores anything about a person", () => {
  // The whole module is pure: a header in, a shape out. If it ever grows a
  // store, a cookie or an identifier, this is where that gets noticed.
  const src = readFileSync(join(process.cwd(), "lib/came-from.ts"), "utf8");
  for (const forbidden of ["redis", "cookie", "setItem", "localStorage", "fingerprint"]) {
    assert.doesNotMatch(
      src.replace(/\/\*[\s\S]*?\*\//g, ""),
      new RegExp(forbidden, "i"),
      `lib/came-from.ts must not reach for ${forbidden}: the channel is carried to Stripe, not kept here`,
    );
  }
});

test("the studio is given the channel money, in the store's currency only", () => {
  const stats = readFileSync(join(process.cwd(), "lib/stats.ts"), "utf8");
  assert.match(stats, /revenueBySource/, "the sales reading must work out money by channel");
  assert.match(
    stats,
    /filter\(\(row\) => row\.currency === store\.currency\)/,
    "and hand the studio only the store's own currency, since the panel shows one total",
  );

  const panel = readFileSync(join(process.cwd(), "components/stats-panel.tsx"), "utf8");
  assert.match(panel, /Where the money came from/, "the table has to exist, or none of this is visible");
  assert.match(panel, /Per visitor/, "and revenue per visitor, which is the number the whole report is for");
  // The names live in one list since 11 October 2026 (lib/channel-names.ts), which the panel reads.
  const names = readFileSync(join(process.cwd(), "lib/channel-names.ts"), "utf8");
  assert.match(panel, /channelName/, "the panel names channels through the one list");
  assert.match(
    names,
    /Direct or unknown/,
    "a sale from nowhere nameable is named plainly rather than shown as the word 'direct'",
  );
});

test("a sale carries its channel from the checkout all the way to the report", () => {
  const checkout = readFileSync(join(process.cwd(), "lib/store-checkout.ts"), "utf8");
  assert.match(checkout, /metadata\[utm_source\]/, "written onto the Stripe session");
  const stats = readFileSync(join(process.cwd(), "lib/stats.ts"), "utf8");
  assert.match(stats, /const source = meta\.utm_source \|\| named\(meta\.channel\)/, "and read back off it when the sale is read, the page's tag first");

  const route = readFileSync(join(process.cwd(), "app/api/store/checkout/route.ts"), "utf8");
  assert.match(route, /cameFrom\(request\.headers\.get\("referer"\)/, "read from the page the button was on");
});
