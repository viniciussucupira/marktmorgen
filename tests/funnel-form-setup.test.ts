import { isValidElement } from "react";
import { FunnelFormSetup } from "@/components/funnel-form-setup";
import type { FunnelFormDraft } from "@/lib/funnel-form-draft";
import { MAX_FIELDS } from "@/lib/forms";
import { done, is, part } from "./check";
type Node = { type: unknown; props: Record<string, unknown> };
function nodes(value: unknown): Node[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!isValidElement(value)) return [];
  const node = value as unknown as Node;
  return [node, ...nodes(node.props.children)];
}
async function main() {
  const initial: FunnelFormDraft = { fields: [{ type: "email", label: "Email", required: true }, { type: "short", label: "Project", required: false }], offerList: true };
  let changed: FunnelFormDraft | null = null;
  const render = (value: FunnelFormDraft) => nodes(FunnelFormSetup({ value, onChange: next => { changed = next; } }));
  part("Question changes cannot retain an impossible subscription offer");
  const type = render(initial).find(node => node.type === "select")!;
  (type.props.onChange as (event: { target: { value: string } }) => void)({ target: { value: "short" } });
  is("changing the last email question disables the subscription offer", changed, { ...initial, fields: [{ ...initial.fields[0], type: "short" }, initial.fields[1]], offerList: false });
  const remove = render(initial).find(node => node.props["aria-label"] === "Remove question 1")!;
  (remove.props.onClick as () => void)();
  is("removing the last email question disables the subscription offer", changed, { fields: [initial.fields[1]], offerList: false });
  const single = render({ fields: [initial.fields[0]], offerList: false });
  is("the only question cannot be removed", single.find(node => node.props["aria-label"] === "Remove question 1")?.props.disabled, true);
  const full = render({ fields: Array.from({ length: MAX_FIELDS }, () => initial.fields[1]), offerList: false });
  is("adding questions stops at the existing form limit", full.find(node => node.type === "button" && node.props.children === "Add question")?.props.disabled, true);
  done();
}
void main();
