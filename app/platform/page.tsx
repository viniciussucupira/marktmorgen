import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { FeatureCatalogue } from "@/components/feature-catalogue";
import { RevealOnScroll } from "@/components/home-parts";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { PAGES, type TopicPage } from "@/lib/site-pages";
import { PLAN_PRICES, TRIAL_DAYS } from "@/lib/plan";

export const metadata: Metadata = {
  title: "Every feature — Nimbus Labs",
  description:
    "Everything a Nimbus store does today — selling, getting paid, delivering and growing — each with its own page, what it does not do yet, and the plan it is on.",
};

const GROUPS: { key: NonNullable<TopicPage["group"]>; title: string; line: string }[] = [
  { key: "sell", title: "Sell", line: "Files, courses, memberships and calls, from one page." },
  { key: "paid", title: "Get paid", line: "On your own Stripe account, with the tools that raise each sale." },
  { key: "deliver", title: "Deliver", line: "The second Stripe confirms, and again whenever it is lost." },
  { key: "grow", title: "Grow", line: "Your list, your numbers and your own domain." },
];

const dollars = (cents: number) => `$${cents / 100}`;

/** Every feature page, grouped the way a creator thinks about a store. */
export default function PlatformIndex() {
  const features = PAGES.filter((p) => p.section === "platform" && p.menu && p.group);
  const creators = PAGES.filter((p) => p.section === "for");

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <RevealOnScroll />
      <SiteNav />
      <main id="content" className="flex-1">
        <section className="surface-dawn border-b border-line">
          <div className="container-page py-14 sm:py-20">
            <p className="eyebrow nb-fade-up">Every feature</p>
            <h1 className="t-h1 balance nb-fade-up nb-delay-1 mt-4 max-w-3xl">
              Everything your store does <span className="serif font-normal text-violet-deep">today</span>
            </h1>
            <p className="t-lead nb-fade-up nb-delay-2 mt-5 max-w-2xl text-ink-soft">
              {`Each feature has its own page: how it works, who it is for, what it does not do yet, and the plan it comes with. Everything on the ${dollars(PLAN_PRICES.creator.month)} plan is on Pro too.`}
            </p>
            <div className="nb-fade-up nb-delay-3 mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signin" className="btn btn-primary btn-lg">
                {`Try it free for ${TRIAL_DAYS} days`}
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link href="/mission" className="btn btn-secondary btn-lg">
                What is not built yet
                <Icon name="arrow-right" size={18} />
              </Link>
            </div>
          </div>
        </section>

        <div className="container-page space-y-16 py-14 sm:py-18">
          <section className="reveal" aria-labelledby="catalogue-title">
            <h2 id="catalogue-title" className="sr-only">
              The feature catalogue
            </h2>
            <FeatureCatalogue
              groups={GROUPS.map((g) => ({ key: g.key, title: g.title, line: g.line }))}
              items={features.map((p) => ({
                slug: p.slug,
                label: p.menu!.label,
                description: p.menu!.description,
                icon: p.menu!.icon,
                group: p.group!,
                status: p.badge.tone,
                statusLabel: p.badge.label,
                plan:
                  p.plan === "pro"
                    ? `Pro, ${dollars(PLAN_PRICES.pro.month)} a month`
                    : `${dollars(PLAN_PRICES.creator.month)} plan, and Pro`,
              }))}
            />
          </section>

          <section className="reveal" aria-labelledby="group-creators">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="group-creators" className="t-h2">By kind of creator</h2>
              <p className="text-ink-soft">The same features, put together for what you sell.</p>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {creators.map((p) => (
                <li key={p.slug}>
                  <Link href={`/for/${p.slug}`} className="flex h-full items-center justify-between gap-3 rounded-[var(--r-md)] border border-line bg-white px-5 py-4 font-semibold text-ink transition-colors hover:bg-sand">
                    {p.eyebrow.replace(/^For /, "").replace(/^./, (c) => c.toUpperCase())}
                    <Icon name="arrow-right" size={16} className="text-violet-deep" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
