/**
 * The page coach: what a product's sales page has, what it is missing, and a
 * score out of 100 for how complete it is as a page that sells.
 *
 * Measured before it was built (8 October 2026): Kajabi, Hotmart Pages,
 * Stan, Gumroad and Teachable each give a creator blocks or templates and
 * then leave them alone with a blank page; none of them reads the page back
 * and says what is missing. The checks here are the parts every page that
 * sells well has in common — a headline about what the buyer gets, a picture
 * of the thing, a button before the reader has to scroll far, what is in it,
 * who it is for and who it is not, the questions buyers ask, a promise about
 * refunds — weighted by how much a buyer misses each one.
 *
 * A check is about what the page holds, never about how it is worded: the
 * words are the creator's, and the writing help (lib/ai.ts, reviewPage) is
 * where a second opinion on them comes from. Nothing here invents a claim;
 * a check that asks for proof asks for the real kind (verified reviews,
 * numbers the store counted), never for a testimonial typed in.
 *
 * Pure, so the studio's editor and the server ask the same function.
 */
import type { BlockKind, PageBlock, SalesPage } from "@/lib/sales-page";
import type { PageFacts } from "@/lib/page-facts";

export type CoachCheck = {
  id: string;
  /** What is checked, as the creator reads it: "A button near the top". */
  label: string;
  /** Why it matters, in one line. */
  why: string;
  done: boolean;
  /** How much a buyer misses it: 3 a lot, 1 a little. */
  weight: 1 | 2 | 3;
  /** The block that would answer it, when adding one is the fix. */
  add?: BlockKind;
};

export type CoachInput = {
  page: Pick<SalesPage, "blocks" | "seoDescription" | "test"> & { variant?: SalesPage["variant"] };
  productTitle: string;
  free: boolean;
  /** The product has a picture of its own. */
  picture: boolean;
  /** The numbers the store has counted for it (lib/page-facts.ts). */
  facts: PageFacts;
};

const filled = (block: PageBlock): boolean => {
  switch (block.kind) {
    case "hero":
      return Boolean(block.headline);
    case "text":
    case "guarantee":
    case "bio":
      return Boolean(block.body);
    case "benefits":
    case "inside":
    case "steps":
    case "bonuses":
      return block.items.length > 0;
    case "faq":
      return block.items.length > 0;
    case "fit":
      return block.yes.length + block.no.length > 0;
    case "compare":
      return block.rows.length > 0;
    case "video":
      return Boolean(block.video);
    case "pictures":
      return block.items.length > 0;
    case "countdown":
      return block.until > 0;
    case "facts":
      return block.show.length > 0;
    case "feature":
      return Boolean(block.body || block.picture);
    case "product":
      return Boolean(block.product);
    case "form":
      return Boolean(block.form);
    case "quotes":
      return block.items.length > 0;
    case "cta":
    case "reviews":
      return true;
  }
};

