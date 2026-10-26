/**
 * LE448 private report projection only: no reads, mail, authentication or I/O.
 * Caller must obtain a complete coherent snapshot under reviewed access/funding
 * and byte/read limits. A true completeness flag is a contract, not proof.
 */
import { csvLine } from "@/lib/csv";
import { parsePlatformWaitlistEntry, confirmedPlatformWaitlistContact, type IntendedPlan } from "@/lib/platform-waitlist-record";

const MAX_ROWS = 10000;
const MAX_BYTES = 4 * 1024 * 1024;
const validTime = (v: unknown): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= 0 && v <= 8640000000000;
export type WaitlistReport = {
  csv: string; csvBytes: number; generatedAt: string; since: string;
  totalConfirmed: number; newConfirmed: number;
  byPlan: { plan: IntendedPlan; count: number }[];
  byCountry: { country: string | null; count: number }[];
};
export type WaitlistReportInput = {
  records: unknown[]; complete: boolean; now: number; since: number;
  maxRecords: number; maxCsvBytes: number;
};
/** Refuse an incomplete, corrupt, duplicate or over-budget snapshot as a whole.
 * No partial CSV/count is returned. Limits are safety bounds, not funded defaults.
 */
export function buildPlatformWaitlistReport(input: WaitlistReportInput): WaitlistReport | null {
  if (!input || input.complete !== true || !Array.isArray(input.records) ||
      !validTime(input.now) || !validTime(input.since) || input.since > input.now ||
      !Number.isSafeInteger(input.maxRecords) || input.maxRecords < 1 || input.maxRecords > MAX_ROWS ||
      !Number.isSafeInteger(input.maxCsvBytes) || input.maxCsvBytes < 1 || input.maxCsvBytes > MAX_BYTES ||
      input.records.length > input.maxRecords) return null;
  const seen = new Set<string>();
  const contacts: NonNullable<ReturnType<typeof confirmedPlatformWaitlistContact>>[] = [];
  for (const raw of input.records) {
    const entry = parsePlatformWaitlistEntry(raw);
    if (!entry || seen.has(entry.entryId) || entry.updatedAt > input.now ||
        !validTime(entry.confirmedAt === null ? entry.requestedAt : entry.confirmedAt)) return null;
    seen.add(entry.entryId);
    const contact = confirmedPlatformWaitlistContact(raw,input.now);
    if (contact) contacts.push(contact);
  }
  // Stable output independent of storage scan order; do not mutate the input.
  contacts.sort((a,b) => a.email < b.email ? -1 : a.email > b.email ? 1 : 0);
  const lines = [csvLine(["Email","Confirmation date (UTC)","Intended plan","Country"])];
  let bytes = Buffer.byteLength(lines[0] + "\r\n","utf8");
  if (bytes > input.maxCsvBytes) return null;
  const plans = new Map<IntendedPlan,number>();
  const countries = new Map<string | null,number>();
  let added = 0;
  for (const contact of contacts) {
    const line = csvLine([contact.email,new Date(contact.confirmedAt * 1000).toISOString(),
      contact.plan ?? "",contact.country ?? ""]);
    bytes += Buffer.byteLength(line + "\r\n","utf8");
    if (bytes > input.maxCsvBytes) return null;
    lines.push(line);
    plans.set(contact.plan,(plans.get(contact.plan) ?? 0) + 1);
    countries.set(contact.country,(countries.get(contact.country) ?? 0) + 1);
    if (contact.confirmedAt >= input.since) added += 1;
  }
  const compare = (a:string|null,b:string|null) => a === b ? 0 : a === null ? -1 : b === null ? 1 : a < b ? -1 : 1;
  return {
    csv:lines.join("\r\n") + "\r\n",csvBytes:bytes,
    generatedAt:new Date(input.now * 1000).toISOString(),since:new Date(input.since * 1000).toISOString(),
    totalConfirmed:contacts.length,newConfirmed:added,
    byPlan:[...plans].sort(([a],[b])=>compare(a,b)).map(([plan,count])=>({plan,count})),
    byCountry:[...countries].sort(([a],[b])=>compare(a,b)).map(([country,count])=>({country,count})),
  };
}
