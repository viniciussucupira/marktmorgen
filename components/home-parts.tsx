"use client";

import { AI_MONTHLY } from "@/lib/ai-rules";
import { MAX_OPTIONS } from "@/lib/product-option";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/icons";
import { listSizeWords } from "@/lib/contact-rules";
import { HOME_QUESTIONS } from "@/lib/home-faq";
import { STORAGE_BRAKE_BYTES } from "@/lib/storage-rules";
import { uploadAllowanceWords } from "@/lib/upload-budget-policy";
import { PLANS_ON_SALE } from "@/lib/opening";
import { VIDEO_CENTS_PER_HOUR_OVER, VIDEO_HOURS_INCLUDED, centsWords } from "@/lib/watch-rules";
import { VISITS_INCLUDED, VISIT_CENTS_PER_THOUSAND_OVER } from "@/lib/traffic-rules";
import { ORDERS_INCLUDED, ORDER_CENTS_PER_THOUSAND_OVER } from "@/lib/order-rules";
import {
  COMMISSION_BPS,
  PUBLISHED_PLAN_PRICES as PLAN_PRICES,
  PLAN_TITLES,
  PRO_MONTHLY_EMAILS,
  REFUND_DAYS,
  TRIAL_DAYS,
  TRIAL_MONTHLY_EMAILS,
  type Tier,
  publishedYearSaving as yearSaving,
  SCALE_MONTHLY_EMAILS,
  TIERS,
} from "@/lib/plan";
import { feeWords } from "@/lib/fee-words";

/*
 * Reveals every element with .reveal as it scrolls into view, once.
 *
 * On a first load this has already been done by the script at the end of
 * the body in app/layout.tsx, which runs as soon as the HTML is parsed
 * rather than waiting for this bundle to hydrate. What that script cannot
 * cover is a client-side navigation, where no script in the document runs
 * again and the new page's sections arrive hidden. That is what this is
 * for, so it does exactly the same two things: show whatever is already on
 * screen, and observe the rest.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
    );
    const fold = window.innerHeight;
    nodes.forEach((n) => {
      if (n.classList.contains("is-in")) return;
      if (n.getBoundingClientRect().top < fold) n.classList.add("is-in");
      else io.observe(n);
    });
    return () => io.disconnect();
  }, []);
  return null;
}

/*
 * The hero: one store, changing. See HeroFlow for why it is one object
 * rather than the five it used to be.
 */

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/*
 * Five creators, cycling.
 *
 * The hero used to draw one store, and one store is a diagram. Five, each
 * with a face and a different thing for sale, is a market: the page is
 * for people who sell what they know, so the first thing on it should be
 * people. They change every five seconds, carrying their own colour, so
 * the first screen is never the same twice and never still.
 *
 * All five are stores we built as examples, and the line under the
 * picture says so. Nobody here is presented as a customer.
 */
const STORES = [
  {
    handle: "harborkitchen",
    name: "Harbor Kitchen",
    line: "Simple family meals by Jenny",
    photo: "photo-1573496359142-b8d87734a5a2",
    item: "Weekly meal planner",
    options: [
      { label: "1 week", price: "$27" },
      { label: "5 weeks", price: "$39" },
    ],
    // The one of the five that can be opened: the live demo store, with the
    // one link it really has (lib/demo-seed.ts).
    links: ["Open a store like this one"],
    tint: "#9a4a33",
  },
  {
    handle: "mornpractice",
    name: "Morning Practice",
    line: "Mobility and strength by Ada",
    photo: "photo-1494790108377-be9c29b29330",
    item: "30-day mobility plan",
    options: [
      { label: "The plan", price: "$34" },
      { label: "Plan + 2 calls", price: "$89" },
    ],
    links: ["Free hip routine", "Book a session"],
    tint: "#1f6b53",
  },
  {
    handle: "lightandgrain",
    name: "Light & Grain",
    line: "Film presets by Thea",
    photo: "photo-1573497019940-1c28c88b4f3e",
    item: "Golden hour pack",
    options: [
      { label: "12 presets", price: "$24" },
      { label: "Everything", price: "$59" },
    ],
    links: ["Before and after", "How I shoot"],
    tint: "#8a6a1f",
  },
  {
    handle: "thequietdesk",
    name: "The Quiet Desk",
    line: "Study systems by Maren",
    photo: "photo-1484863137850-59afcfe05386",
    item: "Focus course",
    options: [
      { label: "The course", price: "$49" },
      { label: "Course + templates", price: "$69" },
    ],
    links: ["Free first lesson", "Student results"],
    tint: "#4946a6",
  },
  {
    handle: "saltandsteel",
    name: "Salt & Steel",
    line: "Knife skills by Dina",
    photo: "photo-1580894732444-8ecded7900cd",
    item: "Sharpening masterclass",
    options: [
      { label: "Masterclass", price: "$39" },
      { label: "With the live Q&A", price: "$79" },
    ],
    links: ["Free knife guide", "Watch a clip"],
    tint: "#8d3352",
  },
] as const;

