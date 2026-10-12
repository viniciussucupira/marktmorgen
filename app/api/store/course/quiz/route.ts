import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { originFrom } from "@/lib/request-origin";
import { fromAnotherSite } from "@/lib/studio-route";
import { normaliseHandle, storeForHandle } from "@/lib/store";
import { findLesson, isOpen, readCourse } from "@/lib/course";
import { courseAccess, emailKey, markLesson } from "@/lib/learn";
import { heldBack, passedQuizzes, readAnswers, readQuizFor, submitQuiz } from "@/lib/quiz";
import { limited } from "@/lib/request-guard";
import { readCourseListing } from "@/lib/catalog";
import { noteIfFinished } from "@/lib/course-finish";

/**
 * "Check my answers": marks one try at a lesson's quiz and goes back to the
 * lesson with the result. A plain form, so it works without scripts.
 *
 * Only a student the lesson is open for can answer, and the creator looking
 * at their own course is shown the answers instead of being marked. Passing
 * marks the lesson done, which is what the course's progress and its
 * certificate count.
 */
export async function POST(request: NextRequest) {
  const origin = originFrom(request);
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });

  let form: FormData;
  try {
    form = await (await limited(request, 8_000)).formData();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const handle = normaliseHandle(String(form.get("handle") ?? ""));
  const productId = String(form.get("product") ?? "").slice(0, 40);
  const lessonId = String(form.get("lesson") ?? "").slice(0, 20);
  const store = handle ? await storeForHandle(handle) : null;
  const product = await readCourseListing(store, productId);
  if (!store || !product?.course) return new Response("Not found.", { status: 404 });
  const base = `${origin}/@${store.handle}/course/${product.id}`;
  const away = (path: string) => new Response(null, { status: 303, headers: { Location: path, "Cache-Control": "no-store" } });

  const access = await courseAccess(store, product, await cookies());
  const course = await readCourse(product.course.id);
  const found = course ? findLesson(course, lessonId) : null;
  if (access.state !== "open" || !course || !found || !isOpen(course, found.unit, access.start)) return away(base);
  if (access.learner.owner) return away(`${base}/${lessonId}#quiz`);

  const who = emailKey(access.learner.email);
  // A lesson a required quiz still holds shut cannot be answered from here either.
  if (heldBack(course, await passedQuizzes(course.id, who)).has(lessonId)) return away(base);
  const quiz = await readQuizFor(course.id, lessonId);
  if (!quiz || !found.lesson.quiz) return away(`${base}/${lessonId}`);

  const result = await submitQuiz(course.id, lessonId, who, quiz, readAnswers(quiz, form));
  if (result.ok && result.grade.passed) {
    await markLesson(course.id, access.learner.email, lessonId, true);
    await noteIfFinished(store, product.id, course.id, access.learner.email);
  }
  return away(`${base}/${lessonId}?quiz=marked#quiz`);
}
