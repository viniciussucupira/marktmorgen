/**
 * The site's own sitemap (app/sitemap.ts) states a last-modified date only
 * where one is known: each article's date. Every other page goes without one.
 *
 * Until 19 October 2026 every entry carried "today", so each request told
 * Google that all pages had changed that day. Google uses lastmod only when it
 * is consistently accurate; a date that is always now teaches it to ignore the
 * field. What is checked:
 *
 *   - no entry other than an article carries a last-modified date;
 *   - every article carries its own published date, not today's;
 *   - the pages listed are unchanged in number and address.
 */
import sitemap from "@/app/sitemap";
import { BLOG_POSTS } from "@/lib/blog";
import { PAGES } from "@/lib/site-pages";
import { SITE_URL } from "@/lib/site-url";
import { done, is, part } from "./check";

const entries = sitemap();
const blogUrls = new Set(BLOG_POSTS.map((post) => `${SITE_URL}/blog/${post.slug}`));

part("Only articles carry a last-modified date");
const datedNonArticles = entries.filter((e) => !blogUrls.has(e.url) && e.lastModified !== undefined).map((e) => e.url);
is("no page other than an article states a date", datedNonArticles, []);

part("Each article carries its own date");
const wrongArticleDates = BLOG_POSTS.filter((post) => {
  const entry = entries.find((e) => e.url === `${SITE_URL}/blog/${post.slug}`);
  const stamp = entry?.lastModified instanceof Date ? entry.lastModified.toISOString().slice(0, 10) : undefined;
  return stamp !== post.date;
}).map((post) => post.slug);
is("every article's date is its published date", wrongArticleDates, []);

part("The pages listed are the same");
is("every comparison and platform page is listed", PAGES.every((page) => entries.some((e) => e.url === `${SITE_URL}/${page.section}/${page.slug}`)), true);
is("every article is listed", BLOG_POSTS.every((post) => blogUrls.has(`${SITE_URL}/blog/${post.slug}`) && entries.some((e) => e.url === `${SITE_URL}/blog/${post.slug}`)), true);
is("no address is listed twice", new Set(entries.map((e) => e.url)).size, entries.length);

done();
