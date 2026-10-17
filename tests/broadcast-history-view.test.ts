import { campaignHistoryView, HISTORY_STATUSES } from "@/lib/broadcast-history-view";
import { done, is, part } from "./check";
const campaigns = [
  { id: "waiting", subject: "Welcome offer", status: "waiting", note: "Recipient list unavailable" },
  { id: "sent", subject: "WELCOME offer", status: "sent", note: "" },
  { id: "scheduled", subject: "Tomorrow launch", status: "scheduled", note: "" },
  { id: "sending", subject: "Launch update", status: "sending", note: "" },
  { id: "failed", subject: "Welcome reminder", status: "failed", note: "Service refused" },
  { id: "cancelled", subject: "Old offer", status: "cancelled", note: "" },
];
const before = JSON.stringify(campaigns);
part("Find a paused campaign without hiding its explanation");
const waiting = campaignHistoryView(campaigns, "  WELCOME  ", "waiting");
is("subject search combines with waiting status", waiting.rows.map(c => c.id), ["waiting"]);
is("row retains its diagnostic note", waiting.rows[0].note, "Recipient list unavailable");
is("search is case insensitive and keeps saved ordering", campaignHistoryView(campaigns, "welcome", "all").rows.map(c => c.id), ["waiting", "sent", "failed"]);
is("different substring works", campaignHistoryView(campaigns, "launch", "all").rows.map(c => c.id), ["scheduled", "sending"]);
is("blank search imposes no restriction", campaignHistoryView(campaigns, "   ", "all").rows.map(c => c.id), campaigns.map(c => c.id));
part("Counts describe loaded history, independently of search");
is("all loaded campaigns are counted", waiting.counts.all, 6);
for (const status of HISTORY_STATUSES.filter(s => s !== "all")) {
  is("loaded status count: " + status, waiting.counts[status], 1);
  is("each status remains individually accessible: " + status, campaignHistoryView(campaigns, "", status).rows.map(c => c.id), [status]);
}
const none = campaignHistoryView(campaigns, "missing subject", "sent");
is("no match returns no visible rows", none.rows, []);
is("no match does not claim the stored history is empty", none.counts.all, 6);
is("no match leaves status counts unchanged", none.counts, waiting.counts);
is("clearing filters restores all loaded rows", campaignHistoryView(campaigns, "", "all").rows.map(c => c.id), campaigns.map(c => c.id));
part("Refreshed props and unknown future statuses do not change saved data");
const refreshed = campaigns.map(c => c.id === "waiting" ? { ...c, status: "sent" } : c);
is("same waiting filter reflects new saved status", campaignHistoryView(refreshed, "welcome", "waiting").rows, []);
is("new saved sent count is reflected", campaignHistoryView(refreshed, "welcome", "sent").counts.sent, 2);
is("unknown future status remains visible in all", campaignHistoryView([{ subject: "Future", status: "future" }], "", "all").rows.length, 1);
is("unknown status is not counted as waiting", campaignHistoryView([{ subject: "Future", status: "future" }], "", "all").counts.waiting, 0);
is("confirmed empty input stays empty", campaignHistoryView([], "welcome", "waiting"), { rows: [], counts: { all: 0, scheduled: 0, sending: 0, waiting: 0, sent: 0, failed: 0, cancelled: 0 } });
is("filtering never mutates saved rows", JSON.stringify(campaigns), before);
done();
