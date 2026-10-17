import { answerText, type FormDef, type FormResponse } from "@/lib/forms";
export const NO_CURRENT_FORM_RESULT = "__none";
const fold = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
/** Filters only responses already authorized and loaded for this form. Keeps server identities intact. */
export type FormOpportunityFilter = "all" | "linked" | "unlinked";
export type FormOpportunityLinks = { available: boolean; filter: FormOpportunityFilter; refs: ReadonlySet<string> };
export function filterFormResponses<T extends FormResponse & { opportunityRef?: string }>(form: FormDef, responses: readonly T[], query: string, outcome: string, links?: FormOpportunityLinks): T[] {
  const text = fold(query.trim().slice(0, 200));
  const selected = outcome === NO_CURRENT_FORM_RESULT || form.outcomes.some(item => item.id === outcome) ? outcome : "";
  return responses.filter(response => {
    if (links?.available && links.filter !== "all") {
      const linked = !!response.opportunityRef && links.refs.has(response.opportunityRef);
      if (links.filter === "linked" ? !linked : links.filter === "unlinked" && linked) return false;
    }
    const result = form.outcomes.find(item => item.id === response.outcome);
    if (selected === NO_CURRENT_FORM_RESULT ? !!result : selected && response.outcome !== selected) return false;
    return !text || [...form.fields.map(field => answerText(field, response.answers[field.id])), result?.title ?? ""].some(value => fold(value).includes(text));
  });
}
