import { TEST_BY, TEST_HOURS, TEST_SHARES, type TestBy } from "@/lib/mail-test";

/** Incomplete second-subject text is valid work in progress, never permission to send. */
export type DraftSubjectTest = { subjectB: string; share: number; hours: number; by: TestBy };

/** Null explicitly disables the test; undefined is malformed, not an implicit default. */
export function readDraftSubjectTest(raw: unknown): DraftSubjectTest | null | undefined {
  if (raw === null) return null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const value = raw as Record<string, unknown>;
  if (typeof value.subjectB !== "string" || value.subjectB.length > 150 || !TEST_SHARES.includes(value.share as number) || !TEST_HOURS.includes(value.hours as number) || !TEST_BY.includes(value.by as TestBy)) return undefined;
  return { subjectB: value.subjectB, share: value.share as number, hours: value.hours as number, by: value.by as TestBy };
}

export function sameDraftSubjectTest(actual: unknown, expected: unknown): boolean {
  const a = readDraftSubjectTest(actual), b = readDraftSubjectTest(expected);
  if (a === undefined || b === undefined) return false;
  if (a === null || b === null) return a === b;
  return a.subjectB === b.subjectB && a.share === b.share && a.hours === b.hours && a.by === b.by;
}
