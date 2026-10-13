import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { BuyerPath } from "@/components/buyer-path";
import { SiteNav } from "@/components/site-nav";
import { Icon, type IconName } from "@/components/icons";
import { FeatureVisual, type VisualKey } from "@/components/feature-visuals";
import { DemoWindow, Faq, HeroFlow, Pricing, RevealOnScroll } from "@/components/home-parts";
import { HomeData } from "@/components/structured-data";
import { HOME_QUESTIONS } from "@/lib/home-faq";
import { PLAN_PRICES, PRICE_CENTS, TRIAL_DAYS } from "@/lib/plan";
import { isDomainsConfigured } from "@/lib/domains";

export const metadata: Metadata = {
  title: "Nimbus Labs — the link-in-bio store that pays into your own Stripe",
  description:
    "A fast store page for creators who sell files, courses, calls and memberships. Buyers pay into your own Stripe account, what they bought is delivered the second the payment clears, and Nimbus takes 0% of your sales.",
};

const PHOTO = (id: string, w = 400, h = 400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=faces&w=${w}&h=${h}&q=72`;

const PRICE = PRICE_CENTS / 100;

/*
 * The three things that make a sale on Nimbus different.
 *
 * Each one is shown, not described: beside the words is the drawing of the
 * screen it happens on, taken from the page that explains it in full. A claim
 * about where money goes is worth more with the path drawn next to it, and
 * two of these three drawings are the real thing and can be clicked.
 */
const REASONS: {
  icon: IconName;
  title: string;
  body: string;
  example: string;
  visual: VisualKey;
  href: string;
  link: string;
}[] = [
  {
    icon: "bank",
    title: "The money lands in your Stripe",
    body: "Every sale is a direct charge on your own Stripe account. Payouts follow your schedule, and refunds and disputes live in your own dashboard.",
    example:
      "If you ever leave us, nothing moves: the account, the customers and the payout history were yours the whole time.",
    visual: "stripe",
    href: "/platform/your-stripe",
    link: "How the money moves",
  },
  {
    icon: "tag",
    title: "Several prices for one product",
    body: "One week for $27, five weeks for $39. Up to three options on any product, and each option delivers its own file.",
    example:
      "Stan's own help centre lists this among its most requested features and says there is no native way to do it — read on 18 September 2026.",
    visual: "options",
    href: "/platform/price-options",
    link: "See price options",
  },
  {
    icon: "bolt",
    title: "Delivered the second it is paid",
    body: "The file is released when Stripe confirms the payment. If the buyer loses it, a month or a year later, they get it again by email.",
    example:
      "A buyer on a new phone types the address they paid with, and every purchase from that store comes back to them.",
    visual: "delivery",
    href: "/platform/instant-delivery",
    link: "How delivery works",
  },
];

/*
 * What is live, in the five things a creator does with a store. Each line is
 * something that can be opened and tried today; the grouping is what lets a
 * visitor find the one they came for without reading all of them.
 */
type Feature = { title: string; body: string; pro?: boolean };
type Group = { key: string; icon: IconName; title: string; line: string; href: string; link: string; items: Feature[] };

const DOMAINS = isDomainsConfigured();

const GROUPS: Group[] = [
  {
    key: "sell",
    icon: "store",
    title: "Sell",
    line: "What you make, at the prices you choose.",
    href: "/platform#group-sell",
    link: "Everything you can sell",
    items: [
      { title: "Files and links", body: "PDFs, videos, presets and templates up to 5 GB, or a link to where it lives." },
      { title: "Courses", body: "Modules and lessons that can open over time, with free previews." },
      { title: "Paid calls", body: "Your hours once; buyers pick a time in their own time zone." },
      { title: "Memberships", body: "Weekly, monthly or yearly, and members cancel in one click." },
      { title: "Free products", body: "Given for an email address, each one confirmed by its owner." },
    ],
  },
  {
    key: "paid",
    icon: "bank",
    title: "Get paid",
    line: "On your own Stripe account, never ours.",
    href: "/platform#group-paid",
    link: "How you get paid",
    items: [
      { title: "0% of your sales", body: "Stripe's card fee on your account, and nothing on top." },
      { title: "Up to three prices", body: "One week for $27, five weeks for $39, on one product." },
      { title: "Payment plans", body: "Two to twelve payments that end by themselves after the last." },
      { title: "Offers before and after paying", body: "A box at checkout, one click after, on the same card." },
      { title: "Discount codes and sales tax", body: "Codes and Stripe Tax, both on your own account." },
    ],
  },
  {
    key: "deliver",
    icon: "bolt",
    title: "Deliver",
    line: "The second Stripe confirms the payment.",
    href: "/platform/instant-delivery",
    link: "How delivery works",
    items: [
      { title: "Instant download", body: "On screen the second it is paid. Lost later? The buyer gets it again by email, any time." },
      { title: "Courses without passwords", body: "Students open them with a link to their email." },
      { title: "Calendar invites", body: "A booked call lands in both calendars." },
      { title: "Limited quantities", body: "Counted from real payments, and selling stops at zero." },
    ],
  },
  {
    key: "grow",
    icon: "target",
    title: "Grow",
    line: "Bring people back, and bring new ones in.",
    href: "/platform#group-grow",
    link: "Ways to grow",
    items: [
      { title: "Email to your list", body: "One-off emails and sequences, only to people who agreed.", pro: true },
      ...(DOMAINS ? [{ title: "Your own domain", body: "shop.yourname.com opens your store, certificate included.", pro: true }] : []),
      { title: "Ad pixels", body: "Meta, Google, TikTok and Pinterest see each purchase and its amount." },
      { title: "Your photo, your colour", body: "Four themes, ten colours or your own, each checked for contrast." },
      { title: "An address that never breaks", body: "Change it any time; every old link keeps working." },
      { title: "Installs like an app", body: "Your store on the home screen of any iPhone or Android phone." },
    ],
  },
  {
    key: "know",
    icon: "chart",
    title: "Understand",
    line: "What happened, without cookies or guesswork.",
    href: "/platform/insights",
    link: "What your numbers show",
    items: [
      { title: "Your numbers", body: "Visitors, where they came from, checkouts and sales." },
      { title: "Every sale, from Stripe", body: "With the buyer's address, so you can answer them." },
      { title: "No password, ever", body: "Sign in with a link sent to your email. Nothing for us to lose." },
    ],
  },
];

const NEXT_ALL = [
  "Your own domain, on Pro",
  "Several stores in one account, on Pro",
];

/** Built lines move from "next" to "live" on the deployment where they work. */
const NEXT = DOMAINS ? NEXT_ALL.filter((line) => !line.startsWith("Your own domain")) : NEXT_ALL;

/*
 * Four kinds of creator, each shown at work rather than posed.
 *
 * The photographs are licensed stock, and the card says so on its face: the
 * people in them are not our customers, and we will not pretend they are. What
 * they are for is recognition — a visitor should see the thing they do all day
 * before they read a word of ours.
 */
const CREATORS = [
  {
    href: "/for/coaches",
    label: "Coaches and teachers",
    sells: "Workbooks, programmes, paid calls",
    photo: "photo-1758599880979-f6a64947b541",
    alt: "A woman sitting on the floor of her living room, talking through a lesson to a camera",
  },
  {
    href: "/for/cooks",
    label: "Cooks and nutritionists",
    sells: "Meal plans, grocery lists, recipe packs",
    photo: "photo-1780277993159-b4ca60e8922d",
    alt: "A cook in an apron plating a dish in a bright kitchen",
  },
  {
    href: "/for/fitness",
    label: "Fitness creators",
    sells: "Training programmes and challenges",
    photo: "photo-1787647090008-4b88ffc977b7",
    alt: "A movement teacher showing a stretch to someone in a light studio",
  },
  {
    href: "/for/designers",
    label: "Designers and photographers",
    sells: "Presets, templates, brush packs",
    photo: "photo-1765429158141-b283bbe7d0e4",
    alt: "A photographer holding a camera among tall trees",
  },
];

/* Checked on Stan's own public pricing, terms and help pages. */
const COMPARE = [
  { row: "Where the money from a sale goes", stan: "A Stripe account managed by the platform", nimbus: "Your own Stripe account", key: true },
  { row: "Getting paid out", stan: "Manual cash-out, $10 minimum, payout fee", nimbus: "Your Stripe payout schedule, no minimum from us", key: true },
  { row: "Cut of each sale", stan: "0%, plus Stripe's own fees", nimbus: "0%, plus Stripe's own fees", key: false, same: true },
  { row: "Several prices for one product", stan: "Not available", nimbus: "Up to three on any product", key: true },
  { row: "Discount codes", stan: "On the $99 Creator Pro plan", nimbus: `Included at $${PRICE} a month`, key: true },
  { row: "Changing your store address", stan: "Old links forwarded on a best effort", nimbus: "Every address you ever used keeps working", key: false },
];

const SPEED = [
  { label: "Nimbus demo store", score: 98, shown: "97–100", ours: true },
  { label: "Stan store A", score: 57, shown: "57", ours: false },
  { label: "Stan store B", score: 57, shown: "57", ours: false },
  { label: "Stan store C", score: 58, shown: "58", ours: false },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <RevealOnScroll />
      <SiteNav />

      <main id="content">
        {/* ------------------------------------------------------------ hero */}
        <section className="surface-night nb-grid-lines on-dark overflow-hidden">
          <div className="container-page grid items-center gap-12 pb-16 pt-12 sm:gap-14 sm:pt-16 lg:grid-cols-[1.04fr_1fr] lg:gap-12 lg:pb-20 lg:pt-20">
            <div className="nb-fade-up">
              <p className="eyebrow">Link-in-bio store for creators</p>
              <h1 className="t-display mt-5 text-white">
                Your store.
                <br />
                Your <span className="serif nb-gradient-text pr-1 text-[1.08em] leading-[0.9]">Stripe.</span>
                <br />
                Your money.
              </h1>
              <p className="t-lead measure mt-7 text-white/80">
                Sell files, courses, calls and memberships from the link in your bio. Buyers pay straight into your own
                Stripe account, what they bought arrives a second later, and Nimbus takes{" "}
                <strong className="font-semibold text-white">0% of your sales</strong>.
              </p>
              {/*
                On a phone the two calls to action run the width of the
                column: a thumb reaching across a 390px screen should not have
                to find a 180px target, and a half-width button next to empty
                space reads as the smaller of two choices rather than the
                first of two. From 480px up they sit side by side.
              */}
              <div className="mt-9 grid gap-3 min-[480px]:flex min-[480px]:flex-wrap min-[480px]:items-center">
                {/*
                  `w-full` rather than `.btn-block`: that class is plain CSS
                  and Tailwind's utilities sit in a layer, so `.btn-block`
                  would beat the breakpoint that is meant to undo it and the
                  buttons would run the full column on a desktop too.
                */}
                <Link href="/signin" className="btn btn-light btn-lg w-full min-[480px]:w-auto">
                  Start your store
                  <Icon name="arrow-right" size={18} />
                </Link>
                {/*
                  A second button, not a sentence with an arrow. The demo is
                  the strongest thing on this page — a visitor can buy from a
                  real store with a test card in under a minute — and an
                  offer that good should not be dressed as a footnote.
                */}
                <DemoWindow
                  label="See the live demo"
                  className="btn btn-outline-light btn-lg w-full min-[480px]:w-auto"
                />
              </div>
              {/*
                Three facts, not three adjectives. Each one is checkable
                elsewhere on this site inside a minute: the price page, the
                money section and the demo store. They are kept short enough
                to sit two to a row on a phone rather than stacking into a
                third list.
              */}
              <ul className="mt-7 flex flex-wrap gap-2">
                {[
                  { icon: "percent" as IconName, text: "0% of your sales" },
                  { icon: "bank" as IconName, text: "Your own Stripe" },
                  { icon: "calendar" as IconName, text: `${TRIAL_DAYS} days free` },
                ].map((c) => (
                  <li key={c.text} className="chip chip-dark">
                    <Icon name={c.icon} size={15} />
                    {c.text}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-white/80">
                {`$${PRICE} a month after the trial. Cancel in one click, from your own studio.`}
              </p>
            </div>

            <div className="nb-fade-up nb-delay-2">
              <HeroFlow />
            </div>
          </div>

        </section>

        {/*
          The band under the hero.

          It deliberately does not repeat the three chips above it. Those are
          the offer; these are the four things a careful person checks next —
          how fast it is, who handles the card, how hard it is to leave, and
          what the limit is — and every one of them is a measurement or a
          number stated elsewhere on this site, not a slogan.
        */}
        <section aria-label="What you can check before you sign up" className="border-b border-line bg-white">
          <ul className="container-page grid gap-x-10 gap-y-7 py-8 sm:grid-cols-2 sm:py-9 lg:grid-cols-4">
            {[
              {
                icon: "gauge" as IconName,
                figure: "97–100",
                title: "Google PageSpeed",
                body: "Mobile performance on the demo store, measured 17 September 2026.",
              },
              {
                icon: "lock" as IconName,
                figure: "Stripe",
                title: "Handles the card",
                body: "The payment happens on Stripe's own checkout. We never see a card number.",
              },
              {
                icon: "door" as IconName,
                figure: "1 click",
                title: "To cancel",
                body: "From your own studio. No email to us, no chat, no second request.",
              },
              {
                icon: "download" as IconName,
                figure: "200 GB",
                title: "Of downloads a month",
                body: "Written here, not buried in the terms. Files up to 5 GB each.",
              },
            ].map((f) => (
              <li key={f.title} className="flex gap-3.5">
                <span className="icon-tile icon-tile-sm">
                  <Icon name={f.icon} size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[1.375rem] font-semibold leading-none tracking-[-0.035em] text-ink">
                    {f.figure}
                  </span>
                  <span className="mt-1.5 block text-[0.9375rem] font-semibold leading-snug text-ink-soft">{f.title}</span>
                  <span className="mt-1 block text-[0.875rem] leading-snug text-ink-mute">{f.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------ the buyer's path */}
        <BuyerPath />

        {/* ------------------------------------------------------ why Nimbus */}
        <section className="surface-sand section">
          <div className="container-page">
            <div className="reveal max-w-2xl">
              <p className="eyebrow">Why Nimbus</p>
              <h2 className="t-h2 balance mt-4">Built around the one thing that is yours: the money</h2>
            </div>

            <div className="mt-14 space-y-16 sm:mt-16 sm:space-y-20">
              {REASONS.map((r, i) => (
                <article key={r.title} className="reveal grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <span className="icon-tile">
                      <Icon name={r.icon} size={22} />
                    </span>
                    <h3 className="t-h3 mt-6">{r.title}</h3>
                    <p className="measure mt-3 text-ink-soft">{r.body}</p>
                    <p className="measure mt-5 flex gap-2.5 rounded-[var(--r-md)] bg-white p-4 text-[0.9375rem] text-ink-soft ring-1 ring-line">
                      <Icon name="check" size={16} strokeWidth={2.4} className="mt-0.5 shrink-0 text-mint-deep" />
                      <span>{r.example}</span>
                    </p>
                    <Link href={r.href} className="link-arrow mt-6 text-[0.9375rem]">
                      {r.link}
                      <Icon name="arrow-right" size={16} className="arrow" />
                    </Link>
                  </div>
                  {/*
                    min-w-0 is not decoration. A grid item will not shrink
                    below the widest thing inside it unless you say so, and
                    these drawings are full of rows that would rather stay
                    wide, so without it the whole page grows a sideways
                    scrollbar on a phone.
                  */}
                  <div className={`flex min-w-0 justify-center ${i % 2 === 1 ? "lg:order-1 lg:justify-start" : "lg:justify-end"}`}>
                    <FeatureVisual visual={r.visual} tone="light" />
                  </div>
                </article>
              ))}
            </div>

            <div className="reveal mt-16">
              <div className="flex flex-wrap items-center gap-3">
                <span className="tag tag-live">Live now</span>
                <p className="text-sm text-ink-mute">Every line here exists in the code today.</p>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {GROUPS.map((g) => {
                  const shown = g.items.slice(0, 2);
                  const more = g.items.slice(2);
                  const item = (f: Feature) => (
                    <li key={f.title} className="flex gap-3">
                      <Icon name="check" size={16} strokeWidth={2.4} className="mt-1 shrink-0 text-mint-deep" />
                      <span className="min-w-0">
                        <span className="font-semibold text-ink">{f.title}</span>
                        {f.pro ? <span className="tag tag-brand ml-2 h-5! px-1.5! align-middle text-[0.6875rem]!">Pro</span> : null}
                        <span className="block text-[0.9375rem] leading-snug text-ink-soft">{f.body}</span>
                      </span>
                    </li>
                  );
                  return (
                    <section key={g.key} aria-labelledby={`group-${g.key}`} className="card flex flex-col p-6 sm:p-7">
                      <div className="flex items-center gap-3">
                        <span className="icon-tile icon-tile-sm">
                          <Icon name={g.icon} size={18} />
                        </span>
                        <h3 id={`group-${g.key}`} className="text-lg font-semibold tracking-[-0.02em] text-ink">
                          {g.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-[0.9375rem] text-ink-soft">{g.line}</p>
                      <ul className="mt-5 space-y-3.5 border-t border-line pt-5">{shown.map(item)}</ul>
                      {more.length > 0 ? (
                        <details className="group/more mt-3.5">
                          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-[8px] text-sm font-semibold text-violet-deep [&::-webkit-details-marker]:hidden">
                            <Icon name="plus" size={15} className="transition-transform duration-200 group-open/more:rotate-45" />
                            <span className="group-open/more:hidden">{`${more.length} more`}</span>
                            <span className="hidden group-open/more:inline">Fewer</span>
                          </summary>
                          <ul className="mt-3.5 space-y-3.5">{more.map(item)}</ul>
                        </details>
                      ) : null}
                      <Link href={g.href} className="link-arrow mt-auto pt-6 text-[0.9375rem]">
                        {g.link}
                        <Icon name="arrow-right" size={16} className="arrow" />
                      </Link>
                    </section>
                  );
                })}
                <div className="card-flat flex flex-col p-6 sm:p-7">
                  <span className="tag tag-next self-start">Next on the list</span>
                  <p className="mt-4 text-[0.9375rem] text-ink-soft">
                    Not built yet, so not sold yet. This is the order we are building them in.
                  </p>
                  <ol className="mt-5 space-y-3">
                    {NEXT.map((n, i) => (
                      <li key={n} className="flex gap-3 text-ink">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sand text-[0.75rem] font-semibold text-ink-soft">
                          {i + 1}
                        </span>
                        <span className="text-[0.9375rem]">{n}</span>
                      </li>
                    ))}
                  </ol>
                  <Link href="/mission" className="link-arrow mt-auto pt-6 text-[0.9375rem]">
                    The whole plan
                    <Icon name="arrow-right" size={16} className="arrow" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- the money */}
        <section id="money" className="surface-night on-dark section scroll-mt-20 overflow-hidden">
          <div className="container-page grid items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
            <div className="reveal">
              <p className="eyebrow">The money</p>
              <h2 className="t-h2 balance mt-4 text-white">
                We never touch a cent of <span className="serif font-normal">your</span> sales
              </h2>
              <p className="t-lead measure mt-6 text-white/70">
                Your buyer pays on your own Stripe account, through a direct charge. If you ever leave, nothing moves:
                the account, the customers and the payouts were always yours.
              </p>
              <p className="measure mt-4 text-white/70">
                We make money one way only, a monthly subscription. That is the whole business model, written on one line.
              </p>
              <ol aria-label="Where the money goes" className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { icon: "user" as IconName, label: "Your buyer" },
                  { icon: "lock" as IconName, label: "Stripe checkout" },
                  { icon: "bank" as IconName, label: "Your Stripe account", ours: true },
                  { icon: "receipt" as IconName, label: "Your bank" },
                ].map((n, i) => (
                  <li
                    key={n.label}
                    className={`relative flex flex-col gap-2 rounded-[var(--r-md)] px-3.5 py-3 text-sm ${
                      n.ours ? "bg-white text-ink" : "bg-white/[0.06] text-white/80 ring-1 ring-white/10"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <Icon name={n.icon} size={18} className={n.ours ? "text-violet-deep" : "text-[#b9a8ff]"} />
                      <span className={`text-[0.75rem] font-semibold ${n.ours ? "text-ink-soft" : "text-white/70"}`}>{i + 1}</span>
                    </span>
                    <span className="font-semibold">{n.label}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-sm text-white/70">Nimbus is not a step on this path.</p>
              <Link href="/platform/your-stripe" className="btn btn-outline-light mt-8">
                How the money moves
              </Link>
            </div>

            <div className="reveal">
              <div className="rounded-[var(--r-xl)] bg-white p-6 text-ink shadow-[var(--shadow-device)] sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink-mute">A sale of the 5-week planner</p>
                  <span className="tag tag-live">Paid</span>
                </div>
                <p className="mt-3 text-[2.75rem] font-semibold leading-none tracking-[-0.05em]">$39.00</p>
                <dl className="mt-7 divide-y divide-line border-y border-line text-[0.9375rem]">
                  <div className="flex items-center justify-between py-3.5">
                    <dt className="text-ink-soft">Paid by your buyer</dt>
                    <dd className="font-semibold">$39.00</dd>
                  </div>
                  <div className="flex items-center justify-between py-3.5">
                    <dt className="text-ink-soft">Stripe&apos;s processing fee</dt>
                    <dd className="text-ink-soft">set by Stripe, on your account</dd>
                  </div>
                  <div className="flex items-center justify-between py-3.5">
                    <dt className="text-ink-soft">Nimbus Labs</dt>
                    <dd className="font-semibold text-mint-deep">$0.00</dd>
                  </div>
                </dl>
                <div className="mt-6 flex items-center gap-3 rounded-[var(--r-md)] bg-lilac p-4">
                  <span className="icon-tile icon-tile-sm bg-white">
                    <Icon name="bank" size={18} />
                  </span>
                  <p className="text-[0.9375rem] text-violet-ink">
                    <strong className="font-semibold">Lands in your Stripe account.</strong> Same dashboard, same payout rhythm.
                  </p>
                </div>
                <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink-mute">
                  Tested on 17 September 2026 with a real Stripe checkout in test mode: the sale landed on the creator&apos;s
                  account with no cut for the platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ who it's for */}
        <section className="section">
          <div className="container-page">
            <div className="reveal flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="eyebrow">Who it is for</p>
                <h2 className="t-h2 balance mt-4">People who sell what they know</h2>
              </div>
              <Link href="/creators" className="link-arrow">
                Tell us what you sell
                <Icon name="arrow-right" size={16} className="arrow" />
              </Link>
            </div>

            <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {CREATORS.map((c) => (
                <li key={c.href} className="reveal">
                  <Link href={c.href} className="group block overflow-hidden rounded-[var(--r-lg)] border border-line bg-white shadow-[var(--shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--shadow-md)]">
                    <div className="relative aspect-[4/5] overflow-hidden bg-sand-deep">
                      <img
                        src={PHOTO(c.photo, 560, 700)}
                        srcSet={`${PHOTO(c.photo, 400, 500)} 400w, ${PHOTO(c.photo, 560, 700)} 560w, ${PHOTO(c.photo, 840, 1050)} 840w`}
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 46vw"
                        alt={c.alt}
                        width={560}
                        height={700}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-[1.03]"
                      />
                      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
                    </div>
                    <div className="p-4 sm:p-5">
                      <p className="flex items-center justify-between gap-2 text-[0.9375rem] font-semibold leading-snug text-ink sm:text-base">
                        {c.label}
                        <Icon name="arrow-right" size={16} className="text-ink-mute transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-violet-deep" />
                      </p>
                      <p className="mt-1 text-[0.8125rem] text-ink-soft sm:text-[0.9375rem]">{c.sells}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/*
              Said plainly, under the photographs themselves. We have no
              customers to show yet, and a stock photograph presented as one
              would be the first lie on a site whose whole argument is that we
              do not tell them.
            */}
            <p className="reveal mt-6 flex items-start gap-2.5 text-[0.875rem] text-ink-mute">
              <Icon name="info" size={16} className="mt-0.5 shrink-0" />
              <span className="measure-wide">
                Licensed photographs of people at work, not customers of ours. Every store behind these links is an
                example we built, and the one store here you can buy from is the{" "}
                <Link href="/demo" className="link">
                  live demo
                </Link>
                .
              </span>
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------- compare */}
        <section id="compare" className="surface-sand section scroll-mt-20">
          <div className="container-page">
            <div className="reveal max-w-2xl">
              <p className="eyebrow">Side by side</p>
              <h2 className="t-h2 balance mt-4">How we compare with Stan</h2>
              <p className="mt-5 text-ink-soft">
                Checked on Stan&apos;s own public pricing, terms and help pages in September 2026, the discount row on
                22 September. If any of it changes, this section changes.
              </p>
            </div>

            <ul className="reveal mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COMPARE.map((r) => {
                const same = "same" in r && r.same === true;
                return (
                  <li key={r.row} className={`${same ? "card-flat" : "card"} flex flex-col p-6`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-ink">{r.row}</p>
                      <span className={`tag shrink-0 ${same ? "" : "tag-brand"}`}>
                        {same ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                              <path d="M2 4.5h8M2 7.5h8" />
                            </svg>
                            Same on both
                          </>
                        ) : (
                          <>
                            <Icon name="check" size={12} strokeWidth={3} />
                            Nimbus ahead
                          </>
                        )}
                      </span>
                    </div>
                    <dl className="mt-4 grid gap-2.5 text-[0.9375rem]">
                      <div className="grid grid-cols-[4.25rem_1fr] gap-3">
                        <dt className="text-ink-mute">Stan</dt>
                        <dd className="text-ink-soft">{r.stan}</dd>
                      </div>
                      <div className={`grid grid-cols-[4.25rem_1fr] gap-3 ${same ? "" : "-mx-3 rounded-[var(--r-sm)] bg-lilac/60 px-3 py-2"}`}>
                        <dt className="font-semibold text-violet-deep">Nimbus</dt>
                        <dd className={same ? "text-ink" : "font-semibold text-ink"}>{r.nimbus}</dd>
                      </div>
                    </dl>
                  </li>
                );
              })}
            </ul>

            <div className="reveal mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <div className="card-flat p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="icon-tile icon-tile-sm">
                    <Icon name="gauge" size={18} />
                  </span>
                  <p className="font-semibold text-ink">Speed on a phone</p>
                </div>
                <p className="mt-3 text-[0.9375rem] text-ink-soft">
                  Google PageSpeed Insights, mobile performance score, measured on 17 September 2026. Three public Stan
                  stores chosen at random, same tool, same day.
                </p>
                <ul className="mt-5 space-y-3">
                  {SPEED.map((s) => (
                    <li key={s.label} className="grid grid-cols-[8.5rem_1fr_3.5rem] items-center gap-3 text-[0.9375rem]">
                      <span className={s.ours ? "font-semibold text-ink" : "text-ink-soft"}>{s.label}</span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-sand">
                        <span
                          className={`block h-full rounded-full ${s.ours ? "bg-violet-brand" : "bg-ink-mute/45"}`}
                          style={{ width: `${s.score}%` }}
                        />
                      </span>
                      <span className={`text-right tabular-nums ${s.ours ? "font-semibold text-ink" : "text-ink-soft"}`}>
                        {s.shown}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-flat flex flex-col justify-between p-6 sm:p-7">
                <div>
                  <p className="font-semibold text-ink">Where Stan is ahead today</p>
                  <p className="mt-3 text-[0.9375rem] text-ink-soft">
                    Stan has funnels, affiliates paid automatically, automatic Instagram replies and communities.
                    We do not have those yet, and we say so on every page that could make you think otherwise.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                  <Link href="/proof/everything" className="link-arrow text-[0.9375rem]">
                    Feature by feature
                    <Icon name="arrow-right" size={16} className="arrow" />
                  </Link>
                  <Link href="/proof/compare" className="link-arrow text-[0.9375rem]">
                    The full comparison
                    <Icon name="arrow-right" size={16} className="arrow" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- pricing */}
        <section id="pricing" className="section scroll-mt-20">
          <div className="container-page">
            <div className="reveal mx-auto max-w-2xl text-center">
              <p className="eyebrow">Pricing</p>
              <h2 className="t-h2 balance mt-4">Two plans. Your sales stay yours.</h2>
              <p className="mt-5 text-ink-soft">
                {`The same $${PRICE} and $${PLAN_PRICES.pro.month / 100} a month as Stan's two plans, with 0% of your sales and the sale itself landing in your own Stripe account. The $${PRICE} plan holds what Stan keeps for its $${PLAN_PRICES.pro.month / 100} one: discount codes, pixels, order bumps, upsells and payment plans.`}
              </p>
            </div>
            <div className="reveal mx-auto mt-12 max-w-5xl">
              <Pricing domains={DOMAINS} />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ faq */}
        <section id="faq" className="surface-sand section scroll-mt-20">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <div className="reveal">
              <p className="eyebrow">Questions</p>
              <h2 className="t-h2 balance mt-4">Including the awkward ones</h2>
              <p className="mt-5 text-ink-soft">
                Something else?{" "}
                <Link href="/help" className="link">
                  The help centre
                </Link>{" "}
                answers the rest, in writing.
              </p>
            </div>
            <div className="reveal">
              <Faq />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ final CTA */}
        <section className="surface-signature on-dark overflow-hidden">
          <div className="container-narrow py-20 text-center sm:py-28">
            <h2 className="t-h1 balance text-white">Put your first product up today</h2>
            <p className="t-lead mx-auto mt-6 max-w-xl text-white/80">
              {`Take your address, connect your own Stripe account and list what you sell. The till is yours for ${TRIAL_DAYS} days before you decide whether we are worth $${PRICE} a month.`}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
              <Link href="/signin" className="btn btn-light btn-lg">
                Start your store
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link href="/demo" className="link-arrow on-dark">
                See the live demo
                <Icon name="arrow-right" size={18} className="arrow" />
              </Link>
            </div>
            <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[0.9375rem] text-white/80">
              {[
                { icon: "calendar" as IconName, text: `${TRIAL_DAYS} days free` },
                { icon: "door" as IconName, text: "Cancel in one click" },
                { icon: "percent" as IconName, text: "0% of your sales" },
                { icon: "lock" as IconName, text: "Payments by Stripe" },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-2">
                  <Icon name={f.icon} size={17} className="text-white/70" />
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
      <HomeData questions={HOME_QUESTIONS} />
    </div>
  );
}
