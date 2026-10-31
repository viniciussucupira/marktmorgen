/**
 * "Can everyone follow your lessons?" in the course editor: 98
 * [D2-COMPLIANCE-REVIEW] unit 2 (AX274 Part A item 6: the studio warns about
 * a video with no captions and offers the fix; it never changes the
 * creator's content on its own).
 *
 * Read only from what the course page already reads (app/studio/course/
 * [product]/page.tsx): the course, each lesson video's state at the video
 * service and the languages it has captions in, and the captions being
 * written by AI. No read more. Pure, so it can be tested.
 *
 * A video that can take captions here is one kept by the video service and
 * ready or being prepared, which is when the editor shows its Captions part
 * (components/course-editor.tsx). One still uploading, or that failed, is
 * left to its own state in the editor. One kept anywhere else cannot be given
 * captions in the editor: it is counted apart and never called fine. Not a
 * conformity claim: nothing here says a course is accessible or lawful.
 */
import { type Course, lessonsInOrder } from "@/lib/course";
import type { CaptionTrack } from "@/lib/captions";
import { isStreamPath, type StreamState } from "@/lib/stream-rules";

export type LessonCaptionCheck = {
  /** Lessons whose video can take captions and has none, none being written either, in course order. */
  missing: { id: string; title: string }[];
  /** Lesson videos whose captions are being written by AI now. */
  writing: number;
  /** Lesson videos kept where captions cannot be added in the editor. */
  elsewhere: number;
  /** Every video that can take captions has them, and none is kept elsewhere. */
  done: boolean;
};

/** The id of a lesson's Captions part in the editor, which the check links to. */
export function captionsAnchor(lessonId: string): string {
  return `captions-${lessonId}`;
}

/** The check for a course with at least one lesson video; null for one with none. */
export function lessonCaptionCheck(
  course: Course,
  states: Record<string, StreamState>,
  captions: Record<string, CaptionTrack[]>,
  writing: Record<string, string[]>,
): LessonCaptionCheck | null {
  const videos = lessonsInOrder(course).flatMap(({ lesson }) => (lesson.video ? [{ id: lesson.id, title: lesson.title, path: lesson.video.pathname }] : []));
  if (!videos.length) return null;
  const missing: { id: string; title: string }[] = [];
  let beingWritten = 0;
  let elsewhere = 0;
  for (const video of videos) {
    if (!isStreamPath(video.path)) {
      elsewhere += 1;
      continue;
    }
    // The editor's own default for a state it has not heard yet (components/course-editor.tsx).
    const state = states[video.path] ?? "working";
    if (state !== "ready" && state !== "working") continue;
    if ((captions[video.path] ?? []).length > 0) continue;
    if ((writing[video.path] ?? []).length > 0) {
      beingWritten += 1;
      continue;
    }
    missing.push({ id: video.id, title: video.title });
  }
  return { missing, writing: beingWritten, elsewhere, done: missing.length === 0 && elsewhere === 0 };
}
