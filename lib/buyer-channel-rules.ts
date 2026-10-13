import type { Sale } from "@/lib/stats";

export type BuyerChannelRow = {
  source: string;
  buyers: number;
  repeatBuyers: number;
  orders: number;
  cents: number;
  /** Buyers with a full 30 days observed, and those who bought again within them. */
  eligible30: number;
  repeated30: number;
};
export type BuyerChannelWindow = { rows: BuyerChannelRow[]; unidentifiedOrders: number };
export const COHORT_AGES = [7, 30, 60, 90] as const;
export type CohortAge = (typeof COHORT_AGES)[number];
export type WeeklyBuyerCohort = {
  /** Monday of the first observed purchase week, in UTC. */
  week: string;
  buyers: number;
  observations: Record<CohortAge, { eligible: number; repeated: number }>;
};
export type WeeklyBuyerCohorts = { rows: WeeklyBuyerCohort[]; unidentifiedOrders: number; asOf: string };
export type BuyerChannels = Record<"d7" | "d30" | "d90", BuyerChannelWindow> & { historyPartial: boolean; weekly?: WeeklyBuyerCohorts };

const DAY = 86_400_000;
const date = (at: number) => new Date(at).toISOString().slice(0, 10);
const emailOf = (sale: Sale): string => {
  const details = sale.row.customer_details as { email?: unknown } | undefined;
  const email = sale.upsell ? sale.row.receipt_email : details?.email;
  return typeof email === "string" ? email.trim().toLowerCase() : "";
};

/** First purchase observed in the sales read, not a claim to know a buyer's lifetime. No identities leave this function. */
export function buyerChannelsFrom(sales: Sale[], currency: string, now: number, historyPartial = false): BuyerChannels {
  const seen = new Set<string>();
  const own = sales.filter((sale) => {
    const id = typeof sale.row.id === "string" ? sale.row.id : "";
    if (id && seen.has(id)) return false;
    if (id) seen.add(id);
    return sale.currency === currency && sale.created <= now &&
    Number.isFinite(sale.created) && sale.created > 0 &&
    (sale.row.metadata as Record<string, string> | undefined)?.kind !== "tip";
  });
  const people = new Map<string, Sale[]>();
  for (const sale of own) {
    const email = emailOf(sale);
    if (!email) continue;
    const orders = people.get(email) ?? [];
    orders.push(sale);
    people.set(email, orders);
  }
  const window = (days: number): BuyerChannelWindow => {
    const cut = date(now - (days - 1) * DAY);
    const rows = new Map<string, BuyerChannelRow>();
    for (const payments of people.values()) {
      const orders = payments.filter((s) => !s.upsell).sort((a, b) => a.created - b.created || String(a.row.id ?? "").localeCompare(String(b.row.id ?? "")));
      const first = orders[0];
      if (!first || date(first.created) < cut) continue;
      const source = first.first || first.source || "direct";
      const row = rows.get(source) ?? { source, buyers: 0, repeatBuyers: 0, orders: 0, cents: 0, eligible30: 0, repeated30: 0 };
      row.buyers += 1;
      row.orders += orders.length;
      if (orders.length > 1) row.repeatBuyers += 1;
      row.cents += payments.filter((s) => s.created >= first.created).reduce((sum, s) => sum + s.cents, 0);
      if (now - first.created >= 30 * DAY) {
        row.eligible30 += 1;
        if (orders.slice(1).some((s) => s.created <= first.created + 30 * DAY)) row.repeated30 += 1;
      }
      rows.set(source, row);
    }
    return {
      rows: [...rows.values()].sort((a, b) => b.cents - a.cents || b.buyers - a.buyers || a.source.localeCompare(b.source)),
      unidentifiedOrders: own.filter((s) => !s.upsell && !emailOf(s) && date(s.created) >= cut).length,
    };
  };
  const weeks = new Map<string, WeeklyBuyerCohort>();
  for (const payments of people.values()) {
    const orders = payments.filter((s) => !s.upsell).sort((a, b) => a.created - b.created || String(a.row.id ?? "").localeCompare(String(b.row.id ?? "")));
    const first = orders[0];
    if (!first || first.created < now - 180 * DAY) continue;
    const monday = new Date(first.created);
    monday.setUTCHours(0, 0, 0, 0);
    monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
    const week = date(monday.getTime());
    const row = weeks.get(week) ?? { week, buyers: 0, observations: { 7: { eligible: 0, repeated: 0 }, 30: { eligible: 0, repeated: 0 }, 60: { eligible: 0, repeated: 0 }, 90: { eligible: 0, repeated: 0 } } };
    row.buyers += 1;
    for (const age of COHORT_AGES) {
      if (now - first.created < age * DAY) continue;
      row.observations[age].eligible += 1;
      if (orders.slice(1).some((sale) => sale.created <= first.created + age * DAY)) row.observations[age].repeated += 1;
    }
    weeks.set(week, row);
  }
  const weekly: WeeklyBuyerCohorts = {
    rows: [...weeks.values()].sort((a, b) => b.week.localeCompare(a.week)),
    unidentifiedOrders: own.filter((s) => !s.upsell && !emailOf(s) && s.created >= now - 180 * DAY).length,
    asOf: new Date(now).toISOString(),
  };
  return { d7: window(7), d30: window(30), d90: window(90), historyPartial, weekly };
}
