/**
 * A cover made in the studio (lib/cover-maker.ts, added 11 October 2026).
 * What is checked:
 *
 *   - the line above the title says what kind of thing the product is, in
 *     the store's language, and nothing for a product posted to the buyer;
 *   - the words typed are made one safe line of a set length;
 *   - the title is set as large as fits, a word moved whole to the next line,
 *     only a word wider than a line broken, and an ellipsis when nothing fits;
 *   - every word on every design reads at 4.5 to 1 whatever the store's
 *     color, the light behind the words of the glow included;
 *   - two titles do not draw the same cover.
 */
import { COVER_DESIGNS, COVER_MIN_CONTRAST, coverColors, coverKind, coverLabel, coverSeed, coverText, fitText, isCoverDesign, wrapText } from "@/lib/cover-maker";
import { ACCENTS, contrast, mix } from "@/lib/store-look";
import { LANGUAGE_CODES } from "@/lib/store-language";
import { done, is, part } from "./check";

// Every character as wide as half its size: enough to test the setting without a canvas.
const measure = (text: string, size: number) => Array.from(text).length * size * 0.5;

part("The line above the title");
const pdf = { file: { name: "Supper.pdf", contentType: "application/pdf" } };
is("what kind of thing it is", [coverKind(pdf), coverKind({ course: { id: "c" } }), coverKind({ recurring: { interval: "month" } }), coverKind({ call: {} }), coverKind({ podcast: {} }), coverKind({ bundle: ["a"] }), coverKind({ file: { name: "kit.zip", contentType: "application/zip" } }), coverKind({ link: "https://x.com" })], ["ebook", "course", "membership", "call", "podcast", "bundle", "download", "none"]);
is("a course is a course even with a file beside it, and a shipped thing names itself", [coverKind({ course: {}, ...pdf }), coverKind({ shipping: { cents: 0 }, ...pdf })], ["course", "none"]);
is("in the store's language", [coverLabel(pdf, "en"), coverLabel({ course: {} }, "fr"), coverLabel({ recurring: {} }, "pt"), coverLabel({ call: {} }, "de"), coverLabel({ link: "x" }, "es")], ["Ebook", "Formation en ligne", "Subscrição", "1:1-Sitzung", ""]);
is("in every language a store can speak", LANGUAGE_CODES.every((code) => ["ebook", "course", "membership", "call", "podcast", "bundle", "download"].every(() => coverLabel({ course: {} }, code).length > 0)), true);

part("The words, made safe");
is("one line, spaces kept single, cut to its length", [coverText("  The\nSupper\t Book  ", 80), coverText("x".repeat(100), 32).length, coverText(42, 10)], ["The Supper Book", 32, ""]);
is("an emoji is not cut in half", coverText("Cook 🍳🍳", 6), "Cook 🍳");

part("The title, set to fit");
const short = fitText("The Supper Book", 980, 5, 150, 64, measure);
is("a short title as large as it goes, on the lines it needs", [short.size, short.lines], [150, ["The Supper", "Book"]]);
const long = fitText("Thirty dinners in thirty minutes for families who are always busy", 980, 5, 150, 64, measure);
is("a long one smaller, within five lines, each line within the width", [long.size < 150, long.lines.length <= 5, long.lines.every((line) => measure(line, long.size) <= 980), long.lines.join(" ")], [true, true, true, "Thirty dinners in thirty minutes for families who are always busy"]);
is("a word moves whole to the next line", wrapText("aaaa bbbb", 10, 40, measure), ["aaaa", "bbbb"]);
is("only a word wider than the line is broken", wrapText("Donaudampfschifffahrt ok", 10, 50, measure), ["Donaudampf", "schifffahr", "t ok"]);
const crammed = fitText("word ".repeat(80).trim(), 300, 2, 150, 64, measure);
is("when nothing fits, the smallest size, two lines, the last ending in an ellipsis that fits", [crammed.size, crammed.lines.length, crammed.lines[1].endsWith("…"), measure(crammed.lines[1], 64) <= 300], [64, 2, true, true]);

part("Every word reads, whatever the color");
const randoms = Array.from({ length: 300 }, (_, i) => {
  const value = (Math.imul(i + 1, 2654435761) >>> 0) & 0xffffff;
  return `#${value.toString(16).padStart(6, "0")}`;
});
const all = [...ACCENTS.map((a) => a.hex), "#ffffff", "#000000", "#ffff00", "#00ffff", "#f5f5f5", ...randoms];
const failing = all.filter((accent) => {
  const c = coverColors(accent);
  const pairs: [string, string][] = [
    [c.solidInk, c.solid],
    [c.solidInk, c.solidShade],
    [c.solidInk, mix(c.solid, c.solidShade, 0.6)],
    [c.deepInk, c.deep],
    [c.deepInk, c.glow],
    [c.deepInk, mix(c.deep, c.glow, 0.5)],
    [c.paperInk, c.paper],
    [c.paperAccent, c.paper],
    [c.tintInk, c.tint],
    [c.tintAccent, c.tint],
  ];
  return pairs.some(([ink, ground]) => contrast(ink, ground) < COVER_MIN_CONTRAST);
});
is(`${all.length} colors, ten pairs of words and ground each, every one at 4.5 to 1 or more`, failing, []);
is("the creator's own color kept where it already reads", [coverColors("#5a36ee").solid, coverColors("#15112e").solid], ["#5a36ee", "#15112e"]);
is("a light color kept, with dark words on it", [coverColors("#ffd60a").solid, coverColors("#ffd60a").solidInk], ["#ffd60a", "#16131f"]);
is("a middle color neither reads on is deepened just enough for white words", [coverColors("#2f74f5").solid !== "#2f74f5", contrast(coverColors("#2f74f5").solid, "#ffffff") < 6, coverColors("#2f74f5").solidInk], [true, true, "#ffffff"]);

part("Designs");
is("six, each known", [COVER_DESIGNS.length, COVER_DESIGNS.every((d) => isCoverDesign(d.id)), isCoverDesign("canva")], [6, true, false]);
is("two titles, two different drawings", coverSeed("The Supper Book|book") !== coverSeed("Knife Skills|book"), true);

done();
