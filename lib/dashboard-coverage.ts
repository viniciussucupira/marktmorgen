import type { AllTimeSales, RangeKey, StatsData } from "@/lib/stats";
import { paidFiguresComplete } from "@/lib/paid-coverage";

/** All-time is a separate provider reading; recent coverage cannot stand in for it. */
export function dashboardPaidComplete(data: Pick<StatsData, "sales" | "partial">, range: RangeKey, allSales: AllTimeSales | null): boolean {
  return range === "all" ? allSales !== null && !allSales.partial : paidFiguresComplete(data);
}

/** Unknown paid amounts cannot decide which products appear or their order. */
export function dashboardProducts(data: Pick<StatsData, "products" | "sales" | "partial">, range: RangeKey, allSales: AllTimeSales | null) {
  const complete = dashboardPaidComplete(data, range, allSales);
  const rows = data.products.map(product => {
    const row = product[range];
    const paid = range === "all" ? allSales?.byProduct[product.id] ?? { sales: 0, cents: 0 } : row;
    return { id: product.id, title: product.title, views: row.views, checkouts: row.checkouts, sales: complete ? paid.sales : null, cents: complete ? paid.cents : null };
  }).sort((a, b) => complete ? (b.cents! - a.cents! || b.sales! - a.sales! || b.checkouts - a.checkouts) : (b.views - a.views || b.checkouts - a.checkouts));
  const active = rows.filter(row => row.views > 0 || row.checkouts > 0 || (row.sales ?? 0) > 0);
  return active.length ? active : rows;
}
