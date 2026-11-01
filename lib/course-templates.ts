/**
 * Ready course structures to start from (540 [CU1], unit 1; added
 * 1 November 2026): no AI, no cost of their own. A structure is modules,
 * example lesson titles marked as examples for the creator to replace, when
 * each module opens, and whether finishing gives a certificate.
 *
 * It is applied through the course's own edits (lib/course.ts): the
 * "outline" edit the writing help already uses for the modules and lessons,
 * then "module-remove" for the new course's own empty module, "module-edit"
 * for each module's opening day and "certificate", chained in memory and
 * saved once (applyTemplate). So it meets every limit those edits already
 * enforce, and makes nothing a course could not have by hand. It is offered
 * only to a course exactly as it is made: one the creator touched is never
 * written over.
 *
 * Example titles are neutral: no result, promise, number of anything a
 * buyer gets, or testimonial (tests/course-templates.test.ts holds them to
 * that). Browser-safe: plain data and pure functions.
 */
import { editCourse, type Course, type CourseEdit } from "@/lib/course";

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

export type TemplateFit = { ok: true } | { ok: false; why: "not-new" };

/**
 * Whether a structure may be applied: only to a course exactly as it is
 * made (lib/course.ts, emptyCourse: one "Module 1" opening on the first day,
 * no lesson, no certificate, no start date). A course the creator has
 * touched at all, a module renamed or given an opening day, is never
 * written over.
 */
export function templateFits(course: Pick<Course, "modules" | "certificate" | "startsAt">): TemplateFit {
  const [only, ...more] = course.modules;
  const untouched = !more.length && only && only.title === "Module 1" && only.dripDays === 0 && only.lessons.length === 0 && !course.certificate && course.startsAt === null;
  return untouched ? { ok: true } : { ok: false, why: "not-new" };
}

/** Said beside the structures when they cannot be applied. */
export const FIT_WORDS: Record<Exclude<TemplateFit, { ok: true }>["why"], string> = {
  "not-new": "Ready structures are for a new course. This one already has your changes, so it stays as it is.",
};

/**
 * The whole structure applied at once: the course's own edits chained on
 * the course in memory (the outline, taking away the new course's own
 * empty module only, each module's opening day, the certificate), so the
 * result is shown as a draft and saved in one write, or not at all. Any
 * edit refused leaves nothing done.
 */
export function applyTemplate(course: Course, template: CourseTemplate): { ok: true; course: Course } | { ok: false } {
  if (!templateFits(course).ok) return { ok: false };
  if (!template.modules.length) return { ok: true, course };
  const original = course.modules[0].id;
  const outline: CourseEdit = { op: "outline", modules: template.modules.map((m) => ({ title: m.title, lessons: [...m.lessons] })) };
  let draft = editCourse(course, outline);
  if (!draft.ok) return { ok: false };
  const added = draft.course.modules.filter((m) => m.id !== original);
  const edits: CourseEdit[] = [{ op: "module-remove", moduleId: original }];
  template.modules.forEach((m, i) => {
    if (m.dripDays > 0) edits.push({ op: "module-edit", moduleId: added[i].id, title: m.title, dripDays: m.dripDays });
  });
  if (template.certificate) edits.push({ op: "certificate", on: true });
  for (const edit of edits) {
    draft = editCourse(draft.course, edit);
    if (!draft.ok) return { ok: false };
  }
  return { ok: true, course: draft.course };
}

/** The marks an example title carries until the creator replaces it. */
const EXAMPLE = /your title here|add your questions here/i;

/**
 * Titles still as the structure wrote them. Module titles go into the email
 * a student gets when a module opens (lib/learn.ts, sendDripEmails), so the
 * course is not published while any is left (the next unit, with the screen).
 */
export function exampleTitlesLeft(course: Pick<Course, "modules">): number {
  return course.modules.reduce((n, m) => n + (EXAMPLE.test(m.title) ? 1 : 0) + m.lessons.filter((l) => EXAMPLE.test(l.title)).length, 0);
}
