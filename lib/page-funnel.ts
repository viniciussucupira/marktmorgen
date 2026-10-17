/**
 * A funnel of pages (added 12 October 2026): the store's own pages and its
 * products' pages, walked in an order the creator sets, from one address.
 *
 *   marktmorgen.com/@chef/go/launch  ->  a page that gives a guide for an
 *   email  ->  a video page  ->  the course's sales page  ->  after paying,
 *   the offers the course already has  ->  a last page of the creator's own
 *
 * Until this, every piece existed and nothing joined them: a landing page
 * could name one paid product next, a sales page led to its own checkout, and
 * the offers after paying ended on the store's thank-you page. Stan sells
 * funnels of up to 20 pages on its $99 plan; ClickFunnels' builder is the
 * whole of what it sells. This joins the pieces the store already has,
 * instead of being a second page builder beside them.
 *
 * Three rules keep it something a visitor can trust, and they are kept here so
 * the studio and every page apply the same ones:
 *
 *   - A step is a page that exists on its own: one of the store's own pages
 *     (lib/site-page-rules.ts) or a product's page. Nothing is drawn only for
 *     the funnel, so a visitor who leaves it has seen nothing they cannot open
 *     again, and nothing priced differently from the store.
 *   - Paying is never skipped and never added: a product step is its product's
 *     own page, with its own checkout, and the next step is offered after the
 *     thank-you page has handed over what was bought, never instead of it.
 *   - A visitor is never trapped. A paid step says "No thanks, continue", and
 *     a step that cannot be shown right now (a page kept back, a product taken
 *     off) is passed over rather than leading to nothing.
 *
 * Kept in a record of its own per store (lib/page-funnel-store.ts), read only
 * by a page opened with a funnel's mark (`?f=<id>`), its entry address and the
 * studio. Pure and browser-safe.
 */
import { SLUG_PATTERN, slugFrom } from "@/lib/site-page-rules";

export type PageFunnelStep = {
  /** One of the store's own pages, or a product's page. */
  kind: "page" | "product";
  /** The page's id (lib/site-page-rules.ts) or the product's. */
  id: string;
};

export type PageFunnel = {
  id: string;
  /** What the creator calls it in the studio. Never shown to a visitor. */
  name: string;
  /** Its address: /@handle/go/<slug>. */
  slug: string;
  steps: PageFunnelStep[];
  /** Off keeps the draft; its funnel entry address is unavailable. */
  on: boolean;
  /** When its steps were last changed, in seconds: its numbers count from then. */
  since: number;
};

/** Funnels in one store, and pages in one funnel: the most Stan allows in one, twenty. */
export const MAX_PAGE_FUNNELS = 10;
export const MAX_FUNNEL_PAGES = 20;
export const MAX_FUNNEL_NAME = 60;
export const MAX_FUNNEL_SLUG = 40;
export const FUNNEL_ID = /^[a-z0-9]{10}$/;
const STEP_ID = /^[A-Za-z0-9_-]{1,40}$/;

/** The mark a funnel's pages carry in their address, `?f=<id>`, read safely. */
export function funnelMark(raw: unknown): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" && FUNNEL_ID.test(value) ? value : "";
}

/** The mark read off the address of the page a form was sent from (the Referer), as lib/came-from.ts reads its tags. */
export function markFromReferer(referer: string | null, ownHost: string): string {
  if (!referer) return "";
  try {
    const url = new URL(referer);
    if (url.hostname.toLowerCase() !== ownHost.toLowerCase()) return "";
    return funnelMark(url.searchParams.get("f"));
  } catch {
    return "";
  }
}

const oneLine = (value: unknown, max: number) =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";

/** An address made from a name, as a page's is. */
export const funnelSlugFrom = (name: string) => slugFrom(name).slice(0, MAX_FUNNEL_SLUG).replace(/-+$/g, "");

/** Why an address cannot be a funnel's, or null when it can. */
export function funnelSlugProblem(slug: string, others: readonly Pick<PageFunnel, "id" | "slug">[], self = ""): "slug" | "taken" | null {
  if (!slug || slug.length > MAX_FUNNEL_SLUG || !SLUG_PATTERN.test(slug)) return "slug";
  if (others.some((funnel) => funnel.slug === slug && funnel.id !== self)) return "taken";
  return null;
}

/** Steps as stored or sent, made safe: the right shapes, each page or product once, twenty at most. */
export function parseSteps(raw: unknown): PageFunnelStep[] {
  if (!Array.isArray(raw)) return [];
  const out: PageFunnelStep[] = [];
  for (const entry of raw.slice(0, MAX_FUNNEL_PAGES)) {
    if (!entry || typeof entry !== "object") continue;
    const value = entry as Record<string, unknown>;
    const kind = value.kind === "page" || value.kind === "product" ? value.kind : null;
    const id = typeof value.id === "string" && STEP_ID.test(value.id) ? value.id : "";
    // Each page once: a funnel walks forward, and knowing where a visitor is
    // from the page they are on is what makes "next" mean one thing.
    if (!kind || !id || out.some((step) => step.kind === kind && step.id === id)) continue;
    out.push({ kind, id });
  }
  return out;
}

