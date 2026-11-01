/**
 * More feature-page cards (531 [VP1], units 2 and 3; added 1 November 2026):
 * bundles, quizzes and certificates, license keys, webhooks, calendar sync
 * and Discord access, each a piece of the
 * studio's real screen in HTML, with its words and figures from the code.
 * Checked: each page shows its card; the studio's own labels; every figure
 * is one the code holds (the bundle's 2 to 20, the quiz's default pass mark
 * and tries, a key's default shape), and anything else is marked as an
 * example by its caption; real text, the drawing hidden beside its read
 * caption.
 */
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EXAMPLE_KEY, FeatureVisual } from "@/components/feature-visuals";
import { MAX_BUNDLE_ITEMS, MIN_BUNDLE_ITEMS } from "@/lib/bundle-rules";
import { DEFAULT_ATTEMPTS, DEFAULT_PASS_PERCENT } from "@/lib/quiz";
import { DEFAULT_KEYS } from "@/lib/key-setup";
import { KEY_ALPHABET, sampleKey } from "@/lib/licence-key-rules";
import { WEBHOOK_EVENTS } from "@/lib/webhooks";
import { MAX_ENDPOINTS, shortAddress } from "@/lib/webhook-limits";
import { LOOKAHEAD_DAYS, MAX_FEEDS } from "@/lib/calendar-limits";
import { MAX_DISCORD_PRODUCTS, MAX_PRODUCT_ROLES } from "@/lib/discord-rules";
import { findPage } from "@/lib/site-pages";
import { done, is, part } from "./check";

const text = (html: string) => html.replace(/<[^>]+>/g, "\n").split("\n").map((s) => s.trim()).filter(Boolean);
const read = (file: string) => readFileSync(file, "utf8");
const draw = (visual: "bundles" | "quizzes" | "keys" | "webhooks" | "calendar" | "discord") => renderToStaticMarkup(createElement(FeatureVisual, { visual, tone: "light" }));
const hidden = (html: string) => html.startsWith('<figure class="w-full min-w-0 max-w-[26rem]"><div aria-hidden="true">');

