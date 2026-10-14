export type CreativeRecord = { content: string; source: string; campaign: string; cents: number; created: number };
export type CreativeRow = { content: string; source: string; campaign: string; cents: number; sales: number };
/** Paid records already filtered to this store and currency; never merge reused names across channels or campaigns. */
export function creativeRowsFrom(records: CreativeRecord[], cut: string): CreativeRow[] {
  const by = new Map<string, CreativeRow>();
  for (const record of records) {
    if (!record.content || !Number.isFinite(record.created) || record.created <= 0 || new Date(record.created).toISOString().slice(0, 10) < cut) continue;
    const source = record.source || "direct";
    const key = JSON.stringify([source, record.campaign, record.content]);
    const row = by.get(key) ?? { content: record.content, source, campaign: record.campaign, cents: 0, sales: 0 };
    row.cents += record.cents;
    row.sales += 1;
    by.set(key, row);
  }
  return [...by.values()].sort((a,b) => b.cents - a.cents || b.sales - a.sales || a.content.localeCompare(b.content) || a.source.localeCompare(b.source) || a.campaign.localeCompare(b.campaign));
}
