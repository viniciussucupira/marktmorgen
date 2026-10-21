import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { SignInForm } from "@/components/signin-form";
import { PasskeySignIn } from "@/components/passkey-signin";
import { ToastOnLoad } from "@/components/toast";
import { isConnectConfigured } from "@/lib/stripe-connect";
import { PLAN_TITLES as PLAN_NAMES, TIERS, TRIAL_DAYS, parseTier, publishedPriceWords as priceWords } from "@/lib/plan";
import { PLANS_ON_SALE } from "@/lib/opening";
import { formatMoney } from "@/lib/money";
import { INVITE_PROGRAM_OPEN, INVITE_BONUS_CENTS, INVITE_HOLD_DAYS } from "@/lib/creator-invite-rules";
import { feeWords } from "@/lib/fee-words";

/** Somebody who came back to a store they have: by Log in, or sent here to log in again. */
const RETURNING_STATUSES = new Set(["reauth", "out", "out-everywhere"]);
function isReturning(params: { [key: string]: string | string[] | undefined }): boolean {
  return params.to === "login" || (typeof params.status === "string" && RETURNING_STATUSES.has(params.status));
}

/** The tab says what the page says: a creator who pressed Log in is not shown "Start your store" there either. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const returning = isReturning(await searchParams);
  return {
    title: returning ? "Log in to your store — Marktmorgen" : "Start your store — Marktmorgen",
    description:
      "Start a Marktmorgen store, or open the one you have, with a link sent to your email. No password to invent.",
    robots: { index: false, follow: false },
  };
}

const NOTICES: Record<string, { title: string; body: string; tone?: "success" }> = {
  "invite-paused": {
    title: "New creator invitations are paused",
    body: "No new invite was accepted. Existing invitation credits and previously accepted invites keep their original terms and expiry. You can continue to your account below.",
  },
  "invite-accepted": {
    title: INVITE_PROGRAM_OPEN ? "Your invite is saved on this browser" : "Previously accepted invitations",
    body: INVITE_PROGRAM_OPEN ? `Type your email below, open the link we send, and take your store address. The invite counts for that store: ${INVITE_HOLD_DAYS} days after your first payment, ${formatMoney(INVITE_BONUS_CENTS, "usd")} of credit goes on your plan.` : "If you previously accepted an invite on this browser, its original terms and expiry still apply. No new invitations are being accepted.",
    tone: "success",
  },
  expired: {
    title: "That link no longer works",
    body: "A login link works once and lasts 15 minutes. Ask for a fresh one below.",
  },
  "move-none": {
    title: "That move no longer makes sense",
    body: "The store it was carrying is not there anymore. Nothing was changed.",
  },
  "move-same": {
    title: "That is already the address in charge",
    body: "Nothing was changed.",
  },
  "move-taken": {
    title: "That address already has a store",
    body: "An account cannot be moved on top of another one. Nothing was changed.",
  },
  "move-error": {
    title: "The move did not finish",
    body: "Nothing was changed. Log in and try again.",
  },
  "invite-expired": {
    title: "That invitation no longer works",
    body: "An invitation works once and lasts 7 days, and the store's owner can take it back. Ask them for a new one.",
  },
  "invite-gone": {
    title: "That store is not there anymore",
    body: "The invitation was for a store that has since been deleted. Nothing was changed.",
  },
  "invite-full": {
    title: "That team is full",
    body: "A store's team has room for five people. Ask the store's owner to make room and invite you again.",
  },
  "invite-owner": {
    title: "That is your own store",
    body: "The invitation was sent to the address that owns the store. Log in below to open it.",
  },
  "invite-error": {
    title: "Joining did not finish",
    body: "Nothing was changed. Open the invitation again in a moment.",
  },
  reauth: {
    title: "Log in again to add a passkey",
    body: "A passkey keeps working after a session ends, so adding one needs a login from the last 15 minutes. Log in below with a link sent to your email, or with a passkey you already have, and your studio opens at the spot to add it.",
  },
  "invite-other": {
    title: "You are logged in with another address",
    body: "That invitation is for a different email address. Nothing was changed. Log out, then open the invitation again from the email it came in.",
  },
  "invite-joined": {
    title: "You joined the team",
    body: "Your address already has an account here, so the invitation did not log you in. Log in below with a link sent to that address, or with a passkey, and the store is in your studio.",
  },
  "invite-slow": {
    title: "Too many tries",
    body: "Nothing was changed. Wait a little, then open the invitation again.",
  },
};

/*
 * Log out and log out of all devices end here. They only confirm what the
 * person just did, so they are said in a toast rather than a box above the
 * form; the address is cleaned up after, and old links still confirm it.
 */
