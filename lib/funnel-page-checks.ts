import type { Store } from "@/lib/store";
import type { PageFunnel } from "@/lib/page-funnel";
import { pageOut, siteKey } from "@/lib/site-page-rules";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { parsePage } from "@/lib/sales-page";
import { FORM_ID, parseForm } from "@/lib/forms";

/** Read-only checks of form bindings on the saved page and its configured A/B variant; no answers are read. */
export async function readFunnelPageChecks(store: Store, funnel: Pick<PageFunnel, "steps">): Promise<string[]> {
  const issues: string[] = [];
  const forms = new Map<string, Promise<boolean>>();
  for (const [index, step] of funnel.steps.entries()) {
    if (step.kind !== "page") continue;
    const page = (store.sitePages ?? []).find(page => page.id === step.id);
    if (!page || !pageOut(page)) continue;
    if (!store.statsId || !isRedisConfigured()) throw new Error("Page form checks unavailable");
    const [raw] = await redisPipeline([["GET", `nl:product:page:${store.statsId}:${siteKey(page.id)}`]]);
    if (typeof raw !== "string") throw new Error("Saved page could not be read");
    const value = JSON.parse(raw) as { blocks?: unknown; variant?: unknown } | null;
    if (!value || !Array.isArray(value.blocks) || value.blocks.some(block => !block || typeof block !== "object" || typeof block.kind !== "string")) throw new Error("Saved page blocks could not be read");
    const versions = [{ label: "", blocks: value.blocks }];
    if (value.variant != null) {
      const variant = value.variant as { blocks?: unknown };
      if (typeof variant !== "object" || !Array.isArray(variant.blocks) || variant.blocks.some(block => !block || typeof block !== "object" || typeof block.kind !== "string") || !parsePage(value).variant) throw new Error("Saved variant could not be checked");
      versions[0].label = "Version A: ";
      versions.push({ label: "Version B: ", blocks: variant.blocks });
    }
    for (const version of versions) {
      for (const block of version.blocks) {
        if (block.kind !== "form") continue;
        const prefix = "Step " + (index + 1) + ", " + page.title + ": " + version.label;
        if (typeof block.form !== "string" || !FORM_ID.test(block.form)) {
          issues.push(prefix + "A form block has no selected form. Choose a form in the page editor before sharing.");
          continue;
        }
        if (!forms.has(block.form)) forms.set(block.form, (async () => {
          const [stored] = await redisPipeline([["HGET", `nl:forms:${store.statsId}`, block.form]]);
          if (stored === null) return false;
          if (typeof stored !== "string") throw new Error("Form could not be read");
          const form = parseForm(JSON.parse(stored));
          if (!form || form.id !== block.form) throw new Error("Stored form is invalid");
          return true;
        })());
        if (!(await forms.get(block.form))) issues.push(prefix + "The selected form is no longer available in this store. Review Forms and select a replacement in the page editor.");
      }
    }
  }
  return issues;
}
