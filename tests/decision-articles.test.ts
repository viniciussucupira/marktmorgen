import assert from "node:assert/strict";
import test from "node:test";
import {BLOG_POSTS,BLOG_CATEGORIES,postBySlug} from "@/lib/blog";
import {COMPETITOR_PRICES} from "@/lib/competitor-prices";
import {findPage} from "@/lib/site-pages";
import sitemap from "@/app/sitemap";
const slugs=["how-much-kajabi-costs-in-2026","skool-fees-explained","kajabi-vs-teachable-vs-marktmorgen"];
test("decision articles are indexed, dated and preserve the existing nine articles",()=>{
 assert.equal(new Set(BLOG_POSTS.map(p=>p.slug)).size,BLOG_POSTS.length);
 for(const slug of ["what-selling-on-gumroad-costs","sell-a-digital-file-from-your-bio","what-it-costs-to-sell-a-27-dollar-file","your-own-stripe-account","three-prices-for-one-product","product-page-that-sells-a-file","link-in-bio-is-not-the-product","how-marktmorgen-compares-with-stan","why-we-skipped-the-app-stores"])assert.ok(postBySlug(slug));
 for(const slug of slugs){const p=postBySlug(slug)!;assert.ok(p);assert.equal(p.date,"2026-10-20");assert.ok(sitemap().some(x=>x.url.endsWith("/blog/"+slug)));assert.ok(p.body.filter(b=>b.type==="h2").length>=3);}
 const categories: ReadonlySet<string> = new Set(BLOG_CATEGORIES);
 for(const category of ["Courses","Community"])assert.ok(categories.has(category)&&BLOG_POSTS.some(p=>p.category===category));
 assert.ok(!categories.has("Email")&&!categories.has("Sales"));
});
test("article sources and comparison links are explicit and real",()=>{
 for(const slug of slugs){const p=postBySlug(slug)!;const links=p.body.filter(b=>b.type==="links").flatMap(b=>b.items);assert.ok(links.some(l=>l.href.startsWith("https://")));assert.ok(links.some(l=>l.href.startsWith("/proof/")));assert.ok(links.some(l=>l.href==="/pricing"));
 for(const l of links){if(l.href.startsWith("/proof/")||l.href.startsWith("/platform/")){const parts=l.href.split("/");assert.ok(findPage(parts[1] as "proof"|"platform",parts[2]),l.href);}else if(l.href.startsWith("https://"))assert.match(new URL(l.href).hostname,/^(www\.)?(kajabi\.com|skool\.com|teachable\.com)$|^(help\.skool\.com|support\.teachable\.com)$/);}
 assert.match(JSON.stringify(p),/paid sales (?:remain|closed|currently)|paid sales closed/i);
 }
});
test("dated price figures remain tied to the shared quote registry",()=>{
 assert.deepEqual(COMPETITOR_PRICES.kajabi.plans.map(p=>p.monthlyCents),[17900,24900,49900]);
 assert.deepEqual(COMPETITOR_PRICES.teachable.plans.map(p=>p.monthlyCents),[3900,8900,18900]);
 assert.deepEqual(COMPETITOR_PRICES.skool.plans.map(p=>p.monthlyCents),[900,9900]);
 assert.ok(JSON.stringify(postBySlug("skool-fees-explained")).includes("exact $900 boundary unclear"));
});
