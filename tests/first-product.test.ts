/**
 * A first product made inside Marktmorgen, unit 1 (490 [PP1],
 * lib/first-product.ts; added 1 November 2026). Checked:
 *
 *   - four formats, each asking at most five questions, every one by buttons;
 *   - each format's free field has its own label and an example;
 *   - the outline follows the answers (the number of parts is the number on
 *     the button tapped), and an answer the creator did not see is never used;
 *   - the outline holds only structure and the creator's own title: no
 *     number, figure, study, testimonial or promised result is put in it;
 *   - the starting price is inside $4 to $35 and moves only with the length.
 */
import { FIRST_FORMATS, FORMAT_INFO, MAX_QUESTIONS, answered, outlineFor, startingPrice } from "@/lib/first-product";
import { done, is, part } from "./check";

/** Words a draft must never carry unless the creator wrote them. */
const PROMISE = /\b(guarantee|proven|study|studies|research|percent|%|testimonial|results?|earn|income|double|triple|\$\d)/i;

function main(): void {
  part("The formats and their questions");
  is("four formats", [...FIRST_FORMATS], ["guide", "checklist", "workbook", "template"]);
  for (const format of FIRST_FORMATS) {
    const info = FORMAT_INFO[format];
    is(`${format}: at most ${MAX_QUESTIONS} questions, each with two to four buttons`, info.questions.length <= MAX_QUESTIONS && info.questions.every((q) => q.choices.length >= 2 && q.choices.length <= 4), true);
    is(`${format}: no question asked twice, no button twice`, new Set(info.questions.map((q) => q.id)).size === info.questions.length && info.questions.every((q) => new Set(q.choices.map((c) => c.id)).size === q.choices.length), true);
    is(`${format}: one free field, with a label and an example`, [info.know.endsWith("?"), info.example.length > 20, info.what.length > 20], [true, true, true]);
    is(`${format}: asks how long`, info.questions.some((q) => q.id === "length"), true);
  }

  part("The outline follows the answers");
  is("a medium guide: who it is for, five steps, a summary", outlineFor("guide", { length: "medium", ending: "summary" }).parts.map((p) => p.heading), ["Who this is for", "Step 1", "Step 2", "Step 3", "Step 4", "Step 5", "Summary"]);
  is("a long guide with no ending page: eight steps", outlineFor("guide", { length: "long", ending: "none" }).parts.length, 9);
  is("a checklist of 20 grouped by stage", (() => {
    const parts = outlineFor("checklist", { length: "medium", groups: "stages" }).parts;
    return [parts.length, parts[0].heading, parts.at(-1)?.heading, parts.every((p) => p.kind === "item")];
  })(), [20, "Before: item 1", "After: item 6", true]);
  is("a short checklist in one list", outlineFor("checklist", { length: "short", groups: "one" }).parts.map((p) => p.heading).slice(0, 2), ["Item 1", "Item 2"]);
  is("a workbook of six exercises", outlineFor("workbook", { length: "medium" }).parts.filter((p) => p.kind === "exercise").length, 6);
  is("a template of eight sections", outlineFor("template", { length: "long" }).parts.filter((p) => p.kind === "field").length, 8);
  for (const format of FIRST_FORMATS) {
    const lengths = FORMAT_INFO[format].questions.find((q) => q.id === "length")!.choices;
    for (const choice of lengths) {
      const shown = Number(/\d+/.exec(choice.label)?.[0]);
      const kind = format === "guide" ? "text" : format === "checklist" ? "item" : format === "workbook" ? "exercise" : "field";
      const made = outlineFor(format, { length: choice.id }).parts.filter((p) => p.kind === kind && (format !== "guide" || p.heading.startsWith("Step"))).length;
      is(`${format}, ${choice.id}: as many parts as the button says (${shown})`, made, shown);
    }
  }
  is("an answer not among the buttons is not used: the first button is", answered("guide", { length: "huge", tone: "<script>" }), { reader: "new", length: "short", tone: "friendly", ending: "summary" });

  part("Only structure and the creator's own words");
  is("the creator's title is kept, trimmed", outlineFor("guide", {}, "  Sunday dinners in two hours  ").title, "Sunday dinners in two hours");
  is("without one, a placeholder that asks for it", outlineFor("workbook", {}).title, "Your workbook's title");
  for (const format of FIRST_FORMATS) {
    for (const length of ["short", "medium", "long"]) {
      const outline = outlineFor(format, { length });
      const text = outline.parts.map((p) => `${p.heading} ${p.ask}`).join(" ");
      is(`${format}, ${length}: no figure, study, testimonial or promised result`, PROMISE.test(text), false);
    }
  }
  is("the format's own words carry none either", FIRST_FORMATS.filter((f) => PROMISE.test(`${FORMAT_INFO[f].what} ${FORMAT_INFO[f].know}`)), []);

  part("The starting price");
  for (const format of FIRST_FORMATS) {
    const prices = ["short", "medium", "long"].map((length) => startingPrice(format, { length }));
    is(`${format}: inside $4 to $35, rising with the length`, prices.every((p) => p.cents >= 400 && p.cents <= 3500 && p.from === 400 && p.to === 3500) && prices[0].cents < prices[1].cents && prices[1].cents < prices[2].cents, true);
  }
  is("the same for every format: it moves only with the length", startingPrice("guide", { length: "medium" }).cents === startingPrice("template", { length: "medium" }).cents, true);
}

main();
done();
