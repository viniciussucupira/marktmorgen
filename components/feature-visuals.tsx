import { COMMISSION_BPS, COMMISSION_PLANS_PUBLISHED } from "@/lib/plan";
import { Icon, type IconName } from "@/components/icons";
import { BumpDemo, OptionsDemo } from "@/components/feature-demos";
import { FUNNEL_TYPES, choicesOf, pagesOf } from "@/lib/funnel-types";
import { MAX_BUNDLE_ITEMS, MIN_BUNDLE_ITEMS } from "@/lib/bundle-rules";
import { DEFAULT_ATTEMPTS, DEFAULT_PASS_PERCENT } from "@/lib/quiz";
import { DEFAULT_KEYS } from "@/lib/key-setup";
import { sampleKey } from "@/lib/licence-key-rules";
import { formatMoney } from "@/lib/money";
import { JOIN_EARLY_MINUTES } from "@/lib/community-text";
import { eventTime, lengthWords } from "@/lib/community-events";
import { ROLE_NAMES } from "@/lib/team-roles";
import { MAX_TEAM } from "@/lib/team";
import { MAX_ENDPOINTS, shortAddress } from "@/lib/webhook-limits";
import { LOOKAHEAD_DAYS, MAX_FEEDS } from "@/lib/calendar-limits";
import { MAX_DISCORD_PRODUCTS, MAX_PRODUCT_ROLES } from "@/lib/discord-rules";

/**
 * The pictures at the top of each feature page.
 *
 * Each one is drawn from the screen it stands for — the same labels, the same
 * order, the same rules — so what a creator sees here is what they will find.
 * Nothing in them is a figure about us: where a screen would show a number,
 * the number is an example and the caption says so.
 */
export type VisualKey =
  | "store"
  | "options"
  | "delivery"
  | "stripe"
  | "course"
  | "membership"
  | "calls"
  | "checkout"
  | "email"
  | "domain"
  | "insights"
  | "funnels"
  | "bundles"
  | "quizzes"
  | "keys"
  | "webhooks"
  | "calendar"
  | "discord"
  | "community"
  | "affiliates"
  | "events"
  | "team"
  | "emailPlatforms";

/*
 * The frame every one of these mockups sits in.
 *
 * min-w-0 because these are drawings of a screen and their rows are built
 * from truncating text and nowrap badges, which together give the frame an
 * intrinsic width of about 410px. Without this the frame refuses to shrink
 * below that, and because it is a grid item in the hero it takes the heading
 * and the paragraph beside it along — the drawing wins and the words get cut
 * off. With it the rows truncate, which is what they were already written to
 * do: every one of them carries `min-w-0 flex-1 truncate` and had no ancestor
 * willing to apply the pressure.
 */
function Window({ bar, children }: { bar: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[var(--r-xl)] border border-white/10 bg-white text-ink shadow-[var(--shadow-device)]">
      <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-sand-deep" />
          <span className="h-2.5 w-2.5 rounded-full bg-sand-deep" />
          <span className="h-2.5 w-2.5 rounded-full bg-sand-deep" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-[6px] bg-white px-2.5 py-1 text-center text-[11px] font-medium text-ink-soft ring-1 ring-line">
          {bar}
        </span>
      </div>
      {children}
    </div>
  );
}