const FACE = (id: string, s = 96) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=faces&w=${s}&h=${s}&q=70`;

export function HeroFlow() {
  const [store, setStore] = useState(0);
  const [picked, setPicked] = useState(false);
  const reduce = useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );

  /*
   * One store at a time, changing every five seconds.
   *
   * This used to be a three-step animation of a whole sale — the store,
   * then Stripe's checkout, then the file delivered, then a bar showing
   * what the platform took, with buttons to step through it. Five
   * objects, and the section immediately below this one draws the same
   * sale properly in five steps. A first screen that explains the
   * mechanism is a first screen that has given up on being looked at.
   *
   * What is left is the thing being sold: a creator's store, real enough
   * to read, changing often enough that nobody sees the same one twice.
   *
   * Five seconds is long enough to read the name, the product and both
   * prices without hurrying. It stops entirely for anyone who has asked
   * motion to stop; they see the first store, which is the one the rest
   * of the page talks about.
   */
  useEffect(() => {
    if (reduce || picked) return;
    const t = setInterval(() => setStore((s) => (s + 1) % STORES.length), 5000);
    return () => clearInterval(t);
  }, [reduce, picked]);

  /*
   * Choosing a store stops the rotation for good. Somebody who has just
   * pressed a face wants to read that store, not watch it be replaced
   * four seconds later.
   */
  const pick = (i: number) => {
    setStore(i);
    setPicked(true);
  };

  const s = STORES[store];

  return (
    <div className="relative mx-auto w-full max-w-[32rem]">
      <div className="relative mx-auto w-[17rem] sm:w-[19rem]">
        {/*
          The light the phone sits in. One soft source behind it, the
          colour of the store currently on screen, so the whole
          composition changes temperature with the store rather than
          sitting on a fixed violet.
        */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -z-10 h-[115%] w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-[1200ms]"
          style={{ background: `radial-gradient(closest-side, ${s.tint}55, transparent)` }}
        />

        <div className="device">
          <div className="device-screen">
            <div className="flex items-center justify-between px-4 pb-1 pt-2.5 text-[10px] font-semibold text-ink-mute">
              <span>9:41</span>
              <span className="rounded-[5px] bg-white px-1.5 py-0.5 text-[9px] text-ink-soft ring-1 ring-line">
                {`marktmorgen.com/@${s.handle}`}
              </span>
            </div>
            {/*
              The key is the store's own, so React replaces the subtree
              rather than editing it and the fade runs again from the top.
            */}
            <div key={s.handle} className="nb-swap px-4 pb-5 pt-2">
              <div className="flex items-center gap-3">
                {/* A photograph served at the sizes asked for by its own host, never through the image optimizer, which is billed per image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={FACE(s.photo, 112)}
                  alt=""
                  width={44}
                  height={44}
                  fetchPriority="high"
                  className="h-11 w-11 rounded-full bg-sand-deep object-cover ring-2 ring-white"
                  style={{ boxShadow: `0 0 0 3px ${s.tint}33` }}
                />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold leading-tight text-ink">{s.name}</p>
                  <p className="truncate text-[11px] text-ink-mute">{s.line}</p>
                </div>
              </div>
              <div className="mt-3.5 rounded-[12px] border border-line bg-white p-3">
                <p className="text-[12px] font-semibold" style={{ color: s.tint }}>
                  {s.item}
                </p>
                <div className="mt-2.5 grid gap-1.5">
                  <div className="flex items-center justify-between rounded-[9px] border border-line px-3 py-2 text-[12px]">
                    <span className="text-ink-soft">{s.options[0].label}</span>
                    <span className="font-semibold text-ink">{s.options[0].price}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[9px] border border-violet-brand bg-lilac px-3 py-2 text-[12px]">
                    <span className="flex min-w-0 items-center gap-1.5 font-medium text-ink">
                      <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-violet-brand text-white">
                        <Icon name="check" size={9} strokeWidth={3} />
                      </span>
                      <span className="truncate">{s.options[1].label}</span>
                    </span>
                    <span className="font-semibold text-ink">{s.options[1].price}</span>
                  </div>
                </div>
                <div className="mt-3 rounded-[9px] bg-violet-brand py-2.5 text-center text-[12px] font-semibold text-white">
                  Continue with this option
                </div>
              </div>
              <div className="mt-2.5 grid gap-1.5">
                {s.links.map((l) => (
                  <p
                    key={l}
                    className="truncate rounded-[9px] border border-line bg-white px-3 py-2.5 text-[11.5px] font-medium text-ink-soft"
                  >
                    {l}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/*
          The other four stores, and a way to reach them.

          They used to be decoration: four portraits that drifted while
          the phone changed on its own every five seconds, which meant
          four of the five stores were invisible at any moment and nobody
          could go and look at one. A thing that plays at you is worse
          than a thing you can use.

          They are buttons now. Pressing one shows that store and stops
          the rotation, because somebody who has chosen should not have
          their choice taken away four seconds later.

          Only from 1024px up: below that the phone has the column to
          itself, and the row under it does this job instead.
        */}
        <div className="pointer-events-none absolute inset-y-0 -left-24 hidden w-24 lg:block">
          {STORES.map((o, i) => {
            const slot = ((i - store + STORES.length) % STORES.length) - 1;
            const spot = [
              { top: "6%", left: "8%", size: 58 },
              { top: "30%", left: "34%", size: 44 },
              { top: "54%", left: "4%", size: 50 },
              { top: "76%", left: "30%", size: 38 },
            ][slot];
            if (!spot) return null;
            const next = slot === 0;
            return (
              <button
                key={o.handle}
                type="button"
                onClick={() => pick(i)}
                title={`${o.name} — ${o.line}`}
                className="pointer-events-auto absolute block rounded-full transition-all duration-700 [transition-timing-function:var(--ease)] hover:scale-110 focus-visible:scale-110"
                style={{
                  top: spot.top,
                  left: spot.left,
                  width: spot.size,
                  height: spot.size,
                  opacity: next ? 1 : 0.55,
                  transform: next ? "scale(1.16) translateY(-6px)" : undefined,
                  boxShadow: `0 0 0 2px rgba(255,255,255,${next ? 0.9 : 0.35}), 0 12px 28px -8px ${o.tint}aa`,
                }}
              >
                <span className="sr-only">{`Show ${o.name}`}</span>
                {/* A photograph served at the sizes asked for by its own host, never through the image optimizer, which is billed per image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={FACE(o.photo, 128)}
                  alt=""
                  width={spot.size}
                  height={spot.size}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full rounded-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/*
        The same five, as a row, for every width where the portraits
        beside the phone do not fit. Five dots is not a decoration here:
        it is the only way a visitor on a phone can see that there is
        more than one store and go to the one that looks like theirs.
      */}
      <ul className="mt-6 flex items-center justify-center gap-2.5 lg:hidden">
        {STORES.map((o, i) => (
          <li key={o.handle}>
            <button
              type="button"
              onClick={() => pick(i)}
              aria-current={i === store}
              className="grid h-11 w-11 place-items-center rounded-full"
            >
              <span className="sr-only">{`Show ${o.name}`}</span>
              <span
                aria-hidden="true"
                className="block rounded-full transition-all duration-500"
                style={{
                  width: i === store ? 11 : 7,
                  height: i === store ? 11 : 7,
                  background: i === store ? o.tint : "rgba(255,255,255,0.4)",
                }}
              />
            </button>
          </li>
        ))}
      </ul>

      {/*
        One line, said once. What the picture is, and that the people in
        it are not customers of ours.
      */}
      <p className="mt-7 text-center text-[0.8125rem] leading-relaxed text-white/65">
        Five example stores we built. The photographs are licensed stock, not customers of ours. The{" "}
        <Link href="/demo" className="font-medium text-white/85 underline underline-offset-4 decoration-white/30 hover:decoration-white">
          demo store
        </Link>{" "}
        is the one you can buy from, with a test card.
      </p>
    </div>
  );
}

/*
 * Two plans, and every line under them is something you can open and try
 * today. A price with a feature beside it is a promise; a promise we cannot
 * keep is worse than a shorter list. Each yearly price is the same plan paid
 * once a year, and the studio opens either.
 */
const INCLUDED = [
  "Your own store address, live the moment you take it",
  `${VISITS_INCLUDED.creator.toLocaleString("en-US")} visits to your store a month covered; past that, ${centsWords(VISIT_CENTS_PER_THOUSAND_OVER)} for each thousand, and your store is never taken down for being busy`,
  `${ORDERS_INCLUDED.creator.toLocaleString("en-US")} orders a month covered${feeWords().ordersShared ? " (an order whose sale paid your plan's share is not counted)" : ""}; past that, ${centsWords(ORDER_CENTS_PER_THOUSAND_OVER)} for each thousand, and a buyer is never turned away`,
  "Buyers pay into your own Stripe account",
  "Up to 2,000 products: files, courses, memberships, paid calls and live sessions",
  "Sales pages and landing pages built from blocks, and reviews only buyers can write",
  "A community for your buyers, with spaces, posts, comments, moderation and live events members RSVP to",
  `Up to ${MAX_OPTIONS} prices on any product, bundles of 2 to 20 products, pay what you want, discount codes and payment plans`,
  "15 currencies, and Apple Pay, Google Pay, Klarna and the other ways to pay you switch on in Stripe",
  "Offers before and after paying: a box at checkout, and up to five one-click offers after",
  "An affiliate program with a page for each affiliate, paid from your own PayPal in one press or on payday by itself",
  "Your own numbers counted without cookies, as CSV files too, and ad pixels for Meta, Google, TikTok and Pinterest — those are the platforms' own, and visitors are asked first where the law requires it",
  "License keys, stamped PDFs, course quizzes and certificates",
  `Lesson videos that play in the size each connection can carry, with ${VIDEO_HOURS_INCLUDED} hours watched a month covered; past that, ${centsWords(VIDEO_CENTS_PER_HOUR_OVER)} for each hour watched, and a student is never cut off`,
  "A private video room for each booking if you want one, and calendar sync for your calls",
  "Mailchimp, Kit, beehiiv or MailerLite built in, and webhooks for Zapier or Make",
  "A team of you plus up to five people per store, each with a role, and notifications of sales on your phone",
  "Sign-in without passwords, and a full refund that closes access by itself",
  "Free products that build an email list you can download at any time",
  "Your list, products and past buyers brought over from another platform, from a spreadsheet",
  `Writing help with AI, from your own words and in your store's language: product descriptions, whole sales pages and course outlines, a second opinion on a page, any block rewritten, a page translated, picture descriptions, the line about your store, blog posts, replies to reviews and posts to share — ${AI_MONTHLY.creator} a month (${AI_MONTHLY.trial} during the free trial)`,
];

