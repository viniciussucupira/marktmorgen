/**
 * Two-step login (added 13 October 2026): after the emailed link, a six-digit
 * code from an authenticator app (lib/totp.ts), for a creator who turns it on.
 * Off until they do, because the emailed link alone is how everybody here has
 * always logged in, and a second step somebody did not ask for is a door they
 * can be locked out of.
 *
 * What it protects against: somebody who gets into the creator's inbox, or
 * finds a login link in it, still cannot open the studio without the phone.
 *
 * What counts as the second step:
 *
 *   - the code the app shows now, or one step either side for a phone clock a
 *     little off, used once: a code already used does not open anything again;
 *   - one of ten recovery codes, shown once when it is turned on, each good
 *     once and kept only as a hash. Using one emails the account;
 *   - a passkey (lib/passkeys.ts), which already asks the device for its own
 *     check — a fingerprint, a face, a PIN — so it is never asked for a code.
 *
 * Turning it on needs a login from the last fifteen minutes and a right code
 * from the app; turning it off, or making new recovery codes, needs a right
 * code. Each of the three emails the account. Five wrong codes end a waiting
 * login, and an account answers ten codes an hour at most, so six digits
 * cannot be guessed by trying.
 *
 * Nobody is locked out, and nobody here has to unlock anybody by hand. A
 * creator who has lost the phone, the recovery codes and every passkey asks,
 * from the code page they reach with an emailed link, for two-step login to be
 * turned off; it turns off by itself RESET_DAYS later, at their next emailed
 * link. In that time the account is emailed, the studio shows it to every
 * browser still logged in, and any login with a right code or a passkey — or
 * one press of Cancel in the studio — calls it off. So somebody who only has
 * the inbox has to wait a week in plain view of the owner, while the owner who
 * really lost everything gets back in without writing to anyone.
 *
 * The app's secret is sealed at rest (lib/secret-box.ts), bound to the
 * account's address, so a copy of the database alone opens nothing. If the
 * deployment's root secret were ever rolled the app's codes could no longer be
 * checked; the recovery codes and passkeys still let the creator in, and the
 * page says so.
 *
 *   nl:2fa:<hash>         the account's record: the sealed secret, when it was
 *                         turned on, the recovery codes' hashes, the last step used
 *   nl:2fa:setup:<hash>   a secret being set up, 10 minutes, tied to the session
 *   nl:2fa:hold:<hash>    a login that has passed the emailed link and waits
 *                         for its code, 10 minutes, tied to a cookie of that browser
 */
import { createHash, randomBytes } from "node:crypto";
import { normaliseEmail } from "@/lib/auth";
import { NIMBUS_FROM, isSenderConfigured, sendEmail } from "@/lib/email";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { withinLimit } from "@/lib/request-guard";
import { seal, unseal } from "@/lib/secret-box";
import { SITE_URL } from "@/lib/site-url";
import { newSecret, otpauthUri, stepOf } from "@/lib/totp";

export const TWO_STEP_COOKIE = "nl_2fa";
export const HOLD_SECONDS = 10 * 60;
const SETUP_SECONDS = 10 * 60;
const TRIES = 5;
const CODES_PER_HOUR = 10;
export const RECOVERY_CODES = 10;
const CODE_LETTERS = "abcdefghjkmnpqrstuvwxyz23456789";
/** How long a request to turn it off without a code waits before it does. */
export const RESET_DAYS = 7;
const ISSUER = "Marktmorgen";

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
const recordKey = (email: string) => `nl:2fa:${sha(`nimbus-2fa:${normaliseEmail(email)}`).slice(0, 40)}`;
const setupKey = (session: string) => `nl:2fa:setup:${sha(`nimbus-2fa-setup:${session}`).slice(0, 40)}`;
const holdKey = (token: string) => `nl:2fa:hold:${sha(`nimbus-2fa-hold:${token}`).slice(0, 40)}`;
const context = (email: string) => `two-step|${normaliseEmail(email)}`;
// Not bound to the address, so a move of the sign-in address keeps them; each code is random enough on its own.
const codeHash = (code: string) => sha(`nimbus-2fa-code:${code.toLowerCase().replace(/[^a-z0-9]/g, "")}`);