function Row({ icon, title, sub, end, wrap = false }: { icon: IconName; title: string; sub?: string; end?: React.ReactNode; wrap?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--r-md)] border border-line bg-white px-3.5 py-3">
      <span className="icon-tile icon-tile-sm shrink-0">
        <Icon name={icon} size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block ${wrap ? "break-words" : "truncate"} text-[13px] font-semibold text-ink`}>{title}</span>
        {sub ? <span className={`block ${wrap ? "break-words" : "truncate"} text-[12px] text-ink-soft`}>{sub}</span> : null}
      </span>
      {end}
    </div>
  );
}

const Price = ({ children }: { children: React.ReactNode }) => (
  <span className="shrink-0 rounded-full bg-lilac px-2.5 py-0.5 text-[12px] font-semibold text-violet-deep">{children}</span>
);

function StoreVisual() {
  return (
    <Window bar="marktmorgen.com/@harborkitchen">
      <div className="bg-[linear-gradient(180deg,#f3efff,transparent_55%)] px-5 pb-6 pt-7 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-violet-brand text-2xl font-semibold text-white ring-4 ring-white">
          H
        </span>
        <p className="mt-3 text-[17px] font-semibold tracking-[-0.01em]">Harbor Kitchen</p>
        <p className="text-[13px] text-ink-soft">Simple family meals by Jenny, a fictional cook</p>
        <div className="mt-5 space-y-2.5 text-left">
          <Row icon="file" title="Weekly Meal Planner" sub="Two sizes, delivered as a PDF" end={<Price>from $27</Price>} />
          <Row icon="link" title="Open a store like this one" sub="marktmorgen.com" />
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-semibold text-ink-soft">
          <span>Theme</span>
          {["bg-white ring-violet-brand", "bg-[#f4efe6] ring-line", "bg-[#15112e] ring-line", "bg-violet-brand ring-line"].map((c, i) => (
            <span key={i} className={`h-5 w-5 rounded-full ring-2 ${c}`} />
          ))}
        </div>
      </div>
    </Window>
  );
}

function DeliveryVisual() {
  const steps: { icon: IconName; title: string; sub: string; done?: boolean }[] = [
    { icon: "card", title: "Paid", sub: "On the creator's own Stripe account", done: true },
    { icon: "check-circle", title: "Stripe confirms it", sub: "Nothing is released before this", done: true },
    { icon: "download", title: "Download it", sub: "On the same screen, right away" },
  ];
  return (
    <Window bar="Your order">
      <div className="space-y-4 p-5">
        <ol className="space-y-2.5">
          {steps.map((s) => (
            <li key={s.title}>
              <Row
                icon={s.icon}
                title={s.title}
                sub={s.sub}
                end={s.done ? <span className="tag tag-live">Done</span> : <span className="btn btn-primary btn-sm pointer-events-none">Download</span>}
              />
            </li>
          ))}
        </ol>
        <div className="rounded-[var(--r-md)] bg-sand p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <Icon name="mail" size={16} className="text-violet-deep" />
            A month later, on a new phone
          </p>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">
            &ldquo;Bought something here? Get it again&rdquo; &mdash; the email address they paid with receives everything they bought.
          </p>
        </div>
      </div>
    </Window>
  );
}

function StripeVisual() {
  return (
    <Window bar="Where a $27 sale goes">
      <div className="p-5">
        <div className="grid gap-2.5">
          <Row icon="user" title="The buyer pays $27" sub="By card, on a Stripe checkout" />
          <div className="flex justify-center text-ink-mute" aria-hidden="true">
            <Icon name="chevron-down" size={18} />
          </div>
          <div className="rounded-[var(--r-md)] border-2 border-violet-brand bg-lilac/60 px-4 py-3.5">
            <p className="flex items-center justify-between gap-3 text-[13px] font-semibold text-ink">
              <span className="flex items-center gap-2">
                <Icon name="bank" size={16} className="text-violet-deep" />
                Your own Stripe account
              </span>
              <span>$27.00</span>
            </p>
            <p className="mt-1 text-[12px] text-ink-soft">Stripe takes its own card fee here, as it would for any shop of yours.</p>
          </div>
          <div className="flex justify-center text-ink-mute" aria-hidden="true">
            <Icon name="chevron-down" size={18} />
          </div>
          <Row icon="receipt" title="Your bank" sub="On the payout schedule you set at Stripe" />
        </div>
        <p className="mt-4 flex items-center justify-between rounded-[var(--r-md)] bg-sand px-4 py-3 text-[12.5px] text-ink-soft">
          <span>Marktmorgen&apos;s fee on this sale</span>
          <span className="text-[15px] font-semibold text-ink">{`$${(Math.floor(2700 * (COMMISSION_PLANS_PUBLISHED ? COMMISSION_BPS.creator : 0) / 10000) / 100).toFixed(2)}`}</span>
        </p>
      </div>
    </Window>
  );
}

function CourseVisual() {
  const lessons = [
    { t: "Welcome, and what you will need", done: true, free: true },
    { t: "Your first week, planned", done: true },
    { t: "The shopping list that does the work", done: false },
  ];
  return (
    <Window bar="Batch cooking, the course">
      <div className="p-5">
        <div className="flex items-center justify-between text-[12px] font-semibold text-ink-soft">
          <span>Module 1 &middot; Start here</span>
          <span>2 of 3 done</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
          <div className="h-full w-2/3 rounded-full bg-violet-brand" />
        </div>
        <ul className="mt-4 min-w-0 space-y-2">
          {lessons.map((l) => (
            <li key={l.t} className="flex items-center gap-3 rounded-[var(--r-sm)] border border-line px-3 py-2.5 text-[13px]">
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${l.done ? "bg-mint-soft text-mint-deep" : "bg-sand text-ink-soft"}`}>
                {l.done ? <Icon name="check" size={12} strokeWidth={2.6} /> : <Icon name="video" size={11} />}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-ink">{l.t}</span>
              {l.free ? <span className="tag">Free preview</span> : null}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-3 rounded-[var(--r-md)] bg-sand px-3.5 py-3 text-[13px]">
          <Icon name="lock" size={16} className="shrink-0 text-violet-deep" />
          <span className="min-w-0">
            <span className="block font-semibold text-ink">Module 2 &middot; Freezer week</span>
            <span className="block text-[12px] text-ink-soft">Opens 7 days after joining, with an email that day</span>
          </span>
        </div>
      </div>
    </Window>
  );
}

