/**
 * Time-based one-time codes (RFC 6238 over RFC 4226): the six digits an
 * authenticator app shows, changing every 30 seconds. HMAC-SHA1, as every
 * authenticator app expects by default; the secret is 20 random bytes, written
 * in base32 for the app to read.
 *
 * Pure apart from the hash, so it is checked against the RFC's own test values
 * (tests/two-step.test.ts).
 */
import { createHmac, randomBytes } from "node:crypto";

export const STEP_SECONDS = 30;
export const DIGITS = 6;
/** Codes one step either side of now are taken, for a phone clock a little off. */
const WINDOW = 1;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text: string): Buffer | null {
  const clean = text.toUpperCase().replace(/[\s=-]/g, "");
  if (!clean || /[^A-Z2-7]/.test(clean)) return null;
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    value = (value << 5) | ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** A new secret, in base32. */
export function newSecret(): string {
  return base32Encode(randomBytes(20));
}

/** The code for one 30-second step. */
export function codeAt(secret: Buffer, step: number, digits = DIGITS): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const mac = createHmac("sha1", secret).update(counter).digest();
  const offset = mac[mac.length - 1] & 15;
  const number = ((mac[offset] & 127) << 24) | (mac[offset + 1] << 16) | (mac[offset + 2] << 8) | mac[offset + 3];
  return String(number % 10 ** digits).padStart(digits, "0");
}

/**
 * The step a typed code belongs to, when it is right for now or a step either
 * side, and later than `after` — so a code seen over a shoulder, or used
 * once, does not open anything a second time. Null otherwise.
 */
export function stepOf(secretBase32: string, typed: string, nowMs: number, after = -1): number | null {
  const code = typed.replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return null;
  const secret = base32Decode(secretBase32);
  if (!secret || secret.length < 10) return null;
  const now = Math.floor(nowMs / 1000 / STEP_SECONDS);
  for (let step = now - WINDOW; step <= now + WINDOW; step += 1) {
    if (step > after && codeAt(secret, step) === code) return step;
  }
  return null;
}

/** What an authenticator app reads from the QR code. */
export function otpauthUri(secret: string, account: string, issuer: string): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}
