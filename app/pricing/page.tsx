import type { Metadata } from "next";
import Link from "next/link";
import { feeWords } from "@/lib/fee-words";
import { SiteNav } from "@/components/site-nav";
import { ToolsCalculator } from "@/components/tools-calculator";
import { SiteFooter } from "@/components/site-footer";
import { PRICING_PLANS, PRICING_GROUPS, PRICING_ADDONS, PRICING_QUESTIONS, PRICING_OPEN } from "@/lib/pricing-page-data";

export const metadata: Metadata = {
 title: "Pricing — Marktmorgen",
 description: "Compare Store, Studio and Scale: monthly and annual prices, usage allowances, optional add-ons and cancellation terms.",
 alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
 return <><SiteNav /><main id="content" tabIndex={-1} className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
  <header className="max-w-3xl">
   <p className="text-sm font-semibold uppercase tracking-widest text-neutral-600">Plans and allowances</p>
   <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">A clear price. Published limits.</h1>
   <p className="mt-6 text-lg text-neutral-700">Your store and your Stripe account. {feeWords().feesRow} All prices below are in USD.</p>
   {!PRICING_OPEN && <p className="mt-5 rounded-xl border border-neutral-300 bg-neutral-50 p-4 font-medium">Paid plans and paid selling are not open yet. You can prepare your store and explore the live demo.</p>}
   <div className="mt-6 flex flex-wrap gap-4"><Link className="rounded-full bg-neutral-950 px-6 py-3 font-semibold text-white" href="/signin">Start your store</Link><Link className="rounded-full border border-neutral-400 px-6 py-3 font-semibold" href="/demo">See the live demo</Link></div>
  </header>
  <section aria-label="Plan prices" className="mt-12 grid gap-6 md:grid-cols-3">
   {PRICING_PLANS.map(plan=><article key={plan.tier} className="rounded-2xl border border-neutral-300 p-6">
    <h2 className="text-2xl font-semibold">{plan.title}</h2><p className="mt-3 text-neutral-700">{plan.purpose}</p>
    <p className="mt-6 text-3xl font-semibold">{plan.monthly}</p><p className="mt-3 text-lg">or {plan.annual}, paid annually</p>
    <p className="mt-4">{plan.share} + Stripe processing</p>
    <Link href="/signin" className="mt-6 inline-block rounded-full border border-neutral-400 px-5 py-3 font-semibold">Start your store<span className="sr-only"> — {plan.title}</span></Link>
   </article>)}
  </section>
  <section aria-labelledby="limits-heading" className="mt-20">
   <h2 id="limits-heading" className="text-3xl font-semibold">What each plan includes</h2>
   <p className="mt-4 max-w-3xl text-neutral-700">Each store has its own allowances. Count ceilings and storage limits apply together; a store can reach one before another. Annual billing does not turn a monthly allowance into a yearly pool.</p>
   {PRICING_GROUPS.map(group=><section key={group.id} aria-labelledby={group.id} className="mt-12">
    <h3 id={group.id} className="text-2xl font-semibold">{group.title}</h3><p className="mt-3 text-neutral-700">{group.period}</p>
    <div className="mt-5 hidden md:block"><table className="w-full table-fixed text-left">
     <caption className="sr-only">{group.title} by plan</caption>
     <thead><tr><th scope="col" className="w-2/5 border-b border-neutral-300 p-3">Allowance</th>{PRICING_PLANS.map(p=><th key={p.tier} scope="col" className="border-b border-neutral-300 p-3">{p.title}</th>)}</tr></thead>
     <tbody>{group.rows.map(row=><tr key={row.key}><th scope="row" className="border-b border-neutral-200 p-3 font-medium">{row.label}{row.note&&<span className="mt-2 block text-sm font-normal text-neutral-600">{row.note}</span>}</th>{PRICING_PLANS.map(p=><td key={p.tier} className="border-b border-neutral-200 p-3 align-top break-words">{row.values[p.tier]}</td>)}</tr>)}</tbody>
    </table></div>
    <dl className="mt-5 divide-y divide-neutral-200 md:hidden">{group.rows.map(row=><div key={row.key} className="py-5"><dt className="font-semibold">{row.label}</dt><dd className="mt-3"><ul className="space-y-2">{PRICING_PLANS.map(p=><li key={p.tier}><span className="font-medium">{p.title}: </span>{row.values[p.tier]}</li>)}</ul>{row.note&&<p className="mt-3 text-sm text-neutral-600">{row.note}</p>}</dd></div>)}</dl>
   </section>)}
   <p className="mt-6 text-neutral-700">Permissions, consent, funding checks and feature availability still apply. <Link className="underline" href="/terms">Read the Terms</Link> and <Link className="underline" href="/platform">explore each feature</Link> for its operating rules.</p>
  </section>
  <section aria-labelledby="addons-heading" className="mt-20"><h2 id="addons-heading" className="text-3xl font-semibold">Optional add-ons, priced separately</h2><div className="mt-6 grid gap-6 md:grid-cols-2">{PRICING_ADDONS.map(addon=><article key={addon.key} className="rounded-2xl border border-neutral-300 p-6"><h3 className="text-xl font-semibold">{addon.title}</h3><p className="mt-3 font-medium">{addon.price}</p><p className="mt-3 text-neutral-700">{addon.body}</p><Link className="mt-4 inline-block underline" href={addon.href}>Read {addon.title} details</Link></article>)}</div></section>
  <ToolsCalculator />
  <section aria-labelledby="compare-heading" className="mt-20 max-w-3xl"><h2 id="compare-heading" className="text-3xl font-semibold">Compare the tools you actually need</h2><p className="mt-4 text-neutral-700">A subscription price alone does not include every processing fee, extra or usage limit. Our comparisons show source dates, conditions and where the other platform goes further.</p><Link className="mt-5 inline-block underline" href="/proof/comparisons">See the platform comparisons</Link></section>
  <section aria-labelledby="faq-heading" className="mt-20 max-w-3xl [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:px-1"><h2 id="faq-heading" className="text-3xl font-semibold">Questions about pricing</h2><div className="mt-6 divide-y divide-neutral-300">{PRICING_QUESTIONS.map(question=><details key={question.q} className="group py-5"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-lg font-medium [&::-webkit-details-marker]:hidden"><span className="min-w-0">{question.q}</span><span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center"><span className="group-open:hidden">+</span><span className="hidden group-open:block">−</span></span></summary><p className="mt-4 leading-relaxed text-neutral-700">{question.a}</p>{question.links?.length ? <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3">{question.links.map(link=><li key={link.href}><Link href={link.href} prefetch={false} className="underline">{link.label}</Link></li>)}</ul> : null}</details>)}</div><p className="mt-6 flex flex-wrap gap-x-5 gap-y-3"><Link href="/terms" className="underline">Terms</Link><Link href="/refunds" className="underline">Refund Policy</Link><Link href="/help" className="underline">Help and support</Link></p></section>
 </main><SiteFooter /></>;
}
