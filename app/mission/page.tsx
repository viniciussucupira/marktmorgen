import type { Metadata } from "next";
import Link from "next/link";
import { Icon, iconFor, type IconName } from "@/components/icons";
import { RevealOnScroll } from "@/components/home-parts";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { isBillingConfigured } from "@/lib/billing";
import { PLAN_PRICES, PRICE_CENTS, TRIAL_DAYS, YEAR_PRICE_CENTS } from "@/lib/plan";
import { isConnectConfigured } from "@/lib/stripe-connect";
import { isDomainsConfigured } from "@/lib/domains";

export const metadata: Metadata = {
  title: "Our mission — Nimbus Labs",
  description:
    "Why Nimbus exists, what we believe, what we have built so far and what we have not built yet. Written plainly, including the parts that are not finished.",
};

const VALUES = [
  {
    emoji: "🧾",
    title: "Charge fairly, promise only what we can deliver",
    text: "One subscription, written in one line. No cut of your sales, no fee that appears at the last screen, no feature listed on the site that does not exist in the product.",
    tone: "bg-lilac",
  },
  {
    emoji: "🔑",
    title: "The money is yours from the first second",
    text: "Your buyer pays into your own Stripe account. We never hold your balance, never set your payout schedule, and never stand between you and your customer's card.",
    tone: "bg-cream",
  },
  {
    emoji: "🪟",
    title: "Say the uncomfortable part out loud",
    text: "Where a competitor is better than us, we write it down. Where we have not built something yet, the page says so instead of going quiet.",
    tone: "bg-mint-brand/12",
  },
  {
    emoji: "⚡",
    title: "Fast is a feature, not a bonus",
    text: "Your buyer is on a phone, on mobile data, with three seconds of patience. Every page we ship is measured, and the numbers are published on the site.",
    tone: "bg-sky-brand/12",
  },
  {
    emoji: "🚪",
    title: "Easy to leave",
    text: "Your Stripe account, your customer list and your files stay yours. A product people stay with because leaving is hard is not a product we want to run.",
    tone: "bg-pink-brand/10",
  },
  {
    emoji: "🎨",
    title: "A store worth putting in your bio",
    text: "Colour, movement and a page that looks like a person made it. A store that looks like a form is a store people close.",
    tone: "bg-amber-brand/12",
  },
];

const BUILT = [
  "A store page with your photo, your links and your products, in one of four themes and the colour you choose",
  "Price options on one product — one week, five weeks, the season — up to three, each handing over its own file or link",
  "A Stripe checkout that charges the creator account directly, with nothing taken on top — running in test mode on the demo store",
  "The file delivered the second the payment clears, with a link that expires",
  "A buyer who loses that link gets everything they bought from the store again, by email, at any time — no account, no password",
  "A creator account you sign in to with an emailed link, and no password at all",
  "Your own store address, live the moment you take it",
  "A change of address that never breaks the link already in your bio",
  "An editor for your own store: the name, the description, and what you sell with its price",
  "The file you sell, uploaded straight from your browser and kept where only you can reach it",
  "Or a link instead of a file, for what is too big to upload or is not a file at all",
  "Memberships: daily, weekly, monthly or yearly, charged on your own Stripe account",
  "Members who cancel on their own, in one click on Stripe's own page, without having to write to you",
  "Your numbers: visitors, where they came from, checkouts started and sales for the last week or month — visits counted without cookies, sales read from your own Stripe",
  "Your own Meta, Google, TikTok and Pinterest pixels, told of every page view, checkout, lead and purchase with its amount, and loaded only once a visitor allows it where the law asks for that",
  "An order bump: another of your products offered in a box the buyer ticks at checkout, at your price, never ticked for them, and delivered with the first",
  "A one-click upsell: another product offered on the thanks page, charged in one press to the card just used, only in the browser that paid, within the hour and once",
  "Payment plans: two to twelve weekly or monthly payments on your own Stripe account, the product delivered after the first, and the plan given its end so no buyer is charged once more",
  "Sales tax and VAT worked out by Stripe Tax on your own account and added at checkout, switched on once Stripe says your tax setup is complete",
  "Limited quantities: the page shows how many are left, counted from real payments, and a unit someone is paying for is held so the last one is never sold twice",
  "Courses: modules of lessons with video, text, downloads and a link, free preview lessons, modules that open a set number of days after each student joins with an email the day they do, and each student's progress in your studio — students open them with their email, no password",
  "Paid calls with a calendar: your weekly hours in your time zone, the free times shown to each buyer in theirs, the time held while they pay, and a calendar file emailed to both of you",
  "Links to everywhere else you are — the channel, the podcast, the booking page — with no price and no checkout on them",
  "Discount codes a buyer types at checkout, made as coupons on your own Stripe account",
  "Free products given for an email address, each address confirmed by its owner, and the list downloadable from your studio at any time",
  "Email to your list, on Pro: one-off emails now or at a time you choose, and sequences that send themselves after someone joins or buys — only to people who agreed, with a one-click unsubscribe in every one",
  "A store that installs to the home screen on iPhone and Android",
  "A live demo store anyone can buy from with a test card, before signing up",
];

