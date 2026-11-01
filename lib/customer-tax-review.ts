import { mostCorrectTaxesOf } from './receiving-costs';

/** A reviewed ceiling, not proof of legal facts or permission to sell. No real
 * review is supplied here. Legacy callers retain their historical protection. */
export const CUSTOMER_TAX_REVIEW_POLICY = Object.freeze({
  schema: 1, id: 'TX-2026-10-27', basis: 'isolated-full-rights-worst-case',
  unknown: 'deny', currency: 'USD', accountingCurrency: 'BRL',
  allocation: 'whole-scoped-calendar-books-no-tax-credit-for-extra-cost-room',
  maxBooks: 2, maxExchangesPerBook: 1200,
} as const);
export type TaxEvidence = { date: string; source: string; facts: string };
export type TaxContext = { scenario: string; from: string; through: string; months: 1 | 12 };
type Rate = { numerator: number; denominator: number; evidence: TaxEvidence };
export const OTHER_CUSTOMER_TAX_COMPONENTS = Object.freeze(['brazilOther', 'usFederal', 'usStates', 'consumption', 'otherJurisdictions'] as const);
type Component = { status: 'ceiling' | 'not-applicable'; usdCents: number; evidence: TaxEvidence };
export type CustomerTaxReview = {
  schema: 1; policy: 'TX-2026-10-27'; basis: 'isolated-full-rights-worst-case';
  currency: 'USD'; accountingCurrency: 'BRL';
  scope: TaxContext;
  revenueCents: number; refundableCents: number; pretaxCeilingCents: number;
  /** These explicit ceilings are supplied by a dated independent review,
   * never inferred from a live spot price or from each other's reciprocal. */
  fx: { from: string; through: string; usdToBrl: Rate; brlToUsd: Rate };
  books: { year: number; annualProfitCents: number; evidence: TaxEvidence;
    /** Complete incoming operations for this scoped calendar book; required even for []. */
    exchangeCoverage: TaxEvidence;
    exchanges: { at: string; brlCents: number; evidence: TaxEvidence }[] }[];
  /** Sources AND applicable facts are required, including the IRPF regime,
   * incoming-exchange classification and complete jurisdiction coverage. */
  irpf: TaxEvidence; iof: TaxEvidence; coverage: TaxEvidence;
  components: Record<(typeof OTHER_CUSTOMER_TAX_COMPONENTS)[number], Component>;
};

/** Bound and detach data without invoking getters, iterators or JSON hooks.
 * Work limits are internal review limits; oversize books refuse, never truncate. */
function detached(value: unknown): unknown {
  let nodes = 0, bytes = 0;
  const active = new Set<object>();
  function copy(v: unknown, depth: number): unknown {
    if (++nodes > 30_000 || depth > 12) throw Error('review work bound');
    if (v === null || typeof v === 'boolean' || typeof v === 'number') return v;
    if (typeof v === 'string') {
      bytes += v.length;
      if (v.length > 16_384 || bytes > 512_000) throw Error('review bytes');
      return v;
    }
    if (!v || typeof v !== 'object' || active.has(v)) throw Error('review data');
    const array = Array.isArray(v), proto = Object.getPrototypeOf(v);
    if (proto !== (array ? Array.prototype : Object.prototype) && !(proto === null && !array)) throw Error('prototype');
    if (array) {
      const length = Object.getOwnPropertyDescriptor(v, 'length')?.value;
      if (!Number.isSafeInteger(length) || length < 0 || length > 1200) throw Error('array bound');
    }
    active.add(v);
    const keys = Reflect.ownKeys(v);
    if (keys.some(k => typeof k !== 'string')) throw Error('symbol');
    if (keys.length > (array ? 1201 : 32)) throw Error('field bound');
    const own = (key: string) => {
      const d = Object.getOwnPropertyDescriptor(v, key);
      if (!d || !Object.hasOwn(d, 'value')) throw Error('accessor or missing');
      return d.value;
    };
    let out: unknown;
    if (array) {
      const length = own('length');
      if (!Number.isSafeInteger(length) || length < 0 || length > 1200 || keys.length !== length + 1) throw Error('array bound');
      const items: unknown[] = [];
      for (let i = 0; i < length; i++) items.push(copy(own(String(i)), depth + 1));
      out = items;
    } else {
      if (keys.length > 32) throw Error('field bound');
      const record = Object.create(null) as Record<string, unknown>;
      for (const key of keys as string[]) record[key] = copy(own(key), depth + 1);
      out = record;
    }
    active.delete(v);
    return out;
  }
  return copy(value, 0);
}
const cents = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
const day = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  Number.isFinite(Date.parse(s + 'T00:00:00Z')) && new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s;
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
function evidence(v: TaxEvidence): boolean {
  return !!v && typeof v === 'object' && !Array.isArray(v) && day(v.date) && text(v.source) && text(v.facts);
}
function context(v: TaxContext): boolean {
  if (!v || !text(v.scenario) || v.scenario.length > 128 || !day(v.from) || !day(v.through) || (v.months !== 1 && v.months !== 12)) return false;
  // Monthly/yearly anniversary intervals, end exclusive. Refuse month-end
  // overflow instead of silently clipping or accepting a date in a later month.
  const from = new Date(v.from + 'T00:00:00Z'), until = new Date(from);
  until.setUTCMonth(until.getUTCMonth() + v.months);
  return until.getUTCDate() === from.getUTCDate() && until.toISOString().slice(0, 10) === v.through && v.from < v.through;
}
const sameContext = (a: TaxContext, b: TaxContext) => a.scenario === b.scenario && a.from === b.from && a.through === b.through && a.months === b.months;
function rate(v: Rate): boolean { return !!v && cents(v.numerator) && v.numerator > 0 && cents(v.denominator) && v.denominator > 0 && evidence(v.evidence); }
const rounded = (amount: bigint, r: Rate) => (amount * BigInt(r.numerator) + BigInt(r.denominator) - BigInt(1)) / BigInt(r.denominator);

