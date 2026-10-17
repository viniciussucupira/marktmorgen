import type { Store } from "@/lib/store";
import { MAX_PAGE_FUNNELS, MAX_FUNNEL_PAGES, type PageFunnel } from "@/lib/page-funnel";
import { MAX_SITE_PAGES, pageOut, siteKey } from "@/lib/site-page-rules";
import { MAX_BLOCKS, MAX_STORED_PAGE_BYTES, parsePage, pageProblem } from "@/lib/sales-page";
import { FORM_ID, MAX_FORMS, parseForm } from "@/lib/forms";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import type { FunnelLaunchIssue } from "@/lib/funnel-launch-review";

type Binding = { version: string; form: string | null };
type Inspection = { bindings: Binding[] } | null;
type FormState = "present" | "missing" | "unknown";
const MAX_REVIEW_FORM_BYTES = 64 * 1024;

/** Only saved page/form definitions: no answers, writes, email or provider calls. Two batches at most across all funnels. */
export async function readFunnelFormReviews(store: Store, funnels: readonly PageFunnel[]): Promise<Map<string, FunnelLaunchIssue[]>> {
  const result = new Map(funnels.map(funnel => [funnel.id, [] as FunnelLaunchIssue[]]));
  const pages = new Map(store.sitePages.filter(page => pageOut(page)).map(page => [page.id, page]));
  const references = funnels.flatMap(funnel => funnel.steps.flatMap((step, stepIndex) => step.kind === "page" && pages.has(step.id) ? [{ funnel: funnel.id, page: pages.get(step.id)!, stepIndex }] : []));
  if (!references.length) return result;
  const unknown = (ref: typeof references[number], detail = "Saved page form bindings could not be checked. Reload before relying on this review."): FunnelLaunchIssue => ({
    code: "forms_unknown", title: `Step ${ref.stepIndex + 1}: ${ref.page.title}`, detail, stepIndex: ref.stepIndex,
  });
  const ids = [...new Set(references.map(ref => ref.page.id))];
  if (!store.statsId || !isRedisConfigured() || funnels.length > MAX_PAGE_FUNNELS || funnels.some(funnel => funnel.steps.length > MAX_FUNNEL_PAGES) || ids.length > MAX_SITE_PAGES) {
    references.forEach(ref => result.get(ref.funnel)!.push(unknown(ref)));
    return result;
  }
  const inspected = new Map<string, Inspection>();
  try {
    const replies = await redisPipeline(ids.map(id => ["GET", `nl:product:page:${store.statsId}:${siteKey(id)}`]));
    if (!Array.isArray(replies) || replies.length !== ids.length) throw new Error("Incomplete saved page review");
    ids.forEach((id, index) => {
      try {
        const raw = replies[index];
        if (typeof raw !== "string" || Buffer.byteLength(raw, "utf8") > MAX_STORED_PAGE_BYTES) throw new Error("Invalid saved page");
        const value: unknown = JSON.parse(raw);
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid saved page");
        const record = value as Record<string, unknown>;
        if (!Array.isArray(record.blocks) || record.blocks.length > MAX_BLOCKS) throw new Error("Invalid saved blocks");
        if (record.variant != null && (typeof record.variant !== "object" || Array.isArray(record.variant))) throw new Error("Invalid saved variant");
        const parsed = parsePage(record);
        if (!parsed.blocks.length || pageProblem(record, parsed)) throw new Error("Invalid saved page review");
        const versions = [{ label: parsed.variant ? "Version A" : "Page", blocks: parsed.blocks }];
        if (parsed.variant) versions.push({ label: "Version B", blocks: parsed.variant.blocks });
        inspected.set(id, { bindings: versions.flatMap(version => version.blocks.flatMap(block => block.kind === "form" ? [{ version: version.label, form: FORM_ID.test(block.form) ? block.form : null }] : [])) });
      } catch { inspected.set(id, null); }
    });
  } catch { ids.forEach(id => inspected.set(id, null)); }

  const formIds = [...new Set([...inspected.values()].flatMap(page => page ? page.bindings.flatMap(binding => binding.form ? [binding.form] : []) : []))];
  const states = new Map<string, FormState>();
  const checkedFormIds = formIds.slice(0, MAX_FORMS);
  const limited = formIds.length > checkedFormIds.length;
  if (checkedFormIds.length) {
    try {
      const replies = await redisPipeline([["HMGET", `nl:forms:${store.statsId}`, ...checkedFormIds]]);
      if (!Array.isArray(replies) || replies.length !== 1 || !Array.isArray(replies[0]) || replies[0].length !== checkedFormIds.length) throw new Error("Incomplete form review");
      const values = replies[0];
      checkedFormIds.forEach((id, index) => {
        const raw = values[index];
        if (raw === null) { states.set(id, "missing"); return; }
        try {
          if (typeof raw !== "string" || Buffer.byteLength(raw, "utf8") > MAX_REVIEW_FORM_BYTES) throw new Error("Invalid saved form");
          const parsed = parseForm(JSON.parse(raw));
          states.set(id, parsed?.id === id && parsed.fields.length > 0 ? "present" : "unknown");
        } catch { states.set(id, "unknown"); }
      });
    } catch { checkedFormIds.forEach(id => states.set(id, "unknown")); }
  }
  for (const ref of references) {
    const page = inspected.get(ref.page.id);
    const issues = result.get(ref.funnel)!;
    if (!page) { issues.push(unknown(ref)); continue; }
    for (const version of new Set(page.bindings.map(binding => binding.version))) {
      const bindings = page.bindings.filter(binding => binding.version === version);
      const empty = bindings.filter(binding => !binding.form).length;
      const missing = bindings.filter(binding => binding.form && states.get(binding.form) === "missing").length;
      const uncertain = bindings.filter(binding => binding.form && states.get(binding.form) !== "present" && states.get(binding.form) !== "missing").length;
      const title = `Step ${ref.stepIndex + 1}: ${ref.page.title} · ${version}`;
      if (empty) issues.push({ code: "form", title, detail: `${empty} form block(s) have no selected form. Choose a form in the page editor before sharing.`, stepIndex: ref.stepIndex });
      if (missing) issues.push({ code: "form", title, detail: `${missing} form block(s) reference a form no longer available in this store. Select a replacement in the page editor.`, stepIndex: ref.stepIndex });
      if (uncertain) issues.push({ code: "forms_unknown", title, detail: `${uncertain} form block(s) could not be checked against a confirmed saved form. Reload and review the form before sharing.${limited ? ` This review checks at most ${MAX_FORMS} distinct form definitions; remove stale bindings and reload to check the rest.` : ""}`, stepIndex: ref.stepIndex });
    }
  }
  return result;
}
