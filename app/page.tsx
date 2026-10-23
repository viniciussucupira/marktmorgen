import { TrustChecks } from "@/components/trust-checks";
import { StudioScreens } from "@/components/studio-screens";
import { CreatorShowcase, PlatformProof } from "@/components/creator-showcase";
import { PricingValue } from "@/components/pricing-value";
import { PATH_HOME_STEPS } from "@/lib/path-home";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_OG_IMAGE } from "@/lib/site-og";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { BuyerPath } from "@/components/buyer-path";
import { SiteNav } from "@/components/site-nav";
import { Icon, type IconName } from "@/components/icons";
import { FeatureVisual, type VisualKey } from "@/components/feature-visuals";
import { HeroFlow, Pricing } from "@/components/home-parts";
import { Faq, SoldMarquee } from "@/components/home-static";
import { HOME_MODULES } from "@/lib/home-modules";
import { HomeData } from "@/components/structured-data";
import { homeQuestions } from "@/lib/home-faq";
import { paypalSalesConfigured } from "@/lib/paypal-sales";
import { PUBLISHED_PRICE_CENTS as PRICE_CENTS, REFUND_DAYS, TRIAL_DAYS } from "@/lib/plan";
import { isDomainsConfigured } from "@/lib/domains";
import { PLANS_ON_SALE } from "@/lib/opening";
import { feeWords } from "@/lib/fee-words";

const HOME_TITLE = "Marktmorgen — sell your work, build your business";
const HOME_DESCRIPTION =
  "A fast store page for creators who sell files, courses, calls and memberships. Buyers pay into your own Stripe account, every handover is checked against Stripe's own record of the payment, and " + feeWords().takes + " Stripe's processing fee applies.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  // Zoom's Marketplace checks that this domain is ours by reading this tag
  // from the home page, for the app that makes Zoom meetings (lib/meet-providers.ts).
  other: { "zoom-domain-verification": "ZOOM_verify_6f2160153a5d41208ff71fe77f6b7c01" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Marktmorgen",
    locale: "en_US",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESCRIPTION, images: [SITE_OG_IMAGE.url] },
};

