/**
 * The store pages' email fields offer "Did you mean …?" (308 [TC1], unit 2;
 * components/email-field.tsx). Checked:
 *
 *   - every email field a buyer types into on a store's plain forms is an
 *     EmailField, in the store's language, with its name, id and look kept;
 *   - the field still posts what is in it, under the same name;
 *   - the first send of a likely slip waits once, and only once;
 *   - the line is in the store's own look.
 */
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EmailField } from "@/components/email-field";
import { done, is, part } from "./check";

const read = (file: string) => readFileSync(file, "utf8");

/** Each store form, and the fields (by name) it must ask through EmailField. */
const FIELDS: [string, string[]][] = [
  ["app/[handle]/orders/page.tsx", ["email"]],
  ["app/[handle]/manage/page.tsx", ["email"]],
  ["app/[handle]/affiliates/page.tsx", ["email", "paypal"]],
  ["app/[handle]/left/page.tsx", ["email", "email"]],
  ["app/[handle]/course/[product]/page.tsx", ["email"]],
  ["app/[handle]/podcast/[product]/page.tsx", ["email"]],
  ["app/[handle]/group/[group]/page.tsx", ["email"]],
  ["app/embed/[handle]/join/page.tsx", ["email"]],
  ["components/community-parts.tsx", ["email"]],
  ["components/store-join-box.tsx", ["email"]],
  ["components/store-contact-box.tsx", ["email"]],
  ["components/store-product.tsx", ["gift_to", "email", "email", "email"]],
  ["components/assistant-reminder-box.tsx", ["remind_email"]],
];

function main(): void {
  part("Every store form's email field");
  for (const [file, names] of FIELDS) {
    const text = read(file);
    const found = [...text.matchAll(/<EmailField\b[^>]*?\bname="([a-z_]+)"[^>]*?\/>/g)].map((m) => m[1]);
    is(`${file}: ${names.join(", ")}`, found.sort(), [...names].sort());
    is(`${file}: no plain email input left`, /<input[^>]*type="email"/.test(text), false);
    is(`${file}: in the store's language`, [...text.matchAll(/<EmailField\b[^>]*?\/>/g)].every((m) => /language=\{(store\.language|lang)\}/.test(m[0])), true);
  }

  part("What it draws");
  const html = renderToStaticMarkup(createElement(EmailField, { id: "orders-email", name: "email", className: "st-field", required: true, placeholder: "you@example.com", language: "fr" }));
  is("an email input with the same id, name and look, posting what is typed", html.includes('<input id="orders-email" type="email" required="" maxLength="254" autoComplete="email" placeholder="you@example.com" aria-describedby="orders-email-suggestion" class="st-field" name="email" value=""/>'), true);
  is("then its line, an empty polite region", html.includes('<div id="orders-email-suggestion" aria-live="polite" data-email-suggestion="true"></div>'), true);
  const kept = renderToStaticMarkup(createElement(EmailField, { name: "paypal", className: "st-field", defaultValue: "pay@example.com" }));
  is("a field with a saved address starts with it", kept.includes('value="pay@example.com"'), true);
  const field = read("components/email-field.tsx");
  is("the first send of a likely slip waits once", /if \(!holdForSuggestion\(typed, shown\.current\)\) return;\s*event\.preventDefault\(\);\s*shown\.current = typed;/.test(field), true);
  is("and a send the browser stops for a bad shape shows the line too", field.includes("onInvalid={() => setLeft(true)}"), true);
  is("the line in the store's own look", /store \? "st-note mt-2 text-sm/.test(read("components/email-suggestion.tsx")) && /store \? "st-btn-ghost"/.test(read("components/email-suggestion.tsx")), true);
}

main();
done();