/**
 * One line that moves between the two lists depending on this deployment.
 *
 * The code is written either way; what changes is whether this site can
 * actually reach Stripe. The page says which of those is true here rather
 * than claiming a button that would do nothing.
 */
const STRIPE_LINE =
  "Connecting your own Stripe account from the studio, so charges are made on it and not on ours";

const CHECKOUT_LINE =
  "Selling: the buyer pays on your account and the file is handed over the moment Stripe confirms it";

const ORDERS_LINE =
  "A list of what you have sold, read from your own Stripe account, with the buyer’s address so you can answer them";

/**
 * The line about our own income, which belongs to whether billing can reach
 * Stripe from this deployment rather than to whether we have written the code.
 */
const BILLING_LINE = `The subscription that pays us: $${PRICE_CENTS / 100} a month or $${YEAR_PRICE_CENTS / 100} a year, or $${PLAN_PRICES.pro.month / 100} and $${PLAN_PRICES.pro.year / 100} on Pro, free for the first ${TRIAL_DAYS} days, with an email a week before the first charge, cancelled in one click from your studio`;

/** The store on its own domain: built, and live where this deployment can add domains. */
const DOMAIN_LINE =
  "Your store on your own domain, on Pro: type it in the studio, add the one record we show you, and the certificate is handled for you";

const NOT_BUILT = [
  "PayPal as a second way to be paid — it is Stripe only today",
  "Communities and group chat",
  "Reading your Google or Outlook calendar, so a busy day closes by itself",
  "Several stores in one account",
  "An affiliate programme",
];

/* What shipped, and when: read from the site's own history, not written for effect. */
const RELEASES: { date: string; items: string }[] = [
  { date: "17 September 2026", items: "The live demo store: a Stripe checkout charged on a creator's own account, and the file handed over the moment Stripe confirms it." },
  { date: "18 September 2026", items: "Signing in with a link sent to your email, and no password anywhere." },
  { date: "19 September 2026", items: "Creator stores: an @address of your own, products and prices, the file each one delivers, and your own Stripe account connected." },
  { date: "20 September 2026", items: "Memberships, discount codes, and several prices on one product in every store." },
  { date: "21 September 2026", items: "Free products for an email address, members who cancel on their own, and cancelling the Nimbus plan in one click." },
  { date: "22 September 2026", items: "Paid calls, courses, numbers and ad pixels, offers before and after paying, payment plans, sales tax, yearly plans, email to your list and your own domain on Pro, and buyers getting any purchase again by email." },
];

/* Facts a creator can check before trusting us with a store. */
const TRUST: { icon: IconName; title: string; body: string; href: string; link: string }[] = [
  { icon: "user", title: "Who builds it", body: "Vinicius Sucupira, the founder, who writes the code and answers the email.", href: "/proof/questions", link: "The awkward questions" },
  { icon: "mail", title: "How to reach us", body: "By email. A person reads every message and answers in writing, in English.", href: "mailto:support@nimbuslabsai.com", link: "Write to us" },
  { icon: "bank", title: "Where the money is", body: "Every sale is processed by Stripe on the creator's own account. We never hold a balance of yours.", href: "/platform/your-stripe", link: "How the money moves" },
  { icon: "shield", title: "What we keep about you", body: "What the service needs to run, listed in plain words, with who processes it for us. Nothing is sold.", href: "/privacy", link: "Privacy policy" },
  { icon: "receipt", title: "The rules, in writing", body: "The terms of the service, and a full refund of any charge from us you ask for within 14 days.", href: "/terms", link: "Terms and refunds" },
  { icon: "door", title: "Leaving is free", body: "Your Stripe account, customers and payouts were always yours, and your list downloads as a file at any time.", href: "/proof/promises", link: "What we never do" },
];