const PHOTO = (id: string, w = 400, h = 400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=faces&w=${w}&h=${h}&q=72`;

const PRICE = PRICE_CENTS / 100;

/*
 * The three things that make a sale on Marktmorgen different.
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
    body: "One week for $27, five weeks for $39. Up to 50 options on any product, compared side by side, and each option delivers its own file.",
    example:
      "A week at one price, five weeks at another, the season at a third. The buyer picks; each one hands over its own file.",
    visual: "options",
    href: "/platform/price-options",
    link: "See price options",
  },
  {
    icon: "bolt",
    title: "Reliable access after payment",
    body: "A file downloads, a course opens, a booked call lands on both calendars — but only after we ask Stripe's own record whether the payment settled, and we ask again on every download. A link somebody guesses or forwards opens nothing. The confirmation email links back to the purchase when the buyer leaves checkout.",
    example:
      "A buyer on a new phone types the email address they paid with, and every purchase from that store comes back to them — a month or a year later, for as long as the store is open and the product is still there.",
    visual: "delivery",
    href: "/platform/instant-delivery",
    link: "How delivery works",
  },
];

const DOMAINS = isDomainsConfigured();

/*
 * What a creator may come looking for and will not find, said beside what is
 * live. Not a promise of when: each is a line where Stan is ahead today, and
 * the feature-by-feature page has the rest.
 */
const NOT_YET = [
  "Automatic replies on Instagram",
  "An iPhone app from the App Store",
  "Paying affiliates without a PayPal account of your own",
];

/*
 * Eight kinds of creator, each shown at work rather than posed.
 *
 * Four was a tidy row and a thin answer: a visitor looking for themselves
 * either saw their trade in the first four or decided this was not for them.
 * Eight is a market, and the cards are now sized unevenly — the first two
 * run tall, the rest sit in a denser grid — so the block reads as a wall of
 * people rather than a set of equal tiles.
 *
 * The photographs are licensed stock, and the line under them says so: the
 * people in them are not our customers, and we will not pretend they are.
 * What they are for is recognition — a visitor should see the thing they do
 * all day before they read a word of ours.
 */
const CREATORS = [
  {
    href: "/for/coaches",
    label: "Coaches and teachers",
    sells: "Worksheets, programs, paid calls",
    photo: "photo-1581065178047-8ee15951ede6",
    alt: "A woman sitting on the floor of her living room, talking through a lesson to a camera",
  },
  {
    href: "/for/cooks",
    label: "Cooks and nutritionists",
    sells: "Meal plans, grocery lists, recipe packs",
    photo: "photo-1607990283143-e81e7a2c9349",
    alt: "A cook in an apron plating a dish in a bright kitchen",
  },
  {
    href: "/for/fitness",
    label: "Fitness creators",
    sells: "Training programs and challenges",
    photo: "photo-1630939687530-241d630735df",
    alt: "A movement teacher showing a stretch to someone in a light studio",
  },
  {
    href: "/for/designers",
    label: "Designers and photographers",
    sells: "Presets, templates, brush packs",
    photo: "photo-1589386417686-0d34b5903d23",
    alt: "A photographer holding a camera among tall trees",
  },
  {
    href: "/platform/courses",
    label: "Musicians and producers",
    sells: "Sample packs, lessons, chord charts",
    photo: "photo-1573496527892-904f897eb744",
    alt: "A musician at a desk with a keyboard and headphones",
  },
  {
    href: "/platform/memberships",
    label: "Writers and newsletters",
    sells: "Memberships, archives, workshops",
    photo: "photo-1758691737605-69a0e78bd193",
    alt: "A writer at a window desk with a notebook open",
  },
  {
    href: "/platform/calls",
    label: "Therapists and counselors",
    sells: "Booked sessions and workbooks",
    photo: "photo-1600679472868-eae382e28b34",
    alt: "Two people talking across a low table in a calm room",
  },
  {
    href: "/platform/community",
    label: "Makers and crafters",
    sells: "Patterns, classes, a community",
    photo: "photo-1789757165446-daec9334f72e",
    alt: "A maker at a bench with tools and materials laid out",
  },
];




function HomeActions({place}:{place:string}) {
 return <div data-home-actions={place} role="group" aria-label={"Choose your next step: "+place} className="container-page flex flex-wrap items-center justify-center gap-x-6 gap-y-4 py-8">
  <Link href="/signin" prefetch={false} className="btn btn-primary btn-lg">Start your store<Icon name="arrow-right" size={18}/></Link>
  <Link href="/demo" prefetch={false} className="link-arrow">See the live demo<Icon name="arrow-right" size={18} className="arrow"/></Link>
 </div>;
}

export default function Home() {
  const questions = homeQuestions(paypalSalesConfigured());
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteNav />

      <main id="content" data-static-reading>
        {/* ------------------------------------------------------------ hero */}
        <section aria-labelledby="home-hero-heading" className="surface-daybreak on-dark overflow-hidden" data-home-hero>
          <div className="container-page grid items-center gap-12 pb-28 pt-12 sm:gap-14 sm:pt-16 lg:grid-cols-[1.04fr_1fr] lg:gap-12 lg:pb-32 lg:pt-20">
            <div className="">
              <p className="mb-5 text-base font-semibold text-white/85" data-home-pillar>
                Your store. Your Stripe. Your money.
              </p>
              <h1 id="home-hero-heading" className="t-display text-white">
                Sell your work.
                <br />
                Build your
                <br />
                <span className="serif nb-gradient-text pr-1 text-[1.08em] leading-[0.9]">business.</span>
              </h1>
              <p className="t-lead measure mt-7 text-white/80">
                From your first sale to everything you sell next: files, courses, memberships and paid sessions
                in one storefront. Payments go through your own Stripe account.
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
                <Link href="/signin" prefetch={false} className="btn btn-light btn-lg w-full min-[480px]:w-auto" data-home-primary>
                  Start your store
                  <Icon name="arrow-right" size={18} />
                </Link>
                {/* The demo stays available as a secondary link. */}
                <Link href="/demo" prefetch={false} className="link-arrow on-dark inline-flex min-h-11 items-center justify-center min-[480px]:justify-start">
                  See the live demo
                  <Icon name="arrow-right" size={18} />
                </Link>
              </div>
              {/*
                The three chips are gone with the rest of the clutter.

                They repeated the sentence directly above them — what we take
                from a sale is in that paragraph, the trial is in the line below —
                and three pills under a paragraph that already says the same
                thing is the house style of a page with nothing to show. The
                band under this screen states all three as measurements with
                a source, which is worth more than a pill.
              */}
              <p className="mt-4 text-sm text-white/80">
                {PLANS_ON_SALE ? `$${PRICE} a month. Free for ${TRIAL_DAYS} days.` : `Not on sale yet. $${PRICE} a month when it is.`}
              </p>
            </div>

            <div className="">
              <Suspense fallback={null}><HeroFlow /></Suspense>
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
        <Suspense fallback={null}>
        <section aria-label="What you can check before you sign up" className="surface-sand section-tight">
          {/*
            Four numbers, and nothing behind them.

            These were photographs with the figure laid over the top: a
            runner at dawn under "97-100 Google PageSpeed", a desk under
            "200 GB", a woman at a laptop under "2 clicks to cancel". Not
            one of them showed what its number was about — the runner was a
            pun on the word speed — and a picture that illustrates nothing
            makes the thing it sits behind harder to read, not easier.

            The number is the content here. It gets the page to itself.
          */}
          <ul className="container-page grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "gauge" as IconName,
                figure: "No account",
                title: "For your buyers",
                body: "They pay and receive what they bought. Nothing to sign up for, no password to keep.",
              },
              {
                icon: "lock" as IconName,
                figure: "Stripe",
                title: "Handles the card",
                body: "The payment happens on Stripe's own checkout. We never see a card number.",
              },
              {
                icon: "receipt" as IconName,
                figure: `${REFUND_DAYS} days`,
                title: "To change your mind",
                body: "Your first payment back in full on request. Canceling is two clicks in your studio, any time.",
              },
              {
                icon: "download" as IconName,
                figure: "200 GB",
                title: "Of downloads a month",
                body: "Files up to 5 GB each. Past it we write to you rather than cutting anything off.",
              },
            ].map((f) => (
              <li key={f.title} className="flex gap-3.5">
                <span className="icon-tile icon-tile-sm">
                  <Icon name={f.icon} size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[1.5rem] font-semibold leading-none tracking-[-0.03em] text-ink">
                    {f.figure}
                  </span>
                  <span className="mt-2 block text-[0.9375rem] font-semibold leading-snug text-ink-soft">{f.title}</span>
                  <span className="mt-1 block text-[0.875rem] leading-snug text-ink-mute">{f.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
        </Suspense>

        <HomeActions place="proof"/>

        {/*
          What people sell, running past.

          The one piece of this page that moves on its own, placed where a
          visitor has just read the offer and is asking whether it is for
          someone like them. Forty kinds of product answer that faster than
          a paragraph about categories, and a strip that never stops is what
          a market looks like.
        */}
        <Suspense fallback={null}>
        <section aria-label="Things people sell from a Marktmorgen store" className="surface-paper overflow-hidden py-5">
          <SoldMarquee />
        </section>
        </Suspense>

        {/* ------------------------------------------------------ who it's for */}
        <Suspense fallback={null}>
        <section className="surface-sand section">
          <div className="container-page">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <h2 className="t-h2 balance">People who sell what they know</h2>
              </div>
              <Link prefetch={false} href="/creators" className="link-arrow">
                Tell us what you sell
                <Icon name="arrow-right" size={16} className="arrow" />
              </Link>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CREATORS.map(creator=><li key={creator.href}><Link href={creator.href} prefetch={false} className="card flex h-full min-h-36 flex-col justify-between gap-4 p-6">
                <h3 className="text-lg font-semibold">{creator.label}</h3><p className="text-sm text-ink-soft">{creator.sells}</p><span className="link inline-flex min-h-11 items-center">Explore this kind of work<Icon name="arrow-right" size={16}/></span>
              </Link></li>)}
            </ul>
            <p className="mt-6 max-w-3xl text-sm text-ink-soft">These pages show fictional examples of work you can sell. They are not customer testimonials or evidence of earnings. <Link prefetch={false} href="/demo" className="link">Explore the live demo</Link>.</p>

          </div>
        </section>
        </Suspense>

        <HomeActions place="situations"/>

        {/* ------------------------------------------------ the buyer's path */}
        <Suspense fallback={null}><StudioScreens /></Suspense>
        <Suspense fallback={null}><BuyerPath /></Suspense>

        <Suspense fallback={null}>
        <section className="section" aria-labelledby="home-modules-heading">
          <div className="container-page">
            <h2 id="home-modules-heading" className="t-h2 balance">Everything in one place</h2>
            <p className="mt-5 max-w-3xl text-ink-soft">Choose the tools your work needs, with the limits and conditions shown before you commit. {PLANS_ON_SALE ? "The live demo shows the buyer experience." : "Paid selling remains closed; the live demo shows the buyer experience."}</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {HOME_MODULES.map(capability=><li key={capability.name} className="rounded-2xl border border-line bg-white p-6">
                <h3 className="text-xl font-semibold"><Link href={capability.href} prefetch={false} className="underline decoration-line underline-offset-4">{capability.name}</Link></h3>
                <p className="mt-3 text-ink-soft">{capability.body}</p>
              </li>)}
            </ul>
            <div className="mt-8 rounded-2xl bg-lilac p-6">
              <h3 className="text-xl font-semibold">Compare your current tools and their costs</h3>
              <p className="mt-3 text-ink-soft">Use published subscription prices, your sales volume and your applicable fee quotes. Unknown costs stay unconfirmed; the calculator makes no promise of earnings or identical features.</p>
              <Link href="/pricing#calculator-heading" prefetch={false} className="link mt-4 inline-block">Open the browser-only cost calculator</Link>
            </div>
          </div>
        </section>
        </Suspense>

        <HomeActions place="modules"/>

        <Suspense fallback={null}>
        <section aria-labelledby="home-path-heading" className="surface-sand section">
          <div className="container-page">
            <h2 id="home-path-heading" className="t-h2 balance">Your next step, checked against real facts</h2>
            <p className="mt-5 max-w-3xl text-ink-soft">The Path names the work to do and checks records your store already keeps. These are its first seven missions, not a promise of a sale in seven days. Paid selling remains subject to availability; reminders and sharing are opt-in.</p>
            <ol className="mt-10 grid gap-5 md:grid-cols-2">
              {PATH_HOME_STEPS.map(step=><li key={step.id} className="rounded-2xl border border-line bg-white p-6">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <dl className="mt-4 space-y-4"><div><dt className="font-semibold">What you do</dt><dd className="mt-1 text-ink-soft">{step.creator}</dd></div><div><dt className="font-semibold">What Marktmorgen checks</dt><dd className="mt-1 text-ink-soft">{step.platform}</dd></div></dl>
              </li>)}
            </ol>
            <Link href="/platform/path" prefetch={false} className="link mt-8 inline-block">Read how the Path works</Link>
          </div>
        </section>
        </Suspense>

        <HomeActions place="path"/>

        {/* ------------------------------------------------------ why Marktmorgen */}
        <Suspense fallback={null}>
        <section className="section">
          <div className="container-page">
            <div className="max-w-2xl">
              <h2 className="t-h2 balance">Built for the people who use it</h2>
            </div>

            <div className="mt-14 space-y-16 sm:mt-16 sm:space-y-20">
              {REASONS.map((r, i) => (
                <article key={r.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
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
                    <Link prefetch={false} href={r.href} className="link-arrow mt-6 text-[0.9375rem]">
                      {r.link}
                      <Icon name="arrow-right" size={16} className="arrow" />
                    </Link>
                  </div>
                  {/*
                    The drawing, on its own.

                    A photograph used to sit above this, tilted, with the
                    drawing overlapping its lower edge. The drawing is the
                    evidence — it is the screen this actually happens on —
                    and a stock photograph of a desk laid over evidence
                    does not strengthen it, it decorates it. Proof is shown,
                    not illustrated.

                    min-w-0 is not decoration. A grid item will not shrink
                    below the widest thing inside it unless you say so, and
                    these drawings are full of rows that would rather stay
                    wide, so without it the whole page grows a sideways
                    scrollbar on a phone.
                  */}
                  <div className={`flex min-w-0 justify-center ${i % 2 === 1 ? "lg:order-1 lg:justify-start" : "lg:justify-end"}`}>
                    <Suspense fallback={null}><FeatureVisual visual={r.visual} tone="light" /></Suspense>
                  </div>
                </article>
              ))}
            </div>

            {/*
              What we do not have, kept and made small.

              The feature inventory that used to sit here is on /platform,
              where it belongs and where the nav already points; repeating
              it added 5,500px to this page and said nothing the visitor
              could not reach in one click. This block is the part that
              could not move, because it is the argument: a page that lists
              only what works is worth nothing unless it also names what
              does not. One row, five names, no padding around them.
            */}
            <div className="mt-14 flex flex-col gap-4 rounded-[var(--r-lg)] bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(42,23,144,0.09)] sm:p-7 lg:flex-row lg:items-center lg:gap-8">
              <div className="lg:w-[17rem] lg:shrink-0">
                <span className="tag tag-next" style={{ color: "var(--ink)" }}>Not here yet</span>
                <p className="mt-3 text-[0.9375rem] text-ink-soft">
                  Currently unavailable. Each one is explained on the feature page.
                </p>
              </div>
              <ul className="flex flex-wrap gap-2.5">
                {NOT_YET.map((n) => (
                  <li
                    key={n}
                    className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[0.875rem] text-ink shadow-[inset_0_0_0_1px_rgba(42,23,144,0.09)]"
                  >
                    <Icon name="minus" size={14} className="shrink-0 text-ink-mute" />
                    {n}
                  </li>
                ))}
              </ul>
              <Link prefetch={false} href="/proof/everything" className="link-arrow shrink-0 text-[0.9375rem]">
                Feature by feature
                <Icon name="arrow-right" size={16} className="arrow" />
              </Link>
            </div>
          </div>
        </section>
        </Suspense>

        {/* -------------------------------------------------------- pricing */}
        <Suspense fallback={null}>
        <section id="pricing" className="surface-sand section scroll-mt-20">
          <div className="container-page">
            <TrustChecks place="home" />
            <div className="mt-12"><PricingValue place="home" /></div>
            <div className="mx-auto mt-10 max-w-2xl text-center">
              <h2 className="t-h2 balance">Three plans, with the monthly price and sales fee shown together.</h2>
              <p className="mt-5 text-ink-soft">
                {feeWords().costLine}
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-5xl" data-plan-prices>
              <Suspense fallback={null}>
                <Pricing domains={DOMAINS} />
              </Suspense>
              <p className="mt-6 text-center"><Link prefetch={false} href="/pricing" className="link">Compare all plan limits, annual prices and optional add-ons</Link></p>
            </div>
          </div>
        </section>
        </Suspense>

        <HomeActions place="plans"/>
        <Suspense fallback={null}><CreatorShowcase /></Suspense>
        <Suspense fallback={null}><PlatformProof /></Suspense>

        {/* ------------------------------------------------------------ faq */}
        <Suspense fallback={null}>
        <section id="faq" className="section scroll-mt-20">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <div className="">
              <h2 className="t-h2 balance">Questions</h2>
              <p className="mt-5 text-ink-soft">
                Something else?{" "}
                <Link prefetch={false} href="/help" className="link">
                  The help center
                </Link>{" "}
                answers the rest, in writing.
              </p>
            </div>
            <div className="">
              <Faq questions={questions} />
            </div>
          </div>
        </section>
        </Suspense>

        {/* ------------------------------------------------------ final CTA */}
        <Suspense fallback={null}>
        <section className="surface-signature on-dark overflow-hidden">
          <div className="container-narrow relative py-20 text-center sm:py-28">
            {/*
              The five example stores, one last time.

              A row of faces above a call to action is the oldest move
              there is, and it only works when it is true. These are the
              five stores drawn at the top of this page, the same people,
              said again in the caption to be examples we built.
            */}
            <ul className="mx-auto mb-8 flex items-center justify-center -space-x-3">
              {[
                "photo-1601397210737-a5534480bdc5",
                "photo-1613746203812-717e6e5db3da",
                "photo-1614244139209-53c071a4737d",
                "photo-1676742663664-2da16ddcad7a",
                "photo-1609174112693-52fdcebffd89",
              ].map((id) => (
                <li key={id}>
                  {/* A photograph served at the sizes asked for by its own host, never through the image optimizer, which is billed per image. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={PHOTO(id, 96, 96)}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white/80"
                  />
                </li>
              ))}
            </ul>
            <h2 className="t-h1 balance text-white">Open your store</h2>
            <p className="t-lead mx-auto mt-6 max-w-xl text-white/80">
              {PLANS_ON_SALE
                ? `Take your address, connect Stripe, list what you sell. Free for ${TRIAL_DAYS} days, then $${PRICE} a month.`
                : `Take your address, connect Stripe, list what you sell. The plan is not on sale yet: $${PRICE} a month when it is.`}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
              <Link prefetch={false} href="/signin" className="btn btn-light btn-lg">
                Start your store
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link prefetch={false} href="/demo" className="link-arrow on-dark">
                See the live demo
                <Icon name="arrow-right" size={18} className="arrow" />
              </Link>
            </div>
            <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[0.9375rem] text-white/80">
              {[
                { icon: "calendar" as IconName, text: PLANS_ON_SALE ? `${TRIAL_DAYS} days free` : "Free to set up" },
                /*
                  The strongest of the four, and the only one that costs us
                  anything to mean. It replaced "Cancel in two clicks", which
                  is a smaller promise made in the same breath — cancelling
                  stops the next charge, this gives back the one already
                  made — and cancelling is still written out in full in both
                  plan cards and in the Refund Policy.
                */
                { icon: "receipt" as IconName, text: `${REFUND_DAYS}-day money-back guarantee` },
                { icon: "percent" as IconName, text: feeWords().short },
                { icon: "lock" as IconName, text: "Payments by Stripe" },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-2">
                  <Icon name={f.icon} size={17} className="text-white/70" />
                  {f.text}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[0.8125rem] text-white/65">
              Example stores we built. The photographs are licensed stock, not customers of ours.
            </p>
          </div>
        </section>
        </Suspense>
      </main>

      <Suspense fallback={null}><SiteFooter /></Suspense>
      <HomeData questions={questions} />
    </div>
  );
}
