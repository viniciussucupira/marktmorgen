/**
 * 310 [AX2] §6 and DA1: the public page /accessibility
 * (app/accessibility/page.tsx, lib/accessibility-statement.ts). What fails here:
 *   - a test said to run that does not exist in the CI, or runs on fewer
 *     browsers or widths than the page says;
 *   - a gap in docs/accessibility-inventory.json left off the page, or a page
 *     counted as reviewed that the inventory does not record as reviewed;
 *   - a conformity claim, a seal or a superiority claim on the page;
 *   - no way to report a problem, no word that we use no overlay, no link in
 *     the footer, or the page missing from the sitemap.
 */
import { readFileSync, existsSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import AccessibilityPage from "@/app/accessibility/page";
import { ACCESSIBILITY_CHECKS, accessibilityGaps, reviewCounts } from "@/lib/accessibility-statement";
import inventory from "@/docs/accessibility-inventory.json";
import { done, is, part } from "./check";

function main(): void {
  part("Every test the page names runs in the CI, as the page says");
  for (const check of ACCESSIBILITY_CHECKS) {
    const workflow = existsSync(check.workflow) ? readFileSync(check.workflow, "utf8") : "";
    is(`${check.name}: its workflow exists`, workflow.length > 0, true);
    for (const needle of check.proof) is(`${check.name}: the workflow or its test has "${needle}"`, (workflow + (check.script && existsSync(check.script) ? readFileSync(check.script, "utf8") : "")).includes(needle), true);
  }

  part("What is open and what is reviewed come from the inventory, not typed again");
  const gaps = accessibilityGaps();
  is("every open item of the inventory is on the page's list", gaps.length, (inventory as { openWork: unknown[] }).openWork.length);
  const counts = reviewCounts();
  const templates = (inventory as { pageTemplates: { status: string }[] }).pageTemplates;
  is("the pages counted are the inventory's page templates", counts.total, templates.length);
  is("a page is counted reviewed only where the inventory says its AAA review is done", counts.reviewed, templates.filter((t) => /^AAA review (completed|done)$/i.test(t.status)).length);

  part("What the page says, and what it never says");
  const html = renderToStaticMarkup(AccessibilityPage());
  const text = html.replace(/<[^>]+>/g, " ");
  is("the goal is said as a goal, not as conformity", [/our goal/i.test(text), /WCAG\s+2\.2/.test(text), /\bAAA\b/.test(text)], [true, true, true]);
  is("no claim of conformity, certification, a seal or being best", /fully accessible|ADA compliant|WCAG AAA certified|most accessible|certified|compliant with WCAG|100% accessible/i.test(text), false);
  is("every gap is on the page", gaps.every((g) => text.includes(g.area)), true);
  is("how many pages still wait for a full review is said", text.includes(`${counts.total - counts.reviewed} of ${counts.total}`), true);
  is("no widget or overlay, said plainly", /no accessibility widget or overlay/i.test(text), true);
  is("how to report a problem, without a promised reply time", [html.includes("mailto:support@marktmorgen.com"), /within \d+ (hours|days)|24\/7|24 hours/i.test(text)], [true, false]);
  is("a glossary for the terms it uses", [/<dl/.test(html), /screen reader/i.test(text), /<abbr title="Web Content Accessibility Guidelines">WCAG<\/abbr>/.test(html)], [true, true, true]);
  is("creators' stores: what the studio checks, and that their content is theirs", [/Can everyone use your store\?/.test(text), /responsible for what they publish/i.test(text)], [true, true]);

  part("Where it is found");
  const footer = readFileSync("components/site-footer.tsx", "utf8");
  is("in the footer's legal links, which the slim footer uses too", /const LEGAL_LINKS[\s\S]*?\{ label: "Accessibility", href: "\/accessibility" \}[\s\S]*?\];/.test(footer), true);
  is("in the sitemap", /path: "\/accessibility"/.test(readFileSync("app/sitemap.ts", "utf8")), true);
  done();
}

main();
