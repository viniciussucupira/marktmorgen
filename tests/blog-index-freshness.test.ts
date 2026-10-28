import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import BlogIndexPage from "@/app/blog/page";
import { featuredPost, formatPostDate, postsSorted } from "@/lib/blog";

let externalCalls = 0;
globalThis.fetch = (async () => { externalCalls++; throw new Error("Unexpected external request"); }) as typeof fetch;
const posts = postsSorted();
assert.ok(posts.length > 0);
const latestDate = posts.reduce((latest, post) => post.date > latest ? post.date : latest, "");
const html = renderToStaticMarkup(createElement(BlogIndexPage));
assert.ok(html.includes(`Written by us, latest ${formatPostDate(latestDate)}`));
assert.ok(html.includes(`${posts.length} articles`));
const featured = featuredPost();
assert.ok(html.includes(featured.title));
if (featured.date !== latestDate) {
  assert.ok(!html.includes(`Written by us, latest ${formatPostDate(featured.date)}`));
}
assert.equal(externalCalls, 0);
console.log("Journal freshness: actual index renders the newest published article date while preserving the editorial featured article, with no external calls.");
