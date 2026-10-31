import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { studioPath, studioView } from "@/lib/studio-route";
import { withinLimit } from "@/lib/request-guard";
import { readPlanRefund } from "@/lib/plan-refund";
import { issueReview } from "@/lib/plan-refund-flow";
import { SUPPORT_ADDRESS, moneyOf, refundEffects, refusalWords } from "@/lib/plan-refund-words";
import { REFUND_DAYS } from "@/lib/plan";

export const metadata: Metadata = {
  title: "Refund your payment — Marktmorgen",
  robots: { index: false, follow: false },
};

type Params = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

/** Reviews a store may open in a day: each reads Stripe a bounded number of times (lib/plan-refund.ts, MAX_CALLS). */
const SHOWN_PER_DAY = 20;

/** A payment's date, as the receipt shows it. */
const paidOn = (seconds: number) => new Date(seconds * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/** What the refund route came back with (app/api/billing/refund), in plain words. */
const DONE: Record<string, { tone: "success" | "warn"; title: string; body: string }> = {
  refunded: { tone: "success", title: "Your payment was refunded", body: "Your plan has ended. We sent you an email with the amount and what happens next. Your bank may take a few days to show the refund." },
  ending: { tone: "success", title: "Your payment was refunded", body: "We are ending your plan now, and you will get an email when it is done, within a day. Nothing more will be charged." },
  busy: { tone: "warn", title: "Your refund is already being made", body: "Another request for it is running. Wait a minute, then open this page again." },
  review: { tone: "warn", title: "Nothing was refunded", body: "This confirmation was used already, or a newer copy of this page was opened. Check the amount below and confirm again." },
  changed: { tone: "warn", title: "Nothing was refunded", body: "The amount changed since you opened this page, because another month of your plan has started. The new amount is below; confirm again if you still want it." },
  later: { tone: "warn", title: "Nothing was refunded", body: `You asked many times today. Try again tomorrow, or email ${SUPPORT_ADDRESS}.` },
  error: { tone: "warn", title: "Nothing was refunded", body: `We could not reach our payment provider, and your plan was not changed. Try again in a few minutes. If it happens again, email ${SUPPORT_ADDRESS}. If the refund did go through, we end your plan within a day and email you.` },
  "error-stop": { tone: "warn", title: "Nothing was refunded", body: `We could not reach our payment provider. Your plan is set to stop at the end of the period you paid for, and we take that back within a day. If you want to keep your plan, you can also choose "Keep my subscription" in your studio. Questions: ${SUPPORT_ADDRESS}.` },
  none: { tone: "warn", title: "Nothing was refunded", body: "The reason is below." },
  owner: { tone: "warn", title: "Only the store's owner can ask for this refund", body: "Ask the owner of this store to open this page." },
};

/**
 * The plan refund's review page (305 [SY1], AX274 3.3.6): the exact amount
 * the published policy gives today, what happens to the store, and a way
 * back without changing anything. The button posts the one-time pass this
 * page issues, so a refund is never made without this page. No reason is
 * asked. Nothing is refunded by opening it.
 */
export default async function StudioRefundPage({ searchParams }: Params) {
  const query = await searchParams;
  const found = await studioView(await cookies(), typeof query.store === "string" ? query.store : undefined, "billing", { count: false });
  if (!found.ok) {
    if (found.reason === "signed_out") redirect("/signin");
    redirect("/");
  }
  const { view } = found;
  const { store } = view;
  const back = `${studioPath(store)}#billing`;
  const done = typeof query.done === "string" ? DONE[query.done] : undefined;
  const finished = query.done === "refunded" || query.done === "ending";
  const owner = view.role === "owner";
  const shown = owner && !finished ? await withinLimit("plan-refund-review", store.sid || store.handle, SHOWN_PER_DAY, 86_400) : false;
  const reading = shown ? await readPlanRefund(store) : null;
  const owed = reading && (reading.refund.kind === "guarantee" || reading.refund.kind === "unstarted_months") && "currency" in reading ? reading : null;
  const token = owed ? await issueReview(store.sid, owed.refund.cents) : "";
  const refusal = reading && !owed && reading.refund.kind !== "guarantee" && reading.refund.kind !== "unstarted_months" ? refusalWords({ refund: reading.refund }) : null;
  const amount = owed ? moneyOf(owed.refund.cents, owed.currency) : "";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-2 sm:gap-3">
          <Link href="/" className="shrink-0 rounded-[10px]" aria-label="Marktmorgen, home">
            <Logo />
          </Link>
        </div>
      </header>
      <main id="content" className="container-page pb-20 pt-10 sm:pt-14">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-soft">
          <ol className="flex flex-wrap gap-2">
            <li><Link href={studioPath(store)} className="underline underline-offset-2">Studio</Link> <span aria-hidden="true">›</span></li>
            <li><Link href={back} className="underline underline-offset-2">What you pay us</Link> <span aria-hidden="true">›</span></li>
            <li aria-current="page">Refund your payment</li>
          </ol>
        </nav>
        <div className="card max-w-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">Refund your payment</h1>
          {done ? (
            <div className={`mt-5 notice ${done.tone === "success" ? "notice-success" : "notice-warn"}`} role="status" data-refund-done={query.done}>
              <p className="font-semibold">{done.title}</p>
              <p className="mt-1">{done.body}</p>
            </div>
          ) : null}
          {finished || !owner ? null : !shown ? (
            <p className="mt-4 text-ink-soft">{`This page was opened many times today. Please come back tomorrow, or email ${SUPPORT_ADDRESS}.`}</p>
          ) : owed ? (
            <>
              <h2 className="mt-6 text-lg font-semibold text-ink">What you get back</h2>
              <p className="mt-2 text-ink" data-refund-amount={owed.refund.cents}>
                {owed.refund.kind === "guarantee"
                  ? owed.parts.length === 1
                    ? `${amount}: your first payment, in full, under the money-back guarantee.`
                    : `${amount}: your first payment and every plan payment since, made within ${REFUND_DAYS} days of it, each in full, under the money-back guarantee.`
                  : `${amount}: the months of your yearly plan that have not started. We keep ${owed.refund.monthsKept === 1 ? "the month that has started" : `the ${owed.refund.monthsKept} months that have started`}, each at the monthly price, and the card fee Stripe kept.`}
              </p>
              <h3 className="mt-4 font-semibold text-ink">{owed.parts.length === 1 ? "The payment refunded" : `The ${owed.parts.length} payments refunded`}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-ink" data-refund-parts={owed.parts.length}>
                {owed.parts.map((part) => (
                  <li key={part.chargeId}>{`${moneyOf(part.cents, owed.currency)}${owed.refund.kind === "guarantee" ? "" : " of your yearly payment"}, paid on ${paidOn(part.paidAtSeconds)}`}</li>
                ))}
              </ul>
              <p className="mt-2 text-ink-soft">It goes back to the card or account you paid with. Your bank may take a few days to show it. No reason is needed.</p>
              <h2 className="mt-6 text-lg font-semibold text-ink">What happens to your store</h2>
              <ul className="mt-2 list-disc space-y-2 pl-6 text-ink-soft">
                {refundEffects({ assistant: Boolean(store.assistantPlan?.active) }).map((line) => <li key={line}>{line}</li>)}
              </ul>
              <form action={`/api/billing/refund?store=${encodeURIComponent(store.sid)}`} method="post" className="mt-8 flex flex-wrap items-center gap-4">
                <input type="hidden" name="review" value={token} />
                <button type="submit" className="btn btn-primary">{`Refund ${amount} and end my plan`}</button>
                <Link href={back} className="btn btn-secondary">Go back without changing anything</Link>
              </form>
            </>
          ) : refusal ? (
            <>
              <h2 className="mt-6 text-lg font-semibold text-ink" data-refund-refused="">{refusal.title}</h2>
              <p className="mt-2 text-ink-soft">{refusal.body}</p>
              <p className="mt-6"><Link href={back} className="btn btn-secondary">Back to the studio</Link></p>
            </>
          ) : null}
          {finished || !owner ? <p className="mt-6"><Link href={back} className="btn btn-secondary">Back to the studio</Link></p> : null}
        </div>
      </main>
    </div>
  );
}