/** `reset`: when a request to turn it off without a code takes effect, in ms; 0 for none. */
type TwoStep = { s: string; since: number; codes: string[]; last: number; reset: number };

function parse(raw: unknown): TwoStep | null {
  if (typeof raw !== "string") return null;
  try {
    const v = JSON.parse(raw) as Partial<TwoStep>;
    if (typeof v.s !== "string") return null;
    return {
      s: v.s,
      since: typeof v.since === "number" ? v.since : 0,
      codes: Array.isArray(v.codes) ? v.codes.filter((c): c is string => typeof c === "string" && /^[0-9a-f]{64}$/.test(c)) : [],
      last: typeof v.last === "number" ? v.last : -1,
      reset: typeof v.reset === "number" && v.reset > 0 ? v.reset : 0,
    };
  } catch {
    return null;
  }
}

async function read(email: string): Promise<TwoStep | null> {
  if (!isRedisConfigured()) return null;
  const [raw] = await redisPipeline([["GET", recordKey(email)]]);
  return parse(raw);
}

async function write(email: string, record: TwoStep): Promise<void> {
  await redisPipeline([["SET", recordKey(email), JSON.stringify(record)]]);
}

/** Ten recovery codes, "abcd-efgh", each from 31 letters and digits nobody misreads. */
function newCodes(): string[] {
  return Array.from({ length: RECOVERY_CODES }, () => {
    const bytes = randomBytes(8);
    const text = Array.from(bytes, (b) => CODE_LETTERS[b % CODE_LETTERS.length]).join("");
    return `${text.slice(0, 4)}-${text.slice(4)}`;
  });
}

/** A short plain notice to the account's address when its second step changes or is used. */
async function tell(email: string, subject: string, line: string): Promise<void> {
  if (!isSenderConfigured()) return;
  const when = new Date().toISOString().replace("T", " ").slice(0, 16);
  await sendEmail({
    from: NIMBUS_FROM,
    to: normaliseEmail(email),
    replyTo: "support@marktmorgen.com",
    subject,
    text: [
      line,
      "",
      `When: ${when} UTC`,
      "",
      "If this was you, there is nothing to do.",
      "",
      "If it was not you: log in at",
      `${SITE_URL}/signin`,
      "choose “Log out of all devices” at the bottom of your studio, make new recovery codes under Two-step login, and reply to this email so we can help.",
    ].join("\n"),
  }).catch(() => false);
}

/** `reset`: when a pending request to turn it off without a code takes effect, in ms; 0 for none. */
export type TwoStepStatus = { on: boolean; since: number; codesLeft: number; reset: number };

export async function twoStepStatus(email: string): Promise<TwoStepStatus> {
  const record = await read(email);
  return record ? { on: true, since: record.since, codesLeft: record.codes.length, reset: record.reset } : { on: false, since: 0, codesLeft: 0, reset: 0 };
}

const day = (ms: number) => new Date(ms).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/**
 * Asked from the code page by somebody who has just opened an emailed link and
 * has neither a code nor a passkey: two-step login turns off RESET_DAYS from
 * now, unless the owner calls it off. Asking again does not move the day.
 */
export async function askReset(token: string, now = Date.now()): Promise<{ until: number } | null> {
  const email = await heldFor(token);
  const record = email ? await read(email) : null;
  if (!email || !record) return null;
  if (record.reset > 0) return { until: record.reset };
  const until = now + RESET_DAYS * 86_400_000;
  await write(email, { ...record, reset: until });
  await tell(
    email,
    "Two-step login will turn off on your Marktmorgen account",
    `Somebody who opened a login link sent to this address said they no longer have your authenticator app, your recovery codes or a passkey, and asked for two-step login to be turned off. It turns off by itself on ${day(until)}, and from then the emailed link alone logs in.

If that was you, there is nothing to do but wait.

If it was not you, somebody can read your email: log in with your app's code or a passkey, or open your studio in a browser that is still logged in, and the request is canceled. Then change your email password.`,
  );
  return { until };
}