/** Funnels as stored, made safe to use: each id and address once, ten at most, each with at least one step. */
export function parsePageFunnels(raw: unknown): PageFunnel[] {
  if (!Array.isArray(raw)) return [];
  const out: PageFunnel[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const value = entry as Record<string, unknown>;
    const id = typeof value.id === "string" && FUNNEL_ID.test(value.id) ? value.id : "";
    const name = oneLine(value.name, MAX_FUNNEL_NAME);
    const slug = typeof value.slug === "string" ? value.slug : "";
    const steps = parseSteps(value.steps);
    if (!id || !name || !steps.length || out.some((f) => f.id === id) || funnelSlugProblem(slug, out) !== null) continue;
    const since = typeof value.since === "number" && Number.isInteger(value.since) && value.since > 0 ? value.since : 0;
    out.push({ id, name, slug, steps, on: value.on !== false, since });
    if (out.length >= MAX_PAGE_FUNNELS) break;
  }
  return out;
}

/** Whether two lists of steps are the same pages in the same order: when they are not, the numbers start again. */
export function sameSteps(a: readonly PageFunnelStep[], b: readonly PageFunnelStep[]): boolean {
  return a.length === b.length && a.every((step, i) => step.kind === b[i].kind && step.id === b[i].id);
}

/** Where a page or product sits in a funnel, or -1. */
export function stepIndex(funnel: Pick<PageFunnel, "steps">, kind: PageFunnelStep["kind"], id: string): number {
  return funnel.steps.findIndex((step) => step.kind === kind && step.id === id);
}

/**
 * The first step after `from` that can be shown right now, or -1 when there
 * is none: a step that cannot be (`open` says which) is passed over, never a
 * dead end. `from` -1 asks for the first step of all.
 */
export function nextOpen(funnel: Pick<PageFunnel, "steps">, from: number, open: (step: PageFunnelStep) => boolean): number {
  for (let i = Math.max(-1, from) + 1; i < funnel.steps.length; i += 1) {
    if (open(funnel.steps[i])) return i;
  }
  return -1;
}

/** A funnel's address, `?f=<id>` added to a step's own address, keeping anything already on it. */
export function withMark(path: string, funnelId: string): string {
  const [base, hash = ""] = path.split("#");
  const joined = `${base}${base.includes("?") ? "&" : "?"}f=${funnelId}`;
  return hash ? `${joined}#${hash}` : joined;
}

/**
 * Why a product cannot be a step, or null when it can: one that has no page
 * of its own (a draft) or that is bought somewhere else than its page (a call,
 * booked for a time on its own page) cannot.
 */
export function productStepProblem(product: { hidden: boolean; call?: unknown } | null): "gone" | "hidden" | "call" | null {
  if (!product) return "gone";
  if (product.hidden) return "hidden";
  if (product.call) return "call";
  return null;
}

/** What a creator is told about a step that is being passed over. */
export const STEP_WHY: Record<"gone" | "hidden" | "call" | "page-gone" | "page-back", string> = {
  gone: "This product was deleted. Visitors go on to the next step.",
  hidden: "This product is a draft, so it has no page yet. Visitors go on to the next step until you publish it.",
  call: "A call is booked on a page of its own, so it cannot be a step. Visitors go on to the next step.",
  "page-gone": "This page was deleted. Visitors go on to the next step.",
  "page-back": "This page is kept from visitors. They go on to the next step until it is out.",
};

/** A new funnel's id: ten letters and digits, like a page's. */
export function newFunnelId(random: (n: number) => number = (n) => Math.floor(Math.random() * n)): string {
  const letters = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 10 }, () => letters[random(letters.length)]).join("");
}

/** One funnel as the studio sends it, checked, with the store's other funnels to keep addresses apart. */
export function readFunnelInput(
  raw: unknown,
  others: readonly PageFunnel[],
  nowSeconds: number,
): { ok: true; funnel: PageFunnel } | { ok: false; error: "name" | "slug" | "taken" | "steps" | "full" } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "steps" };
  const value = raw as Record<string, unknown>;
  const asked = typeof value.id === "string" && FUNNEL_ID.test(value.id) ? value.id : "";
  const existing = asked ? others.find((f) => f.id === asked) ?? null : null;
  if (!existing && others.length >= MAX_PAGE_FUNNELS) return { ok: false, error: "full" };
  const name = oneLine(value.name, MAX_FUNNEL_NAME);
  if (!name) return { ok: false, error: "name" };
  const slug = typeof value.slug === "string" && value.slug.trim() ? value.slug.trim().toLowerCase() : funnelSlugFrom(name);
  const slugIssue = funnelSlugProblem(slug, others, existing?.id ?? "");
  if (slugIssue) return { ok: false, error: slugIssue };
  const listed = Array.isArray(value.steps) ? value.steps : [];
  const steps = parseSteps(listed);
  // Nothing typed is dropped quietly: a step that did not survive reading is a refusal.
  if (!steps.length || steps.length !== Math.min(listed.length, MAX_FUNNEL_PAGES) || listed.length > MAX_FUNNEL_PAGES) {
    return { ok: false, error: "steps" };
  }
  const id = existing?.id ?? newFunnelId();
  const since = existing && sameSteps(existing.steps, steps) && existing.since > 0 ? existing.since : nowSeconds;
  return { ok: true, funnel: { id, name, slug, steps, on: value.on !== false, since } };
}
