import { FUNNEL_STARTERS } from "@/lib/funnel-starters";
import { STARTER_GOALS, starterCard, matchingStarters } from "@/lib/funnel-starter-catalog";
import { readBundle } from "@/lib/funnel-bundle";
import { SHARE_LIMITS } from "@/lib/funnel-share-rules";
import { done, is, part } from "./check";

const cards = FUNNEL_STARTERS.map(starterCard);
const canonical = (value: unknown): string => JSON.stringify(value, (_key, item) => item && typeof item === "object" && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);

part("Campaign journeys are derived from the bundles imported by the real route");
is("every campaign has a different id", new Set(cards.map((card) => card.id)).size, cards.length);
for (const starter of FUNNEL_STARTERS) {
  const card = starterCard(starter);
  const read = readBundle(starter.bundle, { maxBytes: SHARE_LIMITS.creator.bundleBytes });
  is(`${starter.id}: accepted without losing fields`, read.ok && canonical(read.bundle) === canonical(starter.bundle), true);
  is(`${starter.id}: no missing step names`, card.steps.every((step) => step.title !== "Step"), true);
  is(`${starter.id}: exact prerequisites`, [card.pages, card.forms, card.products.length, card.steps.length], [starter.bundle.pages.length, starter.bundle.forms.length, starter.bundle.products.length, starter.bundle.steps.length]);
  is(`${starter.id}: small browser outline contains no page content or contact data`, ["bundle", "blocks", "fields", "email", "answers"].some((key) => Object.hasOwn(card, key)), false);
}

part("Find the right campaign without making any server request");
is("empty search keeps all campaigns in order", matchingStarters(cards, "all", "  ").map((card) => card.id), cards.map((card) => card.id));
is("search ignores case and accent marks", matchingStarters(cards, "all", "CÓURSE").map((card) => card.id), matchingStarters(cards, "all", "course").map((card) => card.id));
is("all words must match", matchingStarters(cards, "all", "digital toolkit").map((card) => card.id), ["digital-product"]);
is("search finds prerequisites", matchingStarters(cards, "all", "complete course").some((card) => card.id === "course-launch"), true);
is("an unmatched search has a real empty state", matchingStarters(cards, "all", "no-such-campaign"), []);
is("goal and query intersect", matchingStarters(cards, "services", "course"), []);
for (const goal of STARTER_GOALS) {
  const matches = matchingStarters(cards, goal, "");
  is(`${goal}: present and no unrelated campaigns`, matches.length > 0 && matches.every((card) => card.goal === goal), true);
}
is("filtering leaves the shared catalog unchanged", cards.length, FUNNEL_STARTERS.length);

part("Waitlist records interest without inferring marketing consent");
const waitlist = FUNNEL_STARTERS.find((starter) => starter.id === "launch-waitlist")!;
is("no marketing list selected by default", waitlist.bundle.forms[0].offerList, false);
is("no payment needed", waitlist.bundle.products, []);
is("no misleading confirmation before submitting the form", waitlist.bundle.pages[1].blocks[0].kind === "hero" && waitlist.bundle.pages[1].blocks[0].headline, "What happens after registering interest");
done();
