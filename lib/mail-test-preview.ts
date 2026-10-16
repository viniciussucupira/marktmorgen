import { MIN_TEST_REACH, newTest, splitFor, type TestBy } from "@/lib/mail-test";

export type SubjectTestPreview = { state: "subject" | "audience" | "small" } | {
  state: "ready"; subjectA: string; subjectB: string; a: number; b: number; rest: number; share: number; hours: number; by: TestBy;
};

/** An estimate from the confirmed count, using the sender's normalization and allocation. */
export function subjectTestPreview(subject: string, raw: unknown, reach: unknown): SubjectTestPreview {
  const subjectA = subject.replace(/\s+/g, " ").trim().slice(0, 150);
  const test = newTest(raw, subjectA, 150);
  if (!subjectA || test === "none" || test === "subject") return { state: "subject" };
  if (typeof reach !== "number" || !Number.isSafeInteger(reach) || reach < 0) return { state: "audience" };
  if (reach < MIN_TEST_REACH) return { state: "small" };
  const split = splitFor(reach, test.share);
  return { state: "ready", subjectA, subjectB: test.subjectB, ...split, rest: reach - split.a - split.b, share: test.share, hours: test.hours, by: test.by };
}
