"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icons";
import { HOME_QUESTIONS } from "@/lib/home-faq";
import { PLAN_PRICES, PRO_MONTHLY_EMAILS, TRIAL_DAYS, TRIAL_MONTHLY_EMAILS, yearSaving } from "@/lib/plan";

/* Reveals every element with .reveal as it scrolls into view, once. */
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
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return null;
}

/*
 * The hero: one composition that shows the whole sale — the store, the Stripe
 * checkout, the file delivered and the money landing in the creator's own
 * account. It plays through once and then stays on the last step; the three
 * buttons under it let anyone step back and forth. With reduced motion it
 * opens on the finished state.
 */
const FLOW = [
  { key: "pick", label: "Pick a plan", short: "Pick" },
  { key: "pay", label: "Pay on Stripe", short: "Pay" },
  { key: "get", label: "File delivered", short: "Get the file" },
] as const;

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function HeroFlow() {
  const [played, setPlayed] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const reduce = useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );

  // With reduced motion the finished sale shows at once; otherwise it plays
  // through once. A step somebody picked always wins.
  const step = chosen ?? (reduce ? 2 : played);

  useEffect(() => {
    if (chosen !== null || reduce || played >= 2) return;
    const t = setTimeout(() => setPlayed((s) => Math.min(2, s + 1)), played === 0 ? 2200 : 1900);
    return () => clearTimeout(t);
  }, [chosen, reduce, played]);

  const choose = (i: number) => setChosen(i);

  const paying = step === 1;
  const paid = step === 2;

  return (
    <div className="relative mx-auto w-full max-w-[35rem]">
      {/*
        Two compositions, not one squeezed.
        On a wide screen the three cards overlap in depth, which is what makes
        it read as one movement. On a phone there is no depth to spend: the
        same three pieces stack in the order they happen — the store, then
        whichever card the current step is on, then where the money landed —
        so nothing is laid over the phone it is meant to be explaining.
      */}
      <div className="flex flex-col items-center gap-4 sm:relative sm:block sm:h-[35rem]">
        {/* soft light behind the devices */}
        <div
          aria-hidden="true"
          className="absolute left-[56%] top-[38%] h-[78%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,92,255,0.5),transparent)] blur-2xl"
        />
        {/*
          The thread the sale runs along. Two faint strokes from the store to
          the checkout and from the checkout down to the delivery: enough to
          read the three cards as one movement, far too faint to compete with
          them. Hidden on a phone, where the cards are already stacked in the
          order they happen.
        */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
        >
          <path
            d="M34 26 C 52 22, 58 24, 70 30"
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="0.35"
            strokeDasharray="1.6 1.6"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M82 50 C 84 60, 80 64, 74 70"
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="0.35"
            strokeDasharray="1.6 1.6"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* the store, on a phone */}
        <div className="w-[15.5rem] sm:absolute sm:left-0 sm:top-0 sm:w-[54%] sm:max-w-[16.5rem]">
          <div className="device">
            <div className="device-screen">
              <div className="flex items-center justify-between px-4 pb-1 pt-2.5 text-[10px] font-semibold text-ink-mute">
                <span>9:41</span>
                <span className="rounded-[5px] bg-white px-1.5 py-0.5 text-[9px] text-ink-soft ring-1 ring-line">
                  nimbuslabsai.com/demo
                </span>
              </div>
              <div className="px-3.5 pb-4 pt-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1543871595-e11129e271cc?auto=format&fit=crop&crop=faces&w=96&h=96&q=70"
                    alt=""
                    width={40}
                    height={40}
                    fetchPriority="high"
                    className="h-10 w-10 rounded-full bg-sand-deep object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-tight text-ink">Harbor Kitchen</p>
                    <p className="text-[10.5px] text-ink-mute">Simple family meals by Jenny</p>
                  </div>
                </div>
                <div className="mt-3 rounded-[12px] border border-line bg-white p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-deep">
                    Weekly meal planner
                  </p>
                  <div className="mt-2 grid gap-1.5">
                    <div className="flex items-center justify-between rounded-[9px] border border-line px-2.5 py-2 text-[11.5px]">
                      <span className="text-ink-soft">1 week</span>
                      <span className="font-semibold text-ink">$27</span>
                    </div>
                    <div
                      className={`flex items-center justify-between rounded-[9px] border px-2.5 py-2 text-[11.5px] transition-colors duration-500 ${
                        step === 0 ? "border-violet-brand bg-lilac" : "border-violet-brand/50 bg-lilac/60"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-medium text-ink">
                        <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-violet-brand text-white">
                          <Icon name="check" size={9} strokeWidth={3} />
                        </span>
                        5 weeks
                      </span>
                      <span className="font-semibold text-ink">$39</span>
                    </div>
                  </div>
                  <div
                    className={`mt-2.5 rounded-[9px] py-2 text-center text-[11.5px] font-semibold text-white transition-colors duration-500 ${
                      step === 0 ? "bg-violet-brand" : "bg-ink/80"
                    }`}
                  >
                    Continue to checkout
                  </div>
                </div>
                <div className="mt-2 grid gap-1.5">
                  {["Free recipe of the week", "About Jenny"].map((l) => (
                    <p key={l} className="rounded-[9px] border border-line bg-white px-2.5 py-2 text-[11px] font-medium text-ink-soft">
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*
          The slot the step's card sits in on a phone. It keeps one height
          whichever card is showing, so stepping through the sale does not
          make the page under it jump. At 640px the wrapper stops existing
          (`display: contents`) and both cards go back to being positioned
          against the composition itself.
        */}
        <div className="flex min-h-[15.5rem] w-full max-w-[18rem] items-start justify-center sm:contents">
        {/* the Stripe checkout */}
        <div
          className={`w-[17rem] transition-all duration-700 [transition-timing-function:var(--ease)] sm:absolute sm:right-0 sm:top-[7%] sm:w-[54%] sm:max-w-[16.5rem] ${
            step === 1 ? "opacity-100" : "hidden opacity-100 sm:block"
          } ${step === 0 ? "sm:translate-y-3 sm:opacity-65" : "sm:translate-y-0 sm:opacity-100"}`}
          aria-hidden={step === 0}
        >
          <div className="rounded-[16px] bg-white p-3.5 text-ink shadow-[var(--shadow-lg)] ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-ink-mute">Pay Harbor Kitchen</p>
              <Icon name="lock" size={13} className="text-ink-mute" />
            </div>
            <p className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">$39.00</p>
            <p className="text-[10.5px] text-ink-mute">Weekly Meal Planner · 5 weeks</p>
            <div className="mt-3 grid gap-1.5 text-[11px]">
              <div className="rounded-[8px] border border-line px-2.5 py-1.5 text-ink-soft">sam@example.com</div>
              <div className="flex items-center justify-between rounded-[8px] border border-line px-2.5 py-1.5 text-ink-soft">
                <span>•••• 4242</span>
                <Icon name="card" size={13} />
              </div>
            </div>
            <div
              className={`mt-3 flex h-8 items-center justify-center gap-1.5 rounded-[8px] text-[11.5px] font-semibold text-white transition-colors duration-500 ${
                paid ? "bg-mint-brand" : "bg-ink"
              }`}
            >
              {paying ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Processing
                </>
              ) : paid ? (
                <>
                  <Icon name="check" size={13} strokeWidth={2.5} /> Paid
                </>
              ) : (
                "Pay $39.00"
              )}
            </div>
            <p className="mt-2 text-center text-[9.5px] text-ink-mute">Secure checkout by Stripe</p>
          </div>
        </div>

        {/* delivered */}
        <div
          className={`w-[17rem] transition-all duration-700 [transition-timing-function:var(--ease)] sm:absolute sm:bottom-[5.25rem] sm:right-[3%] sm:w-[62%] sm:max-w-[18.5rem] ${
            paid
              ? "opacity-100 sm:translate-y-0"
              : "hidden sm:block sm:pointer-events-none sm:translate-y-4 sm:opacity-0"
          }`}
          aria-hidden={!paid}
        >
          <div className="rounded-[16px] bg-white p-3 shadow-[var(--shadow-lg)] ring-1 ring-black/5">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-mint-soft text-mint-deep">
                <Icon name="check" size={14} strokeWidth={2.5} />
              </span>
              <p className="text-[12px] font-semibold text-ink">Payment confirmed — your file is ready</p>
            </div>
            <div className="mt-2.5 flex items-center gap-2.5 rounded-[10px] border border-line p-2">
              <img
                src="/demo/five-1.webp"
                alt=""
                width={36}
                height={46}
                className="h-[46px] w-9 rounded-[4px] border border-line object-cover object-top"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-medium text-ink">meal-planner-5-weeks.pdf</p>
                <p className="text-[10px] text-ink-mute">The link works for 3 days</p>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-violet-brand text-white">
                <Icon name="download" size={14} strokeWidth={2.2} />
              </span>
            </div>
          </div>
        </div>

        {/*
          Where the money ended up, along the foot of the whole composition.
          It is here from the first frame rather than arriving with the sale,
          because it is the claim the page is making: the line is the
          creator's own Stripe account, and the figure beside it is what the
          platform took. The row fills as the sale completes.
        */}
        </div>

        <div className="w-full max-w-[20rem] sm:absolute sm:inset-x-0 sm:bottom-0 sm:max-w-none">
          <div className="flex items-center justify-between gap-3 rounded-[14px] border border-white/14 bg-[#05081a]/85 px-3.5 py-3 backdrop-blur-sm sm:px-4">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-white/10 text-[#b9a8ff]">
                <Icon name="bank" size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-white">Your Stripe account</span>
                <span className="block text-[10.5px] text-white/70">Nimbus takes $0.00</span>
              </span>
            </span>
            <span
              className={`shrink-0 rounded-[9px] px-2.5 py-1.5 text-[13px] font-semibold tabular-nums transition-colors duration-700 ${
                paid ? "bg-mint-soft text-mint-deep" : "bg-white/10 text-white/70"
              }`}
            >
              {paid ? "+$39.00" : "$0.00"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center" role="group" aria-label="Steps of a sale">
        <ol className="flex items-center gap-1 rounded-[12px] bg-white/[0.08] p-1 ring-1 ring-white/14">
          {FLOW.map((s, i) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => choose(i)}
                aria-pressed={step === i}
                className={`flex h-11 items-center gap-1.5 rounded-[9px] px-3 text-[13px] font-medium transition-colors sm:h-10 ${
                  step === i ? "bg-white text-ink" : "text-white/80 hover:bg-white/12 hover:text-white"
                }`}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold ${
                    step === i ? "bg-violet-brand text-white" : "bg-white/15 text-white"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="whitespace-nowrap sm:hidden">{s.short}</span>
                <span className="hidden whitespace-nowrap sm:inline">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
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
  "Buyers pay into your own Stripe account",
  "Files, courses, paid calls and memberships",
  "Up to three prices on any product, discount codes and payment plans",
  "Offers before and after paying, one click on the same card",
  "Ad pixels, and your own numbers counted without cookies",
  "Free products that build an email list you can download",
];

const PRO_INCLUDED = [
  "Everything in Nimbus",
  "One-off emails to your list, now or at a time you choose",
  "Sequences that go out by themselves after someone joins or buys",
  `Up to ${PRO_MONTHLY_EMAILS.toLocaleString("en-US")} emails a month (${TRIAL_MONTHLY_EMAILS.toLocaleString("en-US")} during the free trial), from your name, with replies coming to you`,
  "Import the list you already have; one-click unsubscribe in every email",
];

function PlanCard({
  name,
  tag,
  bestFor,
  tier,
  perks,
  featured,
  cta,
  yearly,
}: {
  name: string;
  tag: string;
  bestFor: string;
  tier: "creator" | "pro";
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
          Where most people start
        </span>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold text-ink">{name}</p>
        <span className={`tag ${featured ? "tag-brand" : ""}`}>{tag}</span>
      </div>
      <p className="mt-2 text-[0.9375rem] text-ink-soft">{bestFor}</p>

      <p className="mt-6 flex items-baseline gap-2">
        <span className="text-[3.5rem] font-semibold leading-none tracking-[-0.05em] text-ink tabular-nums">
          ${yearly ? year / 100 : month / 100}
        </span>
        <span className="text-ink-mute">{yearly ? "a year" : "per month"}</span>
      </p>
      <p className="mt-2 min-h-[1.5rem] text-[0.9375rem] text-ink-soft">
        {yearly
          ? `Paid once. $${saving} less than twelve months at $${month / 100}.`
          : `Or $${year / 100} a year, paid once \u2014 $${saving} less than twelve months.`}
      </p>

      <ul className="mt-6 space-y-3">
        {perks.map((perk) => (
          <li key={perk} className="flex gap-3 text-ink-soft">
            <Icon name="check" size={18} strokeWidth={2.2} className="mt-1 shrink-0 text-mint-brand" />
            <span>{perk}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-7">
        <Link href="/signin" className={`btn ${featured ? "btn-primary" : "btn-secondary"} btn-lg btn-block`}>
          {cta}
        </Link>
        {/* What the button does, before it is pressed. */}
        <p className="mt-3 text-center text-[0.8125rem] leading-relaxed text-ink-mute">
          {`Sends a sign-in link to your email. ${TRIAL_DAYS} days free, then $${
            yearly ? year / 100 : month / 100
          } ${yearly ? "a year" : "a month"}. Cancel in one click.`}
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
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="seg" role="group" aria-label="How often you pay">
          <button type="button" className="seg-item" aria-pressed={!yearly} onClick={() => setYearly(false)}>
            Monthly
          </button>
          <button type="button" className="seg-item" aria-pressed={yearly} onClick={() => setYearly(true)}>
            Yearly
            <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[0.75rem] font-semibold text-mint-deep">
              {`save $${yearSaving("creator") / 100}`}
            </span>
          </button>
        </div>
        <p className="text-sm text-ink-mute">Both plans, both ways. Switch from your studio whenever you like.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <PlanCard
          name="Nimbus"
          tag="Everything to sell"
          bestFor="For a creator putting a store up and selling from it."
          tier="creator"
          perks={INCLUDED}
          featured
          cta="Start your store"
          yearly={yearly}
        />
        <PlanCard
          name="Nimbus Pro"
          tag={domains ? "Email and your own domain" : "With email to your list"}
          bestFor="For a creator with a list to write to, and sell to again."
          tier="pro"
          perks={proPerks}
          featured={false}
          cta="Start on Pro"
          yearly={yearly}
        />
      </div>
      <CostAtVolume />
      <div className="card-flat mt-6 grid gap-4 p-6 text-sm sm:grid-cols-3 sm:p-7">
        <p className="flex gap-2 text-ink-soft">
          <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-violet-deep" />
          <span>
            <strong className="font-semibold text-ink">{`Free for the first ${TRIAL_DAYS} days.`}</strong>
            {" We email you a week before the first charge, and cancelling before it means your card is never charged. Cancel in one click from your studio. No email to us, no chat, no second request."}
          </span>
        </p>
        <p className="flex gap-2 text-ink-soft">
          <Icon name="percent" size={18} className="mt-0.5 shrink-0 text-violet-deep" />
          <span>
            <strong className="font-semibold text-ink">0% of your sales.</strong> Stripe charges its own processing fee on
            your account.
          </span>
        </p>
        <p className="flex gap-2 text-ink-soft">
          <Icon name="download" size={18} className="mt-0.5 shrink-0 text-violet-deep" />
          <span>
            <strong className="font-semibold text-ink">200 GB of downloads a month.</strong> Stated here, not hidden in the
            terms. Move between the plans from your studio whenever you like.
          </span>
        </p>
      </div>
    </div>
  );
}

/*
 * What the platform takes as sales grow, worked out from published prices.
 * Card processing is left out because every option pays it, to Stripe.
 */
const AVERAGE_PRICE = 27;
const SALES_LEVELS = [20, 75, 370];
const GUMROAD_RATE = 0.1;
const GUMROAD_PER_SALE = 0.5;

function money(value: number): string {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function CostAtVolume() {
  const flat = PLAN_PRICES.creator.month / 100;
  return (
    <div className="card-flat mt-6 p-6 sm:p-7">
      <p className="font-semibold text-ink">What you pay as your sales grow</p>
      <p className="mt-1 text-sm text-ink-soft">{`Each month, at a $${AVERAGE_PRICE} average price. Card processing is not included: every option pays it, to Stripe.`}</p>
      {/*
        Four money columns do not fit a 320px screen, and a table that is cut
        off at the edge hides the column the whole comparison turns on. Above
        640px it stays a table, because that is what it is; below, each level
        of sales becomes its own small card with the three platforms listed
        under it, so nothing is clipped and nothing has to be scrolled
        sideways to be found.
      */}
      <table className="mt-4 hidden w-full text-left text-sm tabular-nums sm:table">
        <caption className="sr-only">What each platform takes each month at three levels of sales</caption>
        <thead>
          <tr className="text-ink-mute">
            <th scope="col" className="py-2 pr-2 font-semibold">Your sales</th>
            <th scope="col" className="px-2 py-2 font-semibold text-violet-deep">Nimbus</th>
            <th scope="col" className="px-2 py-2 font-semibold">Stan Creator</th>
            <th scope="col" className="py-2 pl-2 font-semibold">Gumroad</th>
          </tr>
        </thead>
        <tbody>
          {SALES_LEVELS.map((n) => {
            const revenue = n * AVERAGE_PRICE;
            const gumroad = revenue * GUMROAD_RATE + n * GUMROAD_PER_SALE;
            return (
              <tr key={n} className="border-t border-line">
                <th scope="row" className="py-2.5 pr-2 font-normal text-ink">
                  <span className="font-semibold">{money(revenue)}</span>
                  <span className="block text-xs text-ink-mute">{`${n} sales`}</span>
                </th>
                <td className="px-2 py-2.5 font-semibold text-violet-deep">{money(flat)}</td>
                <td className="px-2 py-2.5 text-ink">{money(flat)}</td>
                <td className="py-2.5 pl-2 text-ink">{money(gumroad)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul className="mt-4 grid gap-3 sm:hidden">
        {SALES_LEVELS.map((n) => {
          const revenue = n * AVERAGE_PRICE;
          const gumroad = revenue * GUMROAD_RATE + n * GUMROAD_PER_SALE;
          return (
            <li key={n} className="rounded-[var(--r-md)] border border-line p-4">
              <p className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-ink tabular-nums">{money(revenue)}</span>
                <span className="text-xs text-ink-mute">{`${n} sales a month`}</span>
              </p>
              <dl className="mt-3 grid gap-1.5 border-t border-line pt-3 text-sm tabular-nums">
                {[
                  { k: "Nimbus", v: money(flat), ours: true },
                  { k: "Stan Creator", v: money(flat), ours: false },
                  { k: "Gumroad", v: money(gumroad), ours: false },
                ].map((r) => (
                  <div key={r.k} className="flex items-baseline justify-between gap-3">
                    <dt className={r.ours ? "font-semibold text-violet-deep" : "text-ink-soft"}>{r.k}</dt>
                    <dd className={r.ours ? "font-semibold text-violet-deep" : "text-ink"}>{r.v}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-ink-mute">
        {`Nimbus and Stan's Creator plan are both $${flat} a month with 0% of sales; Pro and Stan's Creator Pro are both $${PLAN_PRICES.pro.month / 100}. Gumroad takes 10% plus 50 cents on a sale you bring yourself and has no monthly fee, so under about nine sales a month it costs less. Prices read on each company's own pricing page on 20 September 2026.`}
      </p>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-line border-y border-line">
      {HOME_QUESTIONS.map((item, i) => {
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
 * A window that opens the live demo store without leaving the page. Focus
 * moves into it, stays inside it while it is open, and returns to the button
 * that opened it. It is drawn straight into <body>, so no animated parent can
 * pin it inside a column.
 */
export function DemoWindow({
  label = "Try the live demo",
  className = "link-arrow on-dark",
}: {
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && dialog.current) {
        const items = dialog.current.querySelectorAll<HTMLElement>("button, a, iframe");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <button ref={opener} type="button" onClick={() => setOpen(true)} className={className}>
        {label}
        <Icon name="arrow-right" size={18} className="arrow" />
      </button>

      {open &&
        createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-night/70 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-window-title"
            className="nb-pop flex h-[92dvh] w-full max-w-[26rem] flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[var(--shadow-lg)] sm:h-[min(52rem,90dvh)] sm:rounded-[20px]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <p id="demo-window-title" className="text-[0.9375rem] font-semibold text-ink">
                  Live demo store
                </p>
                <p className="text-[0.8125rem] text-ink-mute">Stripe test mode · card 4242 4242 4242 4242</p>
              </div>
              <div className="flex items-center gap-1">
                <Link href="/demo" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                  Full page
                </Link>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="grid h-10 w-10 place-items-center rounded-[10px] text-ink-soft transition-colors hover:bg-sand hover:text-ink"
                >
                  <span className="sr-only">Close the demo</span>
                  <Icon name="close" size={20} />
                </button>
              </div>
            </div>
            <iframe src="/demo" title="Live demo store" className="w-full flex-1 border-0" />
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
