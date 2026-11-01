/**
 * "Did you mean …?" under an email field (308 [TC1], lib/email-typo.ts,
 * components/email-suggestion.tsx; added 1 November 2026). Checked:
 *
 *   - common slips in a provider's name and in .com/.net/.org/.co.uk are
 *     offered the right address, with the name before the @ as typed;
 *   - a right address, a creator's own domain and a real country ending
 *     are never questioned;
 *   - it makes no request, and its code reaches for nothing that could;
 *   - the line is in a polite live region named by the field, with a real
 *     button that says the whole address, and nothing changes until it is
 *     pressed;
 *   - every store language says it, with the address;
 *   - the creator's login form uses it.
 */
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { COMMON_PROVIDERS, ENDING_TYPOS, editsBetween, suggestEmail } from "@/lib/email-typo";
import { EMAIL_TYPO_WORDS } from "@/lib/buyer-words/email-typo";
import { EmailSuggestion } from "@/components/email-suggestion";
import { LANGUAGE_CODES } from "@/lib/store-language";
import { done, is, part } from "./check";

const read = (file: string) => readFileSync(file, "utf8");

function main(): void {
  part("Slips that are offered the right address");
  for (const [typed, meant] of [
    ["maker@gmial.com", "maker@gmail.com"],
    ["maker@gmal.com", "maker@gmail.com"],
    ["maker@gnail.com", "maker@gmail.com"],
    ["maker@gmail.con", "maker@gmail.com"],
    ["maker@gmail.cmo", "maker@gmail.com"],
    ["maker@gmail.co", "maker@gmail.com"],
    ["maker@gmail", "maker@gmail.com"],
    ["maker@hotmial.com", "maker@hotmail.com"],
    ["maker@hotmal.com", "maker@hotmail.com"],
    ["maker@yaho.com", "maker@yahoo.com"],
    ["maker@yahoo.co.uj", "maker@yahoo.co.uk"],
    ["maker@outlok.com", "maker@outlook.com"],
    ["maker@icloud.co", "maker@icloud.com"],
    ["maker@iclod.com", "maker@icloud.com"],
    ["maker@comcast.ner", "maker@comcast.net"],
    ["maker@btinternt.com", "maker@btinternet.com"],
    ["maker@orange.fe", null],
    ["maker@harborkitchen.con", "maker@harborkitchen.com"],
    ["maker@harborkitchen.ogr", "maker@harborkitchen.org"],
    ["Maker.Name+shop@GMIAL.COM", "Maker.Name+shop@gmail.com"],
    ["  maker@gmial.com  ", "maker@gmail.com"],
    ["maker@gmial.com.", "maker@gmail.com"],
  ] as const) {
    is(`${typed.trim()} → ${meant ?? "nothing"}`, suggestEmail(typed), meant);
  }

  part("Addresses that are never questioned");
  for (const typed of [
    "maker@gmail.com",
    "maker@outlook.com",
    "maker@outlook.pt",
    "maker@yahoo.co.jp",
    "maker@protonmail.ch",
    "maker@harborkitchen.com",
    "maker@harborkitchen.co",
    "maker@harborkitchen.cm",
    "maker@studio.new",
    "maker@mail.de",
    "maker@gmx.at",
    "maker@web.de",
    "maker@me.com",
    "maker@mac.com",
    "maker@live.it",
    "maker@example.org",
    "",
    "maker",
    "@gmial.com",
    "maker@@gmial.com",
    "ma ker@gmial.com",
    `${"m".repeat(250)}@gmial.com`,
  ]) {
    is(`${typed || "(empty)"}: nothing said`.slice(0, 80), suggestEmail(typed), null);
  }
  is("every provider in the list is left alone", COMMON_PROVIDERS.filter((p) => suggestEmail(`maker@${p}`) !== null), []);
  is("and the list has no repeats", COMMON_PROVIDERS.length, new Set(COMMON_PROVIDERS).size);
  is("no misspelled ending is a provider's own", Object.keys(ENDING_TYPOS).filter((typo) => COMMON_PROVIDERS.some((p) => p.endsWith(`.${typo}`))), []);
  is("edits: added, missing, changed, swapped", [editsBetween("gmail", "gmaill"), editsBetween("gmail", "gmal"), editsBetween("gmail", "gmaul"), editsBetween("gmail", "gmial"), editsBetween("gmail", "yahoo")], [1, 1, 1, 1, 5]);

  part("No request, ever");
  const realFetch = globalThis.fetch;
  let asked = 0;
  globalThis.fetch = (async () => {
    asked += 1;
    return new Response("{}");
  }) as typeof fetch;
  suggestEmail("maker@gmial.com");
  renderToStaticMarkup(createElement(EmailSuggestion, { id: "s", inputId: "e", value: "maker@gmial.com", show: true, onUse: () => undefined }));
  globalThis.fetch = realFetch;
  is("nothing was fetched", asked, 0);
  for (const file of ["lib/email-typo.ts", "lib/buyer-words/email-typo.ts", "components/email-suggestion.tsx"]) {
    is(`${file} reaches for nothing that could send`, /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|document\.cookie|import\(/.test(read(file)), false);
  }

  part("The line under the field");
  let used = "";
  const quiet = renderToStaticMarkup(createElement(EmailSuggestion, { id: "signin-suggestion", inputId: "signin-email", value: "maker@gmial.com", show: false, onUse: (a: string) => (used = a) }));
  is("before the person leaves the field: an empty polite region, already on the page", quiet, '<div id="signin-suggestion" aria-live="polite" data-email-suggestion="true"></div>');
  const right = renderToStaticMarkup(createElement(EmailSuggestion, { id: "s", inputId: "e", value: "maker@gmail.com", show: true, onUse: () => undefined }));
  is("a right address: still empty", right, '<div id="s" aria-live="polite" data-email-suggestion="true"></div>');
  const shown = renderToStaticMarkup(createElement(EmailSuggestion, { id: "s", inputId: "e", value: "maker@gmial.com", show: true, onUse: (a: string) => (used = a) }));
  is("after: the question with the whole address", shown.includes("<p class=\"font-semibold\">Did you mean maker@gmail.com?</p>"), true);
  is("that what was typed can be kept", shown.includes("If what you typed is right, keep it."), true);
  is("a real button, not a submit, named with the address", /<button type="button" class="btn btn-secondary btn-sm mt-2">Use maker@gmail.com<\/button>/.test(shown), true);
  is("and nothing was changed by showing it", used, "");
  is("its button is at least 44 px tall (btn-sm)", /\.btn-sm \{\s*min-height: 44px;/.test(read("app/globals.css")), true);
  is("nothing in it moves or blinks", /animate-|transition|@keyframes/.test(read("components/email-suggestion.tsx")), false);
  is("pressing it gives the focus back to the field", /onUse\(suggested\);\s*document\.getElementById\(inputId\)\?\.focus\(\);/.test(read("components/email-suggestion.tsx")), true);

  part("In every store language");
  for (const language of [...LANGUAGE_CODES]) {
    const words = EMAIL_TYPO_WORDS[language];
    is(`${language}: the question and the button carry the address`, [words.didYouMean("a@gmail.com").includes("a@gmail.com"), words.use("a@gmail.com").includes("a@gmail.com"), words.keep.length > 10], [true, true, true]);
  }
  is("no new language", Object.keys(EMAIL_TYPO_WORDS).sort(), [...LANGUAGE_CODES].sort());

  part("Where it is used");
  const signin = read("components/signin-form.tsx");
  is("the creator's login form: the line follows the field", /<EmailSuggestion\s+id="signin-suggestion"\s+inputId="signin-email"/.test(signin), true);
  is("and the field is described by it", signin.includes('aria-describedby={`${state.kind === "error" ? "signin-error " : shapeProblem ? "signin-hint " : ""}signin-suggestion`}'), true);
  is("shown once the person has left the field or tried to send, and not over a shape problem", signin.includes("show={touched && !shapeProblem}"), true);
}

main();
done();
