import type { Metadata } from "next";
import Link from "next/link";
import { BlogBrowser } from "@/components/blog-browser";
import { RevealOnScroll } from "@/components/home-parts";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import {
  BLOG_CATEGORIES,
  featuredPost,
  formatPostDate,
  postsSorted,
} from "@/lib/blog";

export const metadata: Metadata = {
  title: "The Nimbus Journal — selling digital products without the guesswork",
  description:
    "Plain guides on selling files, plans and calls from a link in your bio: what to charge, what the page has to say, where the money lands, and what every platform costs you per sale.",
};

export default function BlogIndexPage() {
  const featured = featuredPost();
  const rest = postsSorted().filter((post) => post.slug !== featured.slug);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <RevealOnScroll />
      <SiteNav />

      <main id="content" className="flex-1">
        <section className="surface-dawn border-b border-line">
          <div className="container-page py-14 sm:py-20">
            <p className="eyebrow">The Nimbus Journal</p>
            <h1 className="t-h1 balance mt-4 max-w-3xl">
              Everything we learn about <span className="serif font-normal text-violet-deep">selling your own work</span>
            </h1>
            <p className="t-lead mt-6 max-w-2xl text-ink-soft">
              No hacks, no invented case studies. What to charge, what the page has to say, where the money lands, and
              what each platform really costs you on a sale.
            </p>
            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-mute">
              <span>{`${postsSorted().length} articles`}</span>
              <span aria-hidden="true">·</span>
              <span>{`Written by us, latest ${formatPostDate(featured.date)}`}</span>
              <span aria-hidden="true">·</span>
              <span>Every figure carries its source</span>
            </p>
          </div>
        </section>

        {featured ? (
          <section className="container-page pt-12 sm:pt-16">
            <article className="reveal surface-night on-dark group relative grid gap-8 overflow-hidden rounded-[var(--r-xl)] p-7 sm:p-10 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:p-12">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-[0.8125rem]">
                  <span className="eyebrow">Start here</span>
                  <span className="text-white/70">
                    {featured.category} · {formatPostDate(featured.date)} · {featured.readMinutes} min read
                  </span>
                </div>
                <h2 className="t-h2 balance mt-4 text-white">
                  <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0">
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-4 max-w-xl text-white/80">{featured.excerpt}</p>
                <p className="link-arrow on-dark mt-7">
                  Read the article
                  <span aria-hidden="true" className="arrow">
                    →
                  </span>
                </p>
              </div>
              <ul className="panel-dark relative space-y-3 p-6 text-[0.9375rem] text-white/80">
                <li className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-white/70">Inside</li>
                {[
                  "What to sell when you have never sold anything",
                  "The price that makes the decision easy",
                  "The six lines a product page needs",
                  "What has to happen the second someone pays",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <span aria-hidden="true" className="text-[#b9a8ff]">
                      →
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        ) : null}

        <section className="container-page py-14 sm:py-20">
          <h2 className="t-h2">More to explore</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Pick a subject or search for a word. Every article is written by us and says where its facts come from.
          </p>
          <div className="mt-8">
            <BlogBrowser posts={rest} categories={[...BLOG_CATEGORIES]} />
          </div>
        </section>

        <section className="surface-sand">
          <div className="container-page grid gap-8 py-16 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="t-h2 balance">Reading about it is useful. Having one is better.</h2>
              <p className="mt-4 max-w-xl text-ink-soft">
                The store address, the page and the editor cost nothing. Your buyer pays into your own Stripe account, and
                we take 0% of the sale.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 lg:justify-end">
              <Link href="/signin" className="btn btn-primary btn-lg">
                Start your store
              </Link>
              <Link href="/demo" className="link-arrow">
                Open the live demo store
                <span aria-hidden="true" className="arrow">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
