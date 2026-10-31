/**
 * 98 [D2-COMPLIANCE-REVIEW] unit 2: "Can everyone follow your lessons?" in
 * the course editor (lib/course-access-check.ts, AX274 Part A item 6: the
 * studio warns about a video with no captions and offers the fix; it never
 * changes the creator's content). Read only from what the course page
 * already reads: the course, each video's state and its caption languages.
 *
 * Checked: a course with no video gets nothing; a lesson video that can take
 * captions and has none is named, in course order, with a link that opens
 * that lesson at its captions; one with captions, or with captions being
 * written, is not named; a video still uploading or that failed is left to
 * its own state; a video kept where captions cannot be added is counted
 * apart and never called fine; nothing claims the course is accessible.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { CourseAccessCheck } from "@/components/course-access-check";
import { captionsAnchor, lessonCaptionCheck } from "@/lib/course-access-check";
import type { Course } from "@/lib/course";
import { readFileSync } from "node:fs";
import { done, is, part } from "./check";

const folder = "f".repeat(32);
const sv = (lesson: string, n: number) => `stream/${folder}/${lesson}/${String(n).repeat(8)}-${String(n).repeat(4)}-${String(n).repeat(4)}-${String(n).repeat(4)}-${String(n).repeat(12)}`;
const file = (pathname: string) => ({ pathname, name: "lesson.mp4", bytes: 10, contentType: "video/mp4", addedAt: "2026-10-31T00:00:00.000Z" });
const lesson = (id: string, title: string, video: string | null) => ({ id, title, video: video ? file(video) : null }) as unknown as Course["modules"][number]["lessons"][number];
const course = (lessons: ReturnType<typeof lesson>[][]) =>
  ({ id: "c1", modules: lessons.map((list, i) => ({ id: `m${i}`, title: `Module ${i + 1}`, dripDays: 0, lessons: list })), certificate: false, startsAt: null }) as unknown as Course;

function main(): void {
  part("Nothing to say about a course with no video");
  is("no lesson video: no check", lessonCaptionCheck(course([[lesson("aaaaaaaaaaaa", "Welcome", null)]]), {}, {}, {}), null);

  part("Who is named, and who is not");
  const a = sv("aaaaaaaaaaaa", 1);
  const b = sv("bbbbbbbbbbbb", 2);
  const c = sv("cccccccccccc", 3);
  const d = sv("dddddddddddd", 4);
  const e = sv("eeeeeeeeeeee", 5);
  const full = course([
    [lesson("aaaaaaaaaaaa", "Getting started", a), lesson("bbbbbbbbbbbb", "Your first loaf", b)],
    [lesson("cccccccccccc", "Shaping", c), lesson("dddddddddddd", "Scoring", d), lesson("eeeeeeeeeeee", "Baking", e), lesson("ffffffffffff", "Old upload", `files/${folder}/old.mp4`)],
  ]);
  const states = { [a]: "ready", [b]: "working", [c]: "ready", [d]: "upload", [e]: "ready" } as const;
  const captions = { [c]: [{ lang: "en", label: "English" }] };
  const writing = { [e]: ["en"] };
  const check = lessonCaptionCheck(full, states, captions, writing);
  is("a ready or preparing video with no captions is named, in course order", check?.missing, [{ id: "aaaaaaaaaaaa", title: "Getting started" }, { id: "bbbbbbbbbbbb", title: "Your first loaf" }]);
  is("one with captions, or with captions being written, is not; one still uploading is left to its own state", [check?.writing, check?.done], [1, false]);
  is("a video kept where captions cannot be added is counted apart, never as fine", check?.elsewhere, 1);
  const all = lessonCaptionCheck(full, { ...states, [d]: "ready" }, { [a]: [{ lang: "en", label: "English" }], [b]: [{ lang: "es", label: "Español" }], [c]: [{ lang: "en", label: "English" }], [d]: [{ lang: "en", label: "English" }] }, writing);
  is("every video that can take captions has them: done, though one is kept elsewhere", [all?.missing, all?.done, all?.elsewhere], [[], false, 1]);
  const clean = lessonCaptionCheck(course([[lesson("aaaaaaaaaaaa", "Getting started", a)]]), { [a]: "ready" }, { [a]: [{ lang: "en", label: "English" }] }, {});
  is("only captioned videos: done", [clean?.done, clean?.missing], [true, []]);

  part("What the creator sees");
  const html = renderToStaticMarkup(CourseAccessCheck({ check, productId: "p1" }));
  is("a heading that asks the question", html.includes("<h2") && html.includes("Can everyone follow your lessons?"), true);
  is("each lesson named, with a link that opens it at its captions", [html.includes("Getting started"), html.includes(`href="?lesson=aaaaaaaaaaaa#${captionsAnchor("aaaaaaaaaaaa")}"`), html.includes("Add captions to “Getting started”")], [true, true, true]);
  is("a title is never markup", renderToStaticMarkup(CourseAccessCheck({ check: { ...check!, missing: [{ id: "aaaaaaaaaaaa", title: "<b>x</b>" }] }, productId: "p1" })).includes("<b>x</b>"), false);
  is("what is being written, and what is kept elsewhere, said plainly", [/being written/.test(html), /cannot be added/.test(html)], [true, true]);
  is("no claim the course is accessible or compliant", /\b(accessible|compliant|WCAG|AAA)\b/i.test(html.replace("Can everyone follow your lessons?", "")), false);
  const doneHtml = renderToStaticMarkup(CourseAccessCheck({ check: clean, productId: "p1" }));
  is("done says so", doneHtml.includes("Every lesson video has captions"), true);
  is("no check, nothing drawn", renderToStaticMarkup(CourseAccessCheck({ check: null, productId: "p1" })), "");
  is("the anchor is a stable id for the lesson's captions", captionsAnchor("aaaaaaaaaaaa"), "captions-aaaaaaaaaaaa");

  part("Where it is drawn");
  const page = readFileSync("app/studio/course/[product]/page.tsx", "utf8");
  const editor = readFileSync("components/course-editor.tsx", "utf8");
  is("the course page draws it from what it already read, with no read more", /<CourseAccessCheck check=\{lessonCaptionCheck\(course, streams, captions, writing\)\}/.test(page), true);
  is("and opens the lesson linked to, only when it is one of this course's", /openFirst=\{typeof query\.lesson === "string" && lessonsInOrder\(course\)\.some\(\(\{ lesson \}\) => lesson\.id === query\.lesson\) \? query\.lesson : null\}/.test(page), true);
  is("the editor starts with that lesson open, and its Captions part carries the anchor", [/useState<string \| null>\(openFirst\)/.test(editor), /id=\{captionsAnchor\(lessonId\)\}/.test(editor)], [true, true]);
  done();
}

main();