/** Every check, in the order the coach lists them. */
export function coachChecks(input: CoachInput): CoachCheck[] {
  const blocks = input.page.blocks.filter(filled);
  const has = (kind: BlockKind) => blocks.some((b) => b.kind === kind);
  const count = (kind: "benefits" | "inside" | "steps" | "faq") =>
    blocks.reduce((n, b) => (b.kind === kind ? n + b.items.length : n), 0);
  const hero = blocks[0]?.kind === "hero" ? blocks[0] : null;
  const ctas = blocks.map((b, i) => (b.kind === "cta" ? i : -1)).filter((i) => i >= 0);
  const free = input.free;
  const checks: CoachCheck[] = [
    {
      id: "headline",
      label: "A headline about what they get",
      why: "The first line decides whether anyone reads the second. The product's name alone rarely says what the buyer walks away with.",
      done: Boolean(hero && hero.headline.trim() && hero.headline.trim().toLowerCase() !== input.productTitle.trim().toLowerCase()),
      weight: 3,
      add: hero ? undefined : "hero",
    },
    {
      id: "media",
      label: "A picture or a video at the top",
      why: "People buy what they can see. A page with only words up top loses readers in the first seconds.",
      done: Boolean(hero && ((hero.media === "picture" && input.picture) || (hero.media === "video" && hero.video))),
      weight: 2,
    },
    {
      id: "early-button",
      label: free ? "The sign-up form within reach" : "A button near the top",
      why: "Some visitors arrive ready. Make them scroll past five sections to pay and some of them leave first.",
      done: free ? true : Boolean(hero?.button) || ctas.some((i) => i <= 3),
      weight: 3,
      add: free ? undefined : "cta",
    },
    {
      id: "benefits",
      label: "At least three things they get",
      why: "A buyer pays for what changes for them, not for the product's name. Three concrete points is the least a page should say.",
      done: count("benefits") >= 3,
      weight: 3,
      add: "benefits",
    },
    {
      id: "inside",
      label: "What is inside, or how it works",
      why: "The parts, or the steps from paying to the result, make the price feel like something rather than a promise.",
      done: count("inside") >= 3 || count("steps") >= 3,
      weight: 3,
      add: "inside",
    },
    {
      id: "fit",
      label: "Who it is for, and who it is not for",
      why: "Readers decide faster when they see themselves on the page, and the ones it is not for leave before paying instead of asking for a refund.",
      done: blocks.some((b) => b.kind === "fit" && b.yes.length >= 2 && b.no.length >= 1),
      weight: 2,
      add: "fit",
    },
    {
      id: "faq",
      label: "Three questions answered",
      why: "Every question a page leaves open is a reason to wait. Format, access, delivery and refunds are the usual ones.",
      done: count("faq") >= 3,
      weight: 3,
      add: "faq",
    },
  ];
  if (!free) {
    checks.push(
      {
        id: "guarantee",
        label: "Your refund promise",
        why: "Stated plainly, it takes the risk off the buyer. Only promise what you will do.",
        done: has("guarantee"),
        weight: 2,
        add: "guarantee",
      },
      {
        id: "closing-button",
        label: "A button at the end",
        why: "A reader who reached the bottom has decided. Do not make them scroll back up to act on it.",
        done: ctas.some((i) => i >= blocks.length - 3),
        weight: 2,
        add: "cta",
      },
      {
        id: "reviews",
        label: "A place for buyers' reviews",
        why: "Verified reviews from people who paid are the proof a page can show. They fill in by themselves as buyers write them.",
        done: input.page.blocks.some((b) => b.kind === "reviews"),
        weight: 2,
        add: "reviews",
      },
      {
        id: "show",
        label: "A look inside",
        why: "Pages of the book, a screen of the course, a lesson to watch: showing the inside beats describing it.",
        done: has("pictures") || has("video") || blocks.some((b) => b.kind === "feature" && b.picture),
        weight: 2,
        add: "pictures",
      },
    );
  }
  checks.push({
    id: "bio",
    label: "Who made it",
    why: "People buy from people. A few lines about you, and why you made it, answer the question of who is behind the page.",
    done: has("bio"),
    weight: 1,
    add: "bio",
  });
  // Only asked for when the store has a number to show: never a reason to type one.
  if (Object.keys(input.facts).length > 0) {
    checks.push({
      id: "facts",
      label: "Your numbers, shown",
      why: "Your store has counted numbers for this product. Shown big, they say in a second what a paragraph says in a minute.",
      done: blocks.some((b) => b.kind === "facts" && b.show.some((key) => input.facts[key])),
      weight: 1,
      add: "facts",
    });
  }
  checks.push({
    id: "search",
    label: "A line for search and sharing",
    why: "What a search engine and a shared link show under the title. Without it, they guess from the page.",
    done: Boolean(input.page.seoDescription.trim()),
    weight: 1,
  });
  if (!free && hero) {
    checks.push({
      id: "test",
      label: "Two headlines, tested",
      why: "Half your visitors see each, and the one that brings more of them to the checkout is kept by itself.",
      // A second version of the whole page tests the headline too, and more.
      done: Boolean(input.page.test) || Boolean(input.page.variant),
      weight: 1,
    });
  }
  return checks;
}

/** How complete the page is, out of 100: the weight of what is done over the weight of everything checked. */
export function coachScore(checks: CoachCheck[]): number {
  const total = checks.reduce((n, c) => n + c.weight, 0);
  if (total === 0) return 0;
  return Math.round((checks.reduce((n, c) => n + (c.done ? c.weight : 0), 0) / total) * 100);
}

/** A word for the score, so a number never stands alone. */
export function scoreWord(score: number): "Just started" | "Taking shape" | "Strong" | "Complete" {
  if (score >= 95) return "Complete";
  if (score >= 75) return "Strong";
  if (score >= 45) return "Taking shape";
  return "Just started";
}

/**
 * Where the page loses the most readers, from how far down each block was
 * read (lib/page-depth.ts, as shares from 0 to 100 of the page's readers).
 * The block after the steepest fall, and how many readers fell there; null
 * below `minVisitors` or when no fall is worth saying.
 */
export function steepestDrop(
  order: { id: string; kind: BlockKind }[],
  reach: { shares: Record<string, number>; visitors: number } | null,
  minVisitors = 30,
): { at: string; kind: BlockKind; lost: number; before: number } | null {
  if (!reach || reach.visitors < minVisitors) return null;
  let best: { at: string; kind: BlockKind; lost: number; before: number } | null = null;
  for (let i = 1; i < order.length; i += 1) {
    const before = reach.shares[order[i - 1].id];
    const after = reach.shares[order[i].id];
    if (typeof before !== "number" || typeof after !== "number") continue;
    const lost = before - after;
    if (lost >= 15 && (!best || lost > best.lost)) best = { at: order[i].id, kind: order[i].kind, lost, before };
  }
  return best;
}
