/**
 * Questions from someone starting out, on the funnels page (534 [FQ1], unit
 * 1, lib/funnel-faq.ts; added 1 November 2026). Checked, as the item asks:
 *
 *   - the six questions are in the page's existing "Questions" block, and its
 *     FAQPage data is built from the same items (components/topic-page.tsx);
 *   - every kind of funnel is named with its own hint, from the code;
 *   - the steps are the studio's own buttons, and no time is promised;
 *   - "Can I try it": while plans are not on sale it says so and points to
 *     the demo, marked as one; once on sale the trial's days come from the
 *     code; it never starts with "free";
 *   - opens: none counted, said in the words the email page already uses;
 *   - "Do funnels work?": no number of customers or sales; the example line
 *     is the studio's own, from lib/funnel-metrics.ts;
 *   - no forbidden word, no http:// link, no other number but the code's.
 */
import { readFileSync } from "node:fs";
import { FUNNEL_TYPES } from "@/lib/funnel-types";
import { funnelStepMetrics } from "@/lib/funnel-metrics";
import { FUNNEL_STUDIO_BUTTONS, funnelBeginnerQuestions } from "@/lib/funnel-faq";
import { findPage } from "@/lib/site-pages";
import { TRIAL_DAYS } from "@/lib/plan";
import { done, is, part } from "./check";

const ask = (items: { q: string; a: string }[], q: string) => items.find((item) => item.q === q)?.a ?? "";

function main(): void {
  const page = findPage("platform", "funnels");
  const block = page?.blocks.find((b) => b.kind === "faq");
  const items = block && block.kind === "faq" ? block.items : [];
  const closed = funnelBeginnerQuestions(false, 14);
  const open = funnelBeginnerQuestions(true, 14);

  part("In the page's own Questions block");
  is("the six questions, first, in the existing block", items.slice(0, 6).map((i) => i.q), ["What is a funnel?", "Which kind of funnel should I use?", "How long does it take to build one?", "Can I try it before paying?", "Does it count opens and clicks?", "Do funnels work?"]);
  is("the earlier questions are still there", items.some((i) => i.q === "Can a buyer be charged without meaning to?"), true);
  is("the FAQPage data is built from the same items", /"@type": "FAQPage"[\s\S]{0,400}items\.map|mainEntity: block\.items|block\.items\.map/.test(readFileSync("components/topic-page.tsx", "utf8")), true);

  part("Answered from the code");
  const kinds = ask(closed, "Which kind of funnel should I use?");
  is("every kind of funnel, with its own hint", FUNNEL_TYPES.every((t) => kinds.includes(`${t.label}: ${t.hint}`)), true);
  const how = ask(closed, "How long does it take to build one?");
  const picker = readFileSync("components/funnel-type-picker.tsx", "utf8");
  is("the steps are the studio's own buttons", FUNNEL_STUDIO_BUTTONS.every((label) => how.includes(`“${label}”`) && picker.includes(label)), true);
  is("no time promised", /\b(minute|minutes|hour|hours|seconds|quick|fast|instantly|in no time)\b/i.test(how), false);
  is("plans closed: it says so, and points to the demo, marked as one", [ask(closed, "Can I try it before paying?").startsWith("Paid plans are not on sale yet"), ask(closed, "Can I try it before paying?").includes("https://marktmorgen.com/demo, a made-up store marked as a demo")], [true, true]);
  is("plans open: the trial's days from the code", ask(open, "Can I try it before paying?").includes("14-day trial") && ask(funnelBeginnerQuestions(true), "Can I try it before paying?").includes(`${TRIAL_DAYS}-day trial`), true);
  is("never starts with “free”", [...closed, ...open].every((i) => !/^free\b/i.test(i.a)), true);
  const opens = ask(closed, "Does it count opens and clicks?");
  is("no email opens counted, in the email page's own words", opens.includes("no tracking pixel and no open rate") && readFileSync("lib/feature-pages.ts", "utf8").includes("no tracking pixel and no open rate"), true);
  const works = ask(closed, "Do funnels work?");
  is("no number of customers or sales; the studio's own line as the example", [works.includes("We publish no number of customers or sales"), works.includes(funnelStepMetrics({ seen: 40, done: 6, product: true, free: false })), works.includes("Counts unavailable")], [true, true, true]);

  part("Nothing it may not say");
  const all = [...closed, ...open].map((i) => `${i.q} ${i.a}`).join(" ");
  is("no forbidden word", /proven|guaranteed|24\/7|\bboom\b|in minutes|support team|round the clock/i.test(all), false);
  is("no http:// link", all.includes("http://"), false);
  const numbers = closed.flatMap((i) => i.a.match(/\d[\d,.%]*/g) ?? []);
  is("its only numbers are the example line's, from the code", numbers, ["40", "6", "15%"]);
}

main();
done();
