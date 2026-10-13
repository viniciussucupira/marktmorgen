import type { Deal } from "@/lib/crm-rules";
/** Filters only records already authorized for the selected store. */
export function filterDeals(deals: readonly Deal[], query: string, assignee: string | null): Deal[] {
  const text = query.trim().slice(0, 80).toLowerCase();
  return deals.filter(deal => (assignee === null || (deal.assignee ?? "").toLowerCase() === assignee.toLowerCase()) && (!text || [deal.title, deal.email, deal.nextAction ?? "", deal.note].some(value => value.toLowerCase().includes(text))));
}
