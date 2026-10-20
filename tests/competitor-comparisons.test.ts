import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "@/app/sitemap";
import { findPage } from "@/lib/site-pages";
import { COMPETITOR_PRICES } from "@/lib/competitor-prices";
import { TIERS, PLAN_TITLES, publishedPriceWords, monthlyEmails } from "@/lib/plan";
import { MAX_PRODUCTS } from "@/lib/catalog-rules";

test("official comparison prices carry an HTTPS source and a real read date", () => {
  for (const competitor of Object.values(COMPETITOR_PRICES)) {
    assert.equal(competitor.currency, "USD");
    for (const plan of competitor.plans) {
      assert.ok(Number.isSafeInteger(plan.monthlyCents) && plan.monthlyCents > 0);
      assert.ok(Number.isSafeInteger(plan.annualCents) && plan.annualCents > 0);
      assert.equal(new URL(plan.source.url).protocol, "https:");
      assert.ok(plan.source.label.trim());
      assert.match(plan.source.readOn, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(new Date(plan.source.readOn).toISOString().slice(0, 10), plan.source.readOn);
    }
    for (const source of [competitor.trial.source, competitor.brandedApp.source]) {
      assert.equal(new URL(source.url).protocol, "https:");
      assert.match(source.readOn, /^\d{4}-\d{2}-\d{2}$/);
    }
  }
});
test("the comparison reads every own published price, email limit and catalog cap", () => {
  const page = findPage("proof", "kajabi");
  assert.ok(page);
  assert.equal(page.seo?.title, "Marktmorgen vs Kajabi");
  assert.ok(page.seo?.description.startsWith("A Kajabi alternative where"));
  const table = page.blocks.find(b => b.kind === "table");
  assert.ok(table && table.kind === "table");
  const monthly = table.rows.find(r => r[0] === "Monthly subscription")![2];
  const annual = table.rows.find(r => r[0] === "Annual subscription")![2];
  const email = table.rows.find(r => r[0] === "Marketing email")![2];
  for (const tier of TIERS) {
    assert.ok(monthly.includes(PLAN_TITLES[tier] + ": " + publishedPriceWords(tier, "month")));
    assert.ok(annual.includes(PLAN_TITLES[tier] + ": " + publishedPriceWords(tier, "year")));
    assert.ok(email.includes(PLAN_TITLES[tier] + ": " + monthlyEmails(tier).toLocaleString("en-US") + " list emails/month"));
  }
  assert.ok(table.rows.find(r => r[0] === "Product catalog")![2].includes(MAX_PRODUCTS.toLocaleString("en-US")));
  const ahead = page.blocks.find(b => b.kind === "limits" && b.title === "Where they are ahead");
  assert.ok(ahead && ahead.kind === "limits" && ahead.items.length >= 3);
  assert.ok(table.rows.find(r => r[0] === "Getting started")![2].includes("not open yet"));
});
test("new proof pages are in the existing sitemap and the index links only actual proof pages", () => {
  for (const slug of ["kajabi", "comparisons"]) {
    assert.equal(sitemap().filter(e => new URL(e.url).pathname === "/proof/" + slug).length, 1);
  }
  const index = findPage("proof", "comparisons");
  assert.ok(index);
  const links = index.blocks.flatMap(b => b.kind === "features" ? b.items.map(i => i.href) : []);
  assert.ok(links.includes("/proof/kajabi"));
  for (const href of links) assert.ok(href && findPage("proof", href.split("/").at(-1)!));
});
