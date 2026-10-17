import { FUNNEL_ID, MAX_FUNNEL_PAGES } from "@/lib/page-funnel";

/** Only a complete disabled-funnel acknowledgement exits recovery. */
export function readFunnelSetupResult(raw: unknown, expectedPages: number): { funnelId: string; pages: { id: string; title: string }[] } | null {
  if (!Number.isInteger(expectedPages) || expectedPages < 0 || expectedPages > MAX_FUNNEL_PAGES || !raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  if (value.ok !== true || "error" in value || !value.funnel || typeof value.funnel !== "object" || Array.isArray(value.funnel)) return null;
  const funnel = value.funnel as Record<string, unknown>;
  if (typeof funnel.id !== "string" || !FUNNEL_ID.test(funnel.id) || funnel.on !== false || !Array.isArray(value.pages) || value.pages.length !== expectedPages) return null;
  const pages: { id: string; title: string }[] = [];
  for (const rawPage of value.pages) {
    if (!rawPage || typeof rawPage !== "object" || Array.isArray(rawPage)) return null;
    const page = rawPage as Record<string, unknown>;
    if (typeof page.id !== "string" || !/^[a-f0-9]{10}$/.test(page.id) || typeof page.title !== "string" || !page.title.trim() || page.title.length > 200 || pages.some(saved => saved.id === page.id)) return null;
    pages.push({ id: page.id, title: page.title });
  }
  return { funnelId: funnel.id, pages };
}
