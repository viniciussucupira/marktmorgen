/**
 * The follow-up emails of an AI-drafted funnel (lib/funnel-ai-rules.ts),
 * turned into the sequence the Email Studio saves (lib/flows.ts, saveFlow):
 * switched off, named after the funnel, started by the moment its journey
 * gives. Saved through the Email Studio's own route, with its own checks,
 * only when the creator asks. Pure and browser-safe.
 */
import { FORM_ID } from "@/lib/forms";
import type { FunnelSequenceDraft } from "@/lib/funnel-ai-rules";

/** A sequence's name, at most: lib/flows.ts's MAX_FLOW_NAME, which only the server loads (checked equal in tests). */
export const SEQUENCE_NAME_MAX = 80;

export type SequenceFlow = {
  name: string;
  trigger: "product" | "form";
  productId: string | null;
  formId: string | null;
  active: false;
  steps: { delayHours: number; subject: string; body: string }[];
};

/** The sequence to save, or null when the form that starts it is not among the forms the setup confirmed. */
export function sequenceFlowFrom(sequence: FunnelSequenceDraft, funnelName: string, setupResponse: unknown): SequenceFlow | null {
  const name = `Follow-up: ${funnelName.replace(/\s+/g, " ").trim()}`.slice(0, SEQUENCE_NAME_MAX).trim();
  const steps = sequence.steps.map((step) => ({ delayHours: step.delayHours, subject: step.subject, body: step.body }));
  if (sequence.trigger === "product") return sequence.productId ? { name, trigger: "product", productId: sequence.productId, formId: null, active: false, steps } : null;
  const forms = setupResponse && typeof setupResponse === "object" && !Array.isArray(setupResponse) ? (setupResponse as Record<string, unknown>).forms : null;
  const formId = forms && typeof forms === "object" && !Array.isArray(forms) && sequence.formSlot ? (forms as Record<string, unknown>)[sequence.formSlot] : null;
  return typeof formId === "string" && FORM_ID.test(formId) ? { name, trigger: "form", productId: null, formId, active: false, steps } : null;
}

const REASONS: Record<string, string> = {
  setup: "Set up email in the Email Studio first.",
  plan: "Your plan does not include sending email yet.",
  too_many: "Your store already has as many sequences as it can hold. Remove one in the Email Studio.",
  placeholder: "Some emails still have parts marked ⟦like this⟧. Replace them first.",
  role: "Your role on this store cannot save sequences.",
  forbidden: "Your role on this store cannot save sequences.",
  form: "The new form could not start a sequence. Choose its trigger in the Email Studio.",
  product: "The product that starts it is no longer in your store.",
};

/** "saved" only on a complete confirmation; otherwise what to tell the creator. */
export function readMailSaveError(responseOk: boolean, raw: unknown): "saved" | string {
  const data = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
  if (responseOk && data?.ok === true && Array.isArray(data.flows)) return "saved";
  const reason = typeof data?.error === "string" ? data.error : "";
  const why = Object.hasOwn(REASONS, reason) ? REASONS[reason] : "Whether they were saved could not be confirmed. Check the Email Studio before saving them again.";
  return `The follow-up emails were not saved as a sequence. ${why}`;
}