/** Calls off a pending request to turn it off: the owner logged in with a code or a passkey, or pressed Cancel. */
export async function cancelReset(email: string, why: "login" | "studio"): Promise<boolean> {
  const record = await read(email);
  if (!record || record.reset === 0) return false;
  await write(email, { ...record, reset: 0 });
  await tell(
    email,
    "Two-step login stays on for your Marktmorgen account",
    why === "login"
      ? "The request to turn off two-step login was canceled, because your account was just logged in with a code or a passkey."
      : "The request to turn off two-step login was canceled from your studio.",
  );
  return true;
}

/**
 * For the emailed link: whether a request to turn it off has waited its days.
 * When it has, two-step login is turned off here, and the link logs in alone.
 */
export async function resetIfDue(email: string, now = Date.now()): Promise<boolean> {
  const record = await read(email);
  if (!record || record.reset === 0 || now < record.reset) return false;
  await redisPipeline([["DEL", recordKey(email)]]);
  await tell(email, "Two-step login is off for your Marktmorgen account", `Two-step login was turned off after waiting ${RESET_DAYS} days, as asked from the login page. You can turn it on again in your studio, with a new app setup and new recovery codes.`);
  return true;
}

export async function twoStepOn(email: string): Promise<boolean> {
  return (await read(email)) !== null;
}

/** A new secret for the app, kept against the session setting it up. */
export async function startSetup(email: string, session: string): Promise<{ secret: string; uri: string } | "already"> {
  if (await twoStepOn(email)) return "already";
  const secret = newSecret();
  await redisPipeline([["SET", setupKey(session), JSON.stringify({ e: normaliseEmail(email), s: seal(secret, context(email)) }), "EX", SETUP_SECONDS]]);
  return { secret, uri: otpauthUri(secret, normaliseEmail(email), ISSUER) };
}

/** Turns it on once the app shows a right code; returns the recovery codes, shown this once. */
export async function finishSetup(email: string, session: string, typed: string, now = Date.now()): Promise<{ codes: string[] } | "expired" | "wrong" | "already"> {
  if (await twoStepOn(email)) return "already";
  const [raw] = await redisPipeline([["GET", setupKey(session)]]);
  let pending: { e?: unknown; s?: unknown } = {};
  try {
    pending = typeof raw === "string" ? (JSON.parse(raw) as typeof pending) : {};
  } catch {
    pending = {};
  }
  if (pending.e !== normaliseEmail(email) || typeof pending.s !== "string") return "expired";
  const opened = unseal(pending.s, context(email));
  if (!opened.ok) return "expired";
  const step = stepOf(opened.value, typed, now);
  if (step === null) return "wrong";
  const codes = newCodes();
  await write(email, { s: pending.s, since: now, codes: codes.map((c) => codeHash(c)), last: step, reset: 0 });
  await redisPipeline([["DEL", setupKey(session)]]);
  await tell(email, "Two-step login is on for your Marktmorgen account", "Two-step login was turned on for your Marktmorgen account. From now on, logging in with the emailed link also asks for the code in your authenticator app.");
  return { codes };
}

export type CodeCheck = "app" | "recovery" | "wrong" | "unreadable" | "limited";

/**
 * Checks a code for an account that has it on: the app's code for now, used
 * once, or a recovery code, spent. Ten tries an hour per account.
 */
export async function checkCode(email: string, typed: string, now = Date.now()): Promise<CodeCheck> {
  const record = await read(email);
  if (!record) return "wrong";
  if (!(await withinLimit("two-step", normaliseEmail(email), CODES_PER_HOUR, 60 * 60))) return "limited";
  const cleaned = typed.trim();
  if (/^\d[\d\s]{4,8}$/.test(cleaned)) {
    const opened = unseal(record.s, context(email));
    if (!opened.ok) return "unreadable";
    const step = stepOf(opened.value, cleaned, now, record.last);
    if (step === null) return "wrong";
    await write(email, { ...record, last: step });
    return "app";
  }
  const hash = codeHash(cleaned);
  if (!record.codes.includes(hash)) return "wrong";
  const left = record.codes.filter((c) => c !== hash);
  await write(email, { ...record, codes: left });
  await tell(email, "A recovery code was used on your Marktmorgen account", `One of your recovery codes was used to log in to your Marktmorgen account. ${left.length} ${left.length === 1 ? "is" : "are"} left; you can make new ones under Two-step login in your studio.`);
  return "recovery";
}