function MembershipVisual() {
  return (
    <Window bar="marktmorgen.com/@harborkitchen">
      <div className="space-y-3 p-5">
        <div className="rounded-[var(--r-md)] border border-line p-4">
          <div className="flex items-start justify-between gap-3">
            <span>
              <span className="block text-[14px] font-semibold text-ink">Supper club</span>
              <span className="block text-[12.5px] text-ink-soft">A new plan and a live cook-along every month</span>
            </span>
            <Price>$8 a month</Price>
          </div>
          <span className="btn btn-primary btn-sm btn-block pointer-events-none mt-4">Subscribe &mdash; $8 a month</span>
          <p className="mt-3 text-center text-[12px] font-semibold text-violet-deep underline underline-offset-2">
            Already a member? Manage or cancel
          </p>
        </div>
        <div className="rounded-[var(--r-md)] bg-sand p-4 text-[12.5px] text-ink-soft">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <Icon name="repeat" size={15} className="text-violet-deep" />
            Charged on your Stripe account
          </p>
          <p className="mt-1">Daily, weekly, monthly or yearly. The member cancels on Stripe&apos;s own page, without writing to you.</p>
        </div>
      </div>
    </Window>
  );
}

function CallsVisual() {
  const days = ["Mon 6", "Tue 7", "Wed 8", "Thu 9", "Fri 10"];
  const times = ["9:00 AM", "9:45 AM", "10:30 AM", "2:00 PM", "2:45 PM", "3:30 PM"];
  return (
    <Window bar="One hour with Marcus">
      <div className="p-5">
        <p className="text-[12px] font-semibold text-ink-soft">Pick a day, then a time</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {days.map((d, i) => (
            <span
              key={d}
              className={`rounded-[var(--r-sm)] px-1 py-2 text-center text-[11.5px] font-semibold ${
                i === 2 ? "bg-violet-brand text-white" : "border border-line text-ink"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {times.map((t, i) => (
            <span
              key={t}
              className={`rounded-[var(--r-sm)] py-2 text-center text-[12.5px] font-semibold ${
                i === 3 ? "border-2 border-violet-brand bg-lilac text-violet-deep" : "border border-line text-ink"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-ink-soft">Times are in your time zone.</p>
        <p className="mt-3 rounded-[var(--r-sm)] bg-lilac px-3 py-2 text-[12.5px] text-ink">
          <strong>Wed 8, 2:00 PM</strong> &middot; 60 minutes
        </p>
        <span className="btn btn-primary btn-block pointer-events-none mt-3">Continue to payment &mdash; $180</span>
        <p className="mt-3 flex items-center justify-center gap-2 text-[12px] text-ink-soft">
          <Icon name="clock" size={14} className="text-violet-deep" />
          The time is kept for you for 30 minutes while you pay.
        </p>
      </div>
    </Window>
  );
}

function EmailVisual() {
  return (
    <Window bar="Studio · Email">
      <div className="space-y-3 p-5 text-[13px]">
        <div className="rounded-[var(--r-md)] border border-line">
          <p className="border-b border-line px-3.5 py-2.5 text-ink-soft">
            <span className="font-semibold text-ink">To:</span> everyone who agreed to hear from you
          </p>
          <p className="border-b border-line px-3.5 py-2.5 font-semibold text-ink">This week&apos;s plan is up</p>
          <div className="space-y-1.5 px-3.5 py-3" aria-hidden="true">
            <span className="block h-2 w-11/12 rounded-full bg-sand-deep" />
            <span className="block h-2 w-10/12 rounded-full bg-sand-deep" />
            <span className="block h-2 w-7/12 rounded-full bg-sand-deep" />
          </div>
        </div>
        <div className="flex gap-2">
          <span className="btn btn-primary btn-sm pointer-events-none">Send now</span>
          <span className="btn btn-secondary btn-sm pointer-events-none">Send later</span>
        </div>
        <div className="rounded-[var(--r-md)] bg-sand p-3.5">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <Icon name="refresh" size={15} className="text-violet-deep" />
            Welcome sequence
          </p>
          <ol className="mt-2 space-y-1 text-[12.5px] text-ink-soft">
            <li>1 &middot; Right after they join &middot; &ldquo;Your free recipe&rdquo;</li>
            <li>2 &middot; Two days later &middot; &ldquo;How I plan a week&rdquo;</li>
            <li>3 &middot; Five days later &middot; &ldquo;The planner, if you want it&rdquo;</li>
          </ol>
        </div>
      </div>
    </Window>
  );
}

function DomainVisual() {
  return (
    <Window bar="shop.harborkitchen.com">
      <div className="space-y-4 p-5 text-[13px]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">shop.harborkitchen.com</span>
          <span className="tag tag-live">Live</span>
        </div>
        <div className="overflow-hidden rounded-[var(--r-md)] border border-line">
          <div className="grid grid-cols-[4.5rem_4.5rem_1fr] bg-paper px-3.5 py-2 text-[11.5px] font-semibold text-ink-soft">
            <span>Type</span>
            <span>Name</span>
            <span>Value</span>
          </div>
          <div className="grid grid-cols-[4.5rem_4.5rem_1fr] border-t border-line px-3.5 py-2.5 font-mono text-[12px] text-ink">
            <span>CNAME</span>
            <span>shop</span>
            <span className="truncate">shown in your studio</span>
          </div>
        </div>
        <p className="flex items-center gap-2 text-[12.5px] text-ink-soft">
          <Icon name="lock" size={14} className="text-violet-deep" />
          The certificate is made and renewed for you.
        </p>
        <p className="flex items-center gap-2 text-[12.5px] text-ink-soft">
          <Icon name="link" size={14} className="text-violet-deep" />
          marktmorgen.com/@harborkitchen keeps working too.
        </p>
      </div>
    </Window>
  );
}

function InsightsVisual() {
  const bars = [38, 52, 44, 70, 61, 84, 76];
  const sources = ["Instagram", "TikTok", "Direct", "YouTube"];
  return (
    <Window bar="Studio · Your numbers">
      <div className="p-5">
        <div className="flex gap-1.5 text-[12px] font-semibold">
          <span className="rounded-full bg-ink px-3 py-1 text-white">7 days</span>
          <span className="rounded-full border border-line px-3 py-1 text-ink-soft">30 days</span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-[11.5px] text-ink-soft">
          {["Visitors", "Checkouts", "Sales", "Conversion"].map((l) => (
            <span key={l} className="rounded-[var(--r-sm)] bg-paper px-2 py-2">
              {l}
              <span className="mt-1 block h-2 w-3/4 rounded-full bg-sand-deep" aria-hidden="true" />
            </span>
          ))}
        </div>
        <div className="mt-4 flex h-24 items-end gap-2" aria-hidden="true">
          {bars.map((h, i) => (
            <span key={i} className="flex-1 rounded-t-[6px] bg-violet-brand/80" style={{ height: `${h}%` }} />
          ))}
        </div>
        <ul className="mt-4 min-w-0 space-y-1.5 text-[12.5px]">
          {sources.map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <span className="w-20 shrink-0 font-medium text-ink">{s}</span>
              <span className="h-2 rounded-full bg-lilac-deep" style={{ width: `${70 - i * 16}%` }} aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </Window>
  );
}

/**
 * The kinds of funnel the studio starts from (531 [VP1]), read from the same
 * list the studio and the route that builds a funnel read
 * (lib/funnel-types.ts), under the studio's own heading
 * (components/funnel-type-picker.tsx): their names, in their order, and
 * what each asks of the creator, counted from its own steps. Nothing here is
 * made up.
 */
const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;
function FunnelsVisual() {
  const shown = FUNNEL_TYPES.slice(0, 5);
  const more = FUNNEL_TYPES.length - shown.length;
  return (
    <Window bar="Start from a kind of funnel">
      <div className="space-y-2 p-5">
        {shown.map((type) => (
          <Row
            key={type.id}
            icon="ladder"
            title={type.label}
            sub={`${plural(choicesOf(type).length, "product")} to choose · ${plural(pagesOf(type).length, "new page")}`}
          />
        ))}
        {more > 0 ? <p className="pt-1 text-center text-[12px] font-semibold text-ink-soft">{`and ${plural(more, "more kind")}`}</p> : null}
      </div>
    </Window>
  );
}

/** The bundle editor (components/bundle-editor.tsx): its count, its rule and its choosing box. */
function BundlesVisual() {
  const items = [
    { t: "Weeknight dinners, the guide", p: 19 },
    { t: "Batch cooking, the course", p: 49 },
    { t: "The freezer planner", p: 9 },
  ];
  const price = 49;
  const worth = items.reduce((n, item) => n + item.p, 0);
  return (
    <Window bar="Bundle · Every guide, one price">
      <div className="space-y-2 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-[13px] font-bold text-ink">{`In it: ${items.length} of ${MAX_BUNDLE_ITEMS}`}</p>
          {/* The editor's own line once a bundle has at least MIN_BUNDLE_ITEMS and a price. */}
          {items.length >= MIN_BUNDLE_ITEMS ? <p className="text-[12.5px] font-semibold text-ink">{`$${worth} of products for $${price}`}</p> : null}
        </div>
        {items.map((item) => (
          <Row key={item.t} icon="file" title={item.t} end={<Price>{`$${item.p}`}</Price>} />
        ))}
        <div className="flex items-start gap-3 rounded-[var(--r-md)] bg-sand px-3.5 py-3 text-[13px]">
          <span className="mt-0.5 h-4 w-4 shrink-0 rounded-[4px] border border-line-strong bg-white" />
          <span className="min-w-0 font-semibold text-ink">Let each buyer choose which ones they get</span>
        </div>
      </div>
    </Window>
  );
}

/** A lesson's quiz, open in the course editor (components/quiz-editor.tsx), and the certificate switch under the course. */
function QuizzesVisual() {
  const answers = [
    { t: "Curl your fingertips under, like a claw", right: true },
    { t: "Hold the food flat with your fingers spread", right: false },
    { t: "Hold the food on the side you are cutting", right: false },
  ];
  return (
    <Window bar="Lesson · Slicing safely">
      <div className="space-y-3 p-5">
        <p className="text-[12px] font-semibold text-ink-soft">Quiz</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[var(--r-sm)] border border-line px-3 py-2">
            <p className="text-[11.5px] font-semibold text-ink-soft">Pass mark (%)</p>
            <p className="text-[13px] font-semibold text-ink">{DEFAULT_PASS_PERCENT}</p>
          </div>
          <div className="rounded-[var(--r-sm)] border border-line px-3 py-2">
            <p className="text-[11.5px] font-semibold text-ink-soft">Tries allowed</p>
            <p className="text-[13px] font-semibold text-ink">{DEFAULT_ATTEMPTS}</p>
          </div>
        </div>
        <div className="rounded-[var(--r-md)] border border-line p-3.5">
          <p className="text-[13px] font-semibold text-ink">Which way keeps your fingers safe while you slice?</p>
          <p className="mt-2 text-[12px] font-semibold text-ink">Answers — check the right one</p>
          <ul className="mt-1.5 min-w-0 space-y-1.5">
            {answers.map((a) => (
              <li key={a.t} className="flex items-start gap-2 text-[12.5px] text-ink">
                <span className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border ${a.right ? "border-[5px] border-violet-brand" : "border-line-strong"}`} />
                <span className="min-w-0 flex-1 break-words">{a.t}</span>
              </li>
            ))}
          </ul>
        </div>
        <Row icon="scroll" title="Certificate of completion" sub="Its own page anyone can open" end={<span className="tag tag-live">On</span>} wrap />
      </div>
    </Window>
  );
}

/** A key as one given looks: the default shape, drawn from the keys' own letters, fixed so the page never shows a key that works. */
export const EXAMPLE_KEY = "K7QM-R4TX-9WHC-P2ND";

/** The license key editor (components/licence-key-editor.tsx): where keys come from, and the keys given. */
function KeysVisual() {
  const sample = sampleKey(DEFAULT_KEYS);
  return (
    <Window bar="License keys">
      <div className="space-y-3 p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { t: "Made here, one per sale", on: true },
            { t: "From a list you upload", on: false },
          ].map((o) => (
            <div key={o.t} className={`flex items-start gap-2 rounded-[var(--r-sm)] border p-3 text-[12.5px] ${o.on ? "border-violet-brand bg-lilac" : "border-line"}`}>
              <span className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border ${o.on ? "border-[5px] border-violet-brand" : "border-line-strong"}`} />
              <span className="min-w-0 font-semibold text-ink">{o.t}</span>
            </div>
          ))}
        </div>
        <p className="text-[12.5px] text-ink-soft">{`Each buyer gets a new key made for them, like ${sample}. No key is ever given twice.`}</p>
        <div>
          <p className="text-[12px] font-semibold text-ink-soft">Keys given</p>
          <div className="mt-1.5 rounded-[var(--r-sm)] border border-line px-3 py-2.5">
            <p className="break-all font-mono text-[13px] font-semibold text-ink">{EXAMPLE_KEY}</p>
            <p className="text-[12px] text-ink-soft">dana@example.com · an example order</p>
          </div>
        </div>
      </div>
    </Window>
  );
}

/** The studio's webhooks card (components/webhook-editor.tsx): one endpoint, and its deliveries, newest first, by the code's event names. */
function WebhooksVisual() {
  const where = shortAddress("https://hooks.zapier.com/hooks/catch/1234567/abcdefg/");
  const log = [
    { type: "refund.issued", when: "Nov 1, 3:04 PM", result: "Sending", ok: false },
    { type: "list.joined", when: "Nov 1, 2:51 PM", result: "Delivered (200)", ok: true },
    { type: "sale.completed", when: "Nov 1, 2:40 PM", result: "Delivered (200)", ok: true },
  ];
  return (
    <Window bar="Webhooks and Zapier">
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-bold text-ink">Webhooks and Zapier</p>
          <span className="tag tag-live">{`1 of ${MAX_ENDPOINTS}`}</span>
        </div>
        <div className="rounded-[var(--r-md)] bg-paper px-3.5 py-3 ring-1 ring-line">
          <p className="break-all font-mono text-[12.5px] font-semibold text-ink">{where}</p>
          <p className="text-[12px] text-ink-soft">Every event</p>
        </div>
        <div>
          <p className="text-[12.5px] font-bold text-ink">{`Last ${log.length} deliveries`}</p>
          <ul className="mt-1 min-w-0 divide-y divide-line text-[12.5px]">
            {log.map((d) => (
              <li key={d.type} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2">
                <span className="min-w-0">
                  <span className="font-mono font-semibold text-ink">{d.type}</span>
                  <span className="text-ink-soft">{` · ${d.when}`}</span>
                </span>
                <span className={`shrink-0 text-[12px] font-semibold ${d.ok ? "text-mint-deep" : "text-ink-soft"}`}>{d.result}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Window>
  );
}

/** The studio's calendars card (components/calendar-editor.tsx): a calendar read for busy times, and the bookings feed. */
function CalendarVisual() {
  return (
    <Window bar="Your calendars">
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-bold text-ink">Your calendars</p>
          <span className="tag tag-live">{`1 of ${MAX_FEEDS} read`}</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-[var(--r-md)] bg-paper px-3.5 py-3 ring-1 ring-line">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-mint-brand" />
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-ink">Google Calendar</span>
            <span className="block break-words text-[12px] text-ink-soft">{`Read 4 min ago · 12 busy times in the next ${LOOKAHEAD_DAYS} days · added Oct 20, 2026`}</span>
          </span>
        </div>
        <div className="rounded-[var(--r-md)] border border-line px-3.5 py-3">
          <p className="break-words text-[13px] font-semibold text-ink">Your bookings in your calendar</p>
          <span className="btn btn-secondary btn-sm pointer-events-none mt-2">Copy address</span>
        </div>
      </div>
    </Window>
  );
}

/** The studio's Discord page (components/discord-studio.tsx): which products give which roles, each role a pill. */
function DiscordVisual() {
  const rows = [
    { product: "Supper club", roles: [{ name: "Members", on: true }, { name: "Students", on: false }] },
    { product: "Batch cooking, the course", roles: [{ name: "Members", on: true }, { name: "Students", on: true }] },
  ];
  return (
    <Window bar="Discord">
      <div className="space-y-3 p-5">
        <p className="text-[13px] font-bold text-ink">Which products give which roles</p>
        <p className="text-[12px] text-ink-soft">{`Up to ${MAX_PRODUCT_ROLES} roles for each product, on up to ${MAX_DISCORD_PRODUCTS} products.`}</p>
        {rows.map((row) => {
          const given = row.roles.filter((r) => r.on).length;
          return (
            <div key={row.product} className="rounded-[var(--r-sm)] border border-line p-3">
              <p className="break-words text-[13px] font-semibold text-ink">{row.product}</p>
              <p className="text-[12px] text-ink-soft">{`Gives ${given} ${given === 1 ? "role" : "roles"}.`}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {row.roles.map((role) => (
                  <span key={role.name} className={`rounded-full border px-2.5 py-1 text-[12px] ${role.on ? "border-violet-brand bg-lilac text-ink" : "border-line text-ink-soft"}`}>
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Window>
  );
}

/** The studio's community card (components/community-studio.tsx): switched on, its three counts, the way in. */
function CommunityVisual() {
  const tiles = [
    { n: "48", label: "have come in" },
    { n: "112", label: "posts" },
    { n: "31", label: "want the community's emails" },
  ];
  return (
    <Window bar="Community">
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-bold text-ink">Your community</p>
          <span className="tag tag-live">On</span>
        </div>
        <p className="break-words text-[12.5px] text-ink-soft">Open to everyone who holds one of the products you chose below. Your store page shows the way in.</p>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {tiles.map((t) => (
            <div key={t.label} className="min-w-0 rounded-[var(--r-sm)] bg-sand px-1 py-2.5">
              <p className="text-[16px] font-semibold tabular-nums text-ink">{t.n}</p>
              <p className="break-words text-[10.5px] text-ink-soft">{t.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="btn btn-secondary btn-sm pointer-events-none">Switch it off</span>
          <span className="btn btn-ghost btn-sm pointer-events-none">Open it</span>
        </div>
      </div>
    </Window>
  );
}

/** One affiliate in the studio (components/affiliate-studio.tsx, Member): address, link code, status, and the five tiles. */
function AffiliatesVisual() {
  const tiles = [
    { label: "Clicks", value: "120" },
    { label: "Sales", value: "6" },
    { label: "Earned", value: formatMoney(5_940, "usd") },
    { label: "Paid", value: formatMoney(3_000, "usd") },
    { label: "Owed", value: formatMoney(5_940 - 3_000, "usd"), strong: true },
  ];
  return (
    <Window bar="Affiliates">
      <div className="space-y-3 p-5">
        <p className="text-[13px] font-bold text-ink">Your affiliates</p>
        <div className="rounded-2xl border border-line p-3.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block break-all text-[13px] font-semibold text-ink">ana@example.com</span>
              <span className="block font-mono text-[11.5px] text-ink-soft">?via=ana</span>
            </span>
            <span className="tag tag-live">Approved</span>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center sm:grid-cols-5">
            {tiles.map((t) => (
              <div key={t.label} className={`min-w-0 rounded-xl px-1.5 py-1.5 ${t.strong ? "bg-lilac" : "bg-paper"}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-ink-mute">{t.label}</p>
                <p className={`text-[12.5px] font-semibold tabular-nums ${t.strong ? "text-violet-ink" : "text-ink"}`}>{t.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}

/**
 * The community's live events in the studio (components/community-events-studio.tsx,
 * EventRow): what is coming up, its places beside its title, when (in the
 * studio's own eventTime and lengthWords), where and for whom. Server only, as
 * every card here: lib/community-events.ts reads the store.
 */
function EventsVisual() {
  const events = [
    { title: "Monthly cook-along", start: Date.UTC(2026, 10, 10, 23), minutes: 60, where: "Private video room · every member", places: "12 of 30 places taken" },
    { title: "Q&A: your freezer questions", start: Date.UTC(2026, 10, 19, 17), minutes: 45, where: "Your meeting link · only for buyers of Batch Cooking Basics", places: "8 going" },
  ];
  return (
    <Window bar="Live events">
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] font-bold text-ink">Live events</p>
          <span className="tag tag-brand">{`${events.length} coming up`}</span>
        </div>
        <p className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-ink-soft">Coming up</p>
        <ul className="min-w-0 space-y-2">
          {events.map((e) => (
            <li key={e.title} className="rounded-[var(--r-md)] border border-line p-3">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-0.5">
                <p className="min-w-0 break-words text-[13px] font-semibold text-ink">{e.title}</p>
                <p className="text-[12px] font-semibold text-ink">{e.places}</p>
              </div>
              <p className="break-words text-[12px] text-ink-soft">{`${eventTime({ start: e.start, tz: "America/New_York" })} · ${lengthWords(e.minutes)}`}</p>
              <p className="break-words text-[12px] text-ink-soft">{e.where}</p>
            </li>
          ))}
        </ul>
        <p className="break-words text-[12px] text-ink-soft">{`The way in shows ${JOIN_EARLY_MINUTES} minutes before the start, only to members who can come.`}</p>
      </div>
    </Window>
  );
}

/** The studio's team page (components/team-manager.tsx): the places used, the owner, a member with a role, an invitation waiting, and the invite form. */
function TeamVisual() {
  return (
    <Window bar="Team">
      <div className="space-y-2 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[13px] font-bold text-ink">People on this store</p>
          <span className="text-[12px] tabular-nums text-ink-soft">{`2 of ${MAX_TEAM} places used`}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-2 rounded-[var(--r-md)] border border-line p-3">
          <span className="min-w-0">
            <span className="block break-all text-[13px] font-semibold text-ink">you@example.com</span>
            <span className="block text-[12px] text-ink-soft">You. Everything, including the plan, payments and the team.</span>
          </span>
          <span className="tag">Owner</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--r-md)] border border-line p-3">
          <span className="min-w-0">
            <span className="block break-all text-[13px] font-semibold text-ink">sam@example.com</span>
            <span className="block text-[12px] text-ink-soft">Joined Oct 3, 2026</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-[var(--r-sm)] border border-line-strong px-2.5 py-1 text-[12px] font-semibold text-ink">
              {ROLE_NAMES.editor}
              <Icon name="chevron-down" size={14} />
            </span>
            <span className="text-[12px] font-bold text-ink-soft underline underline-offset-4">Remove</span>
          </span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-2 rounded-[var(--r-md)] border border-line p-3">
          <span className="min-w-0">
            <span className="block break-all text-[13px] font-semibold text-ink-soft">lee@example.com</span>
            <span className="block text-[12px] text-ink-soft">{`Invited as ${ROLE_NAMES.support} · the link works until Nov 8`}</span>
          </span>
          <span className="tag tag-next">Waiting</span>
        </div>
        <div className="rounded-[var(--r-md)] bg-paper p-3 ring-1 ring-line">
          <p className="text-[13px] font-semibold text-ink">Invite someone</p>
          <p className="mt-1 text-[11.5px] font-semibold text-ink-soft">Their email</p>
          <p className="mt-0.5 break-all rounded-[var(--r-sm)] border border-line bg-white px-2.5 py-1.5 text-[12.5px] text-ink">kim@example.com</p>
          <span className="btn btn-primary btn-sm pointer-events-none mt-2">
            <Icon name="mail" size={16} />
            Send the invitation
          </span>
        </div>
      </div>
    </Window>
  );
}

/** Connecting an email platform in the studio (components/email-sync-editor.tsx), before anything is connected: the platform, its key, Connect. */
function EmailPlatformsVisual() {
  const platforms = [
    { name: "Mailchimp", target: "an audience", on: true },
    { name: "Kit", target: "a form", on: false },
    { name: "beehiiv", target: "a publication", on: false },
    { name: "MailerLite", target: "a group", on: false },
  ];
  return (
    <Window bar="Email platforms">
      <div className="space-y-3 p-5">
        <p className="text-[13px] font-bold text-ink">Connect your email platform</p>
        <p className="text-[12px] font-semibold text-ink-soft">Platform</p>
        <div className="grid grid-cols-2 gap-2">
          {platforms.map((p) => (
            <div key={p.name} className={`flex min-w-0 items-start gap-2 rounded-[var(--r-sm)] border p-2.5 ${p.on ? "border-violet-brand bg-lilac" : "border-line"}`}>
              <span className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border ${p.on ? "border-[5px] border-violet-brand" : "border-line-strong"}`} />
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold text-ink">{p.name}</span>
                <span className="block break-words text-[11.5px] text-ink-soft">{`Adds to ${p.target}`}</span>
              </span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[12px] font-semibold text-ink-soft">Mailchimp API key</p>
          <p className="mt-0.5 break-words rounded-[var(--r-sm)] border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink-mute">Your Mailchimp API key (ends in -us21 or similar)</p>
        </div>
        <span className="btn btn-primary btn-sm pointer-events-none">Connect</span>
      </div>
    </Window>
  );
}

const CAPTIONS: Record<VisualKey, string> = {
  store: "A store page, drawn from the demo store you can open and buy from.",
  options: "The buyer is charged the price they picked, as the creator saved it.",
  delivery: "What the buyer sees after paying, and how they get it back later.",
  stripe: "Illustration for Store, before Stripe processing fees; paid plans are not on sale yet.",
  course: "A student's view of a course, with a module that opens on a later day.",
  membership: "A membership on a store page, with the way out under it.",
  calls: "Booking a paid call. Dates and times are an example.",
  checkout: "Check the box to add it: the total on the button changes with it.",
  email: "Writing to your list from the studio. The subject and steps are an example.",
  domain: "A store on its own domain, with the one record to add.",
  insights: "The numbers screen in the studio. The bars are an example, not our figures.",
  funnels: "The kinds of funnel the studio starts from, read from its own list.",
  bundles: "The bundle editor in the studio. The products and their prices are an example.",
  quizzes: "A lesson's quiz and the course's certificate. The lesson and its question are an example.",
  keys: "The license key editor. The key, the buyer and the order are an example. Keys made here are new for each sale.",
  webhooks: "Webhooks in the studio. The address, the times and the deliveries are an example.",
  calendar: "Your calendars in the studio. The calendar and its busy times are an example.",
  discord: "The Discord page in the studio. The products and roles are an example.",
  community: "Your community in the studio. The counts are made up as an example, not real figures.",
  affiliates: "One affiliate in the studio. The person and every figure are made up as an example, not anyone's real results.",
  events: "Live events in the studio. The events, dates and counts are made up as an example.",
  team: "The team page in the studio. The people and the dates are made up as an example.",
  emailPlatforms: "Connecting an email platform in the studio, before anything is connected. The platform picked is an example.",
};

/**
 * @param tone Which surface it is standing on. The drawings themselves are
 *   white either way; only the hairline around them and the caption under
 *   them change, because a caption in white on sand is a caption nobody reads.
 */
export function FeatureVisual({ visual, tone = "dark" }: { visual: VisualKey; tone?: "dark" | "light" }) {
  const body = {
    store: <StoreVisual />,
    options: <OptionsDemo />,
    delivery: <DeliveryVisual />,
    stripe: <StripeVisual />,
    course: <CourseVisual />,
    membership: <MembershipVisual />,
    calls: <CallsVisual />,
    checkout: <BumpDemo />,
    email: <EmailVisual />,
    domain: <DomainVisual />,
    insights: <InsightsVisual />,
    funnels: <FunnelsVisual />,
    bundles: <BundlesVisual />,
    quizzes: <QuizzesVisual />,
    keys: <KeysVisual />,
    webhooks: <WebhooksVisual />,
    calendar: <CalendarVisual />,
    discord: <DiscordVisual />,
    community: <CommunityVisual />,
    affiliates: <AffiliatesVisual />,
    events: <EventsVisual />,
    team: <TeamVisual />,
    emailPlatforms: <EmailPlatformsVisual />,
  }[visual];
  const interactive = visual === "options" || visual === "checkout";
  return (
    <figure className="w-full min-w-0 max-w-[26rem]">
      {interactive ? body : <div aria-hidden="true">{body}</div>}
      <figcaption className={`mt-3 text-center text-sm ${tone === "light" ? "text-ink-mute" : "text-white/70"}`}>
        {CAPTIONS[visual]}
      </figcaption>
    </figure>
  );
}

export { Window as VisualWindow };