export default function MissionPage() {
  // Whether this deployment can actually reach Stripe decides which list the
  // line belongs in. A feature nobody here can press is not a built feature.
  const ready = isConnectConfigured();
  const billing = isBillingConfigured();
  const domains = isDomainsConfigured();
  const built = [
    ...BUILT,
    ...(domains ? [DOMAIN_LINE] : []),
    ...(ready ? [STRIPE_LINE, CHECKOUT_LINE, ORDERS_LINE] : []),
    ...(billing ? [BILLING_LINE] : []),
  ];
  const notBuilt = [
    ...(domains ? [] : ["Your own domain for your store"]),
    ...(ready ? [] : [STRIPE_LINE, CHECKOUT_LINE, ORDERS_LINE]),
    ...(billing ? [] : [BILLING_LINE]),
    ...NOT_BUILT,
  ];
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <RevealOnScroll />
      <SiteNav />

      <main id="content" className="flex-1">
        <section className="surface-night nb-grid-lines on-dark overflow-hidden">
          <div className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <p className="eyebrow">Our mission</p>
              <h1 className="t-h1 balance mt-5 text-white">
                Nobody should need a platform&apos;s permission{" "}
                <span className="serif font-normal text-[#cfc4ff]">to be paid for their work</span>
              </h1>
              <p className="t-lead mt-6 max-w-2xl text-white/80">
                Selling something you made should cost you the card fee and nothing more. That is the whole idea, and
                everything we build is judged against it.
              </p>
            </div>
            {/*
              The state of the product, in three figures, at the top of the
              page that claims to be honest about it. A mission statement
              beside a count of what is still missing is a harder thing to
              write than a mission statement on its own, which is the point.
            */}
            <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { value: String(built.length), label: "features built and working", tone: "mint" },
                { value: String(notBuilt.length), label: "named, and not built yet", tone: "plain" },
                { value: "0%", label: "of your sales, on every plan", tone: "plain" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-baseline gap-4 rounded-[var(--r-lg)] border border-white/14 bg-white/[0.05] px-5 py-4 backdrop-blur-sm"
                >
                  <dd
                    className={`figure-big ${s.tone === "mint" ? "text-[#6fe3ba]" : "text-white"}`}
                  >
                    {s.value}
                  </dd>
                  <dt className="text-[0.9375rem] leading-snug text-white/80">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="container-narrow py-16 sm:py-24">
          <h2 className="t-h2">Why Nimbus exists</h2>
          <div className="prose-nb mt-6">
            <p>
              A creator with an audience and a file to sell has never had more tools and never had less control. The
              common arrangement is this: the buyer pays the platform, the platform keeps a percentage, the platform holds
              the balance, and the platform decides when the money moves and under what rules.
            </p>
            <p>
              Each of those is a small thing on one sale. Together they decide whether the work you did is a business you
              own or an account somebody else can close.
            </p>
            <p>
              Nimbus is built the other way around. The buyer&apos;s card is charged on your Stripe account. The receipt
              carries your name. The payout schedule is yours. We take 0% of your sales and make money one way only — a
              monthly subscription, the same price whether you sell three files or three thousand.
            </p>
          </div>

          <figure className="mt-12 rounded-[var(--r-lg)] border border-line bg-white p-7 sm:p-8">
            <p className="font-semibold text-ink">A note on how we write</p>
            <blockquote className="mt-3 text-ink-soft">
              We do not publish invented reviews, invented customers or screenshots of money we never made. If a page shows
              a person, they are a stock photograph and the page says so. When we compare ourselves with anyone, we link to
              their own site so you can check it. It is a slower way to sell, and it is the only one we are willing to run.
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-5 text-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-lilac font-semibold text-violet-deep">VS</span>
              <span>
                <span className="block font-semibold text-ink">Vinicius Sucupira</span>
                <span className="text-ink-mute">Founder, Nimbus Labs</span>
              </span>
            </figcaption>
          </figure>
        </section>

        <section className="surface-sand section">
          <div className="container-page">
            <div className="max-w-2xl">
              <p className="eyebrow">What we hold ourselves to</p>
              <h2 className="t-h2 mt-4">Six rules you can check</h2>
              <p className="mt-4 text-ink-soft">Every one of them is something you can verify on the site or in the product.</p>
            </div>
            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map((value, i) => (
                <li key={value.title} className="card reveal p-7">
                  <div className="flex items-center justify-between">
                    <span className="icon-tile">
                      <Icon name={iconFor(value.emoji)} size={22} />
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-ink-mute">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-6 text-[1.0625rem] font-semibold leading-snug text-ink">{value.title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{value.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section">
          <div className="container-page">
            <div className="max-w-2xl">
              <p className="eyebrow">Where the product is today</p>
              <h2 className="t-h2 mt-4">Both columns, in full</h2>
              <p className="mt-4 text-ink-soft">
                What works today and what does not exist yet, so nobody signs up expecting the second list.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {/*
                Thirty true lines in one column is a wall, and a wall gets
                skipped — which loses the argument the list was written to
                win. The first ten carry it; the rest are one press away, and
                the press says how many are behind it, so nothing is hidden,
                only folded.
              */}
              <div className="card reveal p-7 sm:p-8">
                <span className="tag tag-live">{`Built and working · ${built.length}`}</span>
                <ul className="mt-6 space-y-3">
                  {built.slice(0, 10).map((item) => (
                    <li key={item} className="flex gap-3 text-[0.9375rem] text-ink-soft">
                      <Icon name="check" size={18} strokeWidth={2.2} className="mt-0.5 shrink-0 text-mint-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {built.length > 10 ? (
                  <details className="group/all mt-4 border-t border-line pt-4">
                    <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[8px] font-semibold text-violet-deep [&::-webkit-details-marker]:hidden">
                      <Icon
                        name="plus"
                        size={16}
                        className="transition-transform duration-200 group-open/all:rotate-45"
                      />
                      <span className="group-open/all:hidden">{`The other ${built.length - 10}`}</span>
                      <span className="hidden group-open/all:inline">Show fewer</span>
                    </summary>
                    <ul className="mt-4 space-y-3">
                      {built.slice(10).map((item) => (
                        <li key={item} className="flex gap-3 text-[0.9375rem] text-ink-soft">
                          <Icon name="check" size={18} strokeWidth={2.2} className="mt-0.5 shrink-0 text-mint-brand" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
                <Link href="/demo" className="btn btn-primary mt-8">
                  Try it in the demo store
                </Link>
              </div>

              <div className="card-flat reveal self-start p-7 sm:p-8">
                <span className="tag tag-next">{`Not built yet · ${notBuilt.length}`}</span>
                <ul className="mt-6 space-y-3">
                  {notBuilt.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.9375rem] text-ink-soft">
                      <Icon name="minus" size={18} className="mt-0.5 shrink-0 text-ink-mute" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-7 border-t border-line pt-5 text-sm text-ink-soft">
                  Other platforms have these today. If you need them now, they are the better choice now, and{" "}
                  <Link href="/proof/compare" className="link">
                    our comparison page
                  </Link>{" "}
                  says so in writing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-sand section" aria-labelledby="trust-title">
          <div className="container-page">
            <div className="max-w-2xl">
              <p className="eyebrow">Before you trust us with a store</p>
              <h2 id="trust-title" className="t-h2 mt-4">Things you can check</h2>
              <p className="mt-4 text-ink-soft">No badges, no borrowed logos. Each of these leads to the page that proves it.</p>
            </div>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TRUST.map((t) => (
                <li key={t.title} className="card reveal flex flex-col p-7">
                  <span className="icon-tile">
                    <Icon name={t.icon} size={22} />
                  </span>
                  <h3 className="mt-6 text-[1.0625rem] font-semibold text-ink">{t.title}</h3>
                  <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">{t.body}</p>
                  {t.href.startsWith("mailto:") ? (
                    <a href={t.href} className="link-arrow mt-5 text-[0.9375rem]">
                      {t.link}
                      <Icon name="arrow-right" size={16} className="arrow" />
                    </a>
                  ) : (
                    <Link href={t.href} className="link-arrow mt-5 text-[0.9375rem]">
                      {t.link}
                      <Icon name="arrow-right" size={16} className="arrow" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" aria-labelledby="history-title">
          <div className="container-narrow">
            <p className="eyebrow">Built in public</p>
            <h2 id="history-title" className="t-h2 mt-4">What shipped, and when</h2>
            <p className="mt-4 text-ink-soft">Each line went live on the day it says, and is listed as built above.</p>
            <ol className="relative mt-10 space-y-8 border-l border-line pl-8">
              {RELEASES.map((r) => (
                <li key={r.date} className="reveal relative">
                  <span className="absolute -left-[2.3rem] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-violet-brand" aria-hidden="true" />
                  <p className="text-sm font-semibold text-violet-deep">{r.date}</p>
                  <p className="mt-1.5 leading-relaxed text-ink-soft">{r.items}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="surface-signature on-dark overflow-hidden">
          <div className="container-narrow py-20 text-center sm:py-24">
            <h2 className="t-h2 balance text-white">Help decide what gets built next</h2>
            <p className="mx-auto mt-5 max-w-xl text-white/80">
              Tell us what you sell and what breaks today. It takes two minutes, there is nothing to buy, and it is what the
              roadmap is made of.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
              <Link href="/creators" className="btn btn-light btn-lg">
                Answer eight questions
              </Link>
              <Link href="/signin" className="link-arrow on-dark">
                Start your store
                <Icon name="arrow-right" size={18} className="arrow" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