function main(): void {
  part("Bundles");
  is("the bundles page shows its card", findPage("platform", "bundles")?.visual, "bundles");
  const bundle = draw("bundles");
  const b = text(bundle);
  is("the editor's own count of what is in it", b.includes(`In it: 3 of ${MAX_BUNDLE_ITEMS}`), true);
  is("and its own words for the choosing", [b.includes("Let each buyer choose which ones they get"), read("components/bundle-editor.tsx").includes("Let each buyer choose which ones they get")], [true, true]);
  is("the editor's worth line, summed from the example prices (shown once a bundle has its minimum)", [b.includes("$77 of products for $49"), MIN_BUNDLE_ITEMS <= 3, read("components/bundle-editor.tsx").includes("`${formatMoney(worth, currency)} of products for ${formatMoney(priceCents, currency)}`")], [true, true, true]);
  is("no error message drawn as a note (the 2-to-20 rule is said only on a refused save)", b.some((w) => /bundle holds/.test(w)), false);
  is("the prices are said to be an example", b.some((w) => /example/.test(w) && /price/i.test(w)), true);
  is("drawn, hidden, beside its caption", hidden(bundle), true);

  part("Quizzes and certificates");
  is("the quizzes page shows its card", findPage("platform", "quizzes-and-certificates")?.visual, "quizzes");
  const quiz = draw("quizzes");
  const q = text(quiz);
  const quizEditor = read("components/quiz-editor.tsx");
  is("the open quiz's own fields, at the values a new quiz starts with", [q.includes("Pass mark (%)"), q.includes("Tries allowed"), q.includes(String(DEFAULT_PASS_PERCENT)), q.includes(String(DEFAULT_ATTEMPTS)), quizEditor.includes('<span className="field-label">Pass mark (%)</span>'), quizEditor.includes('<span className="field-label">Tries allowed</span>')], [true, true, true, true, true, true]);
  is("the answers under the editor's own legend", [q.includes("Answers — check the right one"), quizEditor.includes("Answers — check the right {")], [true, true]);
  is("an answer wraps on a phone instead of being cut", quiz.includes("min-w-0 flex-1 break-words"), true);
  is("the certificate as the course page says it", [q.includes("Certificate of completion"), read("app/studio/course/[product]/page.tsx").includes("Certificate of completion")], [true, true]);
  is("the questions are said to be an example", q.some((w) => /example/.test(w)), true);
  is("drawn, hidden, beside its caption", hidden(quiz), true);

  part("License keys");
  is("the license keys page shows its card", findPage("platform", "license-keys")?.visual, "keys");
  const keys = draw("keys");
  const k = text(keys);
  is("the two places a key comes from, in the editor's words", ["Made here, one per sale", "From a list you upload"].every((w) => k.includes(w) && read("components/licence-key-editor.tsx").includes(w)), true);
  is("the preview in the default shape, as the editor shows it", [k.some((w) => w.includes(`like ${sampleKey(DEFAULT_KEYS)}.`)), DEFAULT_KEYS.groups, DEFAULT_KEYS.groupLength], [true, 4, 4]);
  is("a key given looks like one: the default shape, the keys' own letters", [k.includes(EXAMPLE_KEY), EXAMPLE_KEY.split("-").map((g) => g.length), [...EXAMPLE_KEY.replace(/-/g, "")].every((ch) => KEY_ALPHABET.includes(ch))], [true, [4, 4, 4, 4], true]);
  is("the caption says the key is an example, and only made keys are new", /The key, the buyer and the order are an example\. Keys made here are new for each sale\./.test(keys), true);
  is("the editor's own heading for the keys given", [k.includes("Keys given"), read("components/licence-key-editor.tsx").includes('<span className="field-label">Keys given</span>')], [true, true]);
  is("the editor's own sentence for a made key, with the sample", k.includes(`Each buyer gets a new key made for them, like ${sampleKey(DEFAULT_KEYS)}. No key is ever given twice.`), true);
  is("the emails are said to be an example", k.some((w) => /example/.test(w)), true);
  is("drawn, hidden, beside its caption", hidden(keys), true);

  part("Webhooks");
  is("the webhooks page shows its card", findPage("platform", "webhooks")?.visual, "webhooks");
  const hooks = draw("webhooks");
  const h = text(hooks);
  const editor = read("components/webhook-editor.tsx");
  is("the studio card's heading and count", [h.includes("Webhooks and Zapier"), editor.includes("Webhooks and Zapier"), h.includes(`1 of ${MAX_ENDPOINTS}`), MAX_ENDPOINTS], [true, true, true, 5]);
  is("deliveries by the code's own event names, newest first, under the editor's heading", [h.filter((w) => (WEBHOOK_EVENTS as readonly string[]).includes(w)), h.includes("Last 3 deliveries"), editor.includes("`Last ${view.log.length} ${view.log.length === 1 ? \"delivery\" : \"deliveries\"}`")], [["refund.issued", "list.joined", "sale.completed"], true, true]);
  is("the endpoint as the studio shortens it, never the whole secret path", [h.includes(shortAddress("https://hooks.zapier.com/hooks/catch/1234567/abcdefg/")), h.some((w) => w.includes("1234567"))], [true, false]);
  is("the editor reads the same figure as the server", [editor.includes('import { MAX_ENDPOINTS } from "@/lib/webhook-limits";'), /const MAX_ENDPOINTS = /.test(editor), read("lib/webhooks.ts").includes('import { MAX_ENDPOINTS, shortAddress } from "@/lib/webhook-limits";')], [true, false, true]);
  is("in the editor's words", ["Every event", "Sending"].every((w) => h.includes(w) && editor.includes(`"${w}"`)) && h.includes("Delivered (200)") && editor.includes("`Delivered${d.lastStatus ? ` (${d.lastStatus})` : \"\"}`"), true);
  is("the address and deliveries said to be an example", h.some((w) => /example/.test(w)), true);
  is("drawn, hidden, beside its caption", hidden(hooks), true);

  part("Calendar sync");
  is("the calendar sync page shows its card", findPage("platform", "calendar-sync")?.visual, "calendar");
  const cal = draw("calendar");
  const c = text(cal);
  const calEditor = read("components/calendar-editor.tsx");
  is("the studio card's heading and count", [c.includes("Your calendars"), calEditor.includes("Your calendars"), c.includes(`1 of ${MAX_FEEDS} read`)], [true, true, true]);
  is("a calendar's line in the editor's format, with the code's look-ahead and the day it was added", [c.includes(`Read 4 min ago · 12 busy times in the next ${LOOKAHEAD_DAYS} days · added Oct 20, 2026`), calEditor.includes("in the next ${LOOKAHEAD_DAYS} days`"), calEditor.includes("`${minutes} min ago`"), calEditor.includes("` · added ${addedOn(feed.addedAt)}`")], [true, true, true, true]);
  is("the editor reads the same figures as the server", [calEditor.includes('import { LOOKAHEAD_DAYS, MAX_FEEDS } from "@/lib/calendar-limits";'), /const MAX_FEEDS = /.test(calEditor), read("lib/calendar-sync.ts").includes('import { LOOKAHEAD_DAYS, MAX_FEEDS } from "@/lib/calendar-limits";')], [true, false, true]);
  is("the line wraps on a phone, so the look-ahead is never cut", cal.includes('block break-words text-[12px] text-ink-soft">Read 4 min ago'), true);
  is("the bookings feed, under its own heading, with its own button", [c.includes("Your bookings in your calendar"), calEditor.includes("Your bookings in your calendar"), c.includes("Copy address"), calEditor.includes('"Copy address"')], [true, true, true, true]);
  is("drawn, hidden, beside its caption", hidden(cal), true);

  part("Discord access");
  is("the Discord page shows its card", findPage("platform", "discord-access")?.visual, "discord");
  const disc = draw("discord");
  const d = text(disc);
  const discordStudio = read("components/discord-studio.tsx");
  is("the studio's heading", [d.includes("Which products give which roles"), discordStudio.includes("Which products give which roles")], [true, true]);
  is("its limits, from the code", d.includes(`Up to ${MAX_PRODUCT_ROLES} roles for each product, on up to ${MAX_DISCORD_PRODUCTS} products.`) && discordStudio.includes("`Up to ${limits.roles} roles for each product, on up to ${limits.products} products."), true);
  is("each product as the studio draws it: its title, how many roles it gives, a pill per role", [d.includes("Gives 1 role."), d.includes("Gives 2 roles."), discordStudio.includes("`Gives ${saved.length} ${saved.length === 1 ? \"role\" : \"roles\"}.`")], [true, true, true]);
  // How soon roles are taken back is not drawn: the next check is CHECK_HOURS after the last plus up to the cron's half hour, and longer while Stripe does not answer.
  is("no promise of how soon roles are taken back", d.some((w) => /taken back|within \d+ hours/.test(w)), false);
  is("drawn, hidden, beside its caption", hidden(disc), true);

  part("Nothing that is not the code's or marked as an example");
  for (const [name, words, allowed] of [
    ["bundles", b, /^(In it: 3 of \d+|\$77 of products for \$49|\$\d+(\.\d\d)?|.*example.*)$/],
    ["quizzes", q, /^(70|3|.*example.*)$/],
    ["keys", k, /^(K7QM-R4TX-9WHC-P2ND|Each buyer gets a new key made for them, like XXXX-XXXX-XXXX-XXXX\. No key is ever given twice\.|.*example.*)$/],
    ["webhooks", h, /^(1 of \d+|Last 3 deliveries|Delivered \(200\)|· Nov 1, \d+:\d\d PM|hooks\.zapier\.com\/hooks\/cat…bcdefg|.*example.*)$/],
    ["calendar", c, /^(1 of \d+ read|Read 4 min ago · 12 busy times in the next \d+ days · added Oct 20, 2026|.*example.*)$/],
    ["discord", d, /^(Up to \d+ roles for each product, on up to \d+ products\.|Gives \d roles?\.|.*example.*)$/],
  ] as const) {
    is(`${name}: every figure is the code's, or an example said as one`, words.filter((w) => /\d/.test(w) && !allowed.test(w)), []);
  }
}

main();
done();
