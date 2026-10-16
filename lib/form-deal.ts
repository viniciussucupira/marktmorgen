import { answerText, type FormDef, type FormResponse } from "@/lib/forms";
import { MAX_DEAL_NOTE, MAX_DEAL_TITLE } from "@/lib/crm-rules";

/** Reviewable CRM copy, not a marketing subscription or a message. */
export function formDealDraft(form: FormDef, response: FormResponse) {
  const email = form.fields.filter(field => field.type === "email").map(field => response.answers[field.id]).find(value => typeof value === "string" && value.length <= 254 && /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(value));
  const date = new Date(response.at * 1000);
  const source = "Form: " + form.name + (Number.isFinite(date.getTime()) ? "\nSubmitted: " + date.toISOString() : "");
  const details = form.fields.flatMap(field => {
    const answer = answerText(field, response.answers[field.id]);
    return answer ? [field.label + ": " + answer] : [];
  });
  const fullNote = [source, ...details].join("\n");
  return { title: form.name.slice(0, MAX_DEAL_TITLE), email: typeof email === "string" ? email.trim().toLowerCase() : "", note: fullNote.slice(0, MAX_DEAL_NOTE), truncated: fullNote.length > MAX_DEAL_NOTE };
}

export type FormDealMatch = { formResponseRef?: string; id: string; title: string; email: string; stage: string };

/** Snapshot matches by contact, not proof that two responses describe the same sale. */
export function matchingFormDeals(email: string, deals: readonly FormDealMatch[]): FormDealMatch[] {
  const address = email.trim().toLowerCase();
  if (!address || !/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(address)) return [];
  return deals.filter(deal => deal.email.trim().toLowerCase() === address);
}

/** Acknowledgment applies only to this email and this set of existing opportunities. */
export function formDealMatchKey(email: string, matches: readonly FormDealMatch[]): string {
  return matches.length ? JSON.stringify([email.trim().toLowerCase(), matches.map(deal => deal.id).sort()]) : "";
}
