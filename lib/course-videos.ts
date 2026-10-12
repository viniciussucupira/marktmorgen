/**
 * Lessons made from videos, many at once (added 12 October 2026): a creator
 * moving a course from somewhere else, or filming it before building it,
 * has a folder of videos already in order. They choose them all in a
 * module, and each becomes a lesson of its own, named after its file, in the
 * order the file names give, with its video uploaded the way one lesson's
 * video always is (the video service, or the file store when that is off).
 *
 * The lessons are made one at a time, each just before its video goes up,
 * so nothing is left half made when the connection drops: a video that does
 * not go up takes its lesson away again, and the creator is told which
 * files did not make it and why.
 *
 * Pure, so the studio and the tests read the same rules.
 */
import { MAX_ITEM_TITLE, VIDEO_TYPES } from "@/lib/course";

/** Videos chosen at once. A course holds 200 lessons; this keeps one sitting to an afternoon at most. */
export const MAX_VIDEOS_AT_ONCE = 50;

/**
 * Numbering in front of a name: "1.2 ", "03_", "02 - ", "4) ", "1. ", "05 ".
 * A number that is part of the name ("3 ways to fold", "2024 recap") is not
 * numbering: it has no mark after it and no zero in front.
 */
const NUMBERING = /^(?:\d{1,3}(?:\.\d{1,3})+\s+|\d{1,3}\s*[-–—:)\]_.]+|0\d{0,2}\s+)\s*/;

/**
 * A lesson's name from its file's: no extension, no numbering in front of
 * it (the outline numbers lessons itself), underscores and dots read as
 * spaces. "03_Shaping-the-loaf.mp4" is "Shaping-the-loaf" and
 * "02 - First loaf.mov" is "First loaf". Empty when nothing is left, and the
 * course then names it "Lesson N".
 */
export function lessonTitleFromFile(name: string): string {
  const stem = name.replace(/^.*[\\/]/, "").replace(/\.[A-Za-z0-9]{1,5}$/, "").trim();
  const spaced = (text: string) => text.replace(/_+/g, " ").replace(/\.+/g, " ").replace(/\s+/g, " ").trim();
  const unnumbered = spaced(stem.replace(NUMBERING, ""));
  const title = unnumbered || spaced(stem);
  // A file named only by its number ("07.mp4") says nothing a lesson's number does not.
  if (/^\d+$/.test(title)) return "";
  return title.slice(0, MAX_ITEM_TITLE).trim();
}

/** Files in the order their names give, the way a computer's folder lists them: "2" before "10". */
export function inFileOrder<T extends { name: string }>(files: T[]): T[] {
  return [...files].sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true, sensitivity: "base" }));
}

export type Skipped = { name: string; reason: "type" | "too_big" | "room" };

/**
 * Which of the chosen files become lessons, in order, and which do not and
 * why: a type that does not play everywhere, a file over the most one file
 * may be, or no room left in the course (`room` lessons, at most
 * MAX_VIDEOS_AT_ONCE).
 */
export function planVideos<T extends { name: string; type: string; size: number }>(
  files: T[],
  room: number,
  maxBytes: number,
): { take: T[]; skipped: Skipped[] } {
  const take: T[] = [];
  const skipped: Skipped[] = [];
  const space = Math.max(0, Math.min(room, MAX_VIDEOS_AT_ONCE));
  for (const file of inFileOrder(files)) {
    if (!VIDEO_TYPES.includes(file.type)) skipped.push({ name: file.name, reason: "type" });
    else if (file.size > maxBytes) skipped.push({ name: file.name, reason: "too_big" });
    else if (take.length >= space) skipped.push({ name: file.name, reason: "room" });
    else take.push(file);
  }
  return { take, skipped };
}
