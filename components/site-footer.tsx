import Link from "next/link";
import { Logo } from "@/components/logo";

const SUPPORT = "mailto:support@nimbuslabsai.com";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Every feature", href: "/platform" },
      { label: "Live demo store", href: "/demo" },
      { label: "Courses", href: "/platform/courses" },
      { label: "Memberships", href: "/platform/memberships" },
      { label: "Paid calls", href: "/platform/calls" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Creators",
    links: [
      { label: "Coaches", href: "/for/coaches" },
      { label: "Cooks", href: "/for/cooks" },
      { label: "Fitness", href: "/for/fitness" },
      { label: "Designers", href: "/for/designers" },
      { label: "Tell us what you sell", href: "/creators" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "Nimbus and Stan", href: "/proof/compare" },
      { label: "Feature by feature", href: "/proof/everything" },
      { label: "Nimbus and Gumroad", href: "/proof/gumroad" },
      { label: "Nimbus and Beacons", href: "/proof/beacons" },
      { label: "Speed test", href: "/proof/speed" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help centre", href: "/help" },
      { label: "Blog", href: "/blog" },
      { label: "Questions", href: "/proof/questions" },
      { label: "What we never do", href: "/proof/promises" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our mission", href: "/mission" },
      { label: "Write to us", href: SUPPORT },
      { label: "Sign in", href: "/signin" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Refunds", href: "/refunds" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="surface-night on-dark overflow-hidden">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[15rem_1fr] lg:gap-16 lg:py-20">
        <div className="max-w-xs">
          <Link href="/" className="inline-block rounded-[10px]" aria-label="Nimbus Labs, home">
            <Logo tone="light" />
          </Link>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-white/70">
            A store page for creators, built in public by Vinicius Sucupira. Your
            buyers pay into your own Stripe account.
          </p>
          <Link href="/signin" className="btn btn-light btn-sm mt-6">
            Start your store
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-6">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-white/70">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("mailto:") ? (
                      <a href={link.href} className="text-white/80 transition-colors hover:text-white">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-white/80 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="container-page border-t border-white/12 py-7 text-[0.8125rem] leading-relaxed text-white/70">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-mint-brand" aria-hidden="true" />
            0% of your sales
          </li>
          <li>Payments processed by Stripe on each creator&apos;s own account</li>
          <li>
            Written support, in English, from{" "}
            <a href={SUPPORT} className="font-medium text-white underline underline-offset-4">
              support@nimbuslabsai.com
            </a>
          </li>
        </ul>
        <div className="mt-4 flex flex-col gap-1.5 border-t border-white/10 pt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <p>
            © 2026 Nimbus Labs — an independent software studio run by Vinicius Sucupira.
          </p>
          <p className="sm:max-w-md sm:text-right">
            Photographs from Unsplash, used for illustration. The people in them are not Nimbus Labs
            customers, and nothing on this site is a testimonial.
          </p>
        </div>
      </div>
    </footer>
  );
}
