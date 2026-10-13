/**
 * Two-step login (lib/totp.ts, lib/two-step.ts; added 13 October 2026).
 * Checked:
 *
 *   - the codes are RFC 6238's own, for its own test secret;
 *   - a code is taken a step either side of now, and never twice;
 *   - turning it on needs a right code from the app, and answers ten recovery
 *     codes once;
 *   - with it on, the emailed link opens no session: it leads to the code
 *     page, behind a cookie, and a right code opens the session;
 *   - five wrong codes end the waiting login;
 *   - a recovery code works once;
 *   - turning it off needs a right code; without it, the link opens the
 *     session as it always did;
 *   - moving the sign-in address carries it;
 *   - nobody is locked out: with nothing left, it turns off a week after it is
 *     asked for, and a login with a code, or Cancel, calls that off.
 */
import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { base32Decode, base32Encode, codeAt, stepOf, STEP_SECONDS } from "@/lib/totp";
import { RESET_DAYS, cancelReset, finishSetup, moveTwoStep, resetIfDue, startSetup, turnOff, twoStepOn, twoStepStatus } from "@/lib/two-step";
import { POST as callback } from "@/app/api/auth/callback/route";
import { POST as codeRoute } from "@/app/api/auth/code/route";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

process.env.NIMBUS_DATA_KEY ??= "tests-only-not-a-real-deployment-secret";

const EMAIL = "maker@example.com";
const SESSION = "a".repeat(64);
const nowCode = (secret: string, at = Date.now()) => codeAt(base32Decode(secret)!, Math.floor(at / 1000 / STEP_SECONDS));

async function linkFor(email: string): Promise<string> {
  const token = createHash("sha256").update(String(Math.random())).digest("hex");
  const key = `nl:auth:link:${createHash("sha256").update(`nimbus-auth-link:${token}`).digest("hex").slice(0, 40)}`;
  await redis.pipeline([["SET", key, email, "EX", 900]]);
  return token;
}

const post = (url: string, fields: Record<string, string>, cookie = "") =>
  new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", ...(cookie ? { cookie } : {}) },
    body: new URLSearchParams(fields),
  });
const cookieOf = (response: Response, name: string) => (response.headers.get("set-cookie") ?? "").match(new RegExp(`${name}=([^;]*)`))?.[1] ?? "";