const PRO_INCLUDED = [
  `Everything in ${PLAN_TITLES.creator}`,
  `${VISITS_INCLUDED.pro.toLocaleString("en-US")} visits to your store a month covered, instead of ${VISITS_INCLUDED.creator.toLocaleString("en-US")}`,
  `${ORDERS_INCLUDED.pro.toLocaleString("en-US")} orders a month covered, instead of ${ORDERS_INCLUDED.creator.toLocaleString("en-US")}`,
  "One-off emails to your list, now or at a time you choose, to everyone or to the people who have not bought a particular thing yet",
  "Sequences that go out by themselves after someone joins or buys",
  `Up to ${PRO_MONTHLY_EMAILS.toLocaleString("en-US")} emails a month (${TRIAL_MONTHLY_EMAILS.toLocaleString("en-US")} during the free trial), from your name, with replies coming to you`,
  "One-click unsubscribe in every email, honored for good",
  "Community announcements emailed to the members who asked for them, counted in the same monthly allowance",
  "One email that asks each buyer for a review, 3 to 30 days after buying",
  `The same writing help with AI, raised from ${AI_MONTHLY.creator} to ${AI_MONTHLY.pro} a month, and emails among the things it drafts`,
  "Our name off the foot of your page, so it carries yours and nothing of ours",
];

