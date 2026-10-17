import type { FunnelType } from "@/lib/funnel-types";
import { MAX_HEADLINE, MAX_TEXT } from "@/lib/sales-page";

/** Author-written starting copy only. No generation, provider calls or publication. */
export type FunnelPageCopy = { headline: string; intro: string };
export const MAX_FUNNEL_INTRO = Math.min(600, MAX_TEXT);
export function readFunnelPageCopy(raw: unknown, type: FunnelType): Record<string, FunnelPageCopy> | null {
  if (raw === undefined) return {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const result: Record<string, FunnelPageCopy> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!type.slots.some(slot => slot.kind === "page" && slot.key === key)) return null;
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const fields = value as Record<string, unknown>;
    if (Object.keys(fields).some(field => field !== "headline" && field !== "intro")) return null;
    if (typeof fields.headline !== "string" || typeof fields.intro !== "string") return null;
    if (fields.headline.length > MAX_HEADLINE || fields.intro.length > MAX_FUNNEL_INTRO) return null;
    result[key] = { headline: fields.headline.trim(), intro: fields.intro.trim() };
  }
  return result;
}
