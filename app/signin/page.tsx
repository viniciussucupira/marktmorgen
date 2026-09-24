import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { SignInForm } from "@/components/signin-form";
import { isConnectConfigured } from "@/lib/stripe-connect";
import { TRIAL_DAYS } from "@/lib/plan";

export const metadata: Metadata = {
  title: "Start your store — Nimbus Labs",
  description:
    "Start a Nimbus Labs store, or open the one you have, with a link sent to your email. No password to invent.",
  robots: { index: false, follow: false },
};

const NOTICES: Record<string, { title: string; body: string }> = {
  expired: {
    title: "That link no longer works",
    body: "A sign-in link works once and lasts 15 minutes. Ask for a fresh one below.",
  },
  out: {
    title: "You are signed out",
    body: "Your session is closed on this device.",
  },
  "move-none": {
    title: "That move no longer makes sense",
    body: "The store it was carrying is not there any more. Nothing was changed.",
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
    body: "Nothing was changed. Sign in and try again.",
  },
  "out-everywhere": {
    title: "You are signed out everywhere",
    body: "Every session you had open is closed, on every device. A fresh link signs you back in.",
  },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const notice = NOTICES[status];

  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="surface-night nb-grid-lines on-dark hidden flex-col justify-between p-10 lg:flex xl:p-14">
        <Link href="/" className="w-fit rounded-[10px]" aria-label="Nimbus Labs, home">
          <Logo tone="light" />
        </Link>
        <div className="max-w-md">
          <p className="t-h2 balance text-white">
            Your store. Your <span className="serif font-normal text-[#cfc4ff]">Stripe.</span> Your money.
          </p>
          <ul className="mt-10 space-y-5 text-white/80">
            {[
              { icon: "mail" as const, text: "No password. A link sent to your email signs you in." },
              { icon: "bank" as const, text: "Your buyers pay into your own Stripe account." },
              { icon: "percent" as const, text: "Nimbus takes 0% of your sales." },
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
        <Link href="/demo" className="link-arrow on-dark w-fit text-[0.9375rem]">
          See the live demo store first
          <Icon name="arrow-right" size={16} className="arrow" />
        </Link>
      </aside>

      <main id="content" className="flex min-h-screen flex-col px-4 py-8 sm:px-8 lg:min-h-0 lg:justify-center lg:py-16">
        <Link href="/" className="w-fit rounded-[10px] lg:hidden" aria-label="Nimbus Labs, home">
          <Logo />
        </Link>

        <div className="mx-auto w-full max-w-md flex-1 pt-12 lg:flex-none lg:pt-0">
          <h1 className="t-h1">Start your store</h1>
          <p className="mt-4 text-ink-soft">
            Type your email and we send a link. It opens your store if you already have one, and starts one if you do
            not. There is no password here, on purpose, and nothing to pay to begin.
          </p>

          {notice ? (
            <div className="notice notice-warn mt-6" role="status">
              <p className="font-semibold">{notice.title}</p>
              <p className="mt-1">{notice.body}</p>
            </div>
          ) : null}

          <div className="card mt-8 p-6 sm:p-8">
            <SignInForm />
          </div>

          <section aria-labelledby="next-title" className="mt-10">
            <h2 id="next-title" className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-ink-mute">
              What happens next
            </h2>
            <ol className="mt-4 space-y-4">
              {[
                { title: "Open the link we email you", body: "It works once, for 15 minutes. No password to invent, now or later." },
                { title: "Take your store address", body: "nimbuslabsai.com/@yourname, live the moment you take it." },
                {
                  title: "Put up your first product",
                  body: isConnectConfigured()
                    ? `Connect your own Stripe when you are ready to take a card. The first ${TRIAL_DAYS} days of the plan are free.`
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
                Trouble signing in?{" "}
                <a href="mailto:support@nimbuslabsai.com" className="link">
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
                <Link href="/demo" className="link">
                  Open the live demo store
                </Link>{" "}
                and buy something with a test card.
              </span>
            </p>
          </section>
        </div>

        <p className="mx-auto mt-12 w-full max-w-md text-sm text-ink-mute">
          By continuing you agree to the{" "}
          <Link href="/terms" className="link font-medium">
            Terms
          </Link>{" "}
          and the{" "}
          <Link href="/privacy" className="link font-medium">
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
