import { COMMISSION_BPS, COMMISSION_PLANS_PUBLISHED } from "@/lib/plan";
import { Icon, type IconName } from "@/components/icons";
import { BumpDemo, OptionsDemo } from "@/components/feature-demos";

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
  | "insights";

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

function Row({ icon, title, sub, end }: { icon: IconName; title: string; sub?: string; end?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--r-md)] border border-line bg-white px-3.5 py-3">
      <span className="icon-tile icon-tile-sm shrink-0">
        <Icon name={icon} size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-ink">{title}</span>
        {sub ? <span className="block truncate text-[12px] text-ink-soft">{sub}</span> : null}
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
