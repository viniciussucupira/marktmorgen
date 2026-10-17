import { answerText, type FormDef, type FormResponse } from "@/lib/forms";
import { CRM_ID, MAX_DEAL_NOTE, MAX_DEAL_TITLE } from "@/lib/crm-rules";

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

/** Accept only a complete acknowledgement for this exact source response. */
export function confirmedFormOpportunity(raw: unknown, ref: string): FormDealMatch | null {
  if (!/^[a-f0-9]{64}$/.test(ref) || !raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  if (value.id !== ref.slice(0, 10) || value.formResponseRef !== ref || typeof value.title !== "string"
    || !value.title.trim() || value.title.length > MAX_DEAL_TITLE || typeof value.email !== "string" || value.email.length > 254
    || (value.email.trim() && !/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(value.email.trim()))
    || typeof value.stage !== "string" || !CRM_ID.test(value.stage)) return null;
  return { id: ref.slice(0, 10), title: value.title.trim(), email: value.email.trim().toLowerCase(), stage: value.stage, formResponseRef: ref };
}

/** Refreshed server data wins; newly confirmed records fill only missing identities. */
export function mergeFormOpportunities(existing: readonly FormDealMatch[], recorded: readonly FormDealMatch[]): FormDealMatch[] {
  const seen = new Set(existing.map(deal => deal.id));
  return [...existing, ...recorded.filter(deal => { if (seen.has(deal.id)) return false; seen.add(deal.id); return true; })];
}
