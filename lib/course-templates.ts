/**
 * Ready course structures to start from (540 [CU1], unit 1; added
 * 1 November 2026): no AI, no cost of their own. A structure is modules,
 * example lesson titles marked as examples for the creator to replace, when
 * each module opens, and whether finishing gives a certificate.
 *
 * It is applied through the course's own edits (lib/course.ts): the
 * "outline" edit the writing help already uses for the modules and lessons,
 * then "module-remove" for the course's own empty modules, "module-edit" for
 * each module's opening day and "certificate". So it meets every limit those
 * edits already enforce, and makes nothing a course could not have by hand.
 * It is offered only to a course with no lesson yet: an existing course is
 * never written over.
 *
 * Example titles are neutral: no result, promise, number of anything a
 * buyer gets, or testimonial (tests/course-templates.test.ts holds them to
 * that). Browser-safe: plain data and pure functions.
 */
import { MAX_LESSONS, MAX_MODULES, lessonCount, type Course, type CourseEdit } from "@/lib/course";

export type TemplateModule = { title: string; lessons: string[]; dripDays: number };
export type CourseTemplate = {
  id: "mini" | "weekly" | "challenge" | "quizzes" | "scratch";
  name: string;
  /** What it is and who it is for, in one sentence. */
  about: string;
  modules: TemplateModule[];
  certificate: boolean;
  /** The funnel type it goes with (lib/funnel-types.ts), when there is one. */
  funnel: string | null;
};

const lessons = (count: number, first = 1) => Array.from({ length: count }, (_, i) => `Lesson ${first + i}: your title here`);

export const COURSE_TEMPLATES: readonly CourseTemplate[] = [
  {
    id: "mini",
    name: "Mini course",
    about: "One module of four short lessons, all open on the first day. For one focused topic.",
    modules: [{ title: "Module 1: your title here", lessons: lessons(4), dripDays: 0 }],
    certificate: false,
    funnel: null,
  },
  {
    id: "weekly",
    name: "Weekly course",
    about: "Four modules, one opening each week, with the email students already get when a module opens. For a course taken over a month.",
    modules: [0, 1, 2, 3].map((week) => ({ title: `Week ${week + 1}: your title here`, lessons: lessons(3, week * 3 + 1), dripDays: week * 7 })),
    certificate: false,
    funnel: null,
  },
  {
    id: "challenge",
    name: "5-day challenge",
    about: "Five short lessons, one opening each day. Goes with the challenge funnel.",
    modules: [0, 1, 2, 3, 4].map((day) => ({ title: `Day ${day + 1}: your title here`, lessons: [`Lesson ${day + 1}: your title here`], dripDays: day })),
    certificate: false,
    funnel: "challenge",
  },
  {
    id: "quizzes",
    name: "Course with quizzes and a certificate",
    about: "Three modules, each ending with a lesson for its quiz, and a certificate when a student finishes. You write the questions.",
    modules: [0, 1, 2].map((m) => ({ title: `Module ${m + 1}: your title here`, lessons: [...lessons(2, m * 3 + 1), `Lesson ${m * 3 + 3}: quiz, add your questions here`], dripDays: 0 })),
    certificate: true,
    funnel: null,
  },
  { id: "scratch", name: "Start from scratch", about: "An empty course, as today.", modules: [], certificate: false, funnel: null },
];

export type TemplateFit = { ok: true } | { ok: false; why: "not-empty" | "too-many-modules" | "too-many-lessons" };

/**
 * Whether a structure may be applied to this course: only one with no
 * lesson yet (a new course has one empty "Module 1"), and only within the
 * course's limits once its empty modules are taken away.
 */
export function templateFits(template: CourseTemplate, course: Pick<Course, "modules">): TemplateFit {
  if (lessonCount(course as Course) > 0) return { ok: false, why: "not-empty" };
  if (course.modules.length + template.modules.length > MAX_MODULES) return { ok: false, why: "too-many-modules" };
  if (template.modules.reduce((n, m) => n + m.lessons.length, 0) > MAX_LESSONS) return { ok: false, why: "too-many-lessons" };
  return { ok: true };
}

/** Said beside a structure that cannot be applied. */
export const FIT_WORDS: Record<Exclude<TemplateFit, { ok: true }>["why"], string> = {
  "not-empty": "This course already has lessons, so a ready structure would write over them. Start from it as it is.",
  "too-many-modules": "This structure has more modules than a course can hold.",
  "too-many-lessons": "This structure has more lessons than a course can hold.",
};

/** The first edit: the structure's modules and lessons, added after the course's own empty modules. */
export function templateOutline(template: CourseTemplate): CourseEdit | null {
  return template.modules.length ? { op: "outline", modules: template.modules.map((m) => ({ title: m.title, lessons: [...m.lessons] })) } : null;
}

/**
 * The edits after the outline, given the course as the outline left it: the
 * empty modules it had before taken away (only empty ones: the course's own
 * edit refuses any other), each new module's opening day where it is not
 * the first, and the certificate.
 */
export function templateFinish(template: CourseTemplate, course: Pick<Course, "modules">): CourseEdit[] {
  const added = course.modules.slice(course.modules.length - template.modules.length);
  const before = course.modules.slice(0, course.modules.length - template.modules.length);
  const edits: CourseEdit[] = before.filter((m) => m.lessons.length === 0).map((m) => ({ op: "module-remove", moduleId: m.id }));
  template.modules.forEach((m, i) => {
    if (m.dripDays > 0 && added[i]) edits.push({ op: "module-edit", moduleId: added[i].id, title: m.title, dripDays: m.dripDays });
  });
  if (template.certificate) edits.push({ op: "certificate", on: true });
  return edits;
}
