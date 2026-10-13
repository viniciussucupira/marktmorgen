import { Children, isValidElement } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";

/** An anchor for a section, from its title: "3. Selling through a store" → "selling-through-a-store". */
function sectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refunds", label: "Refund Policy" },
];

/**
 * A legal page, laid out so it can actually be read.
 *
 * Three things decide whether anybody gets through a document this long: a
 * column narrow enough to follow, an index that stays where you left it, and
 * a way to see the whole thing at once. On a wide screen the index sits in
 * its own column and follows the scroll; on a phone it folds into a summary
 * that opens, because a screenful of contents before the first sentence is
 * how a phone reader decides the page is not worth it.
 */
export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  // The sections, read from the page itself, so the index can never list one
  // that is not there.
  const sections = Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type === LegalSection)
    .map((child) => (child as React.ReactElement<{ title: string }>).props.title);

  const index =
    sections.length > 2 ? (
      <ol className="grid gap-0.5">
        {sections.map((t) => (
          <li key={t}>
            <a href={`#${sectionId(t)}`} className="toc-link">
              {t}
            </a>
          </li>
        ))}
      </ol>
    ) : null;

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <SiteNav />

      <main id="content" className="flex-1">
        <section className="surface-dawn border-b border-line">
          <div className="container-page py-14 sm:py-20">
            <p className="eyebrow">The small print, in plain words</p>
            <h1 className="t-h1 balance mt-4 max-w-3xl">{title}</h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.9375rem] text-ink-mute">
              <span className="flex items-center gap-2">
                <Icon name="calendar" size={16} />
                Effective August 15, 2026
              </span>
              {lastUpdated ? (
                <span className="flex items-center gap-2">
                  <Icon name="clock" size={16} />
                  {`Last updated ${lastUpdated}`}
                </span>
              ) : null}
              {sections.length > 0 ? (
                <span className="flex items-center gap-2">
                  <Icon name="list" size={16} />
                  {`${sections.length} sections`}
                </span>
              ) : null}
            </div>
            <nav aria-label="Legal pages" className="mt-8 flex flex-wrap gap-2">
              {LEGAL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`chip transition-colors hover:border-line-strong hover:text-ink ${
                    l.label === title ? "chip-brand" : ""
                  }`}
                  aria-current={l.label === title ? "page" : undefined}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <div className="container-page py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
            {index ? (
              <>
                {/* Wide screens: the index keeps its place while the page moves. */}
                <nav
                  aria-labelledby="legal-contents"
                  className="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto"
                >
                  <p
                    id="legal-contents"
                    className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-mute"
                  >
                    On this page
                  </p>
                  {index}
                </nav>

                {/* Phones: folded away until it is asked for. */}
                <details className="group card-flat px-5 py-4 lg:hidden">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    On this page
                    <Icon
                      name="chevron-down"
                      size={18}
                      className="shrink-0 text-violet-deep transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <div className="mt-4">{index}</div>
                </details>
              </>
            ) : (
              <div className="hidden lg:block" />
            )}

            <div>
              <div className="legal-body max-w-[46rem] space-y-10 text-[1.0625rem] leading-[1.8] text-ink-soft">
                {children}
              </div>

              <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-8">
                <Link href="/" className="btn btn-secondary">
                  Back to the home page
                </Link>
                <Link href="/help" className="link-arrow">
                  Questions? The help centre
                  <Icon name="arrow-right" size={16} className="arrow" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={sectionId(title)} className="scroll-mt-24 space-y-4">
      <h2 className="text-[1.3rem] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
      {children}
    </section>
  );
}