/** Preserve presence: explicitly undefined/null, inherited or computed policy
 * data must never turn into the legacy path while copying a scenario. */
export function customerTaxReviewFields(value: object): { present: boolean; taxReview?: unknown; taxContext?: unknown } {
  try {
    const review = Object.getOwnPropertyDescriptor(value, 'taxReview');
    const context = Object.getOwnPropertyDescriptor(value, 'taxContext');
    if (!review && !context && !('taxReview' in value) && !('taxContext' in value)) return { present: false };
    return { present: true,
      taxReview: review && Object.hasOwn(review, 'value') ? review.value : undefined,
      taxContext: context && Object.hasOwn(context, 'value') ? context.value : undefined };
  } catch { return { present: true }; }
}

/** Reuse the annual BRL calculator, reserve whole scoped books (no guessed
 * allocation or repeated annual IRPF), then convert with explicit reviewed FX
 * ceilings. This validates supplied evidence; it cannot certify its truth. */
export function customerTaxCeiling(value: unknown, suppliedContext: unknown,
  amounts: { revenueCents: number; refundableCents: number; pretaxCents: bigint }): number | null {
  try {
    const r = detached(value) as CustomerTaxReview, c = detached(suppliedContext) as TaxContext;
    if (!r || !c || r.schema !== 1 || r.policy !== CUSTOMER_TAX_REVIEW_POLICY.id || r.basis !== CUSTOMER_TAX_REVIEW_POLICY.basis ||
        r.currency !== 'USD' || r.accountingCurrency !== 'BRL' ||
        !context(c) || !context(r.scope) || !sameContext(c, r.scope) ||
        r.revenueCents !== amounts.revenueCents || r.refundableCents !== amounts.refundableCents ||
        !cents(r.pretaxCeilingCents) || BigInt(r.pretaxCeilingCents) < amounts.pretaxCents ||
        !evidence(r.irpf) || !evidence(r.iof) || !evidence(r.coverage)) return null;
    const fx = r.fx;
    if (!fx || !day(fx.from) || !day(fx.through) || fx.from > c.from || fx.through < c.through || !rate(fx.usdToBrl) || !rate(fx.brlToUsd)) return null;
    // Mutually impossible directional ceilings would understate the reserve.
    if (BigInt(fx.usdToBrl.numerator) * BigInt(fx.brlToUsd.numerator) < BigInt(fx.usdToBrl.denominator) * BigInt(fx.brlToUsd.denominator)) return null;
    const first = Number(c.from.slice(0, 4)), last = new Date(Date.parse(c.through + 'T00:00:00Z') - 1).getUTCFullYear();
    if (!Array.isArray(r.books) || r.books.length !== last - first + 1 || r.books.length > 2) return null;
    let totalBrl = BigInt(0), profitBrl = BigInt(0);
    for (let i = 0; i < r.books.length; i++) {
      const book = r.books[i];
      if (!book || book.year !== first + i || !cents(book.annualProfitCents) || !evidence(book.evidence) || !evidence(book.exchangeCoverage) || !Array.isArray(book.exchanges)) return null;
      const entries: number[] = [];
      for (const entry of book.exchanges) {
        if (!entry || !day(entry.at) || Number(entry.at.slice(0, 4)) !== book.year || entry.at < c.from || entry.at >= c.through || !cents(entry.brlCents) || !evidence(entry.evidence)) return null;
        entries.push(entry.brlCents);
      }
      const tax = mostCorrectTaxesOf({ currency: 'BRL', annualProfitCents: book.annualProfitCents, incomingExchangeCents: entries });
      if (!tax) return null;
      totalBrl += BigInt(tax.totalTaxCents);
      profitBrl += BigInt(book.annualProfitCents);
    }
    // A lower annual base cannot subsidize this isolated full-use scenario.
    if (profitBrl < rounded(BigInt(r.pretaxCeilingCents), fx.usdToBrl)) return null;
    let total = rounded(totalBrl, fx.brlToUsd);
    if (!r.components || Object.keys(r.components).length !== OTHER_CUSTOMER_TAX_COMPONENTS.length) return null;
    for (const key of OTHER_CUSTOMER_TAX_COMPONENTS) {
      const part = r.components[key];
      if (!part || !cents(part.usdCents) || !evidence(part.evidence) ||
          (part.status !== 'ceiling' && part.status !== 'not-applicable') ||
          (part.status === 'not-applicable' ? part.usdCents !== 0 : part.usdCents === 0)) return null;
      total += BigInt(part.usdCents);
    }
    return total > BigInt(Number.MAX_SAFE_INTEGER) ? null : Number(total);
  } catch { return null; }
}

/** Bind a commercial map key to the scenario's explicit fiscal period. */
export function customerTaxScenarioMatches(value: object, scenario: string): boolean {
  const fields = customerTaxReviewFields(value);
  if (!fields.present) return true;
  try {
    const c = detached(fields.taxContext) as TaxContext;
    return !!c && context(c) && c.scenario === scenario && (!scenario.endsWith('_full') || c.months === (scenario.includes('_year_') ? 12 : 1));
  } catch { return false; }
}
