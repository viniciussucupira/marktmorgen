"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Tier } from "@/lib/plan";

// Static plan content is rendered by the server and passed as children.
// Only these small cycle-dependent slots subscribe to a billing change.
const Yearly = createContext(false);

export function PricingCycle({ saving, children }: { saving: string; children: ReactNode }) {
 const [yearly, setYearly] = useState(false);
 return <Yearly.Provider value={yearly}><div>
  <div className="mb-10 flex flex-col items-center gap-3">
   <div className="seg" role="group" aria-label="How often you pay">
    <button type="button" className="seg-item" aria-pressed={!yearly} onClick={() => setYearly(false)}>Monthly</button>
    <button type="button" className="seg-item" aria-pressed={yearly} onClick={() => setYearly(true)}>
     Yearly <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[0.75rem] font-semibold text-ink">{`two months free, up to ${saving}`}</span>
    </button>
   </div>
   <p className="text-sm text-ink-mute">Every plan either way, and you can switch from your studio whenever you like.</p>
  </div>
  {children}
 </div></Yearly.Provider>;
}

export function CycleText({ month, year }: { month: string; year: string }) {
 return useContext(Yearly) ? year : month;
}

export function CycleLink({ tier, cta, featured }: { tier: Tier; cta: string; featured: boolean }) {
 const yearly = useContext(Yearly);
 // Starting a signup leaves this price comparison; native navigation needs no
 // client router instance in each plan card. Keep the selected URL unchanged.
 return <a href={`/signin?plan=${tier}&billing=${yearly ? "year" : "month"}`}
  className={`btn ${featured ? "btn-primary" : "btn-secondary"} btn-lg btn-block`}>{cta}</a>;
}

export function CycleTerms({ month, year }: { month: string; year: string }) {
 const yearly = useContext(Yearly);
 // Both strings come from the same escaped canonical terms renderer on the server.
 return <dl className="mt-6 divide-y divide-line border-t border-line text-[0.8125rem] leading-relaxed"
  dangerouslySetInnerHTML={{ __html: yearly ? year : month }} />;
}
