"use client";

import { AI_MONTHLY } from "@/lib/ai-rules";
import { ANSWERS_MONTHLY } from "@/lib/answers-rules";
import { MAX_OPTIONS } from "@/lib/product-option";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/icons";
import { listSizeWords } from "@/lib/contact-rules";
import { PAID_STORAGE_BYTES } from "@/lib/storage-rules";
import { DATA_ROOM_BYTES, dataWords } from "@/lib/store-data-rules";
import { uploadAllowanceWords } from "@/lib/upload-budget-policy";
import { PLANS_ON_SALE } from "@/lib/opening";
import { paidVideoWords } from "@/lib/video-admission-rules";
import { VISITS_INCLUDED, publicVisitLimit } from "@/lib/traffic-rules";
import { ORDERS_INCLUDED } from "@/lib/order-rules";
import { allowanceListWords } from "@/lib/store-allowance-rules";
import {
  COMMISSION_BPS,
  COMMISSION_PLANS_PUBLISHED,
  PUBLISHED_PLAN_PRICES as PLAN_PRICES,
  monthlyEmails,
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
import { pricingPerksMarkup } from "@/lib/pricing-perks-markup";

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
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduce = useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );

  useEffect(() => {
    const node = root.current;
    if (!node || !("IntersectionObserver" in window)) return;
    let inView = false;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(node);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

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
    if (reduce || picked || !visible) return;
    const t = setInterval(() => setStore((s) => (s + 1) % STORES.length), 5000);
    return () => clearInterval(t);
  }, [reduce, picked, visible]);

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
    <div ref={root} className="relative mx-auto w-full max-w-[32rem]">
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
                <p className="text-[12px] font-semibold text-ink">
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
        <Link prefetch={false} href="/demo" className="font-medium text-white/85 underline underline-offset-4 decoration-white/30 hover:decoration-white">
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
// Reuse formatters and immutable plan figures across hydration and cycle changes.
const PLAN_NUMBER_FORMAT = new Intl.NumberFormat("en-US");
const PLAN_PRICE_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INCLUDED = [
  "Your own store address, live the moment you take it",
  `${PLAN_NUMBER_FORMAT.format(VISITS_INCLUDED.creator)} counted visits to your store a billing month; public pages pause at ${PLAN_NUMBER_FORMAT.format(publicVisitLimit(VISITS_INCLUDED.creator))}, and the rest are kept for your buyers' courses, community and podcasts; nothing is billed past it`,
  `${PLAN_NUMBER_FORMAT.format(ORDERS_INCLUDED.creator)} orders a billing month${feeWords().ordersShared ? " (an order whose sale paid your plan's share is not counted)" : ""}; at that figure new orders pause until your next billing month, nothing is billed past it, and a buyer already paying always finishes`,
  `Each billing month, starting on the day your plan renews: ${allowanceListWords("creator")}; past one, that use waits for the next month or a larger plan, and nothing is billed`,
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
  `Lesson videos: ${paidVideoWords()} each month; new playback pauses at the threshold`,
  "A private video room for each booking if you want one, and calendar sync for your calls",
  "Mailchimp, Kit, beehiiv or MailerLite built in, and webhooks for Zapier or Make",
  "A team of you plus up to five people per store, each with a role, and notifications of sales on your phone",
  "Sign-in without passwords, and a full refund that closes access by itself",
  "Free products that build an email list you can download at any time",
  "Your list, products and past buyers brought over from another platform, from a spreadsheet",
];

