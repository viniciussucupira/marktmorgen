import type { Store } from "@/lib/store";
import type { PageFunnel } from "@/lib/page-funnel";
import { pageOut, siteKey } from "@/lib/site-page-rules";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { parsePage } from "@/lib/sales-page";
import { FORM_ID, parseForm } from "@/lib/forms";

/** Read-only checks of saved A/B form bindings, in two batched reads at most. No answers are read. */
export async function readFunnelPageChecks(store: Store, funnel: Pick<PageFunnel, "steps">): Promise<string[]> {
  const steps = funnel.steps.flatMap((step, index) => {
    if (step.kind !== "page") return [];
    const page = (store.sitePages ?? []).find(page => page.id === step.id);
    return page && pageOut(page) ? [{ page, index }] : [];
  });
  if (!steps.length) return [];
  if (!store.statsId || !isRedisConfigured()) throw new Error("Page form checks unavailable");
  const ids = [...new Set(steps.map(step => step.page.id))];
  const pages = await redisPipeline(ids.map(id => ["GET", `nl:product:page:${store.statsId}:${siteKey(id)}`]));
  if (pages.length !== ids.length) throw new Error("Saved pages could not be read");
  const pageRecords = new Map(ids.map((id, index) => [id, pages[index]]));
  const checks: { prefix: string; form: string | null }[] = [];
  for (const { page, index } of steps) {
    const raw = pageRecords.get(page.id);
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
        checks.push({ prefix, form: typeof block.form === "string" && FORM_ID.test(block.form) ? block.form : null });
      }
    }
  }
  const formIds = [...new Set(checks.flatMap(check => check.form ? [check.form] : []))];
  const available = new Set<string>();
  if (formIds.length) {
    const [stored] = await redisPipeline([["HMGET", `nl:forms:${store.statsId}`, ...formIds]]);
    if (!Array.isArray(stored) || stored.length !== formIds.length) throw new Error("Forms could not be read");
    for (const [index, id] of formIds.entries()) {
      const raw = stored[index];
      if (raw === null) continue;
      if (typeof raw !== "string") throw new Error("Form could not be read");
      const form = parseForm(JSON.parse(raw));
      if (!form || form.id !== id) throw new Error("Stored form is invalid");
      available.add(id);
    }
  }
  return checks.flatMap(({ prefix, form }) => !form
    ? [prefix + "A form block has no selected form. Choose a form in the page editor before sharing."]
    : available.has(form) ? [] : [prefix + "The selected form is no longer available in this store. Review Forms and select a replacement in the page editor."]);
}
