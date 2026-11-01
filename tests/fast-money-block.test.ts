/**
 * 567 [GD1] (d), unit 1: what the Terms already forbid is not only warned but
 * stopped. "What you may not sell" (app/terms/page.tsx) includes "anything that
 * promises fast or easy money, or income for little effort". So a product whose
 * title, summary or description promises that cannot be published, nor can a
 * published one be saved with it (app/api/store/product/route.ts): the creator
 * is told the passage, why and the fix, and nothing they wrote is changed.
 * Every other warning of lib/terms-check-rules.ts stays a warning.
 *
 * What fails here:
 *   - a fast or easy money promise that passes, or one said in the negative
 *     ("this is not a get-rich-quick scheme") that is stopped;
 *   - a refusal without the passage, the reason and the fix;
 *   - any other kind of warning blocking publication;
 *   - the product route publishing or saving a published product without the check.
 */
import { readFileSync } from "node:fs";
import { BLOCKING_KINDS, checkCreatorTerms, fastMoneyRefusal } from "@/lib/terms-check-rules";
import { fastMoneyMessage } from "@/components/product-editor";
import { done, is, part } from "./check";

const base = { ownHosts: [], priceCents: null, currency: "usd", immediateAccessConsent: true, realDeadline: false, realStockLimit: false, resaleLicense: false };
const kinds = (text: string) => checkCreatorTerms({ ...base, text }).map((w) => w.kind).filter((k) => k === "fast_money");

part("What the Terms forbid is found");
for (const text of [
  "Make easy money from home with this guide.",
  "Quick cash in a weekend.",
  "Learn how to make money fast.",
  "The get-rich-quick system nobody tells you about.",
  "Make money while you sleep with ready-made templates.",
  "Income with little effort, every month.",
  "Effortless income from day one.",
  "Fast profits with copy-and-paste posts.",
]) is(`stopped: ${text}`, kinds(text), ["fast_money"]);

part("Said in the negative, or ordinary words, it is not");
for (const text of [
  "This is not a get-rich-quick scheme: it takes real work.",
  "No easy money here, just a clear plan.",
  "A quick start guide to watercolor.",
  "Fast shipping on every print.",
  "Make money with your photos by learning to price them.",
]) is(`left alone: ${text}`, kinds(text), []);

part("A refusal says where, why and how to fix it");
const refused = fastMoneyRefusal({ title: "Bread basics", summary: "Make easy money baking at home.", about: "" });
is("found in the summary", refused?.field, "summary");
is("with the passage, the reason from the Terms and the fix", [refused?.excerpt.includes("easy money"), /fast or easy money/.test(refused?.why ?? ""), (refused?.fix ?? "").length > 20], [true, true, true]);
is("nothing to refuse in plain product words", fastMoneyRefusal({ title: "Bread basics", summary: "Ten loaves, step by step.", about: "Flour, water, salt." }), null);
is("the description is read too", fastMoneyRefusal({ title: "Guide", summary: "", about: "Get quick cash with this." })?.field, "about");
is("only the Terms' own prohibition blocks; every other kind stays a warning", [...BLOCKING_KINDS], ["fast_money"]);
is("an earnings claim alone does not block", fastMoneyRefusal({ title: "Course", summary: "Build a six-figure business.", about: "" }), null);

part("The product route stops it before publishing or saving a published product");
const route = readFileSync("app/api/store/product/route.ts", "utf8");
is("adding: checked with what was sent", /action === "add"[\s\S]{0,400}fastMoneyRefusal\(/.test(route) || /fastMoneyRefusal\(\{ title, summary, about: about \?\? "" \}\)/.test(route), true);
is("a refusal answers fast_money with the passage", /error: "fast_money"/.test(route) && /passage: refused/.test(route), true);
is("publishing a draft reads its description and is checked", /body\.hidden === false[\s\S]{0,600}fastMoneyRefusal\(/.test(route), true);
part("The studio says it in words the creator can act on");
const said = fastMoneyMessage(refused);
is("where, the words, why and the fix, and that nothing was changed", [/the short description/.test(said), said.includes("easy money"), /Terms do not allow/.test(said), /Nothing you wrote was changed/.test(said)], [true, true, true, true]);
is("the warnings panel says this one keeps the product off the store", /BLOCKING_KINDS\.has\(w\.kind\)[\s\S]{0,200}keeps this product off your store/.test(readFileSync("components/terms-check-panel.tsx", "utf8")), true);
is("an answer without its passage still says what to do", /Remove the promise/.test(fastMoneyMessage(undefined)), true);
done();
