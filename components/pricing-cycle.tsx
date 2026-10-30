import type { ReactNode } from "react";
import type { Tier } from "@/lib/plan";
import { PricingCycleControls } from "@/components/pricing-cycle-controls";

// Keep the cards and their native disclosures outside a client hydration
// boundary. Only the two billing buttons need React event handlers.
export function PricingCycle({ saving, children }: { saving: string; children: ReactNode }) {
 return <div data-pricing-cycle>
  <PricingCycleControls saving={saving} />
  {children}
 </div>;
}

export function CycleText({ month, year }: { month: string; year: string }) {
 return <span data-cycle-text data-month={month} data-year={year}>{month}</span>;
}

export function CycleLink({ tier, cta, featured }: { tier: Tier; cta: string; featured: boolean }) {
 return <a data-cycle-link data-tier={tier} href={`/signin?plan=${tier}&billing=month`}
  className={`btn ${featured ? "btn-primary" : "btn-secondary"} btn-lg btn-block`}>{cta}</a>;
}

export function CycleTerms({ month, year }: { month: string; year: string }) {
 // Both fragments are produced by the same escaped canonical server renderer.
 // Templates are inert, never visible or exposed to assistive technology.
 return <>
  <dl data-cycle-terms className="mt-6 divide-y divide-line border-t border-line text-[0.8125rem] leading-relaxed"
   dangerouslySetInnerHTML={{ __html: month }} />
  <template data-cycle-terms-month dangerouslySetInnerHTML={{ __html: month }} />
  <template data-cycle-terms-year dangerouslySetInnerHTML={{ __html: year }} />
 </>;
}
