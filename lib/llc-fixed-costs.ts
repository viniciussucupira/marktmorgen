/** Owner SR,27 October2026 08:00 Fortaleza: existing mailbox/registered-agent
 * observations below do not establish a Stripe-accepted real business address
 * or US-resident legal representative. ITIN/acceptance-agent and other required
 * costs remain unknown pending SR3, never zero. See docs/stripe-platform-eligibility.md.
 * Historical observations are preserved; no cost review or release is approved here.
 */
/** FX275, owner22 October2026 05:10Fortaleza. Entire LLC costs, never shared.
 * Native-currency amounts are source observations, not approved USD ceilings.
 * No network, contract or operational activation occurs here.
 */
export const LLC_FIXED_COST_ALLOCATION = { marktmorgenBps: 10000, hazelsongBps: 0, decision: "2026-10-22T05:10:00-03:00" } as const;
export const LLC_FIXED_COST_IDS = ["delaware", "california-tax", "california-fee", "registered-agent", "owner-inss", "domains", "tools", "us-mailbox", "eu-gdpr-representative", "eu-dsa-representative", "uk-gdpr-representative"] as const;
export type FixedCostId = typeof LLC_FIXED_COST_IDS[number];
export type FixedCostCeiling = { id: FixedCostId; fullMonthlyUsdCents: number | null; fullAnnualUsdCents: number | null; evidence: string; reserveReviewed: boolean };
/** Public observations checked22 October2026; discounts/free periods never reduce worst-case cost. */
export const FIXED_COST_SOURCE_OBSERVATIONS = {
 delaware: { currency: "USD", annualMinor: 40000, source: "https://corp.delaware.gov/alt-entitytaxinstructions/" },
 californiaTax: { currency: "USD", annualMinor: 80000, source: "https://www.ftb.ca.gov/file/business/types/limited-liability-company/index.html" },
 californiaFee: { currency: "USD", maximumAnnualMinor: 1179000, source: "https://www.ftb.ca.gov/file/business/types/limited-liability-company/index.html" },
 registeredAgent: { currency: "USD", annualMinor: 10000, source: "https://stripe.com/atlas" },
 inss: { currency: "BRL", monthlyMinor: 169511, annualMinor: 2034132, source: "https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal" },
 mailbox: { currency: "USD", monthlyMinor: 5900, twelveMonthlyPaymentsMinor: 70800, annualInvoiceMinor: 58800, source: "https://www.usestable.com/pricing" },
 representatives: { currency: "EUR", smallMonthlyMinorEach: 7900, smallAnnualMinorEach: 85200, largeMonthlyMinorEach: 44000, largeAnnualMinorEach: 475200, excludesVat: true, source: "https://prighter.com/pricing" },
} as const;
/** No complete reviewed contracts, currency ceilings, taxes and reserve policy exist.
 * Keep every required line explicit and unknown, never omit it or substitute zero.
 */
export const CURRENT_LLC_FIXED_COST_CEILINGS: readonly FixedCostCeiling[] = LLC_FIXED_COST_IDS.map(id => ({id,fullMonthlyUsdCents:null,fullAnnualUsdCents:null,evidence:"",reserveReviewed:false}));
const cents = (n: unknown): n is number => typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
export function allocateEntireLlcFixedCosts(lines: readonly FixedCostCeiling[]) {
 if (!Array.isArray(lines) || lines.length !== LLC_FIXED_COST_IDS.length || new Set(lines.map(x=>x?.id)).size !== LLC_FIXED_COST_IDS.length) return null;
 let monthly = 0, annual = 0;
 for (const id of LLC_FIXED_COST_IDS) {
  const line = lines.find(x=>x?.id === id);
  if (!line || !cents(line.fullMonthlyUsdCents) || !cents(line.fullAnnualUsdCents) || line.reserveReviewed !== true || typeof line.evidence !== "string" || !line.evidence.trim()) return null;
  monthly += line.fullMonthlyUsdCents;
  annual += line.fullAnnualUsdCents;
  if (!Number.isSafeInteger(monthly) || !Number.isSafeInteger(annual)) return null;
 }
 return {monthlyUsdCents:monthly,annualUsdCents:annual,marktmorgenBps:LLC_FIXED_COST_ALLOCATION.marktmorgenBps,hazelsongBps:LLC_FIXED_COST_ALLOCATION.hazelsongBps};
}

/** Generated-report section: unknown complete ceilings block a finite minimum.
 * Per-unit most-tax failures also cannot be repaired by a larger customer count.
 */
export function renderLlcFixedCostStatus(): string {
 const costs=allocateEntireLlcFixedCosts(CURRENT_LLC_FIXED_COST_CEILINGS);
 return [
  "## LLC fixed costs — owner decision22 October2026",
  "",
  "Allocation:100% Marktmorgen;0% Hazelsong. Owner22/10/2026 05:10 Fortaleza: \"esqueça Hazelsong\". Historical shared allocations are superseded.",
  "",
  "| Required full LLC cost | Reviewed monthly USD ceiling | Reviewed annual USD ceiling |",
  "| --- | --- | --- |",
  ...CURRENT_LLC_FIXED_COST_CEILINGS.map(line=>`| ${line.id} | ${line.fullMonthlyUsdCents===null?"unknown":line.fullMonthlyUsdCents+" cents"} | ${line.fullAnnualUsdCents===null?"unknown":line.fullAnnualUsdCents+" cents"} |`),
  "",
  costs===null?"Complete fixed-cost total: unknown; rejected, never zero. Minimum paying customer base: not established. Consolidated net margin: not approved.":"Complete fixed-cost ceilings require the separate customer-level and company-base reviews.",
  "MR27Oct requires positive net per unit with existing room; no customer count repairs a zero-profit or losing unit. The full company base remains unestablished while costs are unknown and the commercial review is absent.60%is the actual monthly company target, not a sales gate. No price, visible limit, commission or other launch/tax gate changes.",
  "Native-currency public prices, taxes, eligibility, exchange-rate ceilings and reserve gaps: docs/llc-fixed-costs-2026-10-22.md. A quote or temporary discount is not an approved operating ceiling.",
  "",
 ].join("\n");
}
