import type { FunnelType } from "@/lib/funnel-types";
import { MAX_FIELDS, MAX_LABEL } from "@/lib/forms";

export type FunnelDraftField = { type: "short" | "long" | "email"; label: string; required: boolean };
export type FunnelFormDraft = { fields: FunnelDraftField[]; offerList: boolean };

/** Bounded setup input. Advanced options and quiz outcomes stay in the form editor. */
export function readFunnelFormDrafts(raw: unknown, type: FunnelType): Record<string, FunnelFormDraft> | null {
  if (raw === undefined) return {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const result: Record<string, FunnelFormDraft> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!type.slots.some(slot => slot.kind === "page" && slot.form && slot.blocks.includes("form") && slot.key === key)) return null;
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const form = value as Record<string, unknown>;
    if (Object.keys(form).some(field => field !== "fields" && field !== "offerList") || typeof form.offerList !== "boolean") return null;
    if (!Array.isArray(form.fields) || !form.fields.length || form.fields.length > MAX_FIELDS) return null;
    const fields: FunnelDraftField[] = [];
    for (const rawField of form.fields) {
      if (!rawField || typeof rawField !== "object" || Array.isArray(rawField)) return null;
      const field = rawField as Record<string, unknown>;
      if (Object.keys(field).some(key => key !== "type" && key !== "label" && key !== "required")) return null;
      if (field.type !== "short" && field.type !== "long" && field.type !== "email") return null;
      if (typeof field.label !== "string" || field.label.length > MAX_LABEL || typeof field.required !== "boolean") return null;
      const label = field.label.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ").replace(/\s+/g, " ").trim();
      if (!label) return null;
      fields.push({ type: field.type, label, required: field.required });
    }
    if (form.offerList && !fields.some(field => field.type === "email")) return null;
    result[key] = { fields, offerList: form.offerList };
  }
  return result;
}
