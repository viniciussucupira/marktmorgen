import type { Flow } from "@/lib/flows";

export type FlowReviewContext = {
  products: readonly { id: string }[];
  courses: readonly string[];
  forms: readonly { id: string }[];
  fields: readonly { id: string }[];
  stages: readonly { id: string }[];
  flows: readonly Pick<Flow, "id" | "name" | "active" | "steps">[];
};
/** Saved references only; never sends email or executes an action. */
export function flowConfigurationIssues(flow: Flow, context: FlowReviewContext): string[] {
  const issues: string[] = [];
  const productExists = (id: string | null) => context.products.some(product => product.id === id);
  if (flow.trigger === "product" && !productExists(flow.productId)) issues.push("The trigger product is unavailable. Choose a product in this store.");
  if (flow.trigger === "finished" && !context.courses.includes(flow.productId ?? "")) issues.push("The trigger course is unavailable. Choose a current course.");
  if (flow.trigger === "form" && !context.forms.some(form => form.id === flow.formId)) issues.push("The trigger form is unavailable for this sequence. Choose a form that collects an email address.");
  if (flow.goal && "productId" in flow.goal && !productExists(flow.goal.productId)) issues.push("The product used to end this sequence is unavailable. Review the goal.");
  flow.steps.forEach((step, index) => {
    const prefix = "Step " + (index + 1) + ": ";
    if (step.when && "productId" in step.when) {
      const course = ["started", "unstarted", "finished", "unfinished"].includes(step.when.if);
      if (course ? !context.courses.includes(step.when.productId) : !productExists(step.when.productId)) issues.push(prefix + "The condition refers to an unavailable " + (course ? "course" : "product") + ". Review it before activating.");
    }
    const action = step.action;
    if (action?.do === "start") {
      const target = context.flows.find(target => target.id === action.flowId && target.id !== flow.id);
      if (!target) issues.push(prefix + "The sequence to start is unavailable. Choose another sequence.");
      else if (!target.active || !target.steps.length) issues.push(prefix + "The sequence “" + target.name + "” is paused or has no steps. Review it before expecting this action to start it.");
    }
    if (action?.do === "field" && !context.fields.some(field => field.id === action.field)) issues.push(prefix + "The contact field is unavailable. Choose a current field.");
    if (action?.do === "deal" && !context.stages.some(stage => stage.id === action.stage)) issues.push(prefix + "The deal stage is unavailable. Choose a current stage.");
  });
  return issues;
}
