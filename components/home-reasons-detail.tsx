import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/icons";
import { FeatureVisual } from "@/components/feature-visuals";
import { HOME_REASONS as REASONS, HOME_NOT_YET as NOT_YET } from "@/lib/home-reasons";

/** Full facts and examples moved intact from the home to the existing feature page. */
export function HomeReasonsDetail() {
  return (
        <section className="section" aria-labelledby="home-reasons-heading">
          <div className="container-page">
            <div className="max-w-2xl">
              <h2 id="home-reasons-heading" className="t-h2 balance scroll-mt-32" tabIndex={-1}>Built for the people who use it</h2>
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
  );
}
