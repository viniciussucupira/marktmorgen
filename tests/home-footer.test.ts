/**
 * The home page's footer (498 [ME3], unit 2; added 1 November 2026). The
 * home page is held to 30 links and 600 words (owner, 28 October 2026);
 * its footer was 39 of its 56 links. Checked:
 *
 *   - the home page asks for the home footer;
 *   - it keeps every legal link, the support address, the way back home,
 *     the buyer's library and cancelling, beside one short column;
 *   - every link it drops is still in the full footer, which every other
 *     page shows: nothing is deleted, it is one tap away;
 *   - the end-to-end run counts the home page's words and links
 *     (tests/e2e/home-actions.mjs).
 */
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteFooter } from "@/components/site-footer";
import { done, is, part } from "./check";

const hrefs = (html: string) => [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));

function main(): void {
  const home = hrefs(renderToStaticMarkup(SiteFooter({ variant: "home", morning: true })));
  const full = hrefs(renderToStaticMarkup(SiteFooter({ morning: true })));

  part("The home footer");
  is("the home page asks for it", readFileSync("app/page.tsx", "utf8").includes('<SiteFooter morning variant="home" />'), true);
  is("13 links (the full one has 39)", [home.length, full.length], [13, 39]);
  for (const href of ["/terms", "/privacy", "/refunds", "/copyright", "/report", "/accessibility", "mailto:support@marktmorgen.com", "/library", "/refunds#cancel", "/help", "/platform", "/proof/comparisons", "/"]) {
    is(`keeps ${href}`, home.includes(href), true);
  }
  is("every link it drops is in the full footer of every other page", home.every((href) => full.includes(href)), true);
  is("the other pages keep the full footer", readFileSync("components/site-footer.tsx", "utf8").includes('variant = "full"'), true);

  part("The end-to-end count");
  const e2e = readFileSync("tests/e2e/home-actions.mjs", "utf8");
  is("the home page's words and links are counted against 600 and 30", e2e.includes("ME3 home page at most 600 words and 30 links"), true);
}

main();
done();
