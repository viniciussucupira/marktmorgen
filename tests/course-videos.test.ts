/**
 * Lessons made from many videos at once (lib/course-videos.ts): the name
 * each lesson takes from its file, the order the files go in, and which are
 * left out and why.
 */
import { MAX_VIDEOS_AT_ONCE, inFileOrder, lessonTitleFromFile, planVideos } from "@/lib/course-videos";
import { MAX_ITEM_TITLE } from "@/lib/course";
import { done, is, part } from "./check";

part("A lesson's name from its file's");
is("numbering with an underscore goes, a hyphen inside the name stays", lessonTitleFromFile("03_Shaping-the-loaf.mp4"), "Shaping-the-loaf");
is("numbering with a dash goes", lessonTitleFromFile("02 - First loaf.mov"), "First loaf");
is("numbering with a point goes", lessonTitleFromFile("1. Welcome.webm"), "Welcome");
is("numbering with a bracket goes", lessonTitleFromFile("4) Scoring.mp4"), "Scoring");
is("two-level numbering goes", lessonTitleFromFile("1.2 Feeding the starter.mp4"), "Feeding the starter");
is("a zero in front is numbering", lessonTitleFromFile("05 Proofing overnight.mp4"), "Proofing overnight");
is("a number that is part of the name stays", lessonTitleFromFile("3 ways to fold.mp4"), "3 ways to fold");
is("a year stays", lessonTitleFromFile("2024 recap.mp4"), "2024 recap");
is("underscores and dots read as spaces", lessonTitleFromFile("the_final.cut.mp4"), "the final cut");
is("a folder in front goes", lessonTitleFromFile("Course/Module 1/07 - Intro.mp4"), "Intro");
is("a file named only by its number is left for the course to name", lessonTitleFromFile("07.mp4"), "");
is("a camera's name stays as it is", lessonTitleFromFile("IMG_4021.MOV"), "IMG 4021");
is("never longer than a lesson's name may be", lessonTitleFromFile(`${"a".repeat(300)}.mp4`).length, MAX_ITEM_TITLE);

part("In the order of the file names");
is(
  "numbers read as numbers, capitals as small letters",
  inFileOrder([{ name: "10 Ten.mp4" }, { name: "2 Two.mp4" }, { name: "b.mp4" }, { name: "A.mp4" }, { name: "1 One.mp4" }]).map((f) => f.name),
  ["1 One.mp4", "2 Two.mp4", "10 Ten.mp4", "A.mp4", "b.mp4"],
);

part("Which become lessons");
const video = (name: string, size = 1_000, type = "video/mp4") => ({ name, size, type });
const plan = planVideos([video("2.mp4"), video("1.mp4"), video("notes.pdf", 10, "application/pdf"), video("huge.mp4", 9_999), video("3.mov", 5, "video/quicktime")], 2, 5_000);
is("in order, as many as there is room for", plan.take.map((f) => f.name), ["1.mp4", "2.mp4"]);
is(
  "the rest, each with its reason",
  plan.skipped,
  [
    { name: "3.mov", reason: "room" },
    { name: "huge.mp4", reason: "too_big" },
    { name: "notes.pdf", reason: "type" },
  ],
);
const many = Array.from({ length: MAX_VIDEOS_AT_ONCE + 5 }, (_, i) => video(`${i + 1}.mp4`));
is("never more than the most taken at once", planVideos(many, 200, 5_000).take.length, MAX_VIDEOS_AT_ONCE);
is("nothing when the course is full", planVideos([video("1.mp4")], 0, 5_000).take.length, 0);

done();
