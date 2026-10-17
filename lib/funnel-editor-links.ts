import type { PageFunnelStep } from "@/lib/page-funnel";

export type FunnelStepEditorLink = { href: string; label: string };
type EditorContext = {
  storeId: string;
  pageIds: ReadonlySet<string>;
  productIds: ReadonlySet<string>;
  canEditPages: boolean;
  canEditProducts: boolean;
};

/** Uses the selected store's existing inventory; destination routes enforce authorization again. */
export function funnelStepEditorLink(step: PageFunnelStep, context: EditorContext): FunnelStepEditorLink | null {
  if (!context.storeId.trim() || !/^[A-Za-z0-9_-]{1,40}$/.test(step.id)) return null;
  let path: string;
  let parameter: string;
  let label: string;
  if (step.kind === "page" && context.canEditPages && context.pageIds.has(step.id)) {
    path = "/studio/site";
    parameter = "page";
    label = "Edit page";
  } else if (step.kind === "product" && context.canEditProducts && context.productIds.has(step.id)) {
    path = "/studio/pages";
    parameter = "product";
    label = "Edit product page";
  } else {
    return null;
  }
  const query = new URLSearchParams({ store: context.storeId, [parameter]: step.id });
  return { href: `${path}?${query}`, label };
}
