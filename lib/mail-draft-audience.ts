import { readNarrow, type Narrow } from "@/lib/segments-rules";
export type DraftAudience = { who: "all" | "buyers" | "leads"; notProductId: string | null; narrow: Narrow | null };
/** Audience restrictions are explicit; malformed values must never become a broader group. */
export function readDraftAudience(raw: unknown): DraftAudience | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  if (value.who !== "all" && value.who !== "buyers" && value.who !== "leads") return null;
  if (!(value.notProductId === null || typeof value.notProductId === "string" && value.notProductId.length > 0)) return null;
  let narrow: Narrow | null = null;
  if (value.narrow !== null) {
    if (!value.narrow || typeof value.narrow !== "object" || Array.isArray(value.narrow)) return null;
    const n = value.narrow as Record<string, unknown>;
    narrow = readNarrow(n);
    if (n.minSpent !== narrow.minSpent || n.channel !== narrow.channel || n.quietDays !== narrow.quietDays) return null;
  }
  return { who: value.who, notProductId: value.notProductId, narrow };
}
export function sameDraftAudience(left: unknown, right: unknown): boolean {
  const a = readDraftAudience(left), b = readDraftAudience(right);
  return a !== null && b !== null && JSON.stringify(a) === JSON.stringify(b);
}
