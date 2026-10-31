/**
 * The warnings panel in the product editor (493 [DE2] unit 2,
 * components/terms-check-panel.tsx), rendered to markup. Pure: nothing is
 * reached.
 *
 * What fails here: a panel shown for text with nothing to check; a warning
 * without its words, reason, fix and the buttons that apply the fix only on
 * the creator's press; a button that would change the text by itself; a
 * heading or a live region missing.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
import { TermsCheckPanel } from "@/components/terms-check-panel";
import type { TermsCheckInput } from "@/lib/terms-check-rules";

const base: TermsCheckInput = { text: "", ownHosts: [], priceCents: 4_900, currency: "usd", immediateAccessConsent: false, realDeadline: false, realStockLimit: false, resaleLicense: false };
let changed: string | null = null;
const render = (text: string) => renderToStaticMarkup(createElement(TermsCheckPanel, { id: "p1", input: { ...base, text }, onChange: (t: string) => { changed = t; } }));

part("Nothing to check, nothing shown");
is("ordinary text: no panel", render("Ten watercolor lessons with worksheets, made in Canva."), "");

part("Each warning, complete");
const html = render("The course costs $99. No refunds.");
is("a named region with a heading", [html.includes('aria-labelledby="terms-check-p1"'), html.includes('<h3 id="terms-check-p1"')], [true, true]);
is("says how many", html.includes("2 things to check before you save"), true);
is("says it changes nothing by itself", html.includes("Nothing changes unless you press a button below and then save."), true);
is("the creator's words, quoted", html.includes("<q>The course costs $99. No refunds.</q>"), true);
is("the price fix names both amounts", html.includes("Change $99 to $49"), true);
is("every warning can be removed by the creator", (html.match(/Remove this sentence/g) ?? []).length, 2);
is("the buttons are buttons, not submits", (html.match(/<button type="button"/g) ?? []).length, 3);
is("a polite live count for screen readers", html.includes('aria-live="polite"'), true);
is("rendering changes nothing", changed, null);
done();
