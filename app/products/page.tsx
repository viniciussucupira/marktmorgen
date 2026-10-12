import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const title = "Our products — Solrenning";
const description = "Meet Hazelsong and the Marktmorgen creator store. Find the right tool for your business.";
export const metadata: Metadata = {
  title, description,
  alternates: { canonical: "/products" },
  openGraph: { title, description, url: "/products", images: [] },
  twitter: { card: "summary", title, description, images: [] },
};

const groups = [
  {
    title: "Build your business",
    description: "Sell what you create and share what your customers say.",
    products: [
      { name: "Marktmorgen", initials: "M", category: "Your creator store", href: "https://marktmorgen.com/", domain: "marktmorgen.com", color: "#643caf", background: "#f2edff", description: "Create a store for digital products, courses, calls, and memberships. Buyers pay into your own Stripe account.", action: "Explore the creator store" },
      { name: "Hazelsong", initials: "H", category: "Customer testimonials", href: "https://hazelsong.com/", domain: "hazelsong.com", color: "#486139", background: "#f0f5e9", description: "Collect testimonials with permission, review them, and display the ones you approve on your website.", action: "Explore Hazelsong" },
    ],
  },
];

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <SiteNav />
      <main id="content" className="flex-1">
        <section className="surface-dawn border-b border-line">
          <div className="container-page py-14 sm:py-20">
            <p className="eyebrow">The Solrenning family</p>
            <h1 className="t-h1 mt-4 max-w-3xl">Different tools.<br /><span className="serif font-normal text-violet-deep">One independent studio.</span></h1>
            <p className="t-lead mt-6 max-w-2xl text-ink-soft">Tools for selling your work and sharing what your customers say. Find the one that fits what you need today.</p>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-ink-soft">Solrenning is an independent software studio. Marktmorgen, the creator store, is one of its two products.</p>
          </div>
        </section>
        <div className="container-page space-y-14 py-12 sm:py-16">
          {groups.map((group, index) => (
            <section key={group.title} id="business" className="scroll-mt-28" aria-labelledby={`group-${index}`}>
              <h2 id={`group-${index}`} className="text-2xl font-semibold tracking-tight">{group.title}</h2>
              <p className="mt-2 text-ink-soft">{group.description}</p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {group.products.map(product => (
                  <article key={product.name} className="flex flex-col rounded-3xl border border-line bg-white p-6 sm:p-7">
                    <div aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold" style={{ color: product.color, background: product.background }}>{product.initials}</div>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-soft">{product.category}</p>
                    <h3 className="mt-2 text-2xl font-semibold">{product.name}</h3>
                    <p className="mt-3 flex-1 text-base leading-7 text-ink-soft">{product.description}</p>
                    <a href={product.href} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm font-semibold text-violet-deep underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">{product.action}<span aria-hidden="true">↗</span></a>
                    <p className="mt-1 text-xs text-ink-soft">{product.domain}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
          <aside className="rounded-2xl border border-line bg-white p-6 sm:p-8" aria-labelledby="separate-products">
            <h2 id="separate-products" className="text-lg font-semibold">Same studio. Separate products.</h2>
            <p className="mt-3 max-w-3xl leading-7 text-ink-soft">Each product has its own pricing, access, and terms. A subscription to one does not include the others. Visit the product&apos;s own site for its current plans and support options.</p>
            <a href="mailto:support@marktmorgen.com" className="mt-4 inline-flex min-h-11 items-center font-semibold text-violet-deep underline underline-offset-4">Contact our studio</a>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
