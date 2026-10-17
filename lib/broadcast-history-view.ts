/** Filters the confirmed, bounded history already loaded into the studio. */
export const HISTORY_STATUSES = ["all", "scheduled", "sending", "waiting", "sent", "failed", "cancelled"] as const;
export type HistoryStatus = typeof HISTORY_STATUSES[number];

export function campaignHistoryView<T extends { subject: string; status: string }>(
  campaigns: readonly T[], query: string, status: HistoryStatus,
): { rows: T[]; counts: Record<HistoryStatus, number> } {
  const counts: Record<HistoryStatus, number> = { all: campaigns.length, scheduled: 0, sending: 0, waiting: 0, sent: 0, failed: 0, cancelled: 0 };
  for (const campaign of campaigns) {
    if (campaign.status !== "all" && Object.hasOwn(counts, campaign.status)) counts[campaign.status as HistoryStatus] += 1;
  }
  const needle = query.trim().toLowerCase();
  return {
    rows: campaigns.filter(campaign => (status === "all" || campaign.status === status) && campaign.subject.toLowerCase().includes(needle)),
    counts,
  };
}
