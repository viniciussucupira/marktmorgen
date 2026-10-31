import { Icon } from "@/components/icons";
import { captionsAnchor, type LessonCaptionCheck } from "@/lib/course-access-check";

/**
 * "Can everyone follow your lessons?" above the course editor (98
 * [D2-COMPLIANCE-REVIEW] unit 2, lib/course-access-check.ts): lesson videos
 * with no captions, by lesson, each with a link that opens that lesson at its
 * Captions part. It never changes the creator's videos or words.
 */
export function CourseAccessCheck({ check, productId }: { check: LessonCaptionCheck | null; productId: string }) {
  if (!check) return null;
  return (
    <section aria-labelledby={`course-access-${productId}`} className="card mt-8 p-6 sm:p-8">
      <h2 id={`course-access-${productId}`} className="text-lg font-semibold tracking-[-0.02em] text-ink">
        Can everyone follow your lessons?
      </h2>
      <p className="mt-1 max-w-[80ch] text-sm text-ink-soft">
        Captions show the words of a video as text, for students who cannot hear it, are somewhere quiet, or follow better by reading. This checks the videos of this course. It is not a full accessibility review.
      </p>
      {check.missing.length === 0 ? (
        check.done ? (
          <p className="mt-5 flex items-center gap-2 text-sm text-ink" data-course-captions="done">
            <Icon name="check" size={16} className="text-violet-deep" />
            Every lesson video has captions.
          </p>
        ) : null
      ) : (
        <div className="mt-5 rounded-2xl bg-paper p-4 ring-1 ring-line" data-course-captions={check.missing.length}>
          <h3 className="font-semibold text-ink">
            {check.missing.length === 1 ? "1 lesson video has no captions" : `${check.missing.length} lesson videos have no captions`}
          </h3>
          <p className="mt-1 max-w-[80ch] text-sm text-ink-soft">
            Open each lesson below and add a captions file (.vtt or .srt) under Captions, or have them written for you there.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {check.missing.map((lesson) => (
              <li key={lesson.id}>
                <a href={`?lesson=${encodeURIComponent(lesson.id)}#${captionsAnchor(lesson.id)}`} className="font-bold text-violet-deep underline underline-offset-2">
                  {`Add captions to “${lesson.title}”`}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {check.writing > 0 ? (
        <p className="mt-4 max-w-[80ch] text-sm text-ink" data-course-captions-writing={check.writing}>
          {check.writing === 1 ? "Captions for 1 lesson video are being written. They appear in its lesson when they are done." : `Captions for ${check.writing} lesson videos are being written. They appear in each lesson when they are done.`}
        </p>
      ) : null}
      {check.elsewhere > 0 ? (
        <p className="mt-4 max-w-[80ch] text-sm text-ink" data-course-captions-elsewhere={check.elsewhere}>
          {check.elsewhere === 1
            ? "1 lesson video was uploaded in a way that captions cannot be added to here. To add captions, upload that video again in its lesson."
            : `${check.elsewhere} lesson videos were uploaded in a way that captions cannot be added to here. To add captions, upload each of them again in its lesson.`}
        </p>
      ) : null}
    </section>
  );
}
