/**
 * Certificates of completion: a page that says a named person finished a
 * course, at an address anyone can open to check it.
 *
 * A student earns one when every lesson of the course is done and every quiz
 * that has to be passed is passed, on a course whose creator switched
 * certificates on. They type the name it should carry, and it carries that
 * name exactly as typed: nobody here knows how a person spells their own name
 * better than they do. The course title and the creator's name are written
 * into the certificate the moment it is issued, so renaming the course later
 * does not quietly change what was certified.
 *
 * The page at /@handle/certificate/<id> is the proof. It is served from the
 * record kept here, never from anything in the address, so a certificate
 * cannot be forged by editing a URL; and a creator who withdraws one — issued
 * to the wrong name, or to someone who was refunded — leaves the page saying
 * so, rather than making it vanish as if it had never been.
 *
 * One certificate per student per course. Withdrawing it lets the student
 * issue it again, under the name they type then.
 *
 *   nl:cert:<id>                  -> the certificate, as JSON, kept for good
 *   nl:course:<course>:certs      -> hash of student key -> standing certificate id
 *   nl:course:<course>:certs:all  -> set of every certificate id issued, withdrawn ones too
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { type Course, lessonsInOrder } from "@/lib/course";
import { requiredQuizLessons } from "@/lib/quiz";
import { emailKey } from "@/lib/learn";

export const CERT_ID_PATTERN = /^[a-z0-9]{16}$/;
export const MIN_CERT_NAME = 2;
export const MAX_CERT_NAME = 80;
/** The most certificates the studio lists for one course. */
export const MAX_LISTED_CERTS = 500;

export type Certificate = {
  id: string;
  /** The store it belongs to (lib/learn.ts storeKey), whatever its address. */
  store: string;
  productId: string;
  courseId: string;
  /** The name as the student typed it. */
  name: string;
  /** The course's title and the creator's name when it was issued. */
  title: string;
  creator: string;
  /** The student's address, for the creator's list. Never shown on the page. */
  email: string;
  issuedAt: number;
  /** When the creator withdrew it; 0 while it stands. */
  withdrawnAt: number;
};

export function newCertificateId(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}

/**
 * The name as typed, made safe to keep: control characters and runs of
 * spaces go, and nothing else is touched — no capitals added, no accents
 * taken away. Null when what is left is too short or too long to be a name.
 */
export function cleanName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, " ").replace(/\s+/g, " ").trim();
  if ([...name].length < MIN_CERT_NAME || [...name].length > MAX_CERT_NAME) return null;
  return name;
}

/**
 * LinkedIn's own form for adding a certification to a profile, filled in from
 * the record: the course as the certification, the creator as who issued it,
 * the month it was issued, its ID, and this page as the credential LinkedIn
 * links to. The student checks it and saves it there themselves; nothing is
 * posted for them. The parameters are LinkedIn's "Add to Profile" ones.
 */
export function linkedInAddUrl(certificate: Pick<Certificate, "id" | "title" | "creator" | "issuedAt">, pageUrl: string): string {
  const issued = new Date(certificate.issuedAt * 1000);
  const query = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: certificate.title,
    organizationName: certificate.creator,
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certId: certificate.id,
    certUrl: pageUrl,
  });
  return `https://www.linkedin.com/profile/add?${query}`;
}