async function main(): Promise<void> {
  redis.clear();

  part("The codes");
  const rfc = Buffer.from("12345678901234567890");
  is("RFC 6238's own values, for its own secret", [codeAt(rfc, Math.floor(59 / 30), 8), codeAt(rfc, Math.floor(1111111109 / 30), 8), codeAt(rfc, Math.floor(2000000000 / 30), 8)], ["94287082", "07081804", "69279037"]);
  is("base32 there and back", base32Decode(base32Encode(rfc))?.toString(), "12345678901234567890");
  const secret = base32Encode(rfc);
  const at = 1_760_000_000_000;
  const step = Math.floor(at / 1000 / 30);
  is("now, and a step either side", [stepOf(secret, codeAt(rfc, step), at), stepOf(secret, codeAt(rfc, step - 1), at), stepOf(secret, codeAt(rfc, step + 1), at)], [step, step - 1, step + 1]);
  is("not two steps away", stepOf(secret, codeAt(rfc, step - 2), at), null);
  is("never a step already used", stepOf(secret, codeAt(rfc, step), at, step), null);

  part("Turning it on");
  const started = await startSetup(EMAIL, SESSION);
  if (started === "already") throw new Error("already on");
  is("the app reads a secret and an address", [started.uri.startsWith("otpauth://totp/Marktmorgen%3Amaker%40example.com?secret="), started.secret.length], [true, 32]);
  is("a wrong code does not turn it on", [await finishSetup(EMAIL, SESSION, "000000" === nowCode(started.secret) ? "111111" : "000000"), await twoStepOn(EMAIL)], ["wrong", false]);
  is("another session cannot finish it", await finishSetup(EMAIL, "b".repeat(64), nowCode(started.secret)), "expired");
  const finished = await finishSetup(EMAIL, SESSION, nowCode(started.secret));
  if (typeof finished === "string") throw new Error(finished);
  is("on, with ten recovery codes shown once", [await twoStepOn(EMAIL), finished.codes.length, new Set(finished.codes).size], [true, 10, 10]);

  part("Logging in");
  const held = await callback(post("https://marktmorgen.com/api/auth/callback", { token: await linkFor(EMAIL) }));
  const waiting = cookieOf(held, "nl_2fa");
  is("the link opens no session: it leads to the code page", [held.headers.get("location"), cookieOf(held, "nl_session"), waiting.length], ["https://marktmorgen.com/signin/code", "", 64]);
  const wrong = await codeRoute(post("https://marktmorgen.com/api/auth/code", { code: "12345" }, `nl_2fa=${waiting}`));
  is("a wrong code: back to the page, saying so", wrong.headers.get("location"), "https://marktmorgen.com/signin/code?status=wrong");
  // The code just used to turn it on cannot be used again; the next step's can.
  const next = codeAt(base32Decode(started.secret)!, Math.floor(Date.now() / 1000 / 30) + 1);
  const right = await codeRoute(post("https://marktmorgen.com/api/auth/code", { code: next }, `nl_2fa=${waiting}`));
  is("a right code opens the session", [right.headers.get("location"), cookieOf(right, "nl_session").length], ["https://marktmorgen.com/studio", 64]);
  const again = await codeRoute(post("https://marktmorgen.com/api/auth/code", { code: next }, `nl_2fa=${waiting}`));
  is("and the waiting login is spent", again.headers.get("location"), "https://marktmorgen.com/signin?status=expired");

  const second = cookieOf(await callback(post("https://marktmorgen.com/api/auth/callback", { token: await linkFor(EMAIL) })), "nl_2fa");
  for (let i = 0; i < 5; i += 1) await codeRoute(post("https://marktmorgen.com/api/auth/code", { code: "99999x" }, `nl_2fa=${second}`));
  const sixth = await codeRoute(post("https://marktmorgen.com/api/auth/code", { code: finished.codes[0] }, `nl_2fa=${second}`));
  is("after five wrong codes, the waiting login is over, even for a right one", sixth.headers.get("location"), "https://marktmorgen.com/signin?status=expired");

  redis.clear();
  // A fresh hour of tries, and the account set up again for the rest.
  const again2 = await startSetup(EMAIL, SESSION);
  if (again2 === "already") throw new Error("already on");
  const set2 = await finishSetup(EMAIL, SESSION, nowCode(again2.secret));
  if (typeof set2 === "string") throw new Error(set2);
  const third = cookieOf(await callback(post("https://marktmorgen.com/api/auth/callback", { token: await linkFor(EMAIL) })), "nl_2fa");
  const byRecovery = await codeRoute(post("https://marktmorgen.com/api/auth/code", { code: set2.codes[3].toUpperCase() }, `nl_2fa=${third}`));
  is("a recovery code logs in, written in capitals or not", byRecovery.headers.get("location"), "https://marktmorgen.com/studio");
  is("and is spent", (await twoStepStatus(EMAIL)).codesLeft, 9);
  const fourth = cookieOf(await callback(post("https://marktmorgen.com/api/auth/callback", { token: await linkFor(EMAIL) })), "nl_2fa");
  const reused = await codeRoute(post("https://marktmorgen.com/api/auth/code", { code: set2.codes[3] }, `nl_2fa=${fourth}`));
  is("the same recovery code does not work twice", reused.headers.get("location"), "https://marktmorgen.com/signin/code?status=wrong");

  part("Moving the address, and turning it off");
  await moveTwoStep(EMAIL, "new@example.com");
  is("it goes with the address", [await twoStepOn(EMAIL), await twoStepOn("new@example.com"), (await twoStepStatus("new@example.com")).codesLeft], [false, true, 9]);
  is("a wrong code does not turn it off", await turnOff("new@example.com", "nope-nope"), "wrong");
  is("a recovery code does", [await turnOff("new@example.com", set2.codes[5]), await twoStepOn("new@example.com")], ["recovery", false]);
  const plain = await callback(post("https://marktmorgen.com/api/auth/callback", { token: await linkFor("new@example.com") }));
  is("without it, the link opens the session as it always did", [plain.headers.get("location"), cookieOf(plain, "nl_session").length], ["https://marktmorgen.com/studio", 64]);

  part("Lost everything: nobody is locked out");
  const LOST = "lost@example.com";
  const set3Start = await startSetup(LOST, SESSION);
  if (set3Start === "already") throw new Error("already on");
  const set3 = await finishSetup(LOST, SESSION, nowCode(set3Start.secret));
  if (typeof set3 === "string") throw new Error(set3);
  const lostHold = cookieOf(await callback(post("https://marktmorgen.com/api/auth/callback", { token: await linkFor(LOST) })), "nl_2fa");
  const asked = await codeRoute(post("https://marktmorgen.com/api/auth/code", { action: "reset" }, `nl_2fa=${lostHold}`));
  const until = (await twoStepStatus(LOST)).reset;
  is("asked from the code page, it is set to turn off in a week", [asked.headers.get("location"), Math.round((until - Date.now()) / 86_400_000)], ["https://marktmorgen.com/signin/code?status=reset", RESET_DAYS]);
  await codeRoute(post("https://marktmorgen.com/api/auth/code", { action: "reset" }, `nl_2fa=${lostHold}`));
  is("asking again does not move the day", (await twoStepStatus(LOST)).reset, until);
  const early = await callback(post("https://marktmorgen.com/api/auth/callback", { token: await linkFor(LOST) }));
  is("before the week is out, the link still asks for the code", early.headers.get("location"), "https://marktmorgen.com/signin/code");
  is("a login with a recovery code calls it off", [(await codeRoute(post("https://marktmorgen.com/api/auth/code", { code: set3.codes[0] }, `nl_2fa=${cookieOf(early, "nl_2fa")}`))).headers.get("location"), (await twoStepStatus(LOST)).reset], ["https://marktmorgen.com/studio", 0]);
  const again3 = cookieOf(await callback(post("https://marktmorgen.com/api/auth/callback", { token: await linkFor(LOST) })), "nl_2fa");
  await codeRoute(post("https://marktmorgen.com/api/auth/code", { action: "reset" }, `nl_2fa=${again3}`));
  is("and Cancel in the studio does too", [await cancelReset(LOST, "studio"), (await twoStepStatus(LOST)).reset], [true, 0]);
  const again4 = cookieOf(await callback(post("https://marktmorgen.com/api/auth/callback", { token: await linkFor(LOST) })), "nl_2fa");
  await codeRoute(post("https://marktmorgen.com/api/auth/code", { action: "reset" }, `nl_2fa=${again4}`));
  is("not a day early", await resetIfDue(LOST, Date.now() + (RESET_DAYS - 1) * 86_400_000), false);
  is("after the week, it turns off", [await resetIfDue(LOST, Date.now() + (RESET_DAYS + 1) * 86_400_000), await twoStepOn(LOST)], [true, false]);
  const back = await callback(post("https://marktmorgen.com/api/auth/callback", { token: await linkFor(LOST) }));
  is("and the emailed link logs in on its own", [back.headers.get("location"), cookieOf(back, "nl_session").length], ["https://marktmorgen.com/studio", 64]);

  done();
}

void main();