const TOASTS: Record<string, string> = {
  out: "You're logged out.",
  "out-everywhere": "You're logged out of all devices.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const notice = NOTICES[status];
  // Somebody who pressed Log in has a store already, or believes so: the page
  // greets them that way, rather than with "Start your store", which reads as
  // if they had pressed the wrong thing. The form, the link and what it opens
  // are the same either way.
  const returning = isReturning(params);
  const confirmation = Object.hasOwn(TOASTS, status) ? TOASTS[status] : null;

  /*
   * The plan somebody pressed on, said back to them.
   *
   * Nothing is charged on this page and no plan is set here — the store is
   * made first, and the plan is chosen in the studio, with the card, after
   * the trial has started. But a person who read the Pro column, switched the
   * page to yearly and pressed the button arrived at a page that mentioned
   * neither, and had no way to tell whether the choice had been heard. So the
   * choice travels in the address and is repeated here, with the plain truth
   * of what happens to it next.
   */
  const tier = parseTier(params.plan);
  const yearly = params.billing === "year";
  const picked = tier
    ? {
        name: PLAN_NAMES[tier],
        words: priceWords(tier, yearly ? "year" : "month"),
      }
    : null;

  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="surface-night nb-grid-lines on-dark hidden flex-col justify-between p-10 lg:flex xl:p-14">
        <Link prefetch={false} href="/" className="w-fit rounded-[10px]" aria-label="Marktmorgen, home">
          <Logo tone="light" />
        </Link>
        <div className="max-w-md">
          <p className="t-h2 balance text-white">
            Your store. Your <span className="serif font-normal text-[#cfc4ff]">Stripe.</span> Your money.
          </p>
          <ul className="mt-10 space-y-5 text-white/80">
            {[
              { icon: "mail" as const, text: "No password. A link sent to your email logs you in." },
              { icon: "bank" as const, text: "Your buyers pay into your own Stripe account." },
              { icon: "percent" as const, text: feeWords().takes },
            ].map((item) => (
              <li key={item.text} className="flex gap-3">
                <span className="icon-tile icon-tile-sm">
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="pt-1.5">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link prefetch={false} href="/demo" className="link-arrow on-dark w-fit text-[0.9375rem]">
          See the live demo store first
          <Icon name="arrow-right" size={16} className="arrow" />
        </Link>
      </aside>

      <main id="content" className="flex min-h-screen min-w-0 flex-col px-4 py-8 [overflow-wrap:anywhere] sm:px-8 lg:min-h-0 lg:justify-center lg:py-16">
        <Link prefetch={false} href="/" className="inline-flex min-h-11 w-fit items-center rounded-[10px] lg:hidden" aria-label="Marktmorgen, home">
          <Logo />
        </Link>

        <div className="mx-auto w-full min-w-0 max-w-md flex-1 pt-12 lg:flex-none lg:pt-0">
          <h1 className="t-h1">{returning ? "Log in to your store" : "Start your store"}</h1>
          <p className="mt-4 text-ink-soft">
            {returning
              ? "Type the email your store is under and we'll send you a link that opens it. No password here, on purpose. New here? The same link starts a store."
              : "Type your email and we'll send you a link. It opens your store if you already have one, and starts one if you do not. There is no password to create. After the link, you choose a store address and prepare your first offer."}
          </p>

          {!returning ? <section aria-labelledby="signin-plan-title" className="notice mt-6" data-signin-terms>
            <h2 id="signin-plan-title" className="font-semibold">Monthly plan prices</h2>
            <ul className="mt-2 space-y-1">{TIERS.map(plan => <li key={plan} data-signin-price={plan}>{PLAN_NAMES[plan]}: {priceWords(plan, "month")}</li>)}</ul>
            <p className="mt-3 text-sm">Store setup starts without a card. Requesting a login link does not subscribe you to a plan or charge you.</p>
            <p className="mt-2 text-sm">{PLANS_ON_SALE ? `Choose a plan separately in your studio. A ${TRIAL_DAYS}-day trial applies only to an eligible first store; returning and additional stores may not qualify. Review the current terms before starting.` : "Paid plans and paid selling are not open yet. You can prepare your store today; setup is not a free paid plan or an active trial."}</p>
          </section> : null}

          {picked ? (
            <div className="notice mt-6" role="status">
              <p className="font-semibold">{`You picked ${picked.name}, ${picked.words}`}</p>
              <p className="mt-1">
                {PLANS_ON_SALE
                  ? `Nothing is paid here. Your store is made first and an eligible first store can start a ${TRIAL_DAYS}-day trial when you choose a plan separately in your studio. Returning or additional stores may not qualify. ${picked.name} at ${picked.words} is one of the plan choices. You can take the other one instead, or move between them later.`
                  : `Nothing is paid here, and no plan is on sale yet. Your store is made first, and you can set it up today. ${picked.name} at ${picked.words} is one of the plans that will be in your studio on the day they open.`}
              </p>
            </div>
          ) : null}

          {confirmation ? <ToastOnLoad message={confirmation} param="status" /> : null}
          {notice ? (
            <div className={`notice ${notice.tone === "success" ? "notice-success" : "notice-warn"} mt-6`} role="status">
              <p className="font-semibold">{notice.title}</p>
              <p className="mt-1">{notice.body}</p>
            </div>
          ) : null}

          <div className="card mt-8 p-6 sm:p-8">
            <SignInForm />
            <PasskeySignIn />
            {/* Lost the inbox this account logs in with (lib/recovery-address.ts). */}
            <p className="mt-4 text-sm text-ink-soft">
              <Link prefetch={false} href="/signin/lost" className="link inline-flex min-h-11 items-center">
                Cannot open your email any more?
              </Link>
            </p>
          </div>

          <section aria-labelledby="next-title" className="mt-10">
            <h2 id="next-title" className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-ink-mute">
              What happens next
            </h2>
            <ol className="mt-4 space-y-4">
              {[
                { title: "Open the link we email you", body: "It works once, for 15 minutes. No password to invent, now or later." },
                { title: "Take your store address", body: "marktmorgen.com/@yourname, live the moment you take it." },
                {
                  title: "Put up your first product",
                  body: !PLANS_ON_SALE
                    ? "Set everything up today. Plans are not on sale yet, so taking a card starts on the day they are."
                    : isConnectConfigured()
                    ? `Connect your own Stripe account when you are ready to take a card. An eligible first store may start a ${TRIAL_DAYS}-day plan trial; review eligibility and billing terms in your studio.`
                    : "Taking a card is not switched on yet; everything else is.",
                },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lilac text-sm font-semibold text-violet-deep">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{step.title}</span>
                    <span className="mt-0.5 block text-[0.9375rem] text-ink-soft">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 flex gap-2 text-[0.9375rem] text-ink-soft">
              <Icon name="mail" size={18} className="mt-0.5 shrink-0 text-violet-deep" />
              <span>
                Trouble logging in?{" "}
                <a href="mailto:support@marktmorgen.com" className="link">
                  Write to us
                </a>{" "}
                and a person answers.
              </span>
            </p>
            {/*
              On a phone the panel with the demo link is not on the page at
              all, and somebody who is not ready to hand over an email should
              still be one tap from seeing the thing working.
            */}
            <p className="mt-4 flex gap-2 text-[0.9375rem] text-ink-soft lg:hidden">
              <Icon name="store" size={18} className="mt-0.5 shrink-0 text-violet-deep" />
              <span>
                Not ready yet?{" "}
                <Link prefetch={false} href="/demo" className="link">
                  Open the live demo store
                </Link>{" "}
                and buy something with a test card.
              </span>
            </p>
          </section>
        </div>

        <p className="mx-auto mt-12 w-full max-w-md text-sm text-ink-mute">
          By continuing you agree to the{" "}
          <Link prefetch={false} href="/terms" className="link font-medium">
            Terms
          </Link>{" "}
          and the{" "}
          <Link prefetch={false} href="/privacy" className="link font-medium">
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