/*
 * What each plan is, in the few things a creator is actually deciding
 * between.
 *
 * The itemised lists above are still here, whole, one press away: somebody
 * checking whether their own case is covered needs that detail and nothing
 * is kept from them. But eighteen technical lines are not how anybody
 * chooses a plan, and leading with them turned a decision into homework.
 * The open layer answers one question — which of these two is my business —
 * and the answer has three parts.
 */
type PlanGroup = { icon: Parameters<typeof Icon>[0]["name"]; title: string; body: string };

const CREATOR_GROUPS: PlanGroup[] = [
  {
    icon: "store",
    title: "Sell whatever it is you make",
    body: "Files, courses, memberships, paid calls and live sessions, on pages you build from blocks — up to 2,000 of them in one store.",
  },
  {
    icon: "bank",
    title: "Your own payment account",
    body: `Buyers pay into your own Stripe account, in 15 currencies. ${feeWords().takes}`,
  },
  {
    icon: "users",
    title: "Sell to the same people again",
    body: "Bundles, discount codes, payment plans, an offer at checkout and up to five after it, an affiliate program, and a community your buyers join.",
  },
];

function proGroups(domains: boolean): PlanGroup[] {
  return [
    {
      icon: "check",
      title: `Everything in ${PLAN_TITLES.creator}`,
      body: "Every line of the plan beside this one, unchanged. Studio adds to it; it replaces nothing.",
    },
    {
      icon: "mail",
      title: "Write to your own list from here",
      body: `A list of up to ${listSizeWords()} people, and the price does not move as it fills. One-off emails and sequences that send themselves after someone joins or buys, up to ${PRO_MONTHLY_EMAILS.toLocaleString("en-US")} sends a month, from your name, with replies coming to you.`,
    },
    domains
      ? {
          icon: "globe",
          title: "Your name on it, and only yours",
          body: "Your store on your own domain, with the certificate made for you, and our name off the foot of the page.",
        }
      : {
          icon: "eye",
          title: "Your name on it, and only yours",
          body: "Our name comes off the foot of your page, so what a buyer reads at the bottom of it is yours.",
        },
  ];
}

