/** Official USD plan quotes for comparisons and the future browser-only calculator.
 * Static data: no visitor request, account access or provider operation.
 * Monthly equivalents of annual billing are not monthly purchase options.
 */
export type OfficialPriceSource = { label: string; url: string; readOn: string };
export type CompetitorPlanPrice = {
  name: string;
  monthlyCents: number;
  annualCents: number;
  source: OfficialPriceSource;
  platformFeeBps: number;
  externalProviderFeeBps: number;
  usCardProcessingBps: number;
  usCardProcessingFixedCents: number;
};
const kajabiPricing: OfficialPriceSource = {
  label: "Kajabi pricing and payment fees",
  url: "https://www.kajabi.com/pricing",
  readOn: "2026-10-19",
};
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
} as const;
