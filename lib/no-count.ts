/**
 * "Don't count this device" (added 11 October 2026): a creator who opens
 * their store on a phone or a second browser, not signed in, to see what
 * buyers see, was counted as a visitor every time. Fathom and Plausible let
 * an owner exclude their own browser for the same reason.
 *
 * A cookie on this browser naming the stores it should not be counted on:
 * for each, the first 12 characters of a hash of the store's id, so the
 * cookie says nothing anybody could use. At most MAX_MARKED stores, kept 400
 * days, set and taken away from the studio (app/api/store/no-count). It
 * works on the store's address on marktmorgen.com; a store's own domain is a
 * different site, whose cookies this one cannot set.
 */
import { createHash } from "node:crypto";

export const NO_COUNT_COOKIE = "nl_nc";
export const MAX_MARKED = 20;
export const NO_COUNT_SECONDS = 400 * 86_400;
const MARK = /^[0-9a-f]{12}$/;

/** A store's mark in the cookie. */
export function storeMark(sid: string): string {
  return createHash("sha256").update(`no-count|${sid}`).digest("hex").slice(0, 12);
}

/** The marks a cookie holds, cleaned. */
export function marksOf(value: string | undefined): string[] {
  return [...new Set((value ?? "").split(".").filter((m) => MARK.test(m)))].slice(0, MAX_MARKED);
}

export function isMarkedDevice(value: string | undefined, sid: string | undefined): boolean {
  return Boolean(sid) && marksOf(value).includes(storeMark(sid as string));
}

/** The cookie's value with this store marked (on) or not (off); the newest mark kept when there are too many. */
export function withMark(value: string | undefined, sid: string, on: boolean): string {
  const mark = storeMark(sid);
  const others = marksOf(value).filter((m) => m !== mark);
  return (on ? [mark, ...others] : others).slice(0, MAX_MARKED).join(".");
}
