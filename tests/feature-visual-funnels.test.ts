/**
 * The funnels page's card (531 [VP1], unit 1; added 1 November 2026): a
 * piece of the studio's real screen in HTML, its names from the code.
 * Checked: the funnels page shows it; its five rows are the first five funnel
 * types of lib/funnel-types.ts, in that order, each with what it asks for
 * counted from its own steps; the rest are counted, not named; and it is
 * real text, marked as a drawing beside its caption.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FeatureVisual } from "@/components/feature-visuals";
import { FUNNEL_TYPES, choicesOf, pagesOf } from "@/lib/funnel-types";
import { findPage } from "@/lib/site-pages";
import { done, is, part } from "./check";

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;
const text = (html: string) => html.replace(/<[^>]+>/g, "\n").split("\n").map((s) => s.trim()).filter(Boolean);

function main(): void {
  part("The funnels page's card");
  is("the funnels page shows it", findPage("platform", "funnels")?.visual, "funnels");
  const html = renderToStaticMarkup(createElement(FeatureVisual, { visual: "funnels", tone: "light" }));
  const words = text(html);
  const rows = FUNNEL_TYPES.slice(0, 5);
  is("its rows are the first five funnel types, in the studio's order", words.filter((w) => FUNNEL_TYPES.some((t) => t.label === w)), rows.map((t) => t.label));
  for (const type of rows) {
    is(`${type.label}: what it asks for, counted from its own steps`, words.includes(`${plural(choicesOf(type).length, "product")}, ${plural(pagesOf(type).length, "page")}`), true);
  }
  is("the rest are counted from the list", words.includes(`and ${FUNNEL_TYPES.length - 5} more types`), true);
  is("real text, a drawing beside its caption", [html.includes('aria-hidden="true"'), words.includes("The funnel types in the studio, from its own list.")], [true, true]);
  is("no figure that is not a count from the code", words.filter((w) => /\d/.test(w) && !/^(\d+ products?, \d+ pages?|and \d+ more types)$/.test(w)), []);
}

main();
done();