/** LinkedIn's page for writing a post about a link, with this page's link in it. */
export function linkedInShareUrl(pageUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url: pageUrl })}`;
}

/** Whether this student has done everything a certificate asks. */
export function hasFinished(course: Course, done: Set<string>, passed: Set<string>): boolean {
  const lessons = lessonsInOrder(course);
  if (lessons.length === 0) return false;
  return lessons.every(({ lesson }) => done.has(lesson.id)) && requiredQuizLessons(course).every((id) => passed.has(id));
}

function parseCertificate(raw: unknown): Certificate | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<Certificate>;
    if (typeof value.id !== "string" || !CERT_ID_PATTERN.test(value.id)) return null;
    if (typeof value.name !== "string" || typeof value.title !== "string" || typeof value.store !== "string") return null;
    return {
      id: value.id,
      store: value.store,
      productId: typeof value.productId === "string" ? value.productId : "",
      courseId: typeof value.courseId === "string" ? value.courseId : "",
      name: value.name,
      title: value.title,
      creator: typeof value.creator === "string" ? value.creator : "",
      email: typeof value.email === "string" ? value.email : "",
      issuedAt: typeof value.issuedAt === "number" ? value.issuedAt : 0,
      withdrawnAt: typeof value.withdrawnAt === "number" ? value.withdrawnAt : 0,
    };
  } catch {
    return null;
  }
}

const certKey = (id: string) => `nl:cert:${id}`;
const indexKey = (courseId: string) => `nl:course:${courseId}:certs`;
const allKey = (courseId: string) => `nl:course:${courseId}:certs:all`;

export async function readCertificate(id: string): Promise<Certificate | null> {
  if (!isRedisConfigured() || !CERT_ID_PATTERN.test(id)) return null;
  const [raw] = await redisPipeline([["GET", certKey(id)]]);
  return parseCertificate(raw);
}

/** The standing certificate this student holds for this course, if any. */
export async function certificateOf(courseId: string, who: string): Promise<Certificate | null> {
  if (!isRedisConfigured()) return null;
  const [id] = await redisPipeline([["HGET", indexKey(courseId), who]]);
  if (typeof id !== "string") return null;
  const found = await readCertificate(id);
  return found && !found.withdrawnAt ? found : null;
}

export type IssueResult = { ok: true; certificate: Certificate; fresh: boolean } | { ok: false; reason: "name" };

/**
 * Issues the certificate, or hands back the one already issued.
 *
 * The student's slot in the course's list is taken first, and only if free,
 * so two presses of the button — two tabs, a double click — make one
 * certificate and not two. The caller has already checked that the course
 * gives certificates and that this student finished it.
 */
export async function issueCertificate(input: {
  store: string;
  productId: string;
  course: Course;
  title: string;
  creator: string;
  email: string;
  who: string;
  name: unknown;
}): Promise<IssueResult> {
  const name = cleanName(input.name);
  if (!name) return { ok: false, reason: "name" };
  const id = newCertificateId();
  const certificate: Certificate = {
    id,
    store: input.store,
    productId: input.productId,
    courseId: input.course.id,
    name,
    title: input.title.slice(0, 200),
    creator: input.creator.slice(0, 120),
    email: input.email,
    issuedAt: Math.floor(Date.now() / 1000),
    withdrawnAt: 0,
  };
  // The record is written before the student's slot is claimed (changed
  // 17 October 2026). Claiming first left a moment in which the slot named
  // a certificate not yet written, and a second press arriving then read it
  // as lost, took the slot and issued a second certificate beside the first.
  await redisPipeline([["SET", certKey(id), JSON.stringify(certificate)]]);
  const [claimed] = await redisPipeline([["HSETNX", indexKey(input.course.id), input.who, id]]);
  if (Number(claimed) !== 1) {
    const existing = await certificateOf(input.course.id, input.who);
    if (existing) {
      // This press made nothing that stands: its record goes, the standing one is the answer.
      await redisPipeline([["DEL", certKey(id)]]);
      return { ok: true, certificate: existing, fresh: false };
    }
    // The slot pointed at a certificate that was withdrawn: take it.
    await redisPipeline([["HSET", indexKey(input.course.id), input.who, id]]);
  }
  await redisPipeline([["SADD", allKey(input.course.id), id]]);
  return { ok: true, certificate, fresh: true };
}

/** Every certificate issued for a course, newest first, withdrawn ones included. */
export async function certificatesFor(courseId: string): Promise<{ list: Certificate[]; total: number }> {
  if (!isRedisConfigured()) return { list: [], total: 0 };
  const [raw] = await redisPipeline([["SMEMBERS", allKey(courseId)]]);
  const ids = Array.isArray(raw) ? (raw as unknown[]).map(String) : [];
  const valid = ids.filter((id) => CERT_ID_PATTERN.test(id));
  if (valid.length === 0) return { list: [], total: 0 };
  const rows = await redisPipeline(valid.map((id) => ["GET", certKey(id)]));
  const list = rows
    .map(parseCertificate)
    .filter((c): c is Certificate => c !== null && c.courseId === courseId)
    .sort((a, b) => b.issuedAt - a.issuedAt);
  return { list: list.slice(0, MAX_LISTED_CERTS), total: list.length };
}

/**
 * Withdraws a certificate. The page stays and says it was withdrawn, and the
 * student may issue it again. Only a certificate of this course is touched.
 */
export async function withdrawCertificate(courseId: string, id: string): Promise<boolean> {
  const found = await readCertificate(id);
  if (!found || found.courseId !== courseId) return false;
  if (!found.withdrawnAt) {
    await redisPipeline([["SET", certKey(id), JSON.stringify({ ...found, withdrawnAt: Math.floor(Date.now() / 1000) })]]);
  }
  const who = emailKey(found.email);
  const [current] = await redisPipeline([["HGET", indexKey(courseId), who]]);
  if (current === id) await redisPipeline([["HDEL", indexKey(courseId), who]]);
  return true;
}
