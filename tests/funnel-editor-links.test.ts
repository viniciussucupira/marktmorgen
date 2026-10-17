import { funnelStepEditorLink } from "@/lib/funnel-editor-links";
import type { PageFunnelStep } from "@/lib/page-funnel";
import { is, done } from "./check";

const context = {
  storeId: "store_other",
  pageIds: new Set(["Page_1", "draft-page"]),
  productIds: new Set(["Product_2"]),
  canEditPages: true,
  canEditProducts: true,
};
is("page opens the selected store's page editor", funnelStepEditorLink({ kind: "page", id: "Page_1" }, context), {
  href: "/studio/site?store=store_other&page=Page_1", label: "Edit page",
});
is("product opens its sales page editor", funnelStepEditorLink({ kind: "product", id: "Product_2" }, context), {
  href: "/studio/pages?store=store_other&product=Product_2", label: "Edit product page",
});
is("unpublished existing pages remain editable", funnelStepEditorLink({ kind: "page", id: "draft-page" }, context)?.label, "Edit page");
is("page permission is required", funnelStepEditorLink({ kind: "page", id: "Page_1" }, { ...context, canEditPages: false }), null);
is("product permission is required", funnelStepEditorLink({ kind: "product", id: "Product_2" }, { ...context, canEditProducts: false }), null);
is("deleted page has no editor link", funnelStepEditorLink({ kind: "page", id: "deleted" }, context), null);
is("deleted product has no editor link", funnelStepEditorLink({ kind: "product", id: "deleted" }, context), null);
is("page cannot use a product identifier", funnelStepEditorLink({ kind: "page", id: "Product_2" }, context), null);
is("missing store never falls back to another store", funnelStepEditorLink({ kind: "page", id: "Page_1" }, { ...context, storeId: " " }), null);
is("unexpected kind has no link", funnelStepEditorLink({ kind: "other", id: "Page_1" } as unknown as PageFunnelStep, context), null);
for (const id of ["../Page_1", "Page_1&store=other", "", "a".repeat(41)]) {
  is("malformed identifier is rejected: " + id, funnelStepEditorLink({ kind: "page", id }, { ...context, pageIds: new Set([id]) }), null);
}
const escaped = funnelStepEditorLink({ kind: "page", id: "Page_1" }, { ...context, storeId: "store&product=injected" });
const query = new URL(escaped!.href, "https://marktmorgen.com").searchParams;
is("store query value is encoded", query.get("store"), "store&product=injected");
is("store value cannot inject a product parameter", query.has("product"), false);
done();
