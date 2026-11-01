/**
 * Ready course structures (540 [CU1], unit 1, lib/course-templates.ts;
 * added 1 November 2026). Checked: the five structures the item names; each
 * applied through the course's own edits to an empty course gives exactly
 * its modules, lessons, opening days and certificate; an existing course is
 * never written over; limits hold; example titles are neutral and marked as
 * examples; the challenge goes with the challenge funnel that exists.
 */
import { COURSE_TEMPLATES, FIT_WORDS, templateFinish, templateFits, templateOutline } from "@/lib/course-templates";
import { editCourse as applyEdit, emptyCourse, type Course } from "@/lib/course";
import { FUNNEL_TYPES } from "@/lib/funnel-types";
import { done, is, part } from "./check";


part("The five structures");
is("as the item names them", COURSE_TEMPLATES.map((t) => t.name), ["Mini course", "Weekly course", "5-day challenge", "Course with quizzes and a certificate", "Start from scratch"]);
is("each says what it is in a sentence", COURSE_TEMPLATES.every((t) => t.about.length > 15 && t.about.endsWith(".")), true);

part("Applied through the course's own edits");
for (const template of COURSE_TEMPLATES.filter((t) => t.modules.length)) {
  let course = emptyCourse();
  const first = applyEdit(course, templateOutline(template)!);
  if (!first.ok) throw new Error(`${template.id}: outline refused`);
  course = first.course;
  for (const edit of templateFinish(template, course)) {
    const next = applyEdit(course, edit);
    if (!next.ok) throw new Error(`${template.id}: ${edit.op} refused`);
    course = next.course;
  }
  is(`${template.name}: exactly its modules, lessons, opening days and certificate, the new course's empty module gone`, [course.modules.map((m) => [m.title, m.lessons.map((l) => l.title), m.dripDays]), course.certificate], [template.modules.map((m) => [m.title, m.lessons, m.dripDays]), template.certificate]);
}
is("the challenge opens one lesson a day", COURSE_TEMPLATES.find((t) => t.id === "challenge")!.modules.map((m) => [m.lessons.length, m.dripDays]), [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]]);
is("the weekly course opens a module each week", COURSE_TEMPLATES.find((t) => t.id === "weekly")!.modules.map((m) => m.dripDays), [0, 7, 14, 21]);
is("start from scratch makes nothing", templateOutline(COURSE_TEMPLATES.find((t) => t.id === "scratch")!), null);

part("Never over an existing course, never past a limit");
const started = { modules: [{ id: "m", title: "Mine", dripDays: 0, lessons: [{ id: "l", title: "My lesson" }] }] } as unknown as Course;
is("a course with modules: refused, said plainly", [templateFits(COURSE_TEMPLATES[0], started), FIT_WORDS["not-empty"].includes("write over them")], [{ ok: false, why: "not-empty" }, true]);
is("every structure fits a new course", COURSE_TEMPLATES.every((t) => templateFits(t, emptyCourse()).ok), true);

part("Example titles, neutral and marked");
const titles = COURSE_TEMPLATES.flatMap((t) => t.modules.flatMap((m) => [m.title, ...m.lessons]));
is("every title says it is an example to replace", titles.every((t) => t.includes("your title here") || t.includes("add your questions here")), true);
const words = COURSE_TEMPLATES.flatMap((t) => [t.about, ...t.modules.flatMap((m) => [m.title, ...m.lessons])]).join(" ");
is("no result, promise, money, percent or testimonial", /\$|%|guarantee|results?\b|earn|income|proven|transform|testimonial|best-selling|students say/i.test(words), false);

part("Goes with the funnels that exist");
is("the challenge with the challenge funnel", FUNNEL_TYPES.some((f) => f.id === "challenge") && COURSE_TEMPLATES.find((t) => t.id === "challenge")!.funnel === "challenge", true);
done();
