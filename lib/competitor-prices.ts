/** Official USD plan quotes for comparisons and the future browser-only calculator.
 * Static data: no visitor request, account access or provider operation.
 * Monthly equivalents of annual billing are not monthly purchase options.
 */
export type OfficialPriceSource = { label: string; url: string; readOn: string };
export type CompetitorPlanPrice = {
  name: string;
  monthlyCents: number | null;
  annualCents: number | null;
  /** Advertised monthly equivalent under annual billing; not an invoice or monthly purchase. */
  annualEquivalentMonthlyCents?: number;
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
const cfPricing: OfficialPriceSource = { label: "ClickFunnels plan prices and limits", url: "https://support.myclickfunnels.com/docs/clickfunnels-pricing/", readOn: "2026-10-20" };
const cfPayments: OfficialPriceSource = { label: "ClickFunnels Stripe and processor fees", url: "https://support.myclickfunnels.com/docs/setting-up-stripe-as-a-payment-gateway-in-clickfunnels/", readOn: "2026-10-20" };
const circlePricing: OfficialPriceSource = { label: "Circle pricing and plan scope", url: "https://circle.so/pricing", readOn: "2026-10-20" };
const circleFees: OfficialPriceSource = { label: "Circle paywall and Stripe fees", url: "https://help.circle.so/p/payments/paywall-setup/paywall-transaction-fees", readOn: "2026-10-20" };
const kitPricing: OfficialPriceSource = { label: "Kit prices and inclusive commerce fees", url: "https://kit.com/pricing", readOn: "2026-10-20" };
const whopPricing: OfficialPriceSource = { label: "Whop standard payment and payout prices", url: "https://whop.com/network/pricing/", readOn: "2026-10-20" };
const hotmartPricing: OfficialPriceSource = { label: "Hotmart subscription and product pricing", url: "https://hotmart.com/en/pricing", readOn: "2026-10-20" };
const hotmartPolicy: OfficialPriceSource = { label: "Hotmart payment policy updated September 21, 2026", url: "https://hotmart.com/en/legal/payments-policy", readOn: "2026-10-20" };
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
  clickfunnels: {
    name: "ClickFunnels",
    currency: "USD",
    plans: [
      { name: "Launch", monthlyCents: 9700, annualCents: 97000, source: cfPricing, platformFeeBps: 0, feeSource: cfPayments },
      { name: "Scale", monthlyCents: 19700, annualCents: 197000, source: cfPricing, platformFeeBps: 0, feeSource: cfPayments },
      { name: "Optimize", monthlyCents: 29700, annualCents: 297000, source: cfPricing, platformFeeBps: 0, feeSource: cfPayments },
      { name: "Dominate", monthlyCents: null, annualCents: 599700, source: cfPricing, platformFeeBps: 0, feeSource: cfPayments },
    ] satisfies CompetitorPlanPrice[],
    feeScope: "ClickFunnels adds no fee for using Stripe. Processor charges and optional billing, invoicing, tax or Payments AI services can add to your bill; 0% is not free processing.",
    trial: { days: 14, source: { label: "ClickFunnels trial FAQs", url: "https://support.myclickfunnels.com/docs/clickfunnels-faqs/", readOn: "2026-10-20" } },
    split: { source: { label: "ClickFunnels page split-test scope", url: "https://support.myclickfunnels.com/docs/managing-ab-split-testing-in-funnel-steps/", readOn: "2026-10-20" } },
    editor: { source: { label: "ClickFunnels editor and feature overview", url: "https://www.clickfunnels.com/pricing", readOn: "2026-10-20" } },
  },
  circle: {
    name: "Circle",
    currency: "USD",
    plans: [
      { name: "Professional", monthlyCents: null, annualCents: null, annualEquivalentMonthlyCents: 8900, source: circlePricing, platformFeeBps: 200, feeSource: circleFees },
      { name: "Business", monthlyCents: null, annualCents: null, annualEquivalentMonthlyCents: 19900, source: circlePricing, platformFeeBps: 100, feeSource: circleFees },
      { name: "Scale", monthlyCents: null, annualCents: null, annualEquivalentMonthlyCents: 41900, source: circlePricing, platformFeeBps: 100, feeSource: circleFees },
    ] satisfies CompetitorPlanPrice[],
    annualScope: "These are advertised monthly equivalents with annual billing, before taxes. A monthly purchase price and the exact annual invoice have not been verified; neither is calculated from the display. Circle Plus needs a custom quote.",
    feeScope: "Professional: 2%; Business and Scale: 1%; Circle Plus: 0.5%, plus Stripe. The US subscription example adds 2.9% + $0.30 processing and 0.7% Billing. Country, method, currency conversion and optional services can change the total.",
    trial: { days: 14, source: circlePricing },
    live: { source: { label: "Circle native live streams and rooms", url: "https://help.circle.so/p/live-and-events/live-setup/circle-live-overview", readOn: "2026-10-20" } },
    messaging: { source: { label: "Circle direct and group messaging", url: "https://help.circle.so/p/chat/dm/get-to-know-direct-messaging", readOn: "2026-10-20" } },
  },
  kit: {
    name: "Kit",
    currency: "USD",
    plans: [
      { name: "Free", monthlyCents: 0, annualCents: 0, source: kitPricing, platformFeeBps: 60, listedPaymentFeeBps: 350, listedPaymentFixedCents: 30 },
      { name: "Creator", monthlyCents: null, annualCents: 39000, source: kitPricing, platformFeeBps: 60, listedPaymentFeeBps: 350, listedPaymentFixedCents: 30 },
      { name: "Pro", monthlyCents: null, annualCents: null, annualEquivalentMonthlyCents: 6600, source: kitPricing, platformFeeBps: 60, listedPaymentFeeBps: 350, listedPaymentFixedCents: 30 },
    ] satisfies CompetitorPlanPrice[],
    billingScope: "Paid quotes are for 1,000 subscribers. Creator: $390/year. Pro displays a $66/month annual-billing equivalent and a $593 first-year promotion, renewing at the standard rate. The exact standard renewal invoice and paid monthly quotes are not verified here; do not infer them from rounded equivalents or the promotion.",
    feeScope: "The published digital-product and subscription fee is 3.5% + $0.30, including card processing; Kit states its share is 0.6%. Do not add standard card processing a second time.",
    trial: { days: 14, source: kitPricing },
    discovery: { source: { label: "Kit creator recommendations", url: "https://kit.com/features/recommendations", readOn: "2026-10-20" } },
    sponsorship: { source: { label: "Kit newsletter sponsorships", url: "https://kit.com/features/newsletter-sponsorships", readOn: "2026-10-20" } },
  },
  whop: {
    name: "Whop",
    currency: "USD",
    plans: [
      { name: "Standard pay-as-you-go", monthlyCents: 0, annualCents: 0, source: whopPricing, platformFeeBps: null, listedPaymentFeeBps: 270, listedPaymentFixedCents: 30 },
    ] satisfies CompetitorPlanPrice[],
    feeScope: "Domestic cards: 2.7% + $0.30. International cards add 1.5%; currency conversion adds 1%. Optional orchestration adds 0.8%, Billing 0.5%, and tax/remittance 2% when enabled and tax is collected; all three enabled gives 6% + $0.30 before international/FX extras.",
    payoutScope: "Next-day US ACH payout: $2.50; instant bank deposit: 4% + $2.50. Other methods have their own rates. This is not a quote for Marktmorgen or a complete tax exemption.",
    trial: { days: null, source: whopPricing },
    discovery: { source: { label: "Whop Discover directory", url: "https://whop.com/discover/", readOn: "2026-10-20" } },
  },
  hotmart: {
    name: "Hotmart",
    currency: "USD",
    plans: [
      { name: "Standard", monthlyCents: 0, annualCents: 0, source: hotmartPricing, platformFeeBps: 990, listedPaymentFixedCents: 100, feeSource: hotmartPolicy },
    ] satisfies CompetitorPlanPrice[],
    feeScope: "For a USD purchase with USD commission above $15: 9.9% + $1.00. At or below $15: 9.9% + $0.10. Currency mismatches have different rules. These are platform charges, not a verified all-in payment or tax quote.",
    policyScope: "The September 21, 2026 English policy lists a $1.00 fixed USD fee. An older $0.50 sentence remains in the help article; its updated table and Player FAQ state $1.00. Confirm the applicable transaction quote. Do not add a separate legacy Player fee.",
    trial: { days: null, source: hotmartPricing },
    feeDetails: { source: { label: "Hotmart fee bands and Player fee update", url: "https://suportehotmart.zendesk.com/hc/en-us/articles/208298448-What-are-the-fees-charged-by-Hotmart", readOn: "2026-10-20" } },
  },
} as const;
