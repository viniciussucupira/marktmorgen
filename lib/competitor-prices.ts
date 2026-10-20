/** Official USD plan quotes for comparisons and the future browser-only calculator.
 * Static data: no visitor request, account access or provider operation.
 * Monthly equivalents of annual billing are not monthly purchase options.
 */
export type OfficialPriceSource = { label: string; url: string; readOn: string };
export type CompetitorPlanPrice = {
  name: string;
  monthlyCents: number;
  annualCents: number | null;
  source: OfficialPriceSource;
  platformFeeBps: number | null;
  feeSource?: OfficialPriceSource;
  listedPaymentFeeBps?: number;
  listedPaymentFixedCents?: number;
  externalProviderFeeBps?: number;
  usCardProcessingBps?: number;
  usCardProcessingFixedCents?: number;
};
const kajabiPricing: OfficialPriceSource = {
  label: "Kajabi pricing and payment fees",
  url: "https://www.kajabi.com/pricing",
  readOn: "2026-10-19",
};
const skoolPricing: OfficialPriceSource = { label: "Skool plans", url: "https://www.skool.com/pricing", readOn: "2026-10-20" };
const skoolFees: OfficialPriceSource = { label: "Skool payment fees, payouts and Growth Boost", url: "https://help.skool.com/article/86-subscriptions-faq", readOn: "2026-10-20" };
export const COMPETITOR_PRICES = {
  kajabi: {
    name: "Kajabi",
    currency: "USD",
    plans: [
      { name: "Basic", monthlyCents: 17900, annualCents: 171600, source: kajabiPricing, platformFeeBps: 0, externalProviderFeeBps: 200, usCardProcessingBps: 290, usCardProcessingFixedCents: 30 },
      { name: "Growth", monthlyCents: 24900, annualCents: 238800, source: kajabiPricing, platformFeeBps: 0, externalProviderFeeBps: 100, usCardProcessingBps: 280, usCardProcessingFixedCents: 30 },
      { name: "Pro", monthlyCents: 49900, annualCents: 478800, source: kajabiPricing, platformFeeBps: 0, externalProviderFeeBps: 50, usCardProcessingBps: 270, usCardProcessingFixedCents: 30 },
    ] satisfies CompetitorPlanPrice[],
    feeScope: "Kajabi Payments has no platform revenue share. Card rates shown are for US entities. A third-party provider adds 2%, 1% or 0.5% where Kajabi Payments is available; PayPal is excluded. Processing and taxes are separate.",
    trial: { days: 14, source: { label: "Kajabi standard trial and its limits", url: "https://help.kajabi.com/en/articles/17174347-kajabi-trial-information", readOn: "2026-10-19" } },
    brandedApp: { monthlyAddOnCents: 19900, includedOn: "Pro", source: { label: "Kajabi branded app scope and pricing", url: "https://help.kajabi.com/en/articles/17175583-kajabi-branded-app-faqs", readOn: "2026-10-19" } },
  },
  skool: {
    name: "Skool",
    currency: "USD",
    plans: [
      { name: "Hobby", monthlyCents: 900, annualCents: null, source: skoolPricing, feeSource: skoolFees, platformFeeBps: null, listedPaymentFeeBps: 1000, listedPaymentFixedCents: 30 },
      { name: "Pro", monthlyCents: 9900, annualCents: null, source: skoolPricing, feeSource: skoolFees, platformFeeBps: null, listedPaymentFeeBps: 290, listedPaymentFixedCents: 30 },
    ] satisfies CompetitorPlanPrice[],
    feeScope: "Hobby: 10% + $0.30 per transaction. Pro: 2.9% + $0.30 up to $899; 3.9% + $0.30 above $900. The FAQ does not clearly state the exact $900 boundary. Confirm that quote before calculating it.",
    annualScope: "Yearly billing is advertised with two months free; no annual charge is assumed from that headline. Check Skool's current annual quote.",
    trial: { days: 14, source: { label: "Skool subscription and cancellation policy", url: "https://help.skool.com/article/227-payment-terms-and-policy", readOn: "2026-10-20" } },
    discovery: { source: { label: "Skool Discovery eligibility", url: "https://help.skool.com/article/153-discovery-faqs", readOn: "2026-10-20" } },
    live: { source: { label: "Skool native live calls", url: "https://help.skool.com/article/210-how-to-go-live-on-skool", readOn: "2026-10-20" } },
    webinar: { source: { label: "Skool webinars on Pro", url: "https://help.skool.com/article/214-how-to-create-webinar", readOn: "2026-10-20" } },
  },
} as const;