const PRO_INCLUDED = [
  `Everything in ${PLAN_TITLES.creator}`,
  `${PLAN_NUMBER_FORMAT.format(VISITS_INCLUDED.pro)} visits to your store a month covered, instead of ${PLAN_NUMBER_FORMAT.format(VISITS_INCLUDED.creator)}`,
  `${PLAN_NUMBER_FORMAT.format(ORDERS_INCLUDED.pro)} orders a month covered, instead of ${PLAN_NUMBER_FORMAT.format(ORDERS_INCLUDED.creator)}`,
  `Each billing month: ${allowanceListWords("pro")}`,
  "One-off emails to your list, now or at a time you choose, to everyone or to the people who have not bought a particular thing yet",
  "Sequences that go out by themselves after someone joins or buys",
  `Up to ${PLAN_NUMBER_FORMAT.format(PRO_MONTHLY_EMAILS)} emails a month (${PLAN_NUMBER_FORMAT.format(TRIAL_MONTHLY_EMAILS)} during the free trial), from your name, with replies coming to you`,
  "One-click unsubscribe in every email, honored for good",
  "Community announcements emailed to the members who asked for them, counted in the same monthly allowance",
  "One email that asks each buyer for a review, 3 to 30 days after buying",
  `Writing help with AI, from your own words and in your store's language: product descriptions, whole sales pages and course outlines, a second opinion on a page, any block rewritten, a page translated, picture descriptions, the line about your store, blog posts, emails, replies to reviews and posts to share — ${AI_MONTHLY.pro} writing jobs and ${PLAN_NUMBER_FORMAT.format(ANSWERS_MONTHLY.pro)} answers to visitors' questions a month, each request setting aside the most it could cost from the plan's monthly AI budget first; not during the free trial`,
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
      body: `A list of up to ${listSizeWords()} people, and the price does not move as it fills. One-off emails and sequences that send themselves after someone joins or buys, up to ${PLAN_NUMBER_FORMAT.format(PRO_MONTHLY_EMAILS)} sends a month, from your name, with replies coming to you.`,
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
/** The share of each sale a plan's card shows: none since 18 October 2026, when the offer with a share stopped being published (lib/plan.ts). */
function shareShown(tier: Tier): number {
  return COMMISSION_PLANS_PUBLISHED ? COMMISSION_BPS[tier] : 0;
}

/** "$4,490". */
function usdWhole(cents: number): string {
  return `$${PLAN_PRICE_FORMAT.format(cents / 100)}`;
}

/**
 * The figures a buyer holds up against another tool's card, from the
 * constants the product enforces (docs/value-presentation-2026-10-18.md):
 * the leaders print contacts, emails a month, products and AI on the card
 * itself, so these are printed under the price rather than only in the list.
 */
function planFigures(tier: Tier): string[] {
  const n = (x: number) => PLAN_NUMBER_FORMAT.format(x);
  const emails = monthlyEmails(tier);
  return [
    `${n(VISITS_INCLUDED[tier])} visits a month`,
    `${n(ORDERS_INCLUDED[tier])} orders a month`,
    emails > 0 ? `${n(emails)} list emails a month` : "Email to your list on Studio and Scale",
    AI_MONTHLY[tier] > 0 ? `${n(AI_MONTHLY[tier])} AI writing jobs and ${n(ANSWERS_MONTHLY[tier])} visitor answers a month` : "AI writing on Studio and Scale",
    `${n(PAID_STORAGE_BYTES[tier] / 1024 ** 3)} GB of storage`,
  ];
}

const PLAN_FIGURES = Object.fromEntries(TIERS.map(tier => [tier, planFigures(tier)])) as Record<Tier, string[]>;

function PlanTerms({ tier, yearly }: { tier: Tier; yearly: boolean }) {
  const { month, year } = PLAN_PRICES[tier];
  const charged = (yearly ? year : month) / 100;
  const rows: [string, string][] = [
    // Not open yet (lib/opening.ts): said first, in the card it is about.
    ...(PLANS_ON_SALE ? [] : [["On sale", "Not yet. Marktmorgen is still being built, and these are the terms this plan opens with."] as [string, string]]),
    ["Free trial", `${TRIAL_DAYS} days. Your card is taken when it starts, so you can sell before you decide.`],
    [
      "First charge",
      `$${PLAN_NUMBER_FORMAT.format(charged)} ${yearly ? "for the year" : "for the month"}, on the day the trial ends. We email you a week before.`,
    ],
    [
      "Money back",
      `Ask within ${REFUND_DAYS} days of your first payment and it comes back in full, for any reason or none. A yearly plan is refunded for the months you have not started, at any time, less Stripe's card fee.`,
    ],
    ["Canceling", "Two clicks in your studio, any time. Inside the trial, the card is never charged."],
    ["Fees", `${shareShown(tier) / 100}% of each sale. Stripe charges its own processing fee separately.`],
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
      data-pricing-card
      style={{ contain: "layout" }}
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
          {usdWhole(yearly ? year : month)}
        </span>
        <span className="text-ink-mute">{yearly ? "a year" : "a month"}</span>
      </p>
      <p className="mt-2 font-semibold text-violet-deep">{`${shareShown(tier) / 100}% of sales`}</p>
      <p className="mt-2 min-h-[1.5rem] text-[0.9375rem] text-ink-soft">
        {yearly
          ? `One payment of ${usdWhole(year)}, once a year — $${monthlyEquivalent(year)} a month, ${usdWhole(saving * 100)} less than paying monthly${year === month * 10 ? ": two months free" : ""}.`
          : `Billed every month. Or ${usdWhole(year)} once a year, which is ${usdWhole(saving * 100)} less${year === month * 10 ? ": two months free" : ""}.`}
      </p>
      <ul className="mt-5 space-y-1.5 text-[0.9375rem] text-ink" aria-label={`What ${PLAN_TITLES[tier]} holds`}>
        {PLAN_FIGURES[tier].map((line) => (
          <li key={line} className="flex gap-2">
            <Icon name="check" size={16} className="mt-1 shrink-0 text-mint-deep" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

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
      {/* Native disclosure contents are escaped static HTML, with no React event
          handlers or child hydration work between a press and opening the list. */}
      <Suspense fallback={null}>
        <details className="group/perks mt-6" dangerouslySetInnerHTML={{ __html: pricingPerksMarkup(perks) }} />
      </Suspense>

      <p className="mt-5 text-sm text-ink-soft">{uploadAllowanceWords(tier)}</p>
      <p className="mt-3 text-sm text-ink-soft">Up to {PAID_STORAGE_BYTES[tier] / (1024 ** 3)} GB of stored files and videos. New uploads must fit in the remaining space.</p>
      <p className="mt-3 text-sm text-ink-soft">A data room of {dataWords(DATA_ROOM_BYTES[tier])} for your store&apos;s words and records: products, pages, posts, contacts and what each order keeps.</p>

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
          prefetch={false}
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
            <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[0.75rem] font-semibold text-ink">
              {`two months free, up to ${usdWhole(Math.max(...TIERS.map(yearSaving)))}`}
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
        <Suspense fallback={null}>
        <PlanCard
          tier="creator"
          bestFor={"For selling what you make to the audience you already reach — wherever you reach them now."}
          groups={CREATOR_GROUPS}
          perks={INCLUDED}
          featured
          cta="Start on Store"
          yearly={yearly}
        />
        </Suspense>
        <Suspense fallback={null}>
        <PlanCard
          tier="pro"
          bestFor={"For selling and writing to your own list from the same place, so a buyer hears from you again."}
          groups={proGroups(domains)}
          perks={proPerks}
          featured={false}
          cta="Start on Studio"
          yearly={yearly}
        />
        </Suspense>
        <Suspense fallback={null}>
        <PlanCard
          tier="scale"
          bestFor="For an established business with a larger list, more visits and more orders every month."
          groups={[
            { icon: "check", title: "Everything in Studio", body: "The same selling tools and email features, with larger allowances." },
            { icon: "mail", title: "More room to grow", body: `Up to ${PLAN_NUMBER_FORMAT.format(SCALE_MONTHLY_EMAILS)} emails, ${PLAN_NUMBER_FORMAT.format(VISITS_INCLUDED.scale)} visits and ${PLAN_NUMBER_FORMAT.format(ORDERS_INCLUDED.scale)} orders a month.` },
            { icon: "sparkle", title: "More AI and more room", body: `${PLAN_NUMBER_FORMAT.format(AI_MONTHLY.scale)} AI writing jobs and ${PLAN_NUMBER_FORMAT.format(ANSWERS_MONTHLY.scale)} visitor answers a month, and ${PAID_STORAGE_BYTES.scale / (1024 ** 3)} GB of storage.` },
          ]}
          perks={[`Everything in ${PLAN_TITLES.pro}`, `${PLAN_NUMBER_FORMAT.format(SCALE_MONTHLY_EMAILS)} emails a month`, `${PLAN_NUMBER_FORMAT.format(VISITS_INCLUDED.scale)} visits a month`, `${PLAN_NUMBER_FORMAT.format(ORDERS_INCLUDED.scale)} orders a month`, `${PLAN_NUMBER_FORMAT.format(AI_MONTHLY.scale)} AI writing jobs and ${PLAN_NUMBER_FORMAT.format(ANSWERS_MONTHLY.scale)} visitor answers a month`, `Each billing month: ${allowanceListWords("scale")}`]}
          featured={false}
          cta="Start on Scale"
          yearly={yearly}
        />
        </Suspense>
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
            <strong className="font-semibold text-ink">Storage: {PAID_STORAGE_BYTES.creator / (1024 ** 3)} GB on Store, {PAID_STORAGE_BYTES.pro / (1024 ** 3)} GB on Studio, and {PAID_STORAGE_BYTES.scale / (1024 ** 3)} GB on Scale.</strong> Uploads pause when there is no room left. A free trial never has more storage than its chosen plan.
          </span>
        </p>
      </div>
    </div>
  );
}