/*
 * A yearly price said as a monthly one, for comparing with the monthly plan.
 * It is never the number on the card — the card shows what is actually
 * charged, once a year — only the line underneath that does the division so
 * nobody has to.
 */
function monthlyEquivalent(yearCents: number): string {
  const perMonth = yearCents / 12 / 100;
  return Number.isInteger(perMonth) ? String(perMonth) : perMonth.toFixed(2);
}

/*
 * The six things somebody is agreeing to, where they can be read.
 *
 * They were all on the page before, and all of them were in the wrong place
 * to be read: three sentences of grey small print under the button, and a
 * band of three columns below both cards. Terms worth trusting are worth
 * laying out — one label, one answer, per line, inside the card they belong
 * to, so nobody has to reconstruct the deal from prose.
 */
function PlanTerms({ tier, yearly }: { tier: Tier; yearly: boolean }) {
  const { month, year } = PLAN_PRICES[tier];
  const charged = yearly ? year / 100 : month / 100;
  const rows: [string, string][] = [
    // Not open yet (lib/opening.ts): said first, in the card it is about.
    ...(PLANS_ON_SALE ? [] : [["On sale", "Not yet. Marktmorgen is still being built, and these are the terms this plan opens with."] as [string, string]]),
    ["Free trial", `${TRIAL_DAYS} days. Your card is taken when it starts, so you can sell before you decide.`],
    [
      "First charge",
      `$${charged} ${yearly ? "for the year" : "for the month"}, on the day the trial ends. We email you a week before.`,
    ],
    [
      "Money back",
      `Ask within ${REFUND_DAYS} days of your first payment and it comes back in full, for any reason or none. A yearly plan is refunded for the months you have not started, at any time, less Stripe's card fee.`,
    ],
    ["Cancelling", "Two clicks in your studio, any time. Inside the trial, the card is never charged."],
    ["Fees", `${COMMISSION_BPS[tier] / 100}% of each sale. Stripe charges its own processing fee separately.`],
  ];
  return (
    <dl className="mt-6 divide-y divide-line border-t border-line text-[0.8125rem] leading-relaxed">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-x-4 py-2.5 sm:grid-cols-[6.5rem_1fr]">
          <dt className="font-semibold text-ink">{label}</dt>
          <dd className="text-ink-mute">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PlanCard({
  tier,
  bestFor,
  groups,
  perks,
  featured,
  cta,
  yearly,
}: {
  tier: Tier;
  bestFor: string;
  groups: PlanGroup[];
  perks: string[];
  featured: boolean;
  cta: string;
  yearly: boolean;
}) {
  const { month, year } = PLAN_PRICES[tier];
  const saving = yearSaving(tier) / 100;
  return (
    <div
      className={`relative flex flex-col p-7 sm:p-9 ${
        featured
          ? "card border-violet-brand/35 shadow-[var(--shadow-md)] ring-1 ring-violet-brand/15"
          : "card-flat"
      }`}
    >
      {/*
        The recommended plan is marked once, in words that say why, and
        nothing else on this block tries to hurry anybody: no countdown, no
        "only today", no crossed-out price that was never charged.
      */}
      {featured ? (
        <span className="absolute -top-3 left-7 rounded-full bg-violet-brand px-3 py-1 text-[0.75rem] font-semibold text-white shadow-[var(--shadow-sm)] sm:left-9">
          Where to start
        </span>
      ) : null}

      {/*
        The title says what the plan is; the line under it says whose
        business it suits, which is the only thing somebody holding two
        cards up against each other is trying to find out.
      */}
      <p className="t-h3">{PLAN_TITLES[tier]}</p>
      <p className="measure mt-2 text-[0.9375rem] text-ink-soft">{bestFor}</p>

      <p className="mt-7 flex items-baseline gap-2">
        <span className="text-[3.5rem] font-semibold leading-none tracking-[-0.05em] text-ink tabular-nums">
          ${yearly ? year / 100 : month / 100}
        </span>
        <span className="text-ink-mute">{yearly ? "a year" : "a month"}</span>
      </p>
      <p className="mt-2 font-semibold text-violet-deep">{`${COMMISSION_BPS[tier] / 100}% of sales`}</p>
      <p className="mt-2 min-h-[1.5rem] text-[0.9375rem] text-ink-soft">
        {yearly
          ? `One payment of $${year / 100}, once a year — $${monthlyEquivalent(year)} a month, $${saving} less than paying monthly.`
          : `Billed every month. Or $${year / 100} once a year, which is $${saving} less.`}
      </p>

      {/*
        Three groups open, the whole list one press away.

        Eighteen ticks in a column made the two cards 4,156px of page
        between them, and a list that long is not read — it is scrolled
        past. Worse, a list sorted by nothing hands the sorting to the
        reader. These three say what the plan is for; the itemized version
        is still here, whole, for anybody checking one particular case.
      */}
      <ul className="mt-7 space-y-5">
        {groups.map((group) => (
          <li key={group.title} className="flex gap-3.5">
            <span className="icon-tile icon-tile-sm" aria-hidden="true">
              <Icon name={group.icon} size={17} strokeWidth={1.9} />
            </span>
            <span>
              <strong className="block font-semibold text-ink">{group.title}</strong>
              <span className="mt-1 block text-[0.9375rem] text-ink-soft">{group.body}</span>
            </span>
          </li>
        ))}
      </ul>
      <details className="group/perks mt-6">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-[8px] text-sm font-semibold text-violet-deep [&::-webkit-details-marker]:hidden">
          <Icon name="plus" size={15} className="transition-transform duration-200 group-open/perks:rotate-45" />
          <span className="group-open/perks:hidden">{`All ${perks.length} of them, itemized`}</span>
          <span className="hidden group-open/perks:inline">Close the list</span>
        </summary>
        <ul className="mt-4 space-y-3">
          {perks.map((perk) => (
            <li key={perk} className="flex gap-3 text-[0.9375rem] text-ink-soft">
              <Icon name="check" size={17} strokeWidth={2.2} className="mt-1 shrink-0 text-mint-brand" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </details>

      <p className="mt-5 text-sm text-ink-soft">{uploadAllowanceWords(tier)}</p>

      <div className="mt-auto pt-8">
        {/*
          The plan and the rhythm travel with the press.

          Both buttons used to go to a bare /signin, so somebody who had just
          read the Pro column and switched the whole page to yearly arrived at
          a page that showed no sign of either. Nothing is charged from here —
          the plan is chosen in the studio, after the store exists — but the
          choice is carried in the address so the next page can say it back,
          and so a creator never has to wonder whether it was heard.
        */}
        <Link
          href={`/signin?plan=${tier}&billing=${yearly ? "year" : "month"}`}
          className={`btn ${featured ? "btn-primary" : "btn-secondary"} btn-lg btn-block`}
        >
          {cta}
        </Link>
        <PlanTerms tier={tier} yearly={yearly} />
        {/* Named here the way the receipt will name it. */}
        <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-mute">
          Pressing this sends a login link to your email. Paid plans are not on sale yet.
        </p>
      </div>
    </div>
  );
}

export function Pricing({ domains = false }: { domains?: boolean }) {
  const [yearly, setYearly] = useState(false);
  const proPerks = domains
    ? [...PRO_INCLUDED.slice(0, 1), "Your store on your own domain, with its certificate handled for you", ...PRO_INCLUDED.slice(1)]
    : PRO_INCLUDED;
  return (
    <div>
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="seg" role="group" aria-label="How often you pay">
          <button type="button" className="seg-item" aria-pressed={!yearly} onClick={() => setYearly(false)}>
            Monthly
          </button>
          <button type="button" className="seg-item" aria-pressed={yearly} onClick={() => setYearly(true)}>
            Yearly
            {/* What each plan saves is written inside that plan's own card,
                beside its own price. Here it is one number, the largest, so
                the switch says what it is for without doing the arithmetic of
                two plans at once in six words. */}
            <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[0.75rem] font-semibold text-mint-deep">
              {`save up to $${Math.max(...TIERS.map(yearSaving)) / 100}`}
            </span>
          </button>
        </div>
        <p className="text-sm text-ink-mute">Every plan either way, and you can switch from your studio whenever you like.</p>
      </div>
      {/*
        Two cards of the same build.

        A cheaper plan drawn smaller, or with its terms left out, is a way of
        telling somebody they picked wrong. Both of these carry the same
        title, the same three groups, the same itemized list and the same
        four lines of terms, so the only difference a reader finds between
        them is the actual difference between them.
      */}
      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        <PlanCard
          tier="creator"
          bestFor={"For selling what you make to the audience you already reach — wherever you reach them now."}
          groups={CREATOR_GROUPS}
          perks={INCLUDED}
          featured
          cta="Start on Store"
          yearly={yearly}
        />
        <PlanCard
          tier="pro"
          bestFor={"For selling and writing to your own list from the same place, so a buyer hears from you again."}
          groups={proGroups(domains)}
          perks={proPerks}
          featured={false}
          cta="Start on Studio"
          yearly={yearly}
        />
        <PlanCard
          tier="scale"
          bestFor="For an established business with a larger list and no percentage fee on sales."
          groups={[
            { icon: "check", title: "Everything in Studio", body: "The same selling tools and email features, with larger allowances." },
            { icon: "mail", title: "More room to grow", body: `Up to ${SCALE_MONTHLY_EMAILS.toLocaleString("en-US")} emails, ${VISITS_INCLUDED.scale.toLocaleString("en-US")} visits and ${ORDERS_INCLUDED.scale.toLocaleString("en-US")} orders a month.` },
            { icon: "percent", title: "0% platform fee on sales", body: "Stripe charges its own processing fees separately." },
          ]}
          perks={[`Everything in ${PLAN_TITLES.pro}`, `${SCALE_MONTHLY_EMAILS.toLocaleString("en-US")} emails a month`, `${VISITS_INCLUDED.scale.toLocaleString("en-US")} visits a month`, `${ORDERS_INCLUDED.scale.toLocaleString("en-US")} orders a month`, `${AI_MONTHLY.scale.toLocaleString("en-US")} AI drafts a month`]}
          featured={false}
          cta="Start on Scale"
          yearly={yearly}
        />
      </div>
      {/*
        What is true of every plan, and belongs to neither card: the two
        edges of the trial, and the limit we publish rather than bury.
      */}
      <div className="card-flat mt-6 grid gap-4 p-6 text-sm sm:grid-cols-3 sm:p-7">
        <p className="flex gap-2 text-ink-soft">
          <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-violet-deep" />
          <span>
            <strong className="font-semibold text-ink">One trial per account.</strong>
            {` The free ${TRIAL_DAYS} days are for your first store; a second store is paid from its first day.`}
          </span>
        </p>
        <p className="flex gap-2 text-ink-soft">
          <Icon name="refresh" size={18} className="mt-0.5 shrink-0 text-violet-deep" />
          <span>
            <strong className="font-semibold text-ink">Move between the plans.</strong> From your studio, whenever you like,
            either direction. Nothing you have made is lost in the move.
          </span>
        </p>
        <p className="flex gap-2 text-ink-soft">
          <Icon name="download" size={18} className="mt-0.5 shrink-0 text-violet-deep" />
          <span>
            <strong className="font-semibold text-ink">Up to {STORAGE_BRAKE_BYTES / (1024 ** 3)} GB of stored files and videos.</strong> Uploads pause when there is no room left.
          </span>
        </p>
      </div>
    </div>
  );
}

export function Faq({ questions = HOME_QUESTIONS }: { questions?: typeof HOME_QUESTIONS } = {}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-line border-y border-line">
      {questions.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q}>
            <h3>
              <button
                type="button"
                id={`faq-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen((cur) => (cur === i ? null : i))}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-[1.0625rem] font-semibold text-ink transition-colors hover:text-violet-deep sm:text-lg"
              >
                {item.q}
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-transform duration-300 ${
                    isOpen ? "rotate-45 border-violet-brand text-violet-deep" : ""
                  }`}
                >
                  <Icon name="plus" size={16} />
                </span>
              </button>
            </h3>
            <div
              id={`faq-a-${i}`}
              role="region"
              aria-labelledby={`faq-q-${i}`}
              hidden={!isOpen}
              className="pb-6 pr-12"
            >
              <p className="text-ink-soft">{item.a}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/*
 * What people sell, running past.
 *
 * Every other thing on this page is still until somebody scrolls to it.
 * This one moves on its own, continuously, because a market does — and
 * because the fastest way to answer "is this for someone like me?" is to
 * show forty things people like them sell rather than describe a
 * category.
 *
 * Each item is a real kind of product the platform delivers today: a
 * file, a course, a membership, a booked call, a bundle. Nothing here is
 * a customer, a number or a claim — it is a list of what the thing does,
 * which is why it can run without a caveat under it.
 */
/*
 * Every item carries its own photograph.
 *
 * Stan's strip is type on a tile. Theirs works; a photograph of the thing
 * works harder, because "Sourdough courses" is a category and a loaf is a
 * reason. Each id below was looked up and confirmed to resolve, and each
 * is cropped square on faces so a person in the frame is never beheaded.
 *
 * The tint is the chip's own, drawn from the five lights of the page, so
 * the strip carries the whole palette past in one pass instead of
 * repeating one accent twenty-four times.
 */
const SOLD: { label: string; photo: string }[] = [
  { label: "Meal plans", photo: "photo-1528712306091-ed0763094c98" },
  { label: "Recipe packs", photo: "photo-1556911220-e15b29be8c8f" },
  { label: "Sourdough courses", photo: "photo-1653233797467-1a528819fd4f" },
  { label: "Knife skills", photo: "photo-1518737003272-dac7c4760d5e" },
  { label: "Bread workshops", photo: "photo-1556911073-a517e752729c" },
  { label: "Batch cooking guides", photo: "photo-1636647511729-6703539ba71f" },
  { label: "Family dinner plans", photo: "photo-1606787503066-794bb59c64bc" },
  { label: "Pastry classes", photo: "photo-1556910103-1c02745aae4d" },
  { label: "Fermentation courses", photo: "photo-1592837613828-4b65deb44f15" },
  { label: "Yoga programs", photo: "photo-1676496962536-d8ef110ff6f0" },
  { label: "Mobility programs", photo: "photo-1626444232874-e72c020eeb0e" },
  { label: "Stretch routines", photo: "photo-1761971975962-9cc397e2ba2a" },
  { label: "Posture clinics", photo: "photo-1763403921315-f2ef8697199f" },
  { label: "Breathwork sessions", photo: "photo-1761971975651-4fdd4abc200f" },
  { label: "Strength plans", photo: "photo-1761971975973-cbb3e59263de" },
  { label: "Running plans", photo: "photo-1666478042293-17ea55f33b52" },
  { label: "Watercolor classes", photo: "photo-1613574714687-c33b9e90200d" },
  { label: "Brush packs", photo: "photo-1740710543611-80b658171bc3" },
  { label: "Pottery classes", photo: "photo-1649479435119-1d987ed1ae36" },
  { label: "Still life classes", photo: "photo-1655175468016-a38acfa1277b" },
  { label: "Lettering classes", photo: "photo-1613463251864-2a2bc3952817" },
  { label: "Sketchbook courses", photo: "photo-1613463639651-4aca3f3dd83e" },
  { label: "Life drawing sessions", photo: "photo-1601397210737-a5534480bdc5" },
  { label: "Lightroom presets", photo: "photo-1562577309-d67db487e6cd" },
  { label: "Font bundles", photo: "photo-1620545628446-6319bce6b95c" },
  { label: "Color theory classes", photo: "photo-1621111848501-8d3634f82336" },
  { label: "Brand kits", photo: "photo-1561070791-2526d30994b5" },
  { label: "Portfolio critiques", photo: "photo-1637270873552-80d3bb9569dd" },
  { label: "Design templates", photo: "photo-1613579917953-d35e6b72d32b" },
  { label: "Lesson plans", photo: "photo-1588873281272-14886ba1f737" },
  { label: "Study guides", photo: "photo-1619852182277-79aa23f82c8e" },
  { label: "1:1 coaching calls", photo: "photo-1616587226960-4a03badbe8bf" },
  { label: "Interview prep", photo: "photo-1673515335586-f9f662c01482" },
  { label: "Resume reviews", photo: "photo-1616587896649-79b16d8b173d" },
  { label: "Knitting patterns", photo: "photo-1544928147-79a2dbc1f389" },
  { label: "Sewing patterns", photo: "photo-1506806732259-39c2d0268443" },
  { label: "Woodworking plans", photo: "photo-1516783154360-123b392d0833" },
  { label: "Jewelry classes", photo: "photo-1522065893269-6fd20f6d7438" },
  { label: "Weaving courses", photo: "photo-1618574760337-2750f6251d20" },
  { label: "Bookbinding workshops", photo: "photo-1757085242652-f8cd4d3de889" },
];

/*
 * The five store colours, muted to sit with the palette. A creator
 * choosing their own colour is a real feature of the product, so these
 * stay distinguishable; they no longer shout over the page they are on.
 */
const TINTS = ["#9a4a33", "#1f6b53", "#8a6a1f", "#4946a6", "#8d3352"];

export function SoldMarquee() {
  /*
   * Typographic, not photographic.
   *
   * This ran forty stock thumbnails — a loaf, a yoga mat, a sampler pad.
   * Stock photography is the ceiling on how considered a page can look,
   * because it is the one thing every templated site has; the best in
   * this category either commission portraits of named customers or draw
   * their own product, and neither is a thumbnail of somebody else's
   * bread.
   *
   * The names are the content. Set in one line, moving, they say what
   * forty pictures said and say it faster.
   */
  return (
    <div className="marquee" aria-hidden="true">
      <ul className="marquee-track items-center">
        {SOLD.map((item, i) => (
          <li key={item.label} className="flex shrink-0 items-center gap-[var(--gap-sm)]">
            <span className="whitespace-nowrap text-[1.0625rem] text-ink-soft">{item.label}</span>
            {i < SOLD.length - 1 ? (
              <span
                aria-hidden="true"
                className="h-1 w-1 shrink-0 rounded-full"
                style={{ background: TINTS[i % TINTS.length] }}
              />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