/** Turns it off, with a right code. */
export async function turnOff(email: string, typed: string): Promise<CodeCheck> {
  const checked = await checkCode(email, typed);
  if (checked !== "app" && checked !== "recovery") return checked;
  await redisPipeline([["DEL", recordKey(email)]]);
  await tell(email, "Two-step login is off for your Marktmorgen account", "Two-step login was turned off for your Marktmorgen account. Logging in now needs only the emailed link or a passkey.");
  return checked;
}

/** Ten new recovery codes in place of the old ones, with a right code. */
export async function replaceCodes(email: string, typed: string): Promise<{ codes: string[] } | CodeCheck> {
  const checked = await checkCode(email, typed);
  if (checked !== "app" && checked !== "recovery") return checked;
  const record = await read(email);
  if (!record) return "wrong";
  const codes = newCodes();
  await write(email, { ...record, codes: codes.map((c) => codeHash(c)) });
  await tell(email, "New recovery codes for your Marktmorgen account", "New recovery codes were made for your Marktmorgen account. The old ones no longer work.");
  return { codes };
}

/** A login that has passed the emailed link and now waits for its code: the token for the browser's cookie. */
export async function holdSignIn(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await redisPipeline([["SET", holdKey(token), JSON.stringify({ e: normaliseEmail(email), n: 0 }), "EX", HOLD_SECONDS]]);
  return token;
}

export type HoldAnswer = { ok: true; email: string; how: "app" | "recovery" } | { ok: false; reason: "expired" | "wrong" | "unreadable" | "limited" };

/** Finishes a waiting login with its code. Five wrong codes end it. */
export async function finishSignIn(token: string, typed: string, now = Date.now()): Promise<HoldAnswer> {
  if (!/^[0-9a-f]{64}$/.test(token) || !isRedisConfigured()) return { ok: false, reason: "expired" };
  const key = holdKey(token);
  const [raw] = await redisPipeline([["GET", key]]);
  let hold: { e?: unknown; n?: unknown } = {};
  try {
    hold = typeof raw === "string" ? (JSON.parse(raw) as typeof hold) : {};
  } catch {
    hold = {};
  }
  if (typeof hold.e !== "string") return { ok: false, reason: "expired" };
  const tries = Number(hold.n) || 0;
  if (tries >= TRIES) {
    await redisPipeline([["DEL", key]]);
    return { ok: false, reason: "expired" };
  }
  const checked = await checkCode(hold.e, typed, now);
  if (checked === "app" || checked === "recovery") {
    // Spent: only the caller whose delete removed it opens the session.
    const [removed] = await redisPipeline([["DEL", key]]);
    if (Number(removed) !== 1) return { ok: false, reason: "expired" };
    // The owner has the second step after all: a pending request to turn it off is called off.
    await cancelReset(hold.e, "login");
    return { ok: true, email: hold.e, how: checked };
  }
  if (checked === "wrong") await redisPipeline([["SET", key, JSON.stringify({ e: hold.e, n: tries + 1 }), "EX", HOLD_SECONDS]]);
  return { ok: false, reason: checked };
}

/** Whose login is waiting behind a token, for the page that asks for the code. */
export async function heldFor(token: string): Promise<string | null> {
  if (!/^[0-9a-f]{64}$/.test(token) || !isRedisConfigured()) return null;
  const [raw] = await redisPipeline([["GET", holdKey(token)]]);
  try {
    const hold = typeof raw === "string" ? (JSON.parse(raw) as { e?: unknown }) : {};
    return typeof hold.e === "string" ? hold.e : null;
  } catch {
    return null;
  }
}

/** Carries the second step to a new sign-in address (app/api/auth/move), sealed again for it. */
export async function moveTwoStep(from: string, to: string): Promise<void> {
  const record = await read(from);
  if (!record) return;
  const opened = unseal(record.s, context(from));
  // The app's secret is sealed again for the new address. One that no longer
  // opens (the root secret was rolled) still moves, so its recovery codes go
  // on letting the person in rather than the second step quietly ending.
  await write(to, opened.ok ? { ...record, s: seal(opened.value, context(to)) } : record);
  await redisPipeline([["DEL", recordKey(from)]]);
}
