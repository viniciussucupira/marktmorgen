import { csvLine } from "@/lib/csv";
import { validCrmDate, type Deal, type Stage } from "@/lib/crm-rules";

export type DealOrder = "current" | "due" | "value" | "oldest";
export function dealOrder(raw: unknown): DealOrder {
  return raw === "due" || raw === "value" || raw === "oldest" ? raw : "current";
}
const changed = (deal: Deal) => Number.isSafeInteger(deal.updatedAt) && deal.updatedAt > 0 ? deal.updatedAt : Number.MAX_SAFE_INTEGER;
/** Sort a copy; missing dates come last and equal priorities have stable identities. */
export function orderDeals(deals: readonly Deal[], order: DealOrder): Deal[] {
  const copy = [...deals];
  if (order === "current") return copy;
  return copy.sort((a, b) => {
    const primary = order === "value" ? b.cents - a.cents : order === "oldest" ? changed(a) - changed(b) :
      validCrmDate(a.dueDate) ? (validCrmDate(b.dueDate) ? a.dueDate.localeCompare(b.dueDate) : -1) : (validCrmDate(b.dueDate) ? 1 : 0);
    return primary || changed(a) - changed(b) || a.id.localeCompare(b.id);
  });
}
type WorklistContext = { today: string; currency: string; query: string; responsible: string; filter: string; order: DealOrder };
/** Only the loaded, selected records supplied by the authorized board, in its stage order.
 * Stored opportunity amounts are estimates, not checkout receipts or confirmed revenue.
 */
export function dealWorklistCsv(deals: readonly Deal[], stages: readonly Stage[], context: WorklistContext): string {
  const rows = [csvLine(["deal_id", "title", "contact_email", "stage", "stage_kind", "stored_value_cents", "currency", "next_action", "due_date_utc", "responsible", "note", "calendar_day_utc", "search", "responsible_filter", "action_filter", "order", "scope", "value_definition"])];
  for (const stage of stages) for (const deal of deals.filter(row => row.stage === stage.id)) {
    rows.push(csvLine([deal.id, deal.title, deal.email, stage.name, stage.kind, deal.cents, context.currency.toUpperCase(), deal.nextAction ?? "", deal.dueDate ?? "", deal.assignee ?? "", deal.note, context.today, context.query, context.responsible, context.filter, context.order, "loaded_selected_deals", "Stored opportunity estimate; not confirmed revenue"]));
  }
  return rows.join("\r\n") + "\r\n";
}
